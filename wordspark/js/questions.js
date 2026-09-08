/**
 * Takeaway quiz — kid-think scenarios, no pass wall.
 * Five takeaway items (top idea + 4 more, spread) and two word items.
 */

import { getWordExplanation } from './word-usage.js';
import { TAKEAWAY_COUNT, takeawayPack } from './quiz-takeaways.js';

export { TAKEAWAY_COUNT };
export const WORD_COUNT = 2;
export const QUIZ_PATTERN = Object.freeze([
  'takeaway',
  'word',
  'takeaway',
  'takeaway',
  'word',
  'takeaway',
  'takeaway',
]);

export function keywordsFrom(text) {
  const stop = new Set([
    'this', 'that', 'with', 'from', 'your', 'their', 'about', 'would',
    'could', 'should', 'have', 'what', 'when', 'which', 'them', 'they',
    'into', 'just', 'than', 'then', 'also', 'only', 'they', 'them',
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

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuestion({ prompt, correct, wrongs, thinkAloud, retryAloud, kind, rng }) {
  const uniqueWrongs = [...new Set(wrongs.map((text) => String(text || '').trim()))]
    .filter((text) => text && text !== correct)
    .slice(0, 3);
  while (uniqueWrongs.length < 3) {
    uniqueWrongs.push(`Not this one — it skips thinking (${uniqueWrongs.length + 1})`);
  }
  return {
    kind,
    itemType: 'choice',
    prompt,
    choices: seededShuffle([
      { text: correct, correct: true },
      ...uniqueWrongs.map((text) => ({ text, correct: false })),
    ], rng),
    thinkAloud,
    retryAloud: clipWords(retryAloud, 50),
  };
}

function takeawayQuestions(passageData, rng) {
  return takeawayPack(passageData.takeaway).map((item) => makeQuestion({
    ...item,
    kind: 'takeaway',
    rng,
  }));
}

function wordThinkAloud(word, simple) {
  const meaning = String(simple || '').trim();
  return `Hey — "${word}" is a word you can actually use. ${meaning} Picture homework, a game, dinner, or a message to a friend — not a scientist in a lab. Which choice sounds like you saying it this week?`;
}

function wordRetry(word, simple) {
  const keys = keywordsFrom(simple).slice(0, 4).join(', ');
  return clipWords(`You've got this. "${word}" means that idea in real life. Keywords: ${keys}. Try again.`, 50);
}

function usageQuestion(wordData, others, rng) {
  const expl = getWordExplanation(wordData);
  const word = wordData.word;
  const correct = expl.examples[0];
  const wrongs = others
    .map((w) => getWordExplanation(w).examples[0])
    .filter((line) => line && line !== correct && !line.toLowerCase().includes(String(word).toLowerCase()))
    .slice(0, 3);
  return makeQuestion({
    prompt: `Which moment is really using "${word}" the way a kid would say it?`,
    correct,
    wrongs,
    thinkAloud: wordThinkAloud(word, expl.simple),
    retryAloud: wordRetry(word, expl.simple),
    kind: 'word',
    rng,
  });
}

function meaningQuestion(wordData, others, rng) {
  const expl = getWordExplanation(wordData);
  const word = wordData.word;
  const correct = expl.simple;
  const wrongs = others
    .map((w) => getWordExplanation(w).simple)
    .filter((line) => line && line !== correct)
    .slice(0, 3);
  return makeQuestion({
    prompt: `A friend asks, "what does ${word} actually mean?" Which friend-style answer is right?`,
    correct,
    wrongs,
    thinkAloud: `Hey — explain "${word}" like you would at dinner. Picture homework, a game, or a sibling asking "wait, what does that mean?" Pick the meaning that matches this word, not a neighbour word on the list.`,
    retryAloud: wordRetry(word, expl.simple),
    kind: 'word',
    rng,
  });
}

function toBlankItem(question) {
  return {
    ...question,
    itemType: 'blank',
    stem: 'The friend-style meaning is ____.',
  };
}

function wordQuestions(passageData, rng) {
  const words = seededShuffle(passageData.words || [], rng);
  const picked = words.slice(0, WORD_COUNT);
  return picked.map((wordData, i) => {
    const others = words.filter((w) => w.word !== wordData.word);
    if (i === 0) return usageQuestion(wordData, others, rng);
    return toBlankItem(meaningQuestion(wordData, others, rng));
  });
}

function interleave(takeaways, words) {
  const out = [];
  let ti = 0;
  let wi = 0;
  for (const kind of QUIZ_PATTERN) {
    if (kind === 'takeaway') out.push(takeaways[ti++]);
    else out.push(words[wi++]);
  }
  return out.filter(Boolean);
}

export function generateQuestions(passageData) {
  const seed = Number(passageData?.day) || 1;
  const rng = mulberry32(seed * 9973 + 17);
  const takeaways = takeawayQuestions(passageData, rng);
  const words = wordQuestions(passageData, rng);
  return interleave(takeaways, words);
}

export function takeawayIndexes(questions) {
  return questions
    .map((q, i) => (q.kind === 'takeaway' ? i : -1))
    .filter((i) => i >= 0);
}

/** First miss: friend hint. Later misses: keywords, still ≤50 words. */
export function coachMessage(question, missCount) {
  if (!question) return '';
  if (missCount <= 1) return String(question.thinkAloud || '').trim();
  return clipWords(question.retryAloud || '', 50);
}

/** Kept so older shells do not crash; coaching quiz does not use a pass wall. */
export const PASS_THRESHOLD = 0;
