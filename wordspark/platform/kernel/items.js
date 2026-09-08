/**
 * Question item registry — reusable interaction types.
 * Multiple-choice, fill-in-the-blank, later: match, order, …
 * Quiz (and later math/puzzles) render through this kernel, not shell ifs.
 */

export { escapeHtml } from './capabilities.js';

const ITEM_TYPES = Object.freeze({
  choice: 'choice',
  blank: 'blank',
});

export function normalizeItemType(type) {
  const t = String(type || '').trim() || ITEM_TYPES.choice;
  switch (t) {
    case ITEM_TYPES.choice:
    case ITEM_TYPES.blank:
      return t;
    default: {
      const never = t;
      throw new Error(`Unknown item type: ${never}`);
    }
  }
}

export function validateItemType(def) {
  if (!def || typeof def !== 'object') throw new Error('Item type must be an object');
  if (!def.id || !/^[a-z][a-z0-9-]*$/.test(def.id)) {
    throw new Error('Item type id must be kebab-case');
  }
  normalizeItemType(def.id);
  if (typeof def.renderHtml !== 'function') {
    throw new Error(`Item type ${def.id} is missing renderHtml()`);
  }
  if (typeof def.grade !== 'function') {
    throw new Error(`Item type ${def.id} is missing grade()`);
  }
  return true;
}

function safeList(items) {
  return Array.isArray(items) ? items : [];
}

export function createItemRegistry() {
  const types = new Map();

  function get(id) {
    try {
      return types.get(normalizeItemType(id)) || null;
    } catch {
      return null;
    }
  }

  return {
    register(def) {
      try {
        validateItemType(def);
        types.set(def.id, def);
        return { ok: true, id: def.id };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    list() {
      return [...types.values()].map((t) => ({ id: t.id, label: t.label || t.id }));
    },
    get,
    renderHtml(item) {
      const typeId = item?.itemType || item?.type || ITEM_TYPES.choice;
      const type = get(typeId);
      if (!type) return '';
      try {
        return String(type.renderHtml(item) || '');
      } catch {
        return '';
      }
    },
    grade(item, response) {
      const typeId = item?.itemType || item?.type || ITEM_TYPES.choice;
      const type = get(typeId);
      if (!type) return { ok: false, correct: false };
      try {
        const result = type.grade(item, response);
        return {
          ok: true,
          correct: Boolean(result?.correct),
        };
      } catch {
        return { ok: false, correct: false };
      }
    },
    health() {
      const ids = [...types.keys()];
      return {
        ok: ids.includes(ITEM_TYPES.choice) && ids.includes(ITEM_TYPES.blank),
        status: `${ids.length} item types`,
        ids,
      };
    },
  };
}

export function defaultItemIds() {
  return safeList(Object.values(ITEM_TYPES));
}

export { ITEM_TYPES };
