import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateConfig, resolveSchedule, parseScheduleString } from '../lib/config.js';

describe('validateConfig', () => {
  const valid = {
    to: 'Sigma Boy',
    schedule: '08:00',
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

  it('rejects invalid schedule', () => {
    assert.match(validateConfig({ ...valid, schedule: 'noon-ish' }), /schedule/i);
  });

  it('rejects empty ollamaUrls', () => {
    assert.match(validateConfig({ ...valid, ollamaUrls: [] }), /ollamaUrls/i);
  });

  it('rejects non-http ollamaUrls', () => {
    assert.match(validateConfig({ ...valid, ollamaUrls: ['ftp://bad'] }), /http/i);
  });
});

describe('parseScheduleString', () => {
  it('parses 24-hour "08:00"', () => {
    const r = parseScheduleString('08:00');
    assert.equal(r.hour, 8);
    assert.equal(r.minute, 0);
  });

  it('parses "20:30"', () => {
    const r = parseScheduleString('20:30');
    assert.equal(r.hour, 20);
    assert.equal(r.minute, 30);
  });

  it('parses 12-hour "daily at 8:00 AM"', () => {
    const r = parseScheduleString('daily at 8:00 AM');
    assert.equal(r.hour, 8);
    assert.equal(r.minute, 0);
  });

  it('returns null hour for garbage', () => {
    const r = parseScheduleString('sometime');
    assert.equal(r.hour, null);
  });
});

describe('resolveSchedule', () => {
  it('uses config schedule field', () => {
    const r = resolveSchedule({ schedule: '08:00' });
    assert.equal(r.hour, 8);
    assert.equal(r.minute, 0);
  });

  it('defaults to 08:00 when schedule invalid', () => {
    const r = resolveSchedule({ schedule: 'bad' });
    assert.equal(r.hour, 8);
    assert.equal(r.minute, 0);
  });
});
