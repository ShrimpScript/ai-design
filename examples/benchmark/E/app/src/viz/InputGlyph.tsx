import type { ReactNode } from 'react';
/**
 * draw(kind, level): one drawing grammar for the five model inputs.
 * 120×90 box, 2px ink strokes, one amber accent part, water in the depth ramp.
 * `level` (0..1) is the input's current reading and changes the drawing:
 * more rain dots, a higher waterline, more surcharged manholes.
 */
export type InputKind = 'radar' | 'tide' | 'river' | 'drains' | 'elevation';

type Props = { kind: InputKind; level?: number; tone?: 'paper' | 'ops'; title?: string };

export default function InputGlyph({ kind, level = 0.5, tone = 'paper', title }: Props) {
  const ink = tone === 'ops' ? '#e8efed' : '#0e2229';
  const faint = tone === 'ops' ? '#3b5a61' : '#b7c3c0';
  const water = tone === 'ops' ? '#2c80a6' : '#5aa8c4';
  const deep = tone === 'ops' ? '#8dcbe8' : '#16507f';
  const acc = '#f0a81c';
  const L = Math.max(0, Math.min(1, level));
  const common = { fill: 'none', stroke: ink, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  let body: ReactNode = null;
  switch (kind) {
    case 'radar': {
      const dots: ReactNode[] = [];
      let n = 0;
      for (let y = 18; y < 70; y += 8)
        for (let x = 48 + ((y / 8) % 2) * 4; x < 112; x += 8) {
          const d = Math.hypot(x - 82, y - 40);
          const r = Math.max(0, 3.2 - d / (10 + 16 * L));
          if (r > 0.5) dots.push(<circle key={n++} cx={x} cy={y} r={r} fill={d < 10 && L > 0.5 ? deep : water} />);
        }
      body = (
        <>
          {dots}
          <path d="M14 78 A 30 30 0 0 1 44 48" {...common} stroke={faint} />
          <path d="M14 78 A 52 52 0 0 1 66 26" {...common} stroke={faint} />
          <path d="M14 78 A 74 74 0 0 1 88 4" {...common} stroke={faint} />
          <path d="M14 78 L 60 32" {...common} stroke={acc} strokeWidth={2.5} />
          <circle cx="14" cy="78" r="4" fill={ink} />
        </>
      );
      break;
    }
    case 'tide': {
      const wl = 70 - L * 46;
      body = (
        <>
          <rect x="40" y="8" width="7" height="74" rx="1.5" fill={ink} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x="47" y={10 + i * 10} width={i % 2 ? 7 : 13} height="3.5" rx="1" fill={ink} />
          ))}
          <path d={`M4 ${wl} q 10 -5 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0 V 86 H 4 Z`} fill={water} opacity="0.55" />
          <path d={`M4 ${wl} q 10 -5 20 0 t 20 0 t 20 0 t 20 0 t 20 0 t 20 0`} {...common} stroke={deep} />
          <rect x="30" y={wl - 1.75} width="36" height="3.5" rx="1.75" fill={acc} />
          <path d="M80 16 h 30" {...common} stroke={faint} strokeDasharray="3 4" />
          <text x="110" y="12" textAnchor="end" fontSize="9" fill={ink} fontFamily="var(--font-text)" fontWeight="700">HAT</text>
        </>
      );
      break;
    }
    case 'river': {
      const wl = 66 - L * 38;
      const half = 18 + (66 - wl) * 0.9;
      body = (
        <>
          <path d={`M${60 - half} ${wl} H ${60 + half} L 82 72 Q 60 80 38 72 Z`} fill={water} opacity="0.6" />
          <path d="M4 24 H 22 L 38 72 Q 60 80 82 72 L 98 24 H 116" {...common} />
          <path d={`M${60 - half} ${wl} H ${60 + half}`} {...common} stroke={deep} />
          <path d="M104 24 V 76" {...common} stroke={faint} />
          {[30, 42, 54, 66].map((y) => <path key={y} d={`M104 ${y} h 6`} {...common} stroke={faint} />)}
          <path d={`M98 ${wl} h 14`} {...common} stroke={acc} strokeWidth={3} />
          <path d="M4 20 h 18" {...common} stroke={faint} strokeDasharray="3 4" />
        </>
      );
      break;
    }
    case 'drains': {
      const nodes = [
        [14, 20], [46, 16], [80, 24], [106, 16], [24, 52], [58, 50], [92, 56], [40, 80], [76, 80],
      ];
      const edges = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 8], [7, 8]];
      const surcharged = Math.round(L * 5);
      body = (
        <>
          {edges.map(([a, b], i) => (
            <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={i >= 8 ? deep : faint} strokeWidth={i >= 8 ? 3.5 : 2.5} strokeLinecap="round" />
          ))}
          {nodes.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={5} fill={8 - i < surcharged ? acc : tone === 'ops' ? '#0b1c22' : '#f2f4f1'} stroke={ink} strokeWidth="2" />
          ))}
        </>
      );
      break;
    }
    case 'elevation': {
      const rings = [0, 1, 2, 3, 4];
      const fillTo = Math.round(L * 2);
      body = (
        <>
          {rings.map((i) => {
            const rx = 54 - i * 10, ry = 38 - i * 7.5;
            return (
              <ellipse key={i} cx={60 + i * 3} cy={48 - i * 2} rx={rx} ry={ry} fill={i < fillTo ? water : 'none'} fillOpacity={i < fillTo ? 0.18 : 0} stroke={i === 0 ? ink : faint} strokeWidth={i === 0 ? 2 : 1.5} />
            );
          })}
          <path d="M72 38 l 4 -7 l 4 7 z" fill={acc} />
          <text x="84" y="37" fontSize="9" fill={ink} fontFamily="var(--font-text)" fontWeight="700">14.2</text>
        </>
      );
      break;
    }
  }

  return (
    <svg className="glyph" viewBox="0 0 120 90" role={title ? 'img' : undefined} aria-hidden={title ? undefined : true} aria-label={title}>
      {body}
    </svg>
  );
}
