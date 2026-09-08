import test from 'node:test';
import assert from 'node:assert/strict';
import {
  charsPerSecond,
  clampChar,
  indexAtChar,
  lagWords,
  predictedCharIndex,
  effectiveCharsPerSecond,
  observeCharsPerSecond,
} from './word-clock.js';
import { speechPolicy } from './policy.js';

test('story:highlight-tracks-spoken-word clock catches up when onboundary is missing', () => {
  const text = 'one two three four five six seven eight';
  const lengths = text.split(' ').map((w) => w.length);
  const char = predictedCharIndex({
    elapsedMs: 2000,
    rate: speechPolicy.rates.network,
    charsPerSecondAtRate1: speechPolicy.clock.charsPerSecondAtRate1,
    textLength: text.length,
    hasBoundary: false,
  });
  const predicted = indexAtChar(char, lengths);
  assert.ok(
    predicted >= 4,
    `clock must leave word 0 after 2s (got word ${predicted}, char ${char})`,
  );
  assert.equal(lagWords(predicted, predicted), 0);
  assert.ok(lagWords(predicted, 0) > speechPolicy.clock.maxLagWords);
  assert.ok(lagWords(predicted, predicted) <= speechPolicy.clock.maxLagWords);
});

test('fresh onboundary is trusted and does not snap backward', () => {
  const text = 'alpha beta gamma delta';
  const fromBoundary = predictedCharIndex({
    elapsedMs: 400,
    rate: 1,
    charsPerSecondAtRate1: 15,
    textLength: text.length,
    boundaryChar: 12,
    sinceBoundaryMs: 40,
    boundaryStaleMs: 160,
    hasBoundary: true,
  });
  assert.ok(fromBoundary >= 12);
});

test('stale onboundary yields to the elapsed clock so highlight cannot stall', () => {
  const text = 'alpha beta gamma delta epsilon zeta';
  const stalled = predictedCharIndex({
    elapsedMs: 2500,
    rate: 1,
    charsPerSecondAtRate1: 15,
    textLength: text.length,
    boundaryChar: 0,
    sinceBoundaryMs: 2500,
    boundaryStaleMs: 160,
    hasBoundary: true,
  });
  assert.ok(stalled > 10);
});

test('indexAtChar maps spoken string offsets onto word spans', () => {
  const lengths = [3, 5, 4];
  assert.equal(indexAtChar(0, lengths), 0);
  assert.equal(indexAtChar(4, lengths), 1);
  assert.equal(indexAtChar(20, lengths), 2);
  assert.equal(indexAtChar(0, []), 0);
});

test('charsPerSecond and clampChar are safe for bad inputs', () => {
  assert.equal(charsPerSecond(0, 15), 15);
  assert.equal(charsPerSecond(2, 10), 20);
  assert.equal(clampChar(-4, 10), 0);
  assert.equal(clampChar(99, 10), 10);
  assert.equal(clampChar(3, 0), 0);
});

test('story:highlight-tracks-spoken-word clock does not lag when the engine ignores rate', () => {
  const text = 'one two three four five six seven eight';
  const lengths = text.split(' ').map((w) => w.length);
  const honored = predictedCharIndex({
    elapsedMs: 2000,
    rate: 0.82,
    charsPerSecondAtRate1: 16,
    textLength: text.length,
    hasBoundary: false,
    honorRate: true,
  });
  const cx = predictedCharIndex({
    elapsedMs: 2000,
    rate: 0.82,
    charsPerSecondAtRate1: 16,
    textLength: text.length,
    hasBoundary: false,
    honorRate: false,
  });
  assert.ok(indexAtChar(cx, lengths) >= indexAtChar(honored, lengths));
  assert.ok(indexAtChar(cx, lengths) >= 4);
  assert.equal(speechPolicy.clock.honorRate, false);
  assert.ok(
    effectiveCharsPerSecond({ rate: 0.82, charsPerSecondAtRate1: 16, honorRate: false })
      >= effectiveCharsPerSecond({ rate: 1, charsPerSecondAtRate1: 16, honorRate: true }),
  );
});

test('observeCharsPerSecond learns from a finished utterance', () => {
  const first = observeCharsPerSecond(160, 8000, 0, 0.35);
  assert.ok(first > 15 && first < 25);
  const next = observeCharsPerSecond(160, 5000, first, 0.35);
  assert.ok(next > first);
  assert.equal(observeCharsPerSecond(10, 10, 12, 0.35), 12);
});

test('highlight lead ratio keeps the clock ahead of audio', () => {
  const text = 'one two three four five six seven eight';
  const base = predictedCharIndex({
    elapsedMs: 1000,
    charsPerSecondAtRate1: 16,
    textLength: text.length,
    hasBoundary: false,
    highlightLeadRatio: 0,
  });
  const lead = predictedCharIndex({
    elapsedMs: 1000,
    charsPerSecondAtRate1: 16,
    textLength: text.length,
    hasBoundary: false,
    highlightLeadRatio: speechPolicy.clock.highlightLeadRatio,
  });
  assert.ok(lead > base);
  assert.equal(speechPolicy.clock.highlightLeadRatio, 0.15);
  assert.equal(speechPolicy.preload.aheadRatio, 0.15);
});
