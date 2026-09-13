/**
 * Five-day IBKR playbook — copy is data. Window: 13–18 Sep 2026 only.
 * Not a guarantee. Not a live quote feed.
 */

export const STORAGE_KEY = 'wordspark_week_plan';

export const PLAYBOOK = Object.freeze({
  id: 'this-week',
  window: { start: '2026-09-13', end: '2026-09-18' },
  capitalUsd: 1000,
  targetUsd: 100,
  guarantee: false,
  asOf: {
    session: '2026-09-11',
    spy: 764.29,
    qqq: 714.88,
    sgov: 100.52,
  },
  event: {
    id: 'fomc-2026-09-16',
    label: 'FOMC statement',
    at: '2026-09-16T14:00:00-04:00',
  },
  spread: {
    id: 'spy-730-720-put-credit',
    underlier: 'SPY',
    expiry: '2026-09-18',
    shortPut: 730,
    longPut: 720,
    widthUsd: 10,
    quantity: 1,
    targetCredit: 1,
    minCredit: 0.8,
    maxLossUsd: 1000,
    exitSpy: 740,
  },
  park: {
    symbol: 'SGOV',
    shares: 10,
    limit: 100.6,
    expectedUsd: 0.5,
  },
  copy: {
    title: 'This week’s $1000',
    back: 'Back',
    proposal: 'Proposal: try for about $100 this week by selling one SPY put spread in Interactive Brokers. Best case +$100. Worst case −$1000. This screen will not promise $100.',
    doNowLabel: 'Do this now',
    ticketLabel: 'Copy this into IBKR',
    whyLabel: 'Why not a sure 10%',
    honest: 'Ten percent in five trading days is about 12,000% a year. A typical S&P week is under 2%. This screen will not promise $100.',
    math: 'Friday close: SPY $764.29. FOMC is Wednesday 16 Sep 2026 at 2:00 p.m. ET. If the spread will not pay $1.00 on Monday, do not chase — buy SGOV instead.',
    notAdvice: 'You press Transmit in Interactive Brokers. This is a checklist on this device, not advice and not a broker.',
    todayLabel: 'Today',
    spreadCta: 'Use this ticket',
    parkCta: 'Safer: buy SGOV instead',
    sentCta: 'I already sent it',
    alertsOn: 'Turn on alerts',
    alertsOff: 'Alerts on',
    alertsHint: 'Alerts fire on this device when you open the app.',
    laneSpread: 'This ticket: collect about $100 if SPY stays above 730 through Friday. You can lose the whole $1000 if SPY finishes at or below 720.',
    lanePark: 'Safer ticket: buy 10 SGOV. About $0.50 in five days. This will not make $100.',
    noChase: 'Monday rule: if the spread pays under $0.80, switch to SGOV. Do not pick closer strikes.',
    forbidden: 'Do not use 0DTE, naked puts, or 3× ETFs this week.',
    laterLabel: 'Rest of the week',
    settingsLabel: 'This week’s $1000',
    settingsHint: 'Today: copy one IBKR order. Do not send it until Monday 9:45 a.m. ET.',
  },
  days: [
    {
      id: 'sun',
      date: '2026-09-13',
      title: 'Sunday — build, do not send',
      body: 'Markets are closed. Open IBKR and save the ticket. Do not press Transmit until Monday after 9:45 a.m. ET.',
      steps: [
        'Open Interactive Brokers.',
        'Confirm about $1,100 cash is settled.',
        'Turn on US stocks and US stock options.',
        'Add SPY to a watchlist.',
        'Copy the ticket below. Save it as a DAY limit. Do not press Transmit.',
      ],
    },
    {
      id: 'mon',
      date: '2026-09-14',
      title: 'Monday — send or park',
      body: 'After 9:45 a.m. ET, send the spread if it pays $1.00 or more. If it pays under $0.80, buy 10 SGOV instead.',
      steps: [
        'Open Interactive Brokers after 9:45 a.m. ET.',
        'Look at SPY 18 Sep 730 put / 720 put as one spread.',
        'If you are paid $1.00 or more, press Transmit on the ticket below.',
        'If you are paid under $0.80, buy 10 SGOV at 100.60 instead. Do not change strikes.',
      ],
    },
    {
      id: 'tue',
      date: '2026-09-15',
      title: 'Tuesday — leave it',
      body: 'Do nothing unless SPY last is under 740. Then close the spread.',
      steps: [
        'Open IBKR and check SPY last.',
        'If you sold the spread and SPY is under 740, buy it back.',
        'If you bought SGOV, do nothing.',
      ],
    },
    {
      id: 'wed',
      date: '2026-09-16',
      title: 'Wednesday — FOMC 2:00 p.m. ET',
      body: 'At 1:50 p.m. ET do nothing. Close the spread only if SPY last is under 740.',
      steps: [
        'At 1:50 p.m. ET, sit on your hands.',
        'Do not send new orders around the 2:00 p.m. statement.',
        'Close the spread only if SPY last is under 740.',
      ],
    },
    {
      id: 'thu',
      date: '2026-09-17',
      title: 'Thursday — optional close',
      body: 'If SPY is above 735 you may buy the spread back. SGOV: do nothing.',
      steps: [
        'If the spread is still open and SPY is above 735, you may buy it back.',
        'If you bought SGOV, do nothing.',
      ],
    },
    {
      id: 'fri',
      date: '2026-09-18',
      title: 'Friday — finish',
      body: 'By 3:45 p.m. ET close leftover spread risk, or keep SGOV.',
      steps: [
        'If the spread is still open, buy it back or let it expire if SPY is above 735.',
        'If you bought SGOV, you may keep it.',
      ],
    },
  ],
  checkpoints: [
    {
      id: 'prep',
      at: '2026-09-13T18:00:00-04:00',
      title: 'Build the IBKR ticket',
      body: 'Save the SPY 730/720 put credit as a DAY limit. Do not send until Monday 9:45 ET.',
    },
    {
      id: 'send',
      at: '2026-09-14T09:45:00-04:00',
      title: 'Send or park',
      body: 'Credit ≥ $1.00: send one spread. Bid under $0.80: buy 10 SGOV. Do not chase.',
    },
    {
      id: 'fomc',
      at: '2026-09-16T13:50:00-04:00',
      title: 'FOMC in 10 minutes',
      body: 'Do not add size. Close the spread only if SPY last is under 740.',
    },
    {
      id: 'close',
      at: '2026-09-18T15:45:00-04:00',
      title: 'Finish the week',
      body: 'Close leftover spread risk by the cash close, or keep SGOV.',
    },
  ],
});

export function annualizedFromHolding(rate, holdingDays, yearDays = 252) {
  const r = Number(rate);
  const d = Number(holdingDays);
  const y = Number(yearDays);
  if (!(r > -0.999) || !(d > 0) || !(y > 0)) return 0;
  return (1 + r) ** (y / d) - 1;
}

export function tenPercentPrice(last) {
  return Math.round(Number(last) * 1.1 * 100) / 100;
}

export function defaultState() {
  return {
    lane: null,
    sent: false,
    notify: false,
    fired: [],
    stepsDone: [],
  };
}

export function nyDate(ms, timeZone = 'America/New_York') {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return fmt.format(new Date(ms));
}

export function actionFor(ms, playbook = PLAYBOOK) {
  const date = nyDate(ms);
  if (date < playbook.window.start) {
    return playbook.days[0];
  }
  if (date > playbook.window.end) {
    return {
      id: 'done',
      date,
      title: 'Window closed',
      body: 'This playbook ended 18 Sep 2026. Do not reuse the ticket.',
      steps: ['Do not send this ticket. The 13–18 Sep 2026 window is over.'],
    };
  }
  return playbook.days.find((day) => day.date === date) || playbook.days[0];
}

export function dueCheckpoints(ms, fired = [], playbook = PLAYBOOK) {
  const done = new Set(fired);
  return playbook.checkpoints.filter((cp) => Date.parse(cp.at) <= ms && !done.has(cp.id));
}

export function spreadTicket(playbook = PLAYBOOK) {
  const s = playbook.spread;
  return [
    `SELL 1 ${s.underlier} ${s.expiry} ${s.shortPut}/${s.longPut} PUT VERTICAL`,
    `Legs: SELL 1 ${s.shortPut} P  /  BUY 1 ${s.longPut} P`,
    `Order: LMT credit ${s.targetCredit.toFixed(2)}  TIF: DAY`,
    `Send after 9:45 ET Mon 14 Sep 2026. Outside RTH: no.`,
    `Max loss: $${s.maxLossUsd}. Target credit: $${(s.targetCredit * 100).toFixed(0)}.`,
    `Skip if mid credit < ${s.minCredit.toFixed(2)}. Then Park.`,
  ].join('\n');
}

export function parkTicket(playbook = PLAYBOOK) {
  const p = playbook.park;
  return [
    `BUY ${p.shares} ${p.symbol}`,
    `Order: LMT ${p.limit.toFixed(2)}  TIF: DAY`,
    `Send after 9:45 ET Mon 14 Sep 2026.`,
    `Expected about $${p.expectedUsd.toFixed(2)} in five days — not $100.`,
  ].join('\n');
}

export function ticketFor(lane, playbook = PLAYBOOK) {
  return lane === 'park' ? parkTicket(playbook) : spreadTicket(playbook);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderPlanHtml(state = defaultState(), ms = Date.now(), playbook = PLAYBOOK) {
  const c = playbook.copy;
  const today = actionFor(ms, playbook);
  const lane = state.lane === 'park' ? 'park' : 'spread';
  const ticket = ticketFor(lane, playbook);
  const laneCopy = lane === 'park' ? c.lanePark : c.laneSpread;
  const alertLabel = state.notify ? c.alertsOff : c.alertsOn;
  const steps = Array.isArray(today.steps)
    ? today.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')
    : `<li>${escapeHtml(today.body)}</li>`;
  const later = playbook.days
    .filter((day) => day.date !== today.date)
    .map((day) => `<li class="week-plan-day"><p class="week-plan-day-title">${escapeHtml(day.title)}</p><p>${escapeHtml(day.body)}</p></li>`)
    .join('');
  return `<article class="week-plan" data-week-plan="${playbook.id}" data-lane="${lane}" data-guarantee="${playbook.guarantee ? 'yes' : 'no'}">
  <header class="week-plan-head">
    <button type="button" class="icon-btn" data-week-plan-close aria-label="${escapeHtml(c.back)}">←</button>
    <h2>${escapeHtml(c.title)}</h2>
  </header>
  <p class="week-plan-proposal">${escapeHtml(c.proposal)}</p>
  <section class="week-plan-today">
    <h3>${escapeHtml(c.doNowLabel)}</h3>
    <p class="week-plan-today-title">${escapeHtml(today.title)}</p>
    <ol class="week-plan-now">${steps}</ol>
  </section>
  <section class="week-plan-ticket">
    <h3>${escapeHtml(c.ticketLabel)}</h3>
    <pre class="week-plan-pre">${escapeHtml(ticket)}</pre>
    <p>${escapeHtml(laneCopy)}</p>
    <p>${escapeHtml(c.noChase)}</p>
    <div class="week-plan-actions">
      <button type="button" class="btn-primary" data-week-plan-lane="spread">${escapeHtml(c.spreadCta)}</button>
      <button type="button" class="btn-text" data-week-plan-lane="park">${escapeHtml(c.parkCta)}</button>
      <button type="button" class="btn-text" data-week-plan-sent>${escapeHtml(c.sentCta)}</button>
    </div>
  </section>
  <section class="week-plan-why">
    <h3>${escapeHtml(c.whyLabel)}</h3>
    <p class="week-plan-honest">${escapeHtml(c.honest)}</p>
    <p class="week-plan-math">${escapeHtml(c.math)}</p>
    <p class="week-plan-note">${escapeHtml(c.notAdvice)}</p>
    <p class="week-plan-forbidden">${escapeHtml(c.forbidden)}</p>
  </section>
  <section class="week-plan-alerts">
    <button type="button" class="parent-link" data-week-plan-alerts>${escapeHtml(alertLabel)}</button>
    <p>${escapeHtml(c.alertsHint)}</p>
  </section>
  <h3 class="week-plan-later-label">${escapeHtml(c.laterLabel)}</h3>
  <ol class="week-plan-days">${later}</ol>
</article>`;
}

export function fireDueNotifications({
  now,
  state = defaultState(),
  notify,
  playbook = PLAYBOOK,
} = {}) {
  if (typeof notify !== 'function' || !state.notify) {
    return { state, firedNow: [] };
  }
  const due = dueCheckpoints(now, state.fired, playbook);
  const fired = [...state.fired];
  const firedNow = [];
  for (const cp of due) {
    notify({ title: cp.title, body: cp.body, id: cp.id });
    fired.push(cp.id);
    firedNow.push(cp.id);
  }
  return { state: { ...state, fired }, firedNow };
}
