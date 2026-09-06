#!/usr/bin/env node
/**
 * Customer-experience analyzer — journeys + stories + NFRs are the product spec.
 * CI fails if a journey step is unbound, a story has no test, an NFR lacks
 * source evidence, or a customer-facing component has no story.
 */

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

function walkFiles(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
}

function loadJson(root, rel) {
  return JSON.parse(readFileSync(join(root, rel), 'utf8'));
}

function collectTestBlob(root, testGlobs) {
  const files = [];
  for (const glob of testGlobs) {
    const base = glob.split('**')[0].replace(/\/$/, '');
    for (const f of walkFiles(join(root, base))) {
      if (f.endsWith('.test.js')) files.push(f);
    }
  }
  return {
    files,
    blob: files.map((f) => readFileSync(f, 'utf8')).join('\n'),
  };
}

function validateStory(story, index) {
  const errors = [];
  const required = ['id', 'component', 'given', 'when', 'then'];
  if (!story || typeof story !== 'object') {
    return [`stories[${index}] is not an object`];
  }
  for (const key of required) {
    if (typeof story[key] !== 'string' || !story[key].trim()) {
      errors.push(`stories[${index}] missing ${key}`);
    }
  }
  if (story.id && !/^[a-z0-9-]+$/.test(story.id)) {
    errors.push(`stories[${index}] id must be kebab-case: ${story.id}`);
  }
  if (story.nfr && !Array.isArray(story.nfr)) {
    errors.push(`stories[${index}] nfr must be an array`);
  }
  return errors;
}

function checkSourceEvidence(root, nfr, errors) {
  for (const ev of nfr.sourceEvidence || []) {
    const file = join(root, ev.file);
    if (!existsSync(file)) {
      errors.push(`NFR ${nfr.id} evidence file missing: ${ev.file}`);
      continue;
    }
    const src = readFileSync(file, 'utf8');
    for (const needle of ev.includes || []) {
      if (!src.includes(needle)) {
        errors.push(`NFR ${nfr.id} missing "${needle}" in ${ev.file}`);
      }
    }
  }
  if (nfr.maxLagWords != null) {
    const policySrc = readFileSync(join(root, 'wordspark/platform/speech/policy.js'), 'utf8');
    if (!policySrc.includes(`maxLagWords: ${nfr.maxLagWords}`)) {
      errors.push(`NFR ${nfr.id} maxLagWords ${nfr.maxLagWords} is not in speech policy`);
    }
  }
}

function checkJourneys(journeys, storyIds, errors) {
  const bound = new Set();
  if (!Array.isArray(journeys) || journeys.length === 0) {
    errors.push('CX journeys.json has no journeys');
    return bound;
  }
  const journeyIds = new Set();
  for (const journey of journeys) {
    if (!journey?.id || !/^[a-z0-9-]+$/.test(journey.id)) {
      errors.push(`Journey missing kebab-case id`);
      continue;
    }
    if (journeyIds.has(journey.id)) errors.push(`Duplicate journey id ${journey.id}`);
    journeyIds.add(journey.id);
    if (!journey.intent || !journey.actor) {
      errors.push(`Journey ${journey.id} needs actor and intent`);
    }
    const steps = journey.steps || [];
    if (!steps.length) errors.push(`Journey ${journey.id} has no steps`);
    const stepIds = new Set();
    for (const step of steps) {
      if (!step?.id || !step.story) {
        errors.push(`Journey ${journey.id} has a step without id/story`);
        continue;
      }
      if (stepIds.has(step.id)) errors.push(`Journey ${journey.id} duplicate step ${step.id}`);
      stepIds.add(step.id);
      if (!storyIds.has(step.story)) {
        errors.push(`Journey ${journey.id} step ${step.id} references unknown story ${step.story}`);
      }
      bound.add(step.story);
    }
  }
  return bound;
}

export function evaluateCx(root = repoRoot, overrides = {}) {
  const policy = overrides.policy || loadJson(root, 'platform/agent-guard.policy.json');
  const errors = [];
  const pack = loadJson(root, policy.cxStoriesPath);
  const stories = pack.stories || [];
  const nfrPack = loadJson(root, policy.nfrPath);
  const nfrs = nfrPack.requirements || [];
  const journeyPack = loadJson(root, policy.cxJourneysPath);
  const journeys = journeyPack.journeys || [];
  const manifest = loadJson(root, policy.manifestPath);
  const componentIds = new Set(manifest.components.map((c) => c.id));
  const nfrIds = new Set(nfrs.map((n) => n.id));
  const tests = overrides.testBlob != null
    ? { files: [], blob: overrides.testBlob }
    : collectTestBlob(root, policy.testGlobs);
  const seen = new Set();
  const storyComponents = new Set();
  const referencedNfr = new Set();

  if (!Array.isArray(stories) || stories.length === 0) {
    errors.push('CX stories.json has no stories');
  }

  stories.forEach((story, index) => {
    errors.push(...validateStory(story, index));
    if (!story?.id) return;
    if (seen.has(story.id)) errors.push(`Duplicate CX story id ${story.id}`);
    seen.add(story.id);
    storyComponents.add(story.component);
    if (story.component && !componentIds.has(story.component)) {
      errors.push(`CX story ${story.id} references unknown component ${story.component}`);
    }
    const marker = `${policy.storyMarker}${story.id}`;
    if (!tests.blob.includes(marker)) {
      errors.push(`CX story ${story.id} has no test marker ${marker}`);
    }
    for (const nfrId of story.nfr || []) {
      referencedNfr.add(nfrId);
      if (!nfrIds.has(nfrId)) {
        errors.push(`CX story ${story.id} references unknown NFR ${nfrId}`);
      }
    }
  });

  const boundStories = checkJourneys(journeys, seen, errors);
  for (const id of seen) {
    if (!boundStories.has(id)) {
      errors.push(`CX story ${id} is not on any customer journey`);
    }
  }

  const exempt = new Set(policy.storyExempt || []);
  for (const id of componentIds) {
    if (exempt.has(id)) continue;
    if (!storyComponents.has(id)) {
      errors.push(`Component ${id} has no CX story`);
    }
  }

  for (const nfr of nfrs) {
    if (!nfr?.id) {
      errors.push('NFR entry missing id');
      continue;
    }
    if (!referencedNfr.has(nfr.id)) {
      errors.push(`NFR ${nfr.id} is not bound to any CX story`);
    }
    checkSourceEvidence(root, nfr, errors);
  }

  return {
    ok: errors.length === 0,
    errors,
    storyCount: stories.length,
    nfrCount: nfrs.length,
    journeyCount: journeys.length,
    testFileCount: tests.files.length,
  };
}

if (process.argv[1]?.includes('analyzer.mjs')) {
  const result = evaluateCx();
  if (!result.ok) {
    console.error('CX analyzer FAILED:\n' + result.errors.map((e) => `  ✗ ${e}`).join('\n'));
    process.exit(1);
  }
  console.log(
    `CX analyzer OK — ${result.storyCount} stories, ${result.nfrCount} NFRs, ${result.journeyCount} journeys`,
  );
}
