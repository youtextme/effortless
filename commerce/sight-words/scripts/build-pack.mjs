#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { flattenWords, LISTS, expectedCounts } from './dolch.mjs';
import { Page, buildPdf, LETTER } from './pdf.mjs';

const INK = [0.12, 0.12, 0.12];
const MUTED = 0.45;
const RULE = 0.82;
const CREAM = [0.98, 0.96, 0.93];

function allPrintWords() {
  return flattenWords().map((w) => w.print);
}

function huntRow(entry, pool) {
  const others = pool.filter((w) => w.toLowerCase() !== entry.print.toLowerCase());
  const picks = [];
  let seed = entry.print.length * 17 + entry.index * 13 + entry.listTitle.length;
  const next = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return others[seed % others.length];
  };
  picks.push(next(), next(), entry.print, next(), entry.print, next());
  return picks;
}

function coverPage() {
  const p = new Page();
  p.fill(...CREAM);
  p.rect(0, 0, LETTER.w, LETTER.h, 'f');
  p.fill(...INK);
  p.rect(54, 54, LETTER.w - 108, LETTER.h - 108, 's');
  p.text('WordSpark', 72, 680, 12, { rgb: INK });
  p.text('220 Sight Words', 72, 620, 32, { rgb: INK });
  p.text('Trace. Write. Find. Read.', 72, 572, 16, { rgb: INK });
  p.text('All Dolch lists  ·  Pre-K through Grade 3', 72, 540, 12, { gray: MUTED });
  p.text('One word on each page. Print and go.', 72, 420, 14, { rgb: INK });
  p.text('No Google Drive. No prep. One PDF.', 72, 396, 14, { rgb: INK });
  p.text('Classroom or home use. Do not resell the file.', 72, 120, 10, { gray: MUTED });
  return p;
}

function howToPage() {
  const p = new Page();
  p.text('How to use this pack', 72, 720, 20, { rgb: INK });
  const lines = [
    'Print one page. Five minutes is enough.',
    '1. Child traces the gray word with a finger, then a pencil.',
    '2. Child writes the word on the three lines.',
    '3. Child circles the word each time it appears in the hunt row.',
    '4. Child reads the sentence out loud. You may fill the blank together.',
    '',
    'Parents: one page after dinner beats a 40-page packet.',
    'Teachers: morning work, centers, homework, or sub tub.',
    '',
    'The word lists are the public Dolch 220. Sentences and layout are original.',
  ];
  lines.forEach((line, i) => p.text(line, 72, 660 - i * 22, 12, { rgb: INK }));
  return p;
}

function dividerPage(list) {
  const p = new Page();
  p.text(list.title, 72, 420, 28, { rgb: INK });
  p.text(list.grade, 72, 380, 14, { gray: MUTED });
  p.text(`${list.words.length} words  ·  one page each`, 72, 350, 12, { gray: MUTED });
  return p;
}

function wordPage(entry, pool) {
  const p = new Page();
  const header = `${entry.listTitle}  ·  ${entry.index} of ${entry.total}`;
  p.text('WordSpark Sight Words', 54, 750, 10, { gray: MUTED });
  p.text(header, 54, 734, 10, { gray: MUTED });
  p.line(54, 722, LETTER.w - 54, 722, 0.4);

  p.text(entry.print, 54, 640, 42, { rgb: INK });

  p.text('Trace', 54, 580, 11, { gray: MUTED });
  p.text(entry.print, 54, 540, 32, { gray: 0.72 });

  p.text('Write', 54, 490, 11, { gray: MUTED });
  [0, 1, 2].forEach((i) => {
    const y = 460 - i * 36;
    p.line(54, y, LETTER.w - 54, y, 0.6);
  });

  p.text('Find  ·  circle the word', 54, 340, 11, { gray: MUTED });
  const hunt = huntRow(entry, pool);
  hunt.forEach((w, i) => {
    const x = 54 + (i % 3) * 170;
    const y = 300 - Math.floor(i / 3) * 40;
    p.stroke(...INK);
    p.rect(x, y - 8, 150, 28, 's');
    p.text(w, x + 12, y, 14, { rgb: INK });
  });

  p.text('Read', 54, 200, 11, { gray: MUTED });
  const blanked = entry.sentence.replace(new RegExp(`\\b${entry.print.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'), '______');
  p.text(blanked, 54, 170, 14, { rgb: INK });
  p.line(54, 140, LETTER.w - 54, 140, 0.5);
  p.text('Write the missing word on the line.', 54, 122, 10, { gray: MUTED });

  p.text('One word. One page.', 54, 54, 9, { gray: MUTED });
  return p;
}

function trackerPages() {
  const pages = [];
  for (const list of LISTS) {
    const p = new Page();
    p.text(`Tracker  ·  ${list.title}`, 54, 740, 16, { rgb: INK });
    p.text('Check the box when the child can read the word on sight.', 54, 718, 10, { gray: MUTED });
    list.words.forEach(([word], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 54 + col * 250;
      const y = 680 - row * 22;
      p.rect(x, y - 2, 10, 10, 's');
      p.text(word === 'dont' ? "don't" : word, x + 18, y, 11, { rgb: INK });
    });
    pages.push(p);
  }
  return pages;
}

export function assemblePages(opts = {}) {
  const entries = flattenWords();
  const sampleN = opts.sampleN ?? null;
  const chosen = sampleN ? entries.slice(0, sampleN) : entries;
  const pool = allPrintWords();
  const pages = [coverPage(), howToPage()];
  const seenLists = new Set();
  for (const entry of chosen) {
    if (!seenLists.has(entry.listId)) {
      seenLists.add(entry.listId);
      const list = LISTS.find((l) => l.id === entry.listId);
      pages.push(dividerPage(list));
    }
    pages.push(wordPage(entry, pool));
  }
  if (!sampleN) pages.push(...trackerPages());
  return pages;
}

export function buildPackBuffers() {
  const full = buildPdf(assemblePages());
  const sample = buildPdf(assemblePages({ sampleN: 10 }));
  return { full, sample };
}

export function assertInventory() {
  const counts = expectedCounts();
  const flat = flattenWords();
  const byList = {};
  for (const e of flat) {
    byList[e.listId] = (byList[e.listId] || 0) + 1;
  }
  for (const [id, n] of Object.entries(counts)) {
    if (id === 'all') continue;
    if (byList[id] !== n) {
      throw new Error(`List ${id} has ${byList[id]} words, expected ${n}`);
    }
  }
  if (flat.length !== counts.all) {
    throw new Error(`Expected ${counts.all} words, got ${flat.length}`);
  }
  const unique = new Set(flat.map((e) => e.word.toLowerCase()));
  if (unique.size !== flat.length) {
    throw new Error('Duplicate Dolch words in inventory');
  }
  return { words: flat.length, byList };
}

function main() {
  assertInventory();
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const dist = join(root, 'dist');
  mkdirSync(dist, { recursive: true });
  const { full, sample } = buildPackBuffers();
  const fullPath = join(dist, 'wordspark-220-sight-words.pdf');
  const samplePath = join(dist, 'wordspark-sight-words-sample.pdf');
  writeFileSync(fullPath, full);
  writeFileSync(samplePath, sample);
  console.log(`wrote ${fullPath} (${full.length} bytes)`);
  console.log(`wrote ${samplePath} (${sample.length} bytes)`);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
