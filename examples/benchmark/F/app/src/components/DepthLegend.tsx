export default function DepthLegend({ gauges = true }: { gauges?: boolean }) {
  return (
    <div className="legend">
      <span className="legend__item">
        <span>Flood depth</span>
        <span className="legend__ramp" aria-hidden="true">
          <span style={{ background: 'var(--depth-1)' }} />
          <span style={{ background: 'var(--depth-2)' }} />
          <span style={{ background: 'var(--depth-3)' }} />
          <span style={{ background: 'var(--depth-4)' }} />
          <span style={{ background: 'var(--depth-5)' }} />
        </span>
        <span className="num">5 cm to 1 m+</span>
      </span>
      {gauges && (
        <span className="legend__item">
          <span className="legend__swatch-gauge" aria-hidden="true" />
          <span>Tide and river gauges</span>
        </span>
      )}
    </div>
  );
}
