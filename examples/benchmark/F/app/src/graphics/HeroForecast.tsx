import { useEffect, useMemo, useRef, useState } from 'react';
import FloodMap from './FloodMap';
import StormChart from './StormChart';
import DepthLegend from '../components/DepthLegend';
import { ISSUED, clockLabel, streetDepths } from '../lib/city';
import { useInView, usePrefersReducedMotion } from '../lib/hooks';
import './hero.css';

const LOOP_START = 31;
const LOOP_END = 62;
const SPEED = 2.4; // forecast hours per second

export default function HeroForecast() {
  const reduced = usePrefersReducedMotion();
  const [hour, setHour] = useState(reduced ? 40 : 37);
  const [playing, setPlaying] = useState(!reduced);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  useEffect(() => {
    if (!playing || !inView) return;
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = Math.min(0.1, (t - last) / 1000);
      last = t;
      setHour((h) => (h + dt * SPEED > LOOP_END ? LOOP_START : h + dt * SPEED));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, inView]);

  const whole = Math.round(hour);
  const over = useMemo(() => streetDepths(whole).filter((s) => s.depth >= 0.3).length, [whole]);
  const fill = `${(hour / 72) * 100}%`;

  return (
    <div className="hero-forecast" ref={ref}>
      <div className="hero-forecast__map">
        <FloodMap
          hour={hour}
          interactive
          label={`Forecast map of Kessling at ${clockLabel(hour)}. ${over} streets are forecast to flood deeper than 30 centimetres.`}
          focus={{ x: 560, y: 400 }}
        />
        <div className="hero-forecast__stamp" aria-hidden="true">
          <span>Kessling</span>
          <span className="muted">Issued {ISSUED}</span>
        </div>
        <div className="hero-forecast__clock" aria-live="off">
          <span className="hero-forecast__time num">{clockLabel(hour)}</span>
          <span className="hero-forecast__lead num">{whole} h ahead</span>
        </div>
        <p className="hero-forecast__hint">
          <span className="hint-fine">Point at any street for its depth and peak time</span>
          <span className="hint-coarse">Tap any street for its depth and peak time</span>
        </p>
      </div>

      <div className="hero-forecast__controls">
        <button
          type="button"
          className="play-btn"
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          aria-label={playing ? 'Pause forecast playback' : 'Play forecast'}
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
            {playing ? (
              <g fill="currentColor">
                <rect x="4" y="3" width="4" height="14" rx="1" />
                <rect x="12" y="3" width="4" height="14" rx="1" />
              </g>
            ) : (
              <path d="M5 3.5v13l11-6.5z" fill="currentColor" />
            )}
          </svg>
        </button>
        <div className="scrub">
          <StormChart hour={hour} compact height={46} title="Rain, sea level and river over the forecast" />
          <label className="visually-hidden" htmlFor="hero-scrub">
            Forecast time
          </label>
          <input
            id="hero-scrub"
            className="range scrub__range"
            type="range"
            min={0}
            max={72}
            step={0.25}
            value={hour}
            style={{ ['--fill' as string]: fill }}
            aria-valuetext={`${clockLabel(hour)}, ${whole} hours ahead, ${over} streets over 30 centimetres`}
            onChange={(e) => {
              setPlaying(false);
              setHour(Number(e.target.value));
            }}
          />
        </div>
      </div>
      <div className="hero-forecast__foot">
        <p className="hero-forecast__count" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
          <span className="legend__swatch-line" aria-hidden="true" />
          <span>
            <strong className="num">{over}</strong> {over === 1 ? 'street' : 'streets'} over 30 cm
          </span>
        </p>
        <DepthLegend />
      </div>
    </div>
  );
}
