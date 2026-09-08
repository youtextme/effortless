/**
 * Global Listen control — one dock, every surface.
 */

import { isTTSAvailable, isSpeaking, speakActiveSurface, speakWordSheet, stopSpeaking } from './engine.js';
import { findActiveSurface } from './visible-text.js';
import { planSpeechHandoff, SPEECH_EVENTS } from './session.js';

function syncButton(btn) {
  if (!btn) return;
  const on = isSpeaking();
  btn.classList.toggle('is-playing', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.setAttribute('aria-label', on ? 'Stop listening' : 'Listen to this page');
}

function wordSheetPanel(surface) {
  if (!surface || surface.hidden) return null;
  return surface.querySelector?.('.word-sheet-panel') || null;
}

export function mountListenControl(btn) {
  if (!btn) return { sync() {}, destroy() {} };
  if (!isTTSAvailable()) {
    btn.hidden = true;
    return { sync() {}, destroy() {} };
  }

  const onClick = async () => {
    const panel = wordSheetPanel(findActiveSurface());
    const plan = planSpeechHandoff(SPEECH_EVENTS.listen, {
      speaking: isSpeaking(),
      wordSheetOpen: Boolean(panel),
    });
    if (plan.action === 'stop') {
      stopSpeaking();
      syncButton(btn);
      return;
    }
    btn.classList.add('is-playing');
    const onEnd = () => syncButton(btn);
    if (plan.action === 'speak-word-sheet') {
      await speakWordSheet(panel, onEnd);
    } else {
      await speakActiveSurface({ fromFold: true, onEnd });
    }
    syncButton(btn);
  };

  btn.addEventListener('click', onClick);
  const onState = () => syncButton(btn);
  window.addEventListener('wordspark:speech', onState);
  syncButton(btn);

  return {
    sync: () => syncButton(btn),
    destroy() {
      btn.removeEventListener('click', onClick);
      window.removeEventListener('wordspark:speech', onState);
    },
  };
}
