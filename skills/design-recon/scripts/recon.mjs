#!/usr/bin/env node
// design-recon: measure a live site's design system and write a compact digest.
//
//   node recon.mjs <url...> [--out .design/recon] [--pages 3] [--flow "Pricing>Sign up"]
//                  [--motion] [--video] [--no-mobile] [--ignore-robots]
//
// Per site it writes <out>/<host>/: digest.md (read this, ~600 tokens), tokens.json (full),
// sheet.jpg (one contact sheet of every frame), desktop.jpg, mobile.jpg, full.jpg,
// flow-*.jpg, filmstrip.jpg (--motion), svg/*.svg (diagrams/illustrations), video.webm (--video).
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import './lib/net.mjs';
import { launch, newPage, settle, shotCapped, gotoSafe } from './lib/pw.mjs';
import { contactSheet } from './lib/sheet.mjs';
import { fontTier } from './lib/fonts.mjs';
import { robotsAllows as robotsCheck } from './lib/robots.mjs';
const robotsAllows = (u) => ROBOTS ? robotsCheck(u) : Promise.resolve(true);

const argv = process.argv.slice(2);
const flag = (n, d) => { const i = argv.indexOf(n); return i < 0 ? d : (argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : true); };
const urls = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').match(/^--(out|pages|flow)$/));
if (!urls.length) { console.error('usage: recon.mjs <url...> [--out dir] [--pages N] [--flow "A>B"] [--motion] [--video]'); process.exit(1); }
const OUT = flag('--out', '.design/recon');
const PAGES = +flag('--pages', 0) || 0;
const FLOW = flag('--flow', '');
const MOTION = !!flag('--motion', false);
const VIDEO = !!flag('--video', false);
const MOBILE = !flag('--no-mobile', false);
const ROBOTS = !flag('--ignore-robots', false);

// ---------------------------------------------------------------- in-page extractor
function extract() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const cache = {};
  // Normalise any CSS colour (rgb, oklch, color(), named) to #rrggbb[aa] via the canvas.
  const hex = (c) => {
    if (!c || c === 'transparent') return null;
    if (c in cache) return cache[c];
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data;
    const h = a === 0 ? null : '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('') + (a < 250 ? a.toString(16).padStart(2, '0') : '');
    return (cache[c] = h);
  };
  const first = (v) => { let d = 0; for (let i = 0; i < v.length; i++) { const c = v[i]; if (c === '(') d++; else if (c === ')') d--; else if (c === ',' && !d) return v.slice(0, i).trim(); } return v.trim(); };
  const gen = (n) => n.replace(/\d+/g, '#').replace(/^[a-z0-9]{5,8}_/i, '*_').replace(/-[a-z0-9]{5,7}(-|$)/i, '-*$1');
  const add = (m, k, w = 1) => { if (k != null && k !== '') m[k] = (m[k] || 0) + w; };
  const top = (m, n = 8) => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, n);
  const fam = (f) => f.split(',')[0].replace(/["']/g, '').trim();
  const W = innerWidth, H = innerHeight;

  const els = [...document.querySelectorAll('body *')].slice(0, 8000);
  const bg = {}, fg = {}, border = {}, radii = {}, shadows = {}, space = {}, fonts = {}, sizes = {};
  const trans = {}, easing = {}, durations = {};
  let gradients = 0, textChars = 0, grid = 0, flex = 0;
  const visible = [];
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity === 0) continue;
    visible.push([el, r, cs]);
    const area = Math.min(r.width, W) * Math.min(r.height, 1500);
    const b = hex(cs.backgroundColor); if (b) add(bg, b, area);
    if (cs.backgroundImage.includes('gradient')) gradients++;
    let t = 0; for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent.trim().length;
    if (t) {
      textChars += t; add(fg, hex(cs.color), t);
      add(fonts, fam(cs.fontFamily) + ' ' + cs.fontWeight, t); if (parseFloat(cs.fontSize) >= 6) add(sizes, Math.round(parseFloat(cs.fontSize)), t);
    }
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') add(border, cs.borderTopWidth + ' ' + hex(cs.borderTopColor));
    else if (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== 'none') add(border, cs.borderBottomWidth + ' ' + hex(cs.borderBottomColor) + ' (bottom)');
    if (cs.borderTopLeftRadius !== '0px') add(radii, parseFloat(cs.borderTopLeftRadius) > 500 ? 'pill' : cs.borderTopLeftRadius);
    if (cs.boxShadow !== 'none') {
      const parts = []; let d = 0, st = 0; const v = cs.boxShadow;
      for (let i = 0; i <= v.length; i++) { const c = v[i]; if (c === '(') d++; else if (c === ')') d--; else if ((c === ',' && !d) || i === v.length) { parts.push(v.slice(st, i).trim()); st = i + 1; } }
      const real = parts.filter(p => hex((p.match(/rgba?\([^)]*\)|#\w+|oklch\([^)]*\)|color\([^)]*\)/) || ['#000'])[0]) && !/^\S+(\s+0(px)?){4}$/.test(p.replace(/rgba?\([^)]*\)/, 'c').trim()));
      if (real.length) add(shadows, real.map(p => p.replace(/rgba?\([^)]*\)/g, m => hex(m) || m)).join(', ').slice(0, 110));
    }
    for (const p of ['paddingTop', 'paddingLeft', 'marginTop', 'marginBottom', 'rowGap', 'columnGap']) {
      const n = parseFloat(cs[p]); if (n > 0 && n < 320) add(space, Math.round(n));
    }
    if (cs.display.includes('grid')) grid++; else if (cs.display.includes('flex')) flex++;
    if (cs.transitionDuration && cs.transitionDuration !== '0s') {
      const d = first(cs.transitionDuration); add(durations, d);
      add(trans, cs.transitionProperty.split(',').slice(0, 2).join(',').trim() + ' ' + d);
      add(easing, first(cs.transitionTimingFunction));
    }
  }
  const pct = (m, total) => top(m).map(([k, v]) => [k, Math.round(100 * v / total)]);
  const bgTotal = Object.values(bg).reduce((a, b) => a + b, 0) || 1;
  const pageBg = hex(getComputedStyle(document.body).backgroundColor) || hex(getComputedStyle(document.documentElement).backgroundColor) || '#ffffff';

  // Accent = most saturated colour used on links/buttons.
  const sat = (h) => { const n = parseInt(h.slice(1, 7), 16), r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; };
  const acc = {};
  for (const [el, , cs] of visible) if (el.matches('a,button,[role=button],input[type=submit]')) {
    for (const c of [hex(cs.backgroundColor), hex(cs.color)]) if (c && c.length === 7 && sat(c) > 0.35) add(acc, c);
  }

  // CSS custom properties (the site's own token names are gold).
  const vars = {};
  const sheets = [...document.styleSheets];
  const faces = [], keyframes = [];
  let reducedMotion = false, scrollTimeline = false, viewTransitions = false;
  const walk = (rules) => {
    for (const r of rules) {
      if (r instanceof CSSFontFaceRule) faces.push({ family: r.style.getPropertyValue('font-family').replace(/["']/g, ''), weight: r.style.getPropertyValue('font-weight'), src: (r.style.getPropertyValue('src').match(/url\(["']?([^"')]+)/) || [])[1] });
      else if (r instanceof CSSKeyframesRule) keyframes.push({ name: r.name, css: r.cssText.replace(/\s+/g, ' ').slice(0, 260) });
      else if (r instanceof CSSMediaRule) { if (/prefers-reduced-motion/.test(r.conditionText)) reducedMotion = true; walk(r.cssRules); }
      else if (r.cssRules) walk(r.cssRules);
      else if (r instanceof CSSStyleRule) {
        if (/^(:root|html|body|\[data-theme|\.dark|\.light|:host)/.test(r.selectorText))
          for (const p of r.style) if (p.startsWith('--') && Object.keys(vars).length < 400) vars[p] = r.style.getPropertyValue(p).trim();
        const txt = r.style.cssText;
        if (/animation-timeline|view-timeline/.test(txt)) scrollTimeline = true;
        if (/view-transition-name/.test(txt)) viewTransitions = true;
      }
    }
  };
  let crossOrigin = 0;
  for (const s of sheets) { try { walk(s.cssRules); } catch { crossOrigin++; } }
  // Keep the most design-relevant vars: colour, font, radius, space, shadow, motion.
  const varKeys = Object.keys(vars).filter(k => /color|bg|fg|text|accent|brand|primary|surface|border|font|radius|space|gap|shadow|ease|duration|motion/i.test(k));
  const cssVars = Object.fromEntries(varKeys.slice(0, 70).map(k => [k, vars[k].slice(0, 80)]));

  const loadedFonts = [...document.fonts].filter(f => f.status === 'loaded').map(f => `${f.family.replace(/["']/g, '')} ${f.weight} ${f.style}`);
  const fontRequests = performance.getEntriesByType('resource').map(e => e.name)
    .filter(n => /\.(woff2?|ttf|otf)(\?|$)|fonts\.googleapis|fonts\.gstatic|typekit|use\.typekit|fontshare|fonts\.bunny|cloud\.typography|fast\.fonts/.test(n)).slice(0, 20);

  // Type roles.
  const roleSel = { h1: 'h1', h2: 'h2', h3: 'h3', body: 'p', link: 'nav a, header a', button: 'button, a[class*=button], a[class*=btn], [role=button]', small: 'small, figcaption, time', input: 'input:not([type=hidden]), textarea' };
  const type = {};
  for (const [role, sel] of Object.entries(roleSel)) {
    const el = [...document.querySelectorAll(sel)].find(e => { const r = e.getBoundingClientRect(), c = getComputedStyle(e); return r.width > 2 && r.height > 2 && r.left >= 0 && c.visibility !== 'hidden' && parseFloat(c.fontSize) >= 8 && (e.innerText || e.value || e.placeholder || '').trim().length > 0; });
    if (!el) continue;
    const cs = getComputedStyle(el), fs = parseFloat(cs.fontSize);
    type[role] = { family: fam(cs.fontFamily), size: fs, lh: cs.lineHeight === 'normal' ? 'normal' : +(parseFloat(cs.lineHeight) / fs).toFixed(2), weight: cs.fontWeight, ls: cs.letterSpacing === 'normal' ? 0 : +(parseFloat(cs.letterSpacing) / fs).toFixed(3) + 'em', case: cs.textTransform !== 'none' ? cs.textTransform : undefined, color: hex(cs.color), text: (el.innerText || el.value || el.placeholder || '').trim().slice(0, 90) };
  }
  const scale = top(sizes, 12).map(([k]) => +k).sort((a, b) => a - b);
  const ratios = scale.slice(1).map((s, i) => s / scale[i]).filter(x => x > 1.05);
  const ratio = ratios.length ? +(ratios.reduce((a, b) => a * b, 1) ** (1 / ratios.length)).toFixed(2) : null;

  // Spacing base unit.
  const spTop = top(space, 12).map(([k]) => +k);
  const base = [8, 4, 6, 5].find(u => spTop.filter(v => v % u === 0).length >= spTop.length * 0.75) || null;

  // Layout.
  const widths = {};
  for (const [, r, cs] of visible) if (r.width > 560 && r.width < W - 32 && Math.abs(r.left - (W - r.right)) < 4 && cs.maxWidth !== 'none') add(widths, Math.round(r.width));
  const header = document.querySelector('header, nav, [role=banner]');
  const hcs = header && getComputedStyle(header), hr = header && header.getBoundingClientRect();
  const h1 = [...document.querySelectorAll('h1')].find(e => { const r = e.getBoundingClientRect(); return r.width > 2 && parseFloat(getComputedStyle(e).fontSize) >= 8; }), h1r = h1 && h1.getBoundingClientRect();
  const media = [...document.querySelectorAll('img, video, canvas, svg, picture, iframe, spline-viewer, lottie-player, dotlottie-player, rive-canvas')]
    .map(e => [e, e.getBoundingClientRect()]).filter(([, r]) => r.width >= 280 && r.height >= 160);
  const heroMediaEls = media.filter(([e, r]) => r.top < H && r.bottom > 0 && !e.closest('nav,header,button')).map(([e]) => e);
  const heroMedia = media.filter(([, r]) => r.top < H && r.bottom > 0).slice(0, 3).map(([e, r]) => `${e.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)}`);

  // Components: buttons, cards, inputs.
  const btn = {};
  const btnEls = {};
  for (const [el, r, cs] of visible) {
    if (!el.matches('a,button,[role=button]') || r.left < 0 || r.top + scrollY < 0 || r.height < 24 || r.height > 72 || r.width > 420) continue;
    const b = hex(cs.backgroundColor), bw = parseFloat(cs.borderTopWidth);
    if (!b && !bw) continue;
    const sig = `bg ${b || 'none'} · fg ${hex(cs.color)} · r ${parseFloat(cs.borderTopLeftRadius) > 500 ? 'pill' : cs.borderTopLeftRadius} · pad ${cs.paddingTop}/${cs.paddingLeft} · ${Math.round(parseFloat(cs.fontSize))}px/${cs.fontWeight}${bw ? ' · border ' + cs.borderTopWidth + ' ' + hex(cs.borderTopColor) : ''} · h ${Math.round(r.height)}`;
    add(btn, sig); (btnEls[sig] ||= []).push(el);
  }
  const buttons = top(btn, 4);
  const cta = buttons[0] && btnEls[buttons[0][0]].find(e => e.getBoundingClientRect().top < H);
  if (cta) cta.setAttribute('data-recon-cta', '1');

  // Hero anatomy: what the first screen is made of.
  const hero = (() => {
    if (!h1 || !h1r) return null;
    const hfs = parseFloat(getComputedStyle(h1).fontSize);
    const txt = (e) => (e.innerText || '').trim().replace(/\s+/g, ' ');
    const near = visible.filter(([e, r]) => r.top < H * 1.05);
    const sub = near.find(([e, r, cs]) => r.top >= h1r.bottom - 4 && r.top < h1r.bottom + 260 && !e.contains(h1) && parseFloat(cs.fontSize) < hfs * 0.6 && parseFloat(cs.fontSize) >= 13 && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 30) && txt(e).length < 320);
    const eyebrow = near.find(([e, r, cs]) => r.bottom <= h1r.top + 2 && r.bottom > h1r.top - 90 && parseFloat(cs.fontSize) < hfs * 0.5 && txt(e).length > 1 && txt(e).length < 48 && !e.closest('nav,header'));
    const ctas = Object.values(btnEls).flat().filter(e => { const r = e.getBoundingClientRect(); return r.top > h1r.top - 20 && r.top < H && !e.closest('nav,header'); });
    const rows = {};
    for (const e of document.querySelectorAll('img,svg')) { const r = e.getBoundingClientRect(); if (r.height >= 14 && r.height <= 64 && r.width >= 40 && r.top > h1r.bottom && r.top < H * 1.7 && !e.closest('nav,header,button,a[class*=btn]')) (rows[Math.round(r.top / 8)] ||= []).push(e); }
    const logos = Object.values(rows).some(v => v.length >= 4);
    let media = 'none';
    const m = heroMediaEls[0];
    if (m) { const r = m.getBoundingClientRect(); media = `${m.tagName.toLowerCase()} ${r.left > h1r.left + h1r.width * 0.6 ? 'right of' : r.top >= h1r.bottom - 10 ? 'below' : r.width >= W * 0.9 ? 'behind' : 'beside'} headline`; }
    let bgKind = 'solid';
    for (let e = h1; e && e !== document.body; e = e.parentElement) { const c = getComputedStyle(e); if (c.backgroundImage !== 'none') { bgKind = c.backgroundImage.includes('gradient') ? 'gradient' : 'image'; break; } }
    if ([...document.querySelectorAll('video,canvas')].some(v => { const r = v.getBoundingClientRect(); return r.top < H && r.width > W * 0.6; })) bgKind += ' + full-width video/canvas';
    const sec = h1.closest('section,[class*=hero i],header') || h1.parentElement;
    return { h1Words: txt(h1).split(' ').length, h1Lines: Math.round(h1r.height / (parseFloat(getComputedStyle(h1).lineHeight) || hfs * 1.1)), subChars: sub ? txt(sub[0]).length : 0, eyebrow: eyebrow ? txt(eyebrow[0]).slice(0, 40) + (getComputedStyle(eyebrow[0]).textTransform === 'uppercase' ? ' (caps)' : '') : null, ctas: ctas.length, ctaLabels: [...new Set(ctas.map(txt).filter(t => t && t.length <= 40))].slice(0, 3), logos, media, bg: bgKind, height: Math.round(sec.getBoundingClientRect().height), align: getComputedStyle(h1).textAlign };
  })();

  const cardSig = {};
  for (const [el, r, cs] of visible) {
    if (r.width < 180 || r.width > 700 || r.height < 100) continue;
    const hasEdge = cs.boxShadow !== 'none' || parseFloat(cs.borderTopWidth) > 0 || (hex(cs.backgroundColor) && hex(cs.backgroundColor) !== pageBg);
    if (!hasEdge || !el.parentElement) continue;
    const sib = [...el.parentElement.children].filter(s => s.className === el.className).length;
    if (sib >= 3) add(cardSig, `r ${cs.borderTopLeftRadius} · bg ${hex(cs.backgroundColor) || 'none'} · border ${parseFloat(cs.borderTopWidth) ? cs.borderTopWidth + ' ' + hex(cs.borderTopColor) : 'none'} · shadow ${cs.boxShadow === 'none' ? 'none' : 'yes'} · pad ${cs.paddingTop}`);
  }

  // Motion & libraries.
  const anims = document.getAnimations().slice(0, 200).map(a => ({ name: a.animationName || (a.transitionProperty ? 'transition:' + a.transitionProperty : a.constructor.name), dur: a.effect?.getTiming?.().duration, ease: a.effect?.getTiming?.().easing, iter: a.effect?.getTiming?.().iterations }));
  const animSummary = {}; for (const a of anims) add(animSummary, `${gen(a.name)} ${typeof a.dur === 'number' ? Math.round(a.dur) + 'ms' : a.dur}${a.iter === Infinity ? ' ∞' : ''}`);
  const scripts = [...document.scripts].map(s => s.src).join(' ');
  const libs = Object.entries({
    GSAP: !!window.gsap || /gsap/i.test(scripts), ScrollTrigger: !!window.ScrollTrigger, 'Framer Motion/Framer': !!document.querySelector('[data-framer-name],[data-framer-appear-id],[data-projection-id]') || /framer/i.test(scripts),
    'Motion One': !!window.Motion, Lottie: !!(window.lottie || window.bodymovin || document.querySelector('lottie-player,dotlottie-player,dotlottie-wc')) || /lottie/i.test(scripts),
    Rive: !!window.rive || /rive/i.test(scripts) || !!document.querySelector('rive-canvas'), 'Three.js': !!window.THREE || /three(\.module)?(\.min)?\.js/.test(scripts),
    Spline: !!document.querySelector('spline-viewer') || /spline/i.test(scripts), Lenis: !!(window.Lenis || window.lenis || document.documentElement.classList.contains('lenis')),
    Locomotive: !!window.LocomotiveScroll || !!document.querySelector('[data-scroll-container]'), Swiper: !!window.Swiper || !!document.querySelector('.swiper'),
    Barba: !!window.barba, 'anime.js': !!window.anime, AOS: !!window.AOS || !!document.querySelector('[data-aos]'), 'Webflow IX': !!window.Webflow,
    'Next.js': !!window.__NEXT_DATA__ || !!document.querySelector('script[src*="/_next/"]'), Nuxt: !!window.__NUXT__, Astro: !!document.querySelector('astro-island'),
    Tailwind: !!document.querySelector('[class*="px-"][class*="py-"], [class*="text-sm"]'),
  }).filter(([, v]) => v).map(([k]) => k);

  // Diagrams / illustrations to save.
  let rid = 0; const art = [];
  for (const [e, r] of media) {
    const tag = e.tagName.toLowerCase();
    if (!['svg', 'canvas'].includes(tag) || rid >= 6) continue;
    if (tag === 'svg' && e.closest('button,a') && r.width < 400) continue;
    e.setAttribute('data-recon-id', String(rid));
    art.push({ id: rid++, tag, w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top + scrollY), svg: tag === 'svg' ? e.outerHTML.slice(0, 80000) : undefined, webgl: tag === 'canvas' ? !!(e.getContext && (() => { try { return e.getContext('webgl2') || e.getContext('webgl'); } catch { return null; } })()) : undefined });
  }

  // Ads (IAB sizes + known networks).
  const IAB = ['300x250', '336x280', '728x90', '970x90', '970x250', '320x50', '320x100', '300x600', '160x600', '300x50', '468x60', '250x250'];
  const ads = [];
  for (const [el, r] of visible) {
    const idc = (el.id + ' ' + (typeof el.className === 'string' ? el.className : '')).toLowerCase();
    const net = el.tagName === 'IFRAME' && /doubleclick|googlesyndication|adservice|amazon-adsystem|taboola|outbrain|criteo|adnxs|pubmatic|rubicon/.test(el.src);
    const named = /(^|[\s_-])(ad|ads|advert|advertisement|gpt|dfp|adslot|ad-slot|sponsor(ed)?|promo-slot)([\s_-]|$)/.test(idc);
    const size = `${Math.round(r.width)}x${Math.round(r.height)}`;
    if (net || (named && (IAB.includes(size) || r.height >= 50))) ads.push({ size, iab: IAB.includes(size), y: Math.round(r.top + scrollY), sticky: /sticky|fixed/.test(getComputedStyle(el).position), label: (el.innerText || '').slice(0, 30) });
    if (ads.length > 20) break;
  }

  const q = (s, n) => [...new Set([...document.querySelectorAll(s)].filter(e => parseFloat(getComputedStyle(e).fontSize) >= 8 && e.getBoundingClientRect().height > 2).map(e => (e.innerText || e.textContent || '').trim().replace(/\s+/g, ' ')).filter(t => t && t.length < 90))].slice(0, n);
  return {
    title: document.title.slice(0, 120), description: (document.querySelector('meta[name=description]')?.content || '').slice(0, 200),
    ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
    theme: { pageBg, dark: (() => { const n = parseInt(pageBg.slice(1, 7), 16); return ((n >> 16 & 255) * .299 + (n >> 8 & 255) * .587 + (n & 255) * .114) < 110; })(), colorScheme: getComputedStyle(document.documentElement).colorScheme },
    color: { bg: pct(bg, bgTotal), text: pct(fg, textChars || 1), accent: top(acc, 4), border: top(border, 5), gradients },
    cssVars, varsTotal: Object.keys(vars).length, crossOriginSheets: crossOrigin,
    type: { families: pct(fonts, textChars || 1).slice(0, 6), scale, ratio, roles: type, faces: faces.slice(0, 16), loaded: [...new Set(loadedFonts)].slice(0, 16), requests: fontRequests },
    space: { top: spTop, base }, radii: top(radii, 6), shadows: top(shadows, 4),
    layout: { container: top(widths, 3), grid, flex, header: header ? { h: Math.round(hr.height), position: hcs.position, bg: hex(hcs.backgroundColor), blur: hcs.backdropFilter !== 'none' ? hcs.backdropFilter : undefined } : null, h1: h1r ? { size: Math.round(parseFloat(getComputedStyle(h1).fontSize)), align: getComputedStyle(h1).textAlign, top: Math.round(h1r.top), width: Math.round(h1r.width) } : null, heroMedia, docH: document.documentElement.scrollHeight },
    components: { buttons, cards: top(cardSig, 3), counts: { buttons: document.querySelectorAll('button,[role=button]').length, inputs: document.querySelectorAll('input,textarea,select').length, tables: document.querySelectorAll('table').length, forms: document.forms.length, dialogs: document.querySelectorAll('dialog,[role=dialog]').length } },
    motion: { libs, transitions: top(trans, 6), durations: top(durations, 6), easing: top(easing, 5), keyframes: (() => { const g = {}; for (const k of keyframes) add(g, gen(k.name)); return Object.entries(g).map(([k, v]) => v > 1 ? `${k} ×${v}` : k).slice(0, 24); })(), keyframeSamples: (() => { const seen = new Set(); return keyframes.filter(k => !/^(spin|ping|pulse|bounce)$/.test(k.name) && !seen.has(gen(k.name)) && seen.add(gen(k.name))).sort((a, b) => (/transform|clip-path|filter|offset/.test(b.css) - /transform|clip-path|filter|offset/.test(a.css)) || a.css.length - b.css.length).slice(0, 3).map(k => k.css.slice(0, 170)); })(), running: top(animSummary, 8), runningTotal: anims.length, reducedMotion, scrollTimeline, viewTransitions },
    art, ads, hero,
    copy: { h1: q('h1', 2), h2: q('h2', 6), ctas: [...new Set(Object.values(btnEls).flat().map(e => (e.innerText || '').trim().replace(/\s+/g, ' ')).filter(t => t && t.length < 40 && !/^(skip( to)?|previous|next|close|menu|toggle)\b/i.test(t)))].slice(0, 10), nav: q('header nav a, nav a', 14).filter(t => !/^skip to|keyboard shortcuts/i.test(t)).slice(0, 10) },
    links: [...document.querySelectorAll('a[href]')].map(a => ({ t: (a.innerText || '').trim().slice(0, 40), h: a.href })).filter(l => l.t && l.h.startsWith(location.origin)).slice(0, 300),
  };
}

// ---------------------------------------------------------------- helpers

const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40).toLowerCase();
const f = (arr, fmt = ([k, v]) => `${k} (${v})`) => (arr || []).map(fmt).join(', ') || '—';


function digest(host, url, d, extras) {
  const t = d.type.roles, L = [];
  const role = (k) => t[k] ? `${k} ${t[k].size}/${t[k].lh} ${t[k].weight}${t[k].ls ? ' ls ' + t[k].ls : ''}${t[k].case ? ' ' + t[k].case : ''} "${t[k].family}"` : null;
  L.push(`# ${host} — recon`, `${url}`, `Title: ${d.title}`, d.description ? `Meta: ${d.description}` : '', '');
  L.push('## Colour', `Page bg ${d.theme.pageBg} (${d.theme.dark ? 'dark' : 'light'}${d.theme.colorScheme !== 'normal' ? ', color-scheme ' + d.theme.colorScheme : ''}) · gradients: ${d.color.gradients}`,
    `Surfaces (area %): ${f(d.color.bg.slice(0, 6), ([k, v]) => `${k} ${v}%`)}`,
    `Text (char %): ${f(d.color.text.slice(0, 5), ([k, v]) => `${k} ${v}%`)}`,
    `Accent (links/buttons): ${f(d.color.accent)}`, `Borders: ${f(d.color.border)}`);
  const vk = Object.entries(d.cssVars);
  if (vk.length) L.push(`CSS vars (${d.varsTotal} total, sample): ${vk.slice(0, 24).map(([k, v]) => `${k}:${v}`).join('; ')}`);
  L.push('', '## Type', `Families by text share: ${f(d.type.families, ([k, v]) => `${k} ${v}%${fontTier(k.replace(/ \d+$/, '')) ? ' [' + fontTier(k.replace(/ \d+$/, '')) + ']' : ''}`)}`,
    `Scale px: ${d.type.scale.join(' ')}${d.type.ratio ? ` (avg step ×${d.type.ratio})` : ''}`,
    [role('h1'), role('h2'), role('h3'), role('body'), role('button'), role('small')].filter(Boolean).join(' | '),
    `Font sources: ${[...new Set(d.type.requests.map(u => { try { const x = new URL(u); return /googleapis|gstatic/.test(x.host) ? 'Google Fonts' : /typekit/.test(x.host) ? 'Adobe Fonts' : /fontshare/.test(x.host) ? 'Fontshare' : x.host === new URL(url).host ? 'self-hosted' : x.host; } catch { return u; } }))].join(', ') || 'none detected'}`,
    `@font-face: ${[...new Set(d.type.faces.map(x => x.family))].join(', ') || '— (cross-origin CSS)'}`);
  L.push('', '## Space, shape, layout',
    `Spacing top values: ${d.space.top.join(' ')} → base ${d.space.base ? d.space.base + 'px' : 'irregular'}`,
    `Radii: ${f(d.radii)} · Shadows: ${d.shadows.length ? f(d.shadows, ([k, v]) => `[${k}] ×${v}`) : 'none'}`,
    `Container widths: ${f(d.layout.container)} · grid ${d.layout.grid} / flex ${d.layout.flex}`,
    d.layout.header ? `Header: ${d.layout.header.h}px ${d.layout.header.position} bg ${d.layout.header.bg || 'transparent'}${d.layout.header.blur ? ' ' + d.layout.header.blur : ''}` : 'Header: none',
    d.layout.h1 ? `H1: ${d.layout.h1.size}px ${d.layout.h1.align}, top ${d.layout.h1.top}px, width ${d.layout.h1.width}px · above-fold media: ${d.layout.heroMedia.join(', ') || 'none'}` : 'H1: none',
    `Page height: ${d.layout.docH}px`);
  if (d.hero) { const h = d.hero; L.push('', '## Hero', `H1 ${h.h1Words} words / ${h.h1Lines} lines, ${h.align} · sub ${h.subChars} chars · eyebrow ${h.eyebrow ? '"' + h.eyebrow + '"' : 'none'} · CTAs ${h.ctas} (${h.ctaLabels.map(x => '"' + x + '"').join(', ')}) · logo strip ${h.logos ? 'yes' : 'no'} · media ${h.media} · bg ${h.bg} · section ${h.height}px`); }
  L.push('', '## Components', ...d.components.buttons.map(([k, v], i) => `Button ${i + 1} (×${v}): ${k}`),
    ...(d.components.cards.length ? d.components.cards.map(([k, v]) => `Repeated card (×${v}): ${k}`) : ['Repeated cards: none']),
    `Counts: ${Object.entries(d.components.counts).map(([k, v]) => `${k} ${v}`).join(', ')}`);
  if (extras.hover) L.push(`Primary CTA hover: ${extras.hover}`);
  L.push('', '## Motion', `Libraries/stack: ${d.motion.libs.join(', ') || 'none detected'}`,
    `Transitions: ${f(d.motion.transitions)}`, `Easing: ${f(d.motion.easing)}`,
    `Running on load: ${d.motion.runningTotal} (${f(d.motion.running)})`,
    `@keyframes: ${d.motion.keyframes.slice(0, 16).join(', ') || 'none'}`,
    ...d.motion.keyframeSamples.map(k => `  ${k}`),
    `prefers-reduced-motion rules: ${d.motion.reducedMotion ? 'yes' : 'NO'} · scroll-driven CSS: ${d.motion.scrollTimeline ? 'yes' : 'no'} · view transitions: ${d.motion.viewTransitions ? 'yes' : 'no'}`);
  if (extras.motionAssets.length) L.push(`Motion assets: ${extras.motionAssets.slice(0, 6).join(', ')}`);
  L.push('', '## Imagery & diagrams', `Large media: ${d.art.length ? d.art.map(a => `${a.tag}${a.webgl ? '(WebGL)' : ''} ${a.w}x${a.h} @y${a.y}`).join(', ') : 'no large svg/canvas'} · saved: ${extras.saved.join(', ') || '—'}`);
  if (d.ads.length) L.push('', '## Ads', `${d.ads.length} slots: ${d.ads.map(a => `${a.size}${a.iab ? ' IAB' : ''} @y${a.y}${a.sticky ? ' sticky' : ''}`).join(', ')}`);
  L.push('', '## Copy voice', `H1: ${d.copy.h1.map(x => `"${x}"`).join(' / ') || '—'}`, `H2: ${d.copy.h2.map(x => `"${x}"`).join(' / ')}`, `CTAs: ${d.copy.ctas.map(x => `"${x}"`).join(', ')}`, `Nav: ${d.copy.nav.join(' | ')}`);
  if (extras.mobile) L.push('', '## Mobile (390)', extras.mobile);
  if (extras.flow.length) L.push('', '## Flow / pages', ...extras.flow);
  L.push('', `Files: ${extras.files.join(' ')}`);
  return L.filter(x => x !== null).join('\n').replace(/\n{3,}/g, '\n\n');
}

// ---------------------------------------------------------------- main
const browser = await launch();
for (const raw of urls) {
  const url = /^https?:/.test(raw) ? raw : 'https://' + raw;
  const host = new URL(url).host.replace(/^www\./, '');
  const dir = path.join(OUT, slug(host + (new URL(url).pathname.length > 1 ? new URL(url).pathname : '')));
  mkdirSync(path.join(dir, 'svg'), { recursive: true });
  if (!(await robotsAllows(url))) { console.log(`skip ${url}: disallowed by robots.txt (use --ignore-robots only with permission)`); continue; }
  const t0 = Date.now();
  const visited = [], files = [], sheet = [], flowNotes = [], motionAssets = [], saved = [];
  try {
    const page = await newPage(browser, 1440, 900, VIDEO ? { recordVideo: { dir, size: { width: 1280, height: 800 } } } : {});
    page.on('response', r => { const u = r.url(); if (/\.(riv|lottie)(\?|$)|lottie.*\.json|\/animations?\/.*\.json/i.test(u)) motionAssets.push(u.split('/').pop().slice(0, 60)); });
    await gotoSafe(page, url);
    await page.screenshot({ path: path.join(dir, 'desktop.jpg'), type: 'jpeg', quality: 72 });
    files.push('desktop.jpg'); sheet.push({ path: path.join(dir, 'desktop.jpg'), label: 'Desktop 1440 — first view' });

    // Load-sequence filmstrip (before scrolling disturbs it).
    const film = [];
    if (MOTION) {
      await page.reload({ waitUntil: 'commit' });
      for (const ms of [120, 350, 700, 1200, 2000]) {
        await page.waitForTimeout(ms - (film.at(-1)?.ms || 0));
        const p = path.join(dir, `f-load-${ms}.jpg`);
        await page.screenshot({ path: p, type: 'jpeg', quality: 55 }); film.push({ ms, path: p, label: `load +${ms}ms` });
      }
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    }
    await settle(page);
    const d = await page.evaluate(extract);

    // Hover state of the primary CTA.
    let hover = '';
    const cta = page.locator('[data-recon-cta]').first();
    if (await cta.count()) {
      const read = () => cta.evaluate(e => { const c = getComputedStyle(e); return { bg: c.backgroundColor, color: c.color, transform: c.transform, shadow: c.boxShadow.slice(0, 60), border: c.borderColor, dur: c.transitionDuration, ease: c.transitionTimingFunction }; });
      try {
        const before = await read(); await cta.hover({ timeout: 2000 }); await page.waitForTimeout(450); const after = await read();
        const diff = Object.keys(before).filter(k => !['dur', 'ease'].includes(k) && before[k] !== after[k]).map(k => `${k} ${before[k]} → ${after[k]}`);
        hover = diff.length ? `${diff.join('; ')} (${before.dur.split(',')[0]} ${before.ease.match(/^[^,(]+(\([^)]*\))?/)[0]})` : 'no visual change';
        await page.mouse.move(0, 0);
      } catch {}
    }

    // Save diagrams / illustrations as SVG source + frame.
    for (const a of d.art) {
      try {
        const loc = page.locator(`[data-recon-id="${a.id}"]`);
        const p = path.join(dir, 'svg', `art-${a.id}.jpg`);
        await loc.screenshot({ path: p, type: 'jpeg', quality: 70, timeout: 4000 });
        if (a.svg) { writeFileSync(path.join(dir, 'svg', `art-${a.id}.svg`), a.svg); saved.push(`svg/art-${a.id}.svg`); }
        if (sheet.length < 12) sheet.push({ path: p, label: `${a.tag}${a.webgl ? ' (WebGL)' : ''} ${a.w}×${a.h}` });
      } catch {}
      delete a.svg;
    }

    await shotCapped(page, path.join(dir, 'full.jpg'), 7000, 60);
    files.push('full.jpg'); sheet.push({ path: path.join(dir, 'full.jpg'), label: 'Full page (desktop, capped 7000px)' });

    // Scroll filmstrip.
    if (MOTION) {
      const H = d.layout.docH;
      for (const frac of [0.15, 0.3, 0.5]) {
        await page.evaluate(y => scrollTo(0, y), Math.round(H * frac)); await page.waitForTimeout(650);
        const p = path.join(dir, `f-scroll-${Math.round(frac * 100)}.jpg`);
        await page.screenshot({ path: p, type: 'jpeg', quality: 55 }); film.push({ path: p, label: `scroll ${Math.round(frac * 100)}%` });
      }
      await contactSheet(browser, film, path.join(dir, 'filmstrip.jpg'), { cols: 4, width: 2000, title: `${host} — load sequence & scroll states` });
      files.push('filmstrip.jpg');
    }

    // Flow: click through named steps from the landing page. Never submits forms.
    if (FLOW) {
      await gotoSafe(page, url);
      let i = 0;
      for (const step of String(FLOW).split('>').map(s => s.trim()).filter(Boolean)) {
        i++;
        const target = page.getByRole('link', { name: new RegExp(step, 'i') }).or(page.getByRole('button', { name: new RegExp(step, 'i') })).first();
        try {
          await target.click({ timeout: 5000 });
          await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {}); await page.waitForTimeout(700);
          const p = path.join(dir, `flow-${i}-${slug(step)}.jpg`);
          await page.screenshot({ path: p, type: 'jpeg', quality: 70 });
          visited.push(page.url().replace(/\/$/, ''));
          const info = await page.evaluate(() => ({ url: location.pathname, h1: document.querySelector('h1')?.innerText?.slice(0, 80), inputs: [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].slice(0, 8).map(i => i.getAttribute('aria-label') || i.placeholder || i.name || i.type), buttons: [...document.querySelectorAll('button,[type=submit]')].slice(0, 6).map(b => b.innerText.trim()).filter(Boolean) }));
          flowNotes.push(`${i}. "${step}" → ${info.url} · h1 "${info.h1 || '—'}" · fields: ${info.inputs.join(', ') || '—'} · buttons: ${info.buttons.join(', ') || '—'}`);
          files.push(path.basename(p)); sheet.push({ path: p, label: `Flow ${i}: ${step}` });
        } catch { flowNotes.push(`${i}. "${step}" — not found/clickable; flow stopped`); break; }
      }
    }

    // Key pages: pricing, signup, product, docs… (auto-discovered, same origin).
    if (PAGES) {
      const want = /pricing|plans|sign ?up|get started|start|register|product|features|docs|changelog|customers|about|blog|login|log in/i;
      const seen = new Set([url.replace(/\/$/, ''), ...visited]);
      const picks = d.links.filter(l => want.test(l.t) && !seen.has(l.h.replace(/\/$/, '')) && (seen.add(l.h.replace(/\/$/, '')), true)).slice(0, PAGES);
      for (const l of picks) {
        if (!(await robotsAllows(l.h))) continue;
        try {
          await gotoSafe(page, l.h);
          const p = path.join(dir, `page-${slug(l.t)}.jpg`);
          await shotCapped(page, p, 3200, 62);
          const info = await page.evaluate(() => ({ h1: document.querySelector('h1')?.innerText?.slice(0, 80), forms: document.forms.length, tables: document.querySelectorAll('table').length, inputs: document.querySelectorAll('input:not([type=hidden])').length }));
          flowNotes.push(`page "${l.t}" ${new URL(l.h).pathname} · h1 "${info.h1 || '—'}" · forms ${info.forms} inputs ${info.inputs} tables ${info.tables}`);
          files.push(path.basename(p)); sheet.push({ path: p, label: `Page: ${l.t}` });
        } catch (e) { flowNotes.push(`page "${l.t}" failed: ${e.message.split('\n')[0].slice(0, 80)}`); }
      }
      if (!picks.length) flowNotes.push('no pricing/signup/product/docs links found for --pages');
    }
    if (VIDEO) { const v = page.video(); await page.context().close(); if (v) { const vp = await v.path(); files.push(path.basename(vp)); } } else await page.context().close();

    // Mobile.
    let mobileNote = '';
    if (MOBILE) {
      const m = await newPage(browser, 390, 844);
      await gotoSafe(m, url); await settle(m, { maxH: 5000 });
      const mi = await m.evaluate(() => {
        const h1 = document.querySelector('h1'), cs = h1 && getComputedStyle(h1), p = document.querySelector('p'), pcs = p && getComputedStyle(p);
        const burger = [...document.querySelectorAll('button,[role=button]')].find(b => /menu|nav/i.test((b.getAttribute('aria-label') || '') + b.innerText + b.className));
        return { h1: cs ? `${Math.round(parseFloat(cs.fontSize))}px/${(parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2)}` : '—', body: pcs ? Math.round(parseFloat(pcs.fontSize)) + 'px' : '—', overflow: document.documentElement.scrollWidth > innerWidth + 1, menu: !!burger, stickyBottom: [...document.querySelectorAll('body *')].some(e => { const c = getComputedStyle(e); const r = e.getBoundingClientRect(); return c.position === 'fixed' && r.bottom >= innerHeight - 2 && r.height > 40 && r.width > 300; }) };
      });
      mobileNote = `H1 ${mi.h1} · body ${mi.body} · menu button ${mi.menu ? 'yes' : 'no'} · sticky bottom bar ${mi.stickyBottom ? 'yes' : 'no'}${mi.overflow ? ' · HORIZONTAL OVERFLOW' : ''}`;
      await m.screenshot({ path: path.join(dir, 'mobile.jpg'), type: 'jpeg', quality: 72 });
      await shotCapped(m, path.join(dir, 'mobile-full.jpg'), 4200, 60);
      files.push('mobile.jpg', 'mobile-full.jpg'); sheet.splice(1, 0, { path: path.join(dir, 'mobile-full.jpg'), label: 'Mobile 390 (capped)' });
      await m.context().close();
    }

    if (MOTION) sheet.push({ path: path.join(dir, 'filmstrip.jpg'), label: 'Motion filmstrip' });
    await contactSheet(browser, sheet, path.join(dir, 'sheet.jpg'), { cols: Math.min(4, sheet.length), title: `${host} — recon frames`, maxImgH: 1100, width: 2000 });
    files.unshift('sheet.jpg');
    delete d.links;
    const md = digest(host, url, d, { hover, motionAssets: [...new Set(motionAssets)], saved, mobile: mobileNote, flow: flowNotes, files: [...files, ...saved] });
    writeFileSync(path.join(dir, 'tokens.json'), JSON.stringify({ url, host, at: new Date().toISOString(), ...d, hover, motionAssets }, null, 1));
    writeFileSync(path.join(dir, 'digest.md'), md);
    console.log(`✓ ${host} → ${dir}/digest.md  (${((Date.now() - t0) / 1000).toFixed(1)}s, ~${Math.round(md.length / 4)} tokens)`);
  } catch (e) {
    console.log(`✗ ${url}: ${e.message.split('\n')[0]}`);
  }
}
await browser.close();
