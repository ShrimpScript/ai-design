import { useMemo, useRef } from 'react';
import { HOURS, STEPS_PER_HOUR, clockLabel, getForcing, sample } from '../lib/city';
import { useElementSize } from '../lib/hooks';
import './stormchart.css';

type Props = {
  hour: number;
  height?: number;
  dark?: boolean;
  compact?: boolean;
  title?: string;
};

const M_MIN = -1.5;
const M_MAX = 3.5;
const RAIN_MAX = 32;

/** Rain, sea level and river stage for the Kessling storm, with a cursor at `hour`. */
export default function StormChart({ hour, height = 220, dark = false, compact = false, title = 'Storm inputs over 72 hours' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { w } = useElementSize(ref);
  const f = getForcing();
  const pad = compact ? { l: 0, r: 0, t: 4, b: 18 } : { l: 40, r: 44, t: 20, b: 28 };
  const W = Math.max(0, w);
  const iw = Math.max(1, W - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const x = (h: number) => pad.l + (h / HOURS) * iw;
  const yM = (m: number) => pad.t + ih - ((m - M_MIN) / (M_MAX - M_MIN)) * ih;
  const yR = (r: number) => pad.t + ih - (r / RAIN_MAX) * ih;

  const { bars, seaPath, riverPath } = useMemo(() => {
    const bars: { x: number; y: number; w: number; h: number }[] = [];
    const bw = iw / HOURS;
    for (let h = 0; h < HOURS; h++) {
      const r = sample(f.rain, h + 0.5);
      if (r < 0.3) continue;
      const y = yR(r);
      bars.push({ x: x(h) + bw * 0.12, y, w: Math.max(1, bw * 0.76), h: pad.t + ih - y });
    }
    let sea = '';
    let river = '';
    for (let s = 0; s <= HOURS * STEPS_PER_HOUR; s += 2) {
      const h = s / STEPS_PER_HOUR;
      sea += `${s ? 'L' : 'M'}${x(h).toFixed(1)},${yM(f.sea[s]).toFixed(1)}`;
      river += `${s ? 'L' : 'M'}${x(h).toFixed(1)},${yM(f.river[s]).toFixed(1)}`;
    }
    return { bars, seaPath: sea, riverPath: river };
    // eslint-disable-next-line
  }, [W, height, compact]);

  const rainNow = sample(f.rain, hour);
  const seaNow = sample(f.sea, hour);
  const riverNow = sample(f.river, hour);
  const cx = x(hour);
  const days = [0, 18, 42, 66]; // midnights: Tue 06:00 + 18h = Wed 00:00

  return (
    <div ref={ref} style={{ height }} className={`stormchart ${dark ? 'stormchart--dark' : ''} ${compact ? 'stormchart--compact' : ''}`}>
      {W > 0 && (
        <svg width={W} height={height} role="img" aria-label={`${title}. At ${clockLabel(hour)}: rain ${rainNow.toFixed(0)} millimetres per hour, sea level ${seaNow.toFixed(2)} metres, river ${riverNow.toFixed(2)} metres above normal.`}>
          {!compact && (
            <g className="sc-grid">
              {[-1, 0, 1, 2, 3].map((m) => (
                <g key={m}>
                  <line x1={pad.l} x2={W - pad.r} y1={yM(m)} y2={yM(m)} />
                  <text x={pad.l - 8} y={yM(m) + 4} textAnchor="end">{m} m</text>
                </g>
              ))}
              {[0, 10, 20, 30].map((r) => (
                <text key={r} x={W - pad.r + 8} y={yR(r) + 4} className="sc-rain-axis">{r}</text>
              ))}
              <text x={W - pad.r + 8} y={pad.t - 6} className="sc-rain-axis">mm/h</text>
            </g>
          )}
          {days.map((d) => (
            <g key={d} className="sc-day">
              <line x1={x(d)} x2={x(d)} y1={pad.t} y2={pad.t + ih} />
              <text x={x(d) + 4} y={height - 6}>{d === 0 ? 'Tue 06:00' : clockLabel(d).split(' ')[0]}</text>
            </g>
          ))}
          <g className="sc-rain">
            {bars.map((b, i) => (
              <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx={1} />
            ))}
          </g>
          <path d={seaPath} className="sc-sea" />
          <path d={riverPath} className="sc-river" />
          {!compact && (
            <g className="sc-labels">
              <text x={x(3)} y={yM(sample(f.sea, 3)) - 10} className="sc-sea-label">Sea level</text>
              <text x={x(60)} y={yM(sample(f.river, 60)) - 10} className="sc-river-label">River Aske</text>
              <text x={x(36.4)} y={yR(sample(f.rain, 38)) - 2} textAnchor="end" className="sc-rain-label">Rain</text>
            </g>
          )}
          <g className="sc-cursor" transform={`translate(${cx},0)`}>
            <line y1={pad.t - (compact ? 4 : 12)} y2={pad.t + ih} />
            {!compact && (
              <>
                <circle cy={yM(seaNow)} r={4} className="sc-dot-sea" />
                <circle cy={yM(riverNow)} r={4} className="sc-dot-river" />
              </>
            )}
          </g>
        </svg>
      )}
    </div>
  );
}
