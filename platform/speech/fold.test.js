import test from 'node:test';
import assert from 'node:assert/strict';
import { firstBlockInFoldIndex, sliceBlocksFromFold, foldViewportFromWindow } from './fold.js';

test('story:listen-from-fold first visible block is the start, later blocks stay in the queue', () => {
  const blocks = ['theme', 'title', 'p1', 'p2', 'p3'];
  const rects = {
    theme: { top: -200, bottom: -40 },
    title: { top: -40, bottom: 20 },
    p1: { top: 80, bottom: 160 },
    p2: { top: 180, bottom: 260 },
    p3: { top: 280, bottom: 360 },
  };
  const fold = { top: 0, bottom: 400 };
  const start = firstBlockInFoldIndex(blocks, (b) => rects[b], fold, 8);
  assert.equal(blocks[start], 'title');
  assert.deepEqual(sliceBlocksFromFold(blocks, (b) => rects[b], fold, 8), ['title', 'p1', 'p2', 'p3']);
});

test('story:listen-from-fold scrolled past the title starts at the on-screen paragraph', () => {
  const blocks = ['title', 'p1', 'p2'];
  const rects = {
    title: { top: -300, bottom: -20 },
    p1: { top: 40, bottom: 140 },
    p2: { top: 160, bottom: 260 },
  };
  const sliced = sliceBlocksFromFold(blocks, (b) => rects[b], { top: 56, bottom: 700 }, 8);
  assert.deepEqual(sliced, ['p1', 'p2']);
});

test('foldViewportFromWindow uses the header bottom as the fold top unless the header is hidden', () => {
  const header = {
    hidden: false,
    classList: { contains: () => false },
    getBoundingClientRect: () => ({ bottom: 64 }),
  };
  assert.deepEqual(foldViewportFromWindow({ innerHeight: 800 }, header), { top: 64, bottom: 800 });
  header.classList = { contains: (c) => c === 'is-hidden' };
  assert.equal(foldViewportFromWindow({ innerHeight: 800 }, header).top, 0);
  header.hidden = true;
  header.classList = { contains: () => false };
  assert.equal(foldViewportFromWindow({ innerHeight: 800 }, header).top, 0);
});

test('when every block has left the fold, start at the last one', () => {
  const blocks = ['a', 'b'];
  const rects = {
    a: { top: -200, bottom: -100 },
    b: { top: -80, bottom: -10 },
  };
  assert.equal(firstBlockInFoldIndex(blocks, (x) => rects[x], { top: 0, bottom: 400 }, 8), 1);
  assert.deepEqual(foldViewportFromWindow({ innerHeight: 600 }, null), { top: 0, bottom: 600 });
  assert.deepEqual(sliceBlocksFromFold(['a', 'b'], () => ({ top: 0, bottom: 10 }), { top: 0, bottom: 0 }), ['a', 'b']);
  assert.equal(firstBlockInFoldIndex(['a'], () => { throw new Error('no layout'); }, { top: 0, bottom: 100 }), 0);
  assert.deepEqual(sliceBlocksFromFold([], () => ({}), { top: 0, bottom: 100 }), []);
});
