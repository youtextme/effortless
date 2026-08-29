import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { resolveSchedule } from './config.js';
import { SERVICE_ROOT } from './paths.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const INSTALL_SCRIPT = join(__dirname, '..', 'install-schedule.ps1');

/**
 * Install Windows Scheduled Task for daily run.
 * @param {object} config
 */
export async function installSchedule(config) {
  if (process.platform !== 'win32') {
    throw new Error('install-schedule requires Windows Task Scheduler.');
  }

  const { hour, minute } = resolveSchedule(config);
  const nodePath = process.execPath;
  const cliPath = join(SERVICE_ROOT, 'cli.js');

  return new Promise((resolve, reject) => {
    const child = spawn(
      'powershell.exe',
      [
        '-NoProfile',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        INSTALL_SCRIPT,
        '-Hour',
        String(hour),
        '-Minute',
        String(minute),
        '-NodePath',
        nodePath,
        '-CliPath',
        cliPath,
        '-WorkingDir',
        SERVICE_ROOT,
      ],
      { windowsHide: true }
    );

    let output = '';
    child.stdout?.on('data', (d) => {
      output += d.toString();
    });
    child.stderr?.on('data', (d) => {
      output += d.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ ok: true, output: output.trim(), hour, minute });
      } else {
        reject(new Error(output.trim() || `install-schedule.ps1 exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}
