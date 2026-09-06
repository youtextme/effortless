/**
 * Web Speech API — parent reader voices, teleprompter highlight, natural pace.
 */

import {
  initVoices,
  getParentReader,
  applyParentVoice,
  PARENT_RATES,
  refreshVoicePool,
  ensureVoicesReady,
  isChrome,
} from './voices.js';

let speaking = false;
let speechGeneration = 0;
let activeHighlightEl = null;
let highlightSpans = [];
let currentReader = null;
let chromeKeepAliveTimer = null;

const TELEPROMPTER_RATIO = 0.36;

export function isTTSAvailable() {
  return 'speechSynthesis' in window;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isSpeechAborted(gen) {
  return gen !== speechGeneration;
}

function setReaderForPassage(passageNum) {
  currentReader = getParentReader(passageNum);
  return currentReader;
}

export function clearHighlights(root) {
  if (root) {
    root.querySelectorAll('.speech-word-active').forEach((el) => {
      el.classList.remove('speech-word-active');
    });
    root.querySelectorAll('.speech-word').forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
  }
  if (activeHighlightEl) {
    activeHighlightEl.classList.remove('speech-word-active');
    activeHighlightEl = null;
  }
  highlightSpans = [];
}

function unwrapSpeechWords(root) {
  if (!root) return;
  root.querySelectorAll('.speech-word').forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
}

function wrapWordsInRoot(root) {
  unwrapSpeechWords(root);
  const spans = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  for (const node of textNodes) {
    const text = node.textContent;
    if (!text?.trim()) continue;
    const parts = text.split(/(\s+)/);
    const frag = document.createDocumentFragment();
    for (const part of parts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        frag.appendChild(document.createTextNode(part));
      } else {
        const span = document.createElement('span');
        span.className = 'speech-word';
        span.textContent = part;
        frag.appendChild(span);
        spans.push(span);
      }
    }
    node.parentNode.replaceChild(frag, node);
  }
  return spans;
}

function wrapSingleWordEl(el) {
  if (!el) return [];
  const text = el.textContent.trim();
  if (!text) return [];
  el.innerHTML = '';
  const span = document.createElement('span');
  span.className = 'speech-word';
  span.textContent = text;
  el.appendChild(span);
  return [span];
}

function buildSpeechText(spans) {
  return spans.map((s) => s.textContent).join(' ');
}

function setTeleprompterMode(active) {
  document.body.classList.toggle('teleprompter-active', active);
  const wrap = document.getElementById('passage-scroll-wrap');
  if (wrap) wrap.classList.toggle('teleprompter-active', active);
}

function scrollToTeleprompter(el) {
  if (!el) return;
  const sheetPanel = el.closest('.word-sheet-panel');
  if (sheetPanel) {
    const panelRect = sheetPanel.getBoundingClientRect();
    const wordRect = el.getBoundingClientRect();
    const lineY = panelRect.top + panelRect.height * TELEPROMPTER_RATIO;
    sheetPanel.scrollTop += wordRect.top - lineY;
    return;
  }
  const wordRect = el.getBoundingClientRect();
  const lineY = window.innerHeight * TELEPROMPTER_RATIO;
  window.scrollTo({ top: Math.max(0, window.scrollY + wordRect.top - lineY), behavior: 'auto' });
}

function activateWord(span) {
  if (!span) return;
  if (activeHighlightEl) activeHighlightEl.classList.remove('speech-word-active');
  span.classList.add('speech-word-active');
  activeHighlightEl = span;
  scrollToTeleprompter(span);
}

function buildWordStarts(spans) {
  const starts = [];
  let pos = 0;
  for (let i = 0; i < spans.length; i++) {
    starts.push(pos);
    pos += spans[i].textContent.length;
    if (i < spans.length - 1) pos += 1;
  }
  return starts;
}

function highlightAtCharIndex(charIndex, spans, wordStarts) {
  if (!spans.length) return;
  let idx = 0;
  for (let i = wordStarts.length - 1; i >= 0; i--) {
    if (charIndex >= wordStarts[i]) {
      idx = i;
      break;
    }
  }
  activateWord(spans[idx]);
}

function chromeResume() {
  if (!isChrome() || !isTTSAvailable()) return;
  try {
    speechSynthesis.resume();
  } catch {
    // ignore
  }
}

function startChromeKeepAlive() {
  if (!isChrome()) return;
  stopChromeKeepAlive();
  chromeKeepAliveTimer = setInterval(() => {
    if (speechSynthesis.speaking) chromeResume();
  }, 8000);
}

function stopChromeKeepAlive() {
  if (chromeKeepAliveTimer) {
    clearInterval(chromeKeepAliveTimer);
    chromeKeepAliveTimer = null;
  }
}

function queueUtterance(utterance) {
  chromeResume();
  speechSynthesis.speak(utterance);
  speaking = true;
}

function waitForUtterance(utterance) {
  return new Promise((resolve) => {
    const prevEnd = utterance.onend;
    const prevError = utterance.onerror;
    utterance.onend = (event) => {
      prevEnd?.call(utterance, event);
      resolve('end');
    };
    utterance.onerror = (event) => {
      prevError?.call(utterance, event);
      resolve('error');
    };
    queueUtterance(utterance);
  });
}

function configureUtterance(u, rate) {
  applyParentVoice(u, currentReader, rate);
}

function estimateDurationMs(text, rate) {
  const chars = Math.max(text.length, 1);
  // Empirical for Chrome English TTS at parent-reading pace.
  return chars * (82 / rate);
}

/** Chrome rarely fires word boundaries — drive highlight from elapsed time instead. */
function speakWithTimedHighlight(spans, { rate = PARENT_RATES.default } = {}) {
  return new Promise((resolve) => {
    if (!isTTSAvailable() || !spans.length) {
      resolve();
      return;
    }

    const text = buildSpeechText(spans);
    const wordStarts = buildWordStarts(spans);
    const totalChars = Math.max(text.length, 1);
    const durationMs = estimateDurationMs(text, rate);
    let rafId = null;
    let startedAt = 0;

    const stopTicker = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    };

    const tick = () => {
      const elapsed = performance.now() - startedAt;
      const progress = Math.min(1, elapsed / durationMs);
      const charIndex = Math.floor(progress * totalChars);
      highlightAtCharIndex(charIndex, spans, wordStarts);
      if (progress < 1) rafId = requestAnimationFrame(tick);
    };

    const u = new SpeechSynthesisUtterance(text);
    configureUtterance(u, rate);

    u.onstart = () => {
      startedAt = performance.now();
      if (spans[0]) activateWord(spans[0]);
      rafId = requestAnimationFrame(tick);
    };

    u.onend = () => {
      stopTicker();
      activateWord(spans[spans.length - 1]);
      if (activeHighlightEl) activeHighlightEl.classList.remove('speech-word-active');
      activeHighlightEl = null;
      resolve();
    };
    u.onerror = () => {
      stopTicker();
      resolve();
    };

    waitForUtterance(u);
  });
}

function speakWithSpans(spans, { rate = PARENT_RATES.default } = {}) {
  return new Promise((resolve) => {
    if (!isTTSAvailable() || !spans.length) {
      resolve(false);
      return;
    }

    const text = buildSpeechText(spans);
    const wordStarts = buildWordStarts(spans);
    let boundaryFired = false;

    const u = new SpeechSynthesisUtterance(text);
    configureUtterance(u, rate);

    u.onstart = () => {
      if (spans[0]) activateWord(spans[0]);
    };

    u.onboundary = (event) => {
      if (event.name === 'word' || event.charIndex >= 0) {
        boundaryFired = true;
        highlightAtCharIndex(event.charIndex, spans, wordStarts);
      }
    };

    u.onend = () => {
      if (activeHighlightEl) activeHighlightEl.classList.remove('speech-word-active');
      activeHighlightEl = null;
      resolve(boundaryFired);
    };
    u.onerror = () => resolve(boundaryFired);

    waitForUtterance(u);
  });
}

async function speakWordByWord(spans, { rate = PARENT_RATES.default } = {}) {
  for (const span of spans) {
    if (!isTTSAvailable()) break;
    activateWord(span);
    const u = new SpeechSynthesisUtterance(span.textContent);
    configureUtterance(u, rate);
    await waitForUtterance(u);
    await delay(80);
  }
  if (activeHighlightEl) activeHighlightEl.classList.remove('speech-word-active');
  activeHighlightEl = null;
}

function groupSpansBySentence(spans) {
  const groups = [];
  let current = [];
  for (const span of spans) {
    current.push(span);
    if (/[.!?]["']?$/.test(span.textContent.trim())) {
      groups.push(current);
      current = [];
    }
  }
  if (current.length) groups.push(current);
  return groups.length ? groups : [spans];
}

function chunkSpanGroups(groups, maxSpans = 40) {
  const chunks = [];
  let batch = [];
  for (const group of groups) {
    if (batch.length + group.length > maxSpans && batch.length) {
      chunks.push(batch);
      batch = [];
    }
    batch.push(...group);
    if (batch.length >= maxSpans) {
      chunks.push(batch);
      batch = [];
    }
  }
  if (batch.length) chunks.push(batch);
  return chunks;
}

async function speakInRoot(root, { rate = PARENT_RATES.default, forceWordByWord = false } = {}) {
  const spans = wrapWordsInRoot(root);
  highlightSpans = spans;
  if (!spans.length) return;

  if (forceWordByWord || spans.length <= 10) {
    await speakWordByWord(spans, { rate });
    return;
  }

  const sentences = groupSpansBySentence(spans);

  if (isChrome()) {
    // One sentence per utterance avoids Chrome's ~15s cutoff and broken boundaries.
    for (const sentenceSpans of sentences) {
      if (sentenceSpans.length <= 8) {
        await speakWordByWord(sentenceSpans, { rate });
      } else {
        await speakWithTimedHighlight(sentenceSpans, { rate });
      }
      await delay(180);
    }
    return;
  }

  const chunks = chunkSpanGroups(sentences, 35);

  for (const chunk of chunks) {
    if (chunk.length <= 10) {
      await speakWordByWord(chunk, { rate });
      continue;
    }
    const usedBoundary = await speakWithSpans(chunk, { rate });
    if (!usedBoundary) {
      await speakWithTimedHighlight(chunk, { rate });
    }
    await delay(120);
  }
}

function speakOnce(text, { rate = PARENT_RATES.default } = {}) {
  return new Promise((resolve) => {
    if (!isTTSAvailable()) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    configureUtterance(u, rate);
    u.onend = () => resolve();
    u.onerror = () => resolve();
    waitForUtterance(u);
  });
}

export function speak(text, { rate = PARENT_RATES.default, passageNum = 1, onEnd } = {}) {
  if (!isTTSAvailable()) return false;
  setReaderForPassage(passageNum);
  const u = new SpeechSynthesisUtterance(text);
  configureUtterance(u, rate);
  u.onend = onEnd;
  waitForUtterance(u);
  return true;
}

export function speakWord(word, passageNum = 1) {
  return speak(word, { rate: PARENT_RATES.word, passageNum });
}

export function speakSequence(text, onEnd) {
  return speakParts([text], { onEnd });
}

export function speakParts(parts, { rate = PARENT_RATES.default, passageNum = 1, onEnd } = {}) {
  if (!isTTSAvailable() || !parts.length) return false;
  stopSpeaking();
  setReaderForPassage(passageNum);

  let index = 0;
  const speakNext = () => {
    if (index >= parts.length) {
      speaking = false;
      onEnd?.();
      return;
    }
    const text = parts[index];
    const isWord = index === 0 && parts.length > 1 && !text.includes(' ');
    const u = new SpeechSynthesisUtterance(text);
    configureUtterance(u, isWord ? PARENT_RATES.word : rate);
    u.onend = () => {
      index += 1;
      speakNext();
    };
    waitForUtterance(u);
    speaking = true;
  };

  speakNext();
  return true;
}

export async function speakWordWithExamples(word, examples, elements, onEnd, passageNum = 1) {
  if (!isTTSAvailable()) return false;
  await ensureVoicesReady();
  stopSpeaking();
  const gen = speechGeneration;
  speaking = true;
  startChromeKeepAlive();
  setTeleprompterMode(true);
  setReaderForPassage(passageNum);

  const wordRoot = elements?.wordEl;
  const exampleRoot = elements?.container;

  clearHighlights(wordRoot);
  clearHighlights(exampleRoot);

  const wordSpans = wrapSingleWordEl(wordRoot);
  for (let i = 0; i < 2; i++) {
    await speakWordByWord(wordSpans, { rate: PARENT_RATES.word });
    if (isSpeechAborted(gen)) break;
    if (i === 0) await delay(700);
  }
  unwrapSpeechWords(wordRoot);

  if (!isSpeechAborted(gen)) {
    const lines = exampleRoot?.querySelectorAll('.example-line') || [];
    if (lines.length) {
      for (const line of lines) {
        await speakInRoot(line, { rate: PARENT_RATES.example });
        unwrapSpeechWords(line);
        if (isSpeechAborted(gen)) break;
        await delay(200);
      }
    } else {
      for (const sentence of examples.slice(0, 2)) {
        await speakOnce(sentence, { rate: PARENT_RATES.example });
        if (isSpeechAborted(gen)) break;
        await delay(200);
      }
    }
  }

  speaking = false;
  stopChromeKeepAlive();
  setTeleprompterMode(false);
  if (!isSpeechAborted(gen)) onEnd?.();
  return !isSpeechAborted(gen);
}

export async function speakLongPassage(title, paragraphs, contentRoot, titleRoot, onEnd, passageNum = 1) {
  if (!isTTSAvailable()) return false;
  await ensureVoicesReady();
  stopSpeaking();
  const gen = speechGeneration;
  speaking = true;
  startChromeKeepAlive();
  setTeleprompterMode(true);
  setReaderForPassage(passageNum);

  clearHighlights(contentRoot);
  clearHighlights(titleRoot);

  if (titleRoot && title) {
    await speakInRoot(titleRoot, { rate: PARENT_RATES.passage });
    unwrapSpeechWords(titleRoot);
    if (isSpeechAborted(gen)) {
      clearHighlights(contentRoot);
      clearHighlights(titleRoot);
      speaking = false;
      setTeleprompterMode(false);
      return false;
    }
    await delay(300);
  }

  if (contentRoot) {
    await speakInRoot(contentRoot, { rate: PARENT_RATES.passage });
    unwrapSpeechWords(contentRoot);
  } else if (!isSpeechAborted(gen)) {
    for (const chunk of paragraphs.filter(Boolean)) {
      await speakOnce(chunk, { rate: PARENT_RATES.passage });
      if (isSpeechAborted(gen)) break;
      await delay(150);
    }
  }

  clearHighlights(contentRoot);
  clearHighlights(titleRoot);
  speaking = false;
  stopChromeKeepAlive();
  setTeleprompterMode(false);
  if (!isSpeechAborted(gen)) onEnd?.();
  return !isSpeechAborted(gen);
}

export function speakPassage(text, onEnd) {
  return speakSequence(text, onEnd);
}

export function stopSpeaking() {
  speechGeneration += 1;
  stopChromeKeepAlive();
  if (isTTSAvailable()) speechSynthesis.cancel();
  speaking = false;
  setTeleprompterMode(false);
  if (activeHighlightEl) {
    activeHighlightEl.classList.remove('speech-word-active');
    activeHighlightEl = null;
  }
}

export function isSpeaking() {
  return speaking || (isTTSAvailable() && speechSynthesis.speaking);
}

export function getCurrentReader() {
  return currentReader;
}

export { refreshVoicePool, getParentReader, ensureVoicesReady };

if (typeof window !== 'undefined') {
  initVoices();
}
