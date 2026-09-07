/**
 * Parent reader — one sticky best voice from this device (best-voice.js).
 */

import {
  pickBestVoice,
  rememberBestVoice,
  readStickyUri,
  scoreVoice,
} from './best-voice.js';
import { getSpeechRate } from './speech-settings.js';

let selected = null;
let voicesReady = false;
let voicesPromise = null;

function allVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices();
}

export function refreshVoicePool() {
  const voice = rememberBestVoice(
    pickBestVoice(allVoices(), { stickyUri: readStickyUri(), locale: 'en' }),
  );
  selected = voice
    ? { id: 'home-parent', label: 'Parent', pitch: 1, voice }
    : null;
  voicesReady = Boolean(allVoices().length) || Boolean(voice);
  return selected ? [selected] : [];
}

export function ensureVoicesReady() {
  if (voicesReady && selected?.voice && allVoices().length) {
    return Promise.resolve(selected);
  }

  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const finish = () => {
        refreshVoicePool();
        resolve(selected);
      };

      if (allVoices().length) {
        finish();
        return;
      }

      const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
      const onVoices = () => {
        synth?.removeEventListener?.('voiceschanged', onVoices);
        finish();
      };
      synth?.addEventListener?.('voiceschanged', onVoices);
      synth?.getVoices?.();

      const deadline = Date.now() + 3200;
      const poll = () => {
        if (allVoices().length) {
          synth?.removeEventListener?.('voiceschanged', onVoices);
          finish();
          return;
        }
        if (Date.now() < deadline) {
          synth?.getVoices?.();
          setTimeout(poll, 120);
          return;
        }
        synth?.removeEventListener?.('voiceschanged', onVoices);
        finish();
      };
      setTimeout(poll, 120);
    });
  }

  return voicesPromise;
}

export function getParentReader(_passageNum = 1) {
  if (!selected) refreshVoicePool();
  return selected;
}

export function applyParentVoice(utterance, reader, rate = getSpeechRate()) {
  if (!utterance || !reader) return;
  const voice = reader.voice;
  utterance.lang = voice?.lang || 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  if (voice) utterance.voice = voice;
}

export function initVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  ensureVoicesReady();
  window.addEventListener('voiceschanged', () => {
    voicesPromise = null;
    refreshVoicePool();
  });
}

export function getVoicePoolSize() {
  return selected?.voice ? 1 : 0;
}

export function getActiveVoiceName() {
  return selected?.voice?.name || 'default';
}

export { getSpeechRate, scoreVoice };

if (typeof window !== 'undefined') {
  initVoices();
}
