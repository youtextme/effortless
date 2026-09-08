/**
 * Speech session planner — every tap maps to one action.
 * Engine/listen/sheet execute; they do not invent extra branches.
 */

export const SPEECH_EVENTS = Object.freeze({
  listen: 'listen',
  wordOpen: 'word-open',
  wordClose: 'word-close',
  leaveSurface: 'leave-surface',
});

let mode = 'idle';

export function speechMode() {
  return mode;
}

export function setSpeechMode(next) {
  mode = next || 'idle';
  return mode;
}

export function planSpeechHandoff(event, { speaking = false, wordSheetOpen = false } = {}) {
  switch (event) {
    case SPEECH_EVENTS.listen:
      if (speaking) return { action: 'stop', mode: 'idle' };
      if (wordSheetOpen) return { action: 'speak-word-sheet', mode: 'word-sheet' };
      return { action: 'speak-surface-from-fold', mode: 'surface' };
    case SPEECH_EVENTS.wordOpen:
      return { action: 'stop-then-speak-word-sheet', mode: 'word-sheet' };
    case SPEECH_EVENTS.wordClose:
      return { action: 'stop', mode: 'idle' };
    case SPEECH_EVENTS.leaveSurface:
      return { action: 'stop', mode: 'idle' };
    default:
      return { action: 'stop', mode: 'idle' };
  }
}
