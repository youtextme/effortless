/**
 * Generates structured reading passages with H1/H2 headings, paginated sections.
 */

function guessWordType(word) {
  if (word.endsWith('ly')) return 'adv';
  if (word.endsWith('tion') || word.endsWith('sion') || word.endsWith('ness') || word.endsWith('ity') || word.endsWith('ment')) return 'noun';
  if (word.endsWith('ive') || word.endsWith('ous') || word.endsWith('ent') || word.endsWith('ant') || word.endsWith('ful') || word.endsWith('able') || word.endsWith('ible')) return 'adj';
  return 'verb';
}

function wordParagraph(wordData) {
  const w = wordData.word;
  const type = guessWordType(w);
  if (type === 'noun') {
    return `The word <strong>${w}</strong> is something you will hear in school, in books, and in real conversations. ${wordData.meaning.charAt(0).toUpperCase() + wordData.meaning.slice(1)}. When you understand ${w}, you can talk about important ideas with confidence. ${wordData.example} Great readers notice ${w} everywhere once they learn it.`;
  }
  if (type === 'adj' || type === 'adv') {
    return `Being <strong>${w}</strong> helps you in school and in life. It means: ${wordData.meaning.toLowerCase()}. ${wordData.example} People admire those who are ${w} in how they think and speak.`;
  }
  return `To <strong>${w}</strong> is a skill worth practicing every day. It means to ${wordData.meaning.toLowerCase()}. ${wordData.example} When you ${w} carefully, people trust what you say. Smart students ${w} new ideas before they form opinions.`;
}

export function generatePassagePages(passageData) {
  const words = passageData.words;
  const h1 = passageData.theme;

  const intro = {
    h2: 'Before You Read',
    body: `${passageData.takeaway} In this passage you will meet ten powerful words. Tap any highlighted word to hear it and learn how to use it with your friends and family. Take your time — there is no rush.`,
  };

  const wordGroups = [];
  for (let i = 0; i < words.length; i += 2) {
    const pair = words.slice(i, i + 2);
    const h2 = pair.map((w) => w.word).join(' & ');
    const body = pair.map(wordParagraph).join('\n\n');
    wordGroups.push({ h2, body });
  }

  const closing = {
    h2: 'What You Learned',
    body: `You have now read about ${words.map((w) => w.word).join(', ')}. Try using one of these words when you talk to someone today. The more you use them, the more they become part of how you think and speak.`,
  };

  return { h1, sections: [intro, ...wordGroups, closing] };
}

export function generatePassage(passageData) {
  const { h1, sections } = generatePassagePages(passageData);
  return sections.map((s) => `${s.h2}\n\n${s.body}`).join('\n\n');
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

export function sectionToHtml(section, words) {
  const bodyHtml = highlightWords(section.body, words)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .split('\n\n')
    .map((p) => `<p>${p}</p>`)
    .join('');
  return `<h2 class="passage-h2">${section.h2}</h2>${bodyHtml}`;
}

export function countWordOccurrences(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  return (text.match(regex) || []).length;
}
