import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { isCdpUp } from './cdp.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const HEAL_SCRIPT = join(__dirname, '..', 'start-whatsapp-cdp.ps1');

/**
 * Run the PowerShell heal script to restart WhatsApp Desktop with CDP.
 * Windows only.
 * @returns {Promise<{ ok: boolean, output: string }>}
 */
export async function runHealScript() {
  if (process.platform !== 'win32') {
    return {
      ok: false,
      output: 'Heal script requires Windows (WhatsApp Desktop Store app).',
    };
  }

  return new Promise((resolve) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', HEAL_SCRIPT],
      { windowsHide: true }
    );

    let output = '';
    child.stdout?.on('data', (d) => { output += d.toString(); });
    child.stderr?.on('data', (d) => { output += d.toString(); });

    child.on('close', (code) => {
      resolve({ ok: code === 0, output: output.trim() });
    });

    child.on('error', (err) => {
      resolve({ ok: false, output: err.message });
    });
  });
}

/**
 * Attempt heal then wait for CDP to come up.
 * @param {number} [timeoutMs=45000]
 */
export async function healAndWait(timeoutMs = 45000) {
  const result = await runHealScript();
  if (!result.ok) return { ...result, cdpUp: false };

  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isCdpUp()) {
      return { ...result, cdpUp: true };
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  return { ...result, cdpUp: false };
}
