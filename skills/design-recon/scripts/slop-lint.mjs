#!/usr/bin/env node
// slop-lint: static scan for the tells of generated UI. No dependencies.
//
//   node slop-lint.mjs [paths...] [--allow rule,rule] [--json] [--brief .design/brief.md]
//
// Suppress: `lint-allow: rule-id, rule-id` in the brief (for choices the brief made on purpose),
// or a `slop-ok` comment on the line. Exit 1 when any high-severity finding remains.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { tierRegex } from './lib/fonts.mjs';
const FONT_CTX = /(font-family\s*:|fontFamily|family=|next\/font\/(google|local)|@fontsource|font-\[|fontshare|--font[\w-]*\s*:)/i;

const argv = process.argv.slice(2);
const opt = (n) => { const i = argv.indexOf(n); return i < 0 ? null : argv[i + 1]; };
const roots = argv.filter((a, i) => !a.startsWith('--') && !/^--(allow|brief)$/.test(argv[i - 1] || ''));
if (!roots.length) roots.push('.');
const briefPath = opt('--brief') || '.design/brief.md';
const allow = new Set((opt('--allow') || '').split(',').map(s => s.trim()).filter(Boolean));
if (existsSync(briefPath)) {
  const m = readFileSync(briefPath, 'utf8').match(/lint-allow:[ \t]*([^\n<]*)/i);
  if (m) m[1].split(/[,\s]+/).filter(Boolean).forEach(r => allow.add(r));
}

const EXT = /\.(html?|css|scss|sass|less|jsx?|tsx?|vue|svelte|astro|mdx)$/;
const SKIP = /(^|\/)(node_modules|dist|build|out|\.next|\.nuxt|\.svelte-kit|\.git|\.design|coverage|vendor|\.cache|test|tests|__tests__|fixtures)(\/|$)/;
const files = [];
const walk = (p, root) => {
  if (SKIP.test(path.relative(root, p))) return;
  const st = statSync(p);
  if (st.isDirectory()) for (const f of readdirSync(p)) walk(path.join(p, f), root);
  else if (EXT.test(p) && st.size < 800_000 && !/\.min\./.test(p)) files.push(p);
};
roots.forEach(r => existsSync(r) && walk(r, r));

// ------------------------------------------------------------------ colour helpers
const hsl = (hex) => {
  let h = hex.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16), r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let H = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(H * 60 + 360) % 360, s, l];
};
const isPurple = (hex) => { const [h, s, l] = hsl(hex); return h >= 245 && h <= 320 && s > 0.35 && l > 0.25 && l < 0.8; };
const isCream = (hex) => { const [h, s, l] = hsl(hex); return h >= 25 && h <= 55 && s > 0.15 && l > 0.88 && l < 0.97; };
const isClay = (hex) => { const [h, s, l] = hsl(hex); return h >= 8 && h <= 25 && s > 0.45 && l > 0.5 && l < 0.7; };
const isAcid = (hex) => { const [h, s, l] = hsl(hex); return h >= 65 && h <= 110 && s > 0.8 && l > 0.45 && l < 0.65; };
const isTintedBlack = (hex) => /^#(0[0-9a-f]0[0-9a-f]0[0-9a-f]|111111|111|0a0a0a|0b0b0b|0c0c0c|0d0d0d)$/i.test(hex);

// ------------------------------------------------------------------ rules
// sev 3 = high (fails), 2 = medium, 1 = low. `text: true` = only match human-visible copy.
const TEXT = /(>[^<>{}]*<)|(["'`][^"'`]*\s[^"'`]*["'`])|(^\s*[^<>{}=;:()]*[a-z]{3,}\s[a-z]{3,}[^<>{}=;]*$)/i;
const rules = [
  { id: 'copy-cliche', sev: 3, text: true, re: /\b(unlock(ing)? (the|your)|unleash|elevate (your|the)|supercharge|revolutioni[sz]e|seamless(ly)?|effortless(ly)?|empower(s|ing)?|game[- ]chang|cutting[- ]edge|next[- ]gen(eration)?|harness(ing)? the power|to the next level|in today'?s (fast[- ]paced|digital)|world[- ]class|best[- ]in[- ]class|all[- ]in[- ]one (platform|solution)|streamline (your|the)|at your fingertips|transform (the way|your)|reimagine(d)?|built for the future|like never before|delve)\b/i, msg: 'Marketing cliché. Say what the product literally does, in the user\'s words.' },
  { id: 'ai-buzz', sev: 2, text: true, re: /\b(ai[- ]powered|powered by (ai|gpt|llms?|machine learning)|(harness|leverag)\w* (the power of )?(ai|llms?)|ai[- ]driven (insights|solutions)|intelligent automation|smart insights|how can i help you today\??|your (ai|intelligent) (co-?pilot|assistant) for (everything|anything))\b/i, msg: '"AI" as the selling point. Say what it does and show it doing it.' },
  { id: 'placeholder', sev: 3, text: true, re: /\b(lorem ipsum|john doe|jane doe|acme( corp| inc)?|example@example\.com|your company|company name|feature (one|two|three|1|2|3)|123 main st)\b/i, msg: 'Placeholder content. Use real or realistic, subject-specific content.' },
  { id: 'fake-proof', sev: 3, text: true, re: /((trusted|loved|used) by [\d,.]+\s*[km+]*\+?\s*(users|teams|companies|developers|customers|creators)|join [\d,.]+\s*[km]?\+ |★★★★★|\b10x (faster|better)|99\.9+% (uptime|satisfaction))/i, msg: 'Invented social proof or metrics. Use real numbers from the brief or remove.' },
  { id: 'sparkle', sev: 2, re: /(✨|\bSparkles\b|sparkle-icon|lucide-sparkles|<Sparkle)/, msg: 'Sparkle iconography is the generic "AI" tell.' },
  { id: 'emoji-ui', sev: 2, text: true, re: /<(h[1-6]|button|a|li|span|p|label|th|td)[^>]*>[^<]*\p{Extended_Pictographic}/u, msg: 'Emoji as UI decoration/icons. Use real icons or nothing.' },
  { id: 'purple-gradient', sev: 3, re: /(from-(purple|violet|indigo|fuchsia)-\d{3}[^"'`]*to-|bg-gradient-to-\w+[^"'`]*(purple|violet|indigo|fuchsia)|(linear|radial|conic)-gradient\([^;]*)/i, test: (l, m) => /purple|violet|indigo|fuchsia/i.test(m[0]) || (m[0].match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) || []).some(isPurple), msg: 'Purple/indigo gradient — the default AI palette. Derive colour from the subject.' },
  { id: 'gradient-text', sev: 2, re: /(bg-clip-text[^"'`]*text-transparent|text-transparent[^"'`]*bg-clip-text|background-clip:\s*text)/, msg: 'Gradient text. Let type weight/scale carry emphasis.' },
  { id: 'glass', sev: 1, re: /(backdrop-blur(-\w+)?[^"'`]*bg-white\/(5|10|20)|bg-white\/(5|10|20)[^"'`]*backdrop-blur|backdrop-filter:\s*blur\(\s*(1[2-9]|[2-9]\d)px)/, msg: 'Glassmorphism panel. Only if the brief asks for it.' },
  { id: 'blob-decor', sev: 2, re: /(blur-(2|3)xl[^"'`]*rounded-full|rounded-full[^"'`]*blur-(2|3)xl|filter:\s*blur\((6\d|[7-9]\d|\d{3})px\))/, msg: 'Blurred gradient blob decoration.' },
  { id: 'novelty-font', sev: 3, re: FONT_CTX, test: (l) => tierRegex('novelty').test(l), snip: (l) => l.match(tierRegex('novelty'))[0], msg: 'Genre-cliché face (cyber/sci-fi/pixel/party). Only if the brief is literally that genre; see references/fonts.md.' },
  { id: 'condensed-font', sev: 2, re: FONT_CTX, test: (l) => tierRegex('condensed').test(l), snip: (l) => l.match(tierRegex('condensed'))[0], msg: 'Condensed/squished family. House preference is round, open, regular-width type (references/fonts.md).' },
  { id: 'squished-type', sev: 2, re: /(letter-spacing:\s*-\s*0?\.(0[4-9]|03[1-9]|[1-9])\d*em|tracking-tighter|tracking-\[-0?\.(0[4-9]|[1-9])|font-stretch:\s*(ultra-|extra-|semi-)?condensed|font-stretch:\s*[1-8]\d%|"wdth"\s*[1-8]\d\b)/, msg: 'Squished type: tracking tighter than -0.03em or a condensed width. Keep display tracking ≥ -0.025em and width ≥ 95.' },
  { id: 'thin-type', sev: 2, re: /(font-weight:\s*[12]00\b|\bfont-(thin|extralight)\b|"wght"\s*[12]\d\d\b)/, msg: 'Extremely thin weight (100–200). Use ≥ 400 for text and ≥ 300 only for very large display.' },
  { id: 'default-font', sev: 2, re: FONT_CTX, test: (l) => tierRegex('default').test(l), snip: (l) => l.match(tierRegex('default'))[0], msg: 'AI-default face. Keep only if the brief chose it for a stated reason (lint-allow: default-font).' },
  { id: 'saturated-font', sev: 1, re: FONT_CTX, test: (l) => tierRegex('saturated').test(l), snip: (l) => l.match(tierRegex('saturated'))[0], msg: 'Trend-saturated face (the usual "instead of Inter" picks). Prefer a less-worn option from references/fonts.md.' },
  { id: 'eyebrow', sev: 2, re: /(uppercase[^"'`\n]*tracking-(wide|wider|widest|\[0?\.\d+em\])|tracking-(wide|wider|widest)[^"'`\n]*uppercase|text-transform:\s*uppercase[^}]*letter-spacing:\s*0?\.(0[8-9]|[1-9]))/, msg: 'Tracked all-caps eyebrow label. Remove unless it carries information.', count: 3 },
  { id: 'arrow-cta', sev: 1, text: true, re: /(\w\s*(→|&rarr;|-&gt;)\s*(<\/|["'`]))/, msg: 'Arrow appended to link/button text.', count: 2 },
  { id: 'mid-dot', sev: 1, text: true, re: /\w\s·\s\w/, msg: 'Meta strings joined with middle dots.', count: 4 },
  { id: 'numbered', sev: 1, text: true, re: /(>|["'`])\s*0[1-9]\s*[./—–-]?\s*(<|["'`])/, msg: '01/02/03 markers. Only for real sequences.', count: 3 },
  { id: 'generic-cta', sev: 1, text: true, re: /(>|(?<!(type|kind|variant|name|id)=)["'`])\s*(get started|learn more|click here|submit|discover more|explore now)\s*(→)?\s*(<|["'`])/i, msg: 'Generic CTA. Name the action: "Start a schedule", "Save changes".' },
  { id: 'welcome-back', sev: 2, text: true, re: /\b(welcome back,?\s*\{?\w*\}?\s*\p{Extended_Pictographic}|welcome to (your|the) (dashboard|app))/iu, msg: 'Chatty dashboard greeting. Lead with the user\'s work.' },
  { id: 'stock-avatar', sev: 1, re: /(pravatar\.cc|randomuser\.me|i\.pravatar|source\.unsplash\.com\/random|ui-avatars\.com|dicebear)/, msg: 'Random stock avatars/images.' },
  { id: 'hover-lift', sev: 1, re: /(hover:-translate-y-(1|2|0\.5)|hover:scale-(105|110)|:hover[^{]*\{[^}]*translateY\(-\d)/, msg: 'Lift-on-hover on every card.', count: 3 },
  { id: 'reveal-everywhere', sev: 2, re: /(whileInView|data-aos=|animate-fade-in-up|fade-?in-?up|animate-in fade-in|slide-in-from-bottom|useInView|ScrollReveal)/, msg: 'Scroll-reveal on many sections. Choose one orchestrated moment.', count: 4 },
  { id: 'infinite-decor', sev: 1, re: /(animate-(pulse|bounce|ping)\b|animation:[^;]*infinite)/, msg: 'Decorative infinite animation (fine for loaders only).', count: 3 },
];

// ------------------------------------------------------------------ scan
const findings = [];
const agg = { radius: {}, shadowSoft: 0, grid3: 0, cream: 0, clay: 0, acid: 0, tinted: 0, anim: 0, reduced: 0, center: 0, iconTile: 0 };
const counts = {};
for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    if (/slop-ok/.test(line) || line.length > 3000) return;
    for (const r of rules) {
      if (allow.has(r.id)) continue;
      const m = line.match(r.re); if (!m) continue;
      if (r.text && !TEXT.test(line)) continue;
      if (r.test && !r.test(line, m)) continue;
      (counts[r.id] ||= []).push({ file, line: i + 1, snip: (r.snip ? r.snip(line) : m[0]).slice(0, 70) });
    }
    for (const m of line.matchAll(/\brounded(-(sm|md|lg|xl|2xl|3xl|full|none|\[[^\]]+\]))?(?=[\s"'`])/g)) agg.radius[m[0]] = (agg.radius[m[0]] || 0) + 1;
    for (const m of line.matchAll(/border-radius:\s*([^;]+);/g)) agg.radius[m[1].trim()] = (agg.radius[m[1].trim()] || 0) + 1;
    if (/\bshadow-(sm|md|lg|xl)\b|box-shadow:[^;]*rgba\(0,\s*0,\s*0,\s*0?\.(05|1|08|12|15)\)/.test(line)) agg.shadowSoft++;
    if (/grid-cols-3\b|repeat\(3,\s*(1fr|minmax)/.test(line)) agg.grid3++;
    if (/(h-1[02]|w-1[02]|size-1[02])[^"'`]*rounded-(lg|xl|2xl)[^"'`]*bg-\w+-(50|100|500\/10)/.test(line)) agg.iconTile++;
    for (const h of line.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/gi) || []) {
      if (isCream(h) && /(^|[\s{;])(body|html|:root|main)\b[^{]*\{[^}]*background|--(bg|background|paper|surface|canvas|page|base|cream)[\w-]*\s*:|background(-color)?\s*:\s*#|bg-\[#/i.test(line) && !/(gate|pill|badge|tag|chip|callout|note|alert)/i.test(line)) agg.cream++; if (isClay(h)) agg.clay++; if (isAcid(h)) agg.acid++; if (isTintedBlack(h)) agg.tinted++;
    }
    if (/(zinc|neutral|stone|gray|slate)-950/.test(line)) agg.tinted++;
    if (/lime-(300|400)|#c6ff00|#ccff00|#d4ff00|#b8ff00|#39ff14/i.test(line)) agg.acid++;
    if (/@keyframes|animation:|transition:|animate-|motion\.|framer-motion|gsap/.test(line)) agg.anim++;
    if (/prefers-reduced-motion|motion-reduce|useReducedMotion|motion-safe/.test(line)) agg.reduced++;
    if (/text-center|text-align:\s*center/.test(line)) agg.center++;
  });
}
for (const r of rules) {
  const hits = counts[r.id]; if (!hits) continue;
  if (r.count && hits.length < r.count) continue;
  findings.push({ id: r.id, sev: r.sev, msg: r.msg + (r.count ? ` (${hits.length}×)` : ''), hits });
}
const P = (id, sev, msg) => { if (!allow.has(id)) findings.push({ id, sev, msg, hits: [] }); };
const rad = Object.entries(agg.radius).sort((a, b) => b[1] - a[1]); const radTotal = rad.reduce((a, [, v]) => a + v, 0);
if (radTotal >= 10 && rad[0][1] / radTotal > 0.8 && rad[0][0] !== 'rounded-none' && rad[0][0] !== '0') P('uniform-radius', 2, `One radius (${rad[0][0]}) on ${Math.round(100 * rad[0][1] / radTotal)}% of ${radTotal} elements. Radius should encode hierarchy (control < card < sheet).`);
if (agg.shadowSoft >= 6) P('soft-shadow-kit', 2, `Same soft grey shadow on ${agg.shadowSoft} elements — the SaaS-card kit. Use borders, tone steps, or one elevation scale.`);
if (agg.grid3 >= 2 && agg.iconTile >= 2) P('feature-grid', 2, `3-up icon-tile feature grid (${agg.grid3} grids, ${agg.iconTile} icon tiles). Show the product instead.`);
else if (agg.iconTile >= 3) P('icon-tile', 1, `Rounded-square icon tile above headings (${agg.iconTile}×).`);
if (agg.cream && agg.clay) P('cream-clay', 3, 'Warm cream background + terracotta accent — the #1 current AI palette.');
if (agg.acid && agg.tinted) P('acid-on-black', 2, 'Near-black + acid-green accent — a stock AI palette.');
if (agg.anim >= 3 && !agg.reduced) P('no-reduced-motion', 3, 'Animations without a prefers-reduced-motion path (a11y).');
if (agg.center >= 12) P('center-everything', 1, `${agg.center} centred text blocks. Left-align reading content; centre sparingly.`);

// ------------------------------------------------------------------ report
const sevName = { 3: 'HIGH', 2: 'MED', 1: 'LOW' };
findings.sort((a, b) => b.sev - a.sev);
const score = Math.max(0, 100 - findings.reduce((a, f) => a + [0, 3, 7, 15][f.sev], 0));
if (argv.includes('--json')) { console.log(JSON.stringify({ score, files: files.length, allow: [...allow], findings }, null, 1)); }
else {
  console.log(`slop-lint: ${files.length} files · score ${score}/100 · ${findings.length} findings${allow.size ? ' · allowed: ' + [...allow].join(',') : ''}`);
  for (const f of findings) {
    console.log(`${sevName[f.sev]} ${f.id}: ${f.msg}`);
    for (const h of f.hits.slice(0, 4)) console.log(`   ${h.file}:${h.line}  ${h.snip.trim()}`);
    if (f.hits.length > 4) console.log(`   …+${f.hits.length - 4} more`);
  }
  if (!findings.length) console.log('clean. (Static lint only — still run shoot.mjs and look at the result.)');
}
process.exit(findings.some(f => f.sev === 3) ? 1 : 0);
