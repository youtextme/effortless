import { VOCABULARY, TOTAL_DAYS, WORDS_PER_DAY, TOTAL_WORDS } from './data/words.js';
import { AGENTS, MECE_EXPLANATION, getAgentForDay, getSkillsForDay } from './data/curriculum.js';
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
  renderJourney();
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function setupEventListeners() {
  $('#btn-start-reading')?.addEventListener('click', startReading);
  $('#btn-finish-reading')?.addEventListener('click', finishReading);
  $('#btn-mark-done-home')?.addEventListener('click', () => {
    startReading();
    setTimeout(finishReading, 100);
  });
  $('#btn-share-cert')?.addEventListener('click', handleShare);
  $('#btn-view-all-certs')?.addEventListener('click', () => navigateTo('screen-certificates'));
  $('#btn-save-name')?.addEventListener('click', handleSaveName);
  $('#btn-prev-day')?.addEventListener('click', () => navigateDay(-1));
  $('#btn-next-day')?.addEventListener('click', () => navigateDay(1));
  $('#btn-install')?.addEventListener('click', handleInstall);
  $('#words-search')?.addEventListener('input', renderWordsList);

  $$('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const screen = btn.dataset.screen;
      if (screen === 'screen-home') renderHome();
      else if (screen === 'screen-words') renderWordsList();
      else if (screen === 'screen-certificates') renderCertificatesGallery();
      else if (screen === 'screen-journey') renderJourney();
      navigateTo(screen);
    });
  });

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

function getAllWordsFlat() {
  const words = [];
  for (const day of VOCABULARY) {
    for (const w of day.words) {
      words.push({ ...w, day: day.day, dayTheme: day.theme });
    }
  }
  return words;
}

function isWordLearned(wordDay, progress) {
  return progress.completedDays.includes(wordDay);
}

function renderSkillTags(container, day) {
  if (!container) return;
  const skills = getSkillsForDay(day);
  container.innerHTML = skills.map((s) => `<span class="skill-tag">${s}</span>`).join('');
}

function renderAgentCard(day, targetId = 'agent-card') {
  const el = $(`#${targetId}`);
  if (!el) return;
  const agent = getAgentForDay(day);
  const progress = loadProgress();
  const daysInBlock = agent.days[1] - agent.days[0] + 1;
  const completedInBlock = progress.completedDays.filter(
    (d) => d >= agent.days[0] && d <= agent.days[1]
  ).length;

  el.innerHTML = `
    <div class="agent-header" style="border-color: ${agent.color}">
      <span class="agent-emoji">${agent.emoji}</span>
      <div>
        <div class="agent-name">${agent.name}</div>
        <div class="agent-mission">${agent.mission}</div>
      </div>
    </div>
    <div class="agent-progress">${completedInBlock}/${daysInBlock} days in this agent</div>
  `;
}

function renderAgentBanner(day) {
  const el = $('#reading-agent');
  if (!el) return;
  const agent = getAgentForDay(day);
  el.innerHTML = `
    <span class="agent-emoji">${agent.emoji}</span>
    <span class="agent-name">${agent.name}</span>
  `;
  el.style.borderColor = agent.color;
}

function renderHome() {
  const progress = loadProgress();
  const day = progress.currentDay;
  const dayData = getDayData(day);
  const completed = isDayCompleted(day);

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

  renderSkillTags($('#home-skills'), day);
  renderAgentCard(day);

  const btn = $('#btn-start-reading');
  const doneBtn = $('#btn-mark-done-home');
  if (completed) {
    btn.textContent = `📖 Review Day ${day} Passage`;
    btn.classList.add('review');
    doneBtn.hidden = true;
  } else {
    btn.textContent = `📖 Start Reading — Day ${day}`;
    btn.classList.remove('review');
    doneBtn.hidden = false;
    doneBtn.textContent = `✅ Mark Day ${day} as Done (skip reading)`;
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
    btn.addEventListener('click', () => {
      const p = loadProgress();
      p.currentDay = d;
      saveProgress(p);
      renderHome();
      showToast(`Switched to Day ${d}`);
    });
    grid.appendChild(btn);
  }
}

function startReading() {
  const progress = loadProgress();
  currentDayData = getDayData(progress.currentDay);
  currentPassage = generatePassage(currentDayData);

  navigateTo('screen-reading');

  $('#reading-day').textContent = currentDayData.day;
  $('#reading-theme').textContent = currentDayData.theme;
  renderAgentBanner(currentDayData.day);
  renderSkillTags($('#reading-skills'), currentDayData.day);

  const highlighted = highlightWords(currentPassage, currentDayData.words);
  $('#passage-content').innerHTML = highlighted;

  renderWordCards(currentDayData.words);

  const stats = currentDayData.words.map((w) => ({
    word: w.word,
    count: countWordOccurrences(currentPassage, w.word),
  }));
  renderWordStats(stats);

  const done = isDayCompleted(currentDayData.day);
  const finishBtn = $('#btn-finish-reading');
  if (done) {
    finishBtn.textContent = '✅ Already Done — View Certificate';
    finishBtn.classList.add('review');
  } else {
    finishBtn.textContent = '✅ Mark as Done — Get Certificate & Save Progress';
    finishBtn.classList.remove('review');
  }

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
  if (!currentDayData) {
    const progress = loadProgress();
    currentDayData = getDayData(progress.currentDay);
  }

  const progress = completeDay(currentDayData.day, WORDS_PER_DAY);
  navigateTo('screen-certificate');

  $('#cert-day').textContent = currentDayData.day;
  $('#cert-theme').textContent = currentDayData.theme;
  $('#cert-takeaway').textContent = currentDayData.takeaway;
  $('#cert-name').textContent = progress.childName || 'Young Scholar';
  $('#cert-words-learned').textContent = progress.totalWordsLearned;
  $('#cert-streak').textContent = progress.streak;

  const wordList = $('#cert-word-list');
  if (wordList) {
    wordList.innerHTML = currentDayData.words
      .map((w) => `<li><strong>${w.word}</strong> — ${w.meaning}</li>`)
      .join('');
  }

  generateCertificatePreview(progress);
  showToast(`Day ${currentDayData.day} complete! 🎉`);
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
  let canvas = preview?._canvas;

  if (!canvas && currentDayData) {
    const progress = loadProgress();
    canvas = await generateCertificate({
      childName: progress.childName,
      dayData: currentDayData,
      progress,
    });
  }

  if (!canvas || !currentDayData) return;

  const btn = $('#btn-share-cert');
  btn.disabled = true;
  btn.textContent = 'Sharing...';

  const result = await shareCertificate(canvas, currentDayData);

  btn.disabled = false;
  btn.textContent = result.method === 'download' ? '📥 Downloaded! Share on WhatsApp' : '💬 Shared!';

  if (result.success) {
    showToast(result.method === 'share' ? 'Shared! 🎉' : 'Saved! Open WhatsApp to share.');
  }
}

function renderWordsList() {
  const progress = loadProgress();
  const container = $('#words-list');
  if (!container) return;

  const query = ($('#words-search')?.value || '').toLowerCase().trim();
  const allWords = getAllWordsFlat();
  const filtered = query
    ? allWords.filter((w) => w.word.includes(query) || w.meaning.includes(query))
    : allWords;

  container.innerHTML = filtered
    .map((w, i) => {
      const learned = isWordLearned(w.day, progress);
      const globalIndex = allWords.indexOf(w) + 1;
      return `
      <div class="word-row ${learned ? 'learned' : 'upcoming'}" data-day="${w.day}">
        <span class="word-index">${globalIndex}</span>
        <div class="word-info">
          <strong class="word-text">${w.word}</strong>
          <span class="word-meaning-short">${w.meaning}</span>
        </div>
        <span class="word-day">Day ${w.day}</span>
      </div>
    `;
    })
    .join('');

  $$('.word-row').forEach((row) => {
    row.addEventListener('click', () => {
      const day = parseInt(row.dataset.day, 10);
      const p = loadProgress();
      p.currentDay = day;
      saveProgress(p);
      startReading();
    });
  });
}

async function renderCertificatesGallery() {
  const progress = loadProgress();
  const gallery = $('#certs-gallery');
  const empty = $('#certs-empty');
  if (!gallery) return;

  const completed = [...progress.completedDays].sort((a, b) => a - b);

  if (completed.length === 0) {
    gallery.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  gallery.innerHTML = completed
    .map(
      (day) => `
    <div class="cert-card" data-day="${day}">
      <div class="cert-card-header">
        <span class="cert-card-day">Day ${day}</span>
        <span class="cert-card-theme">${getDayData(day).theme}</span>
      </div>
      <div class="cert-card-canvas" id="cert-thumb-${day}"></div>
      <button class="btn btn-small btn-share-day" data-day="${day}">💬 Share</button>
    </div>
  `
    )
    .join('');

  for (const day of completed) {
    const dayData = getDayData(day);
    const canvas = await generateCertificate({
      childName: progress.childName,
      dayData,
      progress,
    });
    const thumb = $(`#cert-thumb-${day}`);
    if (thumb) {
      canvas.style.width = '100%';
      canvas.style.borderRadius = '8px';
      thumb.appendChild(canvas);
      thumb._canvas = canvas;
      thumb._dayData = dayData;
    }
  }

  $$('.btn-share-day').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const day = parseInt(btn.dataset.day, 10);
      const thumb = $(`#cert-thumb-${day}`);
      if (thumb?._canvas && thumb._dayData) {
        currentDayData = thumb._dayData;
        await shareCertificate(thumb._canvas, thumb._dayData);
        showToast('Certificate shared! 🎉');
      }
    });
  });

  $$('.cert-card').forEach((card) => {
    card.addEventListener('click', () => {
      const day = parseInt(card.dataset.day, 10);
      currentDayData = getDayData(day);
      const p = loadProgress();
      p.currentDay = day;
      saveProgress(p);
      finishReading();
    });
  });
}

function renderJourney() {
  $('#mece-intro').textContent = MECE_EXPLANATION.intro;
  $('#mece-exclusive').textContent = MECE_EXPLANATION.exclusive;
  $('#mece-exhaustive').textContent = MECE_EXPLANATION.exhaustive;
  $('#mece-outcome').textContent = MECE_EXPLANATION.outcome;

  const progress = loadProgress();
  const list = $('#agents-list');
  if (!list) return;

  list.innerHTML = AGENTS.map((agent) => {
    const daysInBlock = agent.days[1] - agent.days[0] + 1;
    const completedInBlock = progress.completedDays.filter(
      (d) => d >= agent.days[0] && d <= agent.days[1]
    ).length;
    const pct = Math.round((completedInBlock / daysInBlock) * 100);

    const dayRows = [];
    for (let d = agent.days[0]; d <= agent.days[1]; d++) {
      const done = progress.completedDays.includes(d);
      const skills = getSkillsForDay(d);
      const dayData = getDayData(d);
      dayRows.push(`
        <div class="journey-day ${done ? 'done' : ''}" data-day="${d}">
          <span class="journey-day-num">${d}</span>
          <div class="journey-day-info">
            <strong>${dayData.theme}</strong>
            <span class="journey-skills">${skills.join(' · ')}</span>
          </div>
          <span class="journey-status">${done ? '✅' : '○'}</span>
        </div>
      `);
    }

    return `
      <div class="agent-block" style="--agent-color: ${agent.color}">
        <div class="agent-block-header">
          <span class="agent-emoji">${agent.emoji}</span>
          <div>
            <h3>${agent.name}</h3>
            <p>Days ${agent.days[0]}–${agent.days[1]} · ${agent.mission}</p>
          </div>
          <span class="agent-pct">${pct}%</span>
        </div>
        <div class="agent-skills">
          ${agent.skills.map((s) => `<span class="skill-tag">${s}</span>`).join('')}
        </div>
        <div class="journey-days">${dayRows.join('')}</div>
      </div>
    `;
  }).join('');

  $$('.journey-day').forEach((row) => {
    row.addEventListener('click', () => {
      const day = parseInt(row.dataset.day, 10);
      const p = loadProgress();
      p.currentDay = day;
      saveProgress(p);
      startReading();
    });
  });
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

function navigateTo(screenId) {
  showScreen(screenId);
  $$('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.screen === screenId);
  });
}

function showScreen(id) {
  $$('.screen').forEach((s) => s.classList.remove('active'));
  $(`#${id}`)?.classList.add('active');
  window.scrollTo(0, 0);
}

function showToast(msg) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', init);
