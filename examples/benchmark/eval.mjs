#!/usr/bin/env node
// Neutral evaluation of both benchmark outputs. Uses third-party axe-core (accessibility) and a generic
// functional probe; does NOT use design-recon's own lint/shoot (those are reported separately as
// "home-team" metrics because the skill optimizes for them).
//   node eval.mjs <axe.min.js path>
import { readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../skills/design-recon/scripts/lib/pw.mjs';
import { serve } from '../../skills/design-recon/scripts/lib/serve.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const axe = readFileSync(process.argv[2], 'utf8');
const shotsDir = path.join(here, 'shots'); mkdirSync(shotsDir, { recursive: true });
const results = {};
const browser = await launch();
for (const run of (process.env.RUNS || 'A,B').split(',')) {
  const file = path.join(here, run, 'out', 'index.html');
  const r = results[run] = { bytes: statSync(file).size };
  const srv = await serve(file);
  // Desktop: axe, console errors, requests, screenshot
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); const errs = [], reqs = new Set();
  p.on('pageerror', e => errs.push(e.message.slice(0, 120))); p.on('console', m => m.type() === 'error' && errs.push(m.text().slice(0, 120)));
  p.on('request', q => { try { reqs.add(new URL(q.url()).host); } catch {} });
  const t0 = Date.now(); await p.goto(srv.url, { waitUntil: 'networkidle' }); r.loadMs = Date.now() - t0;
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(shotsDir, `${run}-desktop.png`), fullPage: true });
  await p.addScriptTag({ content: axe });
  const ax = await p.evaluate(async () => (await window.axe.run(document, { resultTypes: ['violations'] })).violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })));
  r.axe = { critical: 0, serious: 0, moderate: 0, minor: 0 }; for (const v of ax) r.axe[v.impact] += v.nodes; r.axeRules = ax.map(v => `${v.id}(${v.impact[0]}×${v.nodes})`);
  r.hosts = [...reqs].filter(h => h !== new URL(srv.url).host);
  // Generic functional probe: fill visible inputs, press the add/submit control, look for the new item, reload.
  // Generic functional probe (two-step aware): open the add flow if needed, fill every visible field,
  // submit, then look for the new plant; afterwards reload to test persistence.
  r.functional = await p.evaluate(async () => {
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    const vis = (e) => { const b = e.getBoundingClientRect(); return b.width > 0 && b.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const fill = (root) => { let n = 0; for (const i of [...root.querySelectorAll('input, select, textarea')].filter(vis)) {
      const t = (i.type || '').toLowerCase();
      if (i.tagName === 'SELECT') { if (i.options.length > 1) i.selectedIndex = 1; }
      else if (t === 'number' || t === 'range') i.value = (i.min && +i.min > 7) ? i.min : '7';
      else if (t === 'date') i.value = new Date().toISOString().slice(0, 10);
      else if (['text', 'search', ''].includes(t) || i.tagName === 'TEXTAREA') i.value = 'Zebra Calathea';
      else if (t === 'radio' || t === 'checkbox') { if (!i.checked) i.click(); continue; }
      else continue;
      i.dispatchEvent(new Event('input', { bubbles: true })); i.dispatchEvent(new Event('change', { bubbles: true })); n++; } return n; };
    const label = (b) => (b.innerText || b.value || b.getAttribute('aria-label') || '').trim();
    const find = (root, re) => [...root.querySelectorAll('button, input[type=submit], [role=button]')].filter(vis).find(b => re.test(label(b)));
    const steps = [];
    // Same rule for every app: if no submit control is visible yet, open the add flow first.
    const visibleSubmit = () => [...document.querySelectorAll('button[type=submit], input[type=submit], form button:not([type=button])')].find(vis);
    if (!visibleSubmit()) { const open = find(document, /add|new|plant/i); if (open) { open.click(); steps.push('opened: ' + label(open).slice(0, 24)); await wait(500); } }
    const scope = [...document.querySelectorAll('dialog[open], [role=dialog], form')].find(vis) || document;
    const filled = fill(scope);
    const submit = [...scope.querySelectorAll('button[type=submit], input[type=submit]')].find(vis) || find(scope, /add|save|create|plant|done/i);
    if (!submit) return { steps, filled, added: false, note: 'no submit control' };
    submit.click(); steps.push('submitted: ' + label(submit).slice(0, 24)); await wait(700);
    return { steps, filled, added: document.body.innerText.includes('Zebra Calathea') };
  });
  if (r.functional.added) { await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(500); r.functional.persists = await p.evaluate(() => document.body.innerText.includes('Zebra Calathea')); }
  r.consoleErrors = errs;
  await ctx.close();
  // Mobile: overflow + screenshot
  const m = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mp = await m.newPage(); await mp.goto(srv.url, { waitUntil: 'networkidle' }); await mp.waitForTimeout(600);
  r.mobileOverflowPx = await mp.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
  await mp.screenshot({ path: path.join(shotsDir, `${run}-mobile.png`), fullPage: true });
  await m.close(); srv.close();
}
await browser.close();
writeFileSync(path.join(here, 'eval.json'), JSON.stringify(results, null, 1));
console.log(JSON.stringify(results, null, 1));
