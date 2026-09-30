import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import ForecastConsole from '../graphics/ForecastConsole';
import AlertBuilder from '../graphics/AlertBuilder';
import ApiPanel from '../graphics/ApiPanel';
import CtaBand from '../components/CtaBand';
import { useDocumentTitle } from '../lib/hooks';
import '../styles/pages.css';

const SECTIONS = [
  { id: 'forecast', label: 'Forecast' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'api', label: 'API' },
];

export default function Product() {
  useDocumentTitle('Product');
  const [params, setParams] = useSearchParams();
  const refs = useRef<Record<string, HTMLElement | null>>({});
  const target = params.get('p');

  useEffect(() => {
    if (!target || !refs.current[target]) return;
    const t = setTimeout(() => {
      const el = refs.current[target];
      if (!el) return;
      el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
      el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true });
    }, 60);
    return () => clearTimeout(t);
  }, [target]);

  return (
    <>
      <section className="wrap page-intro" aria-labelledby="product-title">
        <h1 id="product-title">Three ways to act on one forecast</h1>
        <p className="lede">
          The control room watches the map. Crews and residents get a text. Insurers and logistics teams pull the numbers into
          their own systems. All three read the same model run, every 15 minutes.
        </p>
      </section>

      <nav className="product-jump" aria-label="Products on this page">
        <div className="wrap">
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#/product?p=${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setParams({ p: s.id }, { replace: true, preventScrollReset: true });
                  }}
                  aria-current={target === s.id ? 'true' : undefined}
                >
                  Tidemark {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <section
        className="section product-block"
        ref={(el) => {
          refs.current.forecast = el;
        }}
        aria-labelledby="p-forecast"
      >
        <div className="wrap product-block__grid">
          <div className="product-block__text">
            <h2 id="p-forecast" tabIndex={-1}>Tidemark Forecast</h2>
            <p className="lede">The live flood map for your control room: how deep, where, and when, for the next 72 hours.</p>
            <ul className="feature-list">
              <li>Depth and arrival time for every street, refreshed every 15 minutes.</li>
              <li>A likely case and a reasonable worst case, side by side, so you can plan for both.</li>
              <li>Streets listed by when water arrives, ready to paste into your road-closure plan.</li>
              <li>Your own layers on top: pumps, care homes, substations, schools, evacuation routes.</li>
            </ul>
          </div>
          <div className="product-block__demo">
            <ForecastConsole />
            <p className="demo-note">Pick a street to jump to its peak. This is the Storm Idris forecast for Kessling.</p>
          </div>
        </div>
      </section>

      <section
        className="section section--sunk product-block"
        ref={(el) => {
          refs.current.alerts = el;
        }}
        aria-labelledby="p-alerts"
      >
        <div className="wrap product-block__grid product-block__grid--flip">
          <div className="product-block__text">
            <h2 id="p-alerts" tabIndex={-1}>Tidemark Alerts</h2>
            <p className="lede">Warnings that name the street and the hour, sent to the people who need to move.</p>
            <ul className="feature-list">
              <li>Rules by street, depth and notice time. Crews get jobs; residents get plain instructions.</li>
              <li>Text message, app push and voice call, in 38 languages, with delivery receipts.</li>
              <li>Every alert is held for a duty officer to approve, or sent automatically above a level you choose.</li>
              <li>All-clear messages go out when the forecast drops, so people know when to come back.</li>
            </ul>
          </div>
          <div className="product-block__demo">
            <AlertBuilder />
          </div>
        </div>
      </section>

      <section
        className="section product-block"
        ref={(el) => {
          refs.current.api = el;
        }}
        aria-labelledby="p-api"
      >
        <div className="wrap product-block__grid">
          <div className="product-block__text">
            <h2 id="p-api" tabIndex={-1}>Tidemark API</h2>
            <p className="lede">Forecast tiles and time series for insurers, logistics and anyone building on flood risk.</p>
            <ul className="feature-list">
              <li>Street, address and site time series with probability bands, for 72 hours ahead.</li>
              <li>Map tiles in our palette or as raw depth, ready for your own GIS or app.</li>
              <li>Webhooks when a site you watch crosses a threshold.</li>
              <li>Ten years of hindcast storms for pricing and back-testing.</li>
            </ul>
          </div>
          <div className="product-block__demo">
            <ApiPanel />
          </div>
        </div>
      </section>

      <section className="section section--sunk" aria-labelledby="trust-title">
        <div className="wrap trust">
          <h2 id="trust-title">Built to stay up when the weather is worst</h2>
          <dl className="trust__list">
            <div>
              <dt>Uptime during named storms</dt>
              <dd>99.98% over the last three winters, across two cloud regions in the EU and US.</dd>
            </div>
            <div>
              <dt>Security</dt>
              <dd>SOC 2 Type II and ISO 27001. Single sign-on with your city’s identity provider.</dd>
            </div>
            <div>
              <dt>Your data</dt>
              <dd>Drain and asset records stay in your region and are never used to train models for other customers.</dd>
            </div>
            <div>
              <dt>People on call</dt>
              <dd>A hydrologist is on duty around the clock from the first storm warning until the all-clear.</dd>
            </div>
          </dl>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
