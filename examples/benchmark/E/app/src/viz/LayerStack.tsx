import type React from 'react';
import { useMemo } from 'react';
import { getCity, WORLD_W, WORLD_H, depthAt } from './city';
import { depthColor } from './FloodMap';

/**
 * Isometric stack of the five model inputs over Kelsford. `step` 0..4 drops each layer
 * into the stack; step 5 fuses them into the forecast plane. Drawn from the same city data.
 */
const PW = 260, PH = 208; // plane size in plan units
const sx = PW / WORLD_W, sy = PH / WORLD_H;
const ISO = 'matrix(0.866 0.5 -0.866 0.5 0 0)';

function Plane({ id, children, stroke = '#9aa9a6', fill = '#ffffff' }: { id: string; children?: React.ReactNode; stroke?: string; fill?: string }) {
  return (
    <g transform={ISO}>
      <rect x="0" y="0" width={PW} height={PH} rx="6" fill={fill} fillOpacity={fill === "#0b1c22" ? 1 : 0.8} stroke={stroke} strokeWidth="1.5" />
      <clipPath id={`clip-${id}`}><rect x="0" y="0" width={PW} height={PH} rx="6" /></clipPath>
      <g clipPath={`url(#clip-${id})`}>{children}</g>
    </g>
  );
}

export default function LayerStack({ step }: { step: number }) {
  const city = getCity();
  const content = useMemo(() => {
    const P = (x: number, y: number) => `${(x * sx).toFixed(1)} ${(y * sy).toFixed(1)}`;
    const radarDots: React.ReactNode[] = [];
    for (let y = 20; y < WORLD_H; y += 48)
      for (let x = 20; x < WORLD_W; x += 48) {
        const r = city.rainAt(x, y, 35);
        if (r > 3) radarDots.push(<circle key={`${x}-${y}`} cx={x * sx} cy={y * sy} r={Math.min(3.2, 0.6 + r / 12)} fill="#5aa8c4" />);
      }
    const coast = 'M' + city.coast.map((p) => P(p.x, p.y)).join(' L') + ' Z';
    const river = 'M' + city.river.map((p) => P(p.x, p.y)).join(' L');
    const streets = city.streets.map((s) => `M${P(s.a.x, s.a.y)} L${P(s.b.x, s.b.y)}`).join(' ');
    const contours = city.contours.map((c) => {
      let d = '';
      for (let i = 0; i < c.segs.length; i += 4) d += `M${P(c.segs[i], c.segs[i + 1])} L${P(c.segs[i + 2], c.segs[i + 3])} `;
      return <path key={c.level} d={d} stroke={c.level % 4 === 0 ? '#56686c' : '#9aa9a6'} strokeWidth={c.level % 4 === 0 ? 0.9 : 0.6} fill="none" />;
    });
    const drains = city.drains.filter((_, i) => i % 2 === 0);
    const flooded = city.streets.map((s) => ({ s, d: depthAt(s, 42) })).filter((o) => o.d > 0.04);
    return { radarDots, coast, river, streets, contours, drains, flooded, P };
  }, [city]);

  const layers = [
    {
      name: 'Rainfall radar', body: <>{content.radarDots}</>,
    },
    {
      name: 'Tide gauges',
      body: (
        <>
          <path d={content.coast} fill="#d4ecf0" />
          <circle cx={city.tideGauge.x * sx} cy={city.tideGauge.y * sy} r="6" fill="#f0a81c" stroke="#0e2229" strokeWidth="1.5" />
          <circle cx={200} cy={186} r="4" fill="#0e2229" />
        </>
      ),
    },
    {
      name: 'River levels',
      body: (
        <>
          <path d={content.river} stroke="#5aa8c4" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx={city.riverGauge.x * sx} cy={city.riverGauge.y * sy} r="6" fill="#f0a81c" stroke="#0e2229" strokeWidth="1.5" />
          <circle cx={city.river[4].x * sx} cy={city.river[4].y * sy} r="4" fill="#0e2229" />
        </>
      ),
    },
    {
      name: 'Drain network',
      body: (
        <>
          <path d={content.streets} stroke="#b7c3c0" strokeWidth="1" fill="none" />
          {content.drains.map((d, i) => (
            <circle key={i} cx={d.x * sx} cy={d.y * sy} r="1.8" fill={d.cap < 0.5 ? '#f0a81c' : '#0e2229'} />
          ))}
        </>
      ),
    },
    { name: 'Ground elevation', body: <>{content.contours}</> },
  ];

  const fused = step >= 5;
  const baseY = 40, gap = 84;
  return (
    <svg className="layers-svg" viewBox="-200 0 560 640" role="img" aria-label={fused ? 'The five input layers fused into one street-level flood forecast for Kelsford.' : `Input layers stacked so far: ${layers.slice(0, step + 1).map((l) => l.name).join(', ')}.`}>
      {layers.map((l, i) => {
        const placed = i <= step;
        const y = fused ? 250 + i * 6 : baseY + i * gap + (placed ? 0 : -36);
        const active = i === step && !fused;
        return (
          <g key={l.name} style={{ transform: `translate(0px, ${y}px)`, opacity: fused ? 0.18 : placed ? 1 : 0.14, transition: 'transform 520ms cubic-bezier(.25,1,.5,1), opacity 420ms ease' }}>
            <Plane id={`l${i}`} stroke={active ? '#0e2229' : '#9aa9a6'} fill={active ? '#ffffff' : '#f7f9f7'}>{l.body}</Plane>
            {!fused && (
              <g style={{ opacity: placed ? 1 : 0, transition: 'opacity 300ms' }}>
                <line x1={225} y1={113} x2={236} y2={113} stroke="#9aa9a6" />
                <text x={240} y={117} fontSize="12.5" fontWeight={active ? 700 : 500} fill={active ? '#0e2229' : '#56686c'} fontFamily="var(--font-text)">{l.name}</text>
              </g>
            )}
          </g>
        );
      })}
      <g style={{ transform: `translate(0px, ${fused ? 214 : 560}px)`, opacity: fused ? 1 : 0, transition: 'transform 620ms cubic-bezier(.25,1,.5,1), opacity 420ms ease' }}>
        <Plane id="fused" stroke="#0e2229" fill="#0b1c22">
          <path d={content.coast} fill="#0f2b36" />
          <path d={content.river} stroke="#123644" strokeWidth="5" fill="none" />
          <path d={content.streets} stroke="#2d4950" strokeWidth="1" fill="none" />
          {content.flooded.map(({ s, d }) => (
            <path key={s.id} d={`M${content.P(s.a.x, s.a.y)} L${content.P(s.b.x, s.b.y)}`} stroke={depthColor(d)} strokeWidth={1.2 + d * 3} strokeLinecap="round" />
          ))}
        </Plane>
        <text x={20} y={268} textAnchor="middle" fontSize="13" fontWeight="700" fill="#0e2229" fontFamily="var(--font-text)">Forecast: depth per street, T+42 h</text>
      </g>
    </svg>
  );
}
