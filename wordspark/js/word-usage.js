/**
 * Parent-voice word explanations — pronounce, then two practical examples.
 */

import { WORD_EXPLANATIONS } from './data/word-explanations.js';

export function getWordExplanation(wordData) {
  const key = wordData.word.toLowerCase();
  const found = WORD_EXPLANATIONS[key];
  if (found) return found;

  return {
    intro: `${wordData.word} means ${wordData.meaning}. Listen to how it sounds, then try it in your own sentences.`,
    examples: [
      {
        title: 'In your own words',
        story: `Think of a moment from today — school, home, or with friends — where this idea showed up.`,
        say: wordData.example.replace(/^"/, '').replace(/"$/, ''),
        note: 'Using a new word in your own story is how it becomes yours.',
      },
      {
        title: 'Say it out loud',
        story: `Say "${wordData.word}" slowly. Then use it once in a sentence about your life.`,
        say: `"${wordData.example.replace(/^"/, '').replace(/"$/, '')}"`,
        note: 'Practice once now, and you will remember it when you need it.',
      },
    ],
  };
}

export function explanationToSpeech(word, explanation) {
  const parts = [word, explanation.intro];
  explanation.examples.forEach((ex, i) => {
    parts.push(
      `Example ${i + 1}. ${ex.title}. ${ex.story} You could say: ${ex.say.replace(/^"/, '').replace(/"$/, '')}`
    );
  });
  return parts;
}
