#!/usr/bin/env node
/**
 * effortless whatsapp-connector CLI
 */

import { linkWhatsApp } from './whatsapp/baileys.js';
import { runJob } from './lib/run.js';
import { runDoctor } from './lib/doctor.js';
import { installAllSchedules } from './schedule/install.js';
import { listJobs, upsertJob, removeJob } from './lib/jobs.js';
import { EXIT, exitLabel, fail } from './lib/exit-codes.js';

const [command, ...rest] = process.argv.slice(2);

function parseFlags(argv) {
  const flags = {};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (val && !val.startsWith('--')) {
        flags[key] = val;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { flags, positional };
}

function usage() {
  console.log(`effortless whatsapp-connector — LLM prompt → WhatsApp ($0)

Commands:
  link-whatsapp              Scan QR once (per machine)
  add-job                    Add a job (--id --to|--phone --schedule --prompt ...)
  list-jobs                  List all jobs
  remove-job <id>            Remove a job
  run-now <job-id>           Generate + send one job now
  install-schedule           Register every enabled job (Windows Task / cron)
  doctor                     Health check

Examples:
  node cli.js add-job --id morning-note --to "Sigma Boy" --schedule 08:00 --prompt "Write a warm note"
  node cli.js run-now sigma-boy-morning

Exit codes: 0 ok · 2 usage · 3 config · 4 job-not-found · 5 ollama-down
  6 ollama-fail · 7 not-linked · 8 whatsapp-fail · 9 chat-not-found · 10 schedule · 11 internal`);
}

async function cmdAddJob(flags) {
  const id = flags.id;
  if (!id) throw fail(EXIT.USAGE, '--id is required');
  const job = {
    id,
    enabled: flags.disabled ? false : true,
    to: flags.to,
    phone: flags.phone,
    schedule: flags.schedule ?? '08:00',
    prompt: flags.prompt,
    model: flags.model,
    modelFallback: flags['model-fallback'],
    format: flags.format ?? 'text',
  };
  const saved = await upsertJob(job);
  console.log(JSON.stringify(saved, null, 2));
}

async function cmdListJobs() {
  const jobs = await listJobs();
  console.log(JSON.stringify(jobs, null, 2));
}

async function cmdRemoveJob(id) {
  if (!id) throw fail(EXIT.USAGE, 'Usage: remove-job <job-id>');
  await removeJob(id);
  console.log(`Removed job: ${id}`);
}

async function cmdRunNow(id) {
  if (!id) throw fail(EXIT.USAGE, 'Usage: run-now <job-id>');
  await runJob(id);
}

async function cmdInstallSchedule() {
  const result = await installAllSchedules();
  if (result.platform === 'windows') {
    for (const r of result.installed) {
      console.log(r.output);
    }
    console.log(`\nInstalled ${result.installed.length} Windows task(s).`);
  } else {
    console.log(result.message);
    for (const r of result.installed) {
      console.log(`  ${r.cron}  run-now ${r.jobId}`);
    }
  }
}

async function main() {
  const { flags, positional } = parseFlags(rest);

  switch (command) {
    case 'link-whatsapp':
      await linkWhatsApp();
      break;
    case 'add-job':
      await cmdAddJob(flags);
      break;
    case 'list-jobs':
      await cmdListJobs();
      break;
    case 'remove-job':
      await cmdRemoveJob(positional[0]);
      break;
    case 'run-now':
      await cmdRunNow(positional[0]);
      break;
    case 'install-schedule':
      await cmdInstallSchedule();
      break;
    case 'doctor':
      {
        const report = await runDoctor();
        for (const c of report.checks) {
          console.log(`[${c.ok ? 'OK' : 'FAIL'}] ${c.name}: ${c.detail}`);
        }
        console.log(`\nOverall: ${report.ok ? 'ready' : 'not ready'} (exit ${report.code})`);
        process.exit(report.code);
      }
    default:
      usage();
      process.exit(command ? EXIT.USAGE : EXIT.OK);
  }
}

main().catch((err) => {
  const code = err.exitCode ?? EXIT.INTERNAL;
  console.error(`${exitLabel(code)}: ${err.message}`);
  process.exit(code);
});
