#!/usr/bin/env node
// motion: measure HOW a site moves — scroll reveals, scroll-linked/parallax, pinning, GSAP/ScrollTrigger,
// page-to-page transitions and in-page state changes. Numbers you can copy, plus one frame sheet.
//
//   node motion.mjs <url...> [--out .design/recon] [--no-nav] [--no-states] [--ignore-robots]
//
// Writes <out>/<host>/motion.md (~500 tokens, read this) and motion-sheet.jpg (look at this).
import './lib/net.mjs';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { launch, newPage, gotoSafe } from './lib/pw.mjs';
import { contactSheet } from './lib/sheet.mjs';
import { robotsAllows } from './lib/robots.mjs';

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(n); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const urls = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--out');
if (!urls.length) { console.error('usage: motion.mjs <url...> [--out dir] [--no-nav] [--no-states]'); process.exit(1); }
const OUT = flag('--out', '.design/recon');
const NAV = !flag('--no-nav', false), STATES = !flag('--no-states', false), ROBOTS = !flag('--ignore-robots', false);
const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40).toLowerCase();

// ---------------------------------------------------------------- in-page helpers (serialised into the page)
function tagCandidates() {
  // Spread candidates down the page: up to 5 per 400px band, headings/media first.
  const H = innerHeight, bands = {}, rank = (e) => /^(H1|H2|H3|IMG|PICTURE|VIDEO|FIGURE|CANVAS|SVG)$/i.test(e.tagName) ? 0 : /^(SECTION|ARTICLE|LI|P)$/.test(e.tagName) ? 1 : 2;
  let scanned = 0;
  for (const e of document.querySelectorAll('body *')) {
    if (++scanned > 12000) break;
    if (!/^(SECTION|H1|H2|H3|P|IMG|PICTURE|VIDEO|FIGURE|UL|LI|ARTICLE|svg|CANVAS|DIV|A|BUTTON)$/i.test(e.tagName) || e.closest('nav,header,footer')) continue;
    if (e.tagName === 'DIV' && e.children.length > 12) continue;
    const r = e.getBoundingClientRect();
    if (r.top < H * 1.1 || r.width < 40 || r.height < 16 || (e.parentElement?.closest('svg'))) continue;
    (bands[Math.floor((r.top + scrollY) / 400)] ||= []).push(e);
  }
  let n = 0;
  for (const list of Object.values(bands)) for (const e of list.sort((a, b) => rank(a) - rank(b)).slice(0, 5)) { if (n >= 220) break; e.dataset.mr = n++; }
  return n;
}
function snap() {
  const s = {};
  for (const e of document.querySelectorAll('[data-mr]')) {
    const c = getComputedStyle(e), r = e.getBoundingClientRect();
    s[e.dataset.mr] = { o: +(+c.opacity).toFixed(2), t: c.transform, f: c.filter, cp: c.clipPath, tr: c.translate, sc: c.scale, top: Math.round(r.top), inView: r.top < innerHeight && r.bottom > 0, pos: c.position,
      anim: e.getAnimations().map(a => { const t = a.effect?.getTiming?.() || {}; const ez = /^linear\(/.test(t.easing || '') && t.easing.length > 40 ? 'spring' : t.easing; return `${a.animationName || a.transitionProperty || 'waapi'} ${Math.round(t.duration) || t.duration}ms ${ez} d${Math.round(t.delay || 0)}`; }).slice(0, 3),
      td: c.transitionDuration !== '0s' ? `${c.transitionProperty.split(',')[0]} ${c.transitionDuration.split(',')[0]} ${c.transitionTimingFunction.match(/^[^,(]+(\([^)]*\))?/)[0]} d${c.transitionDelay.split(',')[0]}` : '',
      tag: e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className ? '.' + e.className.trim().split(/\s+/)[0].slice(0, 24) : ''), w: Math.round(r.width), h: Math.round(r.height) };
  }
  return s;
}
function libs() {
  const g = window.gsap, ST = window.ScrollTrigger;
  const out = { lenis: !!(window.lenis || window.Lenis || document.documentElement.classList.contains('lenis')), locomotive: !!document.querySelector('[data-scroll-container]'), scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior, cssTimelines: [], viewTransitionRule: false, vtNames: 0, gsap: null };
  const walk = (rules) => { for (const r of rules) { if (r.constructor.name === 'CSSViewTransitionRule' || /^@view-transition/.test(r.cssText)) out.viewTransitionRule = true; if (r.cssRules) walk(r.cssRules); else if (r.style) { const tl = r.style.getPropertyValue('animation-timeline'); if (tl && out.cssTimelines.length < 6) out.cssTimelines.push(`${r.selectorText.slice(0, 40)} → ${tl} ${r.style.getPropertyValue('animation-range') || ''}`.trim()); if (r.style.getPropertyValue('view-transition-name')) out.vtNames++; } } };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch {} }
  if (g) {
    const tweens = g.globalTimeline.getChildren(true, true, false).slice(0, 300);
    const ease = {}, dur = {}, props = {};
    for (const t of tweens) { const e = typeof t.vars.ease === 'function' ? 'custom fn' : String(t.vars.ease || 'power1.out'); ease[e] = (ease[e] || 0) + 1; const d = t.duration(); dur[d] = (dur[d] || 0) + 1; for (const k of Object.keys(t.vars)) if (!/^(ease|duration|delay|stagger|scrollTrigger|on\w+|overwrite|immediateRender|id|paused|repeat|yoyo|callbackScope|lazy|parent|runBackwards|startAt|data|inherit|keyframes|repeatDelay|reversed|smoothChildTiming|autoRemoveChildren|defaults)$/.test(k)) props[k] = (props[k] || 0) + 1; }
    const top = (m) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, v]) => `${k}×${v}`).join(', ');
    const trig = ST ? ST.getAll() : [];
    out.gsap = { version: g.version, tweens: tweens.length, ease: top(ease), dur: top(dur), props: top(props), triggers: trig.length, pinned: trig.filter(t => t.pin).length, scrub: trig.filter(t => t.vars.scrub).length, examples: [...new Set(trig.map(t => `${t.vars.trigger?.className?.split?.(' ')[0] || t.trigger?.tagName?.toLowerCase() || '?'} start "${t.vars.start || 'top bottom'}" end "${t.vars.end || 'bottom top'}"${t.vars.scrub ? ' scrub ' + t.vars.scrub : ''}${t.pin ? ' pin' : ''}`))].slice(0, 4) };
  }
  return out;
}

// ---------------------------------------------------------------- analysis
const diffState = (a, b) => {
  const ch = [];
  if (Math.abs(a.o - b.o) > 0.05) ch.push(`opacity ${a.o}→${b.o}`);
  const tr = (m) => { if (!m || m === 'none') return [0, 0, 1]; const v = m.match(/matrix(3d)?\(([^)]+)\)/); if (!v) return [0, 0, 1]; const n = v[2].split(',').map(Number); return v[1] ? [n[12], n[13], Math.hypot(n[0], n[1])] : [n[4], n[5], Math.hypot(n[0], n[1])]; };
  const [ax, ay, as] = tr(a.t), [bx, by, bs] = tr(b.t);
  if (Math.abs(ay - by) > 2) ch.push(`y ${Math.round(ay)}→${Math.round(by)}px`);
  if (Math.abs(ax - bx) > 2) ch.push(`x ${Math.round(ax)}→${Math.round(bx)}px`);
  if (Math.abs(as - bs) > 0.02) ch.push(`scale ${as.toFixed(2)}→${bs.toFixed(2)}`);
  if (a.tr !== b.tr && a.tr !== 'none') ch.push(`translate ${a.tr}→${b.tr}`);
  if (a.f !== b.f) ch.push(`filter ${a.f}→${b.f}`);
  if (a.cp !== b.cp) ch.push(`clip-path ${a.cp.slice(0, 30)}→${b.cp.slice(0, 30)}`);
  return ch;
};

async function scrollPass(page, dir, frames) {
  await page.evaluate(() => scrollTo(0, 0));
  const n = await page.evaluate(tagCandidates);
  const initial = await page.evaluate(snap);
  const docH = await page.evaluate(() => document.documentElement.scrollHeight);
  const H = page.viewportSize().height, steps = [];
  const timing = {};
  const maxY = Math.min(docH - H, 14000);
  let i = 0;
  const stepPx = Math.max(H * 0.5, maxY / 16);
  for (let y = stepPx; y <= maxY + 1; y += stepPx) {
    await page.evaluate(y => scrollTo(0, y), y); await page.waitForTimeout(90);
    const a = await page.evaluate(snap);
    for (const [id, s] of Object.entries(a)) if (s.inView && !timing[id] && (s.anim.length || s.td)) timing[id] = s.anim[0] || s.td;
    await page.waitForTimeout(380);
    const b = await page.evaluate(snap);
    steps.push({ y, a, b });
    if (i++ % 2 === 1 && frames.length < 10) { const p = path.join(dir, `m-scroll-${Math.round(y)}.jpg`); await page.screenshot({ path: p, type: 'jpeg', quality: 55 }); frames.push({ path: p, label: `scroll ${Math.round(y)}px` }); }
  }
  const final = steps.length ? steps.at(-1).b : initial;
  // Reveals: changed between "never seen" and "seen", and stable afterwards.
  const reveals = {}, revealEls = [];
  for (const id of Object.keys(initial)) {
    const seen = steps.find(s => s.b[id]?.inView);
    if (!seen) continue;
    const ch = diffState(initial[id], seen.b[id]);
    if (ch.length) { const k = ch.join(', '); reveals[k] = (reveals[k] || 0) + 1; revealEls.push({ id, k, timing: timing[id] || '', tag: initial[id].tag }); }
  }
  // Scroll-linked: stable in time (a≈b at same scroll) but changes between scroll positions while in view.
  const linked = [];
  for (const id of Object.keys(initial)) {
    let hits = 0, range = [];
    for (let k = 1; k < steps.length; k++) {
      const p = steps[k - 1].b[id], c = steps[k].a[id], c2 = steps[k].b[id];
      if (!p?.inView || !c?.inView) continue;
      if (diffState(c, c2).length === 0 && diffState(p, c).length) { hits++; range.push(diffState(p, c).join(' ')); }
    }
    if (hits >= 2) linked.push({ tag: initial[id].tag, w: initial[id].w, h: initial[id].h, hits, eg: range[0] });
  }
  // Pinned: same viewport top across ≥3 steps while the page moved, not the header.
  const pinned = [];
  for (const id of Object.keys(initial)) {
    let run = 0, best = 0;
    for (let k = 1; k < steps.length; k++) { const p = steps[k - 1].b[id], c = steps[k].b[id]; if (p?.inView && c?.inView && Math.abs(p.top - c.top) < 3 && c.top > 80 && c.h > 200) run++; else { best = Math.max(best, run); run = 0; } }
    best = Math.max(best, run);
    if (best >= 2) pinned.push({ tag: initial[id].tag, h: initial[id].h, px: Math.round(best * stepPx) });
  }
  const timingCount = {}; for (const r of revealEls) if (r.timing) timingCount[r.timing.replace(/ d\d+(ms|s)?$/, '')] = (timingCount[r.timing.replace(/ d\d+(ms|s)?$/, '')] || 0) + 1;
  const delays = revealEls.map(r => +((r.timing.match(/ d([\d.]+)/) || [])[1] || 0)).filter(Boolean);
  return { stepPx, n, reveals, revealCount: revealEls.length, timingCount, delays: [...new Set(delays)].sort((a, b) => a - b).slice(0, 6), linked: linked.slice(0, 5), pinned: pinned.filter((p, i, a) => a.findIndex(q => q.px === p.px) === i).slice(0, 4), final };
}

async function navPass(page, url, dir, frames) {
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(300);
  const link = await page.evaluate(() => {
    const as = [...document.querySelectorAll('header a[href], nav a[href]')].filter(a => a.href.startsWith(location.origin) && a.getBoundingClientRect().width && !/#/.test(a.getAttribute('href')) && a.pathname !== location.pathname);
    const pick = as.find(a => /pricing|product|features|about|customers/i.test(a.innerText)) || as[0];
    if (!pick) return null; pick.dataset.mnav = '1'; return (pick.innerText || '').trim().slice(0, 30) || pick.pathname;
  });
  if (!link) return { note: 'no internal nav link found' };
  await page.evaluate(() => {
    window.__mrMarker = 1; window.__vtCalls = 0;
    if (document.startViewTransition) { const o = document.startViewTransition.bind(document); document.startViewTransition = (...a) => { window.__vtCalls++; return o(...a); }; }
  });
  await page.keyboard.press('Escape').catch(() => {});
  const t0 = Date.now(), shots = [];
  await page.evaluate(() => document.querySelector('[data-mnav]').click()).catch(() => {});
  for (let k = 0; k < 6; k++) {
    const p = path.join(dir, `m-nav-${k}.jpg`);
    try { await page.screenshot({ path: p, type: 'jpeg', quality: 50, timeout: 2000, animations: 'allow' }); shots.push({ path: p, label: `nav +${Date.now() - t0}ms` }); } catch {}
    await page.waitForTimeout(k < 3 ? 60 : 180);
  }
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(400);
  const after = await page.evaluate(() => ({ spa: window.__mrMarker === 1, vtCalls: window.__vtCalls || 0, path: location.pathname, vtAnims: document.getAnimations().filter(a => a.effect?.pseudoElement?.startsWith('::view-transition')).length })).catch(() => ({}));
  frames.push(...shots.filter((_, i) => i % 2 === 0 || i === shots.length - 1).slice(0, 4));
  return { link, ...after };
}

async function statePass(page, url, dir, frames) {
  const tf = Date.now();
  const found = await page.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 10 && r.height > 10; };
    const pick = [];
    const tab = [...document.querySelectorAll('[role=tab]:not([aria-selected=true])')].find(vis); if (tab) pick.push(['Tab', tab]);
    const bill = [...document.querySelectorAll('button,[role=switch],[role=radio],label,input[type=checkbox]')].find(e => vis(e) && /annual|yearly|monthly|billed/i.test(e.innerText || e.getAttribute('aria-label') || e.closest('label')?.innerText || '')); if (bill) pick.push(['Billing toggle', bill]);
    const acc = [...document.querySelectorAll('summary, button[aria-expanded=false]')].find(e => vis(e) && !e.closest('nav,header')); if (acc) pick.push(['Accordion', acc]);
    return pick.map(([k, e], i) => { e.dataset.mstate = i; return [k, (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30)]; });
  });
  if (process.env.MOTION_DEBUG) console.log(`    find ${Date.now() - tf}ms`);
  const out = [];
  for (const [i, [kind, label]] of found.entries()) {
    const tsx = Date.now();
    const el = page.locator(`[data-mstate="${i}"]`).first();
    try {
      await el.evaluate(e => e.scrollIntoView({ block: 'center' })); await page.waitForTimeout(300);
      const region = await el.evaluate(e => { let s = e; while (s.parentElement && s.parentElement !== document.body && s.parentElement.getBoundingClientRect().height < innerHeight * 1.2) s = s.parentElement; s.dataset.mregion = '1'; const nums = (s.textContent.match(/[$€£]\s?\d[\d,.]*/g) || []).slice(0, 3); return { nums }; });
      await page.evaluate(() => document.getAnimations().forEach(a => { a.__pre = 1; }));
      const ts = Date.now(); if (process.env.MOTION_DEBUG) console.log(`    prep ${ts - tsx}ms`);
      await el.click({ timeout: 800, force: true }).catch(() => el.evaluate(e => e.click()));
      await page.waitForTimeout(40);
      const anims = await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running' && !a.__pre && !/scrollbar/.test(a.transitionProperty || '')).slice(0, 30).map(a => { const t = a.effect?.getTiming?.() || {}; const ez = /^linear\(/.test(t.easing || '') && t.easing.length > 40 ? 'spring (linear())' : t.easing || ''; return `${a.transitionProperty || a.animationName || 'waapi'} ${Math.round(t.duration) || 0}ms ${ez}`.trim(); }));
      await page.waitForTimeout(650);
      const nums = await page.evaluate(() => (document.querySelector('[data-mregion]')?.textContent.match(/[$€£]\s?\d[\d,.]*/g) || []).slice(0, 3));
      const p = path.join(dir, `m-state-${i}.jpg`);
      const box = await page.evaluate(() => { const r = document.querySelector('[data-mregion]')?.getBoundingClientRect(); if (!r) return null; const y = Math.max(0, r.top), h = Math.min(innerHeight, r.bottom) - y; return h > 20 ? { x: Math.max(0, r.left), y, width: Math.min(innerWidth, r.right) - Math.max(0, r.left), height: h } : null; });
      await page.screenshot({ path: p, type: 'jpeg', quality: 60, clip: box || undefined, timeout: 3000 }).catch(() => {});
      await page.evaluate(() => document.querySelector('[data-mregion]')?.removeAttribute('data-mregion'));
      if (process.env.MOTION_DEBUG) console.log(`    state ${kind} ${Date.now() - ts}ms`);
      if (existsSync(p)) frames.push({ path: p, label: `${kind}: ${label}` });
      const cnt = {}; for (const a of anims) cnt[a] = (cnt[a] || 0) + 1;
      out.push(`${kind} "${label}": ${anims.length ? Object.entries(cnt).slice(0, 4).map(([k, v]) => `${k}${v > 1 ? ' ×' + v : ''}`).join(', ') : 'no CSS/WAAPI animation (instant or JS-driven)'}${region.nums.join() !== nums.join() && nums.length ? ` · values ${region.nums.join(' ')} → ${nums.join(' ')}` : ''}`);
    } catch (e) { out.push(`${kind} "${label}": could not interact (${e.message.split('\n')[0].slice(0, 60)})`); }
  }
  return out.length ? out : ['no tabs, billing toggles or accordions found'];
}

// ---------------------------------------------------------------- main
const browser = await launch();
for (const raw of urls) {
  const url = /^https?:/.test(raw) ? raw : 'https://' + raw;
  const host = new URL(url).host.replace(/^www\./, '');
  const dir = path.join(OUT, slug(host + (new URL(url).pathname.length > 1 ? new URL(url).pathname : '')));
  mkdirSync(dir, { recursive: true });
  if (ROBOTS && !(await robotsAllows(url))) { console.log(`skip ${url}: disallowed by robots.txt`); continue; }
  const t0 = Date.now(), frames = [];
  try {
    const page = await newPage(browser, 1440, 900);
    await gotoSafe(page, url);
    const L = await page.evaluate(libs);
    const tick = (l) => process.env.MOTION_DEBUG && console.log(`  ${l} ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    tick('loaded');
    const S = await scrollPass(page, dir, frames); tick('scroll');
    const T = STATES ? await statePass(page, url, dir, frames) : []; tick('states');
    const N = NAV ? await navPass(page, url, dir, frames) : null; tick('nav');
    // Reduced motion: does the site honour it?
    const rm = await newPage(browser, 1440, 900, { reducedMotion: 'reduce' });
    await gotoSafe(rm, url);
    const rmN = await rm.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length);
    await rm.context().close(); await page.context().close();

    const top = (m, n = 4) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
    const md = [`# ${host} — motion`, url, '',
      '## Scroll',
      `Scroll engine: ${L.lenis ? 'Lenis smooth scroll' : L.locomotive ? 'Locomotive' : 'native'}${L.scrollBehavior === 'smooth' ? ' (scroll-behavior: smooth)' : ''}`,
      `Reveals: ${S.revealCount} of ${S.n} tracked elements change when scrolled into view${S.revealCount ? '' : ' (content is static on scroll)'}`,
      ...top(S.reveals).map(([k, v]) => `  ×${v}: ${k}`),
      S.revealCount ? `  timing: ${top(S.timingCount, 3).map(([k, v]) => `${k} (×${v})`).join('; ') || 'not exposed (JS-driven, see GSAP below)'}${S.delays.length > 1 ? ` · stagger delays ${S.delays.join('/')}` : ''}` : null,
      `Scroll-linked (scrub/parallax): ${S.linked.length ? S.linked.map(l => `${l.tag} ${l.w}×${l.h} (${l.eg})`).join('; ') : 'none'}`,
      `Pinned sections: ${S.pinned.length ? S.pinned.map(p => `${p.tag} ${p.h}px tall, held ~${p.px}px of scroll`).join('; ') : 'none'}`,
      `CSS scroll-driven: ${L.cssTimelines.length ? L.cssTimelines.join(' | ') : 'none'}`,
      L.gsap ? `GSAP ${L.gsap.version}: ${L.gsap.tweens} tweens · ease ${L.gsap.ease} · dur ${L.gsap.dur} · props ${L.gsap.props} · ScrollTrigger ${L.gsap.triggers} (pin ${L.gsap.pinned}, scrub ${L.gsap.scrub})${L.gsap.examples.length ? '\n  ' + L.gsap.examples.join('\n  ') : ''}` : 'GSAP: not present',
      '', '## Page transition',
      N ? (N.note || `Click "${N.link}" → ${N.path} · ${N.spa ? 'client-side route (no reload)' : 'full document load'} · view transitions: ${L.viewTransitionRule ? '@view-transition rule (cross-document)' : ''}${N.vtCalls ? ` startViewTransition ×${N.vtCalls}` : ''}${!L.viewTransitionRule && !N.vtCalls ? 'none' : ''}${L.vtNames ? ` · ${L.vtNames} view-transition-name rules` : ''} · see nav frames`) : 'skipped',
      '', '## In-page state changes', ...T.map(t => `- ${t}`),
      '', `Reduced motion: ${rmN} animations still running with prefers-reduced-motion: reduce${rmN > 5 ? ' (not honoured)' : ''}`,
      `Frames: motion-sheet.jpg (scroll states, nav +ms, state changes)`].filter(x => x !== null).join('\n');
    writeFileSync(path.join(dir, 'motion.md'), md);
    if (frames.length) await contactSheet(browser, frames, path.join(dir, 'motion-sheet.jpg'), { cols: 4, width: 2000, title: `${host} — motion frames`, maxImgH: 700 });
    console.log(`✓ ${host} → ${dir}/motion.md (${((Date.now() - t0) / 1000).toFixed(1)}s, ~${Math.round(md.length / 4)} tokens)`);
  } catch (e) { console.log(`✗ ${url}: ${e.message.split('\n')[0]}`); }
}
await browser.close();
