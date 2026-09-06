#!/usr/bin/env node
/**
 * Agent-guard — fail-closed checks so agents cannot ship untested platform work.
 * Policy: platform/agent-guard.policy.json
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

export function loadPolicy(root = repoRoot) {
  return JSON.parse(readFileSync(join(root, 'platform/agent-guard.policy.json'), 'utf8'));
}

function walkFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

function read(root, rel) {
  return readFileSync(join(root, rel), 'utf8');
}

export function evaluate(root = repoRoot, policy = loadPolicy(root)) {
  const errors = [];
  const manifest = JSON.parse(read(root, policy.manifestPath));
  const ids = manifest.components.map((c) => c.id);
  const testFiles = [];
  for (const glob of policy.testGlobs) {
    const base = glob.split('**')[0].replace(/\/$/, '');
    const dir = join(root, base);
    for (const f of walkFiles(dir)) {
      if (f.endsWith('.test.js')) testFiles.push(f);
    }
  }
  const testBlob = testFiles.map((f) => readFileSync(f, 'utf8')).join('\n');

  for (const id of ids) {
    if (id === 'shell') {
      if (!existsSync(join(root, policy.shellPath))) {
        errors.push('Missing shell.js');
      }
    } else {
      const file = join(root, policy.runtimeComponentDir, `${id}.js`);
      if (!existsSync(file)) errors.push(`Missing runtime component ${id}: ${file}`);
    }
    if (!testBlob.includes(`${policy.componentMarker}${id}`)) {
      errors.push(`No test mentions ${policy.componentMarker}${id}`);
    }
  }

  const shellSrc = existsSync(join(root, policy.shellPath)) ? read(root, policy.shellPath) : '';
  for (const id of ids) {
    if (id === 'shell') continue;
    const importNeedle = `components/${id}.js`;
    const pascal = id.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase()) + 'Component';
    if (!shellSrc.includes(importNeedle) && !shellSrc.includes(pascal)) {
      errors.push(`shell.js does not import ${id} (${pascal})`);
    }
  }

  const jsDir = join(root, 'wordspark/js');
  if (existsSync(jsDir)) {
    for (const name of readdirSync(jsDir)) {
      const p = join(jsDir, name);
      if (!statSync(p).isFile() || !name.endsWith('.js')) continue;
      if (!policy.jsFacadeAllowlist.includes(name)) {
        errors.push(`Unlisted module wordspark/js/${name} — add a platform component or the allowlist`);
      }
    }
  }

  for (const rule of policy.forbidden) {
    const re = new RegExp(rule.pattern);
    for (const rel of rule.roots) {
      const dir = join(root, rel);
      for (const f of walkFiles(dir)) {
        if (!f.endsWith('.js') && !f.endsWith('.mjs')) continue;
        if (f.endsWith('.test.js')) continue;
        const src = readFileSync(f, 'utf8');
        if (re.test(src)) {
          errors.push(`${rule.id} in ${relative(root, f)}`);
        }
      }
    }
  }

  const swPath = policy.swPath;
  if (swPath && existsSync(join(root, swPath))) {
    const swSrc = read(root, swPath);
    if (!/CACHE_NAME = ['"]wordspark-v\d+['"]/.test(swSrc)) {
      errors.push('sw.js CACHE_NAME must be wordspark-vN');
    }
    const runtimeDir = join(root, policy.swRuntimeDir || 'wordspark/platform');
    const wordsparkRoot = join(root, 'wordspark');
    for (const f of walkFiles(runtimeDir)) {
      if (!f.endsWith('.js') || f.endsWith('.test.js')) continue;
      const rel = `./${relative(wordsparkRoot, f).replaceAll('\\', '/')}`;
      if (!swSrc.includes(`'${rel}'`) && !swSrc.includes(`"${rel}"`)) {
        errors.push(`SW cache missing ${rel} — add it to ASSETS and bump CACHE_NAME`);
      }
    }
  } else if (swPath) {
    errors.push(`Missing service worker ${swPath}`);
  }

  return { ok: errors.length === 0, errors, testFileCount: testFiles.length };
}

if (process.argv[1]?.includes('agent-guard.mjs')) {
  const result = evaluate();
  if (!result.ok) {
    console.error('Agent-guard FAILED:\n' + result.errors.map((e) => `  ✗ ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(`Agent-guard OK — ${result.testFileCount} test files`);
}
