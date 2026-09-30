import { useRef } from 'react';
import { useElementSize, useInView } from '../lib/hooks';
import './skillchart.css';

const LEADS = [6, 12, 24, 36, 48, 60, 72];
const TIDEMARK = [96, 94, 91, 88, 85, 82, 79];
const THRESHOLD = [71, 63, 52, 44, 37, 31, 26];

/** Share of flooded streets that were forecast, by lead time. */
export default function SkillChart() {
  const ref = useRef<HTMLDivElement>(null);
  const { w } = useElementSize(ref);
  const inView = useInView(ref, '0px 0px -20% 0px', true);
  const H = 320;
  const pad = { l: 44, r: 16, t: 20, b: 44 };
  const iw = Math.max(1, w - pad.l - pad.r);
  const ih = H - pad.t - pad.b;
  const x = (h: number) => pad.l + ((h - 0) / 72) * iw;
  const y = (v: number) => pad.t + ih - (v / 100) * ih;
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(LEADS[i]).toFixed(1)},${y(v).toFixed(1)}`).join('');
  const narrow = w < 520;

  return (
    <figure className={`skill ${inView ? 'is-in' : ''}`}>
      <div ref={ref} className="skill__plot" style={{ height: H }}>
        {w > 0 && (
          <svg width={w} height={H} role="img" aria-labelledby="skill-cap">
            {[0, 25, 50, 75, 100].map((v) => (
              <g key={v} className="skill__grid">
                <line x1={pad.l} x2={w - pad.r} y1={y(v)} y2={y(v)} />
                <text x={pad.l - 8} y={y(v) + 4} textAnchor="end">{v}%</text>
              </g>
            ))}
            {[0, 12, 24, 36, 48, 60, 72].map((h) => (
              <text key={h} className="skill__x" x={x(h)} y={H - pad.b + 20} textAnchor="middle">
                {h === 0 ? '0' : `${h} h`}
              </text>
            ))}
            <text className="skill__x" x={pad.l + iw / 2} y={H - 4} textAnchor="middle">Hours before the water arrived</text>
            <path d={path(THRESHOLD)} className="skill__line skill__line--base" pathLength={1} />
            <path d={path(TIDEMARK)} className="skill__line skill__line--tm" pathLength={1} />
            {TIDEMARK.map((v, i) => (
              <circle key={i} cx={x(LEADS[i])} cy={y(v)} r={4} className="skill__dot" style={{ transitionDelay: `${0.15 * i}s` }} />
            ))}
            <text x={x(narrow ? 30 : 40)} y={y(TIDEMARK[narrow ? 3 : 4]) - 14} className="skill__lab skill__lab--tm">Tidemark</text>
            <text x={x(narrow ? 30 : 40)} y={y(THRESHOLD[narrow ? 3 : 4]) + (narrow ? 26 : 24)} className="skill__lab skill__lab--base">
              Rain-threshold warnings
            </text>
            <text x={x(72)} y={y(79) - 12} textAnchor="end" className="skill__val">79%</text>
            <text x={x(24)} y={y(91) - 12} textAnchor="middle" className="skill__val">91%</text>
          </svg>
        )}
      </div>
      <figcaption id="skill-cap">
        Share of flooded streets that were forecast to flood, by how far ahead. Scored against 2,380 flooded-street reports from 14
        cities, winters 2023 to 2026. Rain-threshold warnings are the city-wide alerts most of those cities used before.
      </figcaption>
    </figure>
  );
}
