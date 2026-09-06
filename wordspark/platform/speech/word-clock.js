/**
 * Word clock — maps elapsed time + rate to the spoken character.
 * SpeechSynthesis onboundary is optional; the clock must not stall on word 0.
 */

export function charsPerSecond(rate, charsPerSecondAtRate1) {
  const r = Number(rate);
  const base = Number(charsPerSecondAtRate1);
  const safeRate = Number.isFinite(r) && r > 0 ? r : 1;
  const safeBase = Number.isFinite(base) && base > 0 ? base : 15;
  return safeRate * safeBase;
}

export function clampChar(n, textLength) {
  if (!textLength) return 0;
  return Math.max(0, Math.min(textLength, n));
}

export function indexAtChar(charIndex, lengths) {
  if (!lengths.length) return 0;
  let pos = 0;
  const c = Math.max(0, charIndex);
  for (let i = 0; i < lengths.length; i++) {
    if (c < pos + lengths[i] + 1) return i;
    pos += lengths[i] + 1;
  }
  return lengths.length - 1;
}

export function lagWords(predictedIndex, highlightedIndex) {
  return Math.max(0, predictedIndex - highlightedIndex);
}

/**
 * Predicted spoken character for the current utterance.
 * Fresh onboundary → extrapolate from that index.
 * Missing/stale onboundary → elapsed clock so highlight cannot lag a chunk behind.
 */
export function predictedCharIndex({
  elapsedMs = 0,
  rate = 1,
  charsPerSecondAtRate1 = 15,
  textLength = 0,
  boundaryChar = 0,
  sinceBoundaryMs = elapsedMs,
  boundaryStaleMs = 160,
  hasBoundary = false,
} = {}) {
  const cps = charsPerSecond(rate, charsPerSecondAtRate1);
  const clockChar = (Math.max(0, elapsedMs) / 1000) * cps;
  if (hasBoundary && sinceBoundaryMs <= boundaryStaleMs) {
    const fromBoundary = boundaryChar + (Math.max(0, sinceBoundaryMs) / 1000) * cps;
    return clampChar(Math.max(fromBoundary, boundaryChar), textLength);
  }
  return clampChar(Math.max(clockChar, hasBoundary ? boundaryChar : 0), textLength);
}
