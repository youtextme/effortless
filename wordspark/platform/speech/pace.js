/**
 * Parent read-aloud pace — stored on device, edited from Parents.
 * Home = a parent talking to a 10-year-old (same rate for title and body).
 */

const KEY = 'wordspark_speech_pace';

export const PACE_RATES = Object.freeze({
  gentle: 0.88,
  home: 0.94,
  brisk: 1.02,
  quick: 1.10,
});

export const PACE_IDS = Object.freeze(Object.keys(PACE_RATES));

export function getPaceId(storage = globalThis.localStorage) {
  try {
    const id = storage?.getItem?.(KEY);
    if (id && PACE_RATES[id] != null) return id;
  } catch {
    /* ignore */
  }
  return 'home';
}

export function setPaceId(id, storage = globalThis.localStorage) {
  const pace = PACE_RATES[id] != null ? id : 'home';
  try {
    storage?.setItem?.(KEY, pace);
  } catch {
    /* ignore */
  }
  return pace;
}

export function getSpeechRate(storage = globalThis.localStorage) {
  return PACE_RATES[getPaceId(storage)];
}
