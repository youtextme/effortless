/**
 * Simple word examples — pronounce twice, then two direct sentences.
 */

import { WORD_EXPLANATIONS } from './data/word-explanations.js';

export function getWordExplanation(wordData) {
  const key = wordData.word.toLowerCase();
  const found = WORD_EXPLANATIONS[key];
  if (found?.examples?.length >= 2) return found;

  const ex = wordData.example.replace(/^"/, '').replace(/"$/, '');
  return {
    examples: [
      ex,
      `I can use "${wordData.word}" when I talk about ${wordData.meaning}.`,
    ],
  };
}

export function explanationToSpeech(word, explanation) {
  const examples = explanation.examples.slice(0, 2);
  return {
    word,
    examples,
  };
}
