#!/usr/bin/env node
// fetch-font: self-host an open-licence font (Google Fonts / Fontshare) with a ready @font-face file.
//
//   node fetch-font.mjs "Archivo:wdth,wght@62..125,100..900" [--out public/fonts] [--all-subsets]
//   node fetch-font.mjs "satoshi@400,500,700" --provider fontshare
//
// Google spec = the css2 `family=` value. Writes woff2 files + fonts.css (relative URLs) and prints
// the CSS to paste. Commercial faces seen in recon: don't fetch; use references/fonts.md alternatives.
import './lib/net.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i < 0 ? d : argv[i + 1]; };
const spec = argv.find((a, i) => !a.startsWith('--') && !/^--(out|provider)$/.test(argv[i - 1] || ''));
if (!spec) { console.error('usage: fetch-font.mjs "Family:axes@ranges" [--provider google|fontshare] [--out dir]'); process.exit(1); }
const provider = opt('--provider', 'google');
const out = opt('--out', 'public/fonts');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
const cssUrl = provider === 'fontshare'
  ? `https://api.fontshare.com/v2/css?f[]=${encodeURIComponent(spec)}&display=swap`
  : `https://fonts.googleapis.com/css2?family=${spec.replace(/ /g, '+')}&display=swap`;

const res = await fetch(cssUrl, { headers: { 'user-agent': UA } });
if (!res.ok) { console.error(`${res.status} for ${cssUrl}\nCheck the family name/axes (Google: fonts.google.com, Fontshare: fontshare.com).`); process.exit(1); }
let css = await res.text();
// Keep latin + latin-ext unless asked (most of the weight is in other subsets).
if (provider === 'google' && !argv.includes('--all-subsets') && /\/\* [\w-]+ \*\//.test(css)) {
  css = css.split(/(?=\/\* [\w-]+ \*\/)/).filter(b => /^\/\* (latin|latin-ext) \*\//.test(b)).join('');
}
// woff2 only: every current browser supports it.
css = css.replace(/src:\s*([^;]+);/g, (m, v) => { const w = v.split(/,\s*(?=url)/).find(p => /woff2/.test(p)); return w ? `src: ${w.trim()};` : m; });
mkdirSync(out, { recursive: true });
const urls = [...new Set([...css.matchAll(/url\((['"]?)([^'")]+)\1\)/g)].map(m => m[2]))];
let i = 0, bytes = 0; const names = [];
for (const u of urls) {
  const abs = u.startsWith('//') ? 'https:' + u : u;
  const fam = (css.slice(0, css.indexOf(u)).match(/font-family:\s*['"]?([^'";]+)/g) || ['x']).pop().replace(/font-family:\s*['"]?/, '');
  const ext = (abs.match(/\.(woff2?|ttf|otf)(\?|$)/) || [, 'woff2'])[1];
  const name = `${fam.toLowerCase().replace(/\s+/g, '-')}-${++i}.${ext}`;
  const buf = Buffer.from(await (await fetch(abs, { headers: { 'user-agent': UA } })).arrayBuffer());
  bytes += buf.length; names.push(name); writeFileSync(path.join(out, name), buf);
  css = css.split(u).join(`./${name}`);
}
writeFileSync(path.join(out, 'fonts.css'), css);
const fams = [...new Set([...css.matchAll(/font-family:\s*['"]?([^'";]+)/g)].map(m => m[1]))];
console.log(`✓ ${urls.length} files, ${(bytes / 1024).toFixed(0)} KB → ${out}/  (import ${out}/fonts.css)`);
console.log(`family: ${fams.join(', ')}  · licence: ${provider === 'fontshare' ? 'ITF Free Font License (free commercial use)' : 'SIL OFL / Apache (free commercial use)'}`);
if (names.length) console.log(`preload the latin file used above the fold, e.g. <link rel="preload" href="…/${names.at(-1)}" as="font" type="font/woff2" crossorigin>`);
