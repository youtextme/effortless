/**
 * Item packs — first question types. Add a pack here; quiz mix must USE it.
 * Copy is data on the item. Kernel only paints structure.
 */

import { escapeHtml } from '../kernel/items.js';

function choicesOf(item) {
  return Array.isArray(item?.choices) ? item.choices : [];
}

function choiceButtons(item, className) {
  return choicesOf(item).map((c, i) => {
    const text = escapeHtml(c.text || c.label || '');
    const correct = c.correct ? 'true' : 'false';
    const id = escapeHtml(c.id || String(i));
    return `<button type="button" class="${className}" data-quiz-answer data-correct="${correct}" data-choice="${id}">${text}</button>`;
  }).join('');
}

export function createChoiceType() {
  return {
    id: 'choice',
    label: 'Choose one',
    renderHtml(item) {
      return `<div class="quiz-choices" data-item-type="choice">${choiceButtons(item, 'quiz-choice')}</div>`;
    },
    grade(item, response) {
      const selected = String(response?.id ?? response?.text ?? '');
      const hit = choicesOf(item).find((c, i) => String(c.id || i) === selected || c.text === selected);
      if (hit) return { correct: Boolean(hit.correct) };
      return { correct: response?.correct === true };
    },
  };
}

export function createBlankType() {
  return {
    id: 'blank',
    label: 'Fill the blank',
    renderHtml(item) {
      const stem = escapeHtml(item?.stem || 'The right idea is ____.');
      const withSlot = stem.replace(
        '____',
        '<span id="quiz-blank-slot" class="quiz-blank-slot" aria-live="polite">____</span>',
      );
      return `
        <p class="quiz-stem" data-item-type="blank">${withSlot}</p>
        <div class="quiz-chips" role="group" aria-label="Words that can fill the blank">
          ${choiceButtons(item, 'quiz-choice quiz-chip')}
        </div>
      `;
    },
    grade(item, response) {
      return createChoiceType().grade(item, response);
    },
  };
}

export function defaultItemTypes() {
  return [createChoiceType(), createBlankType()];
}
