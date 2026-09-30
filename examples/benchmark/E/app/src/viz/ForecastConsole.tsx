import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'motion/react';
import FloodMap, { depthColor } from './FloodMap';
import { getCity, depthAt, clockLabel, HOURS, ALERT_DEPTH, type Street } from './city';

/**
 * The signature graphic: a live Tidemark Forecast for the fictional city of Kelsford.
 * The forecast clock runs T+0 → 72 h on its own (time), the visitor can scrub it
 * (keyboard or pointer) and inspect any street (pointer).
 */
export default function ForecastConsole({ compact = false }: { compact?: boolean }) {
  const reduce = useReducedMotion();
  const city = getCity();
  const [t, setT] = useState(reduce ? 40 : 31);
  const [playing, setPlaying] = useState(!reduce);
  const [announce, setAnnounce] = useState('');
  const [hovered, setHovered] = useState<Street | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const visible = useRef(true);
  const [isPhone, setIsPhone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const on = () => setIsPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  const counts = useMemo(() => {
    const arr: number[] = [];
    for (let h = 0; h <= HOURS; h++) arr.push(city.streets.filter((s) => s.depth[h] >= ALERT_DEPTH).length);
    return arr;
  }, [city]);
  const maxCount = Math.max(...counts);

  useEffect(() => {
    if (reduce) setPlaying(false);
  }, [reduce]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing) return;
    let raf = 0, last = performance.now(), hold = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (visible.current && !document.hidden) {
        setT((prev) => {
          if (prev >= HOURS) {
            hold += dt;
            if (hold > 1.6) { hold = 0; return 18; }
            return prev;
          }
          return Math.min(HOURS, prev + dt * 3.2); // ~72 h in 22 s
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const hour = Math.round(t);
  const above = city.streets.filter((s) => depthAt(s, t) >= ALERT_DEPTH);
  const worst = above.slice().sort((a, b) => depthAt(b, t) - depthAt(a, t))[0];

  const onScrub = (v: number) => {
    setPlaying(false);
    setT(v);
    const n = counts[Math.round(v)];
    setAnnounce(`T plus ${Math.round(v)} hours, ${clockLabel(v)}. ${n} streets above 30 centimetres.`);
  };

  return (
    <div ref={rootRef} className={`console ${compact ? 'is-compact' : ''}`}>
      <div className="console-top">
        <div>
          <span className="console-place">Kelsford</span>
          <span className="console-meta">Forecast issued Tue 10 Feb, 06:00 · example data</span>
        </div>
        <div className="console-clock" aria-hidden="true">
          <span className="num">T+{String(hour).padStart(2, '0')}</span>
          <span className="console-meta tabular">{clockLabel(t)}</span>
        </div>
      </div>

      <div className="console-map">
        <FloodMap
          t={t}
          focus={isPhone ? { x: 560, y: 470 } : undefined}
          onHover={setHovered}
          label={`Forecast map of Kelsford at T+${hour} hours: ${above.length} streets above 30 centimetres of water.`}
        />
        <div className="console-legend" aria-hidden="true">
          <span>Water on street</span>
          <span className="ramp">
            {[0.1, 0.3, 0.5, 0.8].map((d) => (
              <i key={d} style={{ background: depthColor(d) }} />
            ))}
          </span>
          <span className="ramp-labels tabular"><b>10</b><b>30</b><b>50</b><b>80+ cm</b></span>
        </div>
      </div>

      <div className="console-read">
        <div className="read-item">
          <span className="num big tabular">{above.length}</span>
          <span className="read-label">streets above 30&nbsp;cm</span>
        </div>
        <div className="read-item read-worst">
          {hovered ? (
            <>
              <span className="read-name">{hovered.name}</span>
              <span className="read-label tabular">
                {depthAt(hovered, t) < 0.03 ? 'dry now' : `${Math.round(depthAt(hovered, t) * 100)} cm now`}, peak {Math.round(hovered.peak * 100)} cm at T+{hovered.peakHour} h
              </span>
            </>
          ) : worst ? (
            <>
              <span className="read-name">{worst.name}</span>
              <span className="read-label tabular">deepest now: {Math.round(depthAt(worst, t) * 100)} cm</span>
            </>
          ) : (
            <>
              <span className="read-name">All streets passable</span>
              <span className="read-label">rain band approaching from the west</span>
            </>
          )}
        </div>
      </div>

      <div className="console-scrub">
        <button
          type="button"
          className="play"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pause forecast clock' : 'Play forecast clock'}
          aria-pressed={playing}
        >
          {playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" rx="1" fill="currentColor" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" fill="currentColor" /></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11a.7.7 0 0 0 1.05.6l9-5.5a.7.7 0 0 0 0-1.2l-9-5.5A.7.7 0 0 0 3 1.5z" fill="currentColor" /></svg>
          )}
        </button>
        <div className="scrub-track">
          <span className="strip-cap" aria-hidden="true">Streets above 30&nbsp;cm, hour by hour</span>
          <div className="strip" aria-hidden="true">
            {counts.map((c, h) => (
              <i key={h} style={{ height: `${c === 0 ? 1 : 4 + (c / maxCount) * 28}px` }} data-on={h <= t ? 'true' : 'false'} />
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={HOURS}
            step={1}
            value={hour}
            onChange={(e) => onScrub(Number(e.target.value))}
            aria-label="Forecast hour"
            aria-valuetext={`T plus ${hour} hours, ${clockLabel(t)}`}
          />
          <div className="scrub-ticks tabular" aria-hidden="true">
            <span>now</span><span>+24 h</span><span>+48 h</span><span>+72 h</span>
          </div>
        </div>
      </div>
      <p className="visually-hidden" aria-live="polite">{announce}</p>
    </div>
  );
}
