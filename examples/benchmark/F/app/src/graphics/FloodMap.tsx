import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BOWLS,
  CELL,
  COLS,
  ROWS,
  WORLD_H,
  WORLD_W,
  clockLabel,
  coastY,
  computeDepth,
  depthSeriesAt,
  getBlocks,
  getCells,
  getForcing,
  getStreets,
  riverHalf,
  riverX,
  sample,
  streetAt,
  STEPS_PER_HOUR,
} from '../lib/city';
import './floodmap.css';

type Props = {
  hour: number;
  label: string;
  interactive?: boolean;
  showRain?: boolean;
  threshold?: number | null;
  focus?: { x: number; y: number };
  className?: string;
};

type Probe = {
  sx: number;
  sy: number;
  street: string;
  depth: number;
  peak: number;
  peakHour: number;
  dry: boolean;
};

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

/* depth (m) -> rgba, 128 steps up to 1.28 m */
const STOPS: [number, number[], number][] = [
  [0.03, hex('#cfe6ee'), 0.0],
  [0.06, hex('#bcdcea'), 0.8],
  [0.15, hex('#8ec3d8'), 0.88],
  [0.3, hex('#4a95bd'), 0.92],
  [0.6, hex('#1f679a'), 0.94],
  [1.0, hex('#0e3c69'), 0.96],
];
const LUT = (() => {
  const lut = new Uint8ClampedArray(129 * 4);
  for (let i = 0; i <= 128; i++) {
    const d = i / 100;
    let a = STOPS[0];
    let b = STOPS[STOPS.length - 1];
    for (let s = 0; s < STOPS.length - 1; s++) {
      if (d >= STOPS[s][0] && d <= STOPS[s + 1][0]) {
        a = STOPS[s];
        b = STOPS[s + 1];
        break;
      }
    }
    if (d > STOPS[STOPS.length - 1][0]) a = b;
    const t = b[0] === a[0] ? 1 : Math.min(1, Math.max(0, (d - a[0]) / (b[0] - a[0])));
    const alpha = d < 0.03 ? 0 : a[2] + (b[2] - a[2]) * t;
    for (let c = 0; c < 3; c++) lut[i * 4 + c] = a[1][c] + (b[1][c] - a[1][c]) * t;
    lut[i * 4 + 3] = alpha * 255;
  }
  return lut;
})();

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas');
  c.width = Math.max(1, w);
  c.height = Math.max(1, h);
  return c;
}

export default function FloodMap({ hour, label, interactive = false, showRain = true, threshold = 0.3, focus, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = useRef({
    w: 0,
    h: 0,
    dpr: 1,
    s: 1,
    ox: 0,
    oy: 0,
    base: null as HTMLCanvasElement | null,
    top: null as HTMLCanvasElement | null,
    wb: null as HTMLCanvasElement | null,
    water: null as HTMLCanvasElement | null,
    rain: null as HTMLCanvasElement | null,
    rainPattern: null as HTMLCanvasElement | null,
    depth: new Float32Array(COLS * ROWS),
    img: null as ImageData | null,
    raf: 0,
    hour,
    probeWorld: null as { x: number; y: number } | null,
  });
  const [probe, setProbe] = useState<Probe | null>(null);
  const [ready, setReady] = useState(false);

  const fx = focus?.x ?? 560;
  const fy = focus?.y ?? 380;

  /* ---------- static layers ---------- */
  const buildStatic = useCallback(() => {
    const st = state.current;
    const W = Math.round(st.w * st.dpr);
    const H = Math.round(st.h * st.dpr);
    const base = makeCanvas(W, H);
    const top = makeCanvas(W, H);
    const b = base.getContext('2d')!;
    const t = top.getContext('2d')!;
    const k = st.s * st.dpr;
    const tx = (x: number) => (x * st.s + st.ox) * st.dpr;
    const ty = (y: number) => (y * st.s + st.oy) * st.dpr;

    // land
    b.fillStyle = '#f7f9f8';
    b.fillRect(0, 0, W, H);

    // open water sits above the flood layer so coast and banks stay crisp
    const wb = makeCanvas(W, H);
    const w2 = wb.getContext('2d')!;
    {
    const b = w2;
    // sea
    b.fillStyle = '#bfd6e0';
    b.beginPath();
    b.moveTo(tx(-100), ty(WORLD_H + 100));
    for (let x = -100; x <= WORLD_W + 100; x += 6) b.lineTo(tx(x), ty(coastY(x)));
    b.lineTo(tx(WORLD_W + 100), ty(WORLD_H + 100));
    b.closePath();
    b.fill();

    // chart soundings: offset coast lines
    b.strokeStyle = 'rgba(15,36,54,0.13)';
    b.lineWidth = Math.max(1, 0.8 * st.dpr);
    for (const off of [18, 44, 80]) {
      b.setLineDash(off === 80 ? [4 * st.dpr, 4 * st.dpr] : []);
      b.beginPath();
      for (let x = -100; x <= WORLD_W + 100; x += 6) {
        const y = coastY(x) + off + Math.sin(x / 40 + off) * 3;
        if (x === -100) b.moveTo(tx(x), ty(y));
        else b.lineTo(tx(x), ty(y));
      }
      b.stroke();
    }
    b.setLineDash([]);

    // river
    b.fillStyle = '#bfd6e0';
    b.beginPath();
    const ys: number[] = [];
    for (let y = -40; y <= WORLD_H; y += 6) ys.push(y);
    ys.forEach((y, i) => {
      const x = riverX(y) - riverHalf(y);
      if (i === 0) b.moveTo(tx(x), ty(y));
      else b.lineTo(tx(x), ty(y));
    });
    for (let i = ys.length - 1; i >= 0; i--) b.lineTo(tx(riverX(ys[i]) + riverHalf(ys[i])), ty(ys[i]));
    b.closePath();
    b.fill();
    }

    // blocks
    for (const blk of getBlocks()) {
      t.fillStyle = blk.park ? '#cfdccd' : '#d9e0dd';
      t.beginPath();
      blk.pts.forEach((p, i) => (i ? t.lineTo(tx(p.x), ty(p.y)) : t.moveTo(tx(p.x), ty(p.y))));
      t.closePath();
      t.fill();
      if (!blk.park && k > 0.45) {
        t.strokeStyle = 'rgba(247,249,248,0.9)';
        t.lineWidth = Math.max(1, 0.9 * st.dpr);
        const [p0, p1, p2, p3] = blk.pts;
        for (const f of blk.lots) {
          t.beginPath();
          t.moveTo(tx(p0.x + (p1.x - p0.x) * f), ty(p0.y + (p1.y - p0.y) * f));
          t.lineTo(tx(p3.x + (p2.x - p3.x) * f), ty(p3.y + (p2.y - p3.y) * f));
          t.stroke();
        }
      }
    }

    // labels
    const fontPx = Math.max(10, Math.min(13, 12 * st.s * 1.1));
    t.fillStyle = 'rgba(15,36,54,0.62)';
    t.font = `italic 500 ${fontPx * st.dpr}px 'Archivo Variable', sans-serif`;
    t.textAlign = 'center';
    t.fillText('Aske River', tx(riverX(120) + 58), ty(120));
    t.fillText('Kessling Harbour', tx(520), ty(668));
    t.font = `600 ${fontPx * 0.95 * st.dpr}px 'Archivo Variable', sans-serif`;
    t.fillStyle = 'rgba(15,36,54,0.5)';
    t.fillText('Old Town', tx(300), ty(250));
    t.fillText('East Docks', tx(820), ty(455));

    st.base = base;
    st.top = top;
    st.wb = wb;
    if (!st.water) {
      st.water = makeCanvas(COLS, ROWS);
      st.img = st.water.getContext('2d')!.createImageData(COLS, ROWS);
    }
    st.rain = makeCanvas(W, H);
    // rain hatch pattern
    const pat = makeCanvas(10 * st.dpr, 10 * st.dpr);
    const pc = pat.getContext('2d')!;
    pc.strokeStyle = 'rgba(15,36,54,0.42)';
    pc.lineWidth = 1 * st.dpr;
    pc.beginPath();
    pc.moveTo(0, 10 * st.dpr);
    pc.lineTo(10 * st.dpr, 0);
    pc.stroke();
    st.rainPattern = pat;
  }, []);

  /* ---------- per frame ---------- */
  const draw = useCallback(() => {
    const st = state.current;
    st.raf = 0;
    const cv = canvasRef.current;
    if (!cv || !st.base || !st.top || !st.water || !st.img) return;
    const ctx = cv.getContext('2d')!;
    const h = st.hour;
    const W = cv.width;
    const H = cv.height;
    const tx = (x: number) => (x * st.s + st.ox) * st.dpr;
    const ty = (y: number) => (y * st.s + st.oy) * st.dpr;

    ctx.drawImage(st.base, 0, 0);

    // water
    const depth = computeDepth(h, st.depth);
    const data = st.img.data;
    for (let i = 0; i < depth.length; i++) {
      const d = Math.min(128, Math.round(depth[i] * 100)) * 4;
      data[i * 4] = LUT[d];
      data[i * 4 + 1] = LUT[d + 1];
      data[i * 4 + 2] = LUT[d + 2];
      data[i * 4 + 3] = LUT[d + 3];
    }
    st.water.getContext('2d')!.putImageData(st.img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(st.water, tx(0), ty(0), COLS * CELL * st.s * st.dpr, ROWS * CELL * st.s * st.dpr);

    ctx.globalAlpha = 0.8;
    ctx.drawImage(st.top, 0, 0);
    ctx.globalAlpha = 1;
    if (st.wb) ctx.drawImage(st.wb, 0, 0);

    // streets over threshold
    if (threshold != null) {
      ctx.strokeStyle = '#c9362c';
      ctx.lineWidth = Math.max(1.5, 2.2 * st.s) * st.dpr;
      ctx.lineCap = 'round';
      for (const s of getStreets()) {
        let open = false;
        ctx.beginPath();
        for (const p of s.samples) {
          const over = p.k >= 0 && depth[p.k] >= threshold;
          if (over) {
            if (!open) ctx.moveTo(tx(p.x), ty(p.y));
            else ctx.lineTo(tx(p.x), ty(p.y));
            open = true;
          } else open = false;
        }
        ctx.stroke();
      }
    }

    // rain radar
    if (showRain && st.rain && st.rainPattern) {
      const f = getForcing();
      const r = sample(f.rain, h);
      if (r > 1.2) {
        const rc = st.rain.getContext('2d')!;
        rc.globalCompositeOperation = 'source-over';
        rc.clearRect(0, 0, W, H);
        const cells = [
          { c: 21, w: 2.6, dy: 260, size: 220 },
          { c: 38, w: 3.3, dy: 320, size: 330 },
          { c: 44.5, w: 2.2, dy: 430, size: 240 },
        ];
        for (const cell of cells) {
          const k = Math.exp(-(((h - cell.c) / cell.w) ** 2));
          if (k < 0.05) continue;
          const x = WORLD_W / 2 + ((h - cell.c) / (cell.w * 2.2)) * WORLD_W * 0.7;
          const y = cell.dy + Math.sin(h / 3) * 30;
          const R = cell.size * st.s * st.dpr;
          const grad = rc.createRadialGradient(tx(x), ty(y), 0, tx(x), ty(y), R);
          grad.addColorStop(0, `rgba(0,0,0,${0.55 * k})`);
          grad.addColorStop(0.55, `rgba(0,0,0,${0.3 * k})`);
          grad.addColorStop(1, 'rgba(0,0,0,0)');
          rc.fillStyle = grad;
          rc.beginPath();
          rc.ellipse(tx(x), ty(y), R, R * 0.62, -0.3, 0, Math.PI * 2);
          rc.fill();
        }
        rc.globalCompositeOperation = 'source-in';
        const pattern = rc.createPattern(st.rainPattern, 'repeat')!;
        const drift = (h * 60 * st.dpr) % (10 * st.dpr);
        pattern.setTransform(new DOMMatrix().translate(-drift, drift * 2));
        rc.fillStyle = pattern;
        rc.fillRect(0, 0, W, H);
        ctx.globalAlpha = Math.min(0.85, r / 14);
        ctx.drawImage(st.rain, 0, 0);
        ctx.globalAlpha = 1;
      }
    }

    // gauges
    const gauges = [
      { x: 250, y: coastY(250) - 6 },
      { x: 880, y: coastY(880) - 6 },
      { x: riverX(90) + riverHalf(90) + 6, y: 90 },
      { x: riverX(420) - riverHalf(420) - 6, y: 420 },
    ];
    for (const gg of gauges) {
      ctx.fillStyle = '#0f2436';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2 * st.dpr;
      ctx.beginPath();
      ctx.rect(tx(gg.x) - 4 * st.dpr, ty(gg.y) - 4 * st.dpr, 8 * st.dpr, 8 * st.dpr);
      ctx.fill();
      ctx.stroke();
    }

    // probe
    if (st.probeWorld) {
      const px = tx(st.probeWorld.x);
      const py = ty(st.probeWorld.y);
      ctx.strokeStyle = '#0f2436';
      ctx.lineWidth = 1 * st.dpr;
      ctx.setLineDash([3 * st.dpr, 3 * st.dpr]);
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, H);
      ctx.moveTo(0, py);
      ctx.lineTo(W, py);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f5c518';
      ctx.strokeStyle = '#0f2436';
      ctx.lineWidth = 2 * st.dpr;
      ctx.beginPath();
      ctx.arc(px, py, 6 * st.dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }, [showRain, threshold]);

  const schedule = useCallback(() => {
    const st = state.current;
    if (!st.raf) st.raf = requestAnimationFrame(draw);
  }, [draw]);

  /* ---------- sizing ---------- */
  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
    if (!wrap || !cv) return;
    getCells();
    getBlocks();
    getStreets();
    const resize = () => {
      const st = state.current;
      const r = wrap.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      st.w = r.width;
      st.h = r.height;
      st.dpr = Math.min(2, window.devicePixelRatio || 1);
      st.s = Math.max(r.width / WORLD_W, r.height / WORLD_H);
      const vw = r.width / st.s;
      const vh = r.height / st.s;
      const cx = Math.min(WORLD_W - vw / 2, Math.max(vw / 2, fx));
      const cy = Math.min(WORLD_H - vh / 2, Math.max(vh / 2, fy));
      st.ox = r.width / 2 - cx * st.s;
      st.oy = r.height / 2 - cy * st.s;
      cv.width = Math.round(r.width * st.dpr);
      cv.height = Math.round(r.height * st.dpr);
      buildStatic();
      draw();
      setReady(true);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    document.fonts?.ready.then(() => {
      buildStatic();
      schedule();
    });
    return () => {
      ro.disconnect();
      const st = state.current;
      if (st.raf) cancelAnimationFrame(st.raf);
      st.raf = 0;
    };
  }, [buildStatic, draw, schedule, fx, fy]);

  useEffect(() => {
    state.current.hour = hour;
    schedule();
  }, [hour, schedule]);

  /* ---------- probe ---------- */
  const updateProbe = useCallback((clientX: number, clientY: number) => {
    const st = state.current;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const sx = clientX - r.left;
    const sy = clientY - r.top;
    const x = (sx - st.ox) / st.s;
    const y = (sy - st.oy) / st.s;
    const i = Math.floor(x / CELL);
    const j = Math.floor(y / CELL);
    if (i < 0 || j < 0 || i >= COLS || j >= ROWS) return;
    const k = j * COLS + i;
    const c = getCells();
    st.probeWorld = { x, y };
    if (!c.land[k]) {
      setProbe({ sx, sy, street: y > coastY(x) - 6 ? 'Kessling Harbour' : 'Aske River', depth: 0, peak: 0, peakHour: 0, dry: true });
      schedule();
      return;
    }
    const series = depthSeriesAt(k);
    let peak = 0;
    let peakS = 0;
    series.forEach((d, s) => {
      if (d > peak) {
        peak = d;
        peakS = s;
      }
    });
    const near = BOWLS.find((b) => (b.x - x) ** 2 + (b.y - y) ** 2 < (b.r * 0.6) ** 2);
    setProbe({
      sx,
      sy,
      street: near ? near.name : streetAt(x, y),
      depth: st.depth[k],
      peak,
      peakHour: peakS / STEPS_PER_HOUR,
      dry: false,
    });
    schedule();
  }, [schedule]);

  // keep probe readout in sync while time moves
  useEffect(() => {
    if (!probe || probe.dry) return;
    const st = state.current;
    if (!st.probeWorld) return;
    const i = Math.floor(st.probeWorld.x / CELL);
    const j = Math.floor(st.probeWorld.y / CELL);
    const k = j * COLS + i;
    const d = computeDepth(hour, new Float32Array(COLS * ROWS))[k];
    setProbe((p) => (p ? { ...p, depth: d } : p));
  }, [hour]);

  const clearProbe = () => {
    state.current.probeWorld = null;
    setProbe(null);
    schedule();
  };

  const tipLeft = probe ? probe.sx > (state.current.w || 0) - 230 : false;
  const tipUp = probe ? probe.sy > (state.current.h || 0) - 120 : false;

  return (
    <div
      ref={wrapRef}
      className={`floodmap ${ready ? 'is-ready' : ''} ${interactive ? 'is-interactive' : ''} ${className ?? ''}`}
      onPointerMove={interactive ? (e) => updateProbe(e.clientX, e.clientY) : undefined}
      onPointerDown={interactive ? (e) => updateProbe(e.clientX, e.clientY) : undefined}
      onPointerLeave={interactive ? (e) => e.pointerType === 'mouse' && clearProbe() : undefined}
    >
      <canvas ref={canvasRef} role="img" aria-label={label} />
      {probe && (
        <div
          className="floodmap__tip"
          style={{
            transform: `translate(${probe.sx + (tipLeft ? -14 : 14)}px, ${probe.sy + (tipUp ? -14 : 14)}px) translate(${tipLeft ? '-100%' : '0'}, ${tipUp ? '-100%' : '0'})`,
          }}
          aria-hidden="true"
        >
          <strong>{probe.street}</strong>
          {probe.dry ? (
            <span>Open water</span>
          ) : probe.peak < 0.03 ? (
            <span>Stays dry through {clockLabel(72)}</span>
          ) : (
            <>
              <span>
                {probe.depth < 0.03 ? 'Dry' : `${Math.round(probe.depth * 100)} cm`} at {clockLabel(hour)}
              </span>
              <span className="floodmap__tip-peak">
                Peaks at {Math.round(probe.peak * 100)} cm, {clockLabel(probe.peakHour)}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
