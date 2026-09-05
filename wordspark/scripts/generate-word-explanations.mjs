#!/usr/bin/env node
/**
 * Generates parent-voice word explanations — one mini-passage per word.
 * Run: node scripts/generate-word-explanations.mjs > js/data/word-explanations.js
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wordsPath = join(__dirname, '../js/data/words.js');
const src = readFileSync(wordsPath, 'utf8');

/** @type {{ word: string, meaning: string, example: string, day: number, theme: string }[]} */
const allWords = [];
const dayBlocks = src.matchAll(/"day":\s*(\d+)[\s\S]*?"theme":\s*"([^"]+)"[\s\S]*?"words":\s*\[([\s\S]*?)\]/g);
for (const block of dayBlocks) {
  const day = Number(block[1]);
  const theme = block[2];
  const wordsChunk = block[3];
  const wordEntries = wordsChunk.matchAll(
    /"word":\s*"([^"]+)"[\s\S]*?"meaning":\s*"([^"]+)"[\s\S]*?"example":\s*"([^"]+)"/g
  );
  for (const w of wordEntries) {
    allWords.push({ word: w[1], meaning: w[2], example: w[3], day, theme });
  }
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick(arr, seed) {
  return arr[seed % arr.length];
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const ADJECTIVE_WORDS = new Set(
  'curious logical rational coherent valid plausible feasible comprehensive thorough systematic methodical creative imaginative innovative original abstract symbolic resilient confident dedicated ambitious motivated determined aesthetic curious tolerant diverse prosperous sustainable empirical'.split(
    ' '
  )
);

function posKind(word, meaning) {
  const m = meaning.toLowerCase();
  const w = word.toLowerCase();
  if (m.startsWith('to ')) return 'verb';
  if (ADJECTIVE_WORDS.has(w) || w.endsWith('ous') || w.endsWith('ive') || w.endsWith('ful') || w.endsWith('ent') || w.endsWith('ant') || w.endsWith('al') || w.endsWith('ic') || w.endsWith('ly')) {
    return 'adj';
  }
  if (/^(a|an) /.test(m)) return 'noun';
  if (/^(the|an?) act of /.test(m)) return 'noun';
  // Verbs: meaning reads like an action without "to"
  if (
    /^(examine|investigate|discover|explore|observe|analyze|persuade|convey|communicate|evaluate|compare|justify|deduce|verify|uncover|probe|speculate|scrutinize|articulate|describe|interpret|negotiate|advocate|announce|clarify|elaborate|express|assert|emphasize|narrate|paraphrase|summarize|debate|assess|contrast|distinguish|critique|appraise|weigh|ascertain|discern|elucidate|postulate|surmise|contemplate|protect|adapt|reach|make|form|suggest|perceive|suppose|think|find|look|watch|travel|establish|present|share|stand|work|use|take|help|build|create|show|tell|ask|learn|teach|improve|support|encourage|inspire|motivate|resolve|process|handle|manage|lead|follow|choose|decide|consider|reflect|practice|try|test|check|prove|demonstrate|illustrate|explain|define|identify|recognize|acknowledge|accept|reject|challenge|defend|maintain|promote|develop|design|plan|organize|coordinate|facilitate|mediate|reconcile|compromise|collaborate|contribute|participate|engage|involve|include|exclude|separate|combine|connect|relate|associate|link|bind|attach|detach|remove|add|increase|decrease|reduce|expand|extend|limit|restrict|control|regulate|monitor|track|record|document|report|publish|distribute|spread|share|exchange|trade|buy|sell|invest|save|spend|earn|lose|gain|win|fail|succeed|achieve|accomplish|complete|finish|start|begin|continue|stop|pause|wait|delay|hurry|rush|slow|speed|accelerate|move|shift|change|transform|convert|turn|become|grow|shrink|rise|fall|drop|lift|raise|lower|push|pull|carry|bring|send|receive|give|offer|provide|supply|deliver|return|restore|repair|fix|break|damage|hurt|harm|heal|cure|treat|care|nurture|feed|eat|drink|sleep|rest|wake|rise|sit|stand|walk|run|jump|climb|fall|fly|swim|drive|ride|travel|visit|leave|arrive|enter|exit|open|close|shut|lock|unlock|start|end)/.test(
      m
    )
  ) {
    return 'verb';
  }
  return 'noun';
}

const INTRO_STYLES = [
  (w, m) =>
    `${capitalize(w)} — say it slowly: ${w}. It means ${m}. Parents use this word when they want you to think clearly, not just repeat what others say.`,
  (w, m) =>
    `Here is a word worth keeping: ${w}. ${capitalize(m)}. You will hear it in school, in books, and at home — and now you can use it yourself.`,
  (w, m) =>
    `Let me explain ${w}. It means ${m}. This is not a word for showing off. It is a word for saying exactly what you mean.`,
  (w, m) =>
    `${capitalize(w)}. ${capitalize(m)}. When you understand a word like this, reading stops feeling like homework and starts feeling useful.`,
];

function parentIntro(entry) {
  const h = hash(entry.word);
  return INTRO_STYLES[h % INTRO_STYLES.length](entry.word, entry.meaning);
}

const VERB_SCENES = [
  {
    title: 'After a tough match',
    story: (w) =>
      `You and your friend just lost a game. Everyone wants to blame someone. You take a breath and say you want to ${w} what really happened — not to fight, but to learn for next time.`,
    say: (w) => `"Let's ${w} the second half before we argue."`,
    note: (w) => `You sound calm and smart — like a captain, not someone making excuses.`,
  },
  {
    title: 'Homework that feels impossible',
    story: (w) =>
      `Your parent sees you stuck on a problem. Instead of shutting the book, you say you will ${w} it slowly — one step at a time.`,
    say: (w) => `"Can I ${w} this? I think I'm closer than I feel."`,
    note: () => `That one sentence tells your parent you are trying, not giving up.`,
  },
  {
    title: 'When a friend is upset',
    story: (w) =>
      `Your friend is hurt because someone was mean. You sit with them and ${w} what happened — gently, without gossip.`,
    say: (w) => `"Let's ${w} this together. You don't have to figure it out alone."`,
    note: () => `You are being a real friend: present, thoughtful, and kind.`,
  },
  {
    title: 'Before speaking in class',
    story: (w) =>
      `You are nervous about a presentation. At home, you practise how you will ${w} your main idea so classmates actually listen.`,
    say: (w) => `"I want to ${w} this clearly — not rush and mumble."`,
    note: () => `Teachers notice students who prepare their words.`,
  },
  {
    title: 'Asking your parents for something',
    story: (w) =>
      `You want permission — for coaching, a trip, or extra time on the phone. You ${w} your reasons calmly instead of begging or shouting.`,
    say: (w) => `"If I ${w} why this matters to me, will you hear me out?"`,
    note: () => `Respectful words often open doors that shouting closes.`,
  },
  {
    title: 'Helping a younger sibling',
    story: (w) =>
      `Your brother or sister does not understand a lesson. You ${w} it using an example from their own life — cricket, cartoons, whatever they care about.`,
    say: (w) => `"Let me ${w} this in a way that makes sense to you."`,
    note: () => `Teaching someone else is how you know you truly understand.`,
  },
  {
    title: 'When something feels unfair',
    story: (w) =>
      `A rule at school bothers you. Instead of complaining in the corridor, you decide to ${w} the situation — gather facts, talk to a teacher, stay polite.`,
    say: (w) => `"I'd like to ${w} this properly before I react."`,
    note: () => `That is maturity: feeling strongly and still thinking clearly.`,
  },
  {
    title: 'Planning a group project',
    story: (w) =>
      `Your group wants to copy and paste something online. You suggest you ${w} a real plan everyone can follow.`,
    say: (w) => `"Let's ${w} our approach — we still have time to do it well."`,
    note: () => `One person with good words can lift the whole team's standard.`,
  },
];

const NOUN_SCENES = [
  {
    title: 'At the dinner table',
    story: (w, meaning) =>
      `Your parent asks what you learned today. You explain ${w} — what it is (${meaning}) and why your teacher cared about it.`,
    say: (w) => `"We studied ${w} today — and it actually clicked for me."`,
    note: () => `Dinner becomes a conversation, not an interrogation.`,
  },
  {
    title: 'When the news comes on',
    story: (w) =>
      `An adult mentions something from the news. You recognise ${w} from your reading and join in — quietly confident.`,
    say: (w) => `"That's an example of ${w} — we read about that."`,
    note: () => `You are connecting school to the real world. That is rare and valuable.`,
  },
  {
    title: 'Writing it in your own notebook',
    story: (w, meaning) =>
      `You write ${w} in your notebook with a short note: ${meaning}. Weeks later you see it in a textbook and smile — you already know it.`,
    say: (w) => `"${capitalize(w)} — that's the word for what I noticed today."`,
    note: () => `Words you write yourself stick longer than words you only highlight.`,
  },
  {
    title: 'Explaining to a friend',
    story: (w, meaning) =>
      `A friend is confused in class. You use ${w} in your explanation because it captures the idea better than a vague word (${meaning}).`,
    say: (w) => `"The word you want here is ${w}."`,
    note: () => `You are helping without showing off — that is true confidence.`,
  },
  {
    title: 'In science or social studies',
    story: (w, meaning) =>
      `Your teacher says ${w}. Because you know it means ${meaning}, you follow the lesson instead of drifting off.`,
    say: (w) => `"Oh — so ${w} is…" and you finish the thought yourself.`,
    note: () => `Understanding one word can unlock an entire chapter.`,
  },
  {
    title: 'Noticing the world around you',
    story: (w) =>
      `On a walk, in a film, or in a message from a friend, you spot ${w} in real life. You point it out to someone you trust.`,
    say: (w) => `"Look — that's ${w}. We literally just read about this."`,
    note: () => `That moment — when reading meets life — is what this app is for.`,
  },
];

const ADJ_SCENES = [
  {
    title: 'Praising a friend honestly',
    story: (w) =>
      `You want to compliment a friend without sounding fake. You say they are ${w} — because they really are.`,
    say: (w) => `"You're so ${w} — you always try to understand people."`,
    note: () => `Specific praise lands deeper than "you're nice."`,
  },
  {
    title: 'Telling your parent how you feel',
    story: (w) =>
      `Your parent asks about your day. Instead of "fine," you say you felt ${w}. They understand you better immediately.`,
    say: (w) => `"I felt ${w} after the test, but I'm okay now."`,
    note: () => `Naming a feeling is the first step to handling it well.`,
  },
  {
    title: 'Describing a moment you will remember',
    story: (w) =>
      `Something happens — a comeback in sport, a kind gesture, a beautiful sky. You tell someone it was ${w}, and they see what you mean.`,
    say: (w) => `"That was really ${w}. I'll remember it."`,
    note: () => `Good words help you hold on to good memories.`,
  },
  {
    title: 'Choosing the accurate word',
    story: (w, meaning) =>
      `You could use a plain word, but ${w} is more honest (${meaning}). Accuracy builds trust — people know you mean what you say.`,
    say: (w) => `"It wasn't just hard — it was ${w}."`,
    note: () => `Precision is a sign of respect for your listener.`,
  },
  {
    title: 'Sending a thoughtful message',
    story: (w) =>
      `You text a cousin about something that happened. Using ${w} makes you sound thoughtful — like someone who notices life.`,
    say: (w) => `"Honestly, it was pretty ${w}."`,
    note: () => `Your words shape how people see you, even in a short message.`,
  },
  {
    title: 'Encouraging someone who doubts themselves',
    story: (w) =>
      `A teammate or sibling says "I can't do this." You look them in the eye and say they are more ${w} than they think.`,
    say: (w) => `"You're more ${w} than you give yourself credit for."`,
    note: () => `The right adjective at the right moment can change someone's whole day.`,
  },
];

function buildExamples(entry) {
  const { word, meaning, example } = entry;
  const h = hash(word);
  const kind = posKind(word, meaning);
  const pool = kind === 'verb' ? VERB_SCENES : kind === 'adj' ? ADJ_SCENES : NOUN_SCENES;

  const i1 = h % pool.length;
  let i2 = (h * 7 + 3) % pool.length;
  if (i2 === i1) i2 = (i1 + 1) % pool.length;

  return [pool[i1], pool[i2]].map((scene) => ({
    title: scene.title,
    story: scene.story(word, meaning, example),
    say: scene.say(word, meaning, example),
    note: scene.note(word, meaning, example),
  }));
}

const explanations = {};
for (const entry of allWords) {
  const key = entry.word.toLowerCase();
  if (explanations[key]) continue;
  explanations[key] = {
    intro: parentIntro(entry),
    examples: buildExamples(entry),
  };
}

console.log(`/** Parent-voice explanations for ${Object.keys(explanations).length} words. Generated — do not edit by hand. */`);
console.log('export const WORD_EXPLANATIONS = ' + JSON.stringify(explanations, null, 2) + ';');
