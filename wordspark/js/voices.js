/**
 * Parent reader voices — warm adult pacing, 6 rotating personas.
 */

const PERSONA_COUNT = 6;

/** Slightly slower than adult normal — like reading to a child, not robotic crawl. */
export const PARENT_RATES = {
  passage: 0.91,
  word: 0.86,
  example: 0.93,
  default: 0.9,
};

const PERSONAS = [
  { id: 'mom-warm', label: 'Mom', pitch: 1.04, prefer: ['samantha', 'karen', 'jenny', 'aria', 'zira', 'susan', 'victoria', 'female', 'google us english'] },
  { id: 'dad-calm', label: 'Dad', pitch: 0.96, prefer: ['daniel', 'guy', 'david', 'mark', 'james', 'male', 'google uk english male', 'aaron'] },
  { id: 'mom-bright', label: 'Mom', pitch: 1.06, prefer: ['kate', 'serena', 'samantha', 'moira', 'tessa', 'google uk english female'] },
  { id: 'dad-deep', label: 'Dad', pitch: 0.94, prefer: ['fred', 'ralph', 'tom', 'microsoft david', 'google us english male', 'daniel'] },
  { id: 'mom-gentle', label: 'Mom', pitch: 1.02, prefer: ['fiona', 'karen', 'samantha', 'microsoft jenny', 'natural', 'neural'] },
  { id: 'dad-steady', label: 'Dad', pitch: 0.98, prefer: ['alex', 'microsoft guy', 'daniel', 'google uk english male', 'microsoft mark'] },
];

const BLOCKLIST = ['espeak', 'compact', 'android', 'pico', 'flite'];

let voicePool = [];
let voicesReady = false;

function allVoices() {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices();
}

function scoreVoice(voice) {
  const name = voice.name.toLowerCase();
  let score = 0;
  if (voice.lang.startsWith('en')) score += 5;
  if (voice.localService) score += 12;
  if (name.includes('natural') || name.includes('neural') || name.includes('premium')) score += 25;
  if (name.includes('google')) score += 14;
  if (name.includes('microsoft')) score += 12;
  if (name.includes('samantha') || name.includes('karen') || name.includes('jenny')) score += 10;
  if (name.includes('daniel') || name.includes('guy') || name.includes('david')) score += 10;
  if (BLOCKLIST.some((b) => name.includes(b))) score -= 100;
  return score;
}

function matchPersona(persona, voices) {
  const used = new Set();
  for (const key of persona.prefer) {
    const hit = voices.find((v) => {
      if (used.has(v.name)) return false;
      return v.name.toLowerCase().includes(key) || v.voiceURI.toLowerCase().includes(key);
    });
    if (hit) {
      used.add(hit.name);
      return hit;
    }
  }
  return null;
}

export function refreshVoicePool() {
  const voices = allVoices()
    .filter((v) => v.lang.startsWith('en'))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a));

  const pool = [];
  const usedNames = new Set();

  for (const persona of PERSONAS) {
    const voice = matchPersona(persona, voices);
    if (voice && !usedNames.has(voice.name)) {
      pool.push({ ...persona, voice });
      usedNames.add(voice.name);
    }
  }

  // Fill remaining slots with best unused voices (alternate feel via pitch)
  for (const voice of voices) {
    if (pool.length >= PERSONA_COUNT) break;
    if (usedNames.has(voice.name)) continue;
    const persona = PERSONAS[pool.length % PERSONAS.length];
    pool.push({
      ...persona,
      id: `${persona.id}-${pool.length}`,
      voice,
    });
    usedNames.add(voice.name);
  }

  if (!pool.length && voices.length) {
    pool.push({ ...PERSONAS[0], voice: voices[0] });
  }

  voicePool = pool;
  voicesReady = true;
  return voicePool;
}

export function getParentReader(passageNum = 1) {
  if (!voicesReady || !voicePool.length) refreshVoicePool();
  const idx = Math.max(0, (passageNum - 1) % voicePool.length);
  return voicePool[idx] || voicePool[0];
}

export function applyParentVoice(utterance, reader, rate = PARENT_RATES.default) {
  if (!utterance) return;
  utterance.lang = reader?.voice?.lang || 'en-US';
  utterance.rate = rate;
  utterance.pitch = reader?.pitch ?? 1;
  if (reader?.voice) utterance.voice = reader.voice;
}

export function initVoices() {
  if (!('speechSynthesis' in window)) return;
  refreshVoicePool();
  window.speechSynthesis.getVoices();
  window.addEventListener('voiceschanged', () => refreshVoicePool());
}

export function getVoicePoolSize() {
  return voicePool.length;
}
