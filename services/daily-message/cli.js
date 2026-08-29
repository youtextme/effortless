#!/usr/bin/env node
/**
 * effortless daily-message CLI
 * Commands: link-whatsapp | run-now | install-schedule
 */

import { loadConfig } from './lib/config.js';
import { linkWhatsApp } from './lib/whatsapp.js';
import { runDailyJob } from './lib/run.js';
import { installSchedule } from './lib/schedule.js';
import { probeOllama } from './lib/ollama.js';

const command = process.argv[2];

function usage() {
  console.log(`effortless daily-message

Commands:
  link-whatsapp     Scan QR once to link your WhatsApp account
  run-now           Generate a message with Ollama and send it now
  install-schedule  Create a Windows task to run daily at 8:00 AM

Edit config.json to change recipient, prompt, model, or schedule.`);
}

async function cmdLink() {
  const config = await loadConfig();
  await linkWhatsApp(config.to);
}

async function cmdRunNow() {
  const config = await loadConfig();
  const ollama = await probeOllama(config.ollamaUrls);
  if (!ollama.up) {
    console.error('Ollama is not reachable. Start Ollama first (127.0.0.1:11434).');
    process.exit(1);
  }
  await runDailyJob();
}

async function cmdInstallSchedule() {
  const config = await loadConfig();
  const result = await installSchedule(config);
  console.log(result.output);
  console.log(`\nScheduled daily at ${result.hour}:${String(result.minute).padStart(2, '0')}.`);
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
    default:
      usage();
      process.exit(command ? 1 : 0);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
