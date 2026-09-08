import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { JOBS_PATH, STATE_PATH } from './paths.js';
import { parseSchedule } from '../schedule/plan.js';
import { fail, EXIT } from './exit-codes.js';

const DEFAULT_SETTINGS = {
  ollamaUrls: ['http://127.0.0.1:11434', 'http://127.0.0.1:8817'],
  defaultModel: 'qwen3.5:4b',
  defaultModelFallback: 'llama3.2:3b',
};

const ID_RE = /^[a-z0-9][a-z0-9_-]{0,63}$/;

/**
 * @typedef {object} Job
 * @property {string} id
 * @property {boolean} enabled
 * @property {string} [to]
 * @property {string} [phone]
 * @property {string} schedule
 * @property {string} prompt
 * @property {string} [model]
 * @property {string} [modelFallback]
 * @property {string} [format]
 */

/**
 * Validate a single job. Returns error string or null.
 * @param {Job} job
 */
export function validateJob(job) {
  if (!job || typeof job !== 'object') return 'Job must be an object.';
  if (!job.id || !ID_RE.test(job.id)) {
    return 'Job id must be lowercase letters, numbers, hyphens (e.g. sigma-boy-morning).';
  }
  const hasTo = job.to && String(job.to).trim();
  const hasPhone = job.phone && String(job.phone).trim();
  if (!hasTo && !hasPhone) return 'Job needs "to" (chat name) or "phone".';
  if (hasTo && hasPhone) return 'Job needs "to" or "phone", not both.';
  if (!job.prompt || !String(job.prompt).trim()) return 'Job needs a non-empty "prompt".';
  if (!job.schedule || !parseSchedule(job.schedule)) {
    return 'Job schedule must be like "08:00" (24-hour local time).';
  }
  if (job.format && job.format !== 'text') {
    return 'Only format "text" is supported today.';
  }
  return null;
}

/**
 * Validate jobs file structure.
 * @param {object} data
 */
export function validateJobsFile(data) {
  if (!data || typeof data !== 'object') return 'jobs.json must be a JSON object.';
  if (!Array.isArray(data.jobs)) return 'jobs.json must have a "jobs" array.';
  const ids = new Set();
  for (const job of data.jobs) {
    const err = validateJob(job);
    if (err) return `Job "${job?.id ?? '?'}": ${err}`;
    if (ids.has(job.id)) return `Duplicate job id: ${job.id}`;
    ids.add(job.id);
  }
  return null;
}

/**
 * Load jobs.json.
 * @param {string} [path]
 */
export async function loadJobsFile(path = JOBS_PATH) {
  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { settings: { ...DEFAULT_SETTINGS }, jobs: [] };
    }
    throw err;
  }
  const data = JSON.parse(raw);
  const error = validateJobsFile(data);
  if (error) throw fail(EXIT.CONFIG, error);
  data.settings = { ...DEFAULT_SETTINGS, ...data.settings };
  return data;
}

/**
 * Save jobs.json.
 * @param {object} data
 * @param {string} [path]
 */
export async function saveJobsFile(data, path = JOBS_PATH) {
  const error = validateJobsFile(data);
  if (error) throw fail(EXIT.CONFIG, error);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(data, null, 2) + '\n');
}

/**
 * Get job by id.
 * @param {string} jobId
 */
export async function getJob(jobId) {
  const data = await loadJobsFile();
  const job = data.jobs.find((j) => j.id === jobId);
  if (!job) throw fail(EXIT.JOB_NOT_FOUND, `Job not found: ${jobId}`);
  return { job, settings: data.settings };
}

/**
 * List all jobs.
 */
export async function listJobs() {
  const data = await loadJobsFile();
  return data.jobs;
}

/**
 * Add or update a job.
 * @param {Job} job
 */
export async function upsertJob(job) {
  const err = validateJob(job);
  if (err) throw fail(EXIT.CONFIG, err);
  const data = await loadJobsFile();
  const idx = data.jobs.findIndex((j) => j.id === job.id);
  const normalized = {
    enabled: job.enabled !== false,
    format: job.format ?? 'text',
    ...job,
  };
  if (idx >= 0) {
    data.jobs[idx] = normalized;
  } else {
    data.jobs.push(normalized);
  }
  await saveJobsFile(data);
  return normalized;
}

/**
 * Remove job by id.
 * @param {string} jobId
 */
export async function removeJob(jobId) {
  const data = await loadJobsFile();
  const before = data.jobs.length;
  data.jobs = data.jobs.filter((j) => j.id !== jobId);
  if (data.jobs.length === before) {
    throw fail(EXIT.JOB_NOT_FOUND, `Job not found: ${jobId}`);
  }
  await saveJobsFile(data);
}

/**
 * Resolve model settings for a job.
 * @param {Job} job
 * @param {object} settings
 */
export function resolveJobModels(job, settings) {
  return {
    model: job.model ?? settings.defaultModel,
    modelFallback: job.modelFallback ?? settings.defaultModelFallback,
    ollamaUrls: settings.ollamaUrls,
  };
}

/**
 * Build the LLM prompt with optional format wrapper.
 * @param {Job} job
 */
export function buildPrompt(job) {
  if (job.format === 'text' || !job.format) return job.prompt;
  return job.prompt;
}

// --- Runtime state (resolved JIDs per job) ---

export async function loadState() {
  try {
    const raw = await readFile(STATE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { recipients: {} };
  }
}

export async function saveState(state) {
  await mkdir(dirname(STATE_PATH), { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(state, null, 2) + '\n');
}

/**
 * @param {string} jobId
 */
export async function getRecipientState(jobId) {
  const state = await loadState();
  return state.recipients?.[jobId] ?? null;
}

/**
 * @param {string} jobId
 * @param {string} jid
 * @param {string} name
 */
export async function saveRecipientState(jobId, jid, name) {
  const state = await loadState();
  if (!state.recipients) state.recipients = {};
  state.recipients[jobId] = { jid, name, updatedAt: new Date().toISOString() };
  await saveState(state);
}
