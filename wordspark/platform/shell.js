/**
 * WordSpark shell — platform composition root.
 * All screens orchestrated here; components accessed via ctx.
 */

import { VOCABULARY, WORDS_PER_DAY } from '../js/data/words.js';
import { getTopicTitle } from '../js/data/topics.js';
import { sectionToHtml, generatePassagePages } from '../js/passage-generator.js';
import * as bus from './kernel/bus.js';
import * as registry from './kernel/registry.js';
import { createContext } from './kernel/context.js';
import { createTelemetry } from './kernel/telemetry.js';
import { createPolicy } from './kernel/policy.js';
import { createHealth } from './kernel/health.js';
import { StorageComponent } from './components/storage.js';
import { PassageComponent } from './components/passage.js';
import { ReadingComponent } from './components/reading.js';
import { TtsComponent } from './components/tts.js';
import { SpeechComponent } from './components/speech.js';
import { WordSheetComponent } from './components/word-sheet.js';
import { QuizComponent } from './components/quiz.js';
import { CertificateComponent } from './components/certificate.js';
import { HomeComponent } from './components/home.js';
import { getPaceId, setPaceId } from './speech/pace.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

let ctx = null;
let currentPassageData = null;
let currentPassageNum = 1;
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let quizMisses = 0;
let toastTimer = null;
let wordMap = {};
let scrollObserver = null;
let currentCertificateCanvas = null;
let lastScrollY = 0;
let scrollHandler = null;
let resumeTimer = null;

const COMPONENTS = [
  StorageComponent,
  PassageComponent,
  SpeechComponent,
  TtsComponent,
  ReadingComponent,
  WordSheetComponent,
  QuizComponent,
  CertificateComponent,
  HomeComponent,
];

export async function bootShell() {
  hideModal('name-modal');
  hideModal('refresh-modal');

  const telemetry = createTelemetry();
  const policy = createPolicy();

  for (const c of COMPONENTS) registry.register(c);

  ctx = createContext({ bus, telemetry, policy, registry });
  await registry.initAll(ctx);

  const health = createHealth({
    registry,
    bus,
    recoveries: {
      tts: async () => {
        if (typeof speechSynthesis !== 'undefined') speechSynthesis.getVoices();
      },
    },
  });

  const bootHealth = await health.checkAll();
  if (!bootHealth.ok) {
    ctx.emit('app.degraded', 'shell', { reports: bootHealth.reports });
  }
  health.start(60000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      ctx.emit('health.degraded', 'shell', { component: 'service-worker' });
    });
  }

  if (ctx.speech?.ensureVoicesReady) await ctx.speech.ensureVoicesReady();
  else if (ctx.tts.ensureVoicesReady) await ctx.tts.ensureVoicesReady();

  ctx.speech?.mountListenControl($('#btn-listen'));

  setupListeners();
  const p = ctx.storage.loadProgress();
  if (!p.onboarded || !p.childName) showModal('name-modal');
  else restoreSession();

  ctx.emit('app.ready', 'shell', { components: COMPONENTS.map((c) => c.id) });
}

function showModal(id) { const el = $(`#${id}`); if (el) el.hidden = false; }
function hideModal(id) { const el = $(`#${id}`); if (el) el.hidden = true; }
function showOverlay(id) { $(`#${id}`).hidden = false; }
function hideOverlay(id) { $(`#${id}`).hidden = true; }

function setupListeners() {
  $('#btn-save-name')?.addEventListener('click', () => {
    const name = $('#child-name')?.value?.trim();
    if (!name) return;
    ctx.storage.setChildName(name);
    hideModal('name-modal');
    loadPassage(ctx.storage.getActivePassage());
  });

  $('#btn-done-reading')?.addEventListener('click', () => startQuiz());
  $('#btn-home')?.addEventListener('click', () => {
    closeWordSheet();
    ctx.tts.stopSpeaking();
    openHome();
  });
  $('#btn-home-close')?.addEventListener('click', closeHome);
  $('#btn-next-passage')?.addEventListener('click', () => {
    hideOverlay('screen-complete');
    loadPassage(ctx.storage.getActivePassage());
  });
  $('#btn-share-complete')?.addEventListener('click', handleShare);
  $('#word-sheet-backdrop')?.addEventListener('click', closeWordSheet);

  $('#btn-parent-toggle')?.addEventListener('click', () => {
    const panel = $('#parent-panel');
    panel.hidden = !panel.hidden;
    updateParentProgress();
    if (!panel.hidden) syncPaceControls();
  });

  $$('[data-pace]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      setPaceId(btn.dataset.pace);
      ctx.tts.refreshProfile?.();
      syncPaceControls();
      showToast('Speech speed updated');
    });
  });

  $$('.parent-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      $('#parent-panel').hidden = true;
      if (action === 'refresh') showModal('refresh-modal');
      else if (action === 'passages') openHome('passages');
      else if (action === 'words') openHome('words');
      else if (action === 'certificates') openPanel('panel-certificates', renderCerts);
      else if (action === 'install') handleInstall();
    });
  });

  $('#btn-confirm-refresh')?.addEventListener('click', () => {
    if (!ctx.storage.verifyRefreshPassword($('#refresh-password')?.value)) {
      showToast('Wrong password');
      return;
    }
    ctx.storage.resetProgress();
    hideModal('refresh-modal');
    $('#refresh-password').value = '';
    showModal('name-modal');
  });

  $('#btn-cancel-refresh')?.addEventListener('click', () => {
    hideModal('refresh-modal');
    $('#refresh-password').value = '';
  });

  $('#refresh-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'refresh-modal') {
      hideModal('refresh-modal');
      $('#refresh-password').value = '';
    }
  });

  $$('[data-back]').forEach((btn) => btn.addEventListener('click', closePanels));

  $$('[data-home-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      renderHomeTab(btn.dataset.homeTab);
      ctx.storage.saveResume({
        surface: 'home',
        homeTab: btn.dataset.homeTab,
        passage: currentPassageNum,
        scrollY: window.scrollY,
      });
    });
  });

  $('#btn-save-settings-name')?.addEventListener('click', saveSettingsName);
  $('#settings-child-name')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveSettingsName();
  });
  $('#btn-settings-certs')?.addEventListener('click', () => {
    openPanel('panel-certificates', renderCerts);
  });
  $('#btn-install')?.addEventListener('click', () => handleInstall());

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._deferredPrompt = e;
    updateInstallUi();
  });
  window.addEventListener('appinstalled', () => {
    window._deferredPrompt = null;
    updateInstallUi();
  });
  window.addEventListener('pagehide', flushResume);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushResume();
  });
}

function saveSettingsName() {
  const name = $('#settings-child-name')?.value?.trim();
  if (!name) return;
  ctx.storage.setChildName(name);
  showToast('Name saved');
}

function getPassageData(n) {
  return VOCABULARY.find((d) => d.day === n) || VOCABULARY[0];
}

function restoreSession() {
  const target = ctx.storage.getBootTarget();
  const passage = target.passage || ctx.storage.getActivePassage();
  if (target.surface === 'home') {
    loadPassage(passage, { scrollY: target.scrollY });
    openHome(target.homeTab);
    return;
  }
  loadPassage(passage, { scrollY: target.surface === 'quiz' ? 0 : target.scrollY });
  if (target.surface === 'quiz') {
    ctx.reading.markScrolledToEnd();
    updateFab();
    startQuiz({ index: target.quizIndex || 0 });
  }
}

function currentSurface() {
  if ($('#screen-home') && !$('#screen-home').hidden) return 'home';
  if ($('#screen-quiz') && !$('#screen-quiz').hidden) return 'quiz';
  return 'reading';
}

function scheduleResume(factory) {
  if (resumeTimer) return;
  resumeTimer = setTimeout(() => {
    resumeTimer = null;
    ctx.storage.saveResume(factory());
  }, 400);
}

function flushResume() {
  if (!ctx?.storage?.saveResume) return;
  if (resumeTimer) {
    clearTimeout(resumeTimer);
    resumeTimer = null;
  }
  const surface = currentSurface();
  if (surface === 'quiz') {
    ctx.storage.saveResume({
      passage: currentPassageNum,
      surface: 'quiz',
      quizIndex,
    });
    return;
  }
  if (surface === 'home') {
    ctx.storage.saveResume({
      passage: currentPassageNum,
      surface: 'home',
      homeTab: ctx.home.getTab(),
      scrollY: window.scrollY,
    });
    return;
  }
  ctx.storage.saveResume({
    passage: currentPassageNum,
    scrollY: window.scrollY,
    surface: 'reading',
    homeTab: ctx.home?.getTab?.() || 'passages',
  });
}

function loadPassage(n, options = {}) {
  hideToast();
  closeWordSheet();
  ctx.tts.stopSpeaking();
  ctx.tts.clearHighlights($('#passage-content'));
  ctx.tts.clearHighlights($('#passage-title'));
  currentPassageNum = n;
  currentPassageData = getPassageData(n);
  ctx.reading.resetScroll();

  wordMap = {};
  currentPassageData.words.forEach((w) => { wordMap[w.word.toLowerCase()] = w; });

  const { h1, sections } = generatePassagePages(currentPassageData);
  $('#passage-theme').textContent = currentPassageData.theme || '';
  $('#passage-title').textContent = h1;
  $('#passage-content').innerHTML = sections
    .map((s) => sectionToHtml(s, currentPassageData.words))
    .join('');

  $('#passage-scroll-wrap')?.classList.remove('at-end');

  setupWordTaps();
  setupScrollUnlock();
  setupReadingChrome();
  ctx.storage.setReadingPassage(n);
  const scrollY = Math.max(0, Number(options.scrollY) || 0);
  window.scrollTo(0, scrollY);
  lastScrollY = scrollY;
  updateReadingHeader(scrollY);
  ctx.storage.saveResume({
    passage: n,
    scrollY,
    surface: 'reading',
    quizIndex: 0,
  });
  updateParentProgress();
  updateFab();
  ctx.emit('reading.loaded', 'reading', { passage: n, title: h1 });
}

function setupReadingChrome() {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler, { passive: true });
  }

  scrollHandler = () => {
    const y = window.scrollY;
    updateReadingHeader(y);
    updateScrollFade();
    lastScrollY = y;
    if (currentSurface() === 'reading') {
      scheduleResume(() => ({
        passage: currentPassageNum,
        scrollY: window.scrollY,
        surface: 'reading',
      }));
    }
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });
  updateScrollFade();
}

function updateReadingHeader(y) {
  const header = $('#reading-header');
  if (!header) return;

  if (y < 24) {
    header.classList.remove('is-hidden');
    return;
  }

  if (y > lastScrollY + 4) {
    header.classList.add('is-hidden');
  } else if (y < lastScrollY - 4) {
    header.classList.remove('is-hidden');
  }
}

function updateScrollFade() {
  const wrap = $('#passage-scroll-wrap');
  if (!wrap) return;

  const docH = document.documentElement.scrollHeight;
  const winH = window.innerHeight;
  const nearEnd = window.scrollY + winH >= docH - 48;

  wrap.classList.toggle('at-end', nearEnd || docH <= winH + 40);
}

function setupScrollUnlock() {
  if (scrollObserver) scrollObserver.disconnect();
  const sentinel = $('#scroll-sentinel');
  if (!sentinel) return;

  scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting) {
      ctx.reading.markScrolledToEnd();
      updateFab();
      updateScrollFade();
    }
  }, { root: null, threshold: 0.5 });
  scrollObserver.observe(sentinel);

  requestAnimationFrame(() => {
    if (document.documentElement.scrollHeight <= window.innerHeight + 40) {
      ctx.reading.markScrolledToEnd();
      updateFab();
    }
  });
}

function updateFab() {
  const fab = $('#btn-done-reading');
  if (fab) fab.disabled = !ctx.reading.hasScrolledToEnd;
}

function setupWordTaps() {
  $$('.vocab-word').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const data = wordMap[el.dataset.word];
      if (data) openWordSheet(data);
    });
  });
}

function openWordSheet(data) {
  ctx.wordSheet.open(data, {
    word: $('#sheet-word'),
    intro: $('#sheet-intro'),
    container: $('#sheet-scenarios'),
    sheet: $('#word-sheet'),
    passageNum: currentPassageNum,
  });
}

function closeWordSheet() {
  ctx.wordSheet.close({
    sheet: $('#word-sheet'),
    word: $('#sheet-word'),
    intro: $('#sheet-intro'),
    container: $('#sheet-scenarios'),
  });
}

function startQuiz(options = {}) {
  if (!ctx.reading.hasScrolledToEnd) return;
  hideToast();
  closeWordSheet();
  ctx.tts.stopSpeaking();
  quizQuestions = ctx.quiz.generate(currentPassageData);
  const rawIndex = Number.isFinite(options?.index) ? options.index : 0;
  quizIndex = Math.max(0, Math.min(rawIndex, Math.max(0, quizQuestions.length - 1)));
  quizScore = 0;
  quizMisses = 0;
  showOverlay('screen-quiz');
  ctx.storage.saveResume({
    passage: currentPassageNum,
    surface: 'quiz',
    quizIndex,
  });
  renderQuestion();
  ctx.emit('quiz.started', 'quiz', { count: quizQuestions.length, index: quizIndex });
}

function hideQuizCoach() {
  const el = $('#quiz-coach');
  if (el) el.hidden = true;
  const text = $('#quiz-coach-text');
  if (text) text.textContent = '';
}

function showQuizCoach(message) {
  const text = $('#quiz-coach-text');
  const el = $('#quiz-coach');
  if (text) text.textContent = message;
  if (el) el.hidden = false;
  if (message) ctx.tts.speakSequence?.(message);
}

function renderQuestion() {
  const q = quizQuestions[quizIndex];
  quizMisses = 0;
  ctx.tts.stopSpeaking();
  hideQuizCoach();
  $('#quiz-progress-bar').style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
  $('#quiz-counter').textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  $('#quiz-question').textContent = q.prompt;
  $('#quiz-choices').innerHTML = q.choices
    .map((c) => `<button class="quiz-choice" data-correct="${c.correct}">${c.text}</button>`)
    .join('');
  $$('.quiz-choice').forEach((btn) => btn.addEventListener('click', () => handleAnswer(btn)));
  ctx.storage.saveResume({
    passage: currentPassageNum,
    surface: 'quiz',
    quizIndex,
  });
}

function handleAnswer(btn) {
  if (btn.disabled) return;
  const correct = btn.dataset.correct === 'true';
  ctx.tts.stopSpeaking();

  if (correct) {
    $$('.quiz-choice').forEach((b) => {
      b.disabled = true;
      if (b.dataset.correct === 'true') b.classList.add('correct');
    });
    quizScore++;
    ctx.emit('quiz.answered', 'quiz', { index: quizIndex, correct: true, misses: quizMisses });
    hideQuizCoach();
    setTimeout(() => {
      quizIndex++;
      if (quizIndex < quizQuestions.length) renderQuestion();
      else finishQuiz();
    }, 500);
    return;
  }

  quizMisses += 1;
  btn.classList.add('wrong');
  btn.disabled = true;
  ctx.emit('quiz.answered', 'quiz', { index: quizIndex, correct: false, misses: quizMisses });
  const q = quizQuestions[quizIndex];
  const message = ctx.quiz.coachMessage(q, quizMisses);
  showQuizCoach(message);
}

function finishQuiz() {
  hideToast();
  ctx.tts.stopSpeaking();
  hideOverlay('screen-quiz');
  const total = quizQuestions.length;
  ctx.emit('quiz.completed', 'quiz', { score: quizScore, total, passed: true });
  const p = ctx.storage.completePassage(currentPassageNum, WORDS_PER_DAY);
  showCertificateScreen(p);
  updateParentProgress();
}

async function showCertificateScreen(progress) {
  const p = ctx.storage.loadProgress();
  const topic = getTopicTitle(currentPassageNum);
  const canvas = await ctx.certificate.generate({
    childName: p.childName,
    dayData: { ...currentPassageData, theme: topic },
    progress: { ...progress, totalWordsLearned: progress.totalWordsLearned },
  });
  currentCertificateCanvas = canvas;
  canvas.className = 'cert-preview-canvas';
  const holder = $('#cert-preview');
  holder.innerHTML = '';
  holder.appendChild(canvas);
  $('#complete-msg').textContent = `You completed "${topic}".`;
  showOverlay('screen-complete');
  ctx.emit('certificate.generated', 'certificate', { passage: currentPassageNum });
}

async function handleShare() {
  if (!currentCertificateCanvas) {
    const p = ctx.storage.loadProgress();
    currentCertificateCanvas = await ctx.certificate.generate({
      childName: p.childName,
      dayData: { ...currentPassageData, theme: getTopicTitle(currentPassageNum) },
      progress: p,
    });
  }
  await ctx.certificate.share(currentCertificateCanvas, {
    ...currentPassageData,
    theme: getTopicTitle(currentPassageNum),
  });
  ctx.emit('certificate.shared', 'certificate', { passage: currentPassageNum });
}

function updateParentProgress() {
  const p = ctx.storage.loadProgress();
  $('#parent-progress').textContent =
    `${p.completedPassages.length}/100 topics · ${p.totalWordsLearned}/1000 words`;
  syncPaceControls();
}

function syncPaceControls() {
  const id = getPaceId();
  $$('[data-pace]').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.pace === id);
  });
  const voiceName = ctx?.tts?.getActiveVoiceName?.() || '';
  const voiceCopy = voiceName && voiceName !== 'default'
    ? `Voice on this device: ${voiceName}`
    : 'Voice: best available on this device';
  $$('#parent-voice-name, #settings-voice-name').forEach((voiceEl) => {
    voiceEl.textContent = voiceCopy;
  });
}

function openHome(tab) {
  hideToast();
  closeWordSheet();
  ctx.tts.stopSpeaking();
  hideOverlay('screen-quiz');
  hideOverlay('screen-complete');
  const next = ctx.home.setTab(tab || ctx.home.getTab());
  showOverlay('screen-home');
  renderHomeTab(next);
  ctx.storage.saveResume({
    passage: currentPassageNum,
    surface: 'home',
    homeTab: next,
    scrollY: window.scrollY,
  });
}

function closeHome() {
  hideOverlay('screen-home');
  ctx.tts.stopSpeaking();
  ctx.storage.saveResume({
    passage: currentPassageNum,
    surface: 'reading',
    scrollY: window.scrollY,
    homeTab: ctx.home.getTab(),
  });
}

function renderHomeTab(tab) {
  const id = ctx.home.setTab(tab);
  $$('[data-home-tab]').forEach((btn) => {
    const on = btn.dataset.homeTab === id;
    btn.setAttribute('aria-selected', on ? 'true' : 'false');
    btn.classList.toggle('is-active', on);
  });
  $$('[data-home-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.homePanel !== id;
  });
  if (id === 'words') renderWordsList();
  else if (id === 'passages') renderPassageList();
  else if (id === 'settings') {
    syncPaceControls();
    const name = ctx.storage.loadProgress().childName || '';
    const input = $('#settings-child-name');
    if (input && document.activeElement !== input) input.value = name;
    updateInstallUi();
  }
}

function updateInstallUi() {
  const state = ctx.home.installState({
    standalone: ctx.home.isStandaloneDisplay({
      matchMedia: window.matchMedia?.bind(window),
      standalone: window.navigator?.standalone,
    }),
    canPrompt: Boolean(window._deferredPrompt),
  });
  const copy = $('#install-copy');
  const btn = $('#btn-install');
  if (copy) copy.textContent = state.copy;
  if (btn) {
    btn.hidden = false;
    btn.textContent = state.button;
    btn.disabled = !state.enabled;
  }
}

function openPanel(id, fn) {
  hideToast();
  closeWordSheet();
  ctx.tts.stopSpeaking();
  closePanels();
  $(`#${id}`).hidden = false;
  fn();
}
function closePanels() { $$('.sub-panel').forEach((p) => { p.hidden = true; }); }

function renderPassageList() {
  const p = ctx.storage.loadProgress();
  $('#passage-list').innerHTML = VOCABULARY.map((d) => {
    const done = p.completedPassages.includes(d.day);
    const title = getTopicTitle(d.day);
    return `<div class="passage-item ${done ? 'done' : ''}" data-n="${d.day}">
      <span class="passage-item-title">${title}</span><span>${done ? '✓' : ''}</span></div>`;
  }).join('');
  $$('.passage-item').forEach((el) => {
    el.addEventListener('click', () => {
      closePanels();
      closeHome();
      loadPassage(parseInt(el.dataset.n, 10));
    });
  });
}

function renderWordsList() {
  const p = ctx.storage.loadProgress();
  let idx = 0;
  const rows = [];
  for (const day of VOCABULARY) {
    const learned = p.completedPassages.includes(day.day);
    for (const w of day.words) {
      idx++;
      rows.push(`<div class="word-row ${learned ? 'learned' : 'upcoming'}">
        <span class="word-index">${idx}</span>
        <div class="word-info"><span class="word-text">${w.word}</span>
        <span class="word-meaning">${w.meaning}</span></div></div>`);
    }
  }
  $('#words-list').innerHTML = rows.join('');
}

async function renderCerts() {
  const p = ctx.storage.loadProgress();
  const completed = [...p.completedPassages].sort((a, b) => a - b);
  if (!completed.length) {
    $('#certs-gallery').innerHTML = '';
    $('#certs-empty').hidden = false;
    return;
  }
  $('#certs-empty').hidden = true;
  $('#certs-gallery').innerHTML = completed.map((n) =>
    `<div class="cert-card"><strong>${getTopicTitle(n)}</strong><div id="cert-${n}"></div></div>`
  ).join('');
  for (const n of completed) {
    const canvas = await ctx.certificate.generate({
      childName: p.childName,
      dayData: { ...getPassageData(n), theme: getTopicTitle(n) },
      progress: p,
    });
    canvas.style.width = '100%';
    $(`#cert-${n}`)?.appendChild(canvas);
  }
}

async function handleInstall() {
  const prompt = window._deferredPrompt;
  if (prompt) {
    prompt.prompt();
    await prompt.userChoice;
    window._deferredPrompt = null;
    updateInstallUi();
    return;
  }
  const state = ctx.home.installState({
    standalone: ctx.home.isStandaloneDisplay({
      matchMedia: window.matchMedia?.bind(window),
      standalone: window.navigator?.standalone,
    }),
    canPrompt: false,
  });
  if (!state.enabled) {
    showToast('Already installed on this device');
    return;
  }
  showToast('Use Share → Add to Home Screen, or your browser Install menu');
  updateInstallUi();
}

function showToast(msg) {
  const t = $('#toast');
  if (!t) return;
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  t.hidden = false;
  t.setAttribute('aria-hidden', 'false');
  t.textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(() => {
    hideToast();
  }, 2800);
}

function hideToast() {
  const t = $('#toast');
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
  if (!t) return;
  t.classList.remove('show');
  t.setAttribute('aria-hidden', 'true');
  t.hidden = true;
}
