/**
 * Capability registry — catalogs of reusable learning activities.
 * Passages are one catalog. Math, diagrams, and later packs register the same way.
 */

const KIND = {
  catalog: 'catalog',
  exercise: 'exercise',
  config: 'config',
};

const ROW = {
  title: 'title',
  word: 'word',
};

const STUB_ACTIONS = Object.freeze(['none', 'unknown', 'unsupported', 'open-exercise']);

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function normalizeKind(kind) {
  const k = String(kind || '').trim();
  switch (k) {
    case KIND.catalog:
    case KIND.exercise:
    case KIND.config:
      return k;
    default: {
      const never = k;
      throw new Error(`Unknown capability kind: ${never}`);
    }
  }
}

export function normalizeRow(row) {
  const r = String(row || 'title').trim() || 'title';
  switch (r) {
    case ROW.title:
    case ROW.word:
      return r;
    default: {
      const never = r;
      throw new Error(`Unknown catalog row: ${never}`);
    }
  }
}

export function normalizeAction(action) {
  const a = String(action || 'unknown').trim() || 'unknown';
  if (!/^[a-z][a-z0-9-]*$/.test(a)) return 'unknown';
  return a;
}

export function validateCapability(def) {
  if (!def || typeof def !== 'object') throw new Error('Capability must be an object');
  if (!def.id || !/^[a-z][a-z0-9-]*$/.test(def.id)) {
    throw new Error('Capability id must be kebab-case');
  }
  normalizeKind(def.kind || 'catalog');
  if (typeof def.list !== 'function') throw new Error(`Capability ${def.id} is missing list()`);
  if (typeof def.get !== 'function') throw new Error(`Capability ${def.id} is missing get()`);
  if (typeof def.open !== 'function') throw new Error(`Capability ${def.id} is missing open()`);
  return true;
}

function defaultList(items) {
  return Array.isArray(items) ? items : [];
}

function resolveHomeTab(kind, homeTab) {
  if (kind === 'config') return false;
  if (homeTab == null) return kind !== 'exercise';
  return homeTab !== false;
}

export function createCatalogCapability({
  id,
  label,
  kind = 'catalog',
  homeTab,
  row = 'title',
  items,
  list,
  get,
  open,
  health,
} = {}) {
  const resolvedKind = normalizeKind(kind);
  const resolvedRow = normalizeRow(row);
  const cap = {
    id,
    label: String(label || id),
    kind: resolvedKind,
    homeTab: resolveHomeTab(resolvedKind, homeTab),
    row: resolvedRow,
  };
  cap.list = () => {
    if (typeof list === 'function') return list.call(cap);
    return defaultList(items);
  };
  cap.get = (itemId) => {
    if (typeof get === 'function') return get.call(cap, itemId);
    const rows = cap.list();
    if (!Array.isArray(rows)) return null;
    return rows.find((item) => String(item.id) === String(itemId)) || null;
  };
  cap.open = (itemId) => {
    if (typeof open === 'function') return open.call(cap, itemId);
    return { action: 'none' };
  };
  cap.health = () => {
    if (typeof health === 'function') return health.call(cap);
    return { ok: true, status: 'ready' };
  };
  validateCapability(cap);
  return cap;
}

export function createExerciseCapability(opts = {}) {
  return createCatalogCapability({
    ...opts,
    kind: 'exercise',
    homeTab: opts.homeTab === true,
  });
}

function renderWordRow(item, capabilityId) {
  const id = escapeHtml(item?.id ?? '');
  const title = escapeHtml(item?.title || item?.id || '');
  const learned = item?.done ? 'learned' : 'upcoming';
  const index = escapeHtml(item?.meta?.index ?? '');
  const meaning = escapeHtml(item?.subtitle || '');
  return `<div class="word-row ${learned}" data-capability="${capabilityId}" data-item="${id}">
        <span class="word-index">${index}</span>
        <div class="word-info"><span class="word-text">${title}</span>
        <span class="word-meaning">${meaning}</span></div></div>`;
}

function renderTitleRow(item, capabilityId) {
  const id = escapeHtml(item?.id ?? '');
  const title = escapeHtml(item?.title || item?.id || '');
  const done = item?.done ? 'done' : '';
  const mark = item?.done ? '✓' : '';
  return `<div class="passage-item ${done}" data-capability="${capabilityId}" data-item="${id}">
      <span class="passage-item-title">${title}</span><span>${mark}</span></div>`;
}

export function renderCatalogHtml(items, cap) {
  const row = normalizeRow(cap?.row || 'title');
  const capabilityId = escapeHtml(cap?.id || '');
  const list = Array.isArray(items) ? items : [];
  return list.map((item) => (
    row === 'word' ? renderWordRow(item, capabilityId) : renderTitleRow(item, capabilityId)
  )).join('');
}

function hydrateCapability(def) {
  const kind = normalizeKind(def.kind);
  const cap = {
    ...def,
    kind,
    row: normalizeRow(def.row || 'title'),
    homeTab: resolveHomeTab(kind, def.homeTab),
    label: def.label || def.id,
  };
  if (typeof cap.get !== 'function') {
    cap.get = (itemId) => {
      const rows = cap.list();
      if (!Array.isArray(rows)) return null;
      return rows.find((item) => String(item.id) === String(itemId)) || null;
    };
  }
  validateCapability(cap);
  return cap;
}

function isReadyCapability(def) {
  return Boolean(
    def
    && def.id
    && def.kind
    && typeof def.list === 'function'
    && typeof def.open === 'function',
  );
}

export function createCapabilityRegistry() {
  const caps = new Map();
  const handlers = new Map();

  function register(def) {
    const cap = isReadyCapability(def) ? hydrateCapability(def) : createCatalogCapability(def);
    if (caps.has(cap.id)) throw new Error(`Duplicate capability: ${cap.id}`);
    caps.set(cap.id, cap);
    return cap;
  }

  function get(id) {
    return caps.get(id) || null;
  }

  function all() {
    return [...caps.values()];
  }

  function catalogs() {
    return all().filter((c) => (c.kind === 'catalog' || c.kind === 'exercise') && c.homeTab);
  }

  function listItems(id) {
    const cap = get(id);
    if (!cap) return [];
    try {
      const items = cap.list();
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  function getItem(capabilityId, itemId) {
    const cap = get(capabilityId);
    if (!cap) return null;
    try {
      return cap.get(itemId) || null;
    } catch {
      return null;
    }
  }

  function open(capabilityId, itemId) {
    const cap = get(capabilityId);
    if (!cap) return { action: 'unknown', capabilityId, itemId };
    try {
      const result = cap.open(itemId);
      if (!result || typeof result !== 'object') return { action: 'none', capabilityId, itemId };
      return { ...result, action: normalizeAction(result.action), capabilityId, itemId };
    } catch {
      return { action: 'unknown', capabilityId, itemId };
    }
  }

  function registerAction(action, handler) {
    const id = String(action || '').trim();
    if (!/^[a-z][a-z0-9-]*$/.test(id)) {
      throw new Error(`Unknown capability action: ${id || 'empty'}`);
    }
    if (typeof handler !== 'function') throw new Error('Action handler must be a function');
    handlers.set(id, handler);
    return id;
  }

  function dispatch(result) {
    const action = normalizeAction(result?.action);
    const handler = handlers.get(action);
    if (typeof handler !== 'function') return false;
    try {
      handler(result);
      return true;
    } catch {
      return false;
    }
  }

  function health() {
    const reports = {};
    let ok = true;
    for (const cap of all()) {
      let report;
      try {
        report = cap.health ? cap.health() : { ok: true, status: 'ready' };
      } catch (e) {
        report = { ok: false, status: String(e) };
      }
      reports[cap.id] = report;
      if (!report?.ok) ok = false;
    }
    return { ok, reports, count: caps.size };
  }

  return {
    register,
    get,
    all,
    catalogs,
    listItems,
    getItem,
    open,
    registerAction,
    dispatch,
    health,
    renderCatalogHtml,
    stubActions: STUB_ACTIONS,
  };
}

export function homeTabsFromCapabilities(registry, settingsTab = { id: 'settings', label: 'Settings', kind: 'config' }) {
  const catalogs = registry?.catalogs?.() || [];
  return [
    ...catalogs.map((c) => ({ id: c.id, label: c.label, kind: 'catalog' })),
    settingsTab,
  ];
}

export { STUB_ACTIONS };
