import { useEffect, useRef, useState } from 'react';
import FloodMap, { type Layers } from './FloodMap';
import { getCity, depthAt, clockLabel, ALERT_DEPTH } from './city';

type Step = { t: number; title: string; body: string; fact: [string, string]; layers: Layers; on: string[] };

const STEPS: Step[] = [
  {
    t: 8,
    title: 'The rain is still over the Atlantic.',
    body: 'Radar and the national weather ensemble show a convective band 400 km west. Tidemark runs 50 versions of the next three days and starts tracking where that water will land, street by street.',
    fact: ['50', 'forecast members, rerun every 15 minutes'],
    layers: { radar: true, contours: true, gauges: false, drains: false, depth: true, alerts: false },
    on: ['Radar', 'Elevation'],
  },
  {
    t: 29,
    title: 'The tide gauge sees a surge building.',
    body: 'A storm surge of 1.2 m will ride on Wednesday evening’s high water. Every outfall on the harbour front will be tide-locked for about four hours: the drains there can’t empty.',
    fact: ['+2.04 m', 'forecast water level at Kelsford Quay, Wed 22:00'],
    layers: { radar: true, contours: true, gauges: true, drains: false, depth: true, alerts: false },
    on: ['Radar', 'Tide & river gauges', 'Elevation'],
  },
  {
    t: 33,
    title: 'Drains fill before streets do.',
    body: 'The model routes rain through the drain network pipe by pipe. Gullies that will surcharge light up amber while the streets above them are still dry.',
    fact: ['1,240', 'gullies and manholes in the Kelsford network model'],
    layers: { radar: true, contours: true, gauges: true, drains: true, depth: true, alerts: false },
    on: ['Radar', 'Tide & river gauges', 'Drain network', 'Elevation'],
  },
  {
    t: 36,
    title: 'Alerts go out while the roads are open.',
    body: 'When a street’s forecast crosses 30 cm, Tidemark Alerts sends the crew list, the pump sites and a resident message for sign-off. The duty officer approves; nothing goes to the public on its own.',
    fact: ['T−9 h', 'median warning before water reached the kerb'],
    layers: { radar: true, contours: true, gauges: true, drains: false, depth: true, alerts: true },
    on: ['Depth forecast', 'Alerts'],
  },
  {
    t: 42,
    title: 'Peak: high water meets the river crest.',
    body: 'At midnight on Wednesday the forecast shows 56 streets above 30 cm, deepest along the Wharf Road basin. That is the map crews have had in their hands since Tuesday.',
    fact: ['56', 'streets above 30 cm at peak, known 42 hours ahead'],
    layers: { radar: true, contours: true, gauges: true, drains: false, depth: true, alerts: true },
    on: ['Depth forecast', 'Alerts', 'Tide & river gauges'],
  },
];

const ALL = ['Radar', 'Tide & river gauges', 'Drain network', 'Elevation', 'Depth forecast', 'Alerts'];

export default function StormStory() {
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const [t, setT] = useState(STEPS[0].t);
  const [active, setActive] = useState(0);
  const [prog, setProg] = useState(0);
  const [isPhone, setIsPhone] = useState(false);
  const city = getCity();

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const on = () => setIsPhone(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const line = window.innerHeight * (isPhone ? 0.72 : 0.55);
      const tops = stepRefs.current.map((el) => (el ? el.getBoundingClientRect().top : Infinity));
      let i = 0;
      tops.forEach((top, k) => { if (top < line) i = k; });
      const next = Math.min(STEPS.length - 1, i + 1);
      const span = tops[next] - tops[i];
      const f = next === i || span <= 0 ? 0 : Math.max(0, Math.min(1, (line - tops[i]) / span));
      const ease = f * f * (3 - 2 * f);
      setActive(i);
      setT(STEPS[i].t + (STEPS[next].t - STEPS[i].t) * ease);
      setProg((i + f) / (STEPS.length - 1));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [isPhone]);

  const step = STEPS[active];
  const count = city.streets.filter((s) => depthAt(s, t) >= ALERT_DEPTH).length;

  return (
    <div className="story-grid">
      <div className="story-steps">
        {STEPS.map((s, i) => (
          <article key={i} ref={(el) => { stepRefs.current[i] = el; }} className="story-step" data-active={i === active}>
            <span className="when">T+{s.t} h <span className="small" style={{ fontFamily: 'var(--font-text)', fontWeight: 600 }}>{clockLabel(s.t)}</span></span>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            <span className="fact"><span className="num">{s.fact[0]}</span><span className="small muted">{s.fact[1]}</span></span>
          </article>
        ))}
      </div>
      <div className="story-stage">
        <div className="story-frame">
          <FloodMap
            t={t}
            layers={step.layers}
            interactive={false}
            focus={isPhone ? { x: 560, y: 480 } : undefined}
            label={`Kelsford forecast at T+${Math.round(t)} hours, ${count} streets above 30 centimetres.`}
          />
          <div className="story-hud" aria-hidden="true">
            <span><span className="num tabular">T+{String(Math.round(t)).padStart(2, '0')} h</span> {clockLabel(t)}</span>
            <span className="tabular">{count} streets ≥ 30 cm</span>
          </div>
        </div>
        <div className="story-layers" aria-hidden="true">
          {ALL.map((l) => <span key={l} data-on={step.on.includes(l)}>{l}</span>)}
        </div>
        <div className="story-progress" aria-hidden="true"><i style={{ transform: `scaleX(${prog})` }} /></div>
      </div>
    </div>
  );
}
