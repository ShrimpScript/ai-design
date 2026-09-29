#!/usr/bin/env node
// specimen: render candidate Google Fonts with YOUR headline and body copy on YOUR colours → one image.
// Choose type by looking, not by name recognition.
//
//   node specimen.mjs "Mona Sans:wdth=112" "Geologica" "Host Grotesk" --head "Your headline" --body "Your body copy"
//        [--bg #0E1628 --fg #E6ECF5] [--weight 620] [--out .design/specimen.jpg]
//
// ":wdth=112" / ":opsz=48" set variable axes for the headline. Prints each family's tier (default/saturated/novelty).
import { pathToFileURL } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { launch } from './lib/pw.mjs';
import { fontTier } from './lib/fonts.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i < 0 ? d : argv[i + 1]; };
const fams = argv.filter((a, i) => !a.startsWith('--') && !(argv[i - 1] || '').startsWith('--'));
if (!fams.length) { console.error('usage: specimen.mjs "Family[:axis=val]" … --head "…" --body "…" [--bg --fg --weight --out]'); process.exit(1); }
const head = opt('--head', 'The quick brown fox jumps over the lazy dog'), body = opt('--body', 'Body copy at reading size. 0123456789 — ¿Tabular $1,240.50?');
const bg = opt('--bg', '#ffffff'), fg = opt('--fg', '#111111'), weight = opt('--weight', '600'), out = opt('--out', '.design/specimen.jpg');

const parsed = fams.map(f => { const [name, ax] = f.split(':'); const axes = Object.fromEntries((ax || '').split(',').filter(Boolean).map(p => p.split('='))); return { name, axes }; });
const q = [...new Set(parsed.map(p => p.name))].map(n => `family=${n.replace(/ /g, '+')}:wght@300..800`).join('&');
const css = `https://fonts.googleapis.com/css2?${q}&display=swap`;
const rows = parsed.map(({ name, axes }) => {
  const vs = Object.entries(axes).map(([k, v]) => `"${k}" ${v}`).join(',');
  const t = fontTier(name);
  return `<section><small>${name}${vs ? ' · ' + vs : ''}${t ? ` · <b>${t.toUpperCase()}</b>` : ''}</small>
  <h1 style="font-family:'${name}',sans-serif;${vs ? `font-variation-settings:${vs};` : ''}">${head}</h1>
  <p style="font-family:'${name}',sans-serif">${body}</p></section>`;
}).join('');
const html = `<!doctype html><link rel="stylesheet" href="${css}"><style>body{margin:0;padding:24px;background:${bg};color:${fg};font-family:system-ui}
section{padding:14px 0;border-bottom:1px solid color-mix(in srgb,${fg} 18%,transparent)}small{font:12px ui-monospace,monospace;opacity:.7}b{color:#e0533f}
h1{margin:4px 0 0;font-size:50px;line-height:1.04;letter-spacing:-.02em;font-weight:${weight};text-wrap:balance}p{margin:8px 0 0;font-size:17px;line-height:1.5;max-width:62ch;opacity:.85;font-variant-numeric:tabular-nums}</style>${rows}`;
mkdirSync(path.dirname(out), { recursive: true });
const tmp = out.replace(/\.\w+$/, '.html'); writeFileSync(tmp, html);
const b = await launch(); const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
await p.goto(pathToFileURL(path.resolve(tmp)).href); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
const missing = await p.evaluate((names) => { const got = new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, ''))); return [...new Set(names)].filter(n => !got.has(n)); }, parsed.map(x => x.name));
await p.screenshot({ path: out, type: 'jpeg', quality: 75, fullPage: true }); await b.close();
console.log(`specimen → ${out}${missing.length ? `  (not on Google Fonts / failed: ${missing.join(', ')})` : ''}`);
parsed.forEach(({ name }) => fontTier(name) && console.log(`  ${name}: ${fontTier(name)} tier, needs a brief-specific reason`));
