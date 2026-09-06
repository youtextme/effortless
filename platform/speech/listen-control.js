/**
 * Global Listen control — one dock, every surface.
 */

import { isTTSAvailable, isSpeaking, speakActiveSurface, stopSpeaking } from './engine.js';

function syncButton(btn) {
  if (!btn) return;
  const on = isSpeaking();
  btn.classList.toggle('is-playing', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  btn.setAttribute('aria-label', on ? 'Stop listening' : 'Listen to this page');
}

export function mountListenControl(btn) {
  if (!btn) return { sync() {}, destroy() {} };
  if (!isTTSAvailable()) {
    btn.hidden = true;
    return { sync() {}, destroy() {} };
  }

  const onClick = async () => {
    if (isSpeaking()) {
      stopSpeaking();
      syncButton(btn);
      return;
    }
    btn.classList.add('is-playing');
    await speakActiveSurface({
      onEnd: () => syncButton(btn),
    });
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
