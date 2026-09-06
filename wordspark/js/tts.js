/**
 * Web Speech API — slow rate + live word highlighting while speaking.
 */

let speaking = false;
let speechGeneration = 0;
let activeHighlightEl = null;
let highlightSpans = [];

/** Active word sits at this fraction from the top of the viewport (teleprompter line). */
const TELEPROMPTER_RATIO = 0.36;

/** 30% slower than previous defaults */
const RATE_SCALE = 0.7;
const RATE = {
  normal: 0.88 * RATE_SCALE,
  word: 0.75 * RATE_SCALE,
  passage: 0.92 * RATE_SCALE,
  example: 0.9 * RATE_SCALE,
};

export function isTTSAvailable() {
  return 'speechSynthesis' in window;
}

function getVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang.startsWith('en') && v.name.includes('Google'))
    || voices.find((v) => v.lang.startsWith('en'));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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
    const delta = wordRect.top - lineY;
    sheetPanel.scrollTop += delta;
    return;
  }

  const wordRect = el.getBoundingClientRect();
  const lineY = window.innerHeight * TELEPROMPTER_RATIO;
  const targetScroll = window.scrollY + wordRect.top - lineY;
  window.scrollTo({ top: Math.max(0, targetScroll), behavior: 'auto' });
}

function activateWord(span) {
  if (!span) return;
  if (activeHighlightEl) activeHighlightEl.classList.remove('speech-word-active');
  span.classList.add('speech-word-active');
  activeHighlightEl = span;
  scrollToTeleprompter(span);
}

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
  if (activeHighlightEl) activeHighlightEl.classList.remove('speech-word-active');
  const next = spans[idx];
  if (next) {
    next.classList.add('speech-word-active');
    activeHighlightEl = next;
    next.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function speakWithSpans(spans, { rate = RATE.normal } = {}) {
  return new Promise((resolve) => {
    if (!isTTSAvailable() || !spans.length) {
      resolve(false);
      return;
    }

    const text = buildSpeechText(spans);
    const wordStarts = buildWordStarts(spans);
    let boundaryFired = false;

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    const voice = getVoice();
    if (voice) u.voice = voice;

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

    speechSynthesis.speak(u);
    speaking = true;
  });
}

/** Fallback: speak word-by-word with highlight (short text only). */
async function speakWordByWord(spans, { rate = RATE.normal } = {}) {
  for (const span of spans) {
    if (!isTTSAvailable()) break;
    if (activeHighlightEl) activeHighlightEl.classList.remove('speech-word-active');
    span.classList.add('speech-word-active');
    activeHighlightEl = span;
    span.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

    await new Promise((resolve) => {
      const u = new SpeechSynthesisUtterance(span.textContent);
      u.lang = 'en-US';
      u.rate = rate;
      const voice = getVoice();
      if (voice) u.voice = voice;
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
    });
    await delay(80);
  }
  if (activeHighlightEl) activeHighlightEl.classList.remove('speech-word-active');
  activeHighlightEl = null;
}

async function speakInRoot(root, { rate = RATE.normal, forceWordByWord = false } = {}) {
  const spans = wrapWordsInRoot(root);
  highlightSpans = spans;
  if (!spans.length) return;

  if (forceWordByWord || spans.length <= 12) {
    await speakWordByWord(spans, { rate });
    return;
  }

  const usedBoundary = await speakWithSpans(spans, { rate });
  if (!usedBoundary) {
    speechSynthesis.cancel();
    await delay(100);
    await speakWordByWord(spans, { rate });
  }
}

function speakOnce(text, { rate = RATE.normal } = {}) {
  return new Promise((resolve) => {
    if (!isTTSAvailable()) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    const voice = getVoice();
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
    speaking = true;
  });
}

export function speak(text, { rate = RATE.normal, onEnd } = {}) {
  if (!isTTSAvailable()) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const voice = getVoice();
  if (voice) u.voice = voice;
  u.onend = onEnd;
  speechSynthesis.speak(u);
  speaking = true;
  return true;
}

export function speakWord(word) {
  return speak(word, { rate: RATE.word });
}

export function speakSequence(text, onEnd) {
  return speakParts([text], { onEnd });
}

export function speakParts(parts, { rate = RATE.normal, onEnd } = {}) {
  if (!isTTSAvailable() || !parts.length) return false;
  stopSpeaking();

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
    u.lang = 'en-US';
    u.rate = isWord ? RATE.word : rate;
    const voice = getVoice();
    if (voice) u.voice = voice;
    u.onend = () => {
      index += 1;
      speakNext();
    };
    speechSynthesis.speak(u);
    speaking = true;
  };

  speakNext();
  return true;
}

/** Pronounce word twice, then read examples with live highlight. */
export async function speakWordWithExamples(word, examples, elements, onEnd) {
  if (!isTTSAvailable()) return false;
  stopSpeaking();
  const gen = speechGeneration;
  speaking = true;

  const wordRoot = elements?.wordEl;
  const exampleRoot = elements?.container;

  clearHighlights(wordRoot);
  clearHighlights(exampleRoot);

  const wordSpans = wrapSingleWordEl(wordRoot);
  for (let i = 0; i < 2; i++) {
    await speakWordByWord(wordSpans, { rate: RATE.word });
    if (isSpeechAborted(gen)) break;
    if (i === 0) await delay(1000);
  }
  unwrapSpeechWords(wordRoot);

  if (!isSpeechAborted(gen)) {
    const lines = exampleRoot?.querySelectorAll('.example-line') || [];
    if (lines.length) {
      for (const line of lines) {
        await speakInRoot(line, { rate: RATE.example });
        unwrapSpeechWords(line);
        if (isSpeechAborted(gen)) break;
        await delay(300);
      }
    } else {
      for (const sentence of examples.slice(0, 2)) {
        await speakOnce(sentence, { rate: RATE.example });
        if (isSpeechAborted(gen)) break;
        await delay(300);
      }
    }
  }

  speaking = false;
  if (!isSpeechAborted(gen)) onEnd?.();
  return !isSpeechAborted(gen);
}

function isSpeechAborted(gen) {
  return gen !== speechGeneration;
}

/** Read full passage with highlight following the spoken word. */
export async function speakLongPassage(title, paragraphs, contentRoot, titleRoot, onEnd) {
  if (!isTTSAvailable()) return false;
  stopSpeaking();
  const gen = speechGeneration;
  speaking = true;

  clearHighlights(contentRoot);
  clearHighlights(titleRoot);

  if (titleRoot && title) {
    await speakInRoot(titleRoot, { rate: RATE.passage });
    unwrapSpeechWords(titleRoot);
    if (isSpeechAborted(gen)) {
      clearHighlights(contentRoot);
      clearHighlights(titleRoot);
      speaking = false;
      return false;
    }
    await delay(400);
  }

  if (contentRoot) {
    await speakInRoot(contentRoot, { rate: RATE.passage });
    unwrapSpeechWords(contentRoot);
  } else if (!isSpeechAborted(gen)) {
    for (const chunk of paragraphs.filter(Boolean)) {
      await speakOnce(chunk, { rate: RATE.passage });
      if (isSpeechAborted(gen)) break;
      await delay(200);
    }
  }

  clearHighlights(contentRoot);
  clearHighlights(titleRoot);
  speaking = false;
  if (!isSpeechAborted(gen)) onEnd?.();
  return !isSpeechAborted(gen);
}

export function speakPassage(text, onEnd) {
  return speakSequence(text, onEnd);
}

export function stopSpeaking() {
  speechGeneration += 1;
  if (isTTSAvailable()) speechSynthesis.cancel();
  speaking = false;
  if (activeHighlightEl) {
    activeHighlightEl.classList.remove('speech-word-active');
    activeHighlightEl = null;
  }
}

export function isSpeaking() {
  return speaking || (isTTSAvailable() && speechSynthesis.speaking);
}

if (typeof window !== 'undefined' && isTTSAvailable()) {
  speechSynthesis.getVoices();
  window.addEventListener('voiceschanged', () => speechSynthesis.getVoices());
}
