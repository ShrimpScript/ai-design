#!/usr/bin/env node
// Smoke tests: every script against known-good and known-bad inputs. Run from anywhere:
//   node skills/design-recon/tests/smoke.mjs [--offline]
// --offline skips tests that need the network (recon, fonts, CDN three.js).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url)), S = path.join(here, '..', 'scripts'), F = path.join(here, 'fixtures');
const tmp = mkdtempSync(path.join(tmpdir(), 'dr-smoke-')), offline = process.argv.includes('--offline');
const run = (script, args) => { const t = Date.now(); const r = spawnSync(process.execPath, [path.join(S, script), ...args], { cwd: tmp, encoding: 'utf8', timeout: 240000 }); return { code: r.status, out: (r.stdout || '') + (r.stderr || ''), ms: Date.now() - t }; };
const results = [];
const test = (name, net, fn) => { if (net && offline) return results.push(['SKIP', name, 'offline']); try { const [ok, note] = fn(); results.push([ok ? 'ok' : 'FAIL', name, note]); } catch (e) { results.push(['FAIL', name, e.message.slice(0, 120)]); } };

test('slop-lint flags the slop fixture', false, () => { const r = run('slop-lint.mjs', [F]); const n = +(r.out.match(/(\d+) findings/) || [])[1]; return [r.code === 1 && n >= 15, `${n} findings, exit ${r.code}`]; });
writeFileSync(path.join(tmp, 'clean.css'), ':root{--paper:#F5F6F3;--ink:#16211C;--ink-2:#4B5A52;--accent:#D4A72C;--accent-ink:#7A5C0E}\nbody{font-family:"Google Sans Flex",sans-serif;letter-spacing:-0.01em}\n');
test('slop-lint passes clean CSS', false, () => { const r = run('slop-lint.mjs', [path.join(tmp, 'clean.css')]); return [r.code === 0 && /0 findings/.test(r.out), r.out.split('\n')[0]]; });
test('palette flags cyberpunk', false, () => { const r = run('palette.mjs', ['bg=#0a0a12', 'text=#e0e0ff', 'accent=#00f0ff', 'accent2=#ff00c8']); return [r.code === 1 && /cyberpunk/.test(r.out), r.out.split('\n')[1]]; });
test('palette passes a clean brand', false, () => { const r = run('palette.mjs', [path.join(tmp, 'clean.css')]); return [r.code === 0 && /no awkward/.test(r.out), r.out.split('\n').at(-2)]; });
test('shoot audits a page', false, () => { const r = run('shoot.mjs', [path.join(F, 'slop.html'), '--label', 't', '--widths', '390,1440']); return [r.code === 0 && existsSync(path.join(tmp, '.design/shots/t/sheet.jpg')) && /Fonts in use/.test(r.out), `${r.ms}ms`]; });
test('inspect3d passes a threaded part', true, () => { const r = run('inspect3d.mjs', [path.join(F, '3d-good.html'), '--label', 'g']); return [r.code === 0 && /PASS tag threads ring/.test(r.out) && /PASS tag hangs/.test(r.out), r.out.split('\n').filter(l => /PASS|FAIL/.test(l)).slice(0, 2).join(' | ').slice(0, 140)]; });
test('inspect3d fails a floating part', true, () => { const r = run('inspect3d.mjs', [path.join(F, '3d-bad.html'), '--label', 'b']); return [r.code === 1 && /FAIL tag threads ring/.test(r.out), (r.out.match(/FAIL[^\n]*/) || [''])[0].slice(0, 140)]; });
test('specimen renders and tiers fonts', true, () => { const r = run('specimen.mjs', ['Google Sans Flex', 'Orbitron', '--out', 'sp.jpg']); return [r.code === 0 && /Orbitron: novelty/.test(r.out), r.out.split('\n')[0].slice(0, 100)]; });
test('recon measures a live site', true, () => { const r = run('recon.mjs', ['example.com', '--out', 'rc', '--no-mobile']); return [/✓ example\.com/.test(r.out) && existsSync(path.join(tmp, 'rc/example-com/digest.md')), `${r.ms}ms`]; });

const w = Math.max(...results.map(r => r[1].length));
for (const [s, n, note] of results) console.log(`${s.padEnd(4)} ${n.padEnd(w)}  ${note || ''}`);
const failed = results.filter(r => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} ${failed ? 'with failures' : 'passed'} · scratch: ${tmp}`);
process.exit(failed ? 1 : 0);
