import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isRobotVoice,
  pickBestVoice,
  scoreVoice,
} from './best-voice.js';

function voice(partial) {
  return {
    name: 'Voice',
    lang: 'en-US',
    voiceURI: 'uri',
    localService: true,
    default: false,
    ...partial,
  };
}

test('robot signals are rejected', () => {
  assert.equal(isRobotVoice(voice({ name: 'eSpeak Generic' })), true);
  assert.equal(isRobotVoice(voice({ name: 'Zarvox' })), true);
  assert.equal(isRobotVoice(voice({ name: 'Google US English' })), false);
});

test('picks the warmest English voice, never a novelty robot when a better one exists', () => {
  const picked = pickBestVoice([
    voice({ name: 'eSpeak Generic', voiceURI: 'espeak', lang: 'en-GB', default: true }),
    voice({ name: 'Zarvox', voiceURI: 'zarvox' }),
    voice({
      name: 'Google US English',
      voiceURI: 'google-us',
      localService: false,
    }),
  ]);
  assert.equal(picked.voiceURI, 'google-us');
  assert.ok(scoreVoice(picked) > scoreVoice(voice({ name: 'eSpeak Generic' })));
});

test('sticky URI wins so the voice does not rotate', () => {
  const voices = [
    voice({ name: 'Samantha', voiceURI: 'samantha', localService: true }),
    voice({ name: 'Google US English', voiceURI: 'google-us', localService: false }),
  ];
  const picked = pickBestVoice(voices, { stickyUri: 'samantha' });
  assert.equal(picked.voiceURI, 'samantha');
});

test('kill experiment: only compact/espeak voices still returns a voice', () => {
  const picked = pickBestVoice([
    voice({ name: 'eSpeak Compact', voiceURI: 'espeak-compact', lang: 'en-GB' }),
  ]);
  assert.ok(picked);
  assert.equal(picked.voiceURI, 'espeak-compact');
});
