import * as speech from '../speech/engine.js';
import { mountListenControl } from '../speech/listen-control.js';
import { speechPolicy } from '../speech/policy.js';
import { attachSpeechLifecycle } from '../speech/lifecycle.js';
import { findActiveSurface } from '../speech/visible-text.js';

export const SpeechComponent = {
  id: 'speech',
  version: '2.0.0',
  dependencies: [],
  init(ctx) {
    ctx.speech = {
      ...speech,
      policy: speechPolicy,
      mountListenControl,
    };
    ctx.tts = {
      isTTSAvailable: speech.isTTSAvailable,
      ensureVoicesReady: speech.ensureVoicesReady,
      stopSpeaking: speech.stopSpeaking,
      isSpeaking: speech.isSpeaking,
      clearHighlights: speech.clearHighlights,
      speakActiveSurface: speech.speakActiveSurface,
      speakRoot: speech.speakRoot,
      speakLongPassage(_title, _paragraphs, _content, _titleRoot, onEnd) {
        return speech.speakActiveSurface({ onEnd });
      },
      speakWordWithExamples(_word, _examples, elements, onEnd) {
        const panel = elements?.container?.closest('.word-sheet-panel')
          || document.querySelector('.word-sheet-panel');
        return speech.speakWordSheet(panel, onEnd);
      },
      getCurrentReader() {
        const p = speech.getCurrentProfile();
        return p ? { voice: p.voice, pitch: p.pitch || 1, label: 'Mom' } : null;
      },
    };
    if (typeof document !== 'undefined') {
      attachSpeechLifecycle({
        doc: document,
        stop: () => speech.stopSpeaking(),
        findActiveSurface,
        pollMs: speechPolicy.timing.surfacePollMs,
      });
    }
  },
  health() {
    const available = speech.isTTSAvailable();
    const profile = speech.getCurrentProfile();
    return {
      ok: true,
      status: available
        ? `speech ready (${profile?.voice?.name || 'default voice'})`
        : 'tts unavailable — silent fallback',
    };
  },
};
