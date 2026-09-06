/**
 * Visible-text collector — spoken string is derived from what the user can see.
 */

import { speechPolicy } from './policy.js';

function winOf(el) {
  return el?.ownerDocument?.defaultView || (typeof window !== 'undefined' ? window : null);
}

export function flagsFromElement(el, style) {
  const className = typeof el.className === 'string' ? el.className : String(el.className?.baseVal || '');
  return {
    tagName: el.tagName || '',
    hidden: Boolean(el.hidden),
    ariaHidden: el.getAttribute?.('aria-hidden') === 'true',
    speechSkip: el.hasAttribute?.('data-speech-skip'),
    className,
    display: style?.display || '',
    visibility: style?.visibility || '',
    opacity: style?.opacity || '1',
  };
}

export function isSilentFromFlags(flags) {
  if (!flags) return true;
  if (speechPolicy.skipTags.includes(flags.tagName)) return true;
  if (flags.hidden || flags.ariaHidden || flags.speechSkip) return true;
  if (flags.display === 'none' || flags.visibility === 'hidden') return true;
  if (flags.opacity === '0') return true;
  const tokens = flags.className.split(/\s+/);
  if (tokens.some((t) => speechPolicy.skipClassTokens.includes(t))) return true;
  return false;
}

export function isSilentElement(el) {
  if (!el || el.nodeType !== 1) return true;
  const view = winOf(el);
  let style = null;
  try {
    style = view?.getComputedStyle?.(el);
  } catch {
    style = null;
  }
  return isSilentFromFlags(flagsFromElement(el, style));
}

function ancestorSilent(node, root) {
  let el = node.nodeType === 1 ? node : node.parentElement;
  while (el) {
    if (isSilentElement(el)) return true;
    if (el === root) break;
    el = el.parentElement;
  }
  return false;
}

export function collectVisibleTextNodes(root) {
  if (!root) return [];
  const doc = root.ownerDocument || document;
  const nodes = [];
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
      if (ancestorSilent(node, root)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let current = walker.nextNode();
  while (current) {
    nodes.push(current);
    current = walker.nextNode();
  }
  return nodes;
}

export function visiblePlainText(root) {
  return collectVisibleTextNodes(root)
    .map((n) => n.textContent.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeNode(node) {
  const raw = node.textContent;
  const parts = raw.split(/(\s+)/);
  const tokens = [];
  let offset = 0;
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      offset += part.length;
      continue;
    }
    tokens.push({ node, start: offset, end: offset + part.length, text: part });
    offset += part.length;
  }
  return tokens;
}

export function collectSpeechUnits(root) {
  const tokens = collectVisibleTextNodes(root).flatMap(tokenizeNode);
  if (!tokens.length) return [];

  const units = [];
  let current = [];
  for (const token of tokens) {
    current.push(token);
    if (/[.!?]["']?$/.test(token.text)) {
      units.push({
        text: current.map((t) => t.text).join(' '),
        tokens: current,
      });
      current = [];
    }
  }
  if (current.length) {
    units.push({
      text: current.map((t) => t.text).join(' '),
      tokens: current,
    });
  }
  return units;
}

export function coveringScoreFromFlags({ hidden = false, position = '', zIndex } = {}) {
  if (hidden) return -1;
  const z = Number.parseInt(zIndex, 10);
  const covering = position === 'fixed' || position === 'absolute' ? 1000 : 0;
  return covering + (Number.isFinite(z) ? z : 0);
}

function coveringScore(el) {
  const view = winOf(el);
  let position = '';
  let zIndex;
  try {
    const style = view?.getComputedStyle?.(el);
    position = style?.position || '';
    zIndex = style?.zIndex;
  } catch {
    position = '';
  }
  return coveringScoreFromFlags({ hidden: Boolean(el.hidden), position, zIndex });
}

export function findActiveSurface(doc = document) {
  const nodes = [...doc.querySelectorAll(speechPolicy.surfaceSelector)];
  const visible = nodes.filter((el) => {
    if (el.closest('[hidden]')) return false;
    if (isSilentElement(el)) return false;
    return true;
  });
  if (!visible.length) return null;
  visible.sort((a, b) => coveringScore(a) - coveringScore(b));
  return visible[visible.length - 1];
}
