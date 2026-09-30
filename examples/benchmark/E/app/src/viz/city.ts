/*
 * Kelsford: a seeded, fictional coastal city used by every Tidemark forecast graphic.
 * Streets carry a 73-step (hourly, T+0..72 h) flood-depth series computed from the
 * same five inputs the real model uses: rainfall radar, tide gauge, river level,
 * drain capacity and ground elevation. It is a toy hydrology, but a consistent one:
 * what you see on the map is always driven by those inputs.
 */

export const WORLD_W = 1000;
export const WORLD_H = 800;
export const HOURS = 72;
export const ALERT_DEPTH = 0.3; // metres: default Alerts threshold

export type Pt = { x: number; y: number };
export type Street = {
  id: number;
  name: string;
  a: Pt;
  b: Pt;
  elev: number; // m above datum
  drain: number; // 0..1 capacity
  coastal: boolean;
  riverside: boolean;
  depth: Float32Array; // HOURS + 1 values, metres
  peak: number;
  peakHour: number;
  firstAlertHour: number; // -1 if never above ALERT_DEPTH
};
export type DrainNode = { x: number; y: number; cap: number; street: number };
export type City = {
  streets: Street[];
  river: Pt[];
  coast: Pt[]; // polygon of the sea (closed)
  contours: { level: number; segs: number[] }[]; // flat [x1,y1,x2,y2,...]
  drains: DrainNode[];
  tideGauge: Pt;
  riverGauge: Pt;
  rainAt: (x: number, y: number, t: number) => number; // mm/h
  tide: (t: number) => number; // m above datum
  riverLevel: (t: number) => number; // m above normal
  elevation: (x: number, y: number) => number;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth value noise
function makeNoise(rand: () => number) {
  const N = 16;
  const g = Array.from({ length: (N + 1) * (N + 1) }, () => rand());
  const s = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const fx = Math.max(0, Math.min(N - 1.001, (((x / WORLD_W) % 1) + 1) % 1 * (N - 1)));
    const fy = Math.max(0, Math.min(N - 1.001, (((y / WORLD_H) % 1) + 1) % 1 * (N - 1)));
    const ix = Math.max(0, Math.min(N - 1, Math.floor(fx)));
    const iy = Math.max(0, Math.min(N - 1, Math.floor(fy)));
    const tx = s(fx - ix), ty = s(fy - iy);
    const v = (i: number, j: number) => g[j * (N + 1) + i];
    const a = v(ix, iy) * (1 - tx) + v(ix + 1, iy) * tx;
    const b = v(ix, iy + 1) * (1 - tx) + v(ix + 1, iy + 1) * tx;
    return a * (1 - ty) + b * ty;
  };
}

const EAST_WEST = ['Quay Street', 'Chandler Street', 'Tanner Street', 'Market Street', 'Albion Street', 'Weir Street', 'Station Road', 'Orchard Street', 'Kiln Street', 'Hope Street', 'Rope Walk', 'Friars Street', 'Upper Street', 'Beacon Street'];
const NORTH_SOUTH = ['Harbour Road', 'Ferry Lane', 'Mill Lane', 'Saltings Road', 'Brook Road', 'Culvert Lane', 'Wharf Road', 'Pilot Road', 'Custom House Lane', 'Dock Road', 'Sluice Road', 'Marsh Lane', 'Gull Lane', 'Lock Road', 'Cooper Road', 'Anchor Lane'];

function distToPolyline(p: Pt, line: Pt[]) {
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i], b = line[i + 1];
    const dx = b.x - a.x, dy = b.y - a.y;
    const l2 = dx * dx + dy * dy;
    let t = l2 ? ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2 : 0;
    t = Math.max(0, Math.min(1, t));
    const x = a.x + t * dx - p.x, y = a.y + t * dy - p.y;
    best = Math.min(best, Math.hypot(x, y));
  }
  return best;
}

export function coastY(x: number) {
  return 650 + 42 * Math.sin(x / 150 + 0.6) + 18 * Math.sin(x / 57);
}

export function buildCity(seed = 1407): City {
  const rand = mulberry32(seed);
  const noise = makeNoise(rand);

  // River from the north-west hills to the harbour
  const river: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    river.push({
      x: 90 + t * 470 + 55 * Math.sin(t * 5.2) + 20 * Math.sin(t * 13),
      y: -20 + t * (coastY(560) + 40),
    });
  }
  const coast: Pt[] = [];
  for (let x = -20; x <= WORLD_W + 20; x += 20) coast.push({ x, y: coastY(x) });
  coast.push({ x: WORLD_W + 20, y: WORLD_H + 20 }, { x: -20, y: WORLD_H + 20 });

  const elevation = (x: number, y: number) => {
    const inland = Math.max(0, (coastY(x) - y) / 650); // 0 at coast, 1 far inland
    const dr = distToPolyline({ x, y }, river);
    const valley = 5.5 * Math.exp(-(dr * dr) / (2 * 70 * 70));
    return Math.max(1.45, 1.4 + 15 * Math.pow(inland, 1.15) + 4.2 * (noise(x, y) - 0.5) + 2.2 * (noise(y * 1.7, x * 1.3) - 0.5) - valley);
  };

  // Rain: a convective band crossing west -> east, strongest around T+36 h
  const rainAt = (x: number, y: number, t: number) => {
    const I = 34 * Math.exp(-Math.pow((t - 35) / 7.5, 2)) + 5 * Math.exp(-Math.pow((t - 14) / 4, 2));
    const cx = -250 + (t / HOURS) * 1500;
    const cy = 330 + 90 * Math.sin(t / 9);
    const d2 = (x - cx) * (x - cx) * 0.55 + (y - cy) * (y - cy);
    const cell = Math.exp(-d2 / (2 * 240 * 240));
    const texture = 0.75 + 0.5 * noise((x + t * 22) % WORLD_W, (y + t * 7) % WORLD_H);
    return I * cell * texture;
  };
  // Tide: semi-diurnal (12.42 h) plus a storm surge peaking at T+40 h
  const tide = (t: number) => 1.35 * Math.sin((2 * Math.PI * (t - 1.5)) / 12.42) + 1.25 * Math.exp(-Math.pow((t - 40) / 7, 2));
  // River responds ~8 h after the rain
  const riverLevel = (t: number) => 0.2 + 2.9 * Math.exp(-Math.pow((t - 44) / 9, 2));

  // Street grid, rotated a little, jittered
  const streets: Street[] = [];
  const nodes: (Pt | null)[][] = [];
  const SP = 58, ang = (-7 * Math.PI) / 180;
  const cols = 21, rows = 16;
  const ox = -80, oy = -30;
  for (let j = 0; j < rows; j++) {
    nodes[j] = [];
    for (let i = 0; i < cols; i++) {
      const gx = ox + i * SP + (rand() - 0.5) * 14;
      const gy = oy + j * SP + (rand() - 0.5) * 14;
      const x = gx * Math.cos(ang) - gy * Math.sin(ang) + 40;
      const y = gx * Math.sin(ang) + gy * Math.cos(ang) + 60;
      const onLand = y < coastY(x) - 14;
      const inRiver = distToPolyline({ x, y }, river) < 20;
      const inside = x > -40 && x < WORLD_W + 40 && y > -40;
      // a park near the centre and a few missing blocks for character
      const park = Math.hypot(x - 690, y - 250) < 70;
      nodes[j][i] = onLand && !inRiver && inside && !park && rand() > 0.03 ? { x, y } : null;
    }
  }
  const segOk = (a: Pt, b: Pt) => {
    const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const dr = distToPolyline(m, river);
    return dr > 22 || rand() < 0.12; // occasional bridge
  };
  let id = 0;
  const add = (a: Pt, b: Pt, name: string) => {
    const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const elev = Math.min(elevation(a.x, a.y), elevation(b.x, b.y), elevation(mid.x, mid.y));
    const dCoast = coastY(mid.x) - mid.y;
    const dRiver = distToPolyline(mid, river);
    streets.push({
      id: id++, name, a, b, elev,
      drain: 0.35 + 0.6 * rand(),
      coastal: dCoast < 150,
      riverside: dRiver < 110,
      depth: new Float32Array(HOURS + 1), peak: 0, peakHour: 0, firstAlertHour: -1,
    });
  };
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const n = nodes[j][i];
      if (!n) continue;
      const r = i + 1 < cols ? nodes[j][i + 1] : null;
      const d = j + 1 < rows ? nodes[j + 1][i] : null;
      if (r && segOk(n, r)) add(n, r, EAST_WEST[j % EAST_WEST.length]);
      if (d && segOk(n, d) && !(i % 3 === 1 && rand() < 0.35)) add(n, d, NORTH_SOUTH[i % NORTH_SOUTH.length]);
    }

  // Hydrology, hour by hour
  for (const s of streets) {
    const mid = { x: (s.a.x + s.b.x) / 2, y: (s.a.y + s.b.y) / 2 };
    const low = Math.max(0.08, Math.min(1, (7.5 - s.elev) / 6.5));
    let w = 0;
    for (let t = 0; t <= HOURS; t++) {
      const r = rainAt(mid.x, mid.y, t);
      const td = tide(t);
      // tide-locked outfalls: coastal drains can't discharge at high water
      const lock = s.coastal ? Math.max(0, Math.min(1, (td - 0.4) / 1.4)) : 0;
      const capacity = s.drain * (1 - 0.8 * lock);
      w = w * (1 - 0.3 * capacity) + Math.max(0, r - 9 * capacity) * 0.0075 * low;
      let depth = w;
      if (s.coastal) depth += Math.max(0, td - s.elev) * 0.45;
      if (s.riverside) depth += Math.max(0, riverLevel(t) - (s.elev + 0.3)) * 0.4;
      if (depth > 0.6) depth = 0.6 + 0.62 * Math.tanh((depth - 0.6) / 0.62);
      s.depth[t] = depth < 0.02 ? 0 : depth;
      if (depth > s.peak) { s.peak = depth; s.peakHour = t; }
      if (s.firstAlertHour < 0 && depth >= ALERT_DEPTH) s.firstAlertHour = t;
    }
  }

  // Drain nodes (gully pots / manholes) on a subset of streets
  const drains: DrainNode[] = [];
  streets.forEach((s, i) => {
    if (i % 3 === 0) drains.push({ x: (s.a.x + s.b.x) / 2, y: (s.a.y + s.b.y) / 2, cap: s.drain, street: s.id });
  });

  // Contours by marching squares
  const GX = 60, GY = 48;
  const field: number[] = [];
  for (let j = 0; j <= GY; j++)
    for (let i = 0; i <= GX; i++) field.push(elevation((i / GX) * WORLD_W, (j / GY) * WORLD_H));
  const contours: { level: number; segs: number[] }[] = [];
  for (let level = 2; level <= 16; level += 2) {
    const segs: number[] = [];
    for (let j = 0; j < GY; j++)
      for (let i = 0; i < GX; i++) {
        const x0 = (i / GX) * WORLD_W, x1 = ((i + 1) / GX) * WORLD_W;
        const y0 = (j / GY) * WORLD_H, y1 = ((j + 1) / GY) * WORLD_H;
        const v = [field[j * (GX + 1) + i], field[j * (GX + 1) + i + 1], field[(j + 1) * (GX + 1) + i + 1], field[(j + 1) * (GX + 1) + i]];
        const P = [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
        const pts: number[] = [];
        for (let k = 0; k < 4; k++) {
          const a = v[k], b = v[(k + 1) % 4];
          if ((a < level) !== (b < level)) {
            const t = (level - a) / (b - a);
            const pa = P[k], pb = P[(k + 1) % 4];
            pts.push(pa.x + t * (pb.x - pa.x), pa.y + t * (pb.y - pa.y));
          }
        }
        if (pts.length === 4) segs.push(...pts);
        else if (pts.length === 8) segs.push(...pts);
      }
    contours.push({ level, segs });
  }

  return {
    streets, river, coast, contours, drains,
    tideGauge: { x: 820, y: coastY(820) - 8 },
    riverGauge: river[14],
    rainAt, tide, riverLevel, elevation,
  };
}

export function depthAt(s: Street, t: number) {
  const i = Math.max(0, Math.min(HOURS, Math.floor(t)));
  const j = Math.min(HOURS, i + 1);
  const f = t - i;
  return s.depth[i] * (1 - f) + s.depth[j] * f;
}

/** Forecast issue time used across the site: Tue 10 Feb 2026, 06:00 local. */
export const ISSUE = new Date(Date.UTC(2026, 1, 10, 6, 0));
export function clockLabel(t: number) {
  const d = new Date(ISSUE.getTime() + Math.round(t) * 3600_000);
  const day = d.toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' });
  const hh = String(d.getUTCHours()).padStart(2, '0');
  return `${day} ${hh}:00`;
}

let cached: City | null = null;
export function getCity() {
  if (!cached) cached = buildCity();
  return cached;
}
