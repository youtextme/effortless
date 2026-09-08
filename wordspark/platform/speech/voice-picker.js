/**
 * Mechanized voice picker — scores whatever the device exposes.
 * No required vendor names; signals in policy only bias warmth/quality.
 */

import { speechPolicy } from './policy.js';
import { localeFamily, qualityOfVoice } from './sentences.js';
import { getSpeechRate } from './pace.js';

export function documentLocale(doc = typeof document !== 'undefined' ? document : null, nav = typeof navigator !== 'undefined' ? navigator : null) {
  const htmlLang = doc?.documentElement?.lang;
  const navLang = nav?.language;
  return htmlLang || navLang || speechPolicy.locale.fallback;
}

function tokenSet(blob) {
  return new Set(blob.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
}

function blobHasSignal(blob, signal) {
  const needle = signal.toLowerCase();
  if (needle.includes(' ') || needle.includes('-')) return blob.includes(needle);
  return tokenSet(blob).has(needle);
}

export function isRobotVoice(voice) {
  const blob = `${voice?.name || ''} ${voice?.voiceURI || ''}`.toLowerCase();
  return (speechPolicy.robotReject || []).some((token) => blob.includes(token));
}

export function scoreVoice(voice, locale = documentLocale()) {
  if (!voice) return -Infinity;
  if (isRobotVoice(voice)) return speechPolicy.robotRejectScore ?? -200;
  const lang = String(voice.lang || '').toLowerCase();
  const family = localeFamily(locale, speechPolicy.locale.fallback);
  const blob = `${voice.name || ''} ${voice.voiceURI || ''}`.toLowerCase();
  let score = 0;

  if (lang.startsWith(family)) score += speechPolicy.voiceBonuses.langFamily;
  else score -= 40;

  const loc = String(locale).toLowerCase();
  if (lang && (lang === loc || lang.replace('_', '-') === loc.replace('_', '-'))) {
    score += speechPolicy.voiceBonuses.langExact;
  }

  for (const [signal, pts] of Object.entries(speechPolicy.voiceSignals)) {
    if (blobHasSignal(blob, signal)) score += pts;
  }

  if (voice.localService === false) score += speechPolicy.voiceBonuses.networkVoice;
  if (voice.default) score += speechPolicy.voiceBonuses.defaultVoice;

  return score;
}

export function pickWarmMother(voices, locale = documentLocale(), stickyUri = '') {
  const list = [...(voices || [])];
  if (!list.length) return null;

  const ranked = list
    .map((voice) => ({ voice, score: scoreVoice(voice, locale) }))
    .sort((a, b) => b.score - a.score);
  const usable = ranked.filter((row) => row.score > -100);
  const pool = usable.length ? usable : ranked;

  if (stickyUri) {
    const sticky = pool.find((row) => row.voice.voiceURI === stickyUri);
    if (sticky) return sticky.voice;
  }

  return pool[0]?.voice || null;
}

export function sessionProfile(voice, locale = documentLocale()) {
  const quality = qualityOfVoice(voice, speechPolicy.voiceSignals);
  return {
    voice,
    locale,
    quality,
    rate: getSpeechRate(),
    pitch: speechPolicy.pitch,
    lang: voice?.lang || locale || 'en-US',
  };
}

export function listEnglishVoices(voices, locale = documentLocale()) {
  const family = localeFamily(locale);
  return [...(voices || [])].filter((v) => String(v.lang || '').toLowerCase().startsWith(family));
}
