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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function speakOnce(text, { rate = 0.88 } = {}) {
  return new Promise((resolve) => {
    if (!isTTSAvailable()) {
      resolve();
      return;
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    const voice = getVoice();
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
    speaking = true;
  });
}

export function speak(text, { rate = 0.9, onEnd } = {}) {
  if (!isTTSAvailable()) return false;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;
  const voice = getVoice();
  if (voice) u.voice = voice;
  u.onend = onEnd;
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

/** Pronounce word twice (1s gap), then read example sentences directly. */
export async function speakWordWithExamples(word, examples, onEnd) {
  if (!isTTSAvailable()) return false;
  stopSpeaking();
  speaking = true;

  await speakOnce(word, { rate: 0.75 });
  await delay(1000);
  await speakOnce(word, { rate: 0.75 });
  await delay(400);

  for (const sentence of examples.slice(0, 2)) {
    await speakOnce(sentence, { rate: 0.9 });
    await delay(300);
  }

  speaking = false;
  onEnd?.();
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
