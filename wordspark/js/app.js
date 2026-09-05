import { VOCABULARY, WORDS_PER_DAY, TOTAL_WORDS } from './data/words.js';
import { getTopicTitle } from './data/topics.js';
import { generatePassagePages, sectionToHtml } from './passage-generator.js';
import {
  loadProgress, completePassage, setChildName, getActivePassage,
  setReadingPassage, resetProgress, verifyRefreshPassword,
} from './storage.js';
import { generateQuestions, PASS_THRESHOLD } from './questions.js';
import { speakSequence, stopSpeaking } from './tts.js';
import { generateUsageScenarios, usageToSpeech } from './word-usage.js';
import { generateCertificate, shareCertificate } from './certificate.js';

let currentPassageData = null;
let currentPassageNum = 1;
let passageSections = [];
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let wordMap = {};
let hasScrolledToEnd = false;
let scrollObserver = null;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  hideModal('name-modal');
  hideModal('refresh-modal');
  setupListeners();
  const p = loadProgress();
  if (!p.onboarded || !p.childName) showModal('name-modal');
  else loadPassage(getActivePassage());
}

function showModal(id) { const el = $(`#${id}`); if (el) el.hidden = false; }
function hideModal(id) { const el = $(`#${id}`); if (el) el.hidden = true; }

function setupListeners() {
  $('#btn-save-name')?.addEventListener('click', () => {
    const name = $('#child-name')?.value?.trim();
    if (!name) return;
    setChildName(name);
    hideModal('name-modal');
    loadPassage(getActivePassage());
  });

  $('#btn-done-reading')?.addEventListener('click', startQuiz);
  $('#btn-next-passage')?.addEventListener('click', () => {
    hideOverlay('screen-complete');
    loadPassage(getActivePassage());
  });
  $('#btn-share-complete')?.addEventListener('click', handleShare);
  $('#word-sheet-backdrop')?.addEventListener('click', closeWordSheet);

  $('#btn-parent-toggle')?.addEventListener('click', () => {
    const panel = $('#parent-panel');
    panel.hidden = !panel.hidden;
    updateParentProgress();
  });

  $$('.parent-link').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      $('#parent-panel').hidden = true;
      if (action === 'refresh') showModal('refresh-modal');
      else if (action === 'passages') openPanel('panel-passages', renderPassageList);
      else if (action === 'words') openPanel('panel-words', renderWordsList);
      else if (action === 'certificates') openPanel('panel-certificates', renderCerts);
      else if (action === 'install') handleInstall();
    });
  });

  $('#btn-confirm-refresh')?.addEventListener('click', () => {
    if (!verifyRefreshPassword($('#refresh-password')?.value)) {
      showToast('Wrong password');
      return;
    }
    resetProgress();
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

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._deferredPrompt = e;
    const btn = $('#btn-install');
    if (btn) btn.hidden = false;
  });
}

function getPassageData(n) {
  return VOCABULARY.find((d) => d.day === n) || VOCABULARY[0];
}

function loadPassage(n) {
  stopSpeaking();
  currentPassageNum = n;
  currentPassageData = getPassageData(n);
  hasScrolledToEnd = false;

  wordMap = {};
  currentPassageData.words.forEach((w) => { wordMap[w.word.toLowerCase()] = w; });

  const { h1, sections } = generatePassagePages(currentPassageData);
  passageSections = sections;
  $('#passage-title').textContent = h1;

  $('#passage-content').innerHTML = sections
    .map((s) => sectionToHtml(s, currentPassageData.words))
    .join('');

  setupWordTaps();
  setupScrollUnlock();
  setReadingPassage(n);
  updateParentProgress();
  updateFab();
  window.scrollTo(0, 0);
}

function setupScrollUnlock() {
  if (scrollObserver) scrollObserver.disconnect();

  const sentinel = $('#scroll-sentinel');
  const fab = $('#btn-done-reading');
  if (!sentinel) return;

  scrollObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        hasScrolledToEnd = true;
        updateFab();
      }
    },
    { root: null, threshold: 0.5 }
  );
  scrollObserver.observe(sentinel);

  // Also unlock if content fits on one screen (short viewport)
  requestAnimationFrame(() => {
    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight;
    if (docH <= winH + 40) {
      hasScrolledToEnd = true;
      updateFab();
    }
  });
}

function updateFab() {
  const fab = $('#btn-done-reading');
  if (fab) fab.disabled = !hasScrolledToEnd;
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
  const scenarios = generateUsageScenarios(data);
  $('#sheet-word').textContent = data.word;
  $('#sheet-scenarios').innerHTML = scenarios.map((s) => `
    <div class="scenario">
      <span class="scenario-who">${s.who}</span>
      <p class="scenario-setup">${s.setup}</p>
      <p class="scenario-upgrade">${s.upgrade}</p>
      <p class="scenario-line">${s.line}</p>
    </div>
  `).join('');
  $('#word-sheet').hidden = false;
  speakSequence(usageToSpeech(data.word, scenarios).join(' '));
}

function closeWordSheet() {
  stopSpeaking();
  $('#word-sheet').hidden = true;
}

function startQuiz() {
  if (!hasScrolledToEnd) return;
  stopSpeaking();
  quizQuestions = generateQuestions(currentPassageData);
  quizIndex = 0;
  quizScore = 0;
  showOverlay('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = quizQuestions[quizIndex];
  $('#quiz-progress-bar').style.width = `${(quizIndex / quizQuestions.length) * 100}%`;
  $('#quiz-counter').textContent = `Question ${quizIndex + 1} of ${quizQuestions.length}`;
  $('#quiz-question').textContent = q.prompt;
  $('#quiz-choices').innerHTML = q.choices
    .map((c) => `<button class="quiz-choice" data-correct="${c.correct}">${c.text}</button>`)
    .join('');
  $$('.quiz-choice').forEach((btn) => btn.addEventListener('click', () => handleAnswer(btn)));
}

function handleAnswer(btn) {
  const correct = btn.dataset.correct === 'true';
  $$('.quiz-choice').forEach((b) => {
    b.disabled = true;
    if (b.dataset.correct === 'true') b.classList.add('correct');
    else if (b === btn && !correct) b.classList.add('wrong');
  });
  if (correct) quizScore++;
  setTimeout(() => {
    quizIndex++;
    if (quizIndex < quizQuestions.length) renderQuestion();
    else finishQuiz();
  }, correct ? 500 : 1000);
}

function finishQuiz() {
  hideOverlay('screen-quiz');
  if (quizScore >= PASS_THRESHOLD) {
    const p = completePassage(currentPassageNum, WORDS_PER_DAY);
    $('#complete-msg').textContent = `You finished "${getTopicTitle(currentPassageNum)}". ${p.totalWordsLearned} words learned so far.`;
    showOverlay('screen-complete');
    updateParentProgress();
  } else {
    showToast(`Got ${quizScore}/${quizQuestions.length}. Try again!`);
    setTimeout(startQuiz, 1200);
  }
}

async function handleShare() {
  const p = loadProgress();
  const canvas = await generateCertificate({
    childName: p.childName,
    dayData: { ...currentPassageData, theme: getTopicTitle(currentPassageNum) },
    progress: { ...p, streak: p.completedPassages.length, completedDays: p.completedPassages },
  });
  await shareCertificate(canvas, currentPassageData);
}

function updateParentProgress() {
  const p = loadProgress();
  $('#parent-progress').textContent =
    `${p.completedPassages.length}/100 topics · ${p.totalWordsLearned}/1000 words`;
}

function openPanel(id, fn) { closePanels(); $(`#${id}`).hidden = false; fn(); }
function closePanels() { $$('.sub-panel').forEach((p) => { p.hidden = true; }); }

function renderPassageList() {
  const p = loadProgress();
  $('#passage-list').innerHTML = VOCABULARY.map((d) => {
    const done = p.completedPassages.includes(d.day);
    const title = getTopicTitle(d.day);
    return `<div class="passage-item ${done ? 'done' : ''}" data-n="${d.day}">
      <span class="passage-item-title">${title}</span>
      <span>${done ? '✓' : ''}</span>
    </div>`;
  }).join('');
  $$('.passage-item').forEach((el) => {
    el.addEventListener('click', () => {
      closePanels();
      loadPassage(parseInt(el.dataset.n, 10));
    });
  });
}

function renderWordsList() {
  const p = loadProgress();
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
  const p = loadProgress();
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
    const canvas = await generateCertificate({
      childName: p.childName,
      dayData: { ...getPassageData(n), theme: getTopicTitle(n) },
      progress: { ...p, streak: p.completedPassages.length, completedDays: p.completedPassages },
    });
    canvas.style.width = '100%';
    $(`#cert-${n}`)?.appendChild(canvas);
  }
}

function showOverlay(id) { $(`#${id}`).hidden = false; }
function hideOverlay(id) { $(`#${id}`).hidden = true; }

async function handleInstall() {
  const prompt = window._deferredPrompt;
  if (prompt) { prompt.prompt(); await prompt.userChoice; }
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

document.addEventListener('DOMContentLoaded', init);
