/**
 * Client-side voice library — pick the least robotic English voice
 * the device already has (Web Speech API). No cloud TTS. No UA forks.
 */

export const ROBOT_SIGNALS = Object.freeze([
  'espeak', 'compact', 'pico', 'flite', 'zarvox', 'trinoids', 'boing',
  'whisper', 'bad news', 'good news', 'cellos', 'bells', 'albert',
  'novelty', 'android speech', 'robot',
]);

export const WARM_SIGNALS = Object.freeze([
  'female', 'woman', 'samantha', 'karen', 'jenny', 'aria', 'libby',
  'sonia', 'fiona', 'moira', 'tessa', 'victoria', 'zira', 'susan',
  'neural', 'natural', 'premium', 'enhanced', 'google',
]);

const STICKY_KEY = 'wordspark_best_voice_uri';

export function isRobotVoice(voice) {
  const blob = `${voice?.name || ''} ${voice?.voiceURI || ''}`.toLowerCase();
  return ROBOT_SIGNALS.some((token) => blob.includes(token));
}

export function scoreVoice(voice, locale = 'en') {
  if (!voice) return -Infinity;
  const blob = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
  const lang = String(voice.lang || '').toLowerCase();
  if (isRobotVoice(voice)) return -200;
  let score = 0;
  if (lang.startsWith('en')) score += 20;
  else return -80;
  if (locale && lang.startsWith(String(locale).slice(0, 2).toLowerCase())) score += 8;
  if (voice.localService === false) score += 18;
  for (const token of WARM_SIGNALS) {
    if (blob.includes(token)) score += token === 'google' ? 16 : 12;
  }
  if (/\bmale\b|\bman\b|\bboy\b|david|daniel|guy/.test(blob) && !blob.includes('female')) {
    score -= 14;
  }
  if (voice.default) score += 4;
  return score;
}

export function listEnglishVoices(voices = []) {
  return voices.filter((v) => String(v.lang || '').toLowerCase().startsWith('en'));
}

export function readStickyUri(storage = globalThis.localStorage) {
  try {
    return storage?.getItem?.(STICKY_KEY) || '';
  } catch {
    return '';
  }
}

export function writeStickyUri(uri, storage = globalThis.localStorage) {
  try {
    if (uri) storage?.setItem?.(STICKY_KEY, uri);
  } catch {
    /* private mode */
  }
}

/**
 * Best available English voice on this device/browser.
 * Sticky URI wins so the voice does not rotate between screens.
 */
export function pickBestVoice(voices, { stickyUri = '', locale = 'en' } = {}) {
  const english = listEnglishVoices(voices);
  const pool = english.length ? english : [...voices];
  const usable = pool.filter((v) => scoreVoice(v, locale) > -100);
  const ranked = (usable.length ? usable : pool)
    .slice()
    .sort((a, b) => scoreVoice(b, locale) - scoreVoice(a, locale));
  if (!ranked.length) return null;
  if (stickyUri) {
    const sticky = ranked.find((v) => v.voiceURI === stickyUri);
    if (sticky) return sticky;
  }
  return ranked[0];
}

export function rememberBestVoice(voice, storage = globalThis.localStorage) {
  if (voice?.voiceURI) writeStickyUri(voice.voiceURI, storage);
  return voice;
}
