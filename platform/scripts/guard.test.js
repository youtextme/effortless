import test from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { evaluate, loadPolicy } from './agent-guard.mjs';
import { evaluate as validate } from './validate-platform.mjs';
import { evaluateCx } from '../cx/analyzer.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

test('validate-platform passes on this repo', () => {
  const result = validate({
    root: join(root, 'platform'),
    wordspark: join(root, 'wordspark'),
  });
  assert.equal(result.ok, true, result.errors?.join('\n'));
  assert.ok(result.componentCount >= 8);
});

test('agent-guard passes on this repo', () => {
  const policy = loadPolicy(root);
  const result = evaluate(root, policy);
  assert.equal(result.ok, true, result.errors?.join('\n'));
  assert.ok(result.testFileCount >= 5);
});

test('cx analyzer is part of the merge law', () => {
  const result = evaluateCx(root);
  assert.equal(result.ok, true, result.errors?.join('\n'));
});
