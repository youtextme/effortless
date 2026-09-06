/**
 * Speech policy — the only knobs. Engine code reads this object; it does not
 * scatter magic numbers or vendor voice names in UI/shell.
 *
 * Changing behavior = change this file, not conditionals in the engine.
 */

export const speechPolicy = Object.freeze({
  storageKey: 'wordspark_speech_voice_uri',

  /** Single session rate bands, keyed by voice quality (not by content type). */
  rates: Object.freeze({
    neural: 0.88,
    network: 0.82,
    local: 0.8,
    compact: 0.76,
    default: 0.82,
  }),

  pitch: 1,
  volume: 1,

  /** Pack utterances toward this size so gaps between speaks stay rare. */
  pack: Object.freeze({
    initialMaxChars: 220,
    minChars: 48,
    shrinkOnError: 0.6,
  }),

  timing: Object.freeze({
    voicesWaitMs: 3000,
    voicesPollMs: 100,
    cancelSettleMs: 80,
    keepAliveMs: 10000,
    iosUnlockText: ' ',
    wordRepeatGapMs: 550,
    surfacePollMs: 200,
  }),

  /**
   * Highlight clock — used when SpeechSynthesis onboundary is late or missing.
   * charsPerSecondAtRate1 is English spoken chars/sec at utterance.rate = 1.
   */
  clock: Object.freeze({
    charsPerSecondAtRate1: 15,
    maxBoundaryStaleMs: 160,
    maxLagWords: 1,
  }),

  wordSheet: Object.freeze({
    leadSelector: '.sheet-word',
    repeats: 2,
  }),

  locale: Object.freeze({
    fallback: 'en',
    englishPrefix: 'en',
  }),

  /**
   * Name/URI substrings → score. Positive = warmer mother-like / higher quality.
   * Not a required-name list: unknown voices still compete on lang + localService.
   */
  voiceSignals: Object.freeze({
    female: 28,
    woman: 22,
    girl: 8,
    samantha: 30,
    karen: 24,
    fiona: 22,
    moira: 20,
    tessa: 20,
    victoria: 16,
    zira: 18,
    jenny: 26,
    aria: 28,
    libby: 24,
    sonia: 18,
    susan: 14,
    kathy: 12,
    grandma: 10,
    mother: 12,
    neural: 26,
    natural: 22,
    premium: 18,
    enhanced: 14,
    google: 18,
    microsoft: 12,
    siri: 10,
    apple: 8,
    male: -18,
    man: -12,
    boy: -10,
    david: -8,
    daniel: -8,
    guy: -10,
    compact: -50,
    espeak: -90,
    pico: -70,
    flite: -70,
    novelty: -80,
    whisper: -40,
    zarvox: -90,
    trinoids: -90,
    boing: -90,
    cellos: -80,
    bells: -80,
    albert: -40,
    'bad news': -80,
    'good news': -80,
  }),

  voiceBonuses: Object.freeze({
    langFamily: 22,
    langExact: 12,
    networkVoice: 16,
    defaultVoice: 6,
  }),

  skipSelectors: Object.freeze([
    '[hidden]',
    '[aria-hidden="true"]',
    '[data-speech-skip]',
    'script',
    'style',
    'svg',
    'noscript',
    'template',
  ]),

  skipTags: Object.freeze(['SCRIPT', 'STYLE', 'SVG', 'NOSCRIPT', 'TEMPLATE', 'IFRAME']),

  skipClassTokens: Object.freeze(['passage-h2', 'scroll-fade', 'scroll-sentinel']),

  surfaceSelector: '[data-speech-surface]',

  abortUtteranceErrors: Object.freeze(['interrupted', 'canceled', 'cancelled', 'not-allowed']),

  /** Visible blocks that form speech turns (DOM query, not hardcoded copy). */
  blockSelector: [
    'p', 'h1', 'h2', 'h3', 'h4', 'li',
    '.example-line', '.sheet-word', '.passage-theme',
    '.quiz-question', '.quiz-choice', '.quiz-counter',
    '.complete-container h2', '.complete-container p',
    '.passage-item-title', '.word-text', '.word-meaning',
    '.sub-header h2', '.modal-panel h2', '.modal-panel p',
    '.cert-card strong',
  ].join(','),
});
