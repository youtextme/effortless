/**
 * Telemetry ring buffer — self-learning signal (local only).
 */

const STORAGE_KEY = 'ws_platform_telemetry';
const MAX_EVENTS = 200;

export function createTelemetry({ storage } = {}) {
  const mem = { raw: null };
  const store = storage || (typeof localStorage !== 'undefined'
    ? localStorage
    : {
      getItem: () => mem.raw,
      setItem: (_, v) => { mem.raw = v; },
      removeItem: () => { mem.raw = null; },
    });

  function load() {
    try {
      const raw = store.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save(events) {
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    } catch {
      /* quota — drop silently */
    }
  }

  return {
    record(event) {
      const events = load();
      events.push(event);
      save(events);
    },
    snapshot() {
      return load();
    },
    clear() {
      store.removeItem(STORAGE_KEY);
    },
  };
}
