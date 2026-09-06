/**
 * Policy gate — self-governing rules for side effects and events.
 */

const BLOCKED_EVENT_PREFIXES = ['pii.', 'external.upload'];

const ALLOWED_NETWORK = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
];

export function createPolicy() {
  return {
    allowEvent(type, component, payload) {
      if (BLOCKED_EVENT_PREFIXES.some((p) => type.startsWith(p))) {
        console.warn(`[policy] blocked event ${type} from ${component}`);
        return false;
      }
      if (type === 'network.request' && payload?.host) {
        if (!ALLOWED_NETWORK.includes(payload.host)) {
          console.warn(`[policy] blocked network to ${payload.host}`);
          return false;
        }
      }
      return true;
    },
    allowStorageWrite(key) {
      return key.startsWith('wordspark_') || key.startsWith('ws_platform_');
    },
    childDataStaysLocal: true,
  };
}
