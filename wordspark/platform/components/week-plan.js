/**
 * Five-day IBKR coach — parent Settings overlay. Copy lives in the playbook.
 */

import {
  PLAYBOOK,
  STORAGE_KEY,
  defaultState,
  fireDueNotifications,
  renderPlanHtml,
} from './week-plan-playbook.js';
import { createExerciseCapability } from '../kernel/capabilities.js';

export function createWeekPlanCapability() {
  return createExerciseCapability({
    id: 'week-plan',
    label: PLAYBOOK.copy.settingsLabel,
    homeTab: false,
    list() {
      return [{ id: PLAYBOOK.id, title: PLAYBOOK.copy.settingsLabel, done: false }];
    },
    open(itemId) {
      if (String(itemId) !== PLAYBOOK.id) return { action: 'unknown' };
      return { action: 'open-week-plan', planId: PLAYBOOK.id };
    },
    health() {
      const annual = (1.1) ** (252 / 5) - 1;
      return {
        ok: PLAYBOOK.guarantee === false
          && PLAYBOOK.spread.maxLossUsd === PLAYBOOK.capitalUsd
          && annual > 100
          && PLAYBOOK.window.start === '2026-09-13',
        status: 'five-day ibkr coach',
      };
    },
  });
}

function readState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...(parsed && typeof parsed === 'object' ? parsed : {}) };
  } catch {
    return defaultState();
  }
}

function writeState(ctx, state) {
  if (ctx?.policy?.allowStorageWrite && !ctx.policy.allowStorageWrite(STORAGE_KEY)) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function notifyUser(payload) {
  try {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const n = new Notification(payload.title, { body: payload.body });
    n.onerror = () => {};
  } catch {
    /* ignore */
  }
}

export const WeekPlanComponent = {
  id: 'week-plan',
  version: '1.0.0',
  dependencies: ['storage', 'capability'],
  init(ctx) {
    let state = readState();
    const root = typeof document !== 'undefined' ? document.getElementById('week-plan-root') : null;
    const overlay = typeof document !== 'undefined' ? document.getElementById('screen-week-plan') : null;

    function paint(now = Date.now()) {
      if (!root) return;
      root.innerHTML = renderPlanHtml(state, now, PLAYBOOK);
      root.querySelector('[data-week-plan-close]')?.addEventListener('click', close);
      root.querySelectorAll('[data-week-plan-lane]').forEach((btn) => {
        btn.addEventListener('click', () => {
          state = { ...state, lane: btn.dataset.weekPlanLane };
          writeState(ctx, state);
          paint();
        });
      });
      root.querySelector('[data-week-plan-sent]')?.addEventListener('click', () => {
        state = { ...state, sent: true };
        writeState(ctx, state);
        paint();
      });
      root.querySelector('[data-week-plan-alerts]')?.addEventListener('click', async () => {
        if (!state.notify && typeof Notification !== 'undefined' && Notification.requestPermission) {
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') return;
        }
        state = { ...state, notify: !state.notify };
        writeState(ctx, state);
        pulse(Date.now());
        paint();
      });
    }

    function pulse(now = Date.now()) {
      const result = fireDueNotifications({
        now,
        state,
        notify: state.notify ? notifyUser : null,
        playbook: PLAYBOOK,
      });
      if (result.firedNow.length) {
        state = result.state;
        writeState(ctx, state);
        ctx.emit('week-plan.alert', 'week-plan', { ids: result.firedNow });
      }
    }

    function open() {
      pulse();
      paint();
      if (overlay) overlay.hidden = false;
      ctx.emit('week-plan.opened', 'week-plan', { planId: PLAYBOOK.id });
    }

    function close() {
      if (overlay) overlay.hidden = true;
      ctx.emit('week-plan.closed', 'week-plan', { planId: PLAYBOOK.id });
    }

    ctx.weekPlan = {
      playbook: PLAYBOOK,
      open,
      close,
      render: (now) => renderPlanHtml(state, now, PLAYBOOK),
      getState: () => ({ ...state }),
      pulse,
    };

    ctx.capability?.registerAction?.('open-week-plan', () => open());

    const opener = typeof document !== 'undefined' ? document.getElementById('btn-week-plan') : null;
    opener?.addEventListener('click', () => {
      if (typeof ctx.capability?.open === 'function') {
        ctx.capability.dispatch(ctx.capability.open('week-plan', PLAYBOOK.id));
        return;
      }
      open();
    });
  },
  health() {
    return createWeekPlanCapability().health();
  },
};
