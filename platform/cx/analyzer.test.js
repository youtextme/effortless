import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluateCx } from './analyzer.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

test('cx analyzer accepts this repo', () => {
  const result = evaluateCx(root);
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.ok(result.storyCount >= 13);
  assert.ok(result.nfrCount >= 3);
});

test('cx analyzer fails when a story has no test marker', () => {
  const result = evaluateCx(root, { testBlob: 'no story markers in this blob' });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('no test marker')));
});
