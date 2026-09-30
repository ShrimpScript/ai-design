/*
  A small, deterministic flood model of the fictional coastal city of Kessling.
  It is not hydraulics; it is a believable stand-in that combines the same
  five inputs Tidemark uses (rain, tide, river, drains, elevation) so every
  graphic on the site tells the same storm.
*/

export const WORLD_W = 1000;
export const WORLD_H = 700;
export const CELL = 5;
export const COLS = WORLD_W / CELL;
export const ROWS = WORLD_H / CELL;
export const HOURS = 72;
const STEPS = 4; // per hour
const N = HOURS * STEPS + 1;

/* ---------- geometry ---------- */

export const coastY = (x: number) =>
  578 + 36 * Math.sin(x / 170 + 0.6) + 14 * Math.sin(x / 57 + 1.3) - (x > 700 ? (x - 700) * 0.12 : 0);

export const riverX = (y: number) => 590 + 64 * Math.sin(y / 150 + 0.4) + 0.1 * (y - 350);
export const riverHalf = (y: number) => 9 + 13 * Math.min(1, Math.max(0, y / 560));

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeNoise(seed: number, gx: number, gy: number) {
  const r = mulberry(seed);
  const g = new Float32Array((gx + 1) * (gy + 1)).map(() => r() * 2 - 1);
  const s = (t: number) => t * t * (3 - 2 * t);
  return (u: number, v: number) => {
    // u,v in 0..1
    const x = u * gx;
    const y = v * gy;
    const x0 = Math.min(gx - 1, Math.floor(x));
    const y0 = Math.min(gy - 1, Math.floor(y));
    const fx = s(x - x0);
    const fy = s(y - y0);
    const i = (xx: number, yy: number) => g[yy * (gx + 1) + xx];
    const a = i(x0, y0) + (i(x0 + 1, y0) - i(x0, y0)) * fx;
    const b = i(x0, y0 + 1) + (i(x0 + 1, y0 + 1) - i(x0, y0 + 1)) * fx;
    return a + (b - a) * fy;
  };
}

const noiseA = makeNoise(7, 9, 7);
const noiseB = makeNoise(21, 23, 16);

/* Depressions: underpasses, old infilled creeks, the dock basin */
export const BOWLS = [
  { x: 300, y: 330, r: 55, d: 1.3, name: 'Carver Street underpass' },
  { x: 430, y: 450, r: 70, d: 1.1, name: 'Mill Creek (culverted)' },
  { x: 180, y: 470, r: 60, d: 0.9, name: 'Tanner Yard' },
  { x: 800, y: 500, r: 85, d: 0.6, name: 'East Docks' },
  { x: 720, y: 250, r: 45, d: 1.0, name: 'Station Road dip' },
  { x: 140, y: 210, r: 40, d: 0.7, name: 'Hollow Lane' },
];

function baseElevation(x: number, y: number) {
  const cy = coastY(x);
  const lf = Math.max(0, Math.min(1, (cy - y) / cy));
  let e = 1.55 + 8.5 * Math.pow(lf, 1.2);
  const dr = Math.abs(x - riverX(y));
  e -= 2.6 * Math.exp(-((dr / 115) ** 2)) * (0.1 + 0.9 * Math.min(1, lf * 1.6));
  return { e, lf, dr, cy };
}

export type Cells = {
  land: Uint8Array;
  elev: Float32Array;
  dCoast: Float32Array;
  dRiver: Float32Array;
  riverBase: Float32Array;
  pond: Float32Array;
};

let cellsCache: Cells | null = null;

export function getCells(): Cells {
  if (cellsCache) return cellsCache;
  const n = COLS * ROWS;
  const land = new Uint8Array(n);
  const elev = new Float32Array(n);
  const dCoast = new Float32Array(n);
  const dRiver = new Float32Array(n);
  const riverBase = new Float32Array(n);
  const pond = new Float32Array(n);
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const x = (i + 0.5) * CELL;
      const y = (j + 0.5) * CELL;
      const k = j * COLS + i;
      const { e, dr, cy } = baseElevation(x, y);
      const n1 = noiseA(x / WORLD_W, y / WORLD_H);
      const n2 = noiseB(x / WORLD_W, y / WORLD_H);
      let ee = e + n1 * 0.45 + n2 * 0.18;
      let bowl = 0;
      for (const b of BOWLS) {
        const w = Math.exp(-(((x - b.x) ** 2 + (y - b.y) ** 2) / (b.r * b.r)));
        ee -= b.d * w;
        bowl = Math.max(bowl, w);
      }
      const lowSpot = Math.max(0, Math.min(1, -n2 * 1.6)) * 0.35;
      elev[k] = ee;
      dCoast[k] = cy - y;
      dRiver[k] = dr;
      const ec = baseElevation(riverX(y), y).e;
      riverBase[k] = ec - 1.25;
      pond[k] = Math.max(bowl, lowSpot);
      land[k] = y < cy && dr > riverHalf(y) ? 1 : 0;
    }
  }
  cellsCache = { land, elev, dCoast, dRiver, riverBase, pond };
  return cellsCache;
}

/* ---------- forcing: the storm ---------- */

const g = (h: number, c: number, w: number) => Math.exp(-(((h - c) / w) ** 2));

export type Forcing = {
  rain: Float32Array; // mm/h
  tide: Float32Array; // m above datum, astronomical
  sea: Float32Array; // tide + surge
  river: Float32Array; // stage, m above normal
  ponding: Float32Array; // m of water drains can't carry
};

let forcingCache: Forcing | null = null;

export function getForcing(): Forcing {
  if (forcingCache) return forcingCache;
  const rain = new Float32Array(N);
  const tide = new Float32Array(N);
  const sea = new Float32Array(N);
  const river = new Float32Array(N);
  const ponding = new Float32Array(N);
  for (let s = 0; s < N; s++) {
    const h = s / STEPS;
    rain[s] = 4.5 * g(h, 21, 2.6) + 27 * g(h, 38, 3.3) + 10 * g(h, 44.5, 2.2) + 0.6 * g(h, 60, 6);
    tide[s] = 1.05 * Math.sin((2 * Math.PI * (h + 1.6)) / 12.42);
    sea[s] = tide[s] + 1.02 * g(h, 40.5, 8.5);
  }
  // river: gamma-shaped response, ~6h lag
  const K = 24 * STEPS;
  const kern = new Float32Array(K);
  let ks = 0;
  for (let k = 0; k < K; k++) {
    const t = k / STEPS;
    kern[k] = t * t * Math.exp(-t / 3);
    ks += kern[k];
  }
  for (let s = 0; s < N; s++) {
    let acc = 0;
    for (let k = 0; k < K && s - k >= 0; k++) acc += rain[s - k] * kern[k];
    river[s] = (acc / ks) * 0.21;
  }
  // drains: capacity ~9 mm/h, recover at ~5 cm/h when rain drops below
  let p = 0;
  for (let s = 0; s < N; s++) {
    const r = rain[s];
    const dt = 1 / STEPS;
    if (r > 9) p += (r - 9) * 0.0055 * dt;
    else p -= (0.05 + (9 - r) * 0.004) * dt;
    p = Math.max(0, p);
    ponding[s] = p;
  }
  forcingCache = { rain, tide, sea, river, ponding };
  return forcingCache;
}

export function sample(arr: Float32Array, h: number) {
  const s = Math.max(0, Math.min(N - 1, h * STEPS));
  const a = Math.floor(s);
  const b = Math.min(N - 1, a + 1);
  const f = s - a;
  return arr[a] + (arr[b] - arr[a]) * f;
}

/* ---------- depth field ---------- */

export function depthAt(k: number, sea: number, river: number, pondM: number, c: Cells) {
  if (!c.land[k]) return 0;
  const e = c.elev[k];
  const coastal = sea - 0.2 - 0.004 * c.dCoast[k] - e; // 20 cm quay wall freeboard
  const riverSurf = Math.max(c.riverBase[k] + 0.25 + river * 0.72, sea - 0.2 - 0.002 * c.dCoast[k]) - 0.0085 * c.dRiver[k];
  const fluvial = riverSurf - e;
  const pluvial = pondM * Math.pow(c.pond[k], 1.4) * 1.25;
  return Math.max(0, coastal, fluvial, pluvial);
}

export function computeDepth(h: number, out: Float32Array) {
  const c = getCells();
  const f = getForcing();
  const sea = sample(f.sea, h);
  const river = sample(f.river, h);
  const pondM = sample(f.ponding, h);
  for (let k = 0; k < out.length; k++) out[k] = depthAt(k, sea, river, pondM, c);
  return out;
}

export function depthSeriesAt(k: number) {
  const c = getCells();
  const f = getForcing();
  const out = new Float32Array(N);
  for (let s = 0; s < N; s++) out[s] = depthAt(k, f.sea[s], f.river[s], f.ponding[s], c);
  return out;
}

export const STEPS_PER_HOUR = STEPS;

/* ---------- streets ---------- */

export const GRID_ANGLE = (-9 * Math.PI) / 180;
const CX = 500;
const CY = 350;
const ROW_GAP = 54;
const COL_GAP = 66;

export const ROW_NAMES = [
  'Upland Road', 'Heath Street', 'Beacon Road', 'Hollow Lane', 'Ridge Street', 'Linden Avenue',
  'Harbour Avenue', 'Carver Street', 'Market Street', 'Harrow Street', 'Mill Road', 'Tanner Street',
  'Wharf Road', 'Quay Street', 'Strand', 'Sea Wall', 'Breakwater Road',
];
export const COL_NAMES = [
  'Farrow Lane', 'Ashby Lane', 'Gorse Street', 'Pilot Street', 'Nelson Row', 'Chapel Street',
  'Bridge Street', 'Ferry Lane', 'Kings Avenue', 'Rope Walk', 'Cooper Street', 'Station Road',
  'Salt Lane', 'Dock Road', 'Anchor Street', 'Lock Street', 'Brine Lane', 'Gull Street',
  'Pier Road', 'Lantern Row',
];

const cos = Math.cos(GRID_ANGLE);
const sin = Math.sin(GRID_ANGLE);

export function toGrid(x: number, y: number) {
  const dx = x - CX;
  const dy = y - CY;
  return { u: dx * cos + dy * sin, v: -dx * sin + dy * cos };
}
export function fromGrid(u: number, v: number) {
  return { x: CX + u * cos - v * sin, y: CY + u * sin + v * cos };
}

const U0 = -620;
const V0 = -420;
export const rowV = (r: number) => V0 + r * ROW_GAP;
export const colU = (c: number) => U0 + c * COL_GAP;
export const ROW_COUNT = 17;
export const COL_COUNT = 20;
export const mainRow = (r: number) => r === 6 || r === 10;
export const mainCol = (c: number) => c === 8 || c === 13;

export function isWater(x: number, y: number) {
  if (y >= coastY(x) - 4) return true;
  if (Math.abs(x - riverX(y)) < riverHalf(y) + 10) return true;
  return false;
}

export type Block = { pts: { x: number; y: number }[]; park: boolean; lots: number[] };

let blocksCache: Block[] | null = null;
export function getBlocks(): Block[] {
  if (blocksCache) return blocksCache;
  const rnd = mulberry(99);
  const blocks: Block[] = [];
  for (let r = 0; r < ROW_COUNT - 1; r++) {
    for (let c = 0; c < COL_COUNT - 1; c++) {
      const h0 = mainRow(r) ? 7 : 4.5;
      const h1 = mainRow(r + 1) ? 7 : 4.5;
      const w0 = mainCol(c) ? 7 : 4.5;
      const w1 = mainCol(c + 1) ? 7 : 4.5;
      const u0 = colU(c) + w0;
      const u1 = colU(c + 1) - w1;
      const v0 = rowV(r) + h0;
      const v1 = rowV(r + 1) - h1;
      const corners = [fromGrid(u0, v0), fromGrid(u1, v0), fromGrid(u1, v1), fromGrid(u0, v1)];
      const out = corners.some((p) => p.x < -80 || p.x > WORLD_W + 80 || p.y < -80 || p.y > WORLD_H + 80);
      if (out) continue;
      // check along edges for water
      let wet = false;
      for (let t = 0; t <= 1 && !wet; t += 0.25) {
        for (let q = 0; q < 4 && !wet; q++) {
          const a = corners[q];
          const b = corners[(q + 1) % 4];
          if (isWater(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)) wet = true;
        }
      }
      if (wet) continue;
      const lots: number[] = [];
      const nl = 1 + Math.floor(rnd() * 3);
      for (let l = 0; l < nl; l++) lots.push(0.2 + rnd() * 0.6);
      blocks.push({ pts: corners, park: rnd() < 0.07, lots });
    }
  }
  blocksCache = blocks;
  return blocks;
}

/* Street sampling for per-street maxima */
export type Street = {
  name: string;
  kind: 'row' | 'col';
  idx: number;
  cells: number[];
  samples: { x: number; y: number; k: number }[];
};
let streetsCache: Street[] | null = null;
export function getStreets(): Street[] {
  if (streetsCache) return streetsCache;
  const c = getCells();
  const list: Street[] = [];
  const add = (name: string, kind: 'row' | 'col', idx: number, pts: { x: number; y: number }[]) => {
    const cells = new Set<number>();
    const samples: Street['samples'] = [];
    for (const p of pts) {
      const i = Math.floor(p.x / CELL);
      const j = Math.floor(p.y / CELL);
      if (i < 0 || j < 0 || i >= COLS || j >= ROWS) {
        samples.push({ x: p.x, y: p.y, k: -1 });
        continue;
      }
      const k = j * COLS + i;
      // embankments and quay edges are not the street
      const ok = c.land[k] && c.dRiver[k] > riverHalf(p.y) + 16 && c.dCoast[k] > 10;
      if (ok) cells.add(k);
      samples.push({ x: p.x, y: p.y, k: ok ? k : -1 });
    }
    if (cells.size > 6) list.push({ name, kind, idx, cells: [...cells], samples });
  };
  for (let r = 0; r < ROW_COUNT; r++) {
    const pts = [];
    for (let u = colU(0); u <= colU(COL_COUNT - 1); u += 4) pts.push(fromGrid(u, rowV(r)));
    add(ROW_NAMES[r], 'row', r, pts);
  }
  for (let col = 0; col < COL_COUNT; col++) {
    const pts = [];
    for (let v = rowV(0); v <= rowV(ROW_COUNT - 1); v += 4) pts.push(fromGrid(colU(col), v));
    add(COL_NAMES[col], 'col', col, pts);
  }
  streetsCache = list;
  return list;
}

export function streetAt(x: number, y: number) {
  const { u, v } = toGrid(x, y);
  const r = Math.round((v - V0) / ROW_GAP);
  const cI = Math.round((u - U0) / COL_GAP);
  const dv = Math.abs(v - rowV(r));
  const du = Math.abs(u - colU(cI));
  const streets = getStreets();
  const pick =
    dv < du
      ? streets.find((s) => s.kind === 'row' && s.idx === r)
      : streets.find((s) => s.kind === 'col' && s.idx === cI);
  return pick?.name ?? 'Riverside path';
}

/** Max depth per street at hour h */
export function streetDepths(h: number) {
  const depth = computeDepth(h, new Float32Array(COLS * ROWS));
  return getStreets().map((s) => {
    let m = 0;
    for (const k of s.cells) if (depth[k] > m) m = depth[k];
    return { name: s.name, depth: m };
  });
}

/* ---------- time labels ---------- */

const DAYS = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const ISSUED = 'Tue 06:00';
export function clockLabel(h: number) {
  const total = 6 + Math.floor(h);
  const day = DAYS[Math.floor(total / 24)] ?? 'Fri';
  const hh = String(total % 24).padStart(2, '0');
  return `${day} ${hh}:00`;
}

/* Street max depth for every whole hour 0..72, cached */
let matrixCache: { names: string[]; depth: Float32Array[] } | null = null;
export function streetMatrix() {
  if (matrixCache) return matrixCache;
  const streets = getStreets();
  const buf = new Float32Array(COLS * ROWS);
  const depth: Float32Array[] = [];
  for (let h = 0; h <= HOURS; h++) {
    computeDepth(h, buf);
    const row = new Float32Array(streets.length);
    streets.forEach((s, i) => {
      let m = 0;
      for (const k of s.cells) if (buf[k] > m) m = buf[k];
      row[i] = m;
    });
    depth.push(row);
  }
  matrixCache = { names: streets.map((s) => s.name), depth };
  return matrixCache;
}

export type StreetEvent = { name: string; first: number; peak: number; peakHour: number };

/** Streets that cross `threshold` metres, sorted by when they first do. */
export function streetEvents(threshold: number): StreetEvent[] {
  const { names, depth } = streetMatrix();
  const out: StreetEvent[] = [];
  names.forEach((name, i) => {
    let first = -1;
    let peak = 0;
    let peakHour = 0;
    for (let h = 0; h <= HOURS; h++) {
      const d = depth[h][i];
      if (first < 0 && d >= threshold) first = h;
      if (d > peak) {
        peak = d;
        peakHour = h;
      }
    }
    if (first >= 0) out.push({ name, first, peak, peakHour });
  });
  return out.sort((a, b) => a.first - b.first || b.peak - a.peak);
}
