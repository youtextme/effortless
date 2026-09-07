/**
 * Word clock — maps elapsed time to the spoken character.
 * Chrome often ignores utterance.rate; the clock must not lag behind audio.
 */

export function charsPerSecond(rate, charsPerSecondAtRate1) {
  const r = Number(rate);
  const base = Number(charsPerSecondAtRate1);
  const safeRate = Number.isFinite(r) && r > 0 ? r : 1;
  const safeBase = Number.isFinite(base) && base > 0 ? base : 16;
  return safeRate * safeBase;
}

/**
 * Natural-pace floor: when honorRate is false, never clock slower than
 * charsPerSecondAtRate1 (engines that ignore rate would otherwise lag).
 */
export function effectiveCharsPerSecond({
  rate = 1,
  charsPerSecondAtRate1 = 16,
  observedCps = 0,
  honorRate = false,
} = {}) {
  const fromRate = charsPerSecond(rate, charsPerSecondAtRate1);
  const natural = charsPerSecond(1, charsPerSecondAtRate1);
  const paced = honorRate ? fromRate : Math.max(fromRate, natural);
  const observed = Number(observedCps);
  const safeObserved = Number.isFinite(observed) && observed > 0 ? observed : 0;
  return Math.max(paced, safeObserved);
}

export function observeCharsPerSecond(textLength, elapsedMs, previousCps = 0, smoothing = 0.35) {
  if (!(elapsedMs > 80) || !(textLength > 0)) return previousCps;
  const sample = (textLength / elapsedMs) * 1000;
  if (!Number.isFinite(sample) || sample <= 0) return previousCps;
  if (!previousCps) return sample;
  const s = Number(smoothing);
  const alpha = Number.isFinite(s) && s > 0 && s < 1 ? s : 0.35;
  return previousCps * (1 - alpha) + sample * alpha;
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
 * Missing/stale onboundary → elapsed clock so highlight cannot stall.
 */
export function predictedCharIndex({
  elapsedMs = 0,
  rate = 1,
  charsPerSecondAtRate1 = 16,
  textLength = 0,
  boundaryChar = 0,
  sinceBoundaryMs = elapsedMs,
  boundaryStaleMs = 120,
  hasBoundary = false,
  honorRate = false,
  observedCps = 0,
} = {}) {
  const cps = effectiveCharsPerSecond({
    rate,
    charsPerSecondAtRate1,
    observedCps,
    honorRate,
  });
  const clockChar = (Math.max(0, elapsedMs) / 1000) * cps;
  if (hasBoundary && sinceBoundaryMs <= boundaryStaleMs) {
    const fromBoundary = boundaryChar + (Math.max(0, sinceBoundaryMs) / 1000) * cps;
    return clampChar(Math.max(fromBoundary, boundaryChar), textLength);
  }
  return clampChar(Math.max(clockChar, hasBoundary ? boundaryChar : 0), textLength);
}
