import test from 'node:test';
import assert from 'node:assert/strict';
import * as registry from './registry.js';
import * as bus from './bus.js';
import { createPolicy } from './policy.js';
import { createContext } from './context.js';
import { createTelemetry } from './telemetry.js';
import { createHealth } from './health.js';

test('story:kernel-acyclic-init component:shell dependencies initialize first and cycles throw', async () => {
  registry.reset();
  const order = [];
  registry.register({
    id: 'a',
    dependencies: ['b'],
    async init() { order.push('a'); },
  });
  registry.register({
    id: 'b',
    dependencies: [],
    async init() { order.push('b'); },
    health() { return { ok: true, status: 'b' }; },
  });
  await registry.initAll({});
  assert.deepEqual(order, ['b', 'a']);
  assert.equal(registry.get('b').id, 'b');
  assert.equal(registry.all().length, 2);
  assert.equal(registry.healthAll().b.ok, true);

  registry.reset();
  registry.register({ id: 'x', dependencies: ['y'] });
  registry.register({ id: 'y', dependencies: ['x'] });
  assert.throws(() => registry.resolveInitOrder(), /Circular/);
});

test('story:policy-blocks-pii-events component:storage policy blocks pii and undeclared network', () => {
  const policy = createPolicy();
  assert.equal(policy.allowEvent('pii.export', 'storage', {}), false);
  assert.equal(policy.allowEvent('external.upload', 'storage', {}), false);
  assert.equal(policy.allowEvent('network.request', 'shell', { host: 'evil.example' }), false);
  assert.equal(policy.allowEvent('network.request', 'shell', { host: 'fonts.googleapis.com' }), true);
  assert.equal(policy.allowEvent('reading.loaded', 'reading', {}), true);
  assert.equal(policy.allowStorageWrite('wordspark_progress'), true);
  assert.equal(policy.allowStorageWrite('other'), false);
  assert.equal(policy.childDataStaysLocal, true);
});

test('bus delivers and isolates handler errors', () => {
  bus.clear();
  const seen = [];
  const off = bus.on('ping', (e) => seen.push(e.n));
  bus.on('ping', () => { throw new Error('boom'); });
  bus.emit('ping', { n: 1 });
  bus.emit('missing', {});
  assert.deepEqual(seen, [1]);
  off();
  bus.emit('ping', { n: 2 });
  assert.deepEqual(seen, [1]);
  bus.clear();
});

test('context emit records telemetry when policy allows', () => {
  const store = { raw: null };
  const telemetry = createTelemetry({
    storage: {
      getItem: () => store.raw,
      setItem: (_, v) => { store.raw = v; },
      removeItem: () => { store.raw = null; },
    },
  });
  const ctx = createContext({
    bus,
    telemetry,
    policy: createPolicy(),
    registry,
  });
  assert.ok(ctx.sessionId.startsWith('ws-'));
  assert.equal(ctx.emit('pii.leak', 'storage', {}), false);
  assert.equal(ctx.emit('quiz.started', 'quiz', { n: 1 }), true);
  const snap = telemetry.snapshot();
  assert.equal(snap.length, 1);
  assert.equal(snap[0].type, 'quiz.started');
  telemetry.clear();
  assert.equal(telemetry.snapshot().length, 0);
});

test('health recovers unhealthy components', async () => {
  registry.reset();
  let recovered = false;
  registry.register({
    id: 'tts',
    health() { return { ok: false, status: 'down' }; },
  });
  const events = [];
  const fakeBus = { emit: (type, payload) => events.push({ type, payload }) };
  const health = createHealth({
    registry,
    bus: fakeBus,
    recoveries: {
      tts: async () => { recovered = true; },
    },
  });
  const result = await health.checkAll();
  assert.equal(result.ok, false);
  assert.equal(recovered, true);
  assert.ok(events.some((e) => e.type === 'health.degraded'));
  assert.ok(events.some((e) => e.type === 'health.recovered'));
  health.start(10);
  health.start(10);
  health.stop();
  registry.reset();
});

test('health recovery failure is emitted', async () => {
  registry.reset();
  registry.register({
    id: 'tts',
    health() { return { ok: false, status: 'down' }; },
  });
  const events = [];
  const health = createHealth({
    registry,
    bus: { emit: (type) => events.push(type) },
    recoveries: {
      tts: async () => { throw new Error('nope'); },
    },
  });
  await health.checkAll();
  assert.ok(events.includes('health.recovery-failed'));
  registry.reset();
});

test('telemetry survives corrupt and quota storage', () => {
  const telemetry = createTelemetry({
    storage: {
      getItem: () => '{not-json',
      setItem: () => { throw new Error('quota'); },
      removeItem: () => {},
    },
  });
  telemetry.record({ type: 'x' });
  assert.deepEqual(telemetry.snapshot(), []);
});

test('telemetry uses memory when localStorage is missing', () => {
  const prev = globalThis.localStorage;
  delete globalThis.localStorage;
  const t = createTelemetry();
  t.record({ type: 'y' });
  assert.equal(t.snapshot().length, 1);
  t.clear();
  globalThis.localStorage = prev;
});

test('unknown component health defaults unknown', () => {
  registry.reset();
  registry.register({ id: 'bare' });
  assert.equal(registry.healthAll().bare.status, 'unknown');
  registry.reset();
});

test('destroyAll runs reverse order', async () => {
  registry.reset();
  const log = [];
  registry.register({ id: 'a', dependencies: ['b'], destroy: async () => log.push('a') });
  registry.register({ id: 'b', destroy: async () => log.push('b') });
  await registry.destroyAll();
  assert.deepEqual(log, ['a', 'b']);
  registry.reset();
});

test('register requires id', () => {
  assert.throws(() => registry.register({}), /id/);
});

test('missing dependency throws', () => {
  registry.reset();
  registry.register({ id: 'a', dependencies: ['ghost'] });
  assert.throws(() => registry.resolveInitOrder(), /Missing component/);
  registry.reset();
});
