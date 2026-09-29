// Compose many images into one labelled JPEG so the model reads one image, not ten.
import { readFileSync } from 'node:fs';

export async function contactSheet(browser, items, out, { cols = 3, width = 1800, title = '', maxImgH = 1400 } = {}) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  const cells = items.map(({ path: p, label }) => {
    const b64 = readFileSync(p).toString('base64');
    const mime = p.endsWith('.png') ? 'image/png' : 'image/jpeg';
    return `<figure><div class="f"><img src="data:${mime};base64,${b64}"></div><figcaption>${label}</figcaption></figure>`;
  }).join('');
  await page.setContent(`<!doctype html><style>
    body{margin:0;padding:16px;background:#e9e9e6;font:13px/1.3 system-ui,sans-serif;color:#222}
    h1{font-size:15px;margin:0 0 12px}
    .g{display:grid;grid-template-columns:repeat(${cols},1fr);gap:14px;align-items:start}
    figure{margin:0;background:#fff;padding:6px;border:1px solid #ccc}
    .f{max-height:${maxImgH}px;overflow:hidden} img{width:100%;display:block}
    figcaption{padding-top:5px;font-weight:600}
  </style><h1>${title}</h1><div class="g">${cells}</div>`);
  await page.waitForTimeout(200);
  await page.screenshot({ path: out, type: 'jpeg', quality: 72, fullPage: true });
  await page.close();
}
