#!/usr/bin/env node
/**
 * Capture mobile screenshots — run from repo root:
 * cd /tmp/cap && npm init -y && npm install puppeteer-core@23.11.1
 * CHROME=/usr/local/bin/google-chrome node /workspace/scripts/capture-snack-screenshots.mjs
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.SNACK_BASE || "http://127.0.0.1:5173";
const OUT = "/workspace/docs/screenshots/snack-blog";
const CHROME = process.env.CHROME_PATH || "/usr/local/bin/google-chrome";

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`saved ${file}`);
}

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

await page.goto(BASE, { waitUntil: "networkidle0" });
await shot(page, "01-discover");

await page.click("#btn-read-snack");
await page.waitForFunction(() => !document.getElementById("floor-read")?.hidden, { timeout: 5000 });
await shot(page, "02-read");

await page.click("#btn-read-next");
await shot(page, "02-read-screen-2");

for (let i = 0; i < 5; i += 1) {
  await page.click("#btn-read-next");
  await new Promise((r) => setTimeout(r, 120));
}
await page.waitForFunction(() => !document.getElementById("floor-done")?.hidden, { timeout: 3000 });
await shot(page, "03-done");

await page.click("#btn-next-snack");
await page.waitForFunction(() => !document.getElementById("floor-next")?.hidden, { timeout: 3000 });
await shot(page, "04-next");

await browser.close();
