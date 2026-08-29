import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EXIT, exitLabel } from '../lib/exit-codes.js';

describe('exit codes', () => {
  it('has stable numeric codes', () => {
    assert.equal(EXIT.OK, 0);
    assert.equal(EXIT.USAGE, 2);
    assert.equal(EXIT.CONFIG, 3);
    assert.equal(EXIT.OLLAMA_DOWN, 4);
    assert.equal(EXIT.OLLAMA_FAIL, 5);
    assert.equal(EXIT.WHATSAPP_NOT_LINKED, 6);
    assert.equal(EXIT.WHATSAPP_FAIL, 7);
    assert.equal(EXIT.CHAT_NOT_FOUND, 8);
    assert.equal(EXIT.SCHEDULE_FAIL, 9);
    assert.equal(EXIT.INTERNAL, 10);
  });

  it('labels known codes', () => {
    assert.equal(exitLabel(EXIT.OK), 'success');
    assert.equal(exitLabel(EXIT.OLLAMA_DOWN), 'ollama unreachable');
  });
});
