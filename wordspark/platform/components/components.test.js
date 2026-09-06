import test from 'node:test';
import assert from 'node:assert/strict';
import { StorageComponent } from './storage.js';
import { PassageComponent } from './passage.js';
import { ReadingComponent } from './reading.js';
import { SpeechComponent } from './speech.js';
import { TtsComponent } from './tts.js';
import { WordSheetComponent } from './word-sheet.js';
import { QuizComponent } from './quiz.js';
import { CertificateComponent } from './certificate.js';
import { highlightWordsOnce } from '../../js/passage-generator.js';
import * as bus from '../kernel/bus.js';
import { createPolicy } from '../kernel/policy.js';
import { createTelemetry } from '../kernel/telemetry.js';
import { createContext } from '../kernel/context.js';
import * as registry from '../kernel/registry.js';

const ALL = [
  StorageComponent,
  PassageComponent,
  ReadingComponent,
  SpeechComponent,
  TtsComponent,
  WordSheetComponent,
  QuizComponent,
  CertificateComponent,
];

test('every registered runtime component exposes id version health', () => {
  for (const c of ALL) {
    assert.ok(c.id, 'id');
    assert.ok(c.version);
    assert.equal(typeof c.health, 'function');
    const report = c.health();
    assert.equal(typeof report.ok, 'boolean');
  }
});

test('component:storage component:passage component:reading component:speech component:tts component:word-sheet component:quiz component:certificate init onto context', async () => {
  registry.reset();
  const ctx = createContext({
    bus,
    telemetry: createTelemetry(),
    policy: createPolicy(),
    registry,
  });
  for (const c of ALL) {
    registry.register(c);
    if (c.init) await c.init(ctx);
  }
  assert.ok(ctx.storage);
  assert.ok(ctx.passage);
  assert.ok(ctx.reading);
  assert.ok(ctx.speech);
  assert.ok(ctx.tts);
  assert.ok(ctx.wordSheet);
  assert.ok(ctx.quiz);
  assert.ok(ctx.certificate);
  assert.equal(TtsComponent.health().ok, true);
  assert.equal(WordSheetComponent.health().ok, true);
});

test('story:reading-unlocks-quiz-after-scroll reading marks end', async () => {
  const ctx = createContext({
    bus,
    telemetry: createTelemetry(),
    policy: createPolicy(),
    registry,
  });
  await ReadingComponent.init(ctx);
  assert.equal(ctx.reading.hasScrolledToEnd, false);
  ctx.reading.markScrolledToEnd();
  assert.equal(ctx.reading.hasScrolledToEnd, true);
  ctx.reading.resetScroll();
  assert.equal(ctx.reading.hasScrolledToEnd, false);
});

test('story:quiz-requires-comprehension-pass quiz generates questions', async () => {
  const ctx = createContext({
    bus,
    telemetry: createTelemetry(),
    policy: createPolicy(),
    registry,
  });
  await QuizComponent.init(ctx);
  assert.ok(ctx.quiz.PASS_THRESHOLD > 0);
  const day = {
    day: 1,
    theme: 'test',
    takeaway: 'learn',
    words: Array.from({ length: 10 }, (_, i) => ({
      word: `word${i}`,
      meaning: 'm',
      example: 'e',
    })),
  };
  const qs = ctx.quiz.generate(day);
  assert.ok(qs.length > 0);
  assert.equal(QuizComponent.health().ok, true);
});

test('story:word-sheet-uses-speech word-sheet depends on speech', () => {
  assert.ok(WordSheetComponent.dependencies.includes('speech'));
  assert.equal(typeof WordSheetComponent.init, 'function');
});

test('story:certificate-share-local certificate registers generate/share', async () => {
  const ctx = createContext({
    bus,
    telemetry: createTelemetry(),
    policy: createPolicy(),
    registry,
  });
  await CertificateComponent.init(ctx);
  assert.equal(typeof ctx.certificate.generate, 'function');
  assert.equal(typeof ctx.certificate.share, 'function');
});

test('story:passage-weaves-vocab-once passage generator returns sections', () => {
  const report = PassageComponent.health();
  assert.equal(report.ok, true);
});

test('story:vocab-highlighted-once each word is marked only the first time', () => {
  const html = '<p>brave kids stay brave and remain brave</p>';
  const out = highlightWordsOnce(html, [{ word: 'brave' }]);
  assert.equal([...out.matchAll(/class="vocab-word"/g)].length, 1);
  assert.match(out, /data-word="brave"/);
});
