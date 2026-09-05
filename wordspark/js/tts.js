/**
 * Web Speech API — pronunciation and passage voiceover.
 */

let speaking = false;

export function isTTSAvailable() {
  return 'speechSynthesis' in window;
}

function getVoice() {
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang.startsWith('en') && v.name.includes('Google'))
    || voices.find((v) => v.lang.startsWith('en'));
}

export function speak(text, { rate = 0.9, onEnd } = {}) {
  if (!isTTSAvailable()) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const voice = getVoice();
  if (voice) u.voice = voice;
  if (onEnd) u.onend = onEnd;
  speechSynthesis.speak(u);
  speaking = true;
  return true;
}

export function speakWord(word) {
  return speak(word, { rate: 0.85 });
}

export function speakSequence(text, onEnd) {
  if (!isTTSAvailable()) return false;
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.88;
  const voice = getVoice();
  if (voice) u.voice = voice;
  u.onend = () => { speaking = false; onEnd?.(); };
  speechSynthesis.speak(u);
  speaking = true;
  return true;
}

export function speakPassage(text, onEnd) {
  return speakSequence(text, onEnd);
}

export function stopSpeaking() {
  if (isTTSAvailable()) speechSynthesis.cancel();
  speaking = false;
}

export function isSpeaking() {
  return speaking || (isTTSAvailable() && speechSynthesis.speaking);
}

if (typeof window !== 'undefined' && isTTSAvailable()) {
  speechSynthesis.getVoices();
  window.addEventListener('voiceschanged', () => speechSynthesis.getVoices());
}
