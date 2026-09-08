import test from 'node:test';
import assert from 'node:assert/strict';
import { ItemComponent } from './item.js';
import { createContext } from '../kernel/context.js';
import { createTelemetry } from '../kernel/telemetry.js';
import { createPolicy } from '../kernel/policy.js';
import * as bus from '../kernel/bus.js';
import * as registry from '../kernel/registry.js';

test('component:item init onto context', async () => {
  const ctx = createContext({
    bus,
    telemetry: createTelemetry(),
    policy: createPolicy(),
    registry,
  });
  await ItemComponent.init(ctx);
  assert.equal(typeof ctx.item.renderHtml, 'function');
  assert.equal(typeof ctx.item.grade, 'function');
  assert.equal(ItemComponent.health().ok, true);
  const html = ctx.item.renderHtml({
    itemType: 'blank',
    stem: 'Fill ____.',
    choices: [{ text: 'this', correct: true }],
  });
  assert.match(html, /quiz-blank-slot/);
});
