/**
 * Capability packs — WordSpark's first catalogs. Later: math, diagrams, more.
 * Add a pack here; do not fork shell listing. Opt into Home with homeTab: true
 * only when the pack has real kid content.
 */

import { VOCABULARY } from '../../js/data/words.js';
import { getTopicTitle } from '../../js/data/topics.js';
import { createCatalogCapability } from '../kernel/capabilities.js';

export function createPassagesCapability(getProgress) {
  return createCatalogCapability({
    id: 'passages',
    label: 'Passages',
    kind: 'catalog',
    homeTab: true,
    row: 'title',
    list() {
      const completed = getProgress?.()?.completedPassages || [];
      return VOCABULARY.map((d) => ({
        id: String(d.day),
        title: getTopicTitle(d.day),
        done: completed.includes(d.day),
      }));
    },
    get(itemId) {
      const day = VOCABULARY.find((d) => String(d.day) === String(itemId));
      if (!day) return null;
      return {
        id: String(day.day),
        title: getTopicTitle(day.day),
        payload: { day: day.day, dayData: day },
      };
    },
    open(itemId) {
      const item = this.get(itemId);
      if (!item) return { action: 'unknown' };
      return { action: 'read-passage', day: item.payload.day };
    },
    health() {
      return {
        ok: VOCABULARY.length === 100,
        status: `${VOCABULARY.length} passages`,
      };
    },
  });
}

export function createWordsCapability(getProgress) {
  return createCatalogCapability({
    id: 'words',
    label: 'Words',
    kind: 'catalog',
    homeTab: true,
    row: 'word',
    list() {
      const completed = getProgress?.()?.completedPassages || [];
      const rows = [];
      let index = 0;
      for (const day of VOCABULARY) {
        const done = completed.includes(day.day);
        for (const w of day.words) {
          index += 1;
          rows.push({
            id: `${day.day}:${w.word}`,
            title: w.word,
            subtitle: w.meaning,
            done,
            meta: { index, day: day.day },
          });
        }
      }
      return rows;
    },
    open() {
      return { action: 'none' };
    },
    health() {
      const count = VOCABULARY.reduce((n, d) => n + d.words.length, 0);
      return { ok: count === 1000, status: `${count} words` };
    },
  });
}

export function defaultPacks(getProgress) {
  return [
    createWordsCapability(getProgress),
    createPassagesCapability(getProgress),
  ];
}
