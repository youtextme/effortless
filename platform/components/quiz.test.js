import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  clipWords,
  coachMessage,
  generateQuestions,
  QUIZ_PATTERN,
  takeawayIndexes,
  PASS_THRESHOLD,
} from '../../js/questions.js';
import { VOCABULARY } from '../../js/data/words.js';
import { QuizComponent } from './quiz.js';

const here = dirname(fileURLToPath(import.meta.url));
const ADULT = /scientist|police|darwin|laboratory|crimes thoroughly|medical research|innocence|university|parliament/i;

const sample = VOCABULARY[0];

test('story:quiz-takeaway-spread component:quiz five takeaways are spread and word items are kid copy', () => {
  assert.equal(PASS_THRESHOLD, 0);
  assert.equal(QuizComponent.id, 'quiz');
  const qs = generateQuestions(sample);
  assert.equal(qs.length, QUIZ_PATTERN.length);
  assert.deepEqual(qs.map((q) => q.kind), [...QUIZ_PATTERN]);

  const takeIdx = takeawayIndexes(qs);
  assert.equal(takeIdx.length, 5);
  assert.ok(takeIdx[4] - takeIdx[0] >= 4, `takeaways clumped: ${takeIdx.join(',')}`);

  const wordItems = qs.filter((q) => q.kind === 'word');
  assert.equal(wordItems.length, 2);
  for (const q of wordItems) {
    const correct = q.choices.find((c) => c.correct).text;
    assert.equal(ADULT.test(correct), false, `adult correct: ${correct}`);
  }

  for (const q of qs) {
    assert.ok(q.prompt.trim().endsWith('?'));
    assert.equal(q.choices.filter((c) => c.correct).length, 1);
    assert.equal(q.choices.length, 4);
    const correct = q.choices.find((c) => c.correct).text;
    assert.equal(q.thinkAloud.includes(correct), false, `hint leaked answer: ${q.prompt}`);
    assert.match(q.thinkAloud, /hey|picture|like when|like checking|like a |friend|dinner|homework|playground/i);
    const retry = coachMessage(q, 2);
    assert.ok(retry.split(/\s+/).length <= 50);
    const first = coachMessage(q, 1);
    assert.notEqual(first, correct);
  }

  const types = new Set(qs.map((q) => q.itemType));
  assert.equal(types.has('choice'), true);
  assert.equal(types.has('blank'), true);

  const again = generateQuestions(sample);
  assert.deepEqual(again.map((q) => q.prompt), qs.map((q) => q.prompt));
});

test('story:quiz-takeaway-spread every unique takeaway pack generates a stand-alone set', () => {
  const seen = new Set();
  for (const day of VOCABULARY) {
    if (seen.has(day.takeaway)) continue;
    seen.add(day.takeaway);
    const qs = generateQuestions(day);
    assert.equal(qs.length, 7, day.takeaway);
    assert.equal(qs.filter((q) => q.kind === 'takeaway').length, 5);
    for (const q of qs) {
      const correct = q.choices.find((c) => c.correct).text;
      assert.ok(correct);
      assert.equal(q.thinkAloud.includes(correct), false, `${day.takeaway} leaked on: ${q.prompt}`);
    }
  }
  assert.equal(seen.size, 10);
});

test('component:quiz first miss is a friend hint; later misses stay short', () => {
  const q = generateQuestions(sample)[0];
  const first = coachMessage(q, 1);
  const retry = coachMessage(q, 2);
  assert.ok(first.startsWith('Hey') || /hey —/i.test(first));
  assert.ok(clipWords(retry, 50).split(/\s+/).length <= 50);
});

test('story:quiz-requires-comprehension-pass quiz coaches takeaways without a pass wall', () => {
  const src = readFileSync(join(here, '../../js/questions.js'), 'utf8');
  assert.match(src, /PASS_THRESHOLD = 0/);
  assert.equal(QuizComponent.health().ok, true);
});

test('story:quiz-uses-item-types component:quiz mix includes choice and blank painted by the registry', () => {
  const qs = generateQuestions(sample);
  assert.ok(qs.some((q) => q.itemType === 'choice'));
  assert.ok(qs.some((q) => q.itemType === 'blank'));
  const shell = readFileSync(join(here, '../shell.js'), 'utf8');
  assert.match(shell, /ctx.quiz.renderHtml/);
  assert.match(shell, /data-quiz-answer/);
  assert.equal(shell.includes('q.choices'), false);
});
