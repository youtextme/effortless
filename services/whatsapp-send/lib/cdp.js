import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CDP_URL, ARTIFACTS_DIR } from './constants.js';
import { EXIT } from './exit-codes.js';

/**
 * Probe whether CDP is reachable on port 9222.
 * @returns {Promise<boolean>}
 */
export async function isCdpUp() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`, {
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Connect to WhatsApp Desktop via CDP and return the web.whatsapp.com page.
 * @param {import('playwright-core').Browser} browser
 */
export async function findWhatsAppPage(browser) {
  for (const context of browser.contexts()) {
    for (const page of context.pages()) {
      const url = page.url();
      if (url.includes('web.whatsapp.com')) {
        return page;
      }
    }
  }
  return null;
}

/**
 * Wait for logged-in state (#pane-side) or QR (needs login).
 * @param {import('playwright-core').Page} page
 */
export async function waitForLoginState(page) {
  const paneSide = page.locator('#pane-side');
  const qrCanvas = page.locator('canvas[aria-label], div[data-ref] canvas').first();

  const result = await Promise.race([
    paneSide.waitFor({ state: 'visible', timeout: 30000 }).then(() => 'logged-in'),
    qrCanvas.waitFor({ state: 'visible', timeout: 30000 }).then(() => 'qr'),
  ]).catch(() => 'timeout');

  if (result === 'qr') return { loggedIn: false };
  if (result === 'logged-in') return { loggedIn: true };
  return { loggedIn: false, timeout: true };
}

/**
 * Save a screenshot to artifacts/ with a timestamped filename.
 * @param {import('playwright-core').Page} page
 * @param {string} label
 */
export async function saveScreenshot(page, label) {
  await mkdir(ARTIFACTS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const path = join(ARTIFACTS_DIR, `${ts}-${label}.png`);
  await page.screenshot({ path, fullPage: false });
  return path;
}

/**
 * Connect playwright to CDP. Returns browser or throws with exit code hint.
 */
export async function connectCdp(playwright) {
  const up = await isCdpUp();
  if (!up) {
    const err = new Error('CDP not reachable at ' + CDP_URL);
    err.exitCode = EXIT.CDP_DOWN;
    throw err;
  }

  try {
    return await playwright.chromium.connectOverCDP(CDP_URL);
  } catch (e) {
    const err = new Error('Failed to connect over CDP: ' + e.message);
    err.exitCode = EXIT.CDP_DOWN;
    throw err;
  }
}

/**
 * Get main pane inner text for occurrence counting.
 * @param {import('playwright-core').Page} page
 */
export async function getMainText(page) {
  const main = page.locator('#main');
  if ((await main.count()) === 0) return '';
  return (await main.innerText()) ?? '';
}

/**
 * Get composer text content.
 * @param {import('playwright-core').Page} page
 */
export async function getComposerText(page) {
  const composer = page.locator('#main footer div[contenteditable="true"]');
  if ((await composer.count()) === 0) return '';
  return (await composer.innerText()) ?? '';
}

/**
 * Write debug metadata alongside screenshots.
 * @param {string} label
 * @param {object} data
 */
export async function saveDebugMeta(label, data) {
  await mkdir(ARTIFACTS_DIR, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const path = join(ARTIFACTS_DIR, `${ts}-${label}.json`);
  await writeFile(path, JSON.stringify(data, null, 2));
  return path;
}
