/**
 * Takeaway quiz — coach on a miss, no pass wall.
 * Questions reinforce the passage lesson and daily-life use of words.
 */

import { getTopicTitle } from './data/topics.js';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function keywordsFrom(text) {
  const stop = new Set([
    'this', 'that', 'with', 'from', 'your', 'their', 'about', 'would',
    'could', 'should', 'have', 'what', 'when', 'which', 'them', 'they',
    'into', 'just', 'than', 'then', 'also', 'only',
  ]);
  return String(text || '')
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 3 && !stop.has(w.toLowerCase()));
}

export function clipWords(text, max = 50) {
  const parts = String(text || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length <= max) return parts.join(' ');
  return `${parts.slice(0, max).join(' ')}.`;
}

function makeQuestion({ prompt, correct, wrongs, thinkAloud, retryAloud }) {
  return {
    prompt,
    choices: shuffle([
      { text: correct, correct: true },
      ...wrongs.map((text) => ({ text, correct: false })),
    ]),
    thinkAloud,
    retryAloud: clipWords(retryAloud, 50),
  };
}

function skillQuestions(passageData) {
  const title = getTopicTitle(passageData.day);
  const takeaway = passageData.takeaway;
  const theme = passageData.theme;
  const keys = keywordsFrom(takeaway).slice(0, 6).join(', ');

  return [
    makeQuestion({
      prompt: `What is the key takeaway from "${title}"?`,
      correct: takeaway,
      wrongs: [
        'Finish the page as fast as you can',
        'Memorise spelling lists and stop thinking',
        'Ignore real life and only collect fancy words',
      ],
      thinkAloud: `Picture telling a friend at dinner what this reading was for. It is about ${theme}. Choose the idea you could actually use this week — not speed, not spelling drills.`,
      retryAloud: `Look for these words: ${keys}. That choice is the takeaway. Try again.`,
    }),
    makeQuestion({
      prompt: 'When would this idea help you in real life?',
      correct: 'When you pause, ask a question, and try the idea in something you do this week',
      wrongs: [
        'Only during a timed test at school',
        'Never — reading is just for marks',
        'Only if an adult recites the page for you',
      ],
      thinkAloud: `Think of a moment at home, on the playground, or in class. The useful choice is the one where you actually use the idea, not a situation where you rush or switch off.`,
      retryAloud: `Keywords: pause, question, this week. Pick the everyday moment, then try again.`,
    }),
    makeQuestion({
      prompt: 'What is the best way to make this learning stick?',
      correct: 'Use the idea and the new words in a real conversation',
      wrongs: [
        'Highlight words and never say them',
        'Read once and never come back',
        'Memorise without understanding',
      ],
      thinkAloud: `Learning sticks when you say it in your own life. Which choice sounds like talking at dinner or explaining to a sibling?`,
      retryAloud: `Keywords: use, idea, new words, real conversation. Try that one.`,
    }),
    makeQuestion({
      prompt: `This passage sits in "${theme}". What should you do with that?`,
      correct: 'Connect the ideas to your own life and explain them simply',
      wrongs: [
        'Treat it as random word memorisation',
        'Only practise typing speed',
        'Skip thinking and colour worksheets',
      ],
      thinkAloud: `The theme tells you the flavour of the lesson. The strong choice is connecting it to your life, not skipping thinking.`,
      retryAloud: `Keywords: connect, own life, explain simply. Choose that and try again.`,
    }),
  ];
}

function wordQuestions(passageData) {
  const words = shuffle(passageData.words).slice(0, 2);
  return words.map((word) => makeQuestion({
    prompt: `How would you use "${word.word}" in daily life?`,
    correct: word.example,
    wrongs: shuffle(passageData.words.filter((w) => w.word !== word.word))
      .slice(0, 3)
      .map((w) => w.example),
    thinkAloud: `Imagine saying "${word.word}" at home this week. Which sentence sounds like a real moment, not a dictionary drill?`,
    retryAloud: `Keywords: ${keywordsFrom(word.example).slice(0, 5).join(', ')}. That sentence is the daily-life one. Try again.`,
  }));
}

export function generateQuestions(passageData) {
  return shuffle([...skillQuestions(passageData), ...wordQuestions(passageData)]);
}

/** First miss: thinking hint. Later misses: keywords, still ≤50 words. */
export function coachMessage(question, missCount) {
  if (!question) return '';
  if (missCount <= 1) return String(question.thinkAloud || '').trim();
  return clipWords(question.retryAloud || '', 50);
}

/** Kept so older shells do not crash; coaching quiz does not use a pass wall. */
export const PASS_THRESHOLD = 0;
