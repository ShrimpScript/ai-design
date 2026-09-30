import { HOURS, ALERT_DEPTH } from './city';

/** Depth over 72 h for one street; red datum line = alert threshold. */
export default function Sparkline({ series, width = 140, height = 34, tone = 'ops', max = 1.25, now }: { series: Float32Array; width?: number; height?: number; tone?: 'ops' | 'paper'; max?: number; now?: number }) {
  const x = (i: number) => (i / HOURS) * width;
  const y = (d: number) => height - 2 - (Math.min(d, max) / max) * (height - 4);
  let dPath = `M0 ${height - 2}`;
  for (let i = 0; i <= HOURS; i++) dPath += ` L${x(i).toFixed(1)} ${y(series[i]).toFixed(1)}`;
  const area = `${dPath} L${width} ${height - 2} Z`;
  const line = dPath.replace(/^M0 [\d.]+ L/, 'M');
  const fill = tone === 'ops' ? '#2c80a6' : '#9ccfdc';
  const stroke = tone === 'ops' ? '#8dcbe8' : '#16507f';
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ overflow: 'visible' }}>
      <path d={area} fill={fill} opacity="0.35" />
      <path d={line} fill="none" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      <line x1="0" x2={width} y1={y(ALERT_DEPTH)} y2={y(ALERT_DEPTH)} stroke="#c23a2b" strokeWidth="1" strokeDasharray="3 3" />
      {now != null && <line x1={x(now)} x2={x(now)} y1="0" y2={height} stroke="#f0a81c" strokeWidth="1.5" />}
    </svg>
  );
}
