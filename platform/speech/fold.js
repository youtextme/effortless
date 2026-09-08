/**
 * Visible-fold helpers — Listen starts at the top-most on-screen block.
 * Pure: inject getRect + fold so Node tests do not need a browser.
 */

export function foldViewportFromWindow(view, header) {
  let top = 0;
  const hidden = Boolean(header?.hidden)
    || (typeof header?.classList?.contains === 'function' && header.classList.contains('is-hidden'));
  if (header && !hidden && typeof header.getBoundingClientRect === 'function') {
    const r = header.getBoundingClientRect();
    if (r && Number.isFinite(r.bottom)) top = Math.max(0, r.bottom);
  }
  const bottom = Number(view?.innerHeight) || 0;
  return { top, bottom };
}

export function firstBlockInFoldIndex(blocks, getRect, fold, slop = 8) {
  if (!blocks.length) return 0;
  const top = (fold?.top || 0) + slop;
  const bottom = fold?.bottom;
  if (!Number.isFinite(bottom) || bottom <= top) return 0;

  let lastAbove = 0;
  for (let i = 0; i < blocks.length; i++) {
    let r;
    try {
      r = getRect(blocks[i]);
    } catch {
      return 0;
    }
    if (!r || !Number.isFinite(r.top) || !Number.isFinite(r.bottom)) continue;
    if (r.bottom > top && r.top < bottom) return i;
    if (r.bottom <= top) lastAbove = i;
  }
  return lastAbove;
}

export function sliceBlocksFromFold(blocks, getRect, fold, slop = 8) {
  if (!Array.isArray(blocks) || blocks.length === 0) return blocks || [];
  const start = firstBlockInFoldIndex(blocks, getRect, fold, slop);
  return blocks.slice(start);
}
