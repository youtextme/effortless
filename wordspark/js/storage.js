const STORAGE_KEY = 'wordspark_progress';
const REFRESH_PASSWORD = '1989';

export const HOME_TAB_IDS = Object.freeze(['words', 'passages', 'settings']);
export const RESUME_SURFACES = Object.freeze(['reading', 'home', 'quiz']);

export function defaultResume() {
  return {
    passage: 1,
    scrollY: 0,
    surface: 'reading',
    homeTab: 'passages',
    quizIndex: 0,
    updatedAt: 0,
  };
}

const defaultProgress = () => ({
  currentPassage: 1,
  completedPassages: [],
  totalWordsLearned: 0,
  childName: '',
  scrollPositions: {},
  lastReadPassage: 1,
  pageProgress: {},
  onboarded: false,
  resume: defaultResume(),
});

function normalizeResume(raw) {
  const base = defaultResume();
  const r = { ...base, ...(raw && typeof raw === 'object' ? raw : {}) };
  r.passage = Math.min(100, Math.max(1, Number(r.passage) || 1));
  r.scrollY = Math.max(0, Number(r.scrollY) || 0);
  r.quizIndex = Math.max(0, Number(r.quizIndex) || 0);
  r.updatedAt = Number(r.updatedAt) || 0;
  if (!RESUME_SURFACES.includes(r.surface)) r.surface = 'reading';
  if (!HOME_TAB_IDS.includes(r.homeTab)) r.homeTab = 'passages';
  return r;
}

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
  p.resume = normalizeResume(raw.resume || {
    passage: p.lastReadPassage || p.currentPassage || 1,
    scrollY: p.scrollPositions?.[p.lastReadPassage] || 0,
    surface: 'reading',
    homeTab: 'passages',
    quizIndex: 0,
  });
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
  progress.resume = normalizeResume({
    ...progress.resume,
    passage: progress.currentPassage,
    scrollY: 0,
    surface: 'reading',
    quizIndex: 0,
    updatedAt: Date.now(),
  });
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
  progress.resume = normalizeResume({
    ...progress.resume,
    passage: n,
    updatedAt: Date.now(),
  });
  saveProgress(progress);
}

export function saveResume(partial = {}) {
  const progress = loadProgress();
  const next = normalizeResume({
    ...progress.resume,
    ...partial,
    updatedAt: Date.now(),
  });
  progress.resume = next;
  progress.lastReadPassage = next.passage;
  if (next.surface === 'reading') {
    progress.scrollPositions[next.passage] = next.scrollY;
  }
  saveProgress(progress);
  return next;
}

export function loadResume() {
  return normalizeResume(loadProgress().resume);
}

export function getBootTarget() {
  const p = loadProgress();
  const resume = loadResume();
  if (resume.surface === 'quiz' && p.completedPassages.includes(resume.passage)) {
    return normalizeResume({
      passage: getActivePassage(),
      scrollY: 0,
      surface: 'reading',
      homeTab: resume.homeTab,
      quizIndex: 0,
    });
  }
  if (resume.surface === 'home') return resume;
  if (resume.surface === 'quiz') return resume;
  const passage = resume.passage || p.lastReadPassage || getActivePassage();
  const scrollY = resume.scrollY || p.scrollPositions?.[passage] || 0;
  return normalizeResume({
    ...resume,
    passage,
    scrollY,
    surface: 'reading',
  });
}

export function verifyRefreshPassword(pw) {
  return pw === REFRESH_PASSWORD;
}

export { REFRESH_PASSWORD };
