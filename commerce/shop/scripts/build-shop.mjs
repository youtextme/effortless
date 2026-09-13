#!/usr/bin/env node
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPdf } from '../../sight-words/scripts/pdf.mjs';
import { cover, howTo, traceWriteFindRead, numberPage, sentencePage, trackerPages } from './pages.mjs';

const LETTERS = [
  ['A', 'An ant sat.'],
  ['B', 'A big bus.'],
  ['C', 'The cat can sit.'],
  ['D', 'A dog dug.'],
  ['E', 'An egg sat.'],
  ['F', 'A fan is on.'],
  ['G', 'A goat got up.'],
  ['H', 'A hat is hot.'],
  ['I', 'I sit in it.'],
  ['J', 'A jug of jam.'],
  ['K', 'A kite is up.'],
  ['L', 'A lid is on.'],
  ['M', 'A mug is mine.'],
  ['N', 'A net is new.'],
  ['O', 'An ox is old.'],
  ['P', 'A pan is hot.'],
  ['Q', 'A quilt is on.'],
  ['R', 'A red rug.'],
  ['S', 'The sun is up.'],
  ['T', 'A top can spin.'],
  ['U', 'Sit up with us.'],
  ['V', 'A van is fast.'],
  ['W', 'A wig is wet.'],
  ['X', 'An ox is next.'],
  ['Y', 'A yak can yell.'],
  ['Z', 'A zip is on.'],
];

const CVC = [
  ['cat', 'The cat sat.'],
  ['hat', 'A hat is on.'],
  ['sat', 'We sat down.'],
  ['mat', 'Sit on the mat.'],
  ['bat', 'A bat can hit.'],
  ['rat', 'A rat ran.'],
  ['cap', 'A cap is red.'],
  ['map', 'See the map.'],
  ['tap', 'Tap the lid.'],
  ['nap', 'A short nap.'],
  ['pen', 'A pen is in the bag.'],
  ['hen', 'The hen sat.'],
  ['ten', 'I see ten.'],
  ['red', 'A red lid.'],
  ['bed', 'Sit on the bed.'],
  ['pig', 'A pig is big.'],
  ['dig', 'We can dig.'],
  ['wig', 'A wet wig.'],
  ['pin', 'A pin is in.'],
  ['tin', 'A tin can.'],
  ['dog', 'The dog ran.'],
  ['log', 'Sit on a log.'],
  ['hot', 'The pan is hot.'],
  ['pot', 'A pot is hot.'],
  ['sun', 'The sun is up.'],
  ['run', 'We can run.'],
  ['bun', 'A bun is in the pan.'],
  ['cup', 'A cup is full.'],
  ['bug', 'A bug sat.'],
  ['hug', 'A hug is kind.'],
];

const SENTENCES = [
  { line: 'I see a cat.', prompt: 'Who do you see?' },
  { line: 'The dog can run.', prompt: 'What can the dog do?' },
  { line: 'We sat on a mat.', prompt: 'Where did we sit?' },
  { line: 'A hat is red.', prompt: 'What color is the hat?' },
  { line: 'The sun is up.', prompt: 'Look out the window. Is the sun up?' },
  { line: 'I can tap a lid.', prompt: 'Tap a real lid once.' },
  { line: 'A pig is in the pen.', prompt: 'Where is the pig?' },
  { line: 'We can hug.', prompt: 'A gentle hug is enough.' },
  { line: 'The pan is hot.', prompt: 'Hot means wait. Do not touch.' },
  { line: 'I see ten.', prompt: 'Hold up ten fingers.' },
  { line: 'A bug sat on a log.', prompt: 'Draw the bug tiny.' },
  { line: 'We ran to the bus.', prompt: 'Who ran?' },
  { line: 'A cup is in the bag.', prompt: 'What is in the bag?' },
  { line: 'The hen sat on a nest.', prompt: 'Who sat?' },
  { line: 'I can sit and sip.', prompt: 'Sip water. Then read again.' },
  { line: 'A map is on the desk.', prompt: 'Where is the map?' },
  { line: 'The cat is on the mat.', prompt: 'Say cat. Say mat. They rhyme.' },
  { line: 'We can dig in the mud.', prompt: 'What can we do?' },
  { line: 'A red bus is big.', prompt: 'Is the bus big or little?' },
  { line: 'I see a wet dog.', prompt: 'Why is the dog wet? Make a guess.' },
  { line: 'The kid can hop.', prompt: 'Hop once. Then sit.' },
  { line: 'A box is on the bed.', prompt: 'What is on the bed?' },
  { line: 'We can nap.', prompt: 'Quiet voices now.' },
  { line: 'The fox can run.', prompt: 'Who can run?' },
  { line: 'I sit in the sun.', prompt: 'Is it warm or cold?' },
  { line: 'A frog sat on a log.', prompt: 'Find the two words that rhyme.' },
  { line: 'We can tug the rug.', prompt: 'Tug is a short pull.' },
  { line: 'The van is tan.', prompt: 'What color is the van?' },
  { line: 'I can pat the cat.', prompt: 'Gentle hands.' },
  { line: 'The bell can ring.', prompt: 'Listen for a real bell today.' },
];

function alphabetPages() {
  const pool = LETTERS.map(([L]) => L);
  const pages = [
    cover({
      kicker: 'Pre-K and Kindergarten',
      title: 'Alphabet Trace A-Z',
      sub: 'One letter. One page. Print tonight.',
      foot: '$3.99  ·  26 letters',
    }),
    howTo([
      'Print one letter. Five minutes is enough.',
      'Trace the gray letter. Write it three times.',
      'Circle it in the hunt row. Read the sentence.',
      'Parents: A on Monday, B on Tuesday. Stop when dinner is done.',
    ]),
  ];
  LETTERS.forEach(([letter, sentence], i) => {
    pages.push(traceWriteFindRead({
      header: `Letter ${i + 1} of 26`,
      giant: letter,
      sentence,
      pool,
    }));
  });
  return pages;
}

function numberPages() {
  const pool = Array.from({ length: 21 }, (_, i) => String(i));
  const pages = [
    cover({
      kicker: 'Pre-K and Kindergarten',
      title: 'Numbers 0-20',
      sub: 'Trace. Ten-frame. Write. Find.',
      foot: '$3.99  ·  twenty-one pages',
    }),
    howTo([
      'Print one number. Count out loud.',
      'Fill the ten-frame. Write the numeral three times.',
      'Circle the number in the hunt row.',
    ]),
  ];
  for (let n = 0; n <= 20; n += 1) pages.push(numberPage(n, pool));
  return pages;
}

function cvcPages() {
  const pool = CVC.map(([w]) => w);
  const pages = [
    cover({
      kicker: 'Kindergarten and Grade 1',
      title: 'CVC Short Vowels',
      sub: 'Blend. Write. Read. One word a night.',
      foot: '$4.99  ·  30 words',
    }),
    howTo([
      'Say the sounds. Then say the word.',
      'Trace, write, circle, read the sentence.',
      'Teachers: one family a center rotation.',
    ]),
  ];
  CVC.forEach(([word, sentence], i) => {
    pages.push(traceWriteFindRead({
      header: `Word ${i + 1} of ${CVC.length}`,
      giant: word,
      sentence,
      pool,
    }));
  });
  return pages;
}

function sentencePages() {
  const pages = [
    cover({
      kicker: 'Kindergarten',
      title: 'First Sentences',
      sub: 'One quiet sentence after dinner.',
      foot: '$4.99  ·  30 pages',
    }),
    howTo([
      'Read the sentence. Trace it. Write it.',
      'Draw a tiny picture. Read it to someone.',
      'Stop. That was the work.',
    ]),
  ];
  SENTENCES.forEach((entry, i) => pages.push(sentencePage(entry, i, SENTENCES.length)));
  return pages;
}

function trackerBook() {
  return [
    cover({
      kicker: 'Home or class',
      title: 'Four-week tracker',
      sub: 'Check the box. See the week. Then stop.',
      foot: '$2.99  ·  four weeks',
    }),
    howTo([
      'One night, one box. Sight word, letter, or number.',
      'The line is for what you printed. Keep it short.',
      'The note box is optional. Do not write a report.',
    ]),
    ...trackerPages(),
  ];
}

function bundleCover() {
  return [
    cover({
      kicker: 'The $19.97 week',
      title: 'After-dinner pack',
      sub: 'Sight words, alphabet, numbers, CVC, sentences.',
      foot: 'Five PDFs. Under two live TPT listings. Print tonight.',
    }),
    howTo([
      'This cover is the map. Download the five files in your Gumroad library.',
      'Monday sight word. Tuesday letter. Wednesday number.',
      'Thursday CVC. Friday sentence. Weekend off.',
      'Need a custom list? Email youtextme@gmail.com',
    ]),
  ];
}

export function buildShopBuffers() {
  return {
    'wordspark-alphabet-trace.pdf': buildPdf(alphabetPages()),
    'wordspark-numbers-0-20.pdf': buildPdf(numberPages()),
    'wordspark-cvc-short.pdf': buildPdf(cvcPages()),
    'wordspark-first-sentences.pdf': buildPdf(sentencePages()),
    'wordspark-week-tracker.pdf': buildPdf(trackerBook()),
    'wordspark-after-dinner-cover.pdf': buildPdf(bundleCover()),
  };
}

export const CONTENT = { LETTERS, CVC, SENTENCES };

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const dist = join(root, 'dist');
  mkdirSync(dist, { recursive: true });
  const sightDist = join(root, '..', 'sight-words', 'dist');
  const buffers = buildShopBuffers();
  for (const [name, buf] of Object.entries(buffers)) {
    writeFileSync(join(dist, name), buf);
    console.log(`wrote ${name} (${buf.length} bytes)`);
  }
  for (const name of ['wordspark-220-sight-words.pdf', 'wordspark-sight-words-sample.pdf']) {
    const src = join(sightDist, name);
    if (existsSync(src)) copyFileSync(src, join(dist, name));
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) main();
