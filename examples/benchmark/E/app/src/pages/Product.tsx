import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import FloodMap from '../viz/FloodMap';
import Sparkline from '../viz/Sparkline';
import Segmented from '../components/Segmented';
import CtaBand from '../components/CtaBand';
import { Arrow } from '../components/Icons';
import { getCity, depthAt, clockLabel, HOURS } from '../viz/city';

const SECTIONS = [
  { id: 'forecast', label: 'Tidemark Forecast' },
  { id: 'alerts', label: 'Tidemark Alerts' },
  { id: 'api', label: 'Tidemark API' },
];

function AnchorNav() {
  const [active, setActive] = useState('forecast');
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    SECTIONS.forEach((s) => { const el = document.getElementById(s.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <nav className="anchor-nav" aria-label="Products on this page">
      <div className="wrap">
        <ul>
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#/product#${s.id}`}
                aria-current={active === s.id ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(s.id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
                  history.replaceState(null, '', `#/product#${s.id}`);
                }}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function ForecastDash() {
  const city = getCity();
  const [t, setT] = useState(38);
  const [view, setView] = useState<'likely' | 'p90'>('likely');
  const scale = view === 'p90' ? 1.35 : 1;
  const streets = useMemo(() => {
    const seen = new Set<string>();
    return [...city.streets]
      .sort((a, b) => b.peak - a.peak)
      .filter((s) => (seen.has(s.name) ? false : (seen.add(s.name), true)))
      .slice(0, 6);
  }, [city]);
  const [sel, setSel] = useState<number>(streets[0].id);
  return (
    <div className="dash">
      <div className="dash-bar">
        <span className="small"><b>Kelsford</b> <span className="muted">· issued Tue 06:00 · example data</span></span>
        <Segmented
          label="Forecast view"
          value={view}
          onChange={setView}
          options={[{ value: 'likely', label: 'Most likely' }, { value: 'p90', label: 'Worst case (p90)' }]}
        />
      </div>
      <div className="dash-body">
        <div className="dash-map">
          <FloodMap t={t} scale={scale} highlight={sel} focus={{ x: 560, y: 470 }} label={`Forecast map at T+${t} hours, ${view === 'p90' ? 'reasonable worst case' : 'most likely'} depths.`} />
        </div>
        <div className="dash-side">
          <h3>Streets by forecast peak</h3>
          {streets.map((s) => (
            <button key={s.id} type="button" className="street-btn" aria-pressed={sel === s.id} onClick={() => setSel(s.id)}>
              <span className="sb-name">{s.name}</span>
              <span className="sb-val tabular">{Math.round(depthAt(s, t) * scale * 100)}&nbsp;cm</span>
              <span className="sb-sub">
                <Sparkline series={s.depth} width={150} height={24} now={t} max={1.25 / scale} />
                <span className="tabular">peak {Math.round(s.peak * scale * 100)} cm · {clockLabel(s.peakHour)}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="dash-foot">
        <label htmlFor="dash-hour" className="tabular" style={{ minWidth: 118 }}>T+{t} h · {clockLabel(t)}</label>
        <input id="dash-hour" type="range" min={0} max={HOURS} value={t} onChange={(e) => setT(Number(e.target.value))} />
      </div>
    </div>
  );
}

const AUDIENCES = ['Highways crews', 'Pump operators', 'Care homes', 'Residents'] as const;
const CHANNELS = ['SMS', 'App push', 'Email'] as const;

function AlertBuilder() {
  const city = getCity();
  const [cm, setCm] = useState(30);
  const [aud, setAud] = useState<string[]>(['Highways crews', 'Pump operators']);
  const [ch, setCh] = useState<string[]>(['SMS']);
  const th = cm / 100;
  const hits = city.streets.filter((s) => s.peak >= th);
  const first = hits.reduce((m, s) => {
    const h = Array.from(s.depth).findIndex((d) => d >= th);
    return h >= 0 && h < m ? h : m;
  }, 99);
  const firstStreet = hits.find((s) => Array.from(s.depth).findIndex((d) => d >= th) === first);
  const recipients = (aud.includes('Highways crews') ? 18 : 0) + (aud.includes('Pump operators') ? 9 : 0) + (aud.includes('Care homes') ? 12 : 0) + (aud.includes('Residents') ? hits.length * 37 : 0);
  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const needsSignoff = aud.includes('Residents') || aud.includes('Care homes');

  return (
    <div className="rule-builder">
      <div className="rb-row">
        <b id="th-l">When a street reaches</b>
        <div className="rb-slider">
          <input type="range" min={10} max={60} step={5} value={cm} onChange={(e) => setCm(Number(e.target.value))} aria-labelledby="th-l" aria-valuetext={`${cm} centimetres`} />
          <output aria-live="polite">{cm}&nbsp;cm</output>
        </div>
      </div>
      <div className="rb-row">
        <b>Notify</b>
        <div className="rb-chips" role="group" aria-label="Who to notify">
          {AUDIENCES.map((a) => (
            <button key={a} type="button" className="chip" aria-pressed={aud.includes(a)} onClick={() => toggle(aud, setAud, a)}>{a}</button>
          ))}
        </div>
      </div>
      <div className="rb-row">
        <b>By</b>
        <div className="rb-chips" role="group" aria-label="Channels">
          {CHANNELS.map((c) => (
            <button key={c} type="button" className="chip" aria-pressed={ch.includes(c)} onClick={() => toggle(ch, setCh, c)}>{c}</button>
          ))}
        </div>
      </div>
      <div className="rb-result" aria-live="polite">
        <div className="count">
          <span className="num">{hits.length}</span>
          <span className="small">streets would trigger in the Storm Hollis forecast, reaching <b className="tabular">{recipients.toLocaleString('en-GB')}</b> recipients{ch.length ? ` by ${ch.join(', ')}` : ''}.</span>
        </div>
        {firstStreet && aud.length > 0 && ch.length > 0 ? (
          <div className="msg-preview">
            <div className="mp-head"><span>First message · {clockLabel(Math.max(0, first - 9))}</span><span>{needsSignoff ? 'Waits for duty officer sign-off' : 'Sends automatically'}</span></div>
            Kelsford Flood Duty: {firstStreet.name} forecast to reach {cm}&nbsp;cm from {clockLabel(first)}. {aud.includes('Residents') ? 'Move cars off the street and keep drains clear. ' : 'Check your task list for closures and pump moves. '}Reply 1 to acknowledge.
          </div>
        ) : (
          <p className="small muted" style={{ margin: 0 }}>{hits.length === 0 ? `No street reaches ${cm} cm in this forecast, so nothing would be sent.` : 'Choose at least one group and one channel to preview the message.'}</p>
        )}
      </div>
    </div>
  );
}

const SNIPPETS: Record<'curl' | 'python' | 'js', string> = {
  curl: `curl https://api.tidemark.ai/v2/streets/kel-quay-st-04/depth \\
  -H "Authorization: Bearer $TIDEMARK_KEY" \\
  -G -d hours=72 -d quantiles=0.5,0.9`,
  python: `import tidemark

tm = tidemark.Client()          # reads TIDEMARK_KEY
series = tm.streets.depth(
    "kel-quay-st-04", hours=72, quantiles=[0.5, 0.9]
)
print(series.peak())           # 0.45 m at 2026-02-11T23:00Z`,
  js: `import { Tidemark } from "@tidemark/sdk";

const tm = new Tidemark(process.env.TIDEMARK_KEY);
const s = await tm.streets.depth("kel-quay-st-04", {
  hours: 72, quantiles: [0.5, 0.9],
});
console.log(s.peak); // { m: 0.45, at: "2026-02-11T23:00Z" }`,
};

function ApiBlock() {
  const [lang, setLang] = useState<'curl' | 'python' | 'js'>('curl');
  return (
    <div className="code-tabs">
      <Segmented
        tabs
        idBase="api"
        label="Code example language"
        value={lang}
        onChange={setLang}
        options={[{ value: 'curl', label: 'curl' }, { value: 'python', label: 'Python' }, { value: 'js', label: 'JavaScript' }]}
      />
      <div role="tabpanel" id={`api-panel-${lang}`} aria-labelledby={`api-tab-${lang}`} className="code-panel">
        <pre className="code" tabIndex={0}><code key={lang} className="code-fade">{SNIPPETS[lang]}</code></pre>
        <pre className="code" style={{ marginTop: 8 }} aria-label="Example response" tabIndex={0}><code>
{`{
  "street": "kel-quay-st-04",  "name": "Quay Street",
  "issued": "2026-02-10T06:00Z", "step": "PT1H",
  "depth_m": { "p50": [0, 0, … 0.41, 0.45, 0.38, …],
               "p90": [0, 0, … 0.55, 0.61, 0.52, …] },
  "first_exceeds": { "0.30": "2026-02-11T21:00Z" }
}`}
        </code></pre>
      </div>
    </div>
  );
}

export default function Product() {
  return (
    <>
      <section className="page-head">
        <div className="wrap page-head-grid">
          <div>
            <p className="kicker">Product</p>
            <h1>One forecast. A map, a message and a feed.</h1>
          </div>
          <p className="lede">Every Tidemark product reads from the same street-level forecast: depth and arrival time for each street, every 15 minutes, out to 72 hours, with its uncertainty attached.</p>
        </div>
      </section>
      <AnchorNav />

      <section id="forecast" className="product-block ops" aria-labelledby="forecast-h">
        <div className="wrap pb-grid">
          <div className="pb-copy">
            <h2 id="forecast-h" className="h2">Tidemark Forecast</h2>
            <p className="lede">The control-room map. See which streets will flood, how deep, when the water arrives and when it clears, so you can plan closures and pump moves a shift ahead.</p>
            <ul className="spec-list">
              <li><b>Resolution</b><span>Every street segment, typically 40–120 m long</span></li>
              <li><b>Horizon</b><span>72 hours, hourly steps; 15-minute steps for the first 12 hours</span></li>
              <li><b>Refresh</b><span>Every 15 minutes, and immediately when a gauge jumps</span></li>
              <li><b>Uncertainty</b><span>Most likely and reasonable-worst-case (p90) views, side by side</span></li>
              <li><b>Exports</b><span>Closure lists as CSV, map layers as GeoJSON and WMS</span></li>
            </ul>
          </div>
          <ForecastDash />
        </div>
      </section>

      <section id="alerts" className="product-block" aria-labelledby="alerts-h">
        <div className="wrap pb-grid">
          <div className="pb-copy">
            <h2 id="alerts-h" className="h2">Tidemark Alerts</h2>
            <p className="lede">Rules you write once, in your own thresholds. When a street’s forecast crosses one, the right crews get a task and residents get a plain warning, after your duty officer signs it off.</p>
            <ul className="spec-list">
              <li><b>Channels</b><span>SMS, the Tidemark Crew app, email and your CAD system via webhook</span></li>
              <li><b>Sign-off</b><span>Public messages always wait for a named officer; crew tasks can go straight out</span></li>
              <li><b>Acknowledgement</b><span>Crews reply 1; unacknowledged tasks escalate after 10 minutes</span></li>
              <li><b>Languages</b><span>Resident messages in 14 languages, written to a reading age of 9</span></li>
            </ul>
          </div>
          <AlertBuilder />
        </div>
      </section>

      <section id="api" className="product-block ops" aria-labelledby="api-h">
        <div className="wrap pb-grid">
          <div className="pb-copy">
            <h2 id="api-h" className="h2">Tidemark API</h2>
            <p className="lede">Forecast tiles and per-street time series for insurers, fleet operators and logistics planners. Every value comes with its p50 and p90, so you can price and route on risk rather than guesswork.</p>
            <ul className="endpoints">
              <li><span className="verb">GET</span><code>/v2/tiles/depth/{'{z}/{x}/{y}'}.png?t=…</code><p>Map tiles of forecast depth for any hour</p></li>
              <li><span className="verb">GET</span><code>/v2/streets/{'{id}'}/depth</code><p>Hourly depth series with quantiles</p></li>
              <li><span className="verb">POST</span><code>/v2/points/exposure</code><p>Up to 10,000 addresses or depots per call</p></li>
              <li><span className="verb">GET</span><code>/v2/events/{'{id}'}/hindcast</code><p>Past events, for pricing and back-testing</p></li>
            </ul>
          </div>
          <ApiBlock />
        </div>
      </section>

      <section className="section">
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="lede" style={{ margin: 0 }}>Want to know how the forecast underneath all three is made?</p>
          <Link to="/how-it-works" className="btn btn-quiet">How the model works <Arrow /></Link>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
