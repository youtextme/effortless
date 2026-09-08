import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOCABULARY, TOTAL_DAYS } from '../../js/data/words.js';
import {
  countWordOccurrences,
  generatePassagePages,
  passageWordCount,
} from '../../js/passage-generator.js';

const here = dirname(fileURLToPath(import.meta.url));
const wordsparkRoot = join(here, '..', '..');
const repoRoot = join(wordsparkRoot, '..');

const WORDS_PER_PASSAGE = 10;
const MIN_PASSAGE_WORDS = 600;

test('fixture database: 100 passages in words.js', () => {
  assert.equal(VOCABULARY.length, 100, `expected 100 passages, got ${VOCABULARY.length}`);
  assert.equal(TOTAL_DAYS, 100);
});

test('every passage card has 10 vocabulary words', () => {
  const failures = [];
  for (const day of VOCABULARY) {
    if (!Array.isArray(day.words) || day.words.length !== WORDS_PER_PASSAGE) {
      failures.push(`day ${day.day}: expected ${WORDS_PER_PASSAGE} words, got ${day.words?.length ?? 0}`);
    }
    for (const w of day.words || []) {
      if (!w.word?.trim()) failures.push(`day ${day.day}: missing word`);
    }
  }
  assert.equal(failures.length, 0, failures.slice(0, 5).join('\n'));
});

test('generated passages weave each vocabulary word exactly once', () => {
  const failures = [];
  for (const day of VOCABULARY.slice(0, 10)) {
    const { sections } = generatePassagePages(day);
    const body = sections.map((s) => s.body).join('\n\n');
    const wc = passageWordCount(sections);
    if (wc < MIN_PASSAGE_WORDS) {
      failures.push(`day ${day.day}: passageWordCount ${wc} below ${MIN_PASSAGE_WORDS}`);
    }
    for (const w of day.words) {
      const n = countWordOccurrences(body, w.word);
      if (n !== 1) {
        failures.push(`day ${day.day}: ${w.word} appears ${n} times (expected 1)`);
      }
    }
  }
  assert.equal(failures.length, 0, failures.slice(0, 5).join('\n'));
});

test('read-aloud hook: listen button and speech surface in index.html', () => {
  const html = readFileSync(join(wordsparkRoot, 'index.html'), 'utf8');
  assert.match(html, /id="btn-listen"/);
  assert.match(html, /data-speech-surface/);
  assert.doesNotMatch(html, /id="btn-read-aloud"/);
});

test('Pages deploy: WordSpark to root with snack protected', () => {
  const workflowPaths = [
    join(repoRoot, '.github/workflows/wordspark-pages.yml'),
    join(repoRoot, '.github/workflows/github-pages.yml'),
  ];
  const workflow = workflowPaths
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, 'utf8'))
    .join('\n');
  assert.match(workflow, /wordspark/);
  assert.match(workflow, /protect snack/);
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
