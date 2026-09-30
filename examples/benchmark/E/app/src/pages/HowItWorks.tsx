import { useRef } from 'react';
import LayerStack from '../viz/LayerStack';
import InputGlyph from '../viz/InputGlyph';
import SkillChart from '../viz/SkillChart';
import CtaBand from '../components/CtaBand';
import { INPUTS } from '../data/content';
import { useActiveStep } from '../hooks/useScrollProgress';

function Architecture() {
  // Real stages of the pipeline, left to right. The dashed path animates along the true data flow.
  const box = (x: number, y: number, w: number, h: number, title: string, sub: string, dark = false) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill={dark ? '#0b1c22' : '#ffffff'} stroke={dark ? '#0b1c22' : '#9aa9a6'} strokeWidth="1.5" />
      <text x={x + 14} y={y + 26} fontSize="14" fontWeight="700" fill={dark ? '#e8efed' : '#0e2229'} fontFamily="var(--font-text)">{title}</text>
      <text x={x + 14} y={y + 46} fontSize="12" fill={dark ? '#a3b6b6' : '#56686c'} fontFamily="var(--font-text)">{sub}</text>
    </g>
  );
  const inputs = ['Radar + weather ensemble', 'Tide gauges + surge', 'River gauges', 'Drain register', 'LiDAR terrain'];
  return (
    <div className="arch">
      <svg viewBox="0 0 1080 380" role="img" aria-label="Pipeline: five inputs feed data assimilation; a drain-network graph model and a surface-flow model run for 50 ensemble members; results are calibrated against observed floods and published as depth and timing per street.">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="#0e2229" />
          </marker>
        </defs>
        {inputs.map((t, i) => (
          <g key={t}>
            <rect x="0" y={20 + i * 70} width="180" height="50" rx="8" fill="#f2f4f1" stroke="#cad3d0" />
            <text x="14" y={50 + i * 70} fontSize="13" fontWeight="600" fill="#0e2229" fontFamily="var(--font-text)">{t}</text>
            <path d={`M180 ${45 + i * 70} C 215 ${45 + i * 70}, 215 190, 240 190`} fill="none" stroke="#9aa9a6" strokeWidth="1.5" />
          </g>
        ))}
        {box(240, 160, 190, 60, 'Assimilation', 'QC, gap-fill, every 5 min')}
        <path className="flow" d="M430 190 H 470 V 110 H 500" fill="none" stroke="#0e2229" strokeWidth="1.5" markerEnd="url(#arr)" />
        <path className="flow" d="M470 190 V 270 H 500" fill="none" stroke="#0e2229" strokeWidth="1.5" markerEnd="url(#arr)" />
        {box(500, 80, 220, 60, 'Pipe-network graph model', 'every gully, pipe and outfall')}
        {box(500, 240, 220, 60, 'Surface-flow model', '2 m grid, physics-trained')}
        <path className="flow" d="M720 110 H 750 V 190 H 770" fill="none" stroke="#0e2229" strokeWidth="1.5" />
        <path className="flow" d="M720 270 H 750 V 190" fill="none" stroke="#0e2229" strokeWidth="1.5" />
        <path d="M750 190 H 770" fill="none" stroke="#0e2229" strokeWidth="1.5" markerEnd="url(#arr)" />
        {box(770, 160, 130, 60, '50 members', 'ensemble, 72 h')}
        <path className="flow accent" d="M900 190 H 930" fill="none" stroke="#f0a81c" strokeWidth="3" markerEnd="url(#arr)" />
        {box(930, 150, 150, 80, 'Per street', 'depth · arrival · p90', true)}
        <text x="615" y="340" textAnchor="middle" fontSize="12" fill="#56686c" fontFamily="var(--font-text)">Calibrated against 212 observed floods before every release</text>
        <path d="M500 322 H 730" stroke="#cad3d0" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

const STEPS = [
  ...INPUTS.map((i) => ({ title: i.name, body: i.why, spec: i.spec, kind: i.kind })),
  { title: 'Fused into one forecast', body: 'The model learns how these five interact on your streets: a high tide that locks the outfalls, a river that backs up a culvert, a dip under the railway that fills first.', spec: 'Output: depth, arrival time and clearance time for every street, with p50 and p90.', kind: null },
];

export default function HowItWorks() {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const active = useActiveStep(refs, 0.6);
  return (
    <>
      <section className="page-head">
        <div className="wrap page-head-grid">
          <div>
            <p className="kicker">How it works · model v4.3, released 4 August 2026</p>
            <h1>A hydraulic model that learned your city.</h1>
          </div>
          <p className="lede">Tidemark is a physics-trained machine-learning model. It runs in minutes rather than the hours a full hydraulic simulation takes, which is what lets us re-forecast every street every 15 minutes, 50 times over.</p>
        </div>
      </section>

      <section className="section layers-scene" aria-labelledby="layers-h" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 id="layers-h" className="visually-hidden">The five inputs</h2>
          <div className="layers-grid">
            <div className="layer-steps">
              {STEPS.map((s, i) => (
                <article key={s.title} ref={(el) => { refs.current[i] = el; }} className="ls-step" data-active={i === active}>
                  {s.kind ? (
                    <div className="ls-glyph"><InputGlyph kind={s.kind} level={0.7} /></div>
                  ) : (
                    <div className="ls-glyph" aria-hidden="true">
                      <svg viewBox="0 0 120 90"><rect x="4" y="10" width="112" height="70" rx="8" fill="#0b1c22" /><path d="M16 60 L50 40 L80 52 L104 28" stroke="#8dcbe8" strokeWidth="5" strokeLinecap="round" fill="none" /><path d="M16 60 L50 40" stroke="#dcf1f9" strokeWidth="7" strokeLinecap="round" /><rect x="44" y="34" width="12" height="12" transform="rotate(45 50 40)" fill="#f0a81c" /></svg>
                    </div>
                  )}
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <p className="spec">{s.spec}</p>
                </article>
              ))}
            </div>
            <div className="layers-stage">
              <LayerStack step={active} />
            </div>
          </div>
        </div>
      </section>

      <section className="section paper-2" aria-labelledby="arch-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="arch-h">From gauge reading to street forecast in four minutes.</h2>
            <p>Two learned models share the work. One follows water through the pipes; the other follows it across the ground once it leaves them. They exchange flows at every gully, every simulated minute.</p>
          </div>
          <Architecture />
          <div className="arch-note">
            <div>
              <h3>Trained on physics, checked against floods</h3>
              <p>41,000 full hydraulic simulations taught the surface model how water moves; 212 real, surveyed floods are held back to check it never drifts from what actually happened.</p>
            </div>
            <div>
              <h3>Your drains, not a generic city</h3>
              <p>Each city gets its own pipe-network graph built from its asset register. Where records are missing, we flag the gap and show it on the map as lower confidence.</p>
            </div>
            <div>
              <h3>Uncertainty you can act on</h3>
              <p>Fifty ensemble members give every street a most-likely and a reasonable-worst-case depth. You choose which one triggers a closure.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="verification" className="section" aria-labelledby="verif-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="verif-h">How often it’s right, and how early.</h2>
            <p>We publish verification for every release on events the model never saw in training. Here is v4.3 against the rainfall-threshold warnings most cities use today.</p>
          </div>
          <div className="verif-grid">
            <SkillChart />
            <ul className="stat-list">
              <li><span className="num tabular">84%</span><span className="small">of flooded streets warned 48&nbsp;hours ahead</span></li>
              <li><span className="num tabular">1 in 3</span><span className="small">street warnings at 48&nbsp;h are false alarms; 1 in 8 at 12&nbsp;h</span></li>
              <li><span className="num tabular">±38 min</span><span className="small">median error in arrival time, 12&nbsp;h ahead</span></li>
              <li><span className="num tabular">±9 cm</span><span className="small">median error in peak depth where depth exceeded 30&nbsp;cm</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section paper-2" aria-labelledby="limits-h">
        <div className="wrap faq-grid">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h2 id="limits-h">What it won’t do.</h2>
          </div>
          <ul className="stat-list">
            <li><b>It doesn’t replace official warnings.</b><span className="small">Tidemark sits beside your national forecasting service. Where they disagree, both are shown.</span></li>
            <li><b>It doesn’t talk to the public on its own.</b><span className="small">Every resident message waits for a named duty officer to approve it.</span></li>
            <li><b>It can’t see burst mains or blocked gullies.</b><span className="small">Crews can mark a blocked gully in the app and the next run accounts for it, within 15 minutes.</span></li>
            <li><b>It isn’t trained on your residents’ data.</b><span className="small">We use infrastructure and sensor data only. Contact lists stay in your systems.</span></li>
          </ul>
        </div>
      </section>

      <CtaBand title="Check it against a flood you remember." body="Give us the date of a past event and your drain register. We’ll run a blind hindcast and show you the streets we would have flagged, and when, next to what really flooded." />
    </>
  );
}
