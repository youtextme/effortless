/**
 * Topic-first passages — 600+ words of real reading, 10 vocabulary words woven in once each.
 */

import { getTopicTitle } from './data/topics.js';

function weaveWord(sentence, word, slotIndex) {
  return sentence.replace(/\{\{WORD\}\}/g, `⟦${slotIndex}⟧`);
}

const COMMON_ALTERNATIVES = {
  topic: 'subject',
  technology: 'innovation',
  react: 'respond',
  label: 'tag',
  chart: 'graph',
  comment: 'remark',
  discover: 'find out',
  explore: 'look around',
  curious: 'interested',
  observe: 'watch',
  evidence: 'proof',
  influence: 'impact',
  culture: 'tradition',
  progress: 'growth',
  express: 'show',
  inspire: 'motivate',
  balance: 'harmony',
  adapt: 'adjust',
  protect: 'guard',
  citizen: 'member of society',
};

/** Keep woven slots; swap accidental duplicate vocabulary in free prose. */
function finalizeVocabSlots(body, words) {
  let out = body;
  words.forEach((w, i) => {
    out = out.replaceAll(`⟦${i}⟧`, `__SLOT${i}__`);
  });
  for (const w of words) {
    const alt = COMMON_ALTERNATIVES[w.word.toLowerCase()] || 'something';
    const re = new RegExp(`\\b${w.word}\\b`, 'gi');
    out = out.replace(re, alt);
  }
  words.forEach((w, i) => {
    out = out.replaceAll(`__SLOT${i}__`, w.word);
  });
  return out;
}

function para(text) {
  return text.trim();
}

/** Omit takeaway prose when it would repeat a vocabulary word. */
function safeTakeaway(takeaway, words) {
  for (const w of words) {
    if (new RegExp(`\\b${w.word}\\b`, 'i').test(takeaway)) return '';
  }
  return takeaway;
}

function topicIntro(day) {
  if (day <= 20) {
    return 'Science is not only in textbooks. It is in the kitchen, on the sports field, and in the questions you ask when something surprises you.';
  }
  if (day <= 40) {
    return 'The way you speak shapes how people treat your ideas. Clear words build trust; careless words can close doors before you even finish your sentence.';
  }
  if (day <= 55) {
    return 'Good thinking is a habit. It means slowing down, checking your assumptions, and being honest when you do not yet know the answer.';
  }
  if (day <= 70) {
    return 'Living things depend on one another in ways we are only beginning to understand. Reading about nature trains you to see connections everywhere.';
  }
  if (day <= 85) {
    return 'Setbacks are part of every life. What matters is not whether you fall, but whether you learn to stand again with more wisdom than before.';
  }
  return 'The world needs young people who read carefully, think clearly, and use their time to help others. That journey starts with readings like this one.';
}

/**
 * Build a substantive essay on the topic, inserting each word exactly once.
 */
export function generatePassagePages(passageData) {
  const words = passageData.words;
  const title = getTopicTitle(passageData.day);
  const intro = topicIntro(passageData.day);
  const [w0, w1, w2, w3, w4, w5, w6, w7, w8, w9] = words;

  const sections = [
    {
      h2: 'Why This Matters',
      body: para(`
        ${intro}
        When you truly understand a subject like this, you start noticing it in conversations, in the news, at school, and at home.
        Good readers do not rush. They let ideas settle. They ask themselves what the writer means, and whether it fits what they already know.
        This reading is about the subject first. If a word is highlighted, it is simply a sharper way to say something you already understand.
        Reading should feel interesting — like someone wise is explaining something you will actually use.
        If a sentence makes you pause, that pause is valuable. It means your mind is working.
        ${safeTakeaway(passageData.takeaway, words)}
      `),
    },
    {
      h2: 'Looking Closer',
      body: para(`
        ${weaveWord(`The best way to understand something difficult is to {{WORD}} it piece by piece rather than guessing.`, w0, 0)}
        Scientists, teachers, and even your friends do this when they care about getting things right.
        ${weaveWord(`Before you accept an answer, it helps to form a {{WORD}} — a clear guess you can test.`, w1, 1)}
        That guess is not the end; it is the beginning of real learning.
        ${weaveWord(`When something seems wrong or confusing, wise people {{WORD}} until the facts make sense.`, w2, 2)}
        You do not have to be afraid of not knowing. Not knowing is where learning begins.
        ${weaveWord(`Train yourself to {{WORD}} small details others skip — the tone in someone's voice, the numbers in a graph, the way a story changes.`, w3, 3)}
        Those details often hold the truth. A chart in a textbook, a comment from a coach, a headline on your phone — each is a clue.
        Learning to read clues is how ordinary students become extraordinary thinkers.
      `),
    },
    {
      h2: 'In the Real World',
      body: para(`
        ${weaveWord(`Every week, someone {{WORD}} something that changes how we live — a medicine, an innovation, a new way to grow food.`, w4, 4)}
        That is why reading about ideas matters: you are preparing to live in a world that keeps changing.
        ${weaveWord(`You do not need a laboratory to {{WORD}} a new subject, a new neighbourhood, or a hobby you have never tried.`, w5, 5)}
        That mindset matters. ${weaveWord(`Stay {{WORD}} — eager to learn — even when a subject feels hard at first.`, w6, 6)}
        ${weaveWord(`Sometimes you will notice a {{WORD}} you cannot explain: lightning before rain, a sudden silence in a crowd, a friend acting differently.`, w7, 7)}
        Naming what you see is the first step toward understanding it.
        ${weaveWord(`Strong thinkers collect {{WORD}} before they decide. Feelings matter, but facts anchor you.`, w8, 8)}
        When you read the news or hear adults argue, ask quietly: what do they know, and what are they assuming?
        That single habit will keep you ahead of people who only jump to conclusions.
      `),
    },
    {
      h2: 'Using What You Learn',
      body: para(`
        ${weaveWord(`After you read, pause and {{WORD}} what you believe now and what still puzzles you.`, w9, 9)}
        That pause is where learning becomes yours — not just words on a screen.
        Try explaining this subject to someone tonight. Use your own examples from school, sports, or family life.
        The goal is not to sound fancy. The goal is to be clear, kind, and accurate.
        When you can teach an idea simply, you truly understand it.
        What you read here will stay with you because you thought about it and connected it to your life.
        That is how reading changes people — not by memorising lists, but by shifting how you see the world.
      `),
    },
  ];

  const extra = buildTopicDepth(passageData.day, title, words);
  if (extra) sections.push(extra);

  for (const section of sections) {
    section.body = finalizeVocabSlots(section.body, words);
  }

  return { h1: title, sections };
}

function buildTopicDepth(day, title, words) {
  const themes = {
    science: `Think about how living things depend on each other. A forest, your school garden, even the soil beneath your feet — all connected. When one part suffers, others feel it. Reading about science trains you to see systems, not just isolated facts. Chlorophyll in leaves, for example, is nature's way of catching sunlight and turning it into food. That single idea explains why plants are green and why life on Earth is possible.`,
    feelings: `Everyone faces moments that sting — a harsh comment, a lost game, a friend moving away. It is completely okay to cry. Pain is real. But feelings also move like weather: intense, then softer. Understanding that helps you stay gentle with yourself while you heal. You are not weak when you feel hurt; you are human.`,
    speaking: `The way you speak can open doors or close them. People remember how you made them feel more than the exact words you used. Pausing before you answer, looking at someone when they talk, and choosing honest words — these are skills you build one conversation at a time. When you want to convince someone, respect works better than pressure.`,
    mind: `Your mind is not fixed. Every book you finish, every hard problem you sit with, every mistake you admit — these reshape you. Intelligence is not a label you are born with. It is a practice you choose daily.`,
    world: `The world is larger than any one screen or classroom. News, history, and science all try to describe the same reality from different angles. Reading widely helps you spot when someone is exaggerating, hiding facts, or telling only half the story.`,
  };

  let blurb = themes.mind;
  if (day <= 20) blurb = themes.science;
  else if (day <= 40) blurb = themes.mind;
  else if (day <= 50) blurb = themes.world;
  else if (day <= 60) blurb = themes.speaking;
  else if (day <= 70) blurb = themes.feelings;
  else if (day <= 90) blurb = themes.world;
  else blurb = themes.mind;

  return {
    h2: 'Something to Carry With You',
    body: para(`
      ${blurb}
      This subject is not homework disguised as reading. It is practice for the life you are already living.
      Notice one moment this week where this idea appears — maybe in a film, a message from a friend, or a talk with your parents.
      When you catch that moment, you will feel a small spark: I understand this. I have words for it now.
      That spark is what education is supposed to feel like.
      Keep reading. Keep connecting. Keep using what you learn to be useful, thoughtful, and brave.
    `),
  };
}

export function generatePassage(passageData) {
  const { sections } = generatePassagePages(passageData);
  return sections.map((s) => `${s.h2}\n\n${s.body}`).join('\n\n');
}

/** Highlight each vocabulary word only on its first occurrence. */
export function highlightWordsOnce(html, words) {
  const seen = new Set();
  const wordList = words.map((w) => w.word);
  const regex = new RegExp(`\\b(${wordList.join('|')})\\b`, 'gi');

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
  const raw = section.body
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join('');
  return `<h2 class="passage-h2">${section.h2}</h2>${highlightWordsOnce(raw, words)}`;
}

export function countWordOccurrences(text, word) {
  const regex = new RegExp(`\\b${word}\\b`, 'gi');
  return (text.match(regex) || []).length;
}

export function passageWordCount(sections) {
  const text = sections.map((s) => s.body).join(' ');
  return text.split(/\s+/).filter(Boolean).length;
}
