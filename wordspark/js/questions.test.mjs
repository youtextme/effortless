import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  clipWords,
  coachMessage,
  generateQuestions,
  keywordsFrom,
  PASS_THRESHOLD,
} from './questions.js';

const sample = {
  day: 1,
  theme: 'Discovery & Curiosity',
  takeaway: 'Great learners ask questions and explore the world with wonder.',
  words: [
    { word: 'analyze', meaning: 'examine', example: 'Scientists analyze data to find patterns.' },
    { word: 'hypothesis', meaning: 'guess', example: 'Her hypothesis was proven by the experiment.' },
    { word: 'observe', meaning: 'watch', example: 'We observe birds in the garden.' },
    { word: 'curious', meaning: 'eager', example: 'Curious minds ask the best questions.' },
  ],
};

test('quiz has no pass wall', () => {
  assert.equal(PASS_THRESHOLD, 0);
});

test('questions coach takeaways and daily-life word use', () => {
  const qs = generateQuestions(sample);
  assert.equal(qs.length, 6);
  for (const q of qs) {
    assert.ok(q.thinkAloud);
    assert.ok(q.retryAloud);
    assert.equal(q.thinkAloud.includes(q.choices.find((c) => c.correct).text), false);
    assert.ok(clipWords(q.retryAloud, 50).split(/\s+/).length <= 50);
  }
});

test('first miss hints without stating the answer; later misses give keywords', () => {
  const q = generateQuestions(sample)[0];
  const first = coachMessage(q, 1);
  const retry = coachMessage(q, 2);
  const correct = q.choices.find((c) => c.correct).text;
  assert.ok(first);
  assert.notEqual(first, correct);
  assert.ok(retry.toLowerCase().includes('keyword') || keywordsFrom(correct).some((k) => retry.includes(k)));
  assert.ok(retry.split(/\s+/).length <= 50);
});

test('clipWords caps at 50', () => {
  const long = Array.from({ length: 80 }, (_, i) => `word${i}`).join(' ');
  assert.equal(clipWords(long, 50).split(/\s+/).filter(Boolean).length, 50);
});
