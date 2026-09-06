/**
 * Kindle-style passages — ~400 words, 4 target words each repeated ≥5 times in context.
 * Baseline pedagogy restored from pre–600-word topic-first rewrite (commit e71afb0 era).
 */

import { getTopicTitle } from './data/topics.js';

export const TARGET_WORDS_PER_PASSAGE = 4;
export const MIN_WORD_OCCURRENCES = 5;
export const PASSAGE_WORD_MIN = 350;
export const PASSAGE_WORD_MAX = 450;

/** First four words of the day are the passage focus; full day list stays in words.js. */
export function getTargetWords(passageData) {
  return passageData.words.slice(0, TARGET_WORDS_PER_PASSAGE);
}

function guessWordType(word) {
  if (word.endsWith('ly')) return 'adv';
  if (word.endsWith('tion') || word.endsWith('sion') || word.endsWith('ness') || word.endsWith('ity') || word.endsWith('ment')) return 'noun';
  if (word.endsWith('ive') || word.endsWith('ous') || word.endsWith('ent') || word.endsWith('ant') || word.endsWith('ful') || word.endsWith('able') || word.endsWith('ible')) return 'adj';
  return 'verb';
}

const VERB_LINES = [
  (w) => `When you learn to ${w}, you open new doors in how you think and speak.`,
  (w) => `Great readers ${w} ideas carefully before they share them with others.`,
  (w) => `Teachers encourage students to ${w} every concept they study in class.`,
  (w) => `To truly ${w} is to practice using the word in real conversations.`,
  (w) => `You will ${w} this word naturally after reading it many times today.`,
  (w) => `Friends notice when you begin to ${w} advanced vocabulary in daily talk.`,
];

const NOUN_LINES = [
  (w) => `Understanding ${w} helps you express yourself with precision and power.`,
  (w) => `The idea of ${w} appears in news, books, and conversations around the world.`,
  (w) => `When you master ${w}, you can discuss complex topics with ease.`,
  (w) => `Writers use ${w} to make their arguments more convincing.`,
  (w) => `Knowing ${w} sets you apart as a thoughtful English reader.`,
  (w) => `You will encounter ${w} in exams, interviews, and everyday discussions.`,
];

const ADJ_LINES = [
  (w) => `Being ${w} in your thinking helps you solve problems creatively.`,
  (w) => `A ${w} approach to learning makes every lesson more enjoyable.`,
  (w) => `You can sound more ${w} by using words like this one daily.`,
  (w) => `Stay ${w} as you read — each word here is chosen to help you grow.`,
  (w) => `Today you become more ${w} by learning this word in real contexts.`,
  (w) => `The most ${w} speakers practice vocabulary every single day.`,
];

function linesForWord(word) {
  const type = guessWordType(word);
  if (type === 'noun') return NOUN_LINES;
  if (type === 'adj' || type === 'adv') return ADJ_LINES;
  return VERB_LINES;
}

function buildWordParagraph(wordData) {
  const w = wordData.word;
  const lines = linesForWord(w);
  const meaning = wordData.meaning.charAt(0).toUpperCase() + wordData.meaning.slice(1);
  const opener = `${meaning}. ${wordData.example}`;
  return [opener, ...lines.slice(0, MIN_WORD_OCCURRENCES).map((fn) => fn(w))].join(' ');
}

function topicIntro(day, theme, takeaway) {
  const hooks = {
    early: 'Good reading feels like a quiet conversation with someone who respects your mind.',
    mid: 'Clear thinking starts with clear words — the kind you meet in articles, essays, and stories worth finishing.',
    late: 'Every passage you finish is practice for the conversations and decisions waiting for you beyond school.',
  };
  const hook = day <= 33 ? hooks.early : day <= 66 ? hooks.mid : hooks.late;
  return `${hook} Today's topic is "${theme}." ${takeaway} Read slowly. Notice how the highlighted words return again and again — that is how strong vocabulary sticks. Let each sentence land before you move on.`;
}

function buildClosing(day, targets, takeaway) {
  const names = targets.map((w) => w.word).join(', ');
  return `You have now met ${names} in many different sentences. ${takeaway} Try using one of these words when you talk to someone tonight. Passage ${day} is complete — keep reading tomorrow.`;
}

/**
 * Build a blog-length essay: intro + one paragraph per target word + closing.
 */
export function generatePassagePages(passageData) {
  const targets = getTargetWords(passageData);
  const title = getTopicTitle(passageData.day);
  const intro = topicIntro(passageData.day, passageData.theme, passageData.takeaway);

  const sections = [
    { h2: '', body: intro },
    ...targets.map((wordData) => ({
      h2: '',
      body: buildWordParagraph(wordData),
    })),
    { h2: '', body: buildClosing(passageData.day, targets, passageData.takeaway) },
  ];

  return { h1: title, sections };
}

export function generatePassage(passageData) {
  const { sections } = generatePassagePages(passageData);
  return sections.map((s) => s.body).join('\n\n');
}

/** Highlight each target word on its first occurrence. */
export function highlightWordsOnce(html, words) {
  const seen = new Set();
  const wordList = words.map((w) => w.word);
  const regex = new RegExp(`\\b(${wordList.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');

  return html.replace(regex, (match) => {
    const key = match.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      return `<mark class="vocab-word" data-word="${key}">${match}</mark>`;
    }
    return match;
  });
}

export function sectionToHtml(section, words) {
  const targetWords = words.slice(0, TARGET_WORDS_PER_PASSAGE);
  const raw = section.body
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('');
  const heading = section.h2
    ? `<h2 class="passage-h2" aria-hidden="true">${section.h2}</h2>`
    : '';
  return `${heading}${highlightWordsOnce(raw, targetWords)}`;
}

export function countWordOccurrences(text, word) {
  const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
  return (text.match(regex) || []).length;
}

export function passageWordCount(sections) {
  const text = sections.map((s) => s.body).join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}

/** Validate one passage meets Kindle pedagogy contract. */
export function validatePassage(passageData) {
  const targets = getTargetWords(passageData);
  const { sections } = generatePassagePages(passageData);
  const text = sections.map((s) => s.body).join(' ');
  const wordCount = passageWordCount(sections);
  const issues = [];

  if (targets.length !== TARGET_WORDS_PER_PASSAGE) {
    issues.push(`expected ${TARGET_WORDS_PER_PASSAGE} target words, got ${targets.length}`);
  }
  if (wordCount < PASSAGE_WORD_MIN || wordCount > PASSAGE_WORD_MAX) {
    issues.push(`word count ${wordCount} outside ${PASSAGE_WORD_MIN}–${PASSAGE_WORD_MAX}`);
  }
  for (const w of targets) {
    const n = countWordOccurrences(text, w.word);
    if (n < MIN_WORD_OCCURRENCES) {
      issues.push(`${w.word} appears ${n} times (min ${MIN_WORD_OCCURRENCES})`);
    }
  }

  return { ok: issues.length === 0, wordCount, targets, issues };
}
