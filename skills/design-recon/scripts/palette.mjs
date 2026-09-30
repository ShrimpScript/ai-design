#!/usr/bin/env node
// palette: catch awkward or generated-looking colour schemes before they ship. No dependencies.
//
//   node palette.mjs site/styles.css            # reads --custom-property: #hex tokens (names give roles)
//   node palette.mjs "bg=#0E1628" "ink=#E6ECF5" "accent=#FFB36B"
//
// Roles come from token names: bg/surface/paper… = surface, text/ink/fg… = text, line/border = line,
// ok/warn/error = status, anything else = accent. Exit 1 on HIGH findings.
import { readFileSync, existsSync } from 'node:fs';
import { auditPalette, tokensFromCss } from './lib/color.mjs';

const args = process.argv.slice(2);
let colours = [];
for (const a of args) {
  if (existsSync(a)) colours.push(...tokensFromCss(readFileSync(a, 'utf8')));
  else { const [name, hex] = a.includes('=') ? a.split('=') : ['', a]; colours.push({ name, hex }); }
}
if (!colours.length) { console.error('usage: palette.mjs <file.css|name=#hex …>'); process.exit(1); }
const { findings, pairs, colours: c } = auditPalette(colours);
const sev = { 3: 'HIGH', 2: 'MED', 1: 'LOW' };
console.log(`palette: ${c.length} colours (${['surface', 'text', 'accent', 'neutral', 'line', 'status', 'data'].map(r => `${c.filter(x => x.role === r).length} ${r}`).join(', ')})`);
for (const f of findings) console.log(`${sev[f.sev]} ${f.id}: ${f.msg}`);
if (pairs.length) console.log('contrast: ' + pairs.map(p => `${p.text}/${p.surface} ${p.ratio}`).join(' · '));
if (!findings.length) console.log('no awkward combinations found.');
process.exit(findings.some(f => f.sev === 3) ? 1 : 0);
