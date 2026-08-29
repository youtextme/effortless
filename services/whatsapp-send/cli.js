#!/usr/bin/env node
/**
 * CLI wrapper for the WhatsApp send bridge.
 * Commands: send, status, list, health [--fix]
 */

import { sendMessage, getStatus, listChats } from './lib/send.js';
import { validateSendInput } from './lib/validation.js';
import { healAndWait } from './lib/heal.js';
import { isCdpUp } from './lib/cdp.js';
import { EXIT, exitLabel } from './lib/exit-codes.js';

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0];
  const flags = {};
  const positional = [];

  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a === '--fix') {
      flags.fix = true;
    } else if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i + 1];
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

  return { command, flags, positional };
}

function usage() {
  console.error(`Usage:
  whatsapp-send send --name "Contact" --message "Hello"
  whatsapp-send send --phone 15551234567 --message "Hello"
  whatsapp-send status
  whatsapp-send list
  whatsapp-send health [--fix]

Exit codes:
  0 verified send   2 usage        3 cdp-down
  4 no-page         5 needs-login  6 chat-not-found
  7 read-only       8 unverified   9 internal`);
}

async function maybeHeal(fix) {
  if (!fix) return;
  if (await isCdpUp()) return;
  console.error('CDP down — running heal script...');
  const result = await healAndWait();
  if (!result.cdpUp) {
    console.error('Heal failed:', result.output);
    process.exit(EXIT.CDP_DOWN);
  }
  console.error('CDP restored.');
}

async function cmdSend(flags) {
  const input = {
    name: flags.name,
    phone: flags.phone,
    message: flags.message ?? flags.m,
  };

  const err = validateSendInput(input);
  if (err) {
    console.error(err.error);
    usage();
    process.exit(EXIT.USAGE);
  }

  await maybeHeal(flags.fix);

  const { code, receipt } = await sendMessage(input);
  console.log(JSON.stringify(receipt, null, 2));
  process.exit(code);
}

async function cmdStatus(flags) {
  await maybeHeal(flags.fix);
  const { code, status } = await getStatus();
  console.log(JSON.stringify(status, null, 2));
  process.exit(code === EXIT.OK ? 0 : code);
}

async function cmdList(flags) {
  await maybeHeal(flags.fix);
  const { code, chats, error } = await listChats();
  const out = { chats };
  if (error) out.error = error;
  console.log(JSON.stringify(out, null, 2));
  process.exit(code === EXIT.OK ? 0 : code);
}

async function cmdHealth(flags) {
  if (flags.fix) {
    const result = await healAndWait();
    const health = {
      cdp: result.cdpUp,
      healed: true,
      output: result.output,
    };
    console.log(JSON.stringify(health, null, 2));
    process.exit(result.cdpUp ? 0 : EXIT.CDP_DOWN);
  }

  const up = await isCdpUp();
  const health = { cdp: up };
  if (up) {
    const { status } = await getStatus();
    Object.assign(health, status);
  }
  console.log(JSON.stringify(health, null, 2));
  process.exit(up ? 0 : EXIT.CDP_DOWN);
}

async function main() {
  const { command, flags } = parseArgs(process.argv);

  switch (command) {
    case 'send':
      await cmdSend(flags);
      break;
    case 'status':
      await cmdStatus(flags);
      break;
    case 'list':
      await cmdList(flags);
      break;
    case 'health':
      await cmdHealth(flags);
      break;
    default:
      console.error(`Unknown command: ${command ?? '(none)'}`);
      usage();
      process.exit(EXIT.USAGE);
  }
}

main().catch((err) => {
  console.error('Internal error:', err.message);
  process.exit(EXIT.INTERNAL);
});
