import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { loadConfig, loadState } from './config.js';
import { probeOllama } from './ollama.js';
import { AUTH_DIR } from './paths.js';
import { EXIT } from './exit-codes.js';

/**
 * Run health checks and return structured report.
 */
export async function runDoctor() {
  const checks = [];
  let worst = EXIT.OK;

  function add(name, ok, detail, codeOnFail = EXIT.INTERNAL) {
    checks.push({ name, ok, detail });
    if (!ok && worst === EXIT.OK) worst = codeOnFail;
  }

  // Config
  try {
    const config = await loadConfig();
    add('config', true, `to="${config.to}", schedule=${config.schedule}, model=${config.model}`);
  } catch (err) {
    add('config', false, err.message, EXIT.CONFIG);
  }

  // Ollama
  let config;
  try {
    config = await loadConfig();
  } catch {
    config = { ollamaUrls: ['http://127.0.0.1:11434'] };
  }

  const ollama = await probeOllama(config.ollamaUrls);
  add(
    'ollama',
    ollama.up,
    ollama.up ? `reachable at ${ollama.url}` : 'not reachable on 11434 or 8817',
    EXIT.OLLAMA_DOWN
  );

  // WhatsApp session files
  let sessionExists = false;
  try {
    await access(AUTH_DIR, constants.R_OK);
    sessionExists = true;
    add('whatsapp-session', true, `auth dir exists: ${AUTH_DIR}`);
  } catch {
    add(
      'whatsapp-session',
      false,
      'no session — run: node cli.js link-whatsapp',
      EXIT.WHATSAPP_NOT_LINKED
    );
  }

  // Recipient JID
  const state = await loadState();
  if (state.recipientJid) {
    add(
      'recipient',
      true,
      `${state.recipientName ?? config?.to} → ${state.recipientJid}`
    );
  } else if (sessionExists) {
    add(
      'recipient',
      false,
      `no saved JID for "${config?.to}" — run link-whatsapp or run-now`,
      EXIT.CHAT_NOT_FOUND
    );
  }

  // Platform
  const win = process.platform === 'win32';
  add(
    'platform',
    win,
    win ? 'Windows (Task Scheduler supported)' : 'not Windows — install-schedule unavailable',
    EXIT.OK // informational only
  );

  const allOk = checks.every((c) => c.ok || c.name === 'platform');
  return { ok: allOk, code: allOk ? EXIT.OK : worst, checks };
}
