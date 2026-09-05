const STORAGE_KEY = 'wordspark_progress';

const defaultProgress = () => ({
  currentDay: 1,
  completedDays: [],
  streak: 0,
  lastCompletedDate: null,
  totalWordsLearned: 0,
  childName: '',
});

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return { ...defaultProgress(), ...JSON.parse(raw) };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function completeDay(day, wordsCount = 10) {
  const progress = loadProgress();
  const today = new Date().toISOString().split('T')[0];

  if (!progress.completedDays.includes(day)) {
    progress.completedDays.push(day);
    progress.totalWordsLearned += wordsCount;
  }

  if (progress.lastCompletedDate) {
    const last = new Date(progress.lastCompletedDate);
    const now = new Date(today);
    const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      progress.streak += 1;
    } else if (diffDays > 1) {
      progress.streak = 1;
    }
  } else {
    progress.streak = 1;
  }

  progress.lastCompletedDate = today;
  if (day >= progress.currentDay) {
    progress.currentDay = Math.min(day + 1, 100);
  }

  saveProgress(progress);
  return progress;
}

export function setChildName(name) {
  const progress = loadProgress();
  progress.childName = name.trim();
  saveProgress(progress);
  return progress;
}

export function isDayCompleted(day) {
  return loadProgress().completedDays.includes(day);
}

export function getCurrentDay() {
  const progress = loadProgress();
  return progress.currentDay;
}
