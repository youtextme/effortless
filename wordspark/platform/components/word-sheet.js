import { getWordExplanation, explanationToSpeech } from '../../js/word-usage.js';

export const WordSheetComponent = {
  id: 'word-sheet',
  version: '1.0.0',
  dependencies: ['tts'],
  init(ctx) {
    ctx.wordSheet = {
      open(data, elements) {
        const explanation = getWordExplanation(data);
        const speech = explanationToSpeech(data.word, explanation);
        elements.word.textContent = data.word;
        elements.container.innerHTML = speech.examples.map((line) =>
          `<p class="example-line">${line}</p>`
        ).join('');
        elements.sheet.hidden = false;
        ctx.tts.speakWordWithExamples(speech.word, speech.examples);
        ctx.emit('word.opened', 'word-sheet', { word: data.word });
      },
      close(elements) {
        ctx.tts.stopSpeaking();
        elements.sheet.hidden = true;
        ctx.emit('word.closed', 'word-sheet', {});
      },
    };
  },
  health() {
    return { ok: true, status: 'ready' };
  },
};
