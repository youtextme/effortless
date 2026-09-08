import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  completePassage,
  getBootTarget,
  loadResume,
  resetProgress,
  saveResume,
  setReadingPassage,
} from '../../js/storage.js';
import { StorageComponent } from './storage.js';

const here = dirname(fileURLToPath(import.meta.url));

test('story:resume-where-left-off component:storage restores home quiz and reading', () => {
  resetProgress();
  saveResume({ passage: 4, scrollY: 320, surface: 'reading' });
  let boot = getBootTarget();
  assert.equal(boot.surface, 'reading');
  assert.equal(boot.passage, 4);
  assert.equal(boot.scrollY, 320);

  saveResume({ passage: 4, surface: 'home', homeTab: 'words' });
  boot = getBootTarget();
  assert.equal(boot.surface, 'home');
  assert.equal(boot.homeTab, 'words');

  saveResume({ passage: 4, surface: 'quiz', quizIndex: 3 });
  boot = getBootTarget();
  assert.equal(boot.surface, 'quiz');
  assert.equal(boot.quizIndex, 3);

  completePassage(4, 10);
  boot = getBootTarget();
  assert.notEqual(boot.surface, 'quiz');
  assert.equal(boot.passage, 5);

  setReadingPassage(7);
  assert.equal(loadResume().passage, 7);
  assert.equal(StorageComponent.health().ok, true);
});

test('story:resume-where-left-off shell restores the boot target', () => {
  const src = readFileSync(join(here, '../shell.js'), 'utf8');
  assert.match(src, /function persistResume/);
  assert.match(src, /getBootTarget/);
  assert.match(src, /typeof ctx.storage.getBootTarget/);
  assert.match(src, /flushResume/);
  assert.match(src, /function openHome/);
  assert.match(src, /startQuiz\(\{ index:/);
});
