import { useMemo, useRef } from 'react';
import FloodMap from './FloodMap';
import StormChart from './StormChart';
import { clockLabel, getForcing, sample, streetDepths } from '../lib/city';
import { useStepProgress } from '../lib/hooks';
import './story.css';

export type StoryStep = { hour: number; title: string; body: string };

type Props = { steps: StoryStep[]; heading: string; intro: string };

export default function StormStory({ steps, heading, intro }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const n = steps.length;
  const t = useStepProgress(listRef);
  const i0 = Math.min(n - 2, Math.floor(t));
  const f = t - i0;
  const k = Math.max(0, Math.min(1, (f - 0.2) / 0.6)); // hold near each step, move between
  const ease = k * k * (3 - 2 * k);
  const hour = steps[i0].hour + (steps[i0 + 1].hour - steps[i0].hour) * ease;
  const active = Math.min(n - 1, Math.round(t));
  const whole = Math.round(hour);
  const over = useMemo(() => streetDepths(whole).filter((s) => s.depth >= 0.3).length, [whole]);
  const fc = getForcing();

  return (
    <section className="story section--dark on-dark" aria-labelledby="story-title">
      <div className="wrap story__head">
        <h2 id="story-title">{heading}</h2>
        <p className="lede">{intro}</p>
      </div>
      <div className="wrap story__track" ref={trackRef}>
        <div className="story__viz" aria-hidden="true">
          <div className="story__viz-inner">
            <div className="story__map">
              <FloodMap hour={hour} label="" showRain focus={{ x: 560, y: 420 }} />
              <div className="story__clock">
                <span className="num">{clockLabel(hour)}</span>
              </div>
            </div>
            <dl className="story__readout">
              <div>
                <dt>Rain</dt>
                <dd className="num">{sample(fc.rain, hour).toFixed(0)} mm/h</dd>
              </div>
              <div>
                <dt>Sea level</dt>
                <dd className="num">{sample(fc.sea, hour).toFixed(2)} m</dd>
              </div>
              <div>
                <dt>River Aske</dt>
                <dd className="num">+{sample(fc.river, hour).toFixed(2)} m</dd>
              </div>
              <div className="story__readout-alert">
                <dt>Streets over 30 cm</dt>
                <dd className="num">{over}</dd>
              </div>
            </dl>
            <div className="story__chart">
              <StormChart hour={hour} dark height={150} />
            </div>
          </div>
        </div>
        <ol className="story__steps" ref={listRef}>
          {steps.map((s, i) => (
            <li key={i} className={`story__step ${i === active ? 'is-active' : ''}`} aria-current={i === active ? 'step' : undefined}>
              <p className="story__when num">
                {clockLabel(s.hour)}
                <span>{s.hour === 0 ? 'forecast issued' : `${s.hour} h into the forecast`}</span>
              </p>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
