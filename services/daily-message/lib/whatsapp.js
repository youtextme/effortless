import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { mkdir } from 'node:fs/promises';
import { AUTH_DIR } from './paths.js';
import { saveRecipientJid } from './config.js';

const logger = pino({ level: 'silent' });

/**
 * Create a Baileys socket with persisted auth.
 * @param {{ authDir?: string, onQr?: (qr: string) => void, waitForOpen?: boolean }} opts
 */
export async function createSocket({
  authDir = AUTH_DIR,
  onQr,
  waitForOpen = false,
} = {}) {
  await mkdir(authDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(authDir);
  const { version } = await fetchLatestBaileysVersion();

  const store = makeInMemoryStore({ logger });
  let resolveOpen;
  let rejectOpen;
  const openPromise = waitForOpen
    ? new Promise((res, rej) => {
        resolveOpen = res;
        rejectOpen = rej;
      })
    : null;

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['effortless', 'daily-message', '1.0'],
  });

  store.bind(sock.ev);
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      if (onQr) {
        onQr(qr);
      } else {
        console.log('\nScan this QR code with WhatsApp on your phone:\n');
        qrcode.generate(qr, { small: true });
      }
    }

    if (connection === 'open' && resolveOpen) {
      resolveOpen(sock);
    }

    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      const loggedOut = code === DisconnectReason.loggedOut;
      if (loggedOut && rejectOpen) {
        rejectOpen(new Error('WhatsApp session logged out. Run link-whatsapp again.'));
      }
    }
  });

  if (waitForOpen) {
    const sockWithStore = Object.assign(sock, { store });
    await Promise.race([
      openPromise,
      new Promise((_, rej) =>
        setTimeout(() => rej(new Error('Timed out waiting for WhatsApp connection.')), 120_000)
      ),
    ]);
    return sockWithStore;
  }

  return Object.assign(sock, { store });
}

/**
 * Wait for chats to populate in the store.
 * @param {object} sock
 * @param {number} [timeoutMs]
 */
export async function waitForChats(sock, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const chats = sock.store?.chats?.all?.() ?? [];
    if (chats.length > 0) return chats;
    await sleep(500);
  }
  return sock.store?.chats?.all?.() ?? [];
}

/**
 * Find a chat JID by display name (case-insensitive).
 * @param {object} sock
 * @param {string} name
 */
export async function findChatByName(sock, name) {
  const chats = await waitForChats(sock);
  const target = name.trim().toLowerCase();

  for (const chat of chats) {
    const display =
      chat.name || chat.subject || chat.verifiedName || '';
    if (display.trim().toLowerCase() === target) {
      return { jid: chat.id, name: display };
    }
  }

  // Partial match fallback
  for (const chat of chats) {
    const display =
      chat.name || chat.subject || chat.verifiedName || '';
    if (display.trim().toLowerCase().includes(target)) {
      return { jid: chat.id, name: display };
    }
  }

  return null;
}

/**
 * Link WhatsApp: show QR, wait for connection, resolve recipient JID.
 * @param {string} recipientName
 */
export async function linkWhatsApp(recipientName) {
  console.log('Linking WhatsApp session (scan QR with your phone)...\n');

  const sock = await createSocket({
    waitForOpen: true,
    onQr(qr) {
      console.log('\nScan this QR code with WhatsApp → Linked Devices:\n');
      qrcode.generate(qr, { small: true });
    },
  });

  console.log('Connected to WhatsApp.\n');
  console.log(`Looking for chat "${recipientName}"...`);

  const found = await findChatByName(sock, recipientName);
  if (!found) {
    const chats = await waitForChats(sock);
    const names = chats
      .map((c) => c.name || c.subject)
      .filter(Boolean)
      .slice(0, 20);
    sock.end(undefined);
    throw new Error(
      `Chat "${recipientName}" not found. Recent chats: ${names.join(', ') || '(none loaded)'}`
    );
  }

  await saveRecipientJid(found.jid, found.name);
  console.log(`Saved recipient: ${found.name} (${found.jid})`);
  console.log('Session saved. You can close this — run-now will reuse it.\n');

  sock.end(undefined);
  return found;
}

/**
 * Send a text message to a recipient by JID or name.
 * @param {{ text: string, jid?: string, name?: string }} opts
 */
export async function sendWhatsAppMessage({ text, jid, name }) {
  const sock = await createSocket({ waitForOpen: true });
  await sleep(1500);

  let targetJid = jid;
  let targetName = name;

  if (!targetJid && name) {
    const found = await findChatByName(sock, name);
    if (!found) {
      sock.end(undefined);
      throw new Error(`Chat "${name}" not found. Run link-whatsapp first.`);
    }
    targetJid = found.jid;
    targetName = found.name;
    await saveRecipientJid(targetJid, targetName);
  }

  if (!targetJid) {
    sock.end(undefined);
    throw new Error('No recipient JID. Run link-whatsapp first.');
  }

  const result = await sock.sendMessage(targetJid, { text });
  sock.end(undefined);

  return {
    jid: targetJid,
    name: targetName,
    messageId: result?.key?.id,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
