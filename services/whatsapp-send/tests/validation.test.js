import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateSendInput, normalizePhone } from '../lib/validation.js';
import { countOccurrences, isSendVerified } from '../lib/verification.js';
import { EXIT } from '../lib/exit-codes.js';

describe('validateSendInput', () => {
  it('rejects missing message', () => {
    const r = validateSendInput({ name: 'Alice' });
    assert.equal(r.code, EXIT.USAGE);
    assert.match(r.error, /message/i);
  });

  it('rejects empty message', () => {
    const r = validateSendInput({ name: 'Alice', message: '   ' });
    assert.equal(r.code, EXIT.USAGE);
  });

  it('rejects when neither name nor phone provided', () => {
    const r = validateSendInput({ message: 'hi' });
    assert.equal(r.code, EXIT.USAGE);
    assert.match(r.error, /name or phone/i);
  });

  it('rejects when both name and phone provided', () => {
    const r = validateSendInput({ name: 'Alice', phone: '1234567890', message: 'hi' });
    assert.equal(r.code, EXIT.USAGE);
    assert.match(r.error, /not both/i);
  });

  it('accepts name-only request', () => {
    assert.equal(validateSendInput({ name: 'Alice', message: 'hello' }), null);
  });

  it('accepts phone-only request', () => {
    assert.equal(validateSendInput({ phone: '+1 (555) 123-4567', message: 'hello' }), null);
  });

  it('rejects phone with too few digits', () => {
    const r = validateSendInput({ phone: '12345', message: 'hi' });
    assert.equal(r.code, EXIT.USAGE);
    assert.match(r.error, /digit/i);
  });

  it('rejects non-object body', () => {
    const r = validateSendInput(null);
    assert.equal(r.code, EXIT.USAGE);
  });
});

describe('normalizePhone', () => {
  it('strips non-digits', () => {
    assert.equal(normalizePhone('+1 (555) 123-4567'), '15551234567');
  });
});

describe('countOccurrences', () => {
  it('counts non-overlapping matches', () => {
    assert.equal(countOccurrences('hello hello world', 'hello'), 2);
    assert.equal(countOccurrences('aaa', 'aa'), 1);
    assert.equal(countOccurrences('test', 'missing'), 0);
    assert.equal(countOccurrences('', 'x'), 0);
    assert.equal(countOccurrences('abc', ''), 0);
  });
});

describe('isSendVerified', () => {
  it('passes when count increased and composer cleared', () => {
    assert.equal(
      isSendVerified({ beforeCount: 0, afterCount: 1, composerText: '' }),
      true
    );
  });

  it('fails when count did not increase', () => {
    assert.equal(
      isSendVerified({ beforeCount: 1, afterCount: 1, composerText: '' }),
      false
    );
  });

  it('fails when composer not cleared', () => {
    assert.equal(
      isSendVerified({ beforeCount: 0, afterCount: 1, composerText: 'still here' }),
      false
    );
  });

  it('fails when both conditions fail', () => {
    assert.equal(
      isSendVerified({ beforeCount: 2, afterCount: 2, composerText: 'draft' }),
      false
    );
  });
});
