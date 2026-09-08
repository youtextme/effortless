import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CapabilityComponent } from './capability.js';
import { createPassagesCapability, createWordsCapability, defaultPacks } from './capability-packs.js';
import { createExerciseCapability, createCapabilityRegistry, renderCatalogHtml } from '../kernel/capabilities.js';
import { createContext } from '../kernel/context.js';
import * as bus from '../kernel/bus.js';
import { createPolicy } from '../kernel/policy.js';
import { createTelemetry } from '../kernel/telemetry.js';
import * as registry from '../kernel/registry.js';
import { StorageComponent } from './storage.js';

const here = dirname(fileURLToPath(import.meta.url));

test('story:passages-are-capabilities component:capability 100 passages and 1000 words register as catalogs', async () => {
  registry.reset();
  const ctx = createContext({
    bus,
    telemetry: createTelemetry(),
    policy: createPolicy(),
    registry,
  });
  await StorageComponent.init(ctx);
  await CapabilityComponent.init(ctx);
  assert.equal(CapabilityComponent.id, 'capability');
  assert.equal(defaultPacks().length, 2);
  assert.equal(ctx.capability.listItems('passages').length, 100);
  assert.equal(ctx.capability.listItems('words').length, 1000);
  assert.equal(ctx.capability.open('passages', '2').action, 'read-passage');
  assert.equal(ctx.capability.open('passages', '2').day, 2);
  assert.equal(ctx.capability.open('passages', '999').action, 'unknown');
  assert.equal(ctx.capability.open('words', '1:analyze').action, 'none');
  assert.equal(ctx.capability.dispatch(ctx.capability.open('words', '1:analyze')), true);
  assert.equal(CapabilityComponent.health().ok, true);
  const passagesHealth = createPassagesCapability().health();
  const wordsHealth = createWordsCapability().health();
  assert.equal(passagesHealth.ok, true);
  assert.equal(wordsHealth.ok, true);
  const done = createPassagesCapability(() => ({ completedPassages: [1] })).list();
  assert.equal(done[0].done, true);
});

test('story:extra-capability-registers-without-shell-fork component:capability math stubs list without shell ifs', () => {
  const reg = createCapabilityRegistry();
  for (const pack of defaultPacks(() => ({ completedPassages: [] }))) {
    reg.register(pack);
  }
  const math = createExerciseCapability({
    id: 'math',
    label: 'Math',
    list: () => [{ id: 'n1', title: 'Number bonds to 10', done: false }],
    open: (id) => ({ action: 'open-exercise', exerciseId: id }),
  });
  reg.register(math);
  assert.equal(reg.listItems('math').length, 1);
  const html = renderCatalogHtml(reg.listItems('math'), math);
  assert.match(html, /Number bonds to 10/);
  assert.equal(reg.catalogs().some((c) => c.id === 'math'), false);
  const shell = readFileSync(join(here, '../shell.js'), 'utf8');
  assert.equal(/if \(id === 'math'\)/.test(shell), false);
  assert.match(shell, /renderCatalog\(/);
  assert.match(shell, /capability\.dispatch/);
  assert.doesNotMatch(shell, /VOCABULARY\.map\(\(d\) =>/);
  assert.doesNotMatch(shell, /function renderPassageList/);
  assert.doesNotMatch(shell, /function renderWordsList/);
});
