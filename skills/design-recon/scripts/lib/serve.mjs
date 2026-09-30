// Serve a local file/folder over http (file:// breaks fonts, CORS and ES modules), like production.
import http from 'node:http';
import path from 'node:path';
import { existsSync, statSync, readFileSync } from 'node:fs';
const TYPES = { html: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', glb: 'model/gltf-binary', gltf: 'model/gltf+json', woff2: 'font/woff2', woff: 'font/woff', ico: 'image/x-icon' };
export async function serve(target) {
  if (/^https?:/.test(target)) return { url: target, close() {} };
  const file = path.resolve(target.replace(/^file:\/\//, '')), dir = statSync(file).isDirectory();
  const root = dir ? file : path.dirname(file);
  const server = http.createServer((req, res) => {
    let p = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!p.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (existsSync(p) && statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!existsSync(p)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': TYPES[p.split('.').pop()] || 'application/octet-stream' }); res.end(readFileSync(p));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${server.address().port}/${dir ? '' : path.basename(file)}`, close: () => server.close() };
}
