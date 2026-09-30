#!/usr/bin/env node
// doctor: check this machine can run the skill (one line per capability, with the fix).
//   node doctor.mjs
import './lib/net.mjs';
const out = [], ok = (b, name, fix) => out.push(`${b ? 'ok  ' : 'FIX '} ${name}${b ? '' : ' → ' + fix}`);
ok(+process.versions.node.split('.')[0] >= 18, `node ${process.versions.node}`, 'install Node 18+');
let pw = null;
try { pw = await import('./lib/pw.mjs'); ok(true, 'playwright'); } catch { ok(false, 'playwright', 'npm i -D playwright && npx playwright install chromium'); }
if (pw) {
  try {
    const b = await pw.launch(), p = await b.newPage();
    await p.setContent('<canvas id=c></canvas>');
    ok(true, 'chromium launches');
    ok(await p.evaluate(() => !!document.getElementById('c').getContext('webgl2')), 'WebGL in headless (3D shots, inspect3d)', 'launch flags --use-angle=swiftshader (already set in lib/pw.mjs); update Chromium');
    const net = await p.goto('https://fonts.googleapis.com/css2?family=Google+Sans+Flex', { timeout: 15000 }).then(r => r.ok()).catch(() => false);
    ok(net, 'browser reaches the web (recon, Google Fonts)', 'network/proxy: a browser TLS error means the proxy CA must be trusted by Chromium (NSS: certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n proxy -i ca.crt)');
    await b.close();
  } catch (e) { ok(false, 'chromium launches', `npx playwright install chromium (${e.message.split('\n')[0].slice(0, 80)})`); }
}
const f = await fetch('https://fonts.googleapis.com/css2?family=Inter', { signal: AbortSignal.timeout(8000) }).then(r => r.ok).catch(() => false);
ok(f, 'node fetch reaches the web (robots.txt, fetch-font)', 'set HTTPS_PROXY / NODE_EXTRA_CA_CERTS for your proxy');
console.log(out.join('\n'));
console.log(out.some(l => l.startsWith('FIX')) ? '\nSome capabilities are missing: slop-lint and palette still work offline.' : '\nAll capabilities available.');
