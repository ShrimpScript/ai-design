#!/usr/bin/env node
// inspect3d: verify a Three.js model is ASSEMBLED correctly, not just that it renders.
// Models look fine from the front and are wrong in 3D (parts floating, in front of what they should
// thread through, misaligned, interpenetrating). This checks declared constraints with geometry and
// renders the model from 6 angles, so a reviewer can see what the hero angle hides.
//
//   node inspect3d.mjs <url|file.html> [--out .design/shots/3d] [--label v1] [--poster fallback.webp]
//
// Page contract (a few lines in the page, see references/3d.md):
//   window.__inspect3d = { THREE, scene, camera, renderer, root, pause() }
//   part.userData.part = 'ring'                                     name every part
//   ring.userData.centerline = [[x,y,z], …]                         (local) wire/rod path, for threading
//   item.userData.threads = { on: 'ring', hole: [0,0,0], axis: [0,0,1], clearance: 0.17, hangs: true }   hole on a wire (+ gravity check)
//   item.userData.attach  = { to: 'base', at: [x,y,z], tol: 0.02 }                          point touches surface
//   item.userData.free = true                                        intentionally floating (skips the check)
//   window.__inspect3d.poses = { rest(){…}, 'swing +'(){…}, 'swing −'(){…} }   optional: checks run in every pose
// Exit 1 when any constraint FAILS.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { launch } from './lib/pw.mjs';
import { serve } from './lib/serve.mjs';
import { contactSheet } from './lib/sheet.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(n); return i < 0 ? d : argv[i + 1]; };
const target = argv.find((a, i) => !a.startsWith('--') && !/^--(out|label|poster)$/.test(argv[i - 1] || ''));
if (!target) { console.error('usage: inspect3d.mjs <url|file> [--out dir] [--label name]'); process.exit(1); }
const dir = path.join(opt('--out', '.design/shots/3d'), opt('--label', 'inspect'));
const POSTER = opt('--poster', null);   // write the hero view as WebP: use it as the page's static fallback
mkdirSync(dir, { recursive: true });

function inspect() {
  const I = window.__inspect3d; if (!I) return { error: 'window.__inspect3d not found: expose { THREE, scene, camera, renderer, root, pause } (references/3d.md)' };
  const { THREE, scene, camera, renderer } = I; I.pause?.();
  scene.updateMatrixWorld(true);
  const parts = {}; scene.traverse(o => { if (o.userData?.part) parts[o.userData.part] = o; });
  const V = (a) => new THREE.Vector3(...a);
  const out = { parts: Object.keys(parts), checks: [], warnings: [], views: [] };

  // World-space sample points of a part's meshes (vertices), for surface distance.
  const samples = (o, max = 6000) => { const pts = []; o.traverse(m => { if (!m.isMesh) return; const p = m.geometry.attributes.position, step = Math.max(1, Math.floor(p.count / max)); for (let i = 0; i < p.count; i += step) pts.push(new THREE.Vector3().fromBufferAttribute(p, i).applyMatrix4(m.matrixWorld)); }); return pts; };
  const nearest = (pts, q) => { let d = Infinity, idx = -1; pts.forEach((p, i) => { const e = p.distanceToSquared(q); if (e < d) { d = e; idx = i; } }); return { d: Math.sqrt(d), idx }; };

  // Run every check in every declared pose (animated parts must be checked at their motion extremes).
  const poses = Object.entries(I.poses || { rest: () => {} });
  for (const [pose, apply] of poses) {
    apply(); scene.updateMatrixWorld(true);
    const tag = poses.length > 1 ? ` [${pose}]` : '';
    const pass = (ok, name, detail) => out.checks.push({ ok, name: name + tag, detail });
    for (const [name, o] of Object.entries(parts)) {
      const t = o.userData.threads;
      if (t) {
        const wire = parts[t.on]; if (!wire?.userData.centerline) { pass(false, `${name} threads ${t.on}`, `${t.on} has no userData.centerline`); continue; }
        const cl = wire.userData.centerline.map(p => V(p).applyMatrix4(wire.matrixWorld));
        const hole = V(t.hole || [0, 0, 0]).applyMatrix4(o.matrixWorld);
        const axis = V(t.axis || [0, 0, 1]).transformDirection(o.matrixWorld);
        const { d, idx } = nearest(cl, hole);
        const tan = cl[(idx + 1) % cl.length].clone().sub(cl[(idx - 1 + cl.length) % cl.length]).normalize();
        const align = Math.abs(axis.dot(tan)), clear = t.clearance ?? 0.1;
        const ok = d <= clear * 0.6 && align >= 0.85;
        pass(ok, `${name} threads ${t.on}`, `hole centre ${d.toFixed(3)} from wire (max ${(clear * 0.6).toFixed(3)}), hole axis ∥ wire ${align.toFixed(2)} (min 0.85)${ok ? '' : d > clear * 0.6 ? ' → the part is NOT on the wire (floating or in front of it)' : ' → the hole is turned sideways to the wire'}`);
        if (t.hangs !== false) {                          // gravity: a hanging part's centre of mass sits straight below its hole
          const com = new THREE.Box3().setFromObject(o, true).getCenter(new THREE.Vector3()), v = com.sub(hole);
          const tilt = v.length() < 1e-6 ? 0 : v.angleTo(new THREE.Vector3(0, -1, 0)) * 180 / Math.PI, max = t.hangTol ?? 12;
          pass(tilt <= max, `${name} hangs under gravity`, `centre of mass ${tilt.toFixed(1)}° from straight below the hole (max ${max}°)${tilt > max ? ' → it would swing down; parts on a ring hang vertically and gather at the lowest point' : ''}`);
        }
      }
      const a = o.userData.attach;
      if (a) {
        const tgt = parts[a.to]; if (!tgt) { pass(false, `${name} attaches to ${a.to}`, 'target part missing'); continue; }
        const pt = V(a.at || [0, 0, 0]).applyMatrix4(o.matrixWorld), { d } = nearest(samples(tgt), pt), tol = a.tol ?? 0.03;
        pass(d <= tol, `${name} attaches to ${a.to}`, `contact point ${d.toFixed(3)} from surface (tol ${tol})${d > tol ? ' → floating gap' : ''}`);
      }
    }
    // Undeclared floating (bounding boxes).
    const boxes = Object.entries(parts).map(([n, o]) => [n, new THREE.Box3().setFromObject(o, true), o]);
    for (const [n, b, o] of boxes) {
      if (o.userData.free || o.userData.threads || o.userData.attach) continue;
      const touching = boxes.some(([m, c]) => m !== n && b.clone().expandByScalar(0.01).intersectsBox(c));
      if (!touching && boxes.length > 1 && !boxes.some(([m, , p]) => m !== n && (p.userData.threads?.on === n || p.userData.attach?.to === n))) out.warnings.push(`${n}: touches nothing and nothing hangs from it — floating? (set userData.free if intended)`);
    }
    // Interpenetration: for parts whose boxes overlap, sample A's vertices and ray-cast against B's closed
    // meshes (odd hit count = inside). Labels/decals (transparent or flat) are ignored.
    const solid = (o) => { const ms = []; o.traverse(m => { if (m.isMesh && !m.material.transparent && m.geometry.type !== 'PlaneGeometry') ms.push(m); }); return ms; };
    const inside = (p, meshes, dir) => { const rc = new THREE.Raycaster(p, dir); const sides = meshes.map(m => [m, m.material.side]); meshes.forEach(m => m.material.side = THREE.DoubleSide); const hits = rc.intersectObjects(meshes, false); sides.forEach(([m, sd]) => m.material.side = sd); const uniq = []; for (const h of hits) if (!uniq.some(u => Math.abs(u - h.distance) < 1e-4)) uniq.push(h.distance); return uniq.length % 2 === 1; };
    for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
      const [n1, b1, o1] = boxes[i], [n2, b2, o2] = boxes[j];
      if (!b1.intersectsBox(b2)) continue;
      const threaded = o1.userData.threads?.on === n2 || o2.userData.threads?.on === n1;
      for (const [nA, oA, nB, oB] of [[n1, o1, n2, o2], [n2, o2, n1, o1]]) {
        const target = solid(oB); if (!target.length) continue;
        const pts = []; for (const m of solid(oA)) { const p = m.geometry.attributes.position, step = Math.max(1, Math.floor(p.count / 700)); for (let k = 0; k < p.count; k += step) pts.push(new THREE.Vector3().fromBufferAttribute(p, k).applyMatrix4(m.matrixWorld)); }
        const bb = new THREE.Box3().setFromObject(oB, true), cand = pts.filter(p => bb.containsPoint(p));
        let n = 0; for (const p of cand) if (inside(p, target, new THREE.Vector3(0.577, 0.577, 0.577)) && inside(p, target, new THREE.Vector3(-0.3, 0.9, -0.3))) n++;
        const frac = n / Math.max(1, pts.length);
        if (frac > 0.005) pass(false, `${nA} clear of ${nB}`, `${Math.round(frac * 1000) / 10}% of ${nA}'s surface is inside ${nB}${threaded ? ' (threaded parts must pass through the hole, not the body; if the hole looks open, it may not be cut: e.g. absarc(…, 0, 6.283) instead of Math.PI * 2 makes a sliver, not a circle)' : ''} → parts pass through each other`);
        else if (cand.length) out.checks.push({ ok: true, name: `${nA} clear of ${nB}` + tag, detail: `0 of ${cand.length} nearby surface points inside` });
      }
    }

  }
  out.warnings = [...new Set(out.warnings)];
  (I.poses?.rest || (() => {}))(); scene.updateMatrixWorld(true);
  // Orbit views around the model.
  const box = new THREE.Box3().setFromObject(I.root || scene, true), c = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()).length();
  const saved = { pos: camera.position.clone(), q: camera.quaternion.clone(), aspect: camera.aspect };
  const dist = size / (2 * Math.tan((camera.fov * Math.PI / 180) / 2)) * 1.15;
  const w = renderer.domElement.width, h = renderer.domElement.height;
  for (const [label, az, el] of [['front', 0, 8], ['3/4 right', 45, 15], ['right side', 90, 5], ['back', 180, 8], ['top', 0, 80], ['below', 30, -35]]) {
    const A = az * Math.PI / 180, E = el * Math.PI / 180;
    camera.position.set(c.x + dist * Math.cos(E) * Math.sin(A), c.y + dist * Math.sin(E), c.z + dist * Math.cos(E) * Math.cos(A));
    camera.lookAt(c); camera.updateMatrixWorld(); renderer.render(scene, camera);
    out.views.push({ label, png: renderer.domElement.toDataURL('image/png') });
  }
  // X-ray view: everything hung on a wire goes translucent so reviewers can SEE the wire pass through each hole.
  const wires = new Set(Object.values(parts).map(o => o.userData.threads?.on).filter(Boolean)), mats = [];
  for (const [n, o] of Object.entries(parts)) if (!wires.has(n)) o.traverse(m => { if (m.isMesh) { mats.push([m, m.material]); m.material = m.material.clone(); m.material.transparent = true; m.material.opacity = 0.28; m.material.depthWrite = false; } });
  if (mats.length && wires.size) {
    // Look perpendicular to the average hole axis, so the wire runs sideways through every translucent part.
    const avg = new THREE.Vector3(); for (const o of Object.values(parts)) { const t = o.userData.threads; if (t) { const a = V(t.axis || [0, 0, 1]).transformDirection(o.matrixWorld); if (avg.dot(a) < 0) a.negate(); avg.add(a); } }
    avg.y = 0; if (avg.lengthSq() < 1e-6) avg.set(1, 0, 0); avg.normalize();
    const side = new THREE.Vector3(-avg.z, 0, avg.x); if (side.dot(saved.pos.clone().sub(c)) < 0) side.negate();
    camera.position.copy(c).addScaledVector(side, dist * 0.98).add(new THREE.Vector3(0, dist * 0.18, 0));
    camera.lookAt(c); camera.updateMatrixWorld(); renderer.render(scene, camera);
    out.views.push({ label: 'x-ray (parts translucent, wire solid)', png: renderer.domElement.toDataURL('image/png') });
  }
  for (const [m, mat] of mats) m.material = mat;
  camera.position.copy(saved.pos); camera.quaternion.copy(saved.q); renderer.render(scene, camera);
  out.poster = renderer.domElement.toDataURL('image/webp', 0.86);   // hero view of the verified model → static fallback
  out.size = [w, h];
  return out;
}

const served = await serve(target);
const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.goto(served.url + (served.url.includes('?') ? '&' : '?') + 'inspect3d', { waitUntil: 'networkidle', timeout: 45000 }).catch(e => errors.push(e.message));
await page.waitForFunction(() => window.__inspect3d, null, { timeout: 15000 }).catch(() => {});
await page.waitForTimeout(600);
const r = await page.evaluate(inspect);
if (r.error) { console.log(r.error); await browser.close(); served.close(); process.exit(1); }
const shots = [];
if (POSTER && r.poster) writeFileSync(POSTER, Buffer.from(r.poster.split(',')[1], 'base64'));
for (const [i, v] of r.views.entries()) { const p = path.join(dir, `view-${i}.png`); writeFileSync(p, Buffer.from(v.png.split(',')[1], 'base64')); shots.push({ path: p, label: v.label }); }
await contactSheet(browser, shots, path.join(dir, 'views.jpg'), { cols: 4, width: 2000, title: `${target} — ${shots.length} views (check every attachment from every side; x-ray shows the wire through each hole)` });
await browser.close(); served.close();

const fails = r.checks.filter(c => !c.ok);
const report = [`# inspect3d ${target}`, `Parts: ${r.parts.join(', ') || '— (name parts with userData.part)'}`, '',
  ...(r.checks.length <= 12 ? r.checks.map(c => `${c.ok ? 'PASS' : 'FAIL'} ${c.name}: ${c.detail}`) : [...fails.map(c => `FAIL ${c.name}: ${c.detail}`), `PASS ${r.checks.length - fails.length} of ${r.checks.length} checks${fails.length ? '' : ' (threading, attachment, clearance)'}`, ...r.checks.filter(c => c.ok && /threads|attaches/.test(c.name) && !/\[/.test(c.name)).map(c => `  ${c.name}: ${c.detail}`)]),
  ...(r.checks.length ? [] : ['No constraints declared: add userData.threads / attach so assembly can be verified.']),
  ...r.warnings.map(w => `WARN ${w}`), ...errors.map(e => `PAGE ERROR ${e.slice(0, 140)}`),
  '', `Views: ${path.join(dir, 'views.jpg')} — now cross-review (references/3d.md § Review protocol).`].join('\n');
writeFileSync(path.join(dir, 'report.md'), report);
console.log(report);
process.exit(fails.length ? 1 : 0);
