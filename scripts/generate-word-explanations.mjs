#!/usr/bin/env node
/**
 * Kid daily-life meaning + 3 speakable examples per word.
 * Run: node wordspark/scripts/generate-word-explanations.mjs
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VOCABULARY } from '../js/data/words.js';
import { spokenMeaning, buildKidExamples } from '../js/word-usage.js';

const here = dirname(fileURLToPath(import.meta.url));

const explanations = {};
for (const day of VOCABULARY) {
  for (const entry of day.words) {
    const key = entry.word.toLowerCase();
    if (explanations[key]) continue;
    explanations[key] = {
      simple: spokenMeaning(entry.word, entry.meaning),
      examples: buildKidExamples(entry),
    };
  }
}

const out = join(here, '../js/data/word-explanations.js');
const body = `/** Kid-plain meaning + 3 daily-life examples. Generated. */\nexport const WORD_EXPLANATIONS = ${JSON.stringify(explanations, null, 2)};\n`;
writeFileSync(out, body);
console.log(`Wrote ${Object.keys(explanations).length} word explanations to ${out}`);
