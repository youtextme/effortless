const STORAGE_KEY = 'wordspark_progress';
const REFRESH_PASSWORD = '1989';

const defaultProgress = () => ({
  currentPassage: 1,
  completedPassages: [],
  totalWordsLearned: 0,
  childName: '',
  scrollPositions: {},
  lastReadPassage: 1,
  pageProgress: {},
  onboarded: false,
});

function migrate(raw) {
  const p = { ...defaultProgress(), ...raw };
  if (raw.completedDays && !raw.completedPassages) {
    p.completedPassages = [...raw.completedDays];
  }
  if (raw.currentDay && !raw.currentPassage) {
    p.currentPassage = raw.currentDay;
  }
  if (!p.scrollPositions) p.scrollPositions = {};
  if (!p.pageProgress) p.pageProgress = {};
  if (p.childName) p.onboarded = true;
  return p;
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return migrate(JSON.parse(raw));
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultProgress();
}

export function getActivePassage() {
  const p = loadProgress();
  for (let i = 1; i <= 100; i++) {
    if (!p.completedPassages.includes(i)) return i;
  }
  return Math.min(p.currentPassage, 100);
}

export function completePassage(passageNum, wordsCount = 10) {
  const progress = loadProgress();
  if (!progress.completedPassages.includes(passageNum)) {
    progress.completedPassages.push(passageNum);
    progress.totalWordsLearned += wordsCount;
  }
  progress.currentPassage = Math.min(passageNum + 1, 100);
  delete progress.scrollPositions[passageNum];
  delete progress.pageProgress[passageNum];
  saveProgress(progress);
  return progress;
}

export function setChildName(name) {
  const progress = loadProgress();
  progress.childName = name.trim();
  progress.onboarded = true;
  saveProgress(progress);
  return progress;
}

export function isPassageCompleted(n) {
  return loadProgress().completedPassages.includes(n);
}

export function getPageProgress(passageNum) {
  const p = loadProgress();
  return p.pageProgress[passageNum] || { visited: [], currentPage: 0 };
}

export function markPageVisited(passageNum, pageIndex, totalPages) {
  const progress = loadProgress();
  if (!progress.pageProgress[passageNum]) {
    progress.pageProgress[passageNum] = { visited: [], currentPage: 0 };
  }
  const pp = progress.pageProgress[passageNum];
  if (!pp.visited.includes(pageIndex)) pp.visited.push(pageIndex);
  pp.currentPage = pageIndex;
  pp.totalPages = totalPages;
  saveProgress(progress);
  return pp;
}

export function allPagesVisited(passageNum, totalPages) {
  const pp = getPageProgress(passageNum);
  return pp.visited.length >= totalPages;
}

export function setReadingPassage(n) {
  const progress = loadProgress();
  progress.lastReadPassage = n;
  saveProgress(progress);
}

export function verifyRefreshPassword(pw) {
  return pw === REFRESH_PASSWORD;
}

export { REFRESH_PASSWORD };
