import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig, resolveSchedule } from '../lib/config.js';

describe('validateConfig', () => {
  const valid = {
    to: 'Sigma Boy',
    prompt: 'Write something nice.',
    model: 'qwen3.5:4b',
  };

  it('accepts a valid config', () => {
    assert.equal(validateConfig(valid), null);
  });

  it('rejects missing to', () => {
    assert.match(validateConfig({ ...valid, to: '' }), /to/i);
  });

  it('rejects missing prompt', () => {
    assert.match(validateConfig({ ...valid, prompt: '  ' }), /prompt/i);
  });

  it('rejects invalid hour', () => {
    assert.match(validateConfig({ ...valid, hour: 25 }), /hour/i);
  });

  it('rejects empty ollamaUrls', () => {
    assert.match(validateConfig({ ...valid, ollamaUrls: [] }), /ollamaUrls/i);
  });

  it('rejects non-http ollamaUrls', () => {
    assert.match(validateConfig({ ...valid, ollamaUrls: ['ftp://bad'] }), /http/i);
  });
});

describe('resolveSchedule', () => {
  it('parses "daily at 8:00 AM"', () => {
    const r = resolveSchedule({ schedule: 'daily at 8:00 AM' });
    assert.equal(r.hour, 8);
    assert.equal(r.minute, 0);
  });

  it('parses "daily at 8:30 PM"', () => {
    const r = resolveSchedule({ schedule: 'daily at 8:30 PM' });
    assert.equal(r.hour, 20);
    assert.equal(r.minute, 30);
  });

  it('falls back to hour/minute fields', () => {
    const r = resolveSchedule({ schedule: 'every morning', hour: 9, minute: 15 });
    assert.equal(r.hour, 9);
    assert.equal(r.minute, 15);
  });
});
