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
  countWordOccurrences,
  getTargetWords,
} from '../../js/passage-generator.js';

const here = dirname(fileURLToPath(import.meta.url));
const wordsparkRoot = join(here, '..', '..');
const repoRoot = join(wordsparkRoot, '..');

function isCardOnlyShape(entry) {
  return !entry.body && Array.isArray(entry.words) && entry.words.length >= 4;
}

test('fixture database: ≥100 passages in words.js', () => {
  assert.ok(VOCABULARY.length >= 100, `expected ≥100 passages, got ${VOCABULARY.length}`);
  assert.equal(TOTAL_DAYS, 100);
});

test('REJECT card-only vocabulary shape (body_wc=0) — must store passage body', () => {
  const cardOnly = VOCABULARY.filter(isCardOnlyShape);
  assert.equal(
    cardOnly.length,
    0,
    `card-only entries without body: days ${cardOnly.slice(0, 5).map((d) => d.day).join(', ')}`,
  );
  for (const day of VOCABULARY) {
    assert.equal(typeof day.body, 'string', `day ${day.day} missing body string`);
    assert.ok(day.body.trim().length > 0, `day ${day.day} has empty body`);
    assert.equal(typeof day.body_wc, 'number', `day ${day.day} missing body_wc`);
    assert.ok(day.body_wc > 0, `day ${day.day} body_wc must be > 0 (got ${day.body_wc})`);
  }
});

test('every stored passage: 350–450 words in body_wc', () => {
  const failures = [];
  for (const day of VOCABULARY) {
    if (day.body_wc < PASSAGE_WORD_MIN || day.body_wc > PASSAGE_WORD_MAX) {
      failures.push(`day ${day.day}: body_wc ${day.body_wc} outside ${PASSAGE_WORD_MIN}–${PASSAGE_WORD_MAX}`);
    }
  }
  assert.equal(failures.length, 0, failures.slice(0, 5).join('\n'));
});

test('every stored passage: 4 targets, each ≥5 occurrences in body', () => {
  const failures = [];
  for (const day of VOCABULARY) {
    const targets = day.targets?.length
      ? day.targets.map((word) => ({ word }))
      : getTargetWords(day);
    if (targets.length !== TARGET_WORDS_PER_PASSAGE) {
      failures.push(`day ${day.day}: expected ${TARGET_WORDS_PER_PASSAGE} targets, got ${targets.length}`);
    }
    for (const w of targets) {
      const n = countWordOccurrences(day.body, w.word);
      if (n < MIN_WORD_OCCURRENCES) {
        failures.push(`day ${day.day}: ${w.word} appears ${n} times in body (min ${MIN_WORD_OCCURRENCES})`);
      }
    }
  }
  assert.equal(failures.length, 0, failures.slice(0, 5).join('\n'));
});

test('target words per passage contract', () => {
  const day = VOCABULARY[0];
  assert.equal(MIN_WORD_OCCURRENCES, 5);
  assert.ok(PASSAGE_WORD_MIN >= 350);
  assert.ok(PASSAGE_WORD_MAX <= 450);
  assert.ok(Array.isArray(day.targets) && day.targets.length === TARGET_WORDS_PER_PASSAGE);
});

test('read-aloud hook: listen button and speech surface in index.html', () => {
  const html = readFileSync(join(wordsparkRoot, 'index.html'), 'utf8');
  assert.match(html, /id="btn-listen"/);
  assert.match(html, /data-speech-surface/);
  assert.doesNotMatch(html, /id="btn-read-aloud"/);
});

test('Pages deploy publishes WordSpark at root and /wordspark/', () => {
  const workflow = readFileSync(join(repoRoot, '.github/workflows/github-pages.yml'), 'utf8');
  assert.match(workflow, /wordspark\//);
  assert.match(workflow, /protect snack/);
  assert.match(workflow, /protect wordspark/);
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
