import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPaceId, getSpeechRate, PACE_RATES, setPaceId } from './speech-settings.js';

function mem(seed = {}) {
  const m = new Map(Object.entries(seed));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
  };
}

test('default pace is home (parent to a 10-year-old)', () => {
  const storage = mem();
  assert.equal(getPaceId(storage), 'home');
  assert.equal(getSpeechRate(storage), PACE_RATES.home);
  assert.equal(PACE_RATES.home, 0.94);
});

test('parents can raise speed on device', () => {
  const storage = mem();
  assert.equal(setPaceId('quick', storage), 'quick');
  assert.equal(getSpeechRate(storage), PACE_RATES.quick);
  assert.ok(PACE_RATES.quick > PACE_RATES.home);
});

test('unknown pace falls back to home', () => {
  const storage = mem();
  assert.equal(setPaceId('turbo', storage), 'home');
  assert.equal(getSpeechRate(storage), PACE_RATES.home);
});
