#!/usr/bin/env node
/**
 * Capture mobile screenshots of the minimal snack flow.
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

await shot(page, "v2-01-read");

await page.evaluate(() => {
  window.scrollTo(0, document.documentElement.scrollHeight);
});
await new Promise((r) => setTimeout(r, 200));
await page.click("#btn-read-done");
await page.waitForFunction(() => !document.getElementById("step-comprehension")?.hidden, { timeout: 5000 });
await shot(page, "v2-02-comprehension");

await page.evaluate(() => {
  document.querySelectorAll('input[type="radio"]').forEach((el, i) => {
    if (i % 3 === 0) el.checked = true;
  });
});
await page.click("#btn-comp-done");
await page.waitForFunction(() => !document.getElementById("step-video")?.hidden, { timeout: 3000 });
await page.type("#video-observations", "I noticed the rain hitting the dry ground.");
await shot(page, "v2-03-video");

await page.click("#btn-video-done");
await page.waitForFunction(() => !document.getElementById("step-share")?.hidden, { timeout: 3000 });
await shot(page, "v2-04-share");

await browser.close();
