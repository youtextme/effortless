import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SKUS, catalogIds, dollars, STEAL, CUSTOM } from './catalog.mjs';
import { recommend, defaultAnswers } from './persona.mjs';
import { buildShopBuffers, CONTENT } from './scripts/build-shop.mjs';
import { uniqueReply } from './outreach/bot.mjs';

test('commerce:shop catalog is eight SKUs including the $19.97 week', () => {
  assert.equal(SKUS.length, 8);
  assert.deepEqual(catalogIds(), [
    'sample',
    'sight-words-220',
    'alphabet-trace',
    'numbers-0-20',
    'cvc-short',
    'first-sentences',
    'week-tracker',
    'after-dinner',
  ]);
  const bundle = SKUS.find((s) => s.id === 'after-dinner');
  assert.equal(bundle.priceCents, 1997);
  assert.equal(dollars(0), 'Free');
  assert.equal(dollars(599), '$5.99');
  assert.ok(STEAL.oursBundle < STEAL.fiveTpt);
  assert.match(CUSTOM.email, /youtextme@gmail.com/);
});

test('commerce:shop persona matcher routes without hiding the shelf', () => {
  const prek = recommend({ who: 'parent', minutes: '5', grade: 'prek' });
  assert.ok(['sample', 'alphabet-trace', 'week-tracker'].includes(prek.hero.id));
  assert.equal(prek.shelf.length, 8);
  const week = recommend({ who: 'parent', minutes: '30', grade: 'k' });
  assert.equal(week.hero.id, 'after-dinner');
  const g1 = recommend({ who: 'teacher', minutes: '15', grade: 'g1' });
  assert.ok(['cvc-short', 'sight-words-220', 'first-sentences'].includes(g1.hero.id));
  const d = recommend(defaultAnswers());
  assert.equal(d.shelf.length, 8);
});

test('commerce:shop original PDFs are valid and name their content', () => {
  const buffers = buildShopBuffers();
  assert.equal(Object.keys(buffers).length, 6);
  for (const [name, buf] of Object.entries(buffers)) {
    const text = buf.toString('latin1');
    assert.ok(text.startsWith('%PDF-1.4'), name);
    assert.ok(text.includes('%%EOF'), name);
    assert.equal(text.includes('Simply Kinder'), false, name);
    assert.equal(text.includes('teacherspayteachers'), false, name);
  }
  const alpha = buffers['wordspark-alphabet-trace.pdf'].toString('latin1');
  for (const [letter] of CONTENT.LETTERS) {
    assert.ok(alpha.includes(`(${letter})`), `missing ${letter}`);
  }
  const cvc = buffers['wordspark-cvc-short.pdf'].toString('latin1');
  assert.ok(cvc.includes('(cat)'));
  assert.ok(cvc.includes('(sun)'));
  const nums = buffers['wordspark-numbers-0-20.pdf'].toString('latin1');
  assert.ok(nums.includes('(0)'));
  assert.ok(nums.includes('(20)'));
});

test('commerce:shop landing lists every catalog SKU', () => {
  const html = readFileSync(new URL('../../wordspark/print-shop.html', import.meta.url), 'utf8');
  for (const id of catalogIds()) {
    assert.match(html, new RegExp(`id: '${id}'`));
  }
  assert.match(html, /textme\.gumroad\.com/);
  assert.match(html, /youtextme@gmail.com/);
});

test('commerce:shop outreach replies are unique per person', () => {
  const a = uniqueReply({
    name: 'Sam',
    ask: 'Need free sight word pages for kindergarten tonight',
    place: 'r/Teachers',
  });
  const b = uniqueReply({
    name: 'Priya',
    ask: 'Google Drive folder for Dolch is a mess, cheaper option?',
    place: 'r/homeschool',
  });
  assert.notEqual(a.body, b.body);
  assert.match(a.body, /sight-words-sample/);
  assert.match(a.body, /Sam/);
  assert.match(b.body, /Priya/);
  assert.doesNotMatch(a.body, /buy now!!!/i);
  assert.doesNotMatch(a.body, /sponsored|boost|instagram dm/i);
  assert.match(a.body, /textme\.gumroad\.com/);
});
