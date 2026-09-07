/**
 * Telemetry ring buffer — self-learning signal (local only).
 */

const STORAGE_KEY = 'ws_platform_telemetry';
const MAX_EVENTS = 200;

export function createTelemetry() {
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function save(events) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
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
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}
