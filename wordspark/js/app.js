import { VOCABULARY, TOTAL_DAYS, WORDS_PER_DAY, TOTAL_WORDS } from './data/words.js';
import { generatePassage, highlightWords, countWordOccurrences } from './passage-generator.js';
import { loadProgress, saveProgress, completeDay, setChildName, isDayCompleted } from './storage.js';
import { generateCertificate, shareCertificate } from './certificate.js';

let currentDayData = null;
let currentPassage = '';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function init() {
  registerServiceWorker();
  setupEventListeners();
  renderHome();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function setupEventListeners() {
  $('#btn-start-reading')?.addEventListener('click', startReading);
  $('#btn-finish-reading')?.addEventListener('click', finishReading);
  $('#btn-share-cert')?.addEventListener('click', handleShare);
  $$('.btn-back-home').forEach((btn) => btn.addEventListener('click', renderHome));
  $('#btn-save-name')?.addEventListener('click', handleSaveName);
  $('#btn-prev-day')?.addEventListener('click', () => navigateDay(-1));
  $('#btn-next-day')?.addEventListener('click', () => navigateDay(1));
  $('#btn-install')?.addEventListener('click', handleInstall);

  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = $('#btn-install');
    if (btn) btn.hidden = false;
  });

  window._deferredPrompt = () => deferredPrompt;
}

async function handleInstall() {
  const prompt = window._deferredPrompt?.();
  if (prompt) {
    prompt.prompt();
    await prompt.userChoice;
    $('#btn-install').hidden = true;
  }
}

function handleSaveName() {
  const name = $('#child-name')?.value;
  if (name) {
    setChildName(name);
    showToast(`Welcome, ${name}! 🎉`);
  }
}

function getDayData(day) {
  return VOCABULARY.find((d) => d.day === day) || VOCABULARY[0];
}

function renderHome() {
  const progress = loadProgress();
  const day = progress.currentDay;
  const dayData = getDayData(day);
  const completed = isDayCompleted(day);

  showScreen('screen-home');

  $('#home-day-num').textContent = day;
  $('#home-theme').textContent = dayData.theme;
  $('#home-takeaway').textContent = dayData.takeaway;
  $('#progress-words').textContent = progress.totalWordsLearned;
  $('#progress-streak').textContent = progress.streak;
  $('#progress-days').textContent = progress.completedDays.length;
  $('#progress-total').textContent = TOTAL_DAYS;
  $('#total-words-label').textContent = TOTAL_WORDS;

  const pct = Math.round((progress.completedDays.length / TOTAL_DAYS) * 100);
  $('#progress-bar').style.width = `${pct}%`;
  $('#progress-pct').textContent = pct;

  const btn = $('#btn-start-reading');
  if (completed) {
    btn.textContent = `📖 Review Day ${day}`;
    btn.classList.add('review');
  } else {
    btn.textContent = `📖 Start Reading — Day ${day}`;
    btn.classList.remove('review');
  }

  if (progress.childName) {
    $('#child-name').value = progress.childName;
    $('#welcome-msg').textContent = `Hello, ${progress.childName}! Ready to learn?`;
  }

  renderDayPicker(progress);
}

function renderDayPicker(progress) {
  const grid = $('#day-grid');
  if (!grid) return;
  grid.innerHTML = '';

  for (let d = 1; d <= TOTAL_DAYS; d++) {
    const btn = document.createElement('button');
    btn.className = 'day-dot';
    btn.textContent = d;
    if (progress.completedDays.includes(d)) btn.classList.add('completed');
    if (d === progress.currentDay) btn.classList.add('current');
    if (d > progress.currentDay && !progress.completedDays.includes(d)) {
      btn.classList.add('locked');
      btn.disabled = true;
    }
    btn.addEventListener('click', () => {
      const p = loadProgress();
      p.currentDay = d;
      saveProgress(p);
      renderHome();
    });
    grid.appendChild(btn);
  }
}

function startReading() {
  const progress = loadProgress();
  currentDayData = getDayData(progress.currentDay);
  currentPassage = generatePassage(currentDayData);

  showScreen('screen-reading');

  $('#reading-day').textContent = currentDayData.day;
  $('#reading-theme').textContent = currentDayData.theme;

  const highlighted = highlightWords(currentPassage, currentDayData.words);
  $('#passage-content').innerHTML = highlighted;

  renderWordCards(currentDayData.words);

  const stats = currentDayData.words.map((w) => ({
    word: w.word,
    count: countWordOccurrences(currentPassage, w.word),
  }));
  renderWordStats(stats);

  window.scrollTo(0, 0);
}

function renderWordCards(words) {
  const container = $('#word-cards');
  if (!container) return;
  container.innerHTML = words
    .map(
      (w) => `
    <div class="word-card">
      <strong class="word-card-word">${w.word}</strong>
      <span class="word-card-meaning">${w.meaning}</span>
      <em class="word-card-example">"${w.example}"</em>
    </div>
  `
    )
    .join('');
}

function renderWordStats(stats) {
  const container = $('#word-stats');
  if (!container) return;
  container.innerHTML = stats
    .map((s) => `<span class="stat-chip">${s.word}: ${s.count}×</span>`)
    .join('');
}

function finishReading() {
  if (!currentDayData) return;

  const progress = completeDay(currentDayData.day, WORDS_PER_DAY);
  showScreen('screen-certificate');

  $('#cert-day').textContent = currentDayData.day;
  $('#cert-theme').textContent = currentDayData.theme;
  $('#cert-takeaway').textContent = currentDayData.takeaway;
  $('#cert-name').textContent = progress.childName || 'Young Scholar';
  $('#cert-words-learned').textContent = progress.totalWordsLearned;
  $('#cert-streak').textContent = progress.streak;

  const wordList = $('#cert-word-list');
  if (wordList) {
    wordList.innerHTML = currentDayData.words
      .map(
        (w) => `
      <li>
        <strong>${w.word}</strong> — ${w.meaning}
      </li>
    `
      )
      .join('');
  }

  generateCertificatePreview(progress);
}

async function generateCertificatePreview(progress) {
  const canvas = await generateCertificate({
    childName: progress.childName,
    dayData: currentDayData,
    progress,
  });
  const preview = $('#cert-preview');
  if (preview) {
    preview.innerHTML = '';
    canvas.style.width = '100%';
    canvas.style.borderRadius = '12px';
    preview.appendChild(canvas);
    preview._canvas = canvas;
  }
}

async function handleShare() {
  const preview = $('#cert-preview');
  const canvas = preview?._canvas;
  if (!canvas || !currentDayData) return;

  const btn = $('#btn-share-cert');
  btn.disabled = true;
  btn.textContent = 'Sharing...';

  const result = await shareCertificate(canvas, currentDayData);

  btn.disabled = false;
  btn.textContent = result.method === 'download' ? '📥 Downloaded! Share on WhatsApp' : '💬 Shared!';

  if (result.success) {
    showToast(result.method === 'share' ? 'Shared successfully! 🎉' : 'Image saved! Open WhatsApp to share.');
  }
}

function navigateDay(dir) {
  const progress = loadProgress();
  const newDay = progress.currentDay + dir;
  if (newDay >= 1 && newDay <= TOTAL_DAYS) {
    progress.currentDay = newDay;
    saveProgress(progress);
    startReading();
  }
}

function showScreen(id) {
  $$('.screen').forEach((s) => s.classList.remove('active'));
  $(`#${id}`)?.classList.add('active');
}

function showToast(msg) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', init);
