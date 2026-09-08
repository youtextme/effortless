import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createCapabilityRegistry,
  createCatalogCapability,
  createExerciseCapability,
  escapeHtml,
  homeTabsFromCapabilities,
  normalizeAction,
  normalizeKind,
  normalizeRow,
  renderCatalogHtml,
  STUB_ACTIONS,
  validateCapability,
} from './capabilities.js';

test('capability kinds and rows fail closed', () => {
  assert.equal(normalizeKind('catalog'), 'catalog');
  assert.equal(normalizeKind('exercise'), 'exercise');
  assert.equal(normalizeKind('config'), 'config');
  assert.throws(() => normalizeKind('game'), /Unknown capability kind/);
  assert.equal(normalizeRow('word'), 'word');
  assert.equal(normalizeRow('title'), 'title');
  assert.equal(normalizeRow(''), 'title');
  assert.throws(() => normalizeRow('card'), /Unknown catalog row/);
  assert.throws(() => validateCapability(null), /object/);
  assert.throws(() => validateCapability({ id: 'Nope' }), /kebab-case/);
  assert.throws(() => validateCapability({ id: 'math' }), /list()/);
  assert.throws(() => validateCapability({ id: 'math', list() {} }), /get()/);
  assert.throws(() => validateCapability({ id: 'math', list() {}, get() {} }), /open()/);
  assert.equal(normalizeAction('read-passage'), 'read-passage');
  assert.equal(normalizeAction('!!!'), 'unknown');
  assert.equal(normalizeAction(''), 'unknown');
  assert.equal(normalizeAction(null), 'unknown');
  assert.deepEqual([...STUB_ACTIONS], ['none', 'unknown', 'unsupported', 'open-exercise']);
});

test('escapeHtml and catalog html cover title and word rows', () => {
  assert.equal(escapeHtml('<x&"y">'), '&lt;x&amp;&quot;y&quot;&gt;');
  assert.equal(escapeHtml(null), '');
  const title = renderCatalogHtml(
    [{ id: '1', title: 'Hello <kid>', done: true }],
    { id: 'passages', row: 'title' },
  );
  assert.match(title, /data-capability="passages"/);
  assert.match(title, /Hello &lt;kid&gt;/);
  assert.match(title, /passage-item done/);
  const unfinished = renderCatalogHtml(
    [{ id: '2', title: 'Next' }],
    { id: 'passages', row: 'title' },
  );
  assert.match(unfinished, /passage-item "/);
  assert.equal(unfinished.includes('✓'), false);
  const untitled = renderCatalogHtml(
    [{ id: 'fallback' }],
    { id: 'passages' },
  );
  assert.match(untitled, /fallback/);
  const word = renderCatalogHtml(
    [{ id: 'w', title: 'brave', subtitle: 'not scared', done: false, meta: { index: 3 } }],
    { id: 'words', row: 'word' },
  );
  assert.match(word, /word-row upcoming/);
  assert.match(word, /word-index/);
  const learned = renderCatalogHtml(
    [{ id: 'w2', title: 'kind', done: true }],
    { id: 'words', row: 'word' },
  );
  assert.match(learned, /word-row learned/);
  assert.equal(renderCatalogHtml(null, { id: 'x', row: 'title' }), '');
  assert.equal(renderCatalogHtml(undefined, null), '');
});

test('createCatalogCapability defaults and exercise opt-in', () => {
  const stub = createCatalogCapability({
    id: 'stub-defaults',
    label: 'Stub',
    items: [{ id: 'x', title: 'X' }],
  });
  assert.equal(stub.get('x').title, 'X');
  assert.equal(stub.get('missing'), null);
  assert.equal(stub.open('x').action, 'none');
  assert.equal(stub.health().ok, true);
  assert.equal(stub.list().length, 1);

  const empty = createCatalogCapability({ id: 'empty-list', list: () => 'nope' });
  assert.equal(empty.get('z'), null);

  const math = createExerciseCapability({
    id: 'math',
    label: 'Math',
    items: [{ id: 'n1', title: 'Number bonds to 10' }],
    open: (id) => ({ action: 'open-exercise', exerciseId: id }),
  });
  assert.equal(math.kind, 'exercise');
  assert.equal(math.homeTab, false);
  assert.equal(math.open('n1').action, 'open-exercise');

  assert.throws(() => createCatalogCapability({}), /kebab-case/);
  const hidden = createCatalogCapability({ id: 'hidden-cat', homeTab: false, items: [] });
  assert.equal(hidden.homeTab, false);
  const rawExercise = createCatalogCapability({ id: 'raw-math', kind: 'exercise', items: [] });
  assert.equal(rawExercise.homeTab, false);
  const shown = createExerciseCapability({
    id: 'diagrams',
    homeTab: true,
    items: [],
  });
  assert.equal(shown.homeTab, true);
  const catalogDefault = createCatalogCapability({ id: 'shown-cat', items: [] });
  assert.equal(catalogDefault.homeTab, true);
});

test('registry lists, opens, and isolates bad packs', () => {
  const reg = createCapabilityRegistry();
  reg.register(createCatalogCapability({
    id: 'passages',
    label: 'Passages',
    list: () => [{ id: '1', title: 'One', done: false }],
    open: (id) => ({ action: 'read-passage', day: Number(id) }),
  }));
  assert.equal(reg.listItems('passages').length, 1);
  assert.equal(reg.open('passages', '1').action, 'read-passage');
  assert.equal(reg.getItem('passages', '1').title, 'One');
  assert.equal(reg.getItem('missing', '1'), null);
  assert.equal(reg.open('missing', '1').action, 'unknown');
  assert.equal(reg.listItems('missing').length, 0);
  assert.equal(reg.health().ok, true);
  assert.equal(reg.get('passages').id, 'passages');
  assert.equal(reg.get('nope'), null);
  assert.throws(() => reg.register({ id: 'passages', kind: 'catalog', list: () => [], get: () => null, open: () => ({}) }), /Duplicate/);

  const math = createExerciseCapability({
    id: 'math',
    label: 'Math',
    list: () => [{ id: 'n1', title: 'Number bonds to 10', done: false }],
    open: (id) => ({ action: 'open-exercise', exerciseId: id }),
  });
  reg.register(math);
  assert.equal(reg.catalogs().map((c) => c.id).join(','), 'passages');
  assert.equal(reg.listItems('math')[0].title, 'Number bonds to 10');
  assert.equal(reg.open('math', 'n1').action, 'open-exercise');
  const html = renderCatalogHtml(reg.listItems('math'), math);
  assert.match(html, /Number bonds to 10/);
  assert.equal(html.includes('VOCABULARY'), false);

  const tabs = homeTabsFromCapabilities(reg);
  assert.deepEqual(tabs.map((t) => t.id), ['passages', 'settings']);

  let opened = '';
  for (const action of STUB_ACTIONS) reg.registerAction(action, () => {});
  reg.registerAction('read-passage', (result) => { opened = result.action; });
  assert.equal(reg.dispatch(reg.open('passages', '1')), true);
  assert.equal(opened, 'read-passage');
  assert.equal(reg.dispatch(reg.open('math', 'n1')), true);
  assert.equal(reg.dispatch({ action: 'not-registered-yet' }), false);
  assert.throws(() => reg.registerAction('!!!', () => {}), /Unknown capability action/);
  assert.throws(() => reg.registerAction('ok', null), /function/);
});

test('registry withstands throwing packs and odd open results', () => {
  const reg = createCapabilityRegistry();
  reg.register({
    id: 'boom-list',
    kind: 'catalog',
    homeTab: true,
    row: 'title',
    list: () => { throw new Error('list fail'); },
    get: () => { throw new Error('get fail'); },
    open: () => { throw new Error('open fail'); },
    health: () => { throw new Error('health fail'); },
  });
  assert.deepEqual(reg.listItems('boom-list'), []);
  assert.equal(reg.getItem('boom-list', 'x'), null);
  assert.equal(reg.open('boom-list', 'x').action, 'unknown');
  assert.equal(reg.health().ok, false);

  reg.register(createCatalogCapability({
    id: 'weird',
    homeTab: true,
    list: () => 'nope',
    open: () => 'string',
    health: () => ({ ok: false, status: 'degraded' }),
  }));
  assert.deepEqual(reg.listItems('weird'), []);
  assert.equal(reg.open('weird', '1').action, 'none');
  assert.equal(reg.getItem('weird', 'nope'), null);
  assert.equal(reg.health().ok, false);

  const cfg = createCatalogCapability({
    id: 'prefs',
    kind: 'config',
    list: () => [],
    open: () => ({ action: 'none' }),
  });
  assert.equal(cfg.homeTab, false);
  reg.register(cfg);
  assert.equal(reg.catalogs().some((c) => c.id === 'prefs'), false);

  reg.register({
    id: 'raw-exercise',
    kind: 'exercise',
    list: () => [{ id: 'd1', title: 'Draw a square' }],
    open: () => ({ action: 'open-exercise' }),
  });
  assert.equal(reg.catalogs().some((c) => c.id === 'raw-exercise'), false);
  assert.equal(reg.listItems('raw-exercise')[0].title, 'Draw a square');

  reg.register({
    id: 'no-health',
    kind: 'catalog',
    homeTab: false,
    list: () => [],
    open: () => ({ action: 'Bad Action' }),
  });
  assert.equal(reg.health().reports['no-health'].ok, true);
  assert.equal(reg.open('no-health', 'x').action, 'unknown');
  assert.equal(reg.getItem('no-health', 'x'), null);

  assert.deepEqual(homeTabsFromCapabilities(null).map((t) => t.id), ['settings']);
  assert.deepEqual(homeTabsFromCapabilities({}).map((t) => t.id), ['settings']);

  reg.registerAction('boom', () => { throw new Error('player fail'); });
  assert.equal(reg.dispatch({ action: 'boom' }), false);
  assert.equal(reg.all().length, 5);
});
