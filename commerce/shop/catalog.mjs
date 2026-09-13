/** Evening-parent catalog. Copy is data. Prices in USD cents. */
export const PERSONA = {
  id: 'maya-evening',
  name: 'Maya',
  job: 'Print one calm page tonight. Keep next week in the same shop.',
  trust: ['Free 10-page sample', 'One PDF, no Google Drive', '30-day refund', 'Human email youtextme@gmail.com'],
};

export const SKUS = [
  {
    id: 'sample',
    title: 'Free 10-page taste',
    priceCents: 0,
    gumroad: 'https://textme.gumroad.com/l/sight-words-sample',
    file: 'wordspark-sight-words-sample.pdf',
    job: 'See the page before you pay.',
    personas: ['parent', 'teacher', 'homeschool'],
    minutes: ['5'],
    grades: ['prek', 'k', 'g1'],
  },
  {
    id: 'sight-words-220',
    title: '220 Sight Words',
    priceCents: 599,
    gumroad: 'https://textme.gumroad.com/l/sight-words-220',
    file: 'wordspark-220-sight-words.pdf',
    job: 'All Dolch 220. One word, one page.',
    personas: ['parent', 'teacher', 'homeschool'],
    minutes: ['5', '15'],
    grades: ['prek', 'k', 'g1'],
  },
  {
    id: 'alphabet-trace',
    title: 'Alphabet Trace A–Z',
    priceCents: 399,
    gumroad: 'https://textme.gumroad.com/l/alphabet-trace',
    file: 'wordspark-alphabet-trace.pdf',
    job: 'One letter a night. Trace, write, find, read.',
    personas: ['parent', 'homeschool'],
    minutes: ['5'],
    grades: ['prek', 'k'],
  },
  {
    id: 'numbers-0-20',
    title: 'Numbers 0–20',
    priceCents: 399,
    gumroad: 'https://textme.gumroad.com/l/numbers-0-20',
    file: 'wordspark-numbers-0-20.pdf',
    job: 'Trace the numeral, fill a ten-frame, write it.',
    personas: ['parent', 'teacher'],
    minutes: ['5', '15'],
    grades: ['prek', 'k'],
  },
  {
    id: 'cvc-short',
    title: 'CVC Short Vowels',
    priceCents: 499,
    gumroad: 'https://textme.gumroad.com/l/cvc-short',
    file: 'wordspark-cvc-short.pdf',
    job: 'Cat, hat, sat. Blend, write, read.',
    personas: ['teacher', 'homeschool'],
    minutes: ['15'],
    grades: ['k', 'g1'],
  },
  {
    id: 'first-sentences',
    title: 'First Sentences',
    priceCents: 499,
    gumroad: 'https://textme.gumroad.com/l/first-sentences',
    file: 'wordspark-first-sentences.pdf',
    job: 'One quiet sentence after dinner.',
    personas: ['parent', 'homeschool'],
    minutes: ['5', '15'],
    grades: ['k', 'g1'],
  },
  {
    id: 'week-tracker',
    title: 'Four-week home tracker',
    priceCents: 299,
    gumroad: 'https://textme.gumroad.com/l/week-tracker',
    file: 'wordspark-week-tracker.pdf',
    job: 'Check the box. See the week. Stop arguing about homework.',
    personas: ['parent', 'teacher'],
    minutes: ['5'],
    grades: ['prek', 'k', 'g1'],
  },
  {
    id: 'after-dinner',
    title: 'After-dinner week (bundle)',
    priceCents: 1997,
    gumroad: 'https://textme.gumroad.com/l/after-dinner',
    file: 'wordspark-after-dinner-cover.pdf',
    job: 'Sight words + alphabet + numbers + CVC + sentences. Print the week.',
    personas: ['parent', 'teacher', 'homeschool'],
    minutes: ['15', '30'],
    grades: ['prek', 'k', 'g1'],
    bundleOf: ['sight-words-220', 'alphabet-trace', 'numbers-0-20', 'cvc-short', 'first-sentences'],
  },
];

export const CUSTOM = {
  email: 'youtextme@gmail.com',
  line: 'Need a class list we did not print? Email youtextme@gmail.com. 48 hours. Original pages.',
};

export const STEAL = {
  tpt11: 1100,
  tpt599: 599,
  fiveTpt: 599 * 5,
  oursBundle: 1997,
  claim: 'Five quiet PDFs for $19.97. Five TPT $5.99 packs would be $29.95. The live $11 Drive bundle is one listing — this is the week, in files you can print tonight.',
};

export function dollars(cents) {
  if (cents === 0) return 'Free';
  return `$${(cents / 100).toFixed(2)}`;
}

export function paidSkus() {
  return SKUS.filter((s) => s.priceCents > 0);
}

export function catalogIds() {
  return SKUS.map((s) => s.id);
}
