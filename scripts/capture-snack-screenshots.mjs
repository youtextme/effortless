/**
 * Capture mobile screenshots — run with:
 * npx --yes -p puppeteer-core@23.11.1 node scripts/capture-snack-screenshots.mjs
 */
import puppeteer from "puppeteer-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = "http://127.0.0.1:5173";
const OUT = path.resolve("docs/screenshots/snack-blog");
const CHROME =
  process.env.CHROME_PATH ||
  "/home/ubuntu/.cache/ms-playwright/chromium_headless_shell-1148/chrome-headless-shell-linux64/chrome-headless-shell";

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`saved ${file}`);
}

await mkdir(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

const page = await browser.newPage();
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });

await page.goto(BASE, { waitUntil: "networkidle0" });
await shot(page, "01-discover");

await page.click("#btn-discover-next");
await shot(page, "02-pick");

await page.click("#btn-pick-blog-continue");
await shot(page, "03-create");

await page.click("#btn-load-sample");
await page.waitForFunction(
  () => !document.getElementById("floor-read")?.hidden,
  { timeout: 5000 },
);
await shot(page, "04-read");

await page.click("#btn-read-next");
await shot(page, "04-read-screen-2");

for (let i = 0; i < 4; i += 1) {
  await page.click("#btn-read-next");
}
await shot(page, "05-done");

await browser.close();
