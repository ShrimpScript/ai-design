import { useMemo, useRef } from 'react';
import {
  COLS,
  ROWS,
  CELL,
  coastY,
  computeDepth,
  getCells,
  riverHalf,
  riverX,
  fromGrid,
  colU,
  rowV,
  ROW_COUNT,
  COL_COUNT,
  mainCol,
  mainRow,
  isWater,
} from '../lib/city';
import { useStepProgress } from '../lib/hooks';
import './layerstack.css';

/* The square of the city shown on each layer, in world units */
const RX = 260;
const RY = 20;
const RS = 680;
const S = 300; // layer side in SVG units
const toL = (x: number, y: number) => ({ u: ((x - RX) / RS) * S, v: ((y - RY) / RS) * S });
const clampL = (n: number) => Math.max(0, Math.min(S, n));

export type LayerStep = { key: string; label: string; title: string; body: string; source: string };

type Props = { steps: LayerStep[] };

/* ---------- precomputed layer artwork ---------- */

function contourSegments(levels: number[]) {
  const c = getCells();
  const segs: Record<number, string> = {};
  const step = 2; // sample every 2 cells
  for (const L of levels) {
    let d = '';
    for (let j = 0; j < ROWS - step; j += step) {
      for (let i = 0; i < COLS - step; i += step) {
        const x0 = i * CELL;
        const y0 = j * CELL;
        if (x0 < RX || x0 > RX + RS || y0 < RY || y0 > RY + RS) continue;
        const e = (ii: number, jj: number) => (c.land[jj * COLS + ii] ? c.elev[jj * COLS + ii] : -5);
        const a = e(i, j);
        const b = e(i + step, j);
        const cc = e(i + step, j + step);
        const dd = e(i, j + step);
        const pts: [number, number][] = [];
        const s = step * CELL;
        const edge = (va: number, vb: number, xa: number, ya: number, xb: number, yb: number) => {
          if ((va < L) !== (vb < L)) {
            const t = (L - va) / (vb - va);
            pts.push([xa + (xb - xa) * t, ya + (yb - ya) * t]);
          }
        };
        edge(a, b, x0, y0, x0 + s, y0);
        edge(b, cc, x0 + s, y0, x0 + s, y0 + s);
        edge(cc, dd, x0 + s, y0 + s, x0, y0 + s);
        edge(dd, a, x0, y0 + s, x0, y0);
        for (let k = 0; k + 1 < pts.length; k += 2) {
          const p = toL(pts[k][0], pts[k][1]);
          const q = toL(pts[k + 1][0], pts[k + 1][1]);
          d += `M${p.u.toFixed(1)},${p.v.toFixed(1)}L${q.u.toFixed(1)},${q.v.toFixed(1)}`;
        }
      }
    }
    segs[L] = d;
  }
  return segs;
}

function polyPath(pts: { x: number; y: number }[]) {
  return pts
    .map((p, i) => {
      const l = toL(p.x, p.y);
      return `${i ? 'L' : 'M'}${clampL(l.u).toFixed(1)},${clampL(l.v).toFixed(1)}`;
    })
    .join('');
}

function seaPath() {
  const pts = [];
  for (let x = RX; x <= RX + RS; x += 10) pts.push({ x, y: coastY(x) });
  pts.push({ x: RX + RS, y: RY + RS }, { x: RX, y: RY + RS });
  return polyPath(pts) + 'Z';
}

function riverPath() {
  const left = [];
  const right = [];
  for (let y = RY; y <= coastY(riverX(RY + RS)) + 10; y += 10) {
    left.push({ x: riverX(y) - riverHalf(y), y });
    right.unshift({ x: riverX(y) + riverHalf(y), y });
  }
  return polyPath([...left, ...right]) + 'Z';
}

function pipePaths() {
  let minor = '';
  let major = '';
  const seg = (a: { x: number; y: number }, b: { x: number; y: number }, isMajor: boolean) => {
    const p = toL(a.x, a.y);
    const q = toL(b.x, b.y);
    if ([p.u, p.v, q.u, q.v].some((n) => n < 0 || n > S)) return;
    const d = `M${p.u.toFixed(1)},${p.v.toFixed(1)}L${q.u.toFixed(1)},${q.v.toFixed(1)}`;
    if (isMajor) major += d;
    else minor += d;
  };
  for (let r = 0; r < ROW_COUNT; r++) {
    for (let c = 0; c < COL_COUNT - 1; c++) {
      const a = fromGrid(colU(c), rowV(r));
      const b = fromGrid(colU(c + 1), rowV(r));
      if (isWater(a.x, a.y) || isWater(b.x, b.y)) continue;
      seg(a, b, mainRow(r));
    }
  }
  for (let c = 0; c < COL_COUNT; c++) {
    for (let r = 0; r < ROW_COUNT - 1; r++) {
      const a = fromGrid(colU(c), rowV(r));
      const b = fromGrid(colU(c), rowV(r + 1));
      if (isWater(a.x, a.y) || isWater(b.x, b.y)) continue;
      seg(a, b, mainCol(c));
    }
  }
  return { minor, major };
}

function depthImage(hour: number) {
  const depth = computeDepth(hour, new Float32Array(COLS * ROWS));
  const cv = document.createElement('canvas');
  const x0 = Math.floor(RX / CELL);
  const y0 = Math.floor(RY / CELL);
  const n = Math.floor(RS / CELL);
  cv.width = n;
  cv.height = n;
  const ctx = cv.getContext('2d')!;
  const img = ctx.createImageData(n, n);
  const ramp = [
    [207, 230, 238],
    [142, 195, 216],
    [74, 149, 189],
    [31, 103, 154],
    [14, 60, 105],
  ];
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      const gi = x0 + i;
      const gj = y0 + j;
      if (gi >= COLS || gj >= ROWS) continue;
      const d = depth[gj * COLS + gi];
      const o = (j * n + i) * 4;
      if (d < 0.03) continue;
      const idx = d < 0.1 ? 0 : d < 0.2 ? 1 : d < 0.4 ? 2 : d < 0.8 ? 3 : 4;
      img.data[o] = ramp[idx][0];
      img.data[o + 1] = ramp[idx][1];
      img.data[o + 2] = ramp[idx][2];
      img.data[o + 3] = 235;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL();
}

/* ---------- component ---------- */

const CX = 330;
const ISO = (y: number) => `translate(${CX} ${y}) matrix(0.866 0.5 -0.866 0.5 0 0)`;

export default function LayerStack({ steps }: Props) {
  const listRef = useRef<HTMLOListElement>(null);
  const n = steps.length;
  const t = useStepProgress(listRef);
  const active = Math.min(n - 1, Math.round(t));
  const art = useMemo(
    () => ({
      contours: contourSegments([2, 3, 4, 5, 6, 7, 8, 9]),
      sea: seaPath(),
      river: riverPath(),
      pipes: pipePaths(),
      depth: typeof document !== 'undefined' ? depthImage(41) : '',
    }),
    [],
  );

  // 5 input layers; the last step fuses them
  const fuse = Math.max(0, Math.min(1, (t - (n - 2) - 0.35) / 0.55));
  const spread = Math.max(0, Math.min(1, t));
  const gap = 64 + 40 * spread - 88 * fuse;
  const top = 88;
  const layerY = (i: number) => top + i * gap; // i=0 top (radar) .. 4 bottom (elevation)
  const stackKeys = ['radar', 'tide', 'river', 'drains', 'ground'];
  const activeKey = steps[active]?.key;

  const layerClass = (k: string) =>
    `ls-layer ${activeKey === k ? 'is-active' : ''} ${activeKey === 'model' ? 'is-fused' : ''}`;

  const plane = (fill: string, stroke = 'var(--ls-edge)') => (
    <rect x={0} y={0} width={S} height={S} fill={fill} stroke={stroke} strokeWidth={1} vectorEffect="non-scaling-stroke" />
  );

  return (
    <div className="ls-track">
      <div className="ls-viz" aria-hidden="true">
        <svg viewBox="0 0 800 820" className="ls-svg" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="rg-rain">
              <stop offset="0" stopColor="#1f679a" stopOpacity="0.9" />
              <stop offset="0.45" stopColor="#4a95bd" stopOpacity="0.65" />
              <stop offset="1" stopColor="#8ec3d8" stopOpacity="0" />
            </radialGradient>
            <clipPath id="clip-plane">
              <rect x={0} y={0} width={S} height={S} />
            </clipPath>
          </defs>

          {/* ground: elevation contours */}
          <g transform={ISO(layerY(4))} className={layerClass('ground')}>
            {plane('var(--ls-ground)')}
            <g clipPath="url(#clip-plane)">
              <path d={art.sea} fill="var(--ls-water)" />
              {Object.entries(art.contours).map(([L, d]) => (
                <path key={L} d={d} className={`ls-contour ${Number(L) % 2 === 0 ? 'is-index' : ''}`} />
              ))}
            </g>
          </g>

          {/* drains */}
          <g transform={ISO(layerY(3))} className={layerClass('drains')}>
            {plane('var(--ls-glass)')}
            <g clipPath="url(#clip-plane)">
              <path d={art.pipes.minor} className="ls-pipe" />
              <path d={art.pipes.major} className="ls-pipe is-major" />
            </g>
          </g>

          {/* river */}
          <g transform={ISO(layerY(2))} className={layerClass('river')}>
            {plane('var(--ls-glass)')}
            <g clipPath="url(#clip-plane)">
              <path d={art.river} fill="var(--ls-water-strong)" />
              {[90, 260, 420].map((y) => {
                const l = toL(riverX(y) + riverHalf(y) + 14, y);
                return <rect key={y} x={l.u - 5} y={l.v - 5} width={10} height={10} className="ls-gauge" />;
              })}
            </g>
          </g>

          {/* tide */}
          <g transform={ISO(layerY(1))} className={layerClass('tide')}>
            {plane('var(--ls-glass)')}
            <g clipPath="url(#clip-plane)">
              <path d={art.sea} fill="var(--ls-water-strong)" />
              {[300, 880].map((x) => {
                const l = toL(x, coastY(x) - 10);
                return <rect key={x} x={l.u - 5} y={l.v - 5} width={10} height={10} className="ls-gauge" />;
              })}
            </g>
          </g>

          {/* radar */}
          <g transform={ISO(layerY(0))} className={layerClass('radar')}>
            {plane('var(--ls-glass)')}
            <g clipPath="url(#clip-plane)">
              <ellipse cx={110} cy={120} rx={120} ry={70} fill="url(#rg-rain)" transform="rotate(-20 110 120)" />
              <ellipse cx={230} cy={210} rx={90} ry={55} fill="url(#rg-rain)" transform="rotate(-10 230 210)" />
              <ellipse cx={60} cy={250} rx={60} ry={40} fill="url(#rg-rain)" />
            </g>
          </g>

          {/* forecast output, appears when fused */}
          <g transform={ISO(layerY(0) - 18 * fuse)} className="ls-output" style={{ opacity: fuse }}>
            {plane('var(--ls-ground)', 'var(--ink)')}
            <g clipPath="url(#clip-plane)">
              <path d={art.sea} fill="var(--ls-water)" />
              <path d={art.river} fill="var(--ls-water)" />
              <path d={art.pipes.minor} className="ls-street" />
              <path d={art.pipes.major} className="ls-street" />
              <image href={art.depth} x={0} y={0} width={S} height={S} style={{ imageRendering: 'pixelated' }} />
            </g>
          </g>

          {/* labels at the right corner of each plane */}
          {stackKeys.map((k, i) => {
            const st = steps.find((s) => s.key === k);
            const y = layerY(i) + S * 0.5; // right corner of the rhombus
            return (
              <g key={k} className={`ls-label ${activeKey === k ? 'is-active' : ''}`} style={{ opacity: 1 - fuse }}>
                <line x1={CX + S * 0.866 + 6} x2={CX + S * 0.866 + 26} y1={y} y2={y} />
                <text x={CX + S * 0.866 + 32} y={y + 5}>{st?.label}</text>
              </g>
            );
          })}
          <g className="ls-label is-active" style={{ opacity: fuse }}>
            <text x={CX} y={layerY(0) - 18 * fuse - 14} textAnchor="middle">
              Depth for every 5 m of street, every 15 minutes
            </text>
          </g>
        </svg>
      </div>
      <ol className="ls-steps" ref={listRef}>
        {steps.map((s, i) => (
          <li key={s.key} className={`ls-step ${i === active ? 'is-active' : ''}`} aria-current={i === active ? 'step' : undefined}>
            <span className="ls-step__n num" aria-hidden="true">
              {i + 1}
            </span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <p className="ls-step__source">{s.source}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
