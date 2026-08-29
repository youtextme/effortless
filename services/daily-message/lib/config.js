import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { CONFIG_PATH, STATE_PATH } from './paths.js';

const DEFAULT_CONFIG = {
  to: 'Sigma Boy',
  schedule: '08:00',
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
  if (config.schedule !== undefined) {
    const { hour, minute } = parseScheduleString(config.schedule);
    if (hour === null) {
      return 'Config "schedule" must be like "08:00" (24-hour local time).';
    }
    if (minute < 0 || minute > 59) {
      return 'Config schedule minutes must be 0–59.';
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
 * Parse schedule string "08:00" or "daily at 8:00 AM" into hour/minute.
 * @param {string} text
 * @returns {{ hour: number|null, minute: number }}
 */
export function parseScheduleString(text) {
  const s = String(text || '').trim();

  // 24-hour: 08:00, 8:00, 20:30
  const h24 = s.match(/^(\d{1,2}):(\d{2})$/);
  if (h24) {
    const hour = parseInt(h24[1], 10);
    const minute = parseInt(h24[2], 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
    return { hour: null, minute: 0 };
  }

  // 12-hour: daily at 8:00 AM
  const h12 = s.toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
  if (h12) {
    let hour = parseInt(h12[1], 10);
    const minute = h12[2] ? parseInt(h12[2], 10) : 0;
    const ampm = h12[3].toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    return { hour, minute };
  }

  return { hour: null, minute: 0 };
}

/**
 * Resolve schedule from config.
 * @param {object} config
 */
export function resolveSchedule(config) {
  const { hour, minute } = parseScheduleString(config.schedule);
  if (hour !== null) return { hour, minute };
  return { hour: 8, minute: 0 };
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
