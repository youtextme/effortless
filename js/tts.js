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
  speakText,
  getCurrentProfile as getCurrentReader,
  refreshProfile as refreshVoicePool,
} from '../platform/speech/engine.js';

export { speechPolicy, speechPolicy as PARENT_RATES } from '../platform/speech/policy.js';

import { speakActiveSurface, speakWordSheet, speakText } from '../platform/speech/engine.js';

export async function speakLongPassage(_title, _paragraphs, _content, _titleRoot, onEnd) {
  return speakActiveSurface({ onEnd });
}

export async function speakWordWithExamples(_word, _examples, elements, onEnd) {
  const panel = elements?.container?.closest?.('.word-sheet-panel')
    || (typeof document !== 'undefined' ? document.querySelector('.word-sheet-panel') : null);
  return speakWordSheet(panel, onEnd);
}

export function speak(text, { onEnd } = {}) {
  return speakText(text, { onEnd });
}
export function speakWord(word, onEnd) {
  return speakText(word, { onEnd });
}
export function speakSequence(text, onEnd) {
  return speakText(text, { onEnd });
}
export function speakParts(parts, { onEnd } = {}) {
  return speakText((parts || []).join(' '), { onEnd });
}
export function speakPassage(text, onEnd) {
  return speakText(text, { onEnd });
}
export function getParentReader() { return null; }
