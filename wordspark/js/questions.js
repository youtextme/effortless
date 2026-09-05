/**
 * Generates comprehension questions for each passage.
 */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickDistractors(correct, allWords, count = 3) {
  const pool = allWords.filter((w) => w.word !== correct.word);
  return shuffle(pool).slice(0, count);
}

export function generateQuestions(passageData) {
  const words = passageData.words;
  const questions = [];

  const selected = shuffle(words).slice(0, 5);

  for (const word of selected) {
    const distractors = pickDistractors(word, words, 3);
    const choices = shuffle([
      { text: word.meaning, correct: true },
      ...distractors.map((d) => ({ text: d.meaning, correct: false })),
    ]);

    questions.push({
      type: 'meaning',
      prompt: `What does "${word.word}" mean?`,
      word: word.word,
      choices,
    });
  }

  const useWord = words[Math.floor(Math.random() * words.length)];
  const wrongWords = shuffle(words.filter((w) => w.word !== useWord.word)).slice(0, 3);
  questions.push({
    type: 'usage',
    prompt: `Which sentence uses "${useWord.word}" correctly?`,
    word: useWord.word,
    choices: shuffle([
      { text: useWord.example, correct: true },
      ...wrongWords.map((w) => ({
        text: w.example.replace(w.word, useWord.word),
        correct: false,
      })),
    ]),
  });

  return shuffle(questions).slice(0, 5);
}

export const PASS_THRESHOLD = 4;
