import { spawn, execFile } from 'node:child_process';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { promisify } from 'node:util';
import { SERVICE_ROOT } from '../lib/paths.js';
import { buildSchedulePlan } from './install-plan.js';
import { fail, EXIT } from '../lib/exit-codes.js';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const WIN_SCRIPT = join(__dirname, 'install-windows.ps1');

/**
 * Install schedules for all enabled jobs.
 */
export async function installAllSchedules() {
  const { plan, errors } = await buildSchedulePlan();
  if (errors.length > 0) {
    throw fail(EXIT.SCHEDULE_FAIL, errors.join('\n'));
  }
  if (plan.length === 0) {
    throw fail(EXIT.SCHEDULE_FAIL, 'No enabled jobs to schedule.');
  }

  if (process.platform === 'win32') {
    return installWindows(plan);
  }
  return installCron(plan);
}

async function installWindows(plan) {
  const nodePath = process.execPath;
  const cliPath = join(SERVICE_ROOT, 'cli.js');
  const results = [];

  for (const entry of plan) {
    const output = await runPowerShell(WIN_SCRIPT, [
      '-JobId', entry.jobId,
      '-Hour', String(entry.hour),
      '-Minute', String(entry.minute),
      '-NodePath', nodePath,
      '-CliPath', cliPath,
      '-WorkingDir', SERVICE_ROOT,
    ]);
    results.push({ ...entry, output });
  }

  return { platform: 'windows', installed: results };
}

async function installCron(plan) {
  const cliPath = join(SERVICE_ROOT, 'cli.js');
  const lines = plan.map((entry) => {
    return `${entry.cron} cd ${SERVICE_ROOT} && ${process.execPath} ${cliPath} run-now ${entry.jobId}`;
  });

  const fragmentPath = join(SERVICE_ROOT, 'data', 'cron.fragment');
  await mkdir(join(SERVICE_ROOT, 'data'), { recursive: true });
  const header = '# effortless whatsapp-connector jobs\n';
  await writeFile(fragmentPath, header + lines.join('\n') + '\n');

  let merged = false;
  let message = `Wrote ${fragmentPath}. Add these lines to your crontab.`;

  try {
    const { stdout } = await execFileAsync('crontab', ['-l']);
    const existing = stdout.split('\n').filter((l) => !l.includes('whatsapp-connector') && !l.includes('effortless-wa-'));
    const combined = [...existing, ...lines].filter(Boolean).join('\n') + '\n';
    await writeFile(join(SERVICE_ROOT, 'data', 'cron.merged'), combined);
    await execFileAsync('crontab', [join(SERVICE_ROOT, 'data', 'cron.merged')]);
    merged = true;
    message = `Installed ${plan.length} cron job(s) via crontab.`;
  } catch {
    /* crontab not available — fragment file is the fallback */
  }

  return { platform: 'cron', installed: plan, merged, fragmentPath, message };
}

function runPowerShell(script, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script, ...args],
      { windowsHide: true }
    );
    let output = '';
    child.stdout?.on('data', (d) => { output += d.toString(); });
    child.stderr?.on('data', (d) => { output += d.toString(); });
    child.on('close', (code) => {
      if (code === 0) resolve(output.trim());
      else reject(fail(EXIT.SCHEDULE_FAIL, output.trim() || `PowerShell exited ${code}`));
    });
    child.on('error', (err) => reject(fail(EXIT.SCHEDULE_FAIL, err.message)));
  });
}
