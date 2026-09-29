#!/usr/bin/env node
// shoot: screenshot YOUR build at breakpoints + runtime design/a11y audit, one sheet to review.
//
//   node shoot.mjs <url|file.html> [--out .design/shots] [--widths 390,768,1440] [--dark] [--label v2]
//                  [--click "text"]   (click an element first, e.g. to open a drawer, then shoot)
//
// Writes <out>/<label>/sheet.jpg (look at this), <w>.jpg per width, report.md (printed too).
import { mkdirSync, writeFileSync, existsSync, readFileSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { launch, newPage, shotCapped } from './lib/pw.mjs';
import { contactSheet } from './lib/sheet.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i < 0 ? d : argv[i + 1]; };
const target = argv.find((a, i) => !a.startsWith('--') && !/^--(out|widths|label|click)$/.test(argv[i - 1] || ''));
if (!target) { console.error('usage: shoot.mjs <url|file> [--widths 390,768,1440] [--label name] [--dark] [--click text]'); process.exit(1); }
// Local files are served over http (file:// breaks fonts, CORS, modules), like production.
let url = target, server;
if (!/^https?:/.test(target)) {
  const file = path.resolve(target.replace(/^file:\/\//, '')), root = statSync(file).isDirectory() ? file : path.dirname(file);
  const types = { html: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2', woff: 'font/woff', ico: 'image/x-icon' };
  server = http.createServer((req, res) => {
    let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (existsSync(p) && statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[p.split('.').pop()] || 'application/octet-stream' }); res.end(readFileSync(p));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  url = `http://127.0.0.1:${server.address().port}/${statSync(file).isDirectory() ? '' : path.basename(file)}`;
}
const widths = String(opt('--widths', '390,768,1440')).split(',').map(Number);
const label = opt('--label', new Date().toISOString().slice(11, 19).replace(/:/g, ''));
const dir = path.join(opt('--out', '.design/shots'), label);
const CLICK = opt('--click', null);
mkdirSync(dir, { recursive: true });

function audit() {
  const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lum = ([r, g, b]) => { const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const bgOf = (el) => {
    const stack = [];
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.backgroundImage !== 'none' && !cs.backgroundImage.includes('gradient(') ) return null; // image bg: unknown
      const c = rgba(cs.backgroundColor); if (c[3] > 0) { stack.push(c); if (c[3] >= 0.99) break; }
    }
    let out = [255, 255, 255];
    for (const c of stack.reverse()) out = out.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
    return out;
  };
  const issues = { contrast: [], tap: [], alt: 0, unlabeled: [] };
  const sizes = {}, radii = {}, families = {}, colors = {};
  const els = [...document.querySelectorAll('body *')];
  for (const el of els) {
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0 || cs.display === 'none') continue;
    if (cs.borderTopLeftRadius !== '0px') radii[cs.borderTopLeftRadius] = (radii[cs.borderTopLeftRadius] || 0) + 1;
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (own) {
      const fs = parseFloat(cs.fontSize); sizes[Math.round(fs)] = (sizes[Math.round(fs)] || 0) + 1;
      families[cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()] = 1;
      const fg = rgba(cs.color), bg = bgOf(el);
      if (bg && fg[3] > 0.05) {
        const f = fg.slice(0, 3).map((v, i) => v * fg[3] + bg[i] * (1 - fg[3]));
        const [a, b] = [lum(f), lum(bg)].sort((x, y) => y - x); const ratio = (a + 0.05) / (b + 0.05);
        const large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
        const need = el.closest('[disabled],[aria-disabled=true]') ? 0 : large ? 3 : 4.5;
        if (ratio < need && issues.contrast.length < 12) issues.contrast.push(`${ratio.toFixed(2)}:1 need ${need} — "${el.textContent.trim().slice(0, 40)}" ${fs}px`);
      }
    }
    if (el.matches('a[href],button,input:not([type=hidden]),select,textarea,[role=button],[tabindex]:not([tabindex="-1"])')) {
      if ((r.width < 24 || r.height < 24) && !el.closest('p,li,td') && issues.tap.length < 10) issues.tap.push(`${Math.round(r.width)}×${Math.round(r.height)} "${(el.innerText || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 30)}"`);
      const name = (el.innerText || el.getAttribute('aria-label') || el.getAttribute('title') || el.getAttribute('placeholder') || (el.id && document.querySelector(`label[for="${el.id}"]`)?.innerText) || el.closest('label')?.innerText || el.value || '').trim();
      if (!name && issues.unlabeled.length < 8) issues.unlabeled.push(el.outerHTML.slice(0, 70));
    }
    if (el.tagName === 'IMG' && !el.hasAttribute('alt')) issues.alt++;
  }
  const fonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, ''));
  const generic = /^(serif|sans-serif|monospace|system-ui|-apple-system|ui-\w+|cursive|inherit|initial|BlinkMacSystemFont|Segoe UI|Arial|Helvetica|Times New Roman|Courier New|Georgia)$/i;
  const missing = Object.keys(families).filter(f => !generic.test(f) && !fonts.includes(f));
  return {
    overflow: document.documentElement.scrollWidth > innerWidth + 1 ? document.documentElement.scrollWidth : 0,
    issues, missingFonts: missing, families: Object.keys(families),
    scale: Object.keys(sizes).map(Number).sort((a, b) => a - b), radii: Object.entries(radii).sort((a, b) => b[1] - a[1]),
    h: document.documentElement.scrollHeight,
  };
}

const browser = await launch();
const errors = [], lines = [], sheet = [];
let first;
for (const w of widths) {
  const page = await newPage(browser, w, w < 600 ? 844 : 900, argv.includes('--dark') ? { colorScheme: 'dark' } : {});
  page.on('console', m => m.type() === 'error' && errors.length < 8 && errors.push(m.text().slice(0, 160)));
  page.on('pageerror', e => errors.length < 8 && errors.push(e.message.slice(0, 160)));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 }).catch(e => errors.push(e.message.split('\n')[0]));
  await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(400);
  if (CLICK) { await page.getByText(CLICK, { exact: false }).first().click({ timeout: 3000 }).catch(() => errors.push(`--click "${CLICK}" not found`)); await page.waitForTimeout(500); }
  const a = await page.evaluate(audit);
  const p = path.join(dir, `${w}.jpg`);
  await shotCapped(page, p, w < 600 ? 5000 : 4000, 75);
  sheet.push({ path: p, label: `${w}px${a.overflow ? ` — OVERFLOW ${a.overflow}px` : ''}` });
  lines.push(`## ${w}px`, a.overflow ? `- HORIZONTAL OVERFLOW: content ${a.overflow}px wide` : null,
    a.issues.contrast.length ? `- Contrast fails (${a.issues.contrast.length}): ${a.issues.contrast.slice(0, 6).join(' | ')}` : null,
    a.issues.tap.length ? `- Small targets <24px: ${a.issues.tap.slice(0, 6).join(', ')}` : null,
    a.issues.unlabeled.length ? `- Controls without accessible name: ${a.issues.unlabeled.join(' | ')}` : null,
    a.issues.alt ? `- ${a.issues.alt} <img> without alt` : null);
  if (!first) {
    first = a;
    // Keyboard focus visibility on the first few focusable elements.
    const focus = await page.evaluate(async () => {
      const els = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(e => e.getBoundingClientRect().width).slice(0, 6);
      const bad = [];
      for (const e of els) {
        const s = (x) => { const c = getComputedStyle(x); return c.outlineStyle + c.outlineWidth + c.boxShadow + c.backgroundColor + c.borderColor + c.textDecorationLine; };
        const before = s(e); e.focus({ focusVisible: true }); await new Promise(r => setTimeout(r, 60));
        if (document.activeElement === e && s(e) === before) bad.push((e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 25));
        e.blur();
      }
      return bad;
    });
    // Reduced motion: count running infinite animations with reduce emulated.
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.reload({ waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(500);
    const rm = await page.evaluate(() => document.getAnimations().filter(a => { const t = a.effect?.getTiming?.(); return t && (t.iterations === Infinity || t.duration > 400); }).length);
    first.focus = focus; first.rm = rm;
  }
  await page.context().close();
}
await contactSheet(browser, sheet, path.join(dir, 'sheet.jpg'), { cols: sheet.length, width: 2000, title: `${target} — ${label}`, maxImgH: 2600 });
await browser.close();
server?.close();

const rad = first.radii.slice(0, 6).map(([k, v]) => `${k}×${v}`).join(' ');
const report = [`# shoot ${label} — ${target}`, `Sheet: ${path.join(dir, 'sheet.jpg')}`, '',
  `Fonts in use: ${first.families.join(', ')}${first.missingFonts.length ? ` · NOT LOADED (fallback showing): ${first.missingFonts.join(', ')}` : ''}`,
  `Type sizes (${first.scale.length}): ${first.scale.join(' ')}${first.scale.length > 9 ? ' — too many steps, tighten the scale' : ''}`,
  `Radii: ${rad || 'none'}${first.radii.length > 5 ? ' — too many radii' : ''}`,
  first.focus.length ? `- No visible focus style: ${first.focus.join(', ')}` : '- Focus styles: visible on sampled controls',
  first.rm ? `- ${first.rm} long/infinite animations still run under prefers-reduced-motion` : '- Reduced motion: respected',
  errors.length ? `- Console errors: ${[...new Set(errors)].join(' | ')}` : '- Console: clean',
  '', ...lines.filter(Boolean)].join('\n');
writeFileSync(path.join(dir, 'report.md'), report);
console.log(report);
