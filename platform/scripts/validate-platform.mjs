#!/usr/bin/env node
/**
 * Validates platform component manifest, dependency graph, and runtime files.
 * Run: node platform/scripts/validate-platform.mjs
 */

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultRoot = join(__dirname, '..');
const defaultWordspark = join(defaultRoot, '..', 'wordspark');

export function evaluate({ root = defaultRoot, wordspark = defaultWordspark } = {}) {
  const errors = [];
  const manifest = JSON.parse(readFileSync(join(root, 'COMPONENT-MANIFEST.json'), 'utf8'));

  const runtimeComponents = manifest.components.map((c) => c.id);
  const runtimeFiles = runtimeComponents
    .filter((id) => id !== 'shell')
    .map((id) => join(wordspark, 'platform', 'components', `${id}.js`));

  for (const file of runtimeFiles) {
    if (!existsSync(file)) {
      errors.push(`Missing runtime component: ${file}`);
    }
  }

  const kernelFiles = ['registry.js', 'bus.js', 'health.js', 'telemetry.js', 'policy.js', 'context.js', 'capabilities.js'];
  for (const f of kernelFiles) {
    const p = join(wordspark, 'platform', 'kernel', f);
    if (!existsSync(p)) errors.push(`Missing kernel module: ${p}`);
  }

  if (!existsSync(join(wordspark, 'platform', 'shell.js'))) {
    errors.push('Missing shell.js');
  }

  const ids = new Set(manifest.components.map((c) => c.id));
  const graph = new Map(manifest.components.map((c) => [c.id, c.dependencies || []]));

  function detectCycle(id, visiting = new Set(), visited = new Set()) {
    if (visited.has(id)) return false;
    if (visiting.has(id)) return true;
    visiting.add(id);
    for (const dep of graph.get(id) || []) {
      if (!ids.has(dep)) errors.push(`Component ${id} depends on unknown ${dep}`);
      else if (detectCycle(dep, visiting, visited)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  }

  for (const id of ids) {
    if (detectCycle(id)) errors.push(`Circular dependency detected involving ${id}`);
  }

  for (const c of manifest.components) {
    for (const field of ['id', 'version', 'dependencies', 'description']) {
      if (c[field] == null) errors.push(`Component ${c.id || '?'} missing ${field}`);
    }
  }

  for (const contract of ['component.schema.json', 'events.schema.json', 'cx-story.schema.json', 'capability.schema.json']) {
    if (!existsSync(join(root, 'contracts', contract))) {
      errors.push(`Missing contract: ${contract}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    componentCount: manifest.components.length,
    kernelVersion: manifest.kernel.version,
  };
}

if (process.argv[1]?.includes('validate-platform.mjs')) {
  const result = evaluate();
  if (!result.ok) {
    console.error('Platform validation FAILED:\n' + result.errors.map((e) => `  ✗ ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(`Platform validation OK — ${result.componentCount} components, kernel ${result.kernelVersion}`);
}
