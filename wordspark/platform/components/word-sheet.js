import { getWordExplanation, explanationToSpeech } from '../../js/word-usage.js';

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const WordSheetComponent = {
  id: 'word-sheet',
  version: '1.0.0',
  dependencies: ['speech', 'tts'],
  init(ctx) {
    ctx.wordSheet = {
      open(data, elements) {
        const explanation = getWordExplanation(data);
        const speech = explanationToSpeech(data.word, explanation);
        elements.word.textContent = data.word;
        if (elements.intro) {
          elements.intro.textContent = speech.meaning;
          elements.intro.hidden = false;
        }
        elements.container.innerHTML = speech.examples.map((line) =>
          `<p class="example-line">${escapeHtml(line)}</p>`
        ).join('');
        elements.sheet.hidden = false;
        ctx.speech.speakWordSheet(
          elements.sheet.querySelector('.word-sheet-panel'),
          undefined
        );
        ctx.emit('word.opened', 'word-sheet', { word: data.word });
      },
      close(elements) {
        ctx.tts.stopSpeaking();
        ctx.tts.clearHighlights(elements.word);
        ctx.tts.clearHighlights(elements.container);
        if (elements.intro) {
          elements.intro.textContent = '';
          elements.intro.hidden = true;
        }
        elements.sheet.hidden = true;
        ctx.emit('word.closed', 'word-sheet', {});
      },
    };
  },
  health() {
    return { ok: true, status: 'ready' };
  },
};
