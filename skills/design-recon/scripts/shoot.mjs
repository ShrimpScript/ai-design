#!/usr/bin/env node
// shoot: screenshot YOUR build at breakpoints + runtime design/a11y audit, one sheet to review.
//
//   node shoot.mjs <url|file.html> [--out .design/shots] [--widths 390,768,1440] [--dark] [--label v2]
//                  [--click "text"]   (click an element first, e.g. to open a drawer, then shoot)
//
// Writes <out>/<label>/sheet.jpg (look at this), <w>.jpg per width, report.md (printed too).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch, newPage, shotCapped } from './lib/pw.mjs';
import { contactSheet } from './lib/sheet.mjs';
import { serve } from './lib/serve.mjs';
import { fontTier, isRound } from './lib/fonts.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i < 0 ? d : argv[i + 1]; };
const target = argv.find((a, i) => !a.startsWith('--') && !/^--(out|widths|label|click|frames)$/.test(argv[i - 1] || ''));
if (!target) { console.error('usage: shoot.mjs <url|file> [--widths 390,768,1440] [--label name] [--dark] [--click text]'); process.exit(1); }
const served = await serve(target);
const url = served.url;
const widths = String(opt('--widths', '390,768,1440')).split(',').map(Number);
const label = opt('--label', new Date().toISOString().slice(11, 19).replace(/:/g, ''));
const dir = path.join(opt('--out', '.design/shots'), label);
const CLICK = opt('--click', null);
// --frames 0.2,0.4,0.6 → extra viewport shots at those fractions of page height (widest width), for scroll-linked effects.
const FRAMES = opt('--frames', null) ? String(opt('--frames')).split(',').map(Number) : [];
mkdirSync(dir, { recursive: true });

function audit() {
  const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  const rgba = (c) => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); const d = cv.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
  const lum = ([r, g, b]) => { const f = v => (v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  // Background actually painted under the text: walk the hit-test stack at the element's centre
  // (catches sibling overlays like toggle thumbs), falling back to ancestors.
  const bgOf = (el) => {
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const inView = x >= 0 && y >= 0 && x < innerWidth && y < innerHeight;
    const stack = inView ? document.elementsFromPoint(x, y) : [];
    const chain = stack.length && stack.includes(el) ? stack.slice(stack.indexOf(el)) : (() => { const a = []; for (let e = el; e; e = e.parentElement) a.push(e); return a; })();
    const layers = [];
    for (const e of chain) {
      const cs = getComputedStyle(e);
      if (e !== el && e.contains(el) === false && !inView) continue;
      if (cs.backgroundImage !== 'none' && !cs.backgroundImage.includes('gradient(')) return null; // image: unknown
      if (/^(IMG|VIDEO|CANVAS|svg)$/i.test(e.tagName) && e !== el) return null;
      const c = rgba(cs.backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] >= 0.99) break; }
    }
    let out = [255, 255, 255];
    for (const c of layers.reverse()) out = out.map((v, i) => v * (1 - c[3]) + c[i] * c[3]);
    return out;
  };
  const issues = { contrast: [], tap: [], alt: 0, unlabeled: [] };
  const sizes = {}, radii = {}, families = {}, colors = {}; const squish = [];
  const els = [...document.querySelectorAll('body *')];
  for (const el of els) {
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0 || cs.display === 'none') continue;
    if (cs.borderTopLeftRadius !== '0px') radii[cs.borderTopLeftRadius] = (radii[cs.borderTopLeftRadius] || 0) + 1;
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    if (own) {
      const fs = parseFloat(cs.fontSize); sizes[Math.round(fs)] = (sizes[Math.round(fs)] || 0) + 1;
      families[cs.fontFamily.split(',')[0].replace(/["']/g, '').trim()] = 1;
      const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing) / fs, wd = +(cs.fontVariationSettings.match(/"wdth"\s*([\d.]+)/) || [])[1] || parseFloat(cs.fontStretch) || 100;
      if (squish.length < 8 && (+cs.fontWeight < 300 || ls < -0.03 || wd < 95)) squish.push(`"${el.textContent.trim().slice(0, 24)}" ${Math.round(fs)}px w${cs.fontWeight}${ls < -0.03 ? ' ls ' + ls.toFixed(3) + 'em' : ''}${wd < 95 ? ' wdth ' + wd : ''}`);
      const fg = rgba(cs.color);
      let bg = bgOf(el);
      const ratioOf = (b) => { const f = fg.slice(0, 3).map((v, i) => v * fg[3] + b[i] * (1 - fg[3])); const [p, q] = [lum(f), lum(b)].sort((x, y) => y - x); return (p + 0.05) / (q + 0.05); };
      if (bg && fg[3] > 0.05 && ratioOf(bg) < 4.5) { el.scrollIntoView({ block: 'center' }); bg = bgOf(el); } // re-measure what is really painted
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
  scrollTo(0, 0);
  return {
    overflow: document.documentElement.scrollWidth > innerWidth + 1 ? document.documentElement.scrollWidth : 0,
    issues, squish, missingFonts: missing, families: Object.keys(families),
    scale: Object.keys(sizes).map(Number).sort((a, b) => a - b), radii: Object.entries(radii).sort((a, b) => b[1] - a[1]),
    h: document.documentElement.scrollHeight,
  };
}

// Craft probe (first viewport only): is there type used as image and a drawn subject, or just UI chrome?
function craft() {
  const vh = innerHeight, vw = innerWidth, inView = (r) => r.bottom > 0 && r.top < vh && r.width > 0 && r.height > 0;
  const len = {}, fam = {}; let max = 0, maxFam = '';
  for (const el of document.querySelectorAll('body *')) {
    const t = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join('');
    if (!t) continue; const r = el.getBoundingClientRect(); if (!inView(r)) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    const fs = parseFloat(cs.fontSize), f = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    len[fs] = (len[fs] || 0) + t.length; fam[f] = (fam[f] || 0) + t.length;
    if (fs > max) { max = fs; maxFam = f; }
  }
  const body = +Object.entries(len).sort((a, b) => b[1] - a[1])[0]?.[0] || 16;
  let area = 0, items = 0;
  for (const el of document.querySelectorAll('svg, canvas, img, video, picture, [data-visual]')) {
    if (el.parentElement?.closest('svg')) continue;
    const r = el.getBoundingClientRect(); if (!inView(r)) continue;
    const m = Math.min(r.width, r.height);
    if (m >= 28 && !el.closest('button,a,label')) items++;
    if (m >= 64) area += Math.min(r.width, vw) * Math.min(r.height, vh);
  }
  // The task is the per-item action repeated down the list ("Water", "Approve", "Open"); fall back to the first control in main.
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width && r.height && !e.closest('header,nav,dialog,[aria-hidden=true]') && getComputedStyle(e).visibility !== 'hidden'; };
  const btns = [...document.querySelectorAll('button, [role=button]')].filter(vis), by = {};
  for (const b of btns) { const k = (b.innerText || b.getAttribute('aria-label') || '').trim().toLowerCase().split(/\s+/)[0]; if (k) (by[k] ||= []).push(b); }
  const rep = Object.values(by).filter(a => a.length >= 3).sort((a, b) => b.length - a.length)[0];
  const act = rep ? rep[0] : [...document.querySelectorAll('main button, main [role=button], main a[href], main input')].find(vis);
  const actTop = act ? Math.round(act.getBoundingClientRect().top + scrollY) : null;
  return { actTop, families: Object.keys(fam), ratio: +(max / body).toFixed(1), body, max, maxFam, visual: Math.round(100 * area / (vw * vh)), items };
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
  const c = await page.evaluate(craft);
  const a = await page.evaluate(audit);
  const p = path.join(dir, `${w}.jpg`);
  await shotCapped(page, p, w < 600 ? 5000 : 4000, 75);
  sheet.push({ path: p, label: `${w}px${a.overflow ? ` — OVERFLOW ${a.overflow}px` : ''}` });
  lines.push(`## ${w}px`, a.overflow ? `- HORIZONTAL OVERFLOW: content ${a.overflow}px wide` : null,
    a.issues.contrast.length ? `- Contrast fails (${a.issues.contrast.length}): ${a.issues.contrast.slice(0, 6).join(' | ')}` : null,
    a.issues.tap.length ? `- Small targets <24px: ${a.issues.tap.slice(0, 6).join(', ')}` : null,
    a.issues.unlabeled.length ? `- Controls without accessible name: ${a.issues.unlabeled.join(' | ')}` : null,
    a.issues.alt ? `- ${a.issues.alt} <img> without alt` : null);
  if (!first) lines.push(`- Craft (first screen): ${c.families.length} famil${c.families.length === 1 ? 'y' : 'ies'} (${c.families.join(', ')}), largest ${Math.round(c.max)}px ${c.maxFam} = ${c.ratio}× body ${c.body}px, drawn visuals ${c.visual}% of screen, ${c.items} object graphics`,
    c.ratio < 2.4 ? `- FLAT TYPE: largest text is only ${c.ratio}× body. Set one line as image (≥ 3× body, display face) — references/craft.md` : null,
    c.families.length < 2 && c.ratio < 3.5 ? `- ONE VOICE: a single family with no display contrast. Pair a display face or use the family's extreme range — references/craft.md` : null,
    null);
  lines.push(w < 600 && c.actTop != null && c.actTop > (w < 600 ? 844 : 900) ? `- TASK BELOW FOLD: first action is at ${c.actTop}px on a ${w}px screen. Compact the hero visual on phones — references/craft.md § Guardrails` : null);
  if (!first) lines.push(c.visual < 8 && c.items < 3 ? `- NO SIGNATURE VISUAL: nothing drawn on the first screen (illustration, 3D, generative, item graphics) — references/craft.md` : null);
  if (!first) {
    first = a;
    // Keyboard focus visibility on the first few focusable elements (switch to keyboard modality first).
    await page.keyboard.press('Shift').catch(() => {});
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
  if (FRAMES.length && w === Math.max(...widths)) {
    await page.emulateMedia({ reducedMotion: 'no-preference' }); await page.reload({ waitUntil: 'networkidle' }).catch(() => {}); await page.waitForTimeout(400);
    const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (const f of FRAMES) {
      await page.evaluate(y => scrollTo(0, y), Math.round(H * f)); await page.waitForTimeout(700);
      const fp = path.join(dir, `frame-${Math.round(f * 100)}.jpg`);
      await page.screenshot({ path: fp, type: 'jpeg', quality: 70 });
      sheet.push({ path: fp, label: `${w}px scrolled ${Math.round(f * 100)}%` });
    }
  }
  await page.context().close();
}
await contactSheet(browser, sheet, path.join(dir, 'sheet.jpg'), { cols: Math.min(sheet.length, 4), width: 2000, title: `${target} — ${label}`, maxImgH: 2600 });
await browser.close();
served.close();

const rad = first.radii.slice(0, 6).map(([k, v]) => `${k}×${v}`).join(' ');
const report = [`# shoot ${label} — ${target}`, `Sheet: ${path.join(dir, 'sheet.jpg')}`, '',
  `Fonts in use: ${first.families.map(f => fontTier(f) ? `${f} [${fontTier(f).toUpperCase()}]` : isRound(f) ? `${f} [round ✓]` : f).join(', ')}${first.missingFonts.length ? ` · NOT LOADED (fallback showing): ${first.missingFonts.join(', ')}` : ''}`,
  `Type sizes (${first.scale.length}): ${first.scale.join(' ')}${first.scale.length > 9 ? ' — too many steps, tighten the scale' : ''}`,
  first.squish.length ? `- Thin or squished type: ${first.squish.join(' | ')}` : '- Type weight/width/tracking: ok',
  `Radii: ${rad || 'none'}${first.radii.length > 5 ? ' — too many radii' : ''}`,
  first.focus.length ? `- No visible focus style: ${first.focus.join(', ')}` : '- Focus styles: visible on sampled controls',
  first.rm ? `- ${first.rm} long/infinite animations still run under prefers-reduced-motion` : '- Reduced motion: respected',
  errors.length ? `- Console errors: ${[...new Set(errors)].join(' | ')}` : '- Console: clean',
  '', ...lines.filter(Boolean)].join('\n');
writeFileSync(path.join(dir, 'report.md'), report);
console.log(report);
