/**
 * Legacy TTS facade — delegates to platform/speech.
 */

export {
  isTTSAvailable,
  ensureVoicesReady,
  stopSpeaking,
  isSpeaking,
  clearHighlights,
  speakRoot,
  speakActiveSurface,
  speakWordSheet,
  getCurrentProfile as getCurrentReader,
  refreshProfile as refreshVoicePool,
} from '../platform/speech/engine.js';

export { speechPolicy, speechPolicy as PARENT_RATES } from '../platform/speech/policy.js';

import { speakActiveSurface, speakWordSheet } from '../platform/speech/engine.js';

export async function speakLongPassage(_title, _paragraphs, _content, _titleRoot, onEnd) {
  return speakActiveSurface({ onEnd });
}

export async function speakWordWithExamples(_word, _examples, elements, onEnd) {
  const panel = elements?.container?.closest?.('.word-sheet-panel')
    || (typeof document !== 'undefined' ? document.querySelector('.word-sheet-panel') : null);
  return speakWordSheet(panel, onEnd);
}

export function speak() { return false; }
export function speakWord() { return false; }
export function speakSequence() { return false; }
export function speakParts() { return false; }
export function speakPassage() { return false; }
export function getParentReader() { return null; }
