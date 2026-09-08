import test from 'node:test';
import assert from 'node:assert/strict';
import { WordSheetComponent } from './word-sheet.js';
import {
  getWordExplanation,
  explanationToSpeech,
  spokenMeaning,
  buildKidExamples,
} from '../../js/word-usage.js';
import { VOCABULARY } from '../../js/data/words.js';
import { WORD_EXPLANATIONS } from '../../js/data/word-explanations.js';
import * as bus from '../kernel/bus.js';
import { createPolicy } from '../kernel/policy.js';
import { createTelemetry } from '../kernel/telemetry.js';
import { createContext } from '../kernel/context.js';
import * as registry from '../kernel/registry.js';

function wordEntry(word, meaning, example) {
  return { word, meaning, example };
}

test('story:word-sheet-daily-use every vocab word has a simple meaning and 3 examples containing the word', () => {
  const keys = Object.keys(WORD_EXPLANATIONS);
  assert.ok(keys.length >= 700);
  for (const key of keys) {
    const row = WORD_EXPLANATIONS[key];
    assert.ok(row.simple, key);
    assert.equal(row.examples.length, 3, key);
  }
  let checked = 0;
  for (const day of VOCABULARY) {
    for (const entry of day.words) {
      const exp = getWordExplanation(entry);
      assert.equal(exp.examples.length, 3, entry.word);
      assert.ok(exp.simple && exp.simple.length > 8, entry.word);
      for (const line of exp.examples) {
        assert.ok(
          line.toLowerCase().includes(entry.word.toLowerCase()),
          `${entry.word} missing from: ${line}`,
        );
      }
      checked += 1;
    }
  }
  assert.equal(checked, 1000);
});

test('story:word-sheet-daily-use missing lookup still returns 3 kid sentences with the word', () => {
  const exp = getWordExplanation(wordEntry(
    'blorple',
    'a made-up thing you can talk about',
    'I saw a unicorn at lunch.',
  ));
  assert.equal(exp.examples.length, 3);
  assert.match(exp.simple, /blorple|made-up/i);
  for (const line of exp.examples) {
    assert.match(line, /blorple/i);
  }
  const speech = explanationToSpeech('blorple', exp);
  assert.equal(speech.examples.length, 3);
  assert.ok(speech.meaning);
});

test('spoken meaning is one plain sentence a kid can follow', () => {
  assert.equal(
    spokenMeaning('investigate', 'to look into something carefully'),
    'It means to look into something carefully.',
  );
  assert.equal(
    spokenMeaning('hypothesis', 'an educated guess to be tested'),
    'Hypothesis is an educated guess to be tested.',
  );
  assert.equal(
    spokenMeaning('analyze', 'examine in detail to understand'),
    'It means you examine in detail to understand.',
  );
  assert.match(spokenMeaning('digital', 'relating to computer technology'), /about computer technology/);
});

test('kid examples prefer daily life over adult dataset lines', () => {
  const police = buildKidExamples(wordEntry(
    'investigate',
    'to look into something carefully',
    'Police investigate crimes thoroughly.',
  ));
  assert.equal(police.length, 3);
  assert.equal(police.some((line) => /police/i.test(line)), false);
  assert.ok(police.every((line) => /investigate/i.test(line)));

  const garden = buildKidExamples(wordEntry(
    'observe',
    'to watch carefully and notice details',
    'We observe birds in the garden.',
  ));
  assert.equal(garden[0], 'We observe birds in the garden.');
});

test('story:word-sheet-daily-use sheet fills meaning and three example lines then speaks the panel', async () => {
  registry.reset();
  const ctx = createContext({
    bus,
    telemetry: createTelemetry(),
    policy: createPolicy(),
    registry,
  });
  await WordSheetComponent.init(ctx);
  const spoken = [];
  ctx.speech = {
    speakWordSheet(panel) {
      spoken.push(panel);
    },
  };
  ctx.tts = {
    stopSpeaking() {},
    clearHighlights() {},
  };

  const intro = { textContent: '', hidden: true };
  const word = { textContent: '' };
  const container = { innerHTML: '' };
  const panel = { id: 'word-sheet-panel' };
  const sheet = {
    hidden: true,
    querySelector(sel) {
      return sel === '.word-sheet-panel' ? panel : null;
    },
  };

  ctx.wordSheet.open(wordEntry(
    'analyze',
    'examine in detail to understand',
    'Scientists analyze data to find patterns.',
  ), { word, intro, container, sheet });

  assert.equal(word.textContent, 'analyze');
  assert.equal(intro.hidden, false);
  assert.match(intro.textContent, /mean/i);
  assert.equal((container.innerHTML.match(/class="example-line"/g) || []).length, 3);
  assert.match(container.innerHTML, /analyze/i);
  assert.equal(container.innerHTML.includes('Scientists'), false);
  assert.equal(sheet.hidden, false);
  assert.equal(spoken[0], panel);

  ctx.wordSheet.close({ sheet, word, container, intro });
  assert.equal(sheet.hidden, true);
  assert.equal(intro.hidden, true);
  assert.equal(intro.textContent, '');
});
