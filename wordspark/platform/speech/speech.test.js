/**
 * Speech mechanics tests — no browser, no speechSynthesis.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitSentences, packByChars, joinPieceText, nextMaxChars, rateForQuality, qualityOfVoice, localeFamily, isAbortResult } from './sentences.js';
import { scoreVoice, pickWarmMother, sessionProfile, documentLocale, listEnglishVoices } from './voice-picker.js';
import { isSilentFromFlags, flagsFromElement, coveringScoreFromFlags } from './visible-text.js';
import { speechPolicy } from './policy.js';
import { getSpeechRate, getPaceId, setPaceId, PACE_RATES } from './pace.js';

const here = dirname(fileURLToPath(import.meta.url));

test('splitSentences keeps a paragraph as readable turns', () => {
  const parts = splitSentences('Hello there. How are you? I am fine!');
  assert.deepEqual(parts, ['Hello there.', 'How are you?', 'I am fine!']);
  assert.deepEqual(splitSentences(''), []);
  assert.deepEqual(splitSentences('   '), []);
  const withDr = splitSentences('Dr. Smith sat down. Then he spoke.');
  assert.ok(withDr.length >= 1);
});

test('packByChars never splits a piece and stays under cap when possible', () => {
  const pieces = [
    { text: 'One two.' },
    { text: 'Three four five.' },
    { text: 'Six.' },
  ];
  const packed = packByChars(pieces, 20);
  assert.ok(packed.length >= 2);
  for (const chunk of packed) {
    const joined = joinPieceText(chunk);
    assert.ok(joined.length <= 20 || chunk.length === 1);
  }
});

test('nextMaxChars shrinks toward min', () => {
  assert.equal(nextMaxChars(100, 0.6, 48), 60);
  assert.equal(nextMaxChars(50, 0.6, 48), 48);
});

test('qualityOfVoice classifies neural / network / compact / local', () => {
  assert.equal(qualityOfVoice({ name: 'Microsoft Aria Neural', localService: true }), 'neural');
  assert.equal(qualityOfVoice({ name: 'Google US English', localService: false }), 'network');
  assert.equal(qualityOfVoice({ name: 'eSpeak compact', localService: true }), 'compact');
  assert.equal(qualityOfVoice({ name: 'Samantha', localService: true }), 'local');
});

test('rateForQuality uses policy bands only', () => {
  assert.equal(rateForQuality(speechPolicy.rates, 'network'), speechPolicy.rates.network);
  assert.equal(rateForQuality(speechPolicy.rates, 'unknown'), speechPolicy.rates.default);
});

test('localeFamily is mechanized from BCP-47', () => {
  assert.equal(localeFamily('en-GB'), 'en');
  assert.equal(localeFamily('en_US'), 'en');
});

test('story:warm-mother-voice pickWarmMother prefers Google female when network voices exist', () => {
  const voices = [
    { name: 'eSpeak Male', lang: 'en-US', voiceURI: 'espeak', localService: true },
    { name: 'Google UK English Female', lang: 'en-GB', voiceURI: 'google-uk-f', localService: false },
    { name: 'Google UK English Male', lang: 'en-GB', voiceURI: 'google-uk-m', localService: false },
  ];
  const picked = pickWarmMother(voices, 'en-GB');
  assert.equal(picked.voiceURI, 'google-uk-f');
  assert.ok(scoreVoice(voices[1], 'en-GB') > scoreVoice(voices[2], 'en-GB'));
  assert.ok(scoreVoice(voices[1], 'en-GB') > scoreVoice(voices[0], 'en-US'));
});

test('documentLocale and listEnglishVoices use document/nav when present', () => {
  assert.equal(documentLocale({ documentElement: { lang: 'en-GB' } }, { language: 'fr' }), 'en-GB');
  assert.equal(documentLocale(null, { language: 'en-AU' }), 'en-AU');
  assert.equal(documentLocale(null, null), 'en');
  const voices = [
    { name: 'A', lang: 'en-US', voiceURI: 'a' },
    { name: 'B', lang: 'fr-FR', voiceURI: 'b' },
  ];
  assert.equal(listEnglishVoices(voices, 'en-US').length, 1);
  assert.equal(pickWarmMother([]), null);
  assert.equal(scoreVoice(null), -Infinity);
  const underscored = { name: 'Jenny', lang: 'en_us', voiceURI: 'j', localService: true };
  assert.ok(scoreVoice(underscored, 'en-us') > scoreVoice({ name: 'X', lang: 'de', voiceURI: 'x' }, 'en-us'));
});

test('pickWarmMother prefers Samantha when only Apple voices exist', () => {
  const voices = [
    { name: 'Alex', lang: 'en-US', voiceURI: 'alex', localService: true },
    { name: 'Samantha', lang: 'en-US', voiceURI: 'samantha', localService: true, default: true },
    { name: 'Daniel', lang: 'en-GB', voiceURI: 'daniel', localService: true },
  ];
  const picked = pickWarmMother(voices, 'en-US');
  assert.equal(picked.voiceURI, 'samantha');
});

test('sticky URI wins so the voice does not rotate', () => {
  const voices = [
    { name: 'Samantha', lang: 'en-US', voiceURI: 'samantha', localService: true },
    { name: 'Karen', lang: 'en-AU', voiceURI: 'karen', localService: true },
  ];
  const picked = pickWarmMother(voices, 'en-US', 'karen');
  assert.equal(picked.voiceURI, 'karen');
});

test('story:one-rate-per-session sessionProfile uses parent home pace for title and body', () => {
  const voice = { name: 'Google UK English Female', lang: 'en-GB', voiceURI: 'g', localService: false };
  const profile = sessionProfile(voice, 'en-GB');
  assert.equal(profile.rate, getSpeechRate());
  assert.equal(profile.rate, PACE_RATES.home);
  assert.equal(profile.pitch, speechPolicy.pitch);
});

test('robot voices lose to a warm English voice even if sticky', () => {
  const voices = [
    { name: 'eSpeak Generic', lang: 'en-GB', voiceURI: 'espeak', localService: true, default: true },
    { name: 'Google US English', lang: 'en-US', voiceURI: 'google-us', localService: false },
  ];
  const picked = pickWarmMother(voices, 'en-US', 'espeak');
  assert.equal(picked.voiceURI, 'google-us');
});

test('parents can raise the shared title-and-body pace', () => {
  const mem = {
    store: { wordspark_speech_pace: 'quick' },
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
  };
  assert.equal(getSpeechRate(mem), PACE_RATES.quick);
  assert.ok(PACE_RATES.quick > PACE_RATES.home);
  assert.equal(getPaceId({ getItem: () => null }), 'home');
  assert.equal(setPaceId('brisk', mem), 'brisk');
  assert.equal(getPaceId(mem), 'brisk');
  assert.equal(setPaceId('nope', mem), 'home');
});

test('kill experiment: only compact/espeak still returns a voice', () => {
  const picked = pickWarmMother([
    { name: 'eSpeak Compact', lang: 'en-GB', voiceURI: 'espeak-compact', localService: true },
  ], 'en-GB');
  assert.ok(picked);
  assert.equal(picked.voiceURI, 'espeak-compact');
});

test('story:hidden-headings-not-spoken hidden passage-h2 flags are silent — not spoken', () => {
  const el = {
    tagName: 'H2',
    hidden: false,
    className: 'passage-h2',
    getAttribute: (k) => (k === 'aria-hidden' ? 'true' : null),
    hasAttribute: (k) => k === 'aria-hidden',
  };
  const flags = flagsFromElement(el, { display: 'none', visibility: 'visible', opacity: '1' });
  assert.equal(isSilentFromFlags(flags), true);
});

test('visible paragraph flags are spoken', () => {
  const el = {
    tagName: 'P',
    hidden: false,
    className: '',
    getAttribute: () => null,
    hasAttribute: () => false,
  };
  const flags = flagsFromElement(el, { display: 'block', visibility: 'visible', opacity: '1' });
  assert.equal(isSilentFromFlags(flags), false);
});

test('data-speech-skip and aria-hidden are silent', () => {
  const skip = flagsFromElement({
    tagName: 'BUTTON',
    hidden: false,
    className: 'listen-dock',
    getAttribute: () => null,
    hasAttribute: (k) => k === 'data-speech-skip',
  }, { display: 'flex', visibility: 'visible', opacity: '1' });
  assert.equal(isSilentFromFlags(skip), true);

  const aria = flagsFromElement({
    tagName: 'DIV',
    hidden: false,
    className: 'scroll-fade',
    getAttribute: (k) => (k === 'aria-hidden' ? 'true' : null),
    hasAttribute: () => false,
  }, { display: 'block', visibility: 'visible', opacity: '1' });
  assert.equal(isSilentFromFlags(aria), true);
});

test('story:listen-on-every-surface index.html has a global listen dock and speech surfaces on every page', () => {
  const html = readFileSync(join(here, '../../index.html'), 'utf8');
  assert.match(html, /id="btn-listen"/);
  assert.match(html, /class="listen-dock"/);
  const surfaces = [
    'reading-scroll',
    'screen-quiz',
    'screen-complete',
    'name-modal',
    'word-sheet',
    'panel-passages',
    'panel-words',
    'panel-certificates',
  ];
  for (const id of surfaces) {
    assert.match(html, new RegExp(`id="${id}"[^>]*data-speech-surface`));
  }
  assert.doesNotMatch(html, /id="btn-read-aloud"/);
});

test('story:abort-does-not-restart component:speech canceled utterances are abort not retry', () => {
  assert.equal(isAbortResult('interrupted', speechPolicy.abortUtteranceErrors), true);
  assert.equal(isAbortResult('canceled', speechPolicy.abortUtteranceErrors), true);
  assert.equal(isAbortResult('network', speechPolicy.abortUtteranceErrors), false);
});

test('story:highlight-tracks-spoken-word Listen paints one word, not the whole paragraph', () => {
  const css = readFileSync(join(here, '../../css/app.css'), 'utf8');
  const engine = readFileSync(join(here, 'engine.js'), 'utf8');
  assert.match(css, /\.speech-word-active\s*\{/);
  assert.equal(css.includes('speech-chunk-active'), false);
  assert.equal(engine.includes('markChunk'), false);
  assert.equal(engine.includes('speech-chunk-active'), false);
  assert.match(engine, /activateSpan\(spans\[indexAtChar/);
});

test('story:voices-ready-before-speak engine waits for voices and aborts stale sessions', () => {
  const src = readFileSync(join(here, 'engine.js'), 'utf8');
  assert.match(src, /await ensureVoicesReady\(\)/);
  assert.match(src, /shouldAbortAfterAsyncWait/);
  assert.match(src, /planSpeakSession/);
  assert.ok(speechPolicy.timing.voicesWaitMs >= 1000);
});

test('story:speech-stops-on-surface-change shell startQuiz stops speech before overlay', () => {
  const src = readFileSync(join(here, '../shell.js'), 'utf8');
  assert.match(src, /function startQuiz\(/);
  assert.match(src, /ctx\.tts\.stopSpeaking\(\)/);
  const engine = readFileSync(join(here, 'engine.js'), 'utf8');
  assert.match(engine, /shouldStopForSurfaceChange/);
  const quizScore = coveringScoreFromFlags({ hidden: false, position: 'fixed', zIndex: '150' });
  const readingScore = coveringScoreFromFlags({ hidden: false, position: 'static', zIndex: 'auto' });
  assert.ok(quizScore > readingScore, 'quiz overlay must cover the passage for speech lifecycle');
  assert.equal(coveringScoreFromFlags({ hidden: true, position: 'fixed', zIndex: '150' }), -1);
});

test('story:word-sheet-daily-use engine says the word twice then meaning then examples', () => {
  const src = readFileSync(join(here, 'engine.js'), 'utf8');
  const meaningAt = src.indexOf('speechPolicy.wordSheet.meaningSelector');
  const examplesAt = src.indexOf('speechPolicy.wordSheet.examplesSelector');
  assert.ok(meaningAt > 0, 'meaning selector must be read');
  assert.ok(examplesAt > meaningAt, 'examples must be spoken after meaning');
  assert.equal(speechPolicy.wordSheet.repeats, 2);
  assert.equal(speechPolicy.wordSheet.meaningSelector, '.sheet-intro');
  assert.equal(speechPolicy.wordSheet.examplesSelector, '.sheet-scenarios');
  assert.match(speechPolicy.blockSelector, /sheet-intro/);
});

