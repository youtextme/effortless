/**
 * Generates reading passages with each vocabulary word repeated ~10 times.
 */

const SENTENCE_TEMPLATES = [
  (w) => `When you learn to ${w}, you open new doors in how you think and speak.`,
  (w) => `Great speakers know how to ${w} ideas clearly to any audience.`,
  (w) => `Teachers encourage students to ${w} every concept they study.`,
  (w) => `To truly ${w} is to practice using the word in real conversations.`,
  (w) => `Readers who ${w} passages carefully remember words for life.`,
  (w) => `You will ${w} this word naturally after reading it many times today.`,
  (w) => `Friends notice when you begin to ${w} advanced vocabulary in daily talk.`,
  (w) => `Parents feel proud when children ${w} new words with confidence.`,
  (w) => `Every time you ${w}, your English becomes stronger and clearer.`,
  (w) => `The best way to ${w} is to read, speak, and write the word again and again.`,
];

const NOUN_TEMPLATES = [
  (w) => `Understanding ${w} helps you express yourself with precision and power.`,
  (w) => `The concept of ${w} appears in news, books, and conversations around the world.`,
  (w) => `When you master ${w}, you can discuss complex topics with ease.`,
  (w) => `Writers use ${w} to make their arguments more convincing.`,
  (w) => `Scientists and leaders rely on ${w} to explain important ideas.`,
  (w) => `Knowing ${w} sets you apart as an advanced English speaker.`,
  (w) => `You will encounter ${w} in exams, interviews, and everyday discussions.`,
  (w) => `The word ${w} is simple yet powerful when used correctly.`,
  (w) => `Practice saying ${w} aloud until it feels natural and easy.`,
  (w) => `Today, ${w} becomes one of your ten new vocabulary friends.`,
];

const ADJ_TEMPLATES = [
  (w) => `Being ${w} in your thinking helps you solve problems creatively.`,
  (w) => `A ${w} approach to learning makes every lesson more enjoyable.`,
  (w) => `Leaders who are ${w} inspire others to do their best work.`,
  (w) => `You can sound more ${w} by using words like this one daily.`,
  (w) => `Teachers admire students who are ${w} in their communication.`,
  (w) => `A ${w} mind notices details that others might miss.`,
  (w) => `Stay ${w} as you read — each word here is chosen to help you grow.`,
  (w) => `The most ${w} speakers practice vocabulary every single day.`,
  (w) => `When you feel ${w} about a word, you will use it without hesitation.`,
  (w) => `Today you become more ${w} by learning ten important new words.`,
];

function guessWordType(word) {
  if (word.endsWith('ly')) return 'adv';
  if (word.endsWith('tion') || word.endsWith('sion') || word.endsWith('ness') || word.endsWith('ity') || word.endsWith('ment')) return 'noun';
  if (word.endsWith('ive') || word.endsWith('ous') || word.endsWith('ent') || word.endsWith('ant') || word.endsWith('ful') || word.endsWith('able') || word.endsWith('ible')) return 'adj';
  return 'verb';
}

function getTemplatesForWord(word) {
  const type = guessWordType(word);
  if (type === 'noun') return NOUN_TEMPLATES;
  if (type === 'adj' || type === 'adv') return ADJ_TEMPLATES;
  return SENTENCE_TEMPLATES;
}

function buildIntro(dayData) {
  return `Welcome to Day ${dayData.day} of your WordSpark journey! Today's theme is "${dayData.theme}." ${dayData.takeaway} As you read this passage, pay attention to the highlighted words — each one appears many times so you can learn it deeply. By the end, you will know ten powerful new words that will make you a better speaker and help you understand the world around you.`;
}

function buildWordSection(wordData, dayNum) {
  const templates = getTemplatesForWord(wordData.word);
  const sentences = templates.map((fn, i) => fn(wordData.word));
  return sentences.join(' ');
}

function buildClosing(dayData) {
  const wordList = dayData.words.map((w) => w.word).join(', ');
  return `Congratulations on completing Day ${dayData.day}! You have practiced these ten advanced words: ${wordList}. ${dayData.takeaway} Keep using these words in your conversations today. Share your certificate with your parents so they can celebrate your progress. Tomorrow brings ten more words — in 100 days, you will master 1000 words and become an exceptional English speaker!`;
}

export function generatePassage(dayData) {
  const parts = [buildIntro(dayData)];

  for (const wordData of dayData.words) {
    parts.push(buildWordSection(wordData, dayData.day));
  }

  parts.push(buildClosing(dayData));

  return parts.join('\n\n');
}

export function highlightWords(text, words) {
  const wordSet = new Set(words.map((w) => w.word.toLowerCase()));
  const regex = new RegExp(`\\b(${words.map((w) => w.word).join('|')})\\b`, 'gi');

  return text.replace(regex, (match) => {
    if (wordSet.has(match.toLowerCase())) {
      return `<mark class="vocab-word" data-word="${match.toLowerCase()}">${match}</mark>`;
    }
    return match;
  });
}

export function countWordOccurrences(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  return (text.match(regex) || []).length;
}
