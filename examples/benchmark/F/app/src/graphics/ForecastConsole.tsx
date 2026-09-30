import { useMemo, useState } from 'react';
import FloodMap from './FloodMap';
import DepthLegend from '../components/DepthLegend';
import { ISSUED, clockLabel, streetEvents } from '../lib/city';
import './console.css';

export default function ForecastConsole() {
  const events = useMemo(() => streetEvents(0.1).slice(0, 9), []);
  const [hour, setHour] = useState(events[0]?.peakHour ?? 40);
  const [selected, setSelected] = useState<string | null>(events[0]?.name ?? null);

  return (
    <div className="console" role="group" aria-label="Tidemark Forecast, example dashboard">
      <div className="console__bar">
        <span className="console__app">Forecast</span>
        <span className="console__city">Kessling</span>
        <span className="console__run muted">Run {ISSUED}, next in 11 min</span>
      </div>
      <div className="console__body">
        <div className="console__list">
          <p className="console__list-head">Streets by arrival time</p>
          <ul>
            {events.map((e) => (
              <li key={e.name}>
                <button
                  type="button"
                  className={`street-row ${selected === e.name ? 'is-selected' : ''}`}
                  aria-pressed={selected === e.name}
                  onClick={() => {
                    setSelected(e.name);
                    setHour(e.peakHour);
                  }}
                >
                  <span className="street-row__name">{e.name}</span>
                  <span className="street-row__time num">{clockLabel(e.first)}</span>
                  <span className="street-row__bar" aria-hidden="true">
                    <span style={{ width: `${Math.min(100, (e.peak / 1.2) * 100)}%` }} />
                  </span>
                  <span className="street-row__depth num">{Math.round(e.peak * 100)} cm</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="console__map">
          <FloodMap hour={hour} interactive label={`Forecast depth map at ${clockLabel(hour)}`} focus={{ x: 600, y: 420 }} />
          <div className="console__time">
            <label htmlFor="console-hour" className="console__time-label num">
              {clockLabel(hour)}
            </label>
            <input
              id="console-hour"
              type="range"
              className="range"
              min={0}
              max={72}
              step={1}
              value={hour}
              style={{ ['--fill' as string]: `${(hour / 72) * 100}%` }}
              aria-valuetext={`${clockLabel(hour)}, ${hour} hours ahead`}
              onChange={(e) => {
                setHour(Number(e.target.value));
                setSelected(null);
              }}
            />
          </div>
        </div>
      </div>
      <div className="console__foot">
        <DepthLegend gauges={false} />
      </div>
    </div>
  );
}
