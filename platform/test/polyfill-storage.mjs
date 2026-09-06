/**
 * Node/CI polyfill — localStorage + minimal document for component health().
 */
if (typeof globalThis.localStorage === 'undefined') {
  const mem = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return mem.has(key) ? mem.get(key) : null;
    },
    setItem(key, value) {
      mem.set(String(key), String(value));
    },
    removeItem(key) {
      mem.delete(String(key));
    },
    clear() {
      mem.clear();
    },
  };
}

if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    documentElement: { lang: 'en' },
    body: {},
    createElement(tag) {
      if (tag === 'canvas') return { getContext: () => ({ fillRect() {} }) };
      return {
        tagName: String(tag).toUpperCase(),
        hidden: false,
        className: '',
        style: {},
        textContent: '',
        children: [],
        getAttribute() { return null; },
        hasAttribute() { return false; },
        querySelector() { return null; },
        querySelectorAll() { return []; },
      };
    },
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
}
