// Colour maths (sRGB ↔ OKLab/OKLCH, WCAG contrast) and the awkward-palette audit.
// Shared by palette.mjs and brandboard.mjs.
export const hexToRgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = [...h].map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const lin = (v) => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
export function oklch(hex) {
  const [r, g, b] = hexToRgb(hex).map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(A, B), H: (Math.atan2(B, A) * 180 / Math.PI + 360) % 360, A, B };
}
export const luminance = (hex) => { const [r, g, b] = hexToRgb(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const hueDiff = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const dE = (p, q) => Math.hypot(p.L - q.L, p.A - q.A, p.B - q.B);

export const roleOf = (name) =>
  /(ok|success|warn|warning|wait|pending|busy|error|danger|alert|info|critical|status)/i.test(name) ? 'status'
  : /(^|-)(d|data|chart|cat|series|dot)-|^(mon|tue|wed|thu|fri|sat|sun)$/i.test(name) ? 'data'
  : /(^|-)(bg|background|surface|paper|canvas|base|ground|sky|night|page|card|panel)(-|\d|$)/i.test(name) ? 'surface'
  : /(^|-)(text|ink|fg|foreground|star|body|heading|muted|fg2)(-|\d|$)/i.test(name) ? 'text'
  : /(line|border|rule|divider|stroke)/i.test(name) ? 'line'
  : 'accent';

// colours: [{ name, hex }] → { findings: [{sev, id, msg}], pairs }
export function auditPalette(colours) {
  const c = colours.filter(x => /^#[0-9a-f]{3,8}$/i.test(x.hex)).map(x => { const o = oklch(x.hex.slice(0, 7)); let role = x.role || roleOf(x.name || ''); if (role === 'accent' && o.C < 0.03) role = 'neutral'; return { ...x, hex: x.hex.slice(0, 7), role, ...o }; });
  const F = []; const add = (sev, id, msg) => F.push({ sev, id, msg });
  const surfaces = c.filter(x => x.role === 'surface'), texts = c.filter(x => x.role === 'text'), accents = c.filter(x => x.role === 'accent');
  const vivid = c.filter(x => x.C > 0.1 && x.role !== 'status' && x.role !== 'data');

  // Known generated looks
  if (vivid.filter(x => x.H > 270 && x.H < 330).length >= 2) add(3, 'ai-purple', 'Two or more purple/violet/indigo accents — the default "AI" palette.');
  if (c.some(x => x.H > 60 && x.H < 95 && x.C > 0.02 && x.C < 0.07 && x.L > 0.9) && c.some(x => x.H > 30 && x.H < 50 && x.C > 0.1 && x.L > 0.55 && x.L < 0.72)) add(3, 'cream-clay', 'Warm cream ground + terracotta accent.');
  const darkBg = surfaces.some(x => x.L < 0.2);
  if (darkBg && vivid.some(x => x.H > 115 && x.H < 140 && x.C > 0.18 && x.L > 0.8)) add(2, 'acid-on-black', 'Near-black + acid green.');
  if (darkBg && vivid.some(x => x.H > 185 && x.H < 215 && x.C > 0.12 && x.L > 0.75) && vivid.some(x => x.H > 320 || x.H < 10) ) add(3, 'cyberpunk', 'Dark ground + cyan + magenta: cyberpunk cliché.');
  const pastel = accents.filter(x => x.L > 0.8 && x.C > 0.05 && x.C < 0.13);
  if (pastel.length >= 4 && new Set(pastel.map(x => Math.round(x.H / 60))).size >= 4) add(2, 'pastel-rainbow', `${pastel.length} pastel accents across the wheel — reads as a template kit. Pick one hue family.`);

  // Awkward combinations
  for (const x of accents) if (x.C > 0.025 && x.C < 0.075 && x.L > 0.38 && x.L < 0.68) add(2, 'muddy', `${x.name || x.hex} ${x.hex} is muddy (low chroma mid-tone): push chroma up or move it into the neutrals.`);
  for (let i = 0; i < vivid.length; i++) for (let j = i + 1; j < vivid.length; j++) {
    const a = vivid[i], b = vivid[j];
    if (a.C > 0.12 && b.C > 0.12 && hueDiff(a.H, b.H) > 140 && Math.abs(a.L - b.L) < 0.1) add(2, 'vibrating', `${a.hex} and ${b.hex}: saturated complements at equal lightness vibrate when adjacent. Separate them in lightness (ΔL ≥ 0.25).`);
    if (a.C > 0.2 && b.C > 0.2 && a.L > 0.7 && b.L > 0.7) add(2, 'neon-pair', `${a.hex} + ${b.hex}: two neons compete. Keep one.`);
  }
  const accC = accents.filter(x => x.C > 0.06).map(x => x.C);
  if (accC.length >= 2 && Math.max(...accC) / Math.min(...accC) > 3) add(1, 'intensity-mismatch', 'Accents at very different intensities (one neon, one dull) look unrelated. Match chroma within ~2×.');
  const hues = []; for (const x of vivid) if (!hues.some(h => hueDiff(h, x.H) < 30)) hues.push(x.H);
  if (hues.length > 3) add(2, 'too-many-accents', `${hues.length} distinct saturated hues. One brand accent (+ status colours) is usually enough.`);
  const greys = c.filter(x => x.C > 0.008 && x.C < 0.04 && (x.role === 'surface' || x.role === 'text' || x.role === 'line'));
  if (greys.some(x => x.H > 30 && x.H < 110) && greys.some(x => x.H > 200 && x.H < 290)) add(1, 'grey-temperature', 'Warm and cool neutrals mixed. Tint all neutrals toward one hue (usually the accent).');
  for (let i = 0; i < c.length; i++) for (let j = i + 1; j < c.length; j++) if (dE(c[i], c[j]) < 0.015 && c[i].hex !== c[j].hex) add(1, 'near-duplicate', `${c[i].name || c[i].hex} ≈ ${c[j].name || c[j].hex} (indistinguishable) — merge tokens.`);

  // Legibility
  const pairs = [];
  for (const t of texts) for (const s of surfaces) {
    const r = contrast(t.hex, s.hex), sameSide = (t.L > 0.6) === (s.L > 0.6);
    if (sameSide) continue; // light text is meant for dark surfaces and vice versa
    pairs.push({ text: t.name || t.hex, surface: s.name || s.hex, ratio: +r.toFixed(2) });
    if (r < 4.5) add(r < 3 ? 3 : 2, 'contrast', `${t.name || t.hex} on ${s.name || s.hex}: ${r.toFixed(2)}:1 (text needs 4.5).`);
  }
  for (const a of accents) {
    if (a.name && c.some(x => x.name === `${a.name}-ink` || x.name === `${a.name}-text`)) continue; // has a text shade
    if (/-ink$|-text$/.test(a.name || '')) continue;
    const best = Math.max(...surfaces.map(s => contrast(a.hex, s.hex)), 0);
    if (surfaces.length && best < 3) add(2, 'accent-weak', `${a.name || a.hex} ${a.hex} reaches only ${best.toFixed(2)}:1 on every surface. Add a darker/lighter "-ink" shade for text and buttons.`);
  }
  if (!accents.length) add(1, 'no-accent', 'No accent colour: fine for a monochrome brand, but primary actions need another way to stand out.');
  return { findings: F.sort((a, b) => b.sev - a.sev), pairs, colours: c };
}

// Pull colour tokens out of CSS (custom properties) — the names become roles.
export function tokensFromCss(css) {
  const out = [], seen = new Set();
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)) if (!seen.has(m[1])) { seen.add(m[1]); out.push({ name: m[1], hex: m[2] }); }
  return out;
}
