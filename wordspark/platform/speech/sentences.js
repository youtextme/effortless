/**
 * Sentence + pack mechanics — pure functions, no DOM, no speechSynthesis.
 */

const ABBREV = /\b(?:mr|mrs|ms|dr|prof|sr|jr|vs|etc|e\.g|i\.e|u\.s|u\.k)\.$/i;

export function splitSentences(text) {
  const src = String(text || '').replace(/\s+/g, ' ').trim();
  if (!src) return [];

  const out = [];
  let buf = '';
  for (const part of src.split(/(?<=[.!?])\s+/)) {
    if (!part) continue;
    buf = buf ? `${buf} ${part}` : part;
    if (ABBREV.test(part) && !/[!?]/.test(part)) continue;
    out.push(buf.trim());
    buf = '';
  }
  if (buf.trim()) out.push(buf.trim());
  return out.length ? out : [src];
}

export function packByChars(pieces, maxChars) {
  const cap = Math.max(1, maxChars);
  const chunks = [];
  let batch = [];
  let size = 0;

  for (const piece of pieces) {
    const len = piece.text.length;
    if (batch.length && size + len + 1 > cap) {
      chunks.push(batch);
      batch = [];
      size = 0;
    }
    batch.push(piece);
    size += len + (batch.length > 1 ? 1 : 0);
  }
  if (batch.length) chunks.push(batch);
  return chunks;
}

export function joinPieceText(pieces) {
  return pieces.map((p) => p.text).join(' ').replace(/\s+/g, ' ').trim();
}

export function nextMaxChars(current, shrink, minChars) {
  return Math.max(minChars, Math.floor(current * shrink));
}

export function rateForQuality(rates, quality) {
  return rates[quality] ?? rates.default;
}

export function qualityOfVoice(voice, signals) {
  const blob = `${voice?.name || ''} ${voice?.voiceURI || ''}`.toLowerCase();
  if (/\b(neural|natural|premium|enhanced)\b/.test(blob) || blob.includes('neural')) {
    return 'neural';
  }
  if (voice && voice.localService === false) return 'network';
  if (blob.includes('compact') || blob.includes('espeak') || blob.includes('pico')) {
    return 'compact';
  }
  return 'local';
}

export function isAbortResult(result, abortCodes = []) {
  return abortCodes.includes(result);
}

export function localeFamily(locale, fallback = 'en') {
  const raw = String(locale || fallback).toLowerCase();
  return raw.split(/[-_]/)[0] || fallback;
}
