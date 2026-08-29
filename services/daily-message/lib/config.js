import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { CONFIG_PATH, STATE_PATH } from './paths.js';

const DEFAULT_CONFIG = {
  to: 'Sigma Boy',
  schedule: 'daily at 8:00 AM',
  hour: 8,
  minute: 0,
  model: 'qwen3.5:4b',
  modelFallback: 'llama3.2:3b',
  ollamaUrls: ['http://127.0.0.1:11434', 'http://127.0.0.1:8817'],
  prompt:
    'Write a warm, fun, motivating note for a 10-year-old. About 100–400 words. Keep it lovely and readable, not preachy.',
};

/**
 * Validate loaded config. Returns null if valid, or an error string.
 * @param {object} config
 */
export function validateConfig(config) {
  if (!config || typeof config !== 'object') {
    return 'Config must be a JSON object.';
  }
  if (!config.to || typeof config.to !== 'string' || config.to.trim() === '') {
    return 'Config "to" must be a non-empty chat name.';
  }
  if (!config.prompt || typeof config.prompt !== 'string' || config.prompt.trim() === '') {
    return 'Config "prompt" must be a non-empty string.';
  }
  if (!config.model || typeof config.model !== 'string') {
    return 'Config "model" must be a string.';
  }
  if (config.hour !== undefined) {
    const h = Number(config.hour);
    if (!Number.isInteger(h) || h < 0 || h > 23) {
      return 'Config "hour" must be an integer 0–23.';
    }
  }
  if (config.minute !== undefined) {
    const m = Number(config.minute);
    if (!Number.isInteger(m) || m < 0 || m > 59) {
      return 'Config "minute" must be an integer 0–59.';
    }
  }
  if (config.ollamaUrls !== undefined) {
    if (!Array.isArray(config.ollamaUrls) || config.ollamaUrls.length === 0) {
      return 'Config "ollamaUrls" must be a non-empty array.';
    }
    for (const url of config.ollamaUrls) {
      if (typeof url !== 'string' || !url.startsWith('http')) {
        return 'Each ollamaUrl must be an http(s) URL string.';
      }
    }
  }
  return null;
}

/**
 * Load config.json, merging with defaults for missing keys.
 * @param {string} [configPath]
 */
export async function loadConfig(configPath = CONFIG_PATH) {
  let raw;
  try {
    raw = await readFile(configPath, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { ...DEFAULT_CONFIG };
    }
    throw err;
  }
  const parsed = JSON.parse(raw);
  const config = { ...DEFAULT_CONFIG, ...parsed };
  const error = validateConfig(config);
  if (error) throw new Error(error);
  return config;
}

/**
 * Parse schedule string like "daily at 8:00 AM" into hour/minute.
 * Falls back to config.hour/minute when parse fails.
 * @param {object} config
 */
export function resolveSchedule(config) {
  const text = (config.schedule || '').toLowerCase();
  const match = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = match[2] ? parseInt(match[2], 10) : 0;
    const ampm = match[3]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    return { hour, minute };
  }
  return { hour: config.hour ?? 8, minute: config.minute ?? 0 };
}

/**
 * Load persisted runtime state (e.g. resolved WhatsApp JID).
 */
export async function loadState() {
  try {
    const raw = await readFile(STATE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Save runtime state.
 * @param {object} state
 */
export async function saveState(state) {
  await mkdir(dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2));
}

/**
 * Update the resolved recipient JID in state.
 * @param {string} jid
 * @param {string} name
 */
export async function saveRecipientJid(jid, name) {
  const state = await loadState();
  state.recipientJid = jid;
  state.recipientName = name;
  state.linkedAt = new Date().toISOString();
  await saveState(state);
}
