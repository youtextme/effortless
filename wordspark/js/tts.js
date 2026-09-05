/**
 * Web Speech API — pronunciation and passage voiceover.
 */

let speaking = false;
let utteranceQueue = [];

export function isTTSAvailable() {
  return 'speechSynthesis' in window;
}

export function speak(text, { rate = 0.9, onEnd } = {}) {
  if (!isTTSAvailable()) return false;
  stopSpeaking();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  u.pitch = 1;
  const voices = speechSynthesis.getVoices();
  const en = voices.find((v) => v.lang.startsWith('en') && v.name.includes('Google'))
    || voices.find((v) => v.lang.startsWith('en'));
  if (en) u.voice = en;
  if (onEnd) u.onend = onEnd;
  speechSynthesis.speak(u);
  speaking = true;
  return true;
}

export function speakWord(word) {
  return speak(word, { rate: 0.85 });
}

export function speakPassage(text, onEnd) {
  return speak(text, { rate: 0.88, onEnd });
}

export function stopSpeaking() {
  if (isTTSAvailable()) {
    speechSynthesis.cancel();
  }
  speaking = false;
  utteranceQueue = [];
}

export function isSpeaking() {
  return speaking || (isTTSAvailable() && speechSynthesis.speaking);
}

if (typeof window !== 'undefined' && isTTSAvailable()) {
  speechSynthesis.getVoices();
  window.addEventListener('voiceschanged', () => speechSynthesis.getVoices());
}
