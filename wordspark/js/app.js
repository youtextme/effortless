import { VOCABULARY, WORDS_PER_DAY, TOTAL_WORDS } from './data/words.js';
import { generatePassagePages, sectionToHtml } from './passage-generator.js';
import {
  loadProgress, completePassage, setChildName, getActivePassage,
  getPageProgress, markPageVisited, allPagesVisited, setReadingPassage, resetProgress,
  verifyRefreshPassword,
} from './storage.js';
import { generateQuestions, PASS_THRESHOLD } from './questions.js';
import { speakSequence, stopSpeaking } from './tts.js';
import { generateUsageScenarios, scenariosToSpeech } from './word-usage.js';
import { generateCertificate, shareCertificate } from './certificate.js';

let currentPassageData = null;
let currentPassageNum = 1;
let passagePages = [];
let currentPage = 0;
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let wordMap = {};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function init() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
  hideModal('name-modal');
  hideModal('refresh-modal');
  setupListeners();
  const p = loadProgress();
  if (!p.onboarded || !p.childName) {
    showModal('name-modal');
  } else {
    loadPassage(getActivePassage());
  }
}

function showModal(id) {
  const el = $(`#${id}`);
  if (el) el.hidden = false;
}

function hideModal(id) {
  const el = $(`#${id}`);
  if (el) el.hidden = true;
}

function setupListeners() {
  $('#btn-save-name')?.addEventListener('click', () => {
    const name = $('#child-name')?.value?.trim();
    if (!name) return;
    setChildName(name);
    hideModal('name-modal');
    loadPassage(getActivePassage());
  });

  $('#btn-prev-page')?.addEventListener('click', () => goPage(currentPage - 1));
  $('#btn-next-page')?.addEventListener('click', () => goPage(currentPage + 1));
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
    const pw = $('#refresh-password')?.value;
    if (!verifyRefreshPassword(pw)) {
      showToast('Wrong password');
      return;
    }
    resetProgress();
    hideModal('refresh-modal');
    $('#refresh-password').value = '';
    showModal('name-modal');
    showToast('Progress reset');
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

  wordMap = {};
  currentPassageData.words.forEach((w) => { wordMap[w.word.toLowerCase()] = w; });

  const { h1, sections } = generatePassagePages(currentPassageData);
  passagePages = sections;
  $('#passage-title').textContent = h1;

  const pp = getPageProgress(n);
  currentPage = Math.min(pp.currentPage || 0, sections.length - 1);
  renderPage();
  setReadingPassage(n);
  updateParentProgress();
  window.scrollTo(0, 0);
}

function renderPage() {
  const section = passagePages[currentPage];
  $('#passage-content').innerHTML = sectionToHtml(section, currentPassageData.words);
  setupWordTaps();

  const total = passagePages.length;
  markPageVisited(currentPassageNum, currentPage, total);

  $('#btn-prev-page').disabled = currentPage === 0;
  $('#btn-next-page').disabled = currentPage >= total - 1;
  $('#btn-next-page').textContent = currentPage >= total - 1 ? 'Last page' : 'Next →';

  renderPageDots(total);
  updateReadButton(total);
}

function renderPageDots(total) {
  const dots = $('#page-dots');
  const pp = markPageVisited(currentPassageNum, currentPage, total);
  dots.innerHTML = Array.from({ length: total }, (_, i) => {
    const visited = pp.visited.includes(i);
    const active = i === currentPage;
    return `<span class="dot ${visited ? 'visited' : ''} ${active ? 'active' : ''}"></span>`;
  }).join('');
}

function goPage(n) {
  if (n < 0 || n >= passagePages.length) {
    if (n >= passagePages.length) updateReadButton(passagePages.length);
    return;
  }
  currentPage = n;
  renderPage();
  window.scrollTo(0, 0);
}

function updateReadButton(total) {
  const allVisited = allPagesVisited(currentPassageNum, total);
  const btn = $('#btn-done-reading');
  const hint = $('#read-hint');
  btn.disabled = !allVisited;
  if (allVisited) {
    hint.textContent = 'Great! Now tap the button below.';
    hint.classList.add('ready');
  } else {
    const pp = markPageVisited(currentPassageNum, currentPage, total);
    const remaining = total - pp.visited.length;
    hint.textContent = `Keep reading — ${remaining} page${remaining > 1 ? 's' : ''} left`;
    hint.classList.remove('ready');
  }
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
  $('#sheet-meaning').textContent = data.meaning;

  $('#sheet-scenarios').innerHTML = scenarios.map((s) => `
    <div class="scenario">
      <span class="scenario-who">${s.who}</span>
      <p class="scenario-setup">${s.setup}</p>
      <p class="scenario-say">${s.say}</p>
    </div>
  `).join('');

  $('#word-sheet').hidden = false;
  speakSequence(scenariosToSpeech(data.word, scenarios));
}

function closeWordSheet() {
  stopSpeaking();
  $('#word-sheet').hidden = true;
}

function startQuiz() {
  if (!allPagesVisited(currentPassageNum, passagePages.length)) return;
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
    .map((c, i) => `<button class="quiz-choice" data-correct="${c.correct}">${c.text}</button>`)
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
    $('#complete-msg').textContent =
      `${p.childName}, you learned 10 words! ${p.totalWordsLearned} of ${TOTAL_WORDS} total.`;
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
    dayData: currentPassageData,
    progress: { ...p, streak: p.completedPassages.length, completedDays: p.completedPassages },
  });
  await shareCertificate(canvas, currentPassageData);
}

function updateParentProgress() {
  const p = loadProgress();
  $('#parent-progress').textContent =
    `${p.completedPassages.length}/100 passages · ${p.totalWordsLearned}/1000 words`;
}

function openPanel(id, fn) {
  closePanels();
  $(`#${id}`).hidden = false;
  fn();
}

function closePanels() {
  $$('.sub-panel').forEach((p) => { p.hidden = true; });
}

function renderPassageList() {
  const p = loadProgress();
  $('#passage-list').innerHTML = VOCABULARY.map((d) => {
    const done = p.completedPassages.includes(d.day);
    const title = d.words.slice(0, 2).map((w) => w.word).join(' & ');
    return `<div class="passage-item ${done ? 'done' : ''}" data-n="${d.day}">
      <span class="passage-item-title">${title}</span>
      <span class="passage-item-theme">${d.theme}</span>
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
  $('#certs-gallery').innerHTML = completed.map((n) => {
    const d = getPassageData(n);
    return `<div class="cert-card"><strong>${d.theme}</strong><div id="cert-${n}"></div></div>`;
  }).join('');
  for (const n of completed) {
    const canvas = await generateCertificate({
      childName: p.childName,
      dayData: getPassageData(n),
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
