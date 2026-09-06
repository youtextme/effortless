#!/usr/bin/env node
/**
 * Scaffold a platform component the only supported way.
 * Usage: node platform/scripts/new-component.mjs --id my-thing --description "..."
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

function arg(name, fallback = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const id = arg('id');
const description = arg('description', 'Platform component');
if (!id || !/^[a-z][a-z0-9-]*$/.test(id)) {
  console.error('Usage: node platform/scripts/new-component.mjs --id my-thing --description "..."');
  process.exit(1);
}

const pascal = id.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase()) + 'Component';
const runtime = join(root, 'wordspark/platform/components', `${id}.js`);
const testFile = join(root, 'wordspark/platform/components', `${id}.test.js`);
if (existsSync(runtime)) {
  console.error(`Already exists: ${runtime}`);
  process.exit(1);
}

writeFileSync(runtime, `export const ${pascal} = {
  id: '${id}',
  version: '1.0.0',
  dependencies: [],
  init(ctx) {
    ctx['${id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}'] = {};
  },
  health() {
    return { ok: true, status: 'ready' };
  },
};
`);

writeFileSync(testFile, `import test from 'node:test';
import assert from 'node:assert/strict';
import { ${pascal} } from './${id}.js';

test('component:${id} health', () => {
  assert.equal(${pascal}.id, '${id}');
  assert.equal(${pascal}.health().ok, true);
});
`);

const storiesPath = join(root, 'platform/cx/stories.json');
const stories = JSON.parse(readFileSync(storiesPath, 'utf8'));
const storyId = `${id}-health`;
stories.stories.push({
  id: storyId,
  component: id,
  given: `the ${id} component is registered`,
  when: 'health() runs',
  then: 'it reports ok',
  nfr: [],
});
writeFileSync(storiesPath, `${JSON.stringify(stories, null, 2)}\n`);

appendStoryMarker(testFile, storyId);

const journeysPath = join(root, 'platform/cx/journeys.json');
const journeys = JSON.parse(readFileSync(journeysPath, 'utf8'));
let scaffold = journeys.journeys.find((j) => j.id === 'scaffolded');
if (!scaffold) {
  scaffold = {
    id: 'scaffolded',
    actor: 'agent',
    intent: 'Newly scaffolded components until they join a real customer journey',
    steps: [],
  };
  journeys.journeys.push(scaffold);
}
scaffold.steps.push({ id: storyId, story: storyId });
writeFileSync(journeysPath, `${JSON.stringify(journeys, null, 2)}\n`);

const manifestPath = join(root, 'platform/COMPONENT-MANIFEST.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
manifest.components.push({
  id,
  version: '1.0.0',
  dependencies: [],
  description,
  events: { emits: [], listens: [] },
});
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

console.log(`Scaffolded ${id}.
Next (required — CI will fail until you do this):
  1. Import ${pascal} in wordspark/platform/shell.js and add it to COMPONENTS
  2. Implement init() for a real customer experience
  3. Move the scaffolded CX story onto a real journey in platform/cx/journeys.json
  4. Bind NFRs in platform/cx/nfr.json when it is customer-visible
  5. Run: npm run ci
`);

function appendStoryMarker(file, storyId) {
  const src = readFileSync(file, 'utf8');
  writeFileSync(file, src.replace(
    'test(\'component:',
    `test('story:${storyId} component:`,
  ));
}
