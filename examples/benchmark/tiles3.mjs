#!/usr/bin/env node
// Round 3 re-capture: full-page screenshots break scroll-reveal and transition overlays (the browser is resized
// to the full height), so capture what a visitor sees instead: viewport tiles while scrolling, stitched into one image.
//   node tiles3.mjs            → shots/r3/<run>-tiles-<page>.png and <run>-mobile-tiles-home.png
import http from 'node:http'; import path from 'node:path'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch } from '../../skills/design-recon/scripts/lib/pw.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)), out = path.join(here, 'shots', 'r3'); mkdirSync(out, { recursive: true });
const T = { html: 'text/html', js: 'text/javascript', css: 'text/css', woff2: 'font/woff2', svg: 'image/svg+xml', png: 'image/png' };
const pages = { home: '#/', product: '#/product', 'how-it-works': '#/how-it-works', customers: '#/customers', pricing: '#/pricing', demo: '#/demo' };
const browser = await launch();
async function stitch(bufs, w, h, file, scale) {
  const p = await browser.newPage({ viewport: { width: Math.round(w * scale), height: 100 } });
  await p.setContent(`<body style="margin:0;background:#888">${bufs.map(b => `<img style="display:block;width:${Math.round(w * scale)}px;border-bottom:3px solid #888" src="data:image/png;base64,${b.toString('base64')}">`).join('')}</body>`);
  await p.waitForTimeout(300); await p.screenshot({ path: file, fullPage: true }); await p.close();
}
for (const run of ['E', 'F']) {
  const root = path.join(here, run, 'app', 'dist');
  const srv = http.createServer((q, r) => { let p = path.join(root, q.url.split('?')[0]); if (!existsSync(p) || statSync(p).isDirectory()) p = path.join(root, 'index.html'); r.writeHead(200, { 'content-type': T[p.split('.').pop()] || 'application/octet-stream' }); r.end(readFileSync(p)); });
  await new Promise(r => srv.listen(0, r)); const base = `http://127.0.0.1:${srv.address().port}/`;
  for (const [vw, vh, tag, list, maxTiles, scale] of [[1440, 900, 'tiles', pages, 7, 0.5], [390, 844, 'mobile-tiles', { home: '#/' }, 8, 0.6]]) {
    const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, isMobile: vw < 600, hasTouch: vw < 600 });
    const p = await ctx.newPage();
    for (const [name, route] of Object.entries(list)) {
      await p.goto(base + route, { waitUntil: 'networkidle' }); await p.waitForTimeout(2000);
      const H = await p.evaluate(() => document.documentElement.scrollHeight);
      const step = Math.max(vh, Math.ceil((H - vh) / (maxTiles - 1)));
      const bufs = [];
      for (let y = 0; y < H; y += step) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(1000); bufs.push(await p.screenshot()); if (bufs.length >= maxTiles) break; }
      await stitch(bufs, vw, vh, path.join(out, `${run}-${tag}-${name}.png`), scale);
      console.log(run, tag, name, H, bufs.length);
    }
    await ctx.close();
  }
  srv.close();
}
await browser.close();
