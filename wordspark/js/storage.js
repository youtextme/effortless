const STORAGE_KEY = 'wordspark_progress';

const defaultProgress = () => ({
  currentPassage: 1,
  completedPassages: [],
  totalWordsLearned: 0,
  childName: '',
  scrollPositions: {},
  lastReadPassage: 1,
});

function migrate(raw) {
  const p = { ...defaultProgress(), ...raw };
  if (raw.completedDays && !raw.completedPassages) {
    p.completedPassages = [...raw.completedDays];
    delete p.completedDays;
  }
  if (raw.currentDay && !raw.currentPassage) {
    p.currentPassage = raw.currentDay;
  }
  if (!p.scrollPositions) p.scrollPositions = {};
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

export function getActivePassage() {
  const p = loadProgress();
  if (p.completedPassages.length >= 100) return 100;
  for (let i = 1; i <= 100; i++) {
    if (!p.completedPassages.includes(i)) return i;
  }
  return p.currentPassage;
}

export function completePassage(passageNum, wordsCount = 10) {
  const progress = loadProgress();
  if (!progress.completedPassages.includes(passageNum)) {
    progress.completedPassages.push(passageNum);
    progress.totalWordsLearned += wordsCount;
  }
  progress.currentPassage = Math.min(passageNum + 1, 100);
  delete progress.scrollPositions[passageNum];
  saveProgress(progress);
  return progress;
}

export function setChildName(name) {
  const progress = loadProgress();
  progress.childName = name.trim();
  saveProgress(progress);
  return progress;
}

export function isPassageCompleted(n) {
  return loadProgress().completedPassages.includes(n);
}

export function saveScrollPosition(passageNum, y) {
  const progress = loadProgress();
  progress.scrollPositions[passageNum] = y;
  progress.lastReadPassage = passageNum;
  saveProgress(progress);
}

export function getScrollPosition(passageNum) {
  return loadProgress().scrollPositions[passageNum] || 0;
}

export function setReadingPassage(n) {
  const progress = loadProgress();
  progress.lastReadPassage = n;
  saveProgress(progress);
}
