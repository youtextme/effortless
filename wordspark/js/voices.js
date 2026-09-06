/**
 * Parent reader voices — Chrome-optimized Google voices, 6 rotating personas.
 */

const PERSONA_COUNT = 6;

/** Adult reading to a child — calm, unhurried pace (slower than normal speech). */
export const PARENT_RATES = {
  passage: 0.80,
  word: 0.77,
  example: 0.81,
  default: 0.79,
};

/** Chrome's best-quality English voices (network Google TTS). */
const CHROME_GOOGLE_VOICES = [
  'Google UK English Female',
  'Google US English',
  'Google UK English Male',
];

const PERSONAS = [
  { id: 'mom-warm', label: 'Mom', pitch: 1.03, prefer: ['google uk english female', 'google us english', 'samantha', 'jenny', 'karen'] },
  { id: 'dad-calm', label: 'Dad', pitch: 0.97, prefer: ['google uk english male', 'google us english', 'daniel', 'guy', 'david'] },
  { id: 'mom-bright', label: 'Mom', pitch: 1.05, prefer: ['google uk english female', 'google us english', 'kate', 'serena'] },
  { id: 'dad-deep', label: 'Dad', pitch: 0.95, prefer: ['google uk english male', 'google us english', 'daniel', 'james'] },
  { id: 'mom-gentle', label: 'Mom', pitch: 1.02, prefer: ['google uk english female', 'samantha', 'fiona', 'karen'] },
  { id: 'dad-steady', label: 'Dad', pitch: 0.98, prefer: ['google uk english male', 'google us english', 'daniel', 'alex'] },
];

const BLOCKLIST = ['espeak', 'compact', 'pico', 'flite', 'android speech'];

let voicePool = [];
let voicesReady = false;
let voicesPromise = null;

export function isChrome() {
  if (typeof navigator === 'undefined') return false;
  return /Chrome|Chromium|CriOS/i.test(navigator.userAgent)
    && !/Edg|OPR|Brave/i.test(navigator.userAgent);
}

function allVoices() {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices();
}

function scoreVoice(voice) {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (!voice.lang.startsWith('en')) return -100;
  if (BLOCKLIST.some((b) => name.includes(b))) return -100;

  // Chrome: cloud Google voices sound most natural
  if (name.includes('google')) {
    score += 30;
    if (!voice.localService) score += 25;
    if (CHROME_GOOGLE_VOICES.some((g) => voice.name === g)) score += 20;
  }

  if (name.includes('natural') || name.includes('neural') || name.includes('premium')) score += 22;
  if (name.includes('microsoft')) score += 10;
  if (name.includes('samantha') || name.includes('karen')) score += 12;
  if (name.includes('daniel') || name.includes('guy')) score += 10;
  if (voice.localService && !name.includes('google')) score += 3;

  return score;
}

function findVoiceByName(voices, name) {
  return voices.find((v) => v.name === name)
    || voices.find((v) => v.name.toLowerCase() === name.toLowerCase());
}

function buildChromeGooglePool(voices) {
  const pool = [];
  const en = voices.filter((v) => v.lang.startsWith('en'));

  for (let i = 0; i < PERSONA_COUNT; i++) {
    const googleName = CHROME_GOOGLE_VOICES[i % CHROME_GOOGLE_VOICES.length];
    let voice = findVoiceByName(en, googleName);

    if (!voice) {
      const googleVoices = en
        .filter((v) => v.name.toLowerCase().includes('google'))
        .sort((a, b) => scoreVoice(b) - scoreVoice(a));
      voice = googleVoices[i % Math.max(googleVoices.length, 1)];
    }

    if (!voice) break;
    pool.push({ ...PERSONAS[i], voice });
  }

  return pool;
}

function matchPersona(persona, voices, usedNames) {
  for (const key of persona.prefer) {
    const hit = voices.find((v) => {
      if (usedNames.has(v.name)) return false;
      const n = v.name.toLowerCase();
      return n.includes(key) || v.voiceURI.toLowerCase().includes(key);
    });
    if (hit) return hit;
  }
  return null;
}

export function refreshVoicePool() {
  const voices = allVoices().filter((v) => v.lang.startsWith('en'));

  if (isChrome()) {
    const chromePool = buildChromeGooglePool(voices);
    if (chromePool.length) {
      voicePool = chromePool;
      voicesReady = true;
      return voicePool;
    }
  }

  const sorted = [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
  const pool = [];
  const usedNames = new Set();

  for (const persona of PERSONAS) {
    const voice = matchPersona(persona, sorted, usedNames);
    if (voice) {
      pool.push({ ...persona, voice });
      usedNames.add(voice.name);
    }
  }

  for (const voice of sorted) {
    if (pool.length >= PERSONA_COUNT) break;
    if (usedNames.has(voice.name)) continue;
    pool.push({ ...PERSONAS[pool.length % PERSONAS.length], voice });
    usedNames.add(voice.name);
  }

  if (!pool.length && sorted.length) {
    pool.push({ ...PERSONAS[0], voice: sorted[0] });
  }

  voicePool = pool;
  voicesReady = true;
  return voicePool;
}

/** Chrome loads voices async — must await before first speak. */
export function ensureVoicesReady() {
  if (voicesReady && voicePool.length && allVoices().length) {
    return Promise.resolve(voicePool);
  }

  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const finish = () => {
        refreshVoicePool();
        resolve(voicePool);
      };

      if (allVoices().length) {
        finish();
        return;
      }

      const onVoices = () => {
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        finish();
      };

      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      window.speechSynthesis.getVoices();

      const deadline = Date.now() + (isChrome() ? 3200 : 900);
      const poll = () => {
        if (allVoices().length) {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
          finish();
          return;
        }
        if (Date.now() < deadline) {
          window.speechSynthesis.getVoices();
          setTimeout(poll, 120);
          return;
        }
        window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        finish();
      };
      setTimeout(poll, 120);
    });
  }

  return voicesPromise;
}

export function getParentReader(passageNum = 1) {
  if (!voicesReady || !voicePool.length) refreshVoicePool();
  const idx = Math.max(0, (passageNum - 1) % Math.max(voicePool.length, 1));
  return voicePool[idx] || voicePool[0];
}

export function applyParentVoice(utterance, reader, rate = PARENT_RATES.default) {
  if (!utterance || !reader) return;
  const voice = reader.voice;
  utterance.lang = voice?.lang || 'en-US';
  utterance.rate = rate;
  // Slightly lower pitch reads warmer and less synthetic on Chrome.
  utterance.pitch = Math.min(reader.pitch ?? 1, 1.01);
  utterance.volume = 1;
  if (voice) {
    utterance.voice = voice;
  }
}

export function initVoices() {
  if (!('speechSynthesis' in window)) return;
  ensureVoicesReady();
  window.addEventListener('voiceschanged', () => {
    voicesPromise = null;
    refreshVoicePool();
  });
}

export function getVoicePoolSize() {
  return voicePool.length;
}

export function getActiveVoiceName(passageNum = 1) {
  return getParentReader(passageNum)?.voice?.name || 'default';
}
