import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOCABULARY, TOTAL_DAYS } from '../../js/data/words.js';
import {
  TARGET_WORDS_PER_PASSAGE,
  MIN_WORD_OCCURRENCES,
  PASSAGE_WORD_MIN,
  PASSAGE_WORD_MAX,
  validatePassage,
  getTargetWords,
} from '../../js/passage-generator.js';

const here = dirname(fileURLToPath(import.meta.url));
const wordsparkRoot = join(here, '..', '..');

test('fixture database: ≥100 passages in words.js', () => {
  assert.ok(VOCABULARY.length >= 100, `expected ≥100 passages, got ${VOCABULARY.length}`);
  assert.equal(TOTAL_DAYS, 100);
});

test('every passage: 4 targets, each ≥5 occurrences, ~350–450 words', () => {
  const failures = [];
  for (const day of VOCABULARY) {
    const result = validatePassage(day);
    if (!result.ok) failures.push({ day: day.day, issues: result.issues });
  }
  assert.equal(failures.length, 0, failures.slice(0, 5).map((f) => `day ${f.day}: ${f.issues.join('; ')}`).join('\n'));
});

test('target words per passage contract', () => {
  const day = VOCABULARY[0];
  const targets = getTargetWords(day);
  assert.equal(targets.length, TARGET_WORDS_PER_PASSAGE);
  assert.equal(MIN_WORD_OCCURRENCES, 5);
  assert.ok(PASSAGE_WORD_MIN >= 350);
  assert.ok(PASSAGE_WORD_MAX <= 450);
});

test('read-aloud hook: listen button and speech surface in index.html', () => {
  const html = readFileSync(join(wordsparkRoot, 'index.html'), 'utf8');
  assert.match(html, /id="btn-listen"/);
  assert.match(html, /data-speech-surface/);
});

test('favicon and app name present', () => {
  const html = readFileSync(join(wordsparkRoot, 'index.html'), 'utf8');
  assert.match(html, /<title>WordSpark<\/title>/);
  assert.match(html, /icons\/icon\.svg/);
  assert.ok(existsSync(join(wordsparkRoot, 'icons', 'icon.svg')));
});

test('no login required for first read: name modal only', () => {
  const html = readFileSync(join(wordsparkRoot, 'index.html'), 'utf8');
  assert.match(html, /id="name-modal"/);
  assert.match(html, /id="child-name"/);
  assert.doesNotMatch(html, /sign\s*in|log\s*in|oauth|auth0/i);
});
