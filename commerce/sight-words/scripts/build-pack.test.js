import { test } from 'node:test';
import assert from 'node:assert/strict';
import { flattenWords, expectedCounts, printWord } from './dolch.mjs';
import { assertInventory, assemblePages, buildPackBuffers } from './build-pack.mjs';
import { buildPdf, Page } from './pdf.mjs';

test('commerce:sight-words inventory is the Dolch 220', () => {
  const info = assertInventory();
  assert.equal(info.words, 220);
  assert.deepEqual(info.byList, {
    'pre-primer': 40,
    primer: 52,
    'grade-1': 41,
    'grade-2': 46,
    'grade-3': 41,
  });
  assert.equal(expectedCounts().all, 220);
});

test('commerce:sight-words every entry has an original sentence containing the word', () => {
  for (const entry of flattenWords()) {
    const needle = printWord(entry.word).replace("'", "'");
    assert.ok(entry.sentence.length > 4, entry.word);
    const lower = entry.sentence.toLowerCase();
    const token = printWord(entry.word).toLowerCase();
    if (token === "don't") {
      assert.ok(lower.includes('do not') || lower.includes("don't"));
    } else {
      assert.ok(new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(entry.sentence), `${entry.word} missing from ${entry.sentence}`);
    }
  }
});

test('commerce:sight-words PDF bytes are valid and name every word', () => {
  const pages = assemblePages();
  assert.ok(pages.length > 220);
  const buf = buildPdf(pages);
  const text = buf.toString('latin1');
  assert.ok(text.startsWith('%PDF-1.4'));
  assert.ok(text.includes('%%EOF'));
  for (const entry of flattenWords()) {
    assert.ok(text.includes(`(${printWord(entry.word)})`) || text.includes(`(${entry.word})`), `pdf missing ${entry.word}`);
  }
});

test('commerce:sight-words sample is a short lead magnet', () => {
  const { sample, full } = buildPackBuffers();
  assert.ok(sample.length > 1000);
  assert.ok(full.length > sample.length);
  assert.ok(sample.toString('latin1').startsWith('%PDF-1.4'));
});

test('commerce:sight-words one-page PDF writer round-trips', () => {
  const p = new Page();
  p.text('hello', 72, 720, 12);
  const buf = buildPdf([p]);
  assert.match(buf.toString('latin1'), /hello/);
});
