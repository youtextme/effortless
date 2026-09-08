import test from 'node:test';
import assert from 'node:assert/strict';
import { planSpeechHandoff, SPEECH_EVENTS, speechMode, setSpeechMode } from './session.js';

test('story:word-tap-takes-listen handoff matrix covers listen, word tap, close, and leave', () => {
  assert.deepEqual(
    planSpeechHandoff(SPEECH_EVENTS.listen, { speaking: true, wordSheetOpen: false }),
    { action: 'stop', mode: 'idle' },
  );
  assert.deepEqual(
    planSpeechHandoff(SPEECH_EVENTS.listen, { speaking: false, wordSheetOpen: false }),
    { action: 'speak-surface-from-fold', mode: 'surface' },
  );
  assert.deepEqual(
    planSpeechHandoff(SPEECH_EVENTS.listen, { speaking: false, wordSheetOpen: true }),
    { action: 'speak-word-sheet', mode: 'word-sheet' },
  );
  assert.deepEqual(
    planSpeechHandoff(SPEECH_EVENTS.wordOpen, { speaking: true }),
    { action: 'stop-then-speak-word-sheet', mode: 'word-sheet' },
  );
  assert.deepEqual(
    planSpeechHandoff(SPEECH_EVENTS.wordClose),
    { action: 'stop', mode: 'idle' },
  );
  assert.deepEqual(
    planSpeechHandoff(SPEECH_EVENTS.leaveSurface),
    { action: 'stop', mode: 'idle' },
  );
  assert.equal(planSpeechHandoff('unknown').action, 'stop');
});

test('speechMode marker is idle after reset', () => {
  setSpeechMode('word-sheet');
  assert.equal(speechMode(), 'word-sheet');
  setSpeechMode();
  assert.equal(speechMode(), 'idle');
});
