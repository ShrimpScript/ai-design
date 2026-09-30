// Round 2 capture: each app in its populated state using its OWN example data
// (A: click its "example plants" button; B: ships with samples on first load).
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from '../../skills/design-recon/scripts/lib/pw.mjs';
import { serve } from '../../skills/design-recon/scripts/lib/serve.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const b = await launch();
for (const run of ['A', 'B']) {
  const s = await serve(path.join(here, run, 'out', 'index.html'));
  for (const [w, h, tag] of [[1440, 900, 'desktop'], [390, 844, 'mobile']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: w < 600 });
    const p = await ctx.newPage(); await p.goto(s.url, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
    const ex = p.getByRole('button', { name: /example|sample|demo/i }).first();
    if (await ex.isVisible().catch(() => false)) { await ex.click(); await p.waitForTimeout(600); console.log(run, tag, 'loaded its example data'); }
    await p.screenshot({ path: path.join(here, 'shots', `${run}-${tag}-populated.png`), fullPage: true });
    await ctx.close();
  }
  s.close();
}
await b.close();
