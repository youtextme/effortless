import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeInMemoryStore,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import pino from 'pino';
import { mkdir } from 'node:fs/promises';
import { AUTH_DIR } from '../lib/paths.js';
import { fail, EXIT } from '../lib/exit-codes.js';

const logger = pino({ level: 'silent' });

export async function createSocket({ authDir = AUTH_DIR, onQr, waitForOpen = false } = {}) {
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
    browser: ['effortless', 'whatsapp-connector', '1.0'],
  });

  store.bind(sock.ev);
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      if (onQr) onQr(qr);
      else {
        console.log('\nScan QR with WhatsApp → Linked Devices:\n');
        qrcode.generate(qr, { small: true });
      }
    }
    if (connection === 'open' && resolveOpen) resolveOpen(sock);
    if (connection === 'close') {
      const code = lastDisconnect?.error?.output?.statusCode;
      if (code === DisconnectReason.loggedOut && rejectOpen) {
        rejectOpen(fail(EXIT.WHATSAPP_NOT_LINKED, 'Session logged out. Run link-whatsapp again.'));
      }
    }
  });

  if (waitForOpen) {
    const sockWithStore = Object.assign(sock, { store });
    await Promise.race([
      openPromise,
      new Promise((_, rej) =>
        setTimeout(() => rej(fail(EXIT.WHATSAPP_FAIL, 'Timed out waiting for WhatsApp.')), 120_000)
      ),
    ]);
    return sockWithStore;
  }

  return Object.assign(sock, { store });
}

async function waitForChats(sock, timeoutMs = 30_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const chats = sock.store?.chats?.all?.() ?? [];
    if (chats.length > 0) return chats;
    await sleep(500);
  }
  return sock.store?.chats?.all?.() ?? [];
}

export async function findChatByName(sock, name) {
  const chats = await waitForChats(sock);
  const target = name.trim().toLowerCase();

  for (const chat of chats) {
    const display = chat.name || chat.subject || chat.verifiedName || '';
    if (display.trim().toLowerCase() === target) {
      return { jid: chat.id, name: display };
    }
  }
  for (const chat of chats) {
    const display = chat.name || chat.subject || chat.verifiedName || '';
    if (display.trim().toLowerCase().includes(target)) {
      return { jid: chat.id, name: display };
    }
  }
  return null;
}

export function phoneToJid(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return `${digits}@s.whatsapp.net`;
}

/** Link WhatsApp session (QR once per machine). */
export async function linkWhatsApp() {
  console.log('Linking WhatsApp (scan QR with your phone)...\n');
  const sock = await createSocket({
    waitForOpen: true,
    onQr(qr) {
      console.log('\nScan QR: WhatsApp → Linked Devices → Link a Device\n');
      qrcode.generate(qr, { small: true });
    },
  });
  console.log('Connected. Session saved in data/whatsapp-auth/\n');
  sock.end(undefined);
  return { linked: true };
}

/**
 * Send text to chat name, phone, or known JID.
 * @param {{ text: string, to?: string, phone?: string, jid?: string }} opts
 */
export async function sendMessage({ text, to, phone, jid }) {
  const sock = await createSocket({ waitForOpen: true });
  await sleep(1500);

  let targetJid = jid;
  let targetName = to ?? phone;

  if (!targetJid && phone) {
    targetJid = phoneToJid(phone);
  }

  if (!targetJid && to) {
    const found = await findChatByName(sock, to);
    if (!found) {
      sock.end(undefined);
      throw fail(EXIT.CHAT_NOT_FOUND, `Chat "${to}" not found.`);
    }
    targetJid = found.jid;
    targetName = found.name;
  }

  if (!targetJid) {
    sock.end(undefined);
    throw fail(EXIT.WHATSAPP_FAIL, 'No destination (to, phone, or jid).');
  }

  const result = await sock.sendMessage(targetJid, { text });
  sock.end(undefined);

  return { jid: targetJid, name: targetName, messageId: result?.key?.id };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
