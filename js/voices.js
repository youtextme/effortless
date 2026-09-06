/**
 * Legacy voices facade — picker lives in platform/speech.
 */

export { speechPolicy, speechPolicy as PARENT_RATES } from '../platform/speech/policy.js';
export {
  pickWarmMother,
  pickWarmMother as getParentReader,
  sessionProfile,
  scoreVoice,
  documentLocale,
  listEnglishVoices,
} from '../platform/speech/voice-picker.js';
export {
  ensureVoicesReady,
  refreshProfile as refreshVoicePool,
  getCurrentProfile,
} from '../platform/speech/engine.js';
