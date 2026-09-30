// Resolve Playwright from the project, the skill dir, or the global npm root.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

function load() {
  const tries = [process.cwd() + '/', import.meta.url];
  for (const base of tries) {
    try { return createRequire(base)('playwright'); } catch {}
  }
  try {
    const root = execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    return createRequire(import.meta.url)(path.join(root, 'playwright'));
  } catch {}
  console.error('design-recon: Playwright not found.\n  npm i -D playwright && npx playwright install chromium');
  process.exit(2);
}

const pw = load();
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 design-recon/1.0';

// SwiftShader keeps WebGL working in headless (3D heroes must render in shots, not fall back silently).
const ARGS = ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'];
export async function launch() {
  try { return await pw.chromium.launch({ args: ARGS }); } catch (e) {
    for (const p of [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium', '/usr/bin/chromium', '/usr/bin/google-chrome'])
      if (p && existsSync(p)) { try { return await pw.chromium.launch({ executablePath: p, args: ARGS }); } catch {} }
    throw e;
  }
}

export async function newPage(browser, width, height, extra = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height }, userAgent: UA, deviceScaleFactor: 1,
    isMobile: width < 600, hasTouch: width < 600, ...extra,
  });
  return ctx.newPage();
}

// Scroll to the bottom in steps so lazy content and scroll-triggered reveals render.
export async function settle(page, { maxH = 9000 } = {}) {
  await page.evaluate(async (maxH) => {
    const step = innerHeight * 0.8;
    for (let y = 0; y < Math.min(document.documentElement.scrollHeight, maxH); y += step) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 120));
    }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 300));
  }, maxH).catch(() => {});
}

// Full-page screenshot, height-capped so huge pages stay cheap.
export async function shotCapped(page, file, cap = 6000, quality = 70) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight).catch(() => 2000);
  const vw = page.viewportSize().width;
  await page.screenshot({ path: file, type: 'jpeg', quality, fullPage: true, clip: { x: 0, y: 0, width: vw, height: Math.min(h, cap) } });
}

// Navigate, wait for quiet, and dismiss cookie banners (reject/decline before accept).
export async function gotoSafe(page, url) {
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(700);
  // Dismiss obvious cookie banners so they don't pollute the frames (never accept tracking by default).
  for (const name of [/reject all/i, /decline/i, /only necessary|necessary only|essential only/i, /^close$/i, /accept all|^accept$|got it|i agree/i]) {
    const b = page.getByRole('button', { name }).first();
    if (await b.isVisible({ timeout: 300 }).catch(() => false)) { await b.click({ timeout: 1500 }).catch(() => {}); await page.waitForTimeout(300); break; }
  }
  return res;
}
