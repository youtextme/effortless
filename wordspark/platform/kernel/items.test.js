import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createItemRegistry,
  normalizeItemType,
  validateItemType,
  ITEM_TYPES,
  defaultItemIds,
} from './items.js';
import { defaultItemTypes, createChoiceType, createBlankType } from '../components/item-packs.js';

test('item types fail closed', () => {
  assert.equal(normalizeItemType('choice'), 'choice');
  assert.equal(normalizeItemType('blank'), 'blank');
  assert.equal(normalizeItemType(''), 'choice');
  assert.throws(() => normalizeItemType('drag-n-drop'), /Unknown item type/);
  assert.throws(() => validateItemType(null), /object/);
  assert.throws(() => validateItemType({ id: 'Nope' }), /kebab-case/);
  assert.throws(() => validateItemType({ id: 'choice' }), /renderHtml/);
  assert.throws(() => validateItemType({ id: 'choice', renderHtml() {} }), /grade/);
  assert.deepEqual(defaultItemIds(), ['choice', 'blank']);
  assert.equal(ITEM_TYPES.choice, 'choice');
});

test('story:question-items-are-reusable component:item choice and blank register and render', () => {
  const items = createItemRegistry();
  for (const pack of defaultItemTypes()) {
    assert.equal(items.register(pack).ok, true);
  }
  assert.deepEqual(items.list().map((t) => t.id), ['choice', 'blank']);
  const sample = {
    prompt: 'Which idea fits?',
    stem: 'The idea is ____.',
    itemType: 'choice',
    choices: [
      { text: 'ask questions', correct: true },
      { text: 'give up', correct: false },
    ],
  };
  const choiceHtml = items.renderHtml(sample);
  assert.match(choiceHtml, /data-item-type="choice"/);
  assert.match(choiceHtml, /ask questions/);
  const blankHtml = items.renderHtml({ ...sample, itemType: 'blank' });
  assert.match(blankHtml, /quiz-blank-slot/);
  assert.match(blankHtml, /quiz-chip/);
  assert.equal(items.grade(sample, { text: 'ask questions' }).correct, true);
  assert.equal(items.grade({ ...sample, itemType: 'blank' }, { text: 'give up' }).correct, false);
  assert.equal(items.health().ok, true);
});

test('story:extra-item-registers-without-quiz-fork component:item unknown types do not crash quiz', () => {
  const items = createItemRegistry();
  items.register(createChoiceType());
  items.register(createBlankType());
  const bad = items.register({
    id: 'match',
    renderHtml() { return ''; },
    grade() { return { correct: false }; },
  });
  assert.equal(bad.ok, false);
  assert.match(bad.error, /Unknown item type/);
  assert.equal(items.renderHtml({ itemType: 'nope', choices: [] }), '');
  assert.equal(items.grade({ itemType: 'nope' }, {}).ok, false);
  assert.equal(items.register(null).ok, false);
  const throwing = createItemRegistry();
  throwing.register({
    id: 'choice',
    label: 'x',
    renderHtml() { throw new Error('boom'); },
    grade() { throw new Error('boom'); },
  });
  assert.equal(throwing.renderHtml({ itemType: 'choice' }), '');
  assert.equal(throwing.grade({ itemType: 'choice' }, {}).ok, false);
});
