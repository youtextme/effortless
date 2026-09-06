import test from 'node:test';
import assert from 'node:assert/strict';
import { shouldStopForSurfaceChange, attachSpeechLifecycle, shouldAbortAfterAsyncWait, pickSpeakRoot, planSpeakSession } from './lifecycle.js';

test('story:speech-stops-on-surface-change quiz covering the passage stops speech', () => {
  const passage = { id: 'reading-scroll', contains: () => false };
  const quiz = { id: 'screen-quiz', contains: () => false };
  assert.equal(shouldStopForSurfaceChange(passage, quiz), true);
  assert.equal(shouldStopForSurfaceChange(passage, passage), false);
  assert.equal(shouldStopForSurfaceChange(null, quiz), false);
  assert.equal(shouldStopForSurfaceChange(passage, null), true);
  const parent = { contains: (el) => el === passage };
  assert.equal(shouldStopForSurfaceChange(passage, parent), false);
});

test('attachSpeechLifecycle is a no-op without MutationObserver', () => {
  const stop = attachSpeechLifecycle({ doc: {}, stop() {}, findActiveSurface: () => null });
  assert.equal(typeof stop, 'function');
  stop();
});

test('attachSpeechLifecycle stops when the active surface changes', () => {
  let cb;
  globalThis.MutationObserver = class {
    constructor(fn) { cb = fn; }
    observe() {}
    disconnect() { this.disconnected = true; }
  };

  const passage = { id: 'p', contains: () => false };
  const quiz = { id: 'q', contains: () => false };
  let active = passage;
  let stopped = 0;
  const detach = attachSpeechLifecycle({
    doc: { body: {} },
    stop: () => { stopped += 1; },
    findActiveSurface: () => active,
  });

  active = quiz;
  cb();
  assert.equal(stopped, 1);
  cb();
  assert.equal(stopped, 1);
  detach();
  delete globalThis.MutationObserver;
});

test('attachSpeechLifecycle polls for covering surfaces', async () => {
  globalThis.MutationObserver = class {
    observe() {}
    disconnect() {}
  };
  const passage = { id: 'p', contains: () => false };
  const quiz = { id: 'q', contains: () => false };
  let active = passage;
  let stopped = 0;
  const detach = attachSpeechLifecycle({
    doc: { body: {} },
    stop: () => { stopped += 1; },
    findActiveSurface: () => active,
    pollMs: 10,
  });
  active = quiz;
  await new Promise((r) => setTimeout(r, 35));
  assert.ok(stopped >= 1);
  detach();
  delete globalThis.MutationObserver;
});

test('story:voices-ready-before-speak abort if generation changes while waiting', () => {
  assert.equal(shouldAbortAfterAsyncWait(3, 3), false);
  assert.equal(shouldAbortAfterAsyncWait(3, 4), true);
  const passage = { id: 'reading-scroll', contains: () => false };
  const quiz = { id: 'screen-quiz', contains: () => false };
  assert.equal(pickSpeakRoot(passage, quiz), null);
  assert.equal(pickSpeakRoot(passage, passage), passage);
  const abortQuiz = planSpeakSession({
    generationAtStart: 2,
    generationNow: 2,
    intendedRoot: passage,
    liveRoot: quiz,
  });
  assert.equal(abortQuiz.action, 'abort');
  const abortWait = planSpeakSession({
    generationAtStart: 2,
    generationNow: 3,
    intendedRoot: passage,
    liveRoot: passage,
  });
  assert.equal(abortWait.reason, 'generation-changed');
  const speak = planSpeakSession({
    generationAtStart: 1,
    generationNow: 1,
    intendedRoot: passage,
    liveRoot: passage,
  });
  assert.equal(speak.action, 'speak');
  assert.equal(speak.root, passage);
});
