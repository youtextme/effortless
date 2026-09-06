#!/usr/bin/env node
/**
 * Single CI entry — agents and GitHub Actions run this only.
 * Steps are listed in agent-guard.policy.json coverage + this runner.
 */

import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { loadPolicy } from './agent-guard.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

function run(label, command, args) {
  console.log(`\n▸ ${label}`);
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', env: process.env });
  if (result.status !== 0) {
    console.error(`✗ ${label} failed (exit ${result.status})`);
    process.exit(result.status || 1);
  }
}

function walkTestFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkTestFiles(p, acc);
    else if (p.endsWith('.test.js')) acc.push(p);
  }
  return acc;
}

const policy = loadPolicy(root);

run('platform validate', 'node', [join(root, 'platform/scripts/validate-platform.mjs')]);
run('agent-guard', 'node', [join(root, 'platform/scripts/agent-guard.mjs')]);
run('cx analyzer', 'node', [join(root, 'platform/cx/analyzer.mjs')]);

const nodeArgs = [
  '--test',
  '--experimental-test-coverage',
  `--test-coverage-lines=${policy.coverage.lines}`,
  `--test-coverage-functions=${policy.coverage.functions}`,
  `--test-coverage-branches=${policy.coverage.branches}`,
  '--import',
  join(root, 'platform/test/polyfill-storage.mjs'),
];
for (const inc of policy.coverageInclude) {
  nodeArgs.push(`--test-coverage-include=${inc}`);
}
for (const exc of policy.coverageExclude) {
  nodeArgs.push(`--test-coverage-exclude=${exc}`);
}
const testFiles = [];
for (const glob of policy.testGlobs) {
  const base = glob.split('**')[0].replace(/\/$/, '');
  walkTestFiles(join(root, base), testFiles);
}
if (!testFiles.length) {
  console.error('No test files found');
  process.exit(1);
}

run('tests + coverage', 'node', nodeArgs.concat(testFiles));
console.log('\nCI OK');
