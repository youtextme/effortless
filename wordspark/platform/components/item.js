/**
 * Item component — question-type registry for quiz and later exercises.
 */

import { createItemRegistry } from '../kernel/items.js';
import { defaultItemTypes } from './item-packs.js';

export const ItemComponent = {
  id: 'item',
  version: '1.0.0',
  dependencies: [],
  init(ctx) {
    const items = createItemRegistry();
    for (const pack of defaultItemTypes()) {
      const result = items.register(pack);
      if (!result.ok) {
        ctx.emit('item.failed', 'item', { error: result.error, id: pack?.id });
      }
    }
    ctx.item = items;
  },
  health() {
    const items = createItemRegistry();
    for (const pack of defaultItemTypes()) items.register(pack);
    return items.health();
  },
};
