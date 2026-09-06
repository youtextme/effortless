#!/usr/bin/env node
/**
 * Simple direct example sentences per word — no scenario wrappers.
 * Run: node scripts/generate-word-explanations.mjs > js/data/word-explanations.js
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const wordsPath = join(__dirname, '../js/data/words.js');
const src = readFileSync(wordsPath, 'utf8');

const allWords = [];
const dayBlocks = src.matchAll(/"day":\s*(\d+)[\s\S]*?"theme":\s*"([^"]+)"[\s\S]*?"words":\s*\[([\s\S]*?)\]/g);
for (const block of dayBlocks) {
  const wordEntries = block[3].matchAll(
    /"word":\s*"([^"]+)"[\s\S]*?"meaning":\s*"([^"]+)"[\s\S]*?"example":\s*"([^"]+)"/g
  );
  for (const w of wordEntries) {
    allWords.push({ word: w[1], meaning: w[2], example: w[3] });
  }
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function cleanExample(ex) {
  return ex.replace(/^"/, '').replace(/"$/, '');
}

function posKind(word, meaning) {
  const m = meaning.toLowerCase();
  const w = word.toLowerCase();
  if (m.startsWith('to ')) return 'verb';
  if (w.endsWith('ous') || w.endsWith('ive') || w.endsWith('ful') || w.endsWith('ent') || w.endsWith('ant') || w.endsWith('al') || w.endsWith('ic') || w.endsWith('ly')) return 'adj';
  if (/^(a|an) /.test(m)) return 'noun';
  if (/^(examine|investigate|discover|explore|observe|analyze|persuade|convey|communicate|evaluate|compare|justify|deduce|verify|uncover|probe|speculate|scrutinize|articulate|describe|interpret|negotiate|advocate|announce|clarify|elaborate|express|assert|emphasize|narrate|paraphrase|summarize|debate|assess|contrast|distinguish|critique|appraise|weigh|ascertain|discern|elucidate|postulate|surmise|contemplate|protect|adapt|reach|make|form|suggest|perceive|suppose|think|find|look|watch|travel|establish|present|share|stand|work|use|take|help|build|create|show|tell|ask|learn|teach|improve|support|encourage|inspire|motivate|resolve|process|handle|manage|lead|follow|choose|decide|consider|reflect|practice|try|test|check|prove|demonstrate|illustrate|explain|define|identify|recognize|acknowledge|accept|reject|challenge|defend|maintain|promote|develop|design|plan|organize)/.test(m)) {
    return 'verb';
  }
  return 'noun';
}

const VERB_LINES = [
  (w) => `Let's ${w} this carefully before we decide.`,
  (w) => `I want to ${w} what happened and learn from it.`,
  (w) => `Can we ${w} the problem step by step?`,
  (w) => `She asked me to ${w} the situation calmly.`,
  (w) => `We should ${w} the facts before arguing.`,
  (w) => `He will ${w} the topic in class tomorrow.`,
  (w) => `They need to ${w} the results properly.`,
  (w) => `I tried to ${w} the mistake and fix it.`,
];

const NOUN_LINES = [
  (w) => `The teacher explained ${w} in today's lesson.`,
  (w) => `That is a good example of ${w}.`,
  (w) => `I wrote ${w} in my notebook to remember it.`,
  (w) => `The book talks about ${w} on page twelve.`,
  (w) => `We discussed ${w} during dinner last night.`,
  (w) => `Understanding ${w} helps you see the bigger picture.`,
];

const ADJ_LINES = [
  (w) => `She gave a ${w} answer in the debate.`,
  (w) => `It was a ${w} moment I will not forget.`,
  (w) => `He stayed ${w} even when things got hard.`,
  (w) => `That was a ${w} way to handle the problem.`,
  (w) => `You sounded very ${w} when you spoke up.`,
  (w) => `A ${w} mind asks better questions.`,
];

function buildExamples(entry) {
  const { word, example } = entry;
  const h = hash(word);
  const kind = posKind(word, entry.meaning);
  const pool = kind === 'verb' ? VERB_LINES : kind === 'adj' ? ADJ_LINES : NOUN_LINES;
  const primary = cleanExample(example);
  const secondary = pool[(h * 3 + 1) % pool.length](word);
  if (primary.toLowerCase() === secondary.toLowerCase()) {
    return [primary, pool[(h * 5 + 2) % pool.length](word)];
  }
  return [primary, secondary];
}

const explanations = {};
for (const entry of allWords) {
  const key = entry.word.toLowerCase();
  if (explanations[key]) continue;
  explanations[key] = { examples: buildExamples(entry) };
}

console.log(`/** Direct example sentences for ${Object.keys(explanations).length} words. Generated. */`);
console.log('export const WORD_EXPLANATIONS = ' + JSON.stringify(explanations, null, 2) + ';');
