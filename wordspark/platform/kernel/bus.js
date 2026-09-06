/**
 * Event bus — components communicate without direct imports.
 */

const listeners = new Map();

export function on(type, handler) {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(handler);
  return () => listeners.get(type)?.delete(handler);
}

export function emit(type, event) {
  const set = listeners.get(type);
  if (!set) return;
  for (const handler of set) {
    try {
      handler(event);
    } catch (err) {
      console.error(`[bus] handler error on ${type}`, err);
    }
  }
}

export function clear() {
  listeners.clear();
}
