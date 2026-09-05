import { VOCABULARY, TOTAL_DAYS, WORDS_PER_DAY, TOTAL_WORDS } from './data/words.js';
import { generatePassage, highlightWords } from './passage-generator.js';
import {
  loadProgress, saveProgress, completePassage, setChildName,
  isPassageCompleted, getActivePassage, saveScrollPosition,
  getScrollPosition, setReadingPassage,
} from './storage.js';
import { generateQuestions, PASS_THRESHOLD } from './questions.js';
import { speakWord, speakPassage, stopSpeaking, isSpeaking, isTTSAvailable } from './tts.js';
import { generateCertificate, shareCertificate } from './certificate.js';

let currentPassageData = null;
let currentPassageText = '';
let currentPassageNum = 1;
let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;
let wordMap = {};
let scrollTimer = null;

const $ = (sel) => document.querySelector(sel);

function init() {
  registerServiceWorker();
  setupListeners();
  loadPassage(getActivePassage());
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {});
}

function setupListeners() {
  $('#btn-menu')?.addEventListener('click', openMenu);
  $('#btn-close-menu')?.addEventListener('click', closeMenu);
  $('#drawer-backdrop')?.addEventListener('click', closeMenu);
  $('#btn-listen')?.addEventListener('click', toggleListen);
  $('#btn-done-reading')?.addEventListener('click', startQuiz);
  $('#btn-next-passage')?.addEventListener('click', () => {
    hideOverlay('screen-complete');
    loadPassage(getActivePassage());
  });
  $('#btn-share-complete')?.addEventListener('click', handleShareFromComplete);
  $('#btn-speak-word')?.addEventListener('click', () => {
    const w = $('#sheet-word')?.textContent;
    if (w) speakWord(w);
  });
  $('#word-sheet-backdrop')?.addEventListener('click', closeWordSheet);

  $('#child-name')?.addEventListener('change', (e) => {
    if (e.target.value.trim()) setChildName(e.target.value);
  });

  $$('.drawer-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      closeMenu();
      if (action === 'passages') openPanel('panel-passages', renderPassageList);
      else if (action === 'words') openPanel('panel-words', renderWordsList);
      else if (action === 'certificates') openPanel('panel-certificates', renderCerts);
      else if (action === 'install') handleInstall();
    });
  });

  $$('[data-back]').forEach((btn) => btn.addEventListener('click', closePanels));

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    window._deferredPrompt = e;
    const btn = $('#btn-install');
    if (btn) btn.hidden = false;
  });

  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      saveScrollPosition(currentPassageNum, window.scrollY);
    }, 300);
  });
}

function $$(sel) { return document.querySelectorAll(sel); }

function getPassageData(n) {
  return VOCABULARY.find((d) => d.day === n) || VOCABULARY[0];
}

function loadPassage(n) {
  stopSpeaking();
  currentPassageNum = n;
  currentPassageData = getPassageData(n);
  currentPassageText = generatePassage(currentPassageData);

  wordMap = {};
  currentPassageData.words.forEach((w) => { wordMap[w.word.toLowerCase()] = w; });

  $('#passage-label').textContent = `Passage ${n} of 100`;
  $('#passage-content').innerHTML = formatPassage(currentPassageText, currentPassageData.words);

  setupWordTaps();
  setReadingPassage(n);

  const savedY = getScrollPosition(n);
  requestAnimationFrame(() => { window.scrollTo(0, savedY); });

  updateMenuProgress();
  window.scrollTo(0, 0);
}

function formatPassage(text, words) {
  const paragraphs = text.split('\n\n').map((p) => `<p>${highlightWords(p, words)}</p>`).join('');
  return paragraphs;
}

function setupWordTaps() {
  $$('.vocab-word').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const word = el.dataset.word;
      const data = wordMap[word];
      if (data) openWordSheet(data);
    });
  });
}

function openWordSheet(data) {
  $('#sheet-word').textContent = data.word;
  $('#sheet-meaning').textContent = data.meaning;
  $('#sheet-example').textContent = `"${data.example}"`;
  $('#word-sheet').hidden = false;
  speakWord(data.word);
}

function closeWordSheet() {
  $('#word-sheet').hidden = true;
}

function toggleListen() {
  const btn = $('#btn-listen');
  if (isSpeaking()) {
    stopSpeaking();
    btn?.classList.remove('active');
    return;
  }
  if (!isTTSAvailable()) {
    showToast('Voice not available on this device');
    return;
  }
  btn?.classList.add('active');
  const plain = currentPassageText.replace(/\n\n/g, '. ');
  speakPassage(plain, () => btn?.classList.remove('active'));
}

function startQuiz() {
  stopSpeaking();
  quizQuestions = generateQuestions(currentPassageData);
  quizIndex = 0;
  quizScore = 0;
  showOverlay('screen-quiz');
  renderQuestion();
}

function renderQuestion() {
  const q = quizQuestions[quizIndex];
  const total = quizQuestions.length;
  const pct = ((quizIndex) / total) * 100;

  $('#quiz-progress-bar').style.width = `${pct}%`;
  $('#quiz-counter').textContent = `Question ${quizIndex + 1} of ${total}`;
  $('#quiz-question').textContent = q.prompt;
  $('#quiz-feedback').hidden = true;

  const container = $('#quiz-choices');
  container.innerHTML = q.choices
    .map((c, i) => `<button class="quiz-choice" data-idx="${i}" data-correct="${c.correct}">${c.text}</button>`)
    .join('');

  $$('.quiz-choice').forEach((btn) => {
    btn.addEventListener('click', () => handleAnswer(btn, q));
  });
}

function handleAnswer(btn, question) {
  const correct = btn.dataset.correct === 'true';
  $$('.quiz-choice').forEach((b) => {
    b.disabled = true;
    if (b.dataset.correct === 'true') b.classList.add('correct');
    else if (b === btn && !correct) b.classList.add('wrong');
  });

  if (correct) quizScore++;

  setTimeout(() => {
    quizIndex++;
    if (quizIndex < quizQuestions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }, correct ? 600 : 1200);
}

function finishQuiz() {
  hideOverlay('screen-quiz');

  if (quizScore >= PASS_THRESHOLD) {
    const progress = completePassage(currentPassageNum, WORDS_PER_DAY);
    $('#complete-msg').textContent =
      `${progress.childName || 'You'} learned 10 new words. ${progress.completedPassages.length * 10} of 1000 total.`;
    showOverlay('screen-complete');
    updateMenuProgress();
  } else {
    showToast(`You got ${quizScore}/${quizQuestions.length}. Try again!`);
    setTimeout(startQuiz, 1500);
  }
}

async function handleShareFromComplete() {
  const progress = loadProgress();
  const canvas = await generateCertificate({
    childName: progress.childName,
    dayData: currentPassageData,
    progress: {
      ...progress,
      totalWordsLearned: progress.totalWordsLearned,
      streak: progress.completedPassages.length,
      completedDays: progress.completedPassages,
    },
  });
  await shareCertificate(canvas, currentPassageData);
}

function openMenu() {
  updateMenuProgress();
  const p = loadProgress();
  if (p.childName) $('#child-name').value = p.childName;
  $('#menu-drawer').hidden = false;
}

function closeMenu() {
  $('#menu-drawer').hidden = true;
  const name = $('#child-name')?.value;
  if (name?.trim()) setChildName(name);
}

function updateMenuProgress() {
  const p = loadProgress();
  const done = p.completedPassages.length;
  const words = p.totalWordsLearned;

  $('#menu-passage-count').textContent = `${done}/100`;
  $('#menu-words-count').textContent = words;

  const ring = $('#ring-fill');
  if (ring) {
    const offset = 100 - done;
    ring.style.strokeDashoffset = offset;
  }
}

function openPanel(id, renderFn) {
  closePanels();
  $(`#${id}`).hidden = false;
  renderFn();
}

function closePanels() {
  $$('.sub-panel').forEach((p) => { p.hidden = true; });
}

function renderPassageList() {
  const p = loadProgress();
  const active = getActivePassage();
  const list = $('#passage-list');
  list.innerHTML = VOCABULARY.map((d) => {
    const done = p.completedPassages.includes(d.day);
    const isCurrent = d.day === active;
    return `
      <div class="passage-item ${done ? 'done' : 'upcoming'} ${isCurrent ? 'current' : ''}" data-n="${d.day}">
        <span class="passage-item-num">${d.day}</span>
        <span class="passage-item-title">${d.theme}</span>
        <span class="passage-item-check">${done ? '✓' : ''}</span>
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
  const list = $('#words-list');
  let idx = 0;
  const rows = [];
  for (const day of VOCABULARY) {
    const learned = p.completedPassages.includes(day.day);
    for (const w of day.words) {
      idx++;
      rows.push(`
        <div class="word-row ${learned ? 'learned' : 'upcoming'}">
          <span class="word-index">${idx}</span>
          <div class="word-info">
            <span class="word-text">${w.word}</span>
            <span class="word-meaning">${w.meaning}</span>
          </div>
        </div>`);
    }
  }
  list.innerHTML = rows.join('');
}

async function renderCerts() {
  const p = loadProgress();
  const gallery = $('#certs-gallery');
  const empty = $('#certs-empty');
  const completed = [...p.completedPassages].sort((a, b) => a - b);

  if (!completed.length) {
    gallery.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  gallery.innerHTML = completed.map((n) => {
    const d = getPassageData(n);
    return `<div class="cert-card" data-n="${n}">
      <div class="cert-card-header"><strong>Passage ${n}</strong><span>${d.theme}</span></div>
      <div id="cert-thumb-${n}"></div>
    </div>`;
  }).join('');

  for (const n of completed) {
    const dayData = getPassageData(n);
    const canvas = await generateCertificate({
      childName: p.childName,
      dayData,
      progress: { ...p, streak: p.completedPassages.length, completedDays: p.completedPassages },
    });
    canvas.style.width = '100%';
    canvas.style.borderRadius = '8px';
  const thumb = $(`#cert-thumb-${n}`);
    thumb?.appendChild(canvas);
  }
}

function showOverlay(id) {
  $(`#${id}`).hidden = false;
}

function hideOverlay(id) {
  $(`#${id}`).hidden = true;
}

async function handleInstall() {
  const prompt = window._deferredPrompt;
  if (prompt) {
    prompt.prompt();
    await prompt.userChoice;
    $('#btn-install').hidden = true;
  }
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

document.addEventListener('DOMContentLoaded', init);
