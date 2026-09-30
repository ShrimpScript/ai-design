import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import ForecastConsole from '../viz/ForecastConsole';
import InputGlyph from '../viz/InputGlyph';
import Sparkline from '../viz/Sparkline';
import CtaBand from '../components/CtaBand';
import { Arrow } from '../components/Icons';
import { INPUTS, CUSTOMERS } from '../data/content';
import { getCity, clockLabel } from '../viz/city';

const StormStory = lazy(() => import('../viz/StormStory'));

function WatchList() {
  const city = getCity();
  const seen = new Set<string>();
  const top = [...city.streets]
    .sort((a, b) => b.peak - a.peak)
    .filter((s) => (seen.has(s.name) ? false : (seen.add(s.name), true)))
    .slice(0, 4);
  return (
    <div className="crop crop-ops" aria-label="Example: Tidemark Forecast street watch list">
      <div className="crop-head"><span>Streets to watch</span><span className="muted">peak depth · time</span></div>
      <ul className="watch">
        {top.map((s) => (
          <li key={s.id}>
            <span className="w-name">{s.name}</span>
            <Sparkline series={s.depth} width={96} height={28} />
            <span className="w-peak tabular">{Math.round(s.peak * 100)}&nbsp;cm</span>
            <span className="w-when tabular muted">{clockLabel(s.peakHour)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlertPreview() {
  return (
    <div className="crop crop-paper" aria-label="Example: Tidemark Alerts message">
      <div className="crop-head"><span>Crew alert · approved 21:04</span><span className="pill alert">Sent to 14</span></div>
      <div className="sms">
        <p><strong>Kelsford Flood Duty:</strong> Quay St forecast 45&nbsp;cm from 22:00 Wed, peak 23:00. Close at Ferry Ln junction by 21:30. Pump P4 to Wharf Rd basin.</p>
        <span className="small muted">Reply 1 to acknowledge</span>
      </div>
      <div className="acks small"><span className="ack-dot" />11 of 14 acknowledged in 6 min</div>
    </div>
  );
}

function ApiPreview() {
  return (
    <pre className="code crop-code" aria-label="Example: Tidemark API request">
      <code>
        <span className="c"># depth series for one street, next 72 h</span>{'\n'}
        <span className="k">GET</span> /v2/streets/<span className="s">kel-quay-st-04</span>/depth{'\n'}
        {'\n'}
        {'{'} <span className="s">"peak_m"</span>: <span className="n">0.45</span>,{'\n'}
        {'  '}<span className="s">"peak_at"</span>: <span className="s">"2026-02-11T23:00Z"</span>,{'\n'}
        {'  '}<span className="s">"p90_m"</span>: <span className="n">0.61</span> {'}'}
      </code>
    </pre>
  );
}

export default function Home() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-h">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="kicker hero-kicker">Winter 2026: forecasting live in 11 cities and 3 ports</p>
            <h1 id="hero-h">Know which streets flood, 72&nbsp;hours before the water does.</h1>
            <p className="lede hero-lede">
              Tidemark forecasts flood depth and timing for every street in your city from the radar, tide, river and drain data you already hold, so crews move pumps and close roads before the water arrives.
            </p>
            <div className="hero-actions">
              <Link to="/demo" className="btn btn-primary">Request a demo <Arrow /></Link>
              <Link to="/customers" className="btn btn-quiet">Replay Storm Hollis</Link>
            </div>
            <p className="hero-note small muted">The map is a live example: scrub the forecast clock or point at a street.</p>
          </div>
          <div className="hero-visual">
            <ForecastConsole />
          </div>
        </div>
      </section>

      <section className="proof" aria-labelledby="proof-h">
        <div className="wrap">
          <h2 id="proof-h" className="visually-hidden">Results from Storm Hollis, Kelsford</h2>
          <div className="proof-grid">
            <div className="proof-item">
              <span className="num proof-num">38<span className="unit">of 41</span></span>
              <p>streets that flooded in Kelsford during Storm Hollis were on Tidemark’s list 48&nbsp;hours earlier.</p>
            </div>
            <div className="proof-item">
              <span className="num proof-num">61<span className="unit">h</span></span>
              <p>between the first street-level warning and water reaching Quay Street.</p>
            </div>
            <div className="proof-item">
              <span className="num proof-num">0<span className="unit">cars</span></span>
              <p>stranded in flood water, against 64 in the comparable storm of November 2023.</p>
            </div>
          </div>
          <div className="customer-row">
            <span className="small muted">Forecasting for</span>
            <ul>
              {CUSTOMERS.slice(0, 5).map((c) => <li key={c.name}>{c.name}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="section ops story" aria-labelledby="story-h">
        <div className="wrap">
          <div className="section-head">
            <p className="kicker" style={{ color: 'var(--ops-muted)' }}>Storm Hollis, 10–12 February 2026</p>
            <h2 id="story-h">One storm, 72 hours, street by street.</h2>
            <p>Scroll through the forecast Kelsford’s duty officers watched. The map is the same model output, advancing hour by hour.</p>
          </div>
          <Suspense fallback={<div style={{ minHeight: '300vh' }} />}>
            <StormStory />
          </Suspense>
        </div>
      </section>

      <section className="section" aria-labelledby="products-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="products-h">One forecast, three ways to act on it.</h2>
            <p>The same street-level forecast drives the map your control room watches, the messages your crews receive and the data your partners pull.</p>
          </div>
          <div className="prod-rows">
            <article className="prod-row">
              <div className="prod-text">
                <h3 className="prod-name">Tidemark Forecast</h3>
                <p>A live map of flood depth and arrival time for every street, updated every 15 minutes, with the uncertainty shown rather than hidden.</p>
                <Link to="/product#forecast" className="text-link">Inside Forecast</Link>
              </div>
              <WatchList />
            </article>
            <article className="prod-row">
              <div className="prod-text">
                <h3 className="prod-name">Tidemark Alerts</h3>
                <p>Warnings to crews and residents by SMS and app when a street’s forecast crosses the depth you set, with a human signing off every public message.</p>
                <Link to="/product#alerts" className="text-link">Inside Alerts</Link>
              </div>
              <AlertPreview />
            </article>
            <article className="prod-row">
              <div className="prod-text">
                <h3 className="prod-name">Tidemark API</h3>
                <p>Forecast tiles and per-street time series for insurers, fleets and logistics planners, with probabilistic depth on every value.</p>
                <Link to="/product#api" className="text-link">Inside the API</Link>
              </div>
              <ApiPreview />
            </article>
          </div>
        </div>
      </section>

      <section className="section paper-2" aria-labelledby="inputs-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="inputs-h">Five sources you mostly already have.</h2>
            <p>Most cities hold four of these already. We connect them, clean them and keep them flowing; your drain register is usually the only file we ask for.</p>
          </div>
          <ul className="inputs-grid">
            {INPUTS.map((inp, i) => (
              <li key={inp.kind} className="input-item">
                <InputGlyph kind={inp.kind} level={0.35 + i * 0.12} />
                <h3>{inp.name}</h3>
                <p className="small muted">{inp.why}</p>
              </li>
            ))}
          </ul>
          <Link to="/how-it-works" className="btn btn-quiet" style={{ marginTop: 32 }}>How the model combines them <Arrow /></Link>
        </div>
      </section>

      <section className="section quote-section" aria-labelledby="quote-h">
        <div className="wrap quote-grid">
          <h2 id="quote-h" className="visually-hidden">What Kelsford’s emergency planners said</h2>
          <blockquote className="big-quote">
            <p>“On Tuesday morning I had a list of the fifty-six streets we were likely to lose on Wednesday night. We’d never had a list before. We had a feeling.”</p>
            <footer>
              <span className="q-name">Aoife Brennan</span>
              <span className="small muted">Head of Emergency Planning, Kelsford City Council</span>
            </footer>
          </blockquote>
          <Link to="/customers" className="text-link">Read the Storm Hollis case study</Link>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
