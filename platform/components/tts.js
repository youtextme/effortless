import * as ttsApi from '../../js/tts.js';

export const TtsComponent = {
  id: 'tts',
  version: '1.0.0',
  dependencies: [],
  init(ctx) {
    ctx.tts = ttsApi;
  },
  health() {
    const ok = ttsApi.isTTSAvailable();
    return { ok, status: ok ? 'speech synthesis ready' : 'tts unavailable — silent fallback' };
  },
};
