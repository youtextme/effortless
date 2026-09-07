/**
 * Speech engine — one voice, one rate, visible text only.
 * Capability-driven (paused / voiceschanged / utterance errors). No UA forks.
 */

import { speechPolicy } from './policy.js';
import { packByChars, joinPieceText, nextMaxChars, isAbortResult } from './sentences.js';
import { getSpeechRate } from './pace.js';
import {
  pickWarmMother,
  sessionProfile,
  documentLocale,
  listEnglishVoices,
} from './voice-picker.js';
import {
  collectSpeechUnits,
  findActiveSurface,
  visiblePlainText,
  isSilentElement,
} from './visible-text.js';
import {
  shouldAbortAfterAsyncWait,
  shouldStopForSurfaceChange,
  planSpeakSession,
} from './lifecycle.js';
import {
  predictedCharIndex,
  indexAtChar,
  effectiveCharsPerSecond,
  observeCharsPerSecond,
} from './word-clock.js';

const BLOCK_SELECTOR = speechPolicy.blockSelector;

let generation = 0;
let speaking = false;
let profile = null;
let voicesReady = false;
let voicesPromise = null;
let keepAliveTimer = null;
let highlightEl = null;
let unlocked = false;
let maxChars = speechPolicy.pack.initialMaxChars;
let observedCps = 0;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function synth() {
  return typeof window !== 'undefined' ? window.speechSynthesis : null;
}

export function isTTSAvailable() {
  return Boolean(synth() && typeof SpeechSynthesisUtterance !== 'undefined');
}

function allVoices() {
  return synth()?.getVoices?.() || [];
}

function readStickyUri() {
  try {
    return localStorage.getItem(speechPolicy.storageKey) || '';
  } catch {
    return '';
  }
}

function writeStickyUri(uri) {
  try {
    if (uri) localStorage.setItem(speechPolicy.storageKey, uri);
  } catch {
    /* quota / private mode */
  }
}

export function refreshProfile() {
  const locale = documentLocale();
  const english = listEnglishVoices(allVoices(), locale);
  const pool = english.length ? english : allVoices();
  const voice = pickWarmMother(pool, locale, readStickyUri());
  profile = sessionProfile(voice, locale);
  if (voice?.voiceURI) writeStickyUri(voice.voiceURI);
  voicesReady = Boolean(voice) || allVoices().length > 0;
  return profile;
}

export function ensureVoicesReady() {
  if (voicesReady && profile?.voice) return Promise.resolve(profile);
  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const finish = () => {
      refreshProfile();
      resolve(profile);
    };

    if (allVoices().length) {
      finish();
      return;
    }

    const s = synth();
    const onVoices = () => {
      s?.removeEventListener?.('voiceschanged', onVoices);
      finish();
    };
    s?.addEventListener?.('voiceschanged', onVoices);
    s?.getVoices?.();

    const deadline = Date.now() + speechPolicy.timing.voicesWaitMs;
    const poll = () => {
      if (allVoices().length) {
        s?.removeEventListener?.('voiceschanged', onVoices);
        finish();
        return;
      }
      if (Date.now() < deadline) {
        s?.getVoices?.();
        setTimeout(poll, speechPolicy.timing.voicesPollMs);
        return;
      }
      s?.removeEventListener?.('voiceschanged', onVoices);
      finish();
    };
    setTimeout(poll, speechPolicy.timing.voicesPollMs);
  });

  return voicesPromise;
}

function applyProfile(utterance) {
  if (!profile) refreshProfile();
  utterance.rate = getSpeechRate();
  utterance.pitch = speechPolicy.pitch;
  utterance.volume = speechPolicy.volume;
  utterance.lang = profile?.lang || document.documentElement?.lang || 'en-US';
  if (profile?.voice) utterance.voice = profile.voice;
}

function resumeIfPaused() {
  const s = synth();
  if (s?.paused) {
    try { s.resume(); } catch { /* ignore */ }
  }
}

function startKeepAlive() {
  stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    if (synth()?.speaking) resumeIfPaused();
  }, speechPolicy.timing.keepAliveMs);
}

function stopKeepAlive() {
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
}

async function settleCancel() {
  const s = synth();
  try { s?.cancel(); } catch { /* ignore */ }
  await delay(speechPolicy.timing.cancelSettleMs);
}

function unwrapRoot(root) {
  if (!root) return;
  root.querySelectorAll('.speech-word').forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
  root.querySelectorAll('.speech-chunk-active').forEach((el) => {
    el.classList.remove('speech-chunk-active');
  });
  root.querySelectorAll('.speech-word-active').forEach((el) => {
    el.classList.remove('speech-word-active');
  });
}

export function clearHighlights(root) {
  unwrapRoot(root || document.body);
  highlightEl = null;
}

function wrapTokens(tokens) {
  const spans = [];
  const grouped = new Map();
  for (const token of tokens) {
    if (!grouped.has(token.node)) grouped.set(token.node, []);
    grouped.get(token.node).push(token);
  }

  for (const [node, nodeTokens] of grouped) {
    if (!node.parentNode) continue;
    const text = node.textContent;
    const frag = document.createDocumentFragment();
    let cursor = 0;
    const sorted = [...nodeTokens].sort((a, b) => a.start - b.start);
    for (const token of sorted) {
      if (token.start > cursor) {
        frag.appendChild(document.createTextNode(text.slice(cursor, token.start)));
      }
      const span = document.createElement('span');
      span.className = 'speech-word';
      span.textContent = text.slice(token.start, token.end);
      frag.appendChild(span);
      spans.push(span);
      cursor = token.end;
    }
    if (cursor < text.length) {
      frag.appendChild(document.createTextNode(text.slice(cursor)));
    }
    node.parentNode.replaceChild(frag, node);
  }
  return spans;
}

function teleprompterLineRatio() {
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--speech-line');
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) && n > 0 ? n : 0.36;
}

function activateSpan(span) {
  if (!span) return;
  if (highlightEl) highlightEl.classList.remove('speech-word-active');
  span.classList.add('speech-word-active');
  highlightEl = span;
  const ratio = teleprompterLineRatio();
  const lineY = window.innerHeight * ratio;
  const sheet = span.closest('.word-sheet-panel');
  if (sheet) {
    const panelRect = sheet.getBoundingClientRect();
    const wordRect = span.getBoundingClientRect();
    sheet.scrollTop += wordRect.top - (panelRect.top + panelRect.height * ratio);
    return;
  }
  const wordRect = span.getBoundingClientRect();
  window.scrollTo({
    top: Math.max(0, window.scrollY + wordRect.top - lineY),
    behavior: 'auto',
  });
}

function markChunk(spans, on) {
  spans.forEach((s) => s.classList.toggle('speech-chunk-active', on));
}

function setTeleprompter(on) {
  document.body.classList.toggle('teleprompter-active', on);
}

function nowMs() {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

function scheduleTick(fn) {
  if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(fn);
  return setTimeout(() => fn(nowMs()), 16);
}

function cancelTick(id) {
  if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(id);
  else clearTimeout(id);
}

function paintSpokenWord(text, spans, lengths, rate, startedAt, boundaryChar, boundaryAt, hasBoundary) {
  if (!spans.length || !startedAt) return;
  const now = nowMs();
  const char = predictedCharIndex({
    elapsedMs: now - startedAt,
    rate,
    charsPerSecondAtRate1: speechPolicy.clock.charsPerSecondAtRate1,
    textLength: text.length,
    boundaryChar,
    sinceBoundaryMs: now - (boundaryAt || startedAt),
    boundaryStaleMs: speechPolicy.clock.maxBoundaryStaleMs,
    hasBoundary,
    honorRate: speechPolicy.clock.honorRate,
    observedCps,
  });
  activateSpan(spans[indexAtChar(char, lengths)]);
}

function speakUtterance(text, spans) {
  return new Promise((resolve) => {
    const s = synth();
    if (!s || !text) {
      resolve('skip');
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    applyProfile(u);
    const lengths = spans.map((span) => span.textContent.length);
    const rate = u.rate;
    let startedAt = 0;
    let boundaryChar = 0;
    let boundaryAt = 0;
    let hasBoundary = false;
    let tickId = 0;
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      cancelTick(tickId);
      if (startedAt && result === 'end') {
        observedCps = observeCharsPerSecond(
          text.length,
          nowMs() - startedAt,
          observedCps,
          speechPolicy.clock.observeSmoothing,
        );
      }
      markChunk(spans, false);
      resolve(result);
    };

    const loop = () => {
      paintSpokenWord(text, spans, lengths, rate, startedAt, boundaryChar, boundaryAt, hasBoundary);
      tickId = scheduleTick(loop);
    };

    u.onstart = () => {
      startedAt = nowMs();
      boundaryAt = startedAt;
      markChunk(spans, true);
      if (spans[0]) activateSpan(spans[0]);
      tickId = scheduleTick(loop);
    };
    u.onboundary = (event) => {
      if (!spans.length) return;
      if (event.name && event.name !== 'word' && event.charIndex < 0) return;
      const idx = typeof event.charIndex === 'number' ? event.charIndex : 0;
      if (idx >= boundaryChar) {
        boundaryChar = idx;
        boundaryAt = nowMs();
        hasBoundary = true;
      }
      paintSpokenWord(text, spans, lengths, rate, startedAt, boundaryChar, boundaryAt, hasBoundary);
    };
    u.onend = () => finish('end');
    u.onerror = (event) => finish(event?.error || 'error');

    resumeIfPaused();
    s.speak(u);
  });
}

async function unlockIfNeeded() {
  if (unlocked || !isTTSAvailable()) return;
  unlocked = true;
  const u = new SpeechSynthesisUtterance(speechPolicy.timing.iosUnlockText);
  applyProfile(u);
  u.volume = 0;
  synth().speak(u);
  await settleCancel();
}

function collectBlocks(root) {
  const found = [...root.querySelectorAll(BLOCK_SELECTOR)].filter((el) => {
    if (isSilentElement(el)) return false;
    if (!el.textContent?.trim()) return false;
    const nested = el.parentElement?.closest(BLOCK_SELECTOR);
    return !nested || nested === root;
  });
  return found.length ? found : [root];
}

async function speakBlock(block, gen) {
  const units = collectSpeechUnits(block);
  if (!units.length) return true;

  const allTokens = units.flatMap((u) => u.tokens);
  const spans = wrapTokens(allTokens);
  let offset = 0;
  const pieces = units.map((unit) => {
    const slice = spans.slice(offset, offset + unit.tokens.length);
    offset += unit.tokens.length;
    return { text: unit.text, spans: slice };
  });

  let cap = maxChars;
  let queue = packByChars(pieces, cap);

  for (let i = 0; i < queue.length; i++) {
    if (gen !== generation) {
      unwrapRoot(block);
      return false;
    }
    const batch = queue[i];
    const text = joinPieceText(batch);
    const batchSpans = batch.flatMap((p) => p.spans || []);
    const result = await speakUtterance(text, batchSpans);

    if (gen !== generation) {
      unwrapRoot(block);
      return false;
    }

    if (isAbortResult(result, speechPolicy.abortUtteranceErrors)) {
      unwrapRoot(block);
      return false;
    }

    if (result === 'error' || result === 'synthesis-failed' || result === 'network') {
      const smaller = nextMaxChars(cap, speechPolicy.pack.shrinkOnError, speechPolicy.pack.minChars);
      if (smaller < cap) {
        cap = smaller;
        maxChars = smaller;
        const remaining = queue.slice(i);
        const flat = remaining.flat();
        queue = packByChars(flat, cap);
        i = -1;
      }
    }
  }

  unwrapRoot(block);
  return gen === generation;
}

async function speakLiveRoot(root, gen) {
  const blocks = collectBlocks(root);
  for (const block of blocks) {
    if (gen !== generation) return false;
    if (shouldStopForSurfaceChange(root, findActiveSurface())) {
      stopSpeaking();
      return false;
    }
    const ok = await speakBlock(block, gen);
    if (!ok) return false;
    await new Promise((r) => scheduleTick(r));
  }
  return gen === generation;
}

function emitSpeechState() {
  window.dispatchEvent(new CustomEvent('wordspark:speech', {
    detail: { speaking: speaking || Boolean(synth()?.speaking) },
  }));
}

async function beginSession({ teleprompter }) {
  const genAtEntry = generation;
  await ensureVoicesReady();
  if (shouldAbortAfterAsyncWait(genAtEntry, generation)) {
    return { aborted: true, gen: generation };
  }
  stopSpeaking();
  const gen = generation;
  speaking = true;
  startKeepAlive();
  if (teleprompter) setTeleprompter(true);
  await unlockIfNeeded();
  if (shouldAbortAfterAsyncWait(gen, generation)) {
    return { aborted: true, gen: generation };
  }
  emitSpeechState();
  return { aborted: false, gen };
}

function endSession(gen, onEnd, ok) {
  if (gen !== generation) return false;
  speaking = false;
  stopKeepAlive();
  setTeleprompter(false);
  emitSpeechState();
  if (ok) onEnd?.();
  return ok;
}

export function isSpeaking() {
  return speaking || Boolean(synth()?.speaking);
}

export function getCurrentProfile() {
  return profile;
}

export function speakText(text, { onEnd } = {}) {
  const trimmed = String(text || '').trim();
  if (!isTTSAvailable() || !trimmed) {
    onEnd?.();
    return false;
  }
  stopSpeaking();
  speaking = true;
  const u = new SpeechSynthesisUtterance(trimmed);
  applyProfile(u);
  u.onend = () => {
    speaking = false;
    emitSpeechState();
    onEnd?.();
  };
  u.onerror = () => {
    speaking = false;
    emitSpeechState();
    onEnd?.();
  };
  resumeIfPaused();
  try {
    synth()?.speak(u);
  } catch {
    speaking = false;
    onEnd?.();
    return false;
  }
  emitSpeechState();
  return true;
}

export function stopSpeaking() {
  generation += 1;
  speaking = false;
  stopKeepAlive();
  setTeleprompter(false);
  unwrapRoot(document.body);
  highlightEl = null;
  const s = synth();
  try { s?.cancel(); } catch { /* ignore */ }
  emitSpeechState();
}

export async function speakRoot(root, { onEnd, teleprompter = true } = {}) {
  if (!isTTSAvailable() || !root) {
    onEnd?.();
    return false;
  }
  const session = await beginSession({ teleprompter });
  if (session.aborted) {
    onEnd?.();
    return false;
  }
  const gen = session.gen;
  const plan = planSpeakSession({
    generationAtStart: gen,
    generationNow: generation,
    intendedRoot: root,
    liveRoot: findActiveSurface(),
  });
  if (plan.action !== 'speak') {
    stopSpeaking();
    onEnd?.();
    return false;
  }
  const ok = await speakLiveRoot(plan.root, gen);
  return endSession(gen, onEnd, ok);
}

export async function speakActiveSurface(options = {}) {
  const root = findActiveSurface();
  return speakRoot(root, options);
}

export async function speakWordSheet(panel, onEnd) {
  if (!isTTSAvailable() || !panel) {
    onEnd?.();
    return false;
  }
  const session = await beginSession({ teleprompter: true });
  if (session.aborted) {
    onEnd?.();
    return false;
  }
  const gen = session.gen;
  const plan = planSpeakSession({
    generationAtStart: gen,
    generationNow: generation,
    intendedRoot: panel,
    liveRoot: findActiveSurface(),
  });
  if (plan.action !== 'speak') {
    stopSpeaking();
    onEnd?.();
    return false;
  }
  const lead = panel.querySelector(speechPolicy.wordSheet.leadSelector);

  if (lead && visiblePlainText(lead) && gen === generation) {
    for (let i = 0; i < speechPolicy.wordSheet.repeats; i++) {
      if (gen !== generation) break;
      await speakLiveRoot(lead, gen);
      if (i < speechPolicy.wordSheet.repeats - 1) {
        await delay(speechPolicy.timing.wordRepeatGapMs);
      }
    }
  }

  const examples = panel.querySelector('.sheet-scenarios');
  if (examples && gen === generation) {
    await speakLiveRoot(examples, gen);
  }

  return endSession(gen, onEnd, gen === generation);
}

export function visibleTextOf(root) {
  return visiblePlainText(root);
}

export function getActiveSurface() {
  return findActiveSurface();
}

if (typeof window !== 'undefined' && isTTSAvailable()) {
  ensureVoicesReady();
  window.addEventListener('voiceschanged', () => {
    voicesPromise = null;
    refreshProfile();
  });
}
