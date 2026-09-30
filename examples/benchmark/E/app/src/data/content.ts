import type { InputKind } from '../viz/InputGlyph';

export const INPUTS: { kind: InputKind; name: string; spec: string; why: string }[] = [
  { kind: 'radar', name: 'Rainfall radar', spec: '1 km grid, every 5 minutes, plus the 50-member weather ensemble out to 72 h', why: 'Where and how hard the rain lands.' },
  { kind: 'tide', name: 'Tide gauges', spec: 'Harbour and estuary gauges at 1-minute resolution, astronomical tide and surge forecast', why: 'When the outfalls can’t drain to sea.' },
  { kind: 'river', name: 'River levels', spec: 'Upstream stage gauges and catchment flow, 15-minute readings', why: 'How high the river runs through town.' },
  { kind: 'drains', name: 'Drain network', spec: 'Your pipe and gully asset register: diameters, inverts, outfalls, pumps', why: 'Where the system will surcharge first.' },
  { kind: 'elevation', name: 'Ground elevation', spec: '0.5 m LiDAR terrain with kerbs, underpasses and building footprints', why: 'Where water collects once it’s on the street.' },
];

export const CUSTOMERS = [
  { name: 'Kelsford City Council', kind: 'Emergency management', since: '2024' },
  { name: 'Brackwater Water', kind: 'Water utility', since: '2025' },
  { name: 'Port of Ostrand', kind: 'Port authority', since: '2025' },
  { name: 'Norhaven County', kind: 'Emergency management', since: '2025' },
  { name: 'Severn Reach Utilities', kind: 'Water utility', since: '2026' },
  { name: 'Lyle & Marsh Underwriting', kind: 'Insurer, API', since: '2026' },
];
