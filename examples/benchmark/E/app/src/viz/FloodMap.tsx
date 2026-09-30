import { useEffect, useRef, useState } from 'react';
import { getCity, depthAt, ALERT_DEPTH, WORLD_W, WORLD_H, type Street, type City } from './city';

export type Layers = {
  contours?: boolean;
  radar?: boolean;
  gauges?: boolean;
  drains?: boolean;
  depth?: boolean;
  alerts?: boolean;
};

type Props = {
  t: number;
  layers?: Layers;
  /** world-space point to keep centred when the frame crops (e.g. the harbour on phones) */
  focus?: { x: number; y: number };
  interactive?: boolean;
  highlight?: number | null;
  threshold?: number;
  /** depth multiplier, e.g. 1.35 for the reasonable-worst-case (p90) view */
  scale?: number;
  onHover?: (s: Street | null) => void;
  label: string;
  className?: string;
};

const DEFAULT_LAYERS: Layers = { contours: true, radar: true, gauges: true, drains: false, depth: true, alerts: true };

// Depth ramp on the dark ops surface: deeper = lighter (one hue).
const RAMP: [number, [number, number, number]][] = [
  [0.03, [31, 88, 112]],
  [0.15, [44, 128, 166]],
  [0.3, [80, 164, 206]],
  [0.55, [141, 203, 232]],
  [0.9, [220, 241, 249]],
];
export function depthColor(d: number, alpha = 1) {
  if (d <= RAMP[0][0]) return `rgba(${RAMP[0][1].join(',')},${alpha})`;
  for (let i = 1; i < RAMP.length; i++) {
    if (d <= RAMP[i][0]) {
      const [d0, c0] = RAMP[i - 1], [d1, c1] = RAMP[i];
      const f = (d - d0) / (d1 - d0);
      const c = c0.map((v, k) => Math.round(v + (c1[k] - v) * f));
      return `rgba(${c.join(',')},${alpha})`;
    }
  }
  return `rgba(${RAMP[RAMP.length - 1][1].join(',')},${alpha})`;
}

type View = { s: number; ox: number; oy: number; w: number; h: number; dpr: number };

function computeView(w: number, h: number, focus?: { x: number; y: number }): View {
  const s = Math.max(w / WORLD_W, h / WORLD_H) * 1.02;
  const fx = focus?.x ?? WORLD_W / 2, fy = focus?.y ?? WORLD_H / 2;
  let ox = w / 2 - fx * s, oy = h / 2 - fy * s;
  ox = Math.min(0, Math.max(w - WORLD_W * s, ox));
  oy = Math.min(0, Math.max(h - WORLD_H * s, oy));
  return { s, ox, oy, w, h, dpr: Math.min(2, window.devicePixelRatio || 1) };
}

function drawStatic(ctx: CanvasRenderingContext2D, city: City, v: View, contours: boolean) {
  const { s, ox, oy } = v;
  const X = (x: number) => ox + x * s, Y = (y: number) => oy + y * s;
  ctx.fillStyle = '#0b1c22';
  ctx.fillRect(0, 0, v.w, v.h);
  // contours (OS-map style), every 4 m thicker
  if (contours) {
    for (const c of city.contours) {
      ctx.strokeStyle = c.level % 4 === 0 ? 'rgba(163,182,182,0.22)' : 'rgba(163,182,182,0.11)';
      ctx.lineWidth = c.level % 4 === 0 ? 1.1 : 0.8;
      ctx.beginPath();
      for (let i = 0; i < c.segs.length; i += 4) {
        ctx.moveTo(X(c.segs[i]), Y(c.segs[i + 1]));
        ctx.lineTo(X(c.segs[i + 2]), Y(c.segs[i + 3]));
      }
      ctx.stroke();
    }
  }
  // sea
  ctx.beginPath();
  city.coast.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
  ctx.closePath();
  ctx.fillStyle = '#0f2b36';
  ctx.fill();
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(90,168,196,0.10)';
  ctx.lineWidth = 1;
  for (let y = 0; y < v.h; y += 7) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(v.w, y); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(156,207,220,0.35)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  city.coast.slice(0, -2).forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
  ctx.stroke();
  // river
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#123644';
  ctx.lineWidth = Math.max(8, 26 * s);
  ctx.beginPath();
  city.river.forEach((p, i) => (i ? ctx.lineTo(X(p.x), Y(p.y)) : ctx.moveTo(X(p.x), Y(p.y))));
  ctx.stroke();
  ctx.strokeStyle = 'rgba(156,207,220,0.28)';
  ctx.lineWidth = 1;
  ctx.stroke();
  // street base
  ctx.strokeStyle = '#2d4950';
  ctx.lineWidth = Math.max(1.5, 3.2 * s);
  ctx.beginPath();
  for (const st of city.streets) {
    ctx.moveTo(X(st.a.x), Y(st.a.y));
    ctx.lineTo(X(st.b.x), Y(st.b.y));
  }
  ctx.stroke();
}

function staffGauge(ctx: CanvasRenderingContext2D, x: number, y: number, level: number, label: string, sc: number) {
  // E-shaped staff gauge glyph + reading, drawn at a fixed screen size
  const h = 34 * sc, w = 5 * sc;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#e8efed';
  ctx.fillRect(-w / 2, -h, w, h);
  for (let i = 0; i < 4; i++) ctx.fillRect(w / 2, -h + i * 9 * sc, (i % 2 ? 5 : 9) * sc, 3 * sc);
  const lv = Math.max(0, Math.min(1, (level + 1.6) / 4.5));
  ctx.fillStyle = '#f0a81c';
  ctx.fillRect(-w / 2 - 5 * sc, -lv * h - 1.5 * sc, w + 10 * sc, 3 * sc);
  ctx.font = `600 ${Math.round(11 * sc)}px 'Atkinson Hyperlegible Next', system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  const tw = ctx.measureText(label).width;
  ctx.fillStyle = 'rgba(11,28,34,0.86)';
  ctx.fillRect(14 * sc, -h + 2 * sc, tw + 12 * sc, 18 * sc);
  ctx.fillStyle = '#e8efed';
  ctx.fillText(label, 20 * sc, -h + 11 * sc);
  ctx.restore();
}

export default function FloodMap({ t, layers = DEFAULT_LAYERS, focus, interactive = true, highlight = null, threshold = ALERT_DEPTH, scale = 1, onHover, label, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const staticRef = useRef<HTMLCanvasElement | null>(null);
  const viewRef = useRef<View | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hover, setHover] = useState<{ s: Street; x: number; y: number } | null>(null);
  const city = getCity();
  const L = { ...DEFAULT_LAYERS, ...layers };

  // size tracking
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // static layer
  useEffect(() => {
    if (!size.w || !size.h) return;
    const v = computeView(size.w, size.h, focus);
    viewRef.current = v;
    const off = staticRef.current ?? document.createElement('canvas');
    off.width = size.w * v.dpr;
    off.height = size.h * v.dpr;
    const ctx = off.getContext('2d')!;
    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    drawStatic(ctx, city, v, !!L.contours);
    staticRef.current = off;
    const c = canvasRef.current!;
    c.width = off.width;
    c.height = off.height;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.w, size.h, focus?.x, focus?.y, L.contours]);

  // dynamic layer
  useEffect(() => {
    const c = canvasRef.current, off = staticRef.current, v = viewRef.current;
    if (!c || !off || !v) return;
    const ctx = c.getContext('2d')!;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(off, 0, 0);
    ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
    const { s, ox, oy } = v;
    const X = (x: number) => ox + x * s, Y = (y: number) => oy + y * s;
    const sc = Math.max(0.75, Math.min(1.1, v.w / 700));

    // radar returns: stipple, dot size = rain rate
    if (L.radar) {
      const step = 16;
      ctx.fillStyle = 'rgba(232,239,237,0.55)';
      for (let py = step / 2; py < v.h; py += step)
        for (let px = step / 2 + ((py / step) % 2) * (step / 2); px < v.w; px += step) {
          const r = city.rainAt((px - ox) / s, (py - oy) / s, t);
          if (r < 2) continue;
          const rad = Math.min(3.2, 0.5 + r / 11);
          ctx.globalAlpha = Math.min(0.75, 0.15 + r / 45);
          ctx.beginPath();
          ctx.arc(px, py, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      ctx.globalAlpha = 1;
    }

    // flood depth per street
    if (L.depth) {
      ctx.lineCap = 'round';
      const byDepth = city.streets
        .map((st) => ({ st, d: depthAt(st, t) * scale }))
        .filter((o) => o.d > 0.03)
        .sort((a, b) => a.d - b.d);
      for (const { st, d } of byDepth) {
        ctx.strokeStyle = depthColor(d);
        ctx.lineWidth = Math.max(2.5, (3 + d * 9) * s);
        ctx.beginPath();
        ctx.moveTo(X(st.a.x), Y(st.a.y));
        ctx.lineTo(X(st.b.x), Y(st.b.y));
        ctx.stroke();
      }
    }

    // drain nodes: ring when coping, filled when surcharged
    if (L.drains) {
      for (const dn of city.drains) {
        const st = city.streets[dn.street];
        const d = depthAt(st, t) * scale;
        const r = Math.max(2.5, 4.2 * s);
        ctx.beginPath();
        ctx.arc(X(dn.x), Y(dn.y), r, 0, Math.PI * 2);
        if (d > 0.12) {
          ctx.fillStyle = '#f0a81c';
          ctx.fill();
        } else {
          ctx.strokeStyle = 'rgba(232,239,237,0.7)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    // alerts: amber ticks where a street has crossed the threshold
    if (L.alerts) {
      ctx.fillStyle = '#f0a81c';
      ctx.strokeStyle = '#0b1c22';
      ctx.lineWidth = 1.5;
      for (const st of city.streets) {
        if (depthAt(st, t) * scale < threshold) continue;
        const mx = X((st.a.x + st.b.x) / 2), my = Y((st.a.y + st.b.y) / 2);
        const r = Math.max(3.5, 5 * s);
        ctx.beginPath();
        ctx.moveTo(mx, my - r);
        ctx.lineTo(mx + r, my);
        ctx.lineTo(mx, my + r);
        ctx.lineTo(mx - r, my);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // highlight (hover or external)
    const hl = hover?.s ?? (highlight != null ? city.streets[highlight] : null);
    if (hl) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, 2 * s);
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(X(hl.a.x), Y(hl.a.y));
      ctx.lineTo(X(hl.b.x), Y(hl.b.y));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(X((hl.a.x + hl.b.x) / 2), Y((hl.a.y + hl.b.y) / 2), 9, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    if (L.gauges) {
      const tg = city.tideGauge, rg = city.riverGauge;
      const tide = city.tide(t), riv = city.riverLevel(t);
      staffGauge(ctx, X(tg.x), Y(tg.y), tide, `Tide ${tide >= 0 ? '+' : '−'}${Math.abs(tide).toFixed(2)} m`, sc);
      staffGauge(ctx, X(rg.x) + 16, Y(rg.y) + 34 * sc, riv - 1.2, `River +${riv.toFixed(2)} m`, sc);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t, size.w, size.h, hover, highlight, threshold, scale, L.radar, L.depth, L.drains, L.alerts, L.gauges, L.contours, focus?.x, focus?.y]);

  const pick = (clientX: number, clientY: number) => {
    const v = viewRef.current, c = canvasRef.current;
    if (!v || !c) return null;
    const r = c.getBoundingClientRect();
    const px = clientX - r.left, py = clientY - r.top;
    const wx = (px - v.ox) / v.s, wy = (py - v.oy) / v.s;
    let best: Street | null = null, bd = 22 / v.s;
    for (const st of city.streets) {
      const dx = st.b.x - st.a.x, dy = st.b.y - st.a.y;
      const l2 = dx * dx + dy * dy;
      const k = Math.max(0, Math.min(1, ((wx - st.a.x) * dx + (wy - st.a.y) * dy) / l2));
      const d = Math.hypot(st.a.x + k * dx - wx, st.a.y + k * dy - wy);
      if (d < bd) { bd = d; best = st; }
    }
    return best ? { s: best, x: px, y: py } : null;
  };

  const d = hover ? depthAt(hover.s, t) * scale : 0;
  return (
    <div
      ref={wrapRef}
      className={`floodmap ${className ?? ''}`}
      onPointerMove={interactive ? (e) => { const h = pick(e.clientX, e.clientY); setHover(h); onHover?.(h?.s ?? null); } : undefined}
      onPointerLeave={interactive ? () => { setHover(null); onHover?.(null); } : undefined}
    >
      <canvas ref={canvasRef} role="img" aria-label={label} style={{ width: '100%', height: '100%' }} />
      {hover && (
        <div
          className="map-tip"
          style={{
            left: Math.min(Math.max(8, hover.x + 14), size.w - 200),
            top: hover.y > size.h - 120 ? hover.y - 110 : hover.y + 16,
          }}
        >
          <strong>{hover.s.name}</strong>
          <span className="tabular">{d < 0.03 ? 'Dry' : `${Math.round(d * 100)} cm of water`} now</span>
          <br />
          <span className="tabular muted">
            {hover.s.peak < 0.05 ? 'Stays dry this forecast' : `Peaks ${Math.round(hover.s.peak * scale * 100)} cm at T+${hover.s.peakHour} h`}
          </span>
        </div>
      )}
    </div>
  );
}
