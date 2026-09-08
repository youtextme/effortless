import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { loadJobsFile, listJobs } from './jobs.js';
import { probe } from '../llm/ollama.js';
import { AUTH_DIR } from './paths.js';
import { EXIT } from './exit-codes.js';
import { buildSchedulePlan } from '../schedule/install-plan.js';

export async function runDoctor() {
  const checks = [];
  let worst = EXIT.OK;

  function add(name, ok, detail, codeOnFail = EXIT.INTERNAL) {
    checks.push({ name, ok, detail });
    if (!ok && worst === EXIT.OK) worst = codeOnFail;
  }

  try {
    const data = await loadJobsFile();
    const enabled = data.jobs.filter((j) => j.enabled !== false).length;
    add('jobs-file', true, `${data.jobs.length} job(s), ${enabled} enabled`);
    add('ollama-config', true, data.settings.ollamaUrls.join(', '));
  } catch (err) {
    add('jobs-file', false, err.message, EXIT.CONFIG);
  }

  let urls = ['http://127.0.0.1:11434', 'http://127.0.0.1:8817'];
  try {
    const data = await loadJobsFile();
    urls = data.settings.ollamaUrls;
  } catch { /* use default */ }

  const ollama = await probe(urls);
  add('ollama', ollama.up, ollama.up ? `up at ${ollama.url}` : 'down on 11434 and 8817', EXIT.OLLAMA_DOWN);

  try {
    await access(AUTH_DIR, constants.R_OK);
    add('whatsapp-session', true, `auth dir: ${AUTH_DIR}`);
  } catch {
    add('whatsapp-session', false, 'not linked — run: node cli.js link-whatsapp', EXIT.WHATSAPP_NOT_LINKED);
  }

  const jobs = await listJobs().catch(() => []);
  add('jobs', jobs.length > 0, jobs.length > 0 ? jobs.map((j) => j.id).join(', ') : 'no jobs defined', EXIT.CONFIG);

  const { plan, errors } = await buildSchedulePlan(jobs).catch(() => ({ plan: [], errors: [] }));
  if (errors.length) {
    add('schedule-plan', false, errors.join('; '), EXIT.CONFIG);
  } else {
    add(
      'schedule-plan',
      true,
      plan.length ? plan.map((p) => `${p.jobId}@${p.schedule}`).join(', ') : 'no enabled jobs'
    );
  }

  const win = process.platform === 'win32';
  add('scheduler', true, win ? 'Windows Task Scheduler' : 'cron (install-schedule writes crontab or fragment)');

  const allOk = checks.every((c) => c.ok || c.name === 'scheduler');
  return { ok: allOk, code: allOk ? EXIT.OK : worst, checks };
}
