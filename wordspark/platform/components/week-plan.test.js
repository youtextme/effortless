import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WeekPlanComponent, createWeekPlanCapability } from './week-plan.js';
import {
  PLAYBOOK,
  STORAGE_KEY,
  actionFor,
  annualizedFromHolding,
  dueCheckpoints,
  fireDueNotifications,
  nyDate,
  parkTicket,
  renderPlanHtml,
  spreadTicket,
  tenPercentPrice,
} from './week-plan-playbook.js';
import { defaultPacks } from './capability-packs.js';
import { createCapabilityRegistry } from '../kernel/capabilities.js';
import { createContext } from '../kernel/context.js';
import * as bus from '../kernel/bus.js';
import { createPolicy } from '../kernel/policy.js';
import { createTelemetry } from '../kernel/telemetry.js';
import * as registry from '../kernel/registry.js';
import { CapabilityComponent } from './capability.js';
import { StorageComponent } from './storage.js';

const here = dirname(fileURLToPath(import.meta.url));

test('story:week-plan-health component:week-plan health refuses a guarantee', () => {
  assert.equal(WeekPlanComponent.id, 'week-plan');
  assert.equal(PLAYBOOK.guarantee, false);
  const report = WeekPlanComponent.health();
  assert.equal(report.ok, true);
  const cap = createWeekPlanCapability();
  assert.equal(cap.homeTab, false);
  assert.equal(cap.open('this-week').action, 'open-week-plan');
  assert.equal(cap.open('nope').action, 'unknown');
});

test('story:week-plan-honest-math component:week-plan 10 percent in 5 days is extreme', () => {
  const annual = annualizedFromHolding(0.1, 5);
  assert.ok(annual > 100, `annualized ${annual} should exceed 10,000%`);
  assert.equal(tenPercentPrice(PLAYBOOK.asOf.spy), 840.72);
  const html = renderPlanHtml();
  assert.match(html, /12,000%/);
  assert.match(html, /will not promise \$100/);
  assert.doesNotMatch(html, /guaranteed/i);
  assert.doesNotMatch(html, /risk-free/i);
  assert.match(html, /data-guarantee="no"/);
  assert.equal(PLAYBOOK.spread.maxLossUsd, 1000);
  assert.ok(!PLAYBOOK.copy.honest.toLowerCase().includes('guaranteed'));
});

test('story:week-plan-today-ticket component:week-plan Sunday and Monday IBKR tickets', () => {
  const sunday = Date.parse('2026-09-13T18:00:00-04:00');
  const monday = Date.parse('2026-09-14T10:00:00-04:00');
  const friday = Date.parse('2026-09-18T15:00:00-04:00');
  assert.equal(nyDate(sunday), '2026-09-13');
  assert.equal(actionFor(sunday).id, 'sun');
  assert.equal(actionFor(monday).id, 'mon');
  assert.equal(actionFor(friday).id, 'fri');
  assert.equal(actionFor(Date.parse('2026-09-10T12:00:00-04:00')).id, 'sun');
  assert.equal(actionFor(Date.parse('2026-09-19T12:00:00-04:00')).id, 'done');
  assert.equal(annualizedFromHolding(-2, 5), 0);
  assert.match(actionFor(sunday).body, /Do not transmit/);
  const spread = spreadTicket();
  assert.match(spread, /SELL 1 SPY 2026-09-18 730\/720 PUT VERTICAL/);
  assert.match(spread, /LMT credit 1\.00/);
  assert.match(spread, /Max loss: \$1000/);
  const park = parkTicket();
  assert.match(park, /BUY 10 SGOV/);
  const html = renderPlanHtml({ lane: 'spread' }, sunday);
  assert.match(html, /Sunday — build, do not send/);
  assert.match(html, /0DTE/);
  const parkHtml = renderPlanHtml({ lane: 'park' }, monday);
  assert.match(parkHtml, /BUY 10 SGOV/);
  assert.match(parkHtml, /data-lane="park"/);
});

test('story:week-plan-local-alerts component:week-plan checkpoints fire on this device', () => {
  const now = Date.parse('2026-09-16T13:55:00-04:00');
  const due = dueCheckpoints(now, []);
  assert.deepEqual(due.map((c) => c.id), ['prep', 'send', 'fomc']);
  const notes = [];
  const result = fireDueNotifications({
    now,
    state: { lane: 'spread', sent: true, notify: true, fired: ['prep'], stepsDone: [] },
    notify: (n) => notes.push(n.id),
  });
  assert.deepEqual(result.firedNow, ['send', 'fomc']);
  assert.deepEqual(notes, ['send', 'fomc']);
  const quiet = fireDueNotifications({
    now,
    state: { lane: null, sent: false, notify: false, fired: [], stepsDone: [] },
    notify: () => {
      throw new Error('must not notify when off');
    },
  });
  assert.deepEqual(quiet.firedNow, []);
});

test('story:week-plan-settings-use component:week-plan Settings opens the pack without a shell fork', async () => {
  const html = readFileSync(join(here, '../../index.html'), 'utf8');
  assert.match(html, /id="btn-week-plan"/);
  assert.match(html, /id="screen-week-plan"/);
  assert.match(html, /data-speech-surface/);
  assert.match(html, /id="week-plan-root"/);
  const shell = readFileSync(join(here, '../shell.js'), 'utf8');
  assert.equal(/if \(id === 'week-plan'\)/.test(shell), false);
  assert.match(shell, /components\/week-plan\.js/);
  assert.match(shell, /WeekPlanComponent/);
  const packs = defaultPacks(() => ({ completedPassages: [] }));
  assert.equal(packs.some((p) => p.id === 'week-plan'), true);
  assert.equal(packs.find((p) => p.id === 'week-plan').homeTab, false);
  assert.equal(packs.filter((p) => p.homeTab).map((p) => p.id).join(','), 'words,passages');

  registry.reset();
  localStorage.removeItem(STORAGE_KEY);
  const ctx = createContext({
    bus,
    telemetry: createTelemetry(),
    policy: createPolicy(),
    registry,
  });
  await StorageComponent.init(ctx);
  await CapabilityComponent.init(ctx);
  await WeekPlanComponent.init(ctx);
  assert.equal(ctx.capability.open('week-plan', 'this-week').action, 'open-week-plan');
  assert.equal(ctx.capability.dispatch(ctx.capability.open('week-plan', 'this-week')), true);
  assert.equal(typeof ctx.weekPlan.open, 'function');
  assert.match(ctx.weekPlan.render(Date.parse('2026-09-13T18:00:00-04:00')), /Sunday/);
  const reg = createCapabilityRegistry();
  for (const pack of packs) reg.register(pack);
  assert.equal(reg.catalogs().some((c) => c.id === 'week-plan'), false);
});
