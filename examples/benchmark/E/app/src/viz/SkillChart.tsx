import type React from 'react';
import { useState } from 'react';

const LEAD = [6, 12, 24, 36, 48, 60, 72];
const SERIES = [
  { key: 'tm', name: 'Tidemark v4.3', color: '#2a7ba6', values: [0.95, 0.94, 0.91, 0.88, 0.84, 0.77, 0.69] },
  { key: 'bl', name: 'Rainfall-threshold warnings', color: '#b8740a', values: [0.62, 0.55, 0.41, 0.3, 0.22, 0.16, 0.12] },
];

/** Hit rate vs lead time, 212 verified events. Line chart with crosshair + tooltip + table view. */
export default function SkillChart() {
  const W = 640, H = 320, m = { l: 44, r: 150, t: 12, b: 40 };
  const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const x = (h: number) => m.l + ((h - 0) / 72) * iw;
  const y = (v: number) => m.t + (1 - v) * ih;
  const [hi, setHi] = useState<number | null>(null);

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    let best = 0;
    LEAD.forEach((h, i) => { if (Math.abs(x(h) - px) < Math.abs(x(LEAD[best]) - px)) best = i; });
    setHi(best);
  };

  return (
    <div className="chart-card">
      <div className="chart-head">
        <div>
          <h3>Share of flooded streets warned in time</h3>
          <p className="small muted" style={{ margin: '4px 0 0' }}>Hit rate for streets with ≥ 30&nbsp;cm observed, by forecast lead time. 212 events, 9 cities, 2021–2026, held out from training.</p>
        </div>
        <ul className="legend" aria-label="Series">
          {SERIES.map((s) => (
            <li key={s.key}><i style={{ background: s.color }} />{s.name}</li>
          ))}
        </ul>
      </div>
      <div className="chart-wrap">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label="Line chart: Tidemark hit rate falls from 95% at 6 hours to 69% at 72 hours; rainfall-threshold warnings fall from 62% to 12%."
          onPointerMove={onMove}
          onPointerLeave={() => setHi(null)}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <g key={v}>
              <line x1={m.l} x2={m.l + iw} y1={y(v)} y2={y(v)} stroke="#e1e7e5" strokeWidth="1" />
              <text x={m.l - 8} y={y(v)} dy="0.35em" textAnchor="end" fontSize="12" fill="#56686c">{v * 100}%</text>
            </g>
          ))}
          {LEAD.map((h) => (
            <text key={h} x={x(h)} y={H - m.b + 20} textAnchor="middle" fontSize="12" fill="#56686c">{h} h</text>
          ))}
          <text x={m.l + iw / 2} y={H - 4} textAnchor="middle" fontSize="12" fill="#56686c">Forecast lead time</text>
          {hi != null && <line x1={x(LEAD[hi])} x2={x(LEAD[hi])} y1={m.t} y2={m.t + ih} stroke="#9aa9a6" strokeWidth="1" />}
          {SERIES.map((s) => {
            const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(LEAD[i])} ${y(v)}`).join(' ');
            const last = s.values.length - 1;
            return (
              <g key={s.key}>
                <path d={`${d} L${x(LEAD[last])} ${y(0)} L${x(LEAD[0])} ${y(0)} Z`} fill={s.color} opacity="0.08" />
                <path d={d} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx={x(LEAD[last])} cy={y(s.values[last])} r="4.5" fill={s.color} stroke="#fff" strokeWidth="2" />
                <text x={x(LEAD[last]) + 10} y={y(s.values[last])} dy="0.35em" fontSize="12.5" fill="#0e2229" fontWeight="700">
                  {Math.round(s.values[last] * 100)}% <tspan fontWeight="400" fill="#3f5359">{s.key === 'tm' ? 'Tidemark' : 'thresholds'}</tspan>
                </text>
                {hi != null && <circle cx={x(LEAD[hi])} cy={y(s.values[hi])} r="5" fill={s.color} stroke="#fff" strokeWidth="2" />}
              </g>
            );
          })}
          <rect x={m.l} y={m.t} width={iw} height={ih} fill="transparent" />
        </svg>
        {hi != null && (
          <div className="chart-tip" style={{ left: `${(x(LEAD[hi]) / W) * 100}%`, top: 8, transform: hi > 4 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }}>
            <b className="tabular">{LEAD[hi]} h ahead</b>
            {SERIES.map((s) => (
              <div className="row" key={s.key}>
                <span><i style={{ display: 'inline-block', width: 10, height: 3, background: s.color, marginRight: 6, verticalAlign: 'middle' }} />{s.name}</span>
                <b className="tabular">{Math.round(s.values[hi] * 100)}%</b>
              </div>
            ))}
          </div>
        )}
      </div>
      <details className="chart-table">
        <summary>Show the numbers as a table</summary>
        <table className="data">
          <thead><tr><th>Lead time</th>{SERIES.map((s) => <th key={s.key} className="r">{s.name}</th>)}</tr></thead>
          <tbody>
            {LEAD.map((h, i) => (
              <tr key={h}><td>{h} h</td>{SERIES.map((s) => <td key={s.key} className="r">{Math.round(s.values[i] * 100)}%</td>)}</tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
