#!/usr/bin/env node
/**
 * Emit fail-closed disk receipts for WordSpark Kindle restore (PR #22).
 * Run: node wordspark/scripts/generate-restore-proof.mjs
 */

import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { VOCABULARY, TOTAL_DAYS } from '../js/data/words.js';
import {
  TARGET_WORDS_PER_PASSAGE,
  MIN_WORD_OCCURRENCES,
  PASSAGE_WORD_MIN,
  PASSAGE_WORD_MAX,
  validatePassage,
  countWordOccurrences,
  generatePassagePages,
} from '../js/passage-generator.js';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');
const proofDir = join(repoRoot, 'docs', 'proof', 'wordspark-restore');

mkdirSync(proofDir, { recursive: true });

const baseline = {
  generatedAt: new Date().toISOString(),
  pr: 22,
  lastGoodCx: {
    teleprompterTts: {
      sha: '146fc745cb495956e4d380f602adf106359104bc',
      short: '146fc745',
      message: 'Fix Chrome read-aloud: slower pace, no double-speak, timed highlight',
      role: 'Last good teleprompter / read-aloud UX',
    },
    wordRepetitionPedagogy: {
      sha: 'e71afb0',
      message: 'Redesign: passage-first minimal UX with TTS, quiz, single menu',
      role: 'Last good word-repetition passage templates (scaled to 4×5 in this PR)',
    },
    branchSource: {
      ref: 'origin/cursor/harden-speech-listen-206f',
      role: 'Platform speech + shell imported from this branch',
    },
  },
  badBaseline: {
    deploySha: 'ab98024fdf6fc7d4a1bb27a02abb3fc5d5a71837',
    short: 'ab98024',
    sourceSha: '146fc745',
    message: 'Deploy WordSpark PWA — but passage-generator already 600w × 10 words once',
    regressionIntroducedBy: '537663f',
    regressionMessage: 'Topic-first passages — 600+ words, 10 vocabulary words woven in once each',
  },
  snackProtectLaw: {
    sha: '364e395',
    file: '.github/PAGES-DEPLOY-LAW.md',
    rsyncFilters: ["--filter 'protect snack/'", "--filter 'protect snack/***'"],
  },
};

writeFileSync(join(proofDir, 'baseline.json'), JSON.stringify(baseline, null, 2) + '\n');

const passageRows = [];
let minWc = Infinity;
let maxWc = 0;
let sumWc = 0;
const failures = [];

for (const day of VOCABULARY) {
  const result = validatePassage(day);
  const text = generatePassagePages(day).sections.map((s) => s.body).join(' ');
  const targets = result.targets.map((w) => ({
    word: w.word,
    occurrences: countWordOccurrences(text, w.word),
  }));
  minWc = Math.min(minWc, result.wordCount);
  maxWc = Math.max(maxWc, result.wordCount);
  sumWc += result.wordCount;
  if (!result.ok) failures.push({ day: day.day, issues: result.issues });
  passageRows.push({
    day: day.day,
    wordCount: result.wordCount,
    targets,
    ok: result.ok,
  });
}

const passageStats = {
  generatedAt: new Date().toISOString(),
  database: {
    path: 'wordspark/js/data/words.js',
    passageCount: VOCABULARY.length,
    totalDays: TOTAL_DAYS,
    meetsMinimum100: VOCABULARY.length >= 100,
  },
  contract: {
    targetWordsPerPassage: TARGET_WORDS_PER_PASSAGE,
    minWordOccurrences: MIN_WORD_OCCURRENCES,
    wordCountRange: [PASSAGE_WORD_MIN, PASSAGE_WORD_MAX],
  },
  aggregate: {
    passagesValidated: passageRows.length,
    failures: failures.length,
    wordCountMin: minWc,
    wordCountMax: maxWc,
    wordCountMean: Math.round(sumWc / passageRows.length),
    allPass: failures.length === 0,
  },
  sampleDay1: passageRows[0],
  failures,
};

writeFileSync(join(proofDir, 'passage-stats.json'), JSON.stringify(passageStats, null, 2) + '\n');

const pagesLaw = readFileSync(join(repoRoot, '.github', 'PAGES-DEPLOY-LAW.md'), 'utf8');
const pagesYml = readFileSync(join(repoRoot, '.github', 'workflows', 'github-pages.yml'), 'utf8');
const snackProof = {
  generatedAt: new Date().toISOString(),
  lawFile: '.github/PAGES-DEPLOY-LAW.md',
  workflowFile: '.github/workflows/github-pages.yml',
  rsyncProtectPresent: pagesYml.includes("protect snack/"),
  forceOrphanForbidden: pagesLaw.includes('Never `force_orphan`'),
  deployOrder: 'clone gh-pages → rsync snack/ → rsync wordspark/ (protect snack) → commit',
};
writeFileSync(join(proofDir, 'snack-protect.json'), JSON.stringify(snackProof, null, 2) + '\n');

const readme = `# WordSpark Kindle restore — disk receipts (PR #22)

Fail-closed proof artifacts. Regenerate:

\`\`\`bash
node wordspark/scripts/generate-restore-proof.mjs
\`\`\`

| Receipt | Absolute path | Proves |
|---------|---------------|--------|
| Baseline SHAs | \`${join(proofDir, 'baseline.json')}\` | Last-good CX commits + bad deploy SHA |
| Passage stats | \`${join(proofDir, 'passage-stats.json')}\` | 100 DB, ~400w, 4 targets ×≥5 |
| Snack protect | \`${join(proofDir, 'snack-protect.json')}\` | /snack/ rsync protect in deploy law |
| CI receipt | \`${join(proofDir, 'ci-receipt.txt')}\` | Platform CI + passage-quality tests green |

CI gate: \`.github/workflows/platform-ci.yml\` (PR + cursor/**) and \`github-pages.yml\` needs ci job.
`;
writeFileSync(join(proofDir, 'README.md'), readme);

const ciReceiptPath = join(proofDir, 'ci-receipt.txt');

function runCiAndWriteReceipt() {
  const ci = spawnSync('node', [join(repoRoot, 'platform', 'scripts', 'run-ci.mjs')], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const ciReceipt = [
    `# WordSpark restore CI receipt`,
    `generatedAt: ${new Date().toISOString()}`,
    `command: node platform/scripts/run-ci.mjs`,
    `exitCode: ${ci.status}`,
    `green: ${ci.status === 0}`,
    `testsInclude: wordspark/platform/passage/passage-quality.test.js`,
    `workflow: .github/workflows/platform-ci.yml`,
    ``,
    `--- stdout ---`,
    ci.stdout || '(empty)',
    ``,
    `--- stderr ---`,
    ci.stderr || '(empty)',
  ].join('\n');
  writeFileSync(ciReceiptPath, ciReceipt);
  return ci.status;
}

const ciExit = runCiAndWriteReceipt();

if (failures.length > 0 || ciExit !== 0) {
  console.error('Proof generation failed:', { passageFailures: failures.length, ciExit });
  process.exit(1);
}

console.log(`Proof receipts written to ${proofDir}`);
console.log(`  passages: ${passageStats.aggregate.passagesValidated} ok, wc ${minWc}–${maxWc} (mean ${passageStats.aggregate.wordCountMean})`);
console.log(`  CI exit: ${ciExit}`);
