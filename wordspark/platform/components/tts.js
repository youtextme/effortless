/**
 * TTS adapter — speech subsystem owns the implementation.
 */

export const TtsComponent = {
  id: 'tts',
  version: '2.0.0',
  dependencies: ['speech'],
  init() {
    /* ctx.tts is installed by SpeechComponent */
  },
  health() {
    return { ok: true, status: 'delegates to speech' };
  },
};
