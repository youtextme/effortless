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
  return speakParts([text], { onEnd });
}

export function speakParts(parts, { rate = 0.88, onEnd } = {}) {
  if (!isTTSAvailable() || !parts.length) return false;
  stopSpeaking();

  let index = 0;
  const speakNext = () => {
    if (index >= parts.length) {
      speaking = false;
      onEnd?.();
      return;
    }

    const text = parts[index];
    const isWord = index === 0 && parts.length > 1 && !text.includes(' ');
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = isWord ? 0.78 : rate;
    const voice = getVoice();
    if (voice) u.voice = voice;
    u.onend = () => {
      index += 1;
      speakNext();
    };
    speechSynthesis.speak(u);
    speaking = true;
  };

  speakNext();
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
