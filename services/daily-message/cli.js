#!/usr/bin/env node
/**
 * effortless daily-message CLI
 * Commands: link-whatsapp | run-now | install-schedule | doctor
 */

import { loadConfig } from './lib/config.js';
import { linkWhatsApp } from './lib/whatsapp.js';
import { runDailyJob } from './lib/run.js';
import { installSchedule } from './lib/schedule.js';
import { probeOllama } from './lib/ollama.js';
import { runDoctor } from './lib/doctor.js';
import { EXIT, exitLabel } from './lib/exit-codes.js';

const command = process.argv[2];

function usage() {
  console.log(`effortless daily-message

Commands:
  link-whatsapp     Scan QR once to link your WhatsApp account
  run-now           Generate a message with Ollama and send it now
  install-schedule  Create a Windows task for daily send (see config schedule)
  doctor            Check config, Ollama, WhatsApp session, recipient

Edit config.json to change recipient, prompt, model, or schedule (08:00 = local).

Exit codes:
  0 success  2 usage  3 config  4 ollama-down  5 ollama-fail
  6 not-linked  7 whatsapp-fail  8 chat-not-found  9 schedule-fail  10 internal`);
}

function die(code, message) {
  console.error(message);
  process.exit(code);
}

async function cmdLink() {
  const config = await loadConfig();
  await linkWhatsApp(config.to);
}

async function cmdRunNow() {
  const config = await loadConfig();
  const ollama = await probeOllama(config.ollamaUrls);
  if (!ollama.up) {
    die(EXIT.OLLAMA_DOWN, 'Ollama is not reachable. Start Ollama (127.0.0.1:11434).');
  }
  await runDailyJob();
}

async function cmdInstallSchedule() {
  if (process.platform !== 'win32') {
    die(EXIT.SCHEDULE_FAIL, 'install-schedule requires Windows.');
  }
  const config = await loadConfig();
  const result = await installSchedule(config);
  console.log(result.output);
  console.log(`\nScheduled daily at ${result.hour}:${String(result.minute).padStart(2, '0')} local.`);
}

async function cmdDoctor() {
  const report = await runDoctor();
  for (const c of report.checks) {
    const mark = c.ok ? 'OK' : 'FAIL';
    console.log(`[${mark}] ${c.name}: ${c.detail}`);
  }
  console.log(`\nOverall: ${report.ok ? 'ready' : 'not ready'} (exit ${report.code}: ${exitLabel(report.code)})`);
  process.exit(report.code);
}

async function main() {
  switch (command) {
    case 'link-whatsapp':
      await cmdLink();
      break;
    case 'run-now':
      await cmdRunNow();
      break;
    case 'install-schedule':
      await cmdInstallSchedule();
      break;
    case 'doctor':
      await cmdDoctor();
      break;
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
