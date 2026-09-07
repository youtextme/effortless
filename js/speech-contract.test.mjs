import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));

test('title and body share one timed-highlight path (no slow word-by-word titles)', () => {
  const tts = readFileSync(join(dir, 'tts.js'), 'utf8');
  assert.equal(tts.includes('spans.length <= 10'), false);
  assert.match(tts, /async function speakInRoot[\s\S]*speakWithTimedHighlight/);
  assert.match(tts, /speakLongPassage[\s\S]*getSpeechRate\(\)/);
});

test('shell coaches misses and never shows a pass-wall toast', () => {
  const shell = readFileSync(join(dir, '../platform/shell.js'), 'utf8');
  assert.equal(shell.includes('Need'), false);
  assert.equal(shell.includes('to pass'), false);
  assert.ok(shell.includes('coachMessage'));
  assert.ok(shell.includes('hideToast'));
  assert.ok(shell.includes('setPaceId'));
});
