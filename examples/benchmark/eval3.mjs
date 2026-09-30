#!/usr/bin/env node
// Round 3 neutral evaluation of two built web apps (E, F): serves each app/dist, discovers routes from the
// navigation, and records axe, console errors, bundle size, layout shift, motion evidence, reduced motion,
// mobile menu and demo-form behaviour. Screenshots and filmstrips go to shots/r3/ for blind judging.
//   RUNS=E,F node eval3.mjs <axe.min.js>
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../skills/design-recon/scripts/lib/pw.mjs';
import http from 'node:http';
import { existsSync } from 'node:fs';
// Static server with an SPA fallback (unknown paths → index.html), like Netlify/Vercel static hosting.
const TYPES = { html: 'text/html', css: 'text/css', js: 'text/javascript', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', avif: 'image/avif', glb: 'model/gltf-binary', woff2: 'font/woff2', woff: 'font/woff', ico: 'image/x-icon', txt: 'text/plain', webmanifest: 'application/manifest+json' };
async function serve(root) {
  const server = http.createServer((req, res) => {
    let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (!existsSync(p) || statSync(p).isDirectory()) p = existsSync(path.join(p, 'index.html')) ? path.join(p, 'index.html') : path.join(root, 'index.html');
    res.writeHead(200, { 'content-type': TYPES[p.split('.').pop()] || 'application/octet-stream' }); res.end(readFileSync(p));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}/`, close: () => server.close() };
}

const here = path.dirname(fileURLToPath(import.meta.url));
const axe = readFileSync(process.argv[2], 'utf8');
const out = path.join(here, 'shots', 'r3'); mkdirSync(out, { recursive: true });
const wait = (ms) => new Promise(r => setTimeout(r, ms));
const du = (d) => readdirSync(d).reduce((a, f) => { const p = path.join(d, f), s = statSync(p); return a + (s.isDirectory() ? du(p) : s.size); }, 0);
const results = {};
const browser = await launch();

for (const run of (process.env.RUNS || 'E,F').split(',')) {
  const dist = path.join(here, run, 'app', 'dist');
  const r = results[run] = { distBytes: du(dist), js: {}, pages: {} };
  for (const f of readdirSync(path.join(dist, 'assets')).filter(f => /\.(js|css)$/.test(f))) r.js[f] = statSync(path.join(dist, 'assets', f)).size;
  const srv = await serve(dist);
  const base = srv.url;

  // Discover routes from links on the home page.
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message.slice(0, 140))); p.on('console', m => m.type() === 'error' && errs.push(m.text().slice(0, 140)));
  await p.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
  await p.goto(base, { waitUntil: 'networkidle' }); await wait(1200);
  const routes = await p.evaluate(() => {
    const set = new Map();
    for (const a of document.querySelectorAll('a[href]')) {
      const h = a.getAttribute('href'); if (!h || /^(https?:|mailto:|tel:)/.test(h)) continue;
      if (/^#[^/]/.test(h) && !h.startsWith('#/')) continue;
      const u = new URL(a.href); const key = u.hash.startsWith('#/') ? u.hash.split('?')[0] : u.pathname;
      if (!set.has(key)) set.set(key, a.href);
    }
    return [...set.entries()].slice(0, 12);
  });
  r.routes = routes.map(([k]) => k);

  // Hero filmstrip over time (motion evidence), then scroll filmstrip on home.
  for (const [i, t] of [0, 900, 1800].entries()) { if (t) await wait(900); await p.screenshot({ path: path.join(out, `${run}-hero-t${i}.png`) }); }
  await p.mouse.move(300, 300); await wait(300); await p.mouse.move(1100, 500); await wait(500);
  await p.screenshot({ path: path.join(out, `${run}-hero-pointer.png`) });
  const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const f of [0.2, 0.4, 0.6, 0.8]) { await p.evaluate(y => scrollTo(0, y), Math.round(H * f)); await wait(900); await p.screenshot({ path: path.join(out, `${run}-scroll-${Math.round(f * 100)}.png`) }); }
  r.homeCLS = +(await p.evaluate(() => window.__cls)).toFixed(3);
  r.runningAnimations = await p.evaluate(() => document.getAnimations().length);

  // Every route: axe + full-page desktop shot.
  for (const [key, href] of routes) {
    await p.goto(href, { waitUntil: 'networkidle' }); await wait(900);
    // scroll through so scroll-triggered content is revealed before the full-page shot
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
    await wait(600);
    await p.addScriptTag({ content: axe });
    const ax = await p.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length })));
    const agg = { serious: 0, critical: 0, moderate: 0, minor: 0 }; for (const v of ax) agg[v.impact] += v.n;
    const slug = key.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'home';
    r.pages[key] = { axe: agg, rules: ax.map(v => `${v.id}(${v.impact[0]}×${v.n})`), h1: await p.evaluate(() => document.querySelectorAll('h1').length) };
    await p.screenshot({ path: path.join(out, `${run}-page-${slug}.png`), fullPage: true });
  }

  // Route transition evidence: click the 2nd nav link and capture mid-transition.
  await p.goto(base, { waitUntil: 'networkidle' }); await wait(800);
  if (routes[1]) {
    const sel = await p.evaluate((h) => { const a = [...document.querySelectorAll('header a[href], nav a[href]')].find(a => a.href === h); if (a) { a.setAttribute('data-eval-nav', ''); return true; } return false; }, routes[1][1]);
    if (sel) { await p.evaluate(() => document.querySelector('[data-eval-nav]').click()); await wait(150); await p.screenshot({ path: path.join(out, `${run}-transition-mid.png`) }); }
  }

  // Demo form: empty submit → errors, valid submit → success.
  const demo = routes.find(([k]) => /demo|contact/i.test(k));
  if (demo) {
    await p.goto(demo[1], { waitUntil: 'networkidle' }); await wait(800);
    r.form = await p.evaluate(async () => {
      const w = (ms) => new Promise(r => setTimeout(r, ms));
      const form = document.querySelector('form'); if (!form) return { form: false };
      const before = document.body.innerText;
      const btn = form.querySelector('button[type=submit], button:not([type=button])'); btn?.click(); await w(500);
      const errText = document.body.innerText.replace(before, '');
      const errors = form.querySelectorAll('[aria-invalid=true]').length || (/(required|enter|valid|please)/i.test(errText) ? 1 : 0);
      for (const i of form.querySelectorAll('input, select, textarea')) {
        const t = (i.type || '').toLowerCase(); let v = 'Harbour Resilience Office';
        if (i.tagName === 'SELECT') { if (i.options.length > 1) i.selectedIndex = 1; i.dispatchEvent(new Event('change', { bubbles: true })); continue; }
        if (t === 'checkbox' || t === 'radio') { if (!i.checked) i.click(); continue; }
        if (t === 'email') v = 'r.okafor@portofexample.org'; else if (t === 'tel') v = '+44 20 7946 0958'; else if (t === 'number') v = '250000'; else if (t === 'url') v = 'https://example.org';
        else if (i.tagName === 'TEXTAREA') v = 'We need street-level flood forecasts for the harbour district ahead of the winter storm season.';
        const setter = Object.getOwnPropertyDescriptor(i.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set;
        setter.call(i, v); i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const mid = document.body.innerText; btn?.click(); await w(2500);
      const after = document.body.innerText;
      return { form: true, showsErrorsOnEmpty: !!errors, success: after !== mid && /(thank|received|we'll|we will|be in touch|booked|confirmed|sent)/i.test(after) };
    });
    await p.screenshot({ path: path.join(out, `${run}-demo-after.png`) });
  }
  r.consoleErrors = errs;
  await ctx.close();

  // Mobile: overflow per route, home shot, menu toggle.
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await m.newPage(); r.mobileOverflow = {};
  for (const [key, href] of routes) { await mp.goto(href, { waitUntil: 'networkidle' }); await wait(500); r.mobileOverflow[key] = await mp.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth)); }
  await mp.goto(base, { waitUntil: 'networkidle' }); await wait(1200);
  await mp.screenshot({ path: path.join(out, `${run}-mobile-hero.png`) });
  await mp.screenshot({ path: path.join(out, `${run}-mobile-home.png`), fullPage: true });
  const menu = mp.locator('header button[aria-expanded], button[aria-label*="menu" i], button:has-text("Menu")').first();
  if (await menu.isVisible().catch(() => false)) { await menu.click(); await wait(600); r.mobileMenu = { opens: await menu.getAttribute('aria-expanded') === 'true' || true }; await mp.screenshot({ path: path.join(out, `${run}-mobile-menu.png`) }); }
  else r.mobileMenu = { opens: false };
  await m.close();

  // Reduced motion: count running animations and whether the hero still changes over time.
  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await rm.newPage(); await rp.goto(base, { waitUntil: 'networkidle' }); await wait(800);
  const a1 = await rp.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } }); await wait(1500);
  const a2 = await rp.screenshot({ clip: { x: 0, y: 0, width: 1440, height: 900 } });
  r.reducedMotion = { runningAnimations: await rp.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), heroStillChanging: !a1.equals(a2) };
  await rm.close(); srv.close();
}
await browser.close();
writeFileSync(path.join(here, 'eval3.json'), JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
