#!/usr/bin/env node
// board: merge every recon in a folder into one moodboard.
//   node board.mjs [.design/recon]
// Writes board.html (the user ticks what they like and copies the feedback back to you),
// board.jpg (one image for you to look at), and prints a compact comparison table.
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { launch } from './lib/pw.mjs';

const dir = process.argv[2] || '.design/recon';
const sites = readdirSync(dir).filter(d => existsSync(path.join(dir, d, 'tokens.json')))
  .map(d => ({ dir: d, ...JSON.parse(readFileSync(path.join(dir, d, 'tokens.json'), 'utf8')) }));
if (!sites.length) { console.error(`no recon in ${dir}`); process.exit(1); }

const esc = (s) => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const role = (t, k) => t.roles[k] ? `${t.roles[k].size}/${t.roles[k].lh} ${t.roles[k].weight}${t.roles[k].ls ? ' ' + t.roles[k].ls : ''}` : '—';
const traits = (s) => {
  const fam = s.type.families.slice(0, 2).map(([k]) => k).join(' + ');
  return {
    Palette: `${s.theme.pageBg} bg, text ${s.color.text[0]?.[0]}, accent ${s.color.accent[0]?.[0] || 'none'}${s.color.gradients > 5 ? ', gradients' : ''}`,
    Type: `${fam}; h1 ${role(s.type, 'h1')}; body ${role(s.type, 'body')}`,
    Density: `spacing ${s.space.top.slice(0, 5).join('/')}, body ${s.type.roles.body?.size || '?'}px, container ${s.layout.container[0]?.[0] || '?'}px`,
    Shape: `radii ${s.radii.slice(0, 3).map(([k]) => k).join(', ')}; shadows ${s.shadows.length ? s.shadows.length + ' kinds' : 'none'}; borders ${s.color.border[0]?.[0] || 'none'}`,
    Motion: `${s.motion.libs.filter(l => !/Next|Nuxt|Astro|Tailwind/.test(l)).join(', ') || 'CSS only'}; ${s.motion.durations.slice(0, 2).map(([k]) => k).join('/')} ${s.motion.easing[0]?.[0] || ''}${s.hover ? '; hover: ' + s.hover.slice(0, 80) : ''}`,
    Layout: `h1 ${s.layout.h1?.size || '?'}px ${s.layout.h1?.align || ''}; hero media ${s.layout.heroMedia.join(', ') || 'none'}; header ${s.layout.header?.position || 'none'}`,
    Voice: `h1 "${(s.copy.h1[0] || s.copy.h2[0] || '').slice(0, 60)}"; CTA "${s.copy.ctas[0] || ''}"`,
  };
};

const cards = sites.map(s => {
  const t = traits(s);
  const sw = [...s.color.bg.slice(0, 4).map(([c]) => c), ...s.color.text.slice(0, 2).map(([c]) => c), ...s.color.accent.slice(0, 2).map(([c]) => c)];
  const fam = s.type.families[0]?.[0]?.replace(/ \d+$/, '') || 'serif';
  return `<article>
  <header><h2>${esc(s.host)}</h2><a href="${esc(s.url)}">${esc(s.url)}</a></header>
  <img src="${esc(s.dir)}/desktop.jpg" alt="${esc(s.host)} first view">
  <div class="sw">${[...new Set(sw)].map(c => `<span style="background:${c}" title="${c}"></span>`).join('')}</div>
  <p class="spec" style="font-family:'${esc(fam)}',serif;background:${s.theme.pageBg};color:${s.color.text[0]?.[0] || '#000'}">${esc((s.copy.h1[0] || s.copy.h2[0] || s.title).slice(0, 60))}<small>${esc(fam)} — ${esc(t.Type)}</small></p>
  <ul>${Object.entries(t).map(([k, v]) => `<li><label><input type="checkbox" data-site="${esc(s.host)}" data-k="${k}" data-v="${esc(v)}"> <b>${k}</b> ${esc(v)}</label></li>`).join('')}</ul>
  <textarea data-site="${esc(s.host)}" placeholder="Anything you dislike here?"></textarea>
</article>`;
}).join('\n');

const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Reference board</title>
<style>
:root{--bg:#f2f1ee;--ink:#1c1c1a;--muted:#6b6a65;--line:#d6d4ce;--card:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#161615;--ink:#ecebe7;--muted:#a09e97;--line:#34332f;--card:#1f1f1d}}
*{box-sizing:border-box}body{margin:0;padding:20px 16px 90px;background:var(--bg);color:var(--ink);font:14px/1.45 system-ui,sans-serif}
h1{font-size:20px;margin:0 0 4px}p.lede{margin:0 0 18px;color:var(--muted);max-width:70ch}
main{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,420px),1fr));gap:16px}
article{background:var(--card);border:1px solid var(--line);padding:12px;display:flex;flex-direction:column;gap:10px;min-width:0}
article header{display:flex;justify-content:space-between;gap:8px;align-items:baseline}article h2{margin:0;font-size:16px}
article header a{color:var(--muted);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
img{width:100%;aspect-ratio:16/10;object-fit:cover;object-position:top;border:1px solid var(--line)}
.sw{display:flex;height:26px}.sw span{flex:1}
.spec{margin:0;padding:14px;font-size:26px;line-height:1.1}.spec small{display:block;font:12px/1.4 system-ui;opacity:.7;margin-top:8px}
ul{list-style:none;margin:0;padding:0;font-size:12.5px}li{padding:4px 0;border-top:1px solid var(--line)}
label{display:block;cursor:pointer}textarea{width:100%;min-height:44px;font:inherit;background:transparent;color:inherit;border:1px solid var(--line);padding:6px}
footer{position:fixed;left:0;right:0;bottom:0;padding:12px 16px;background:var(--card);border-top:1px solid var(--line);display:flex;gap:12px;align-items:center}
button{font:inherit;font-weight:600;padding:9px 14px;border:0;background:var(--ink);color:var(--bg);cursor:pointer}
#out{color:var(--muted);font-size:12px}
</style>
<h1>Reference board</h1>
<p class="lede">Measured from ${sites.length} live sites. Tick the traits you want in your product and add notes, then press <b>Copy feedback</b> and paste it back into the chat.</p>
<main>${cards}</main>
<footer><button id="copy">Copy feedback</button><span id="out">Nothing ticked yet</span></footer>
<script>
const text=()=>{const L=[];document.querySelectorAll('input:checked').forEach(i=>L.push('KEEP '+i.dataset.site+' '+i.dataset.k+': '+i.dataset.v));document.querySelectorAll('textarea').forEach(t=>t.value.trim()&&L.push('NOTE '+t.dataset.site+': '+t.value.trim()));return L.join('\\n')};
document.addEventListener('change',()=>{const n=document.querySelectorAll('input:checked').length;document.getElementById('out').textContent=n?n+' traits selected':'Nothing ticked yet'});
document.getElementById('copy').onclick=async()=>{const t=text()||'No preference — you choose.';try{await navigator.clipboard.writeText(t);document.getElementById('out').textContent='Copied. Paste it into the chat.'}catch{prompt('Copy this:',t)}};
</script></html>`;
const out = path.join(dir, 'board.html');
writeFileSync(out, html);

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1500, height: 900 } });
await page.goto(pathToFileURL(path.resolve(out)).href); await page.addStyleTag({ content: 'footer{display:none}' }); await page.waitForTimeout(400);
await page.screenshot({ path: path.join(dir, 'board.jpg'), type: 'jpeg', quality: 70, fullPage: true });
await browser.close();

// Compact comparison for the model.
const keys = ['Palette', 'Type', 'Density', 'Shape', 'Motion', 'Layout', 'Voice'];
console.log(`board: ${out} (for the user) · ${path.join(dir, 'board.jpg')} (for you)\n`);
console.log('| trait | ' + sites.map(s => s.host).join(' | ') + ' |\n|---|' + sites.map(() => '---|').join(''));
const T = sites.map(traits);
for (const k of keys) console.log(`| ${k} | ` + T.map(t => t[k].replace(/\|/g, '/')).join(' | ') + ' |');
