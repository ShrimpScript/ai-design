import { useState } from 'react';
import { ButtonLink } from '../components/Button';
import CtaBand from '../components/CtaBand';
import { useDocumentTitle, useTweenedNumber } from '../lib/hooks';
import '../styles/pages.css';
import '../styles/pricing.css';

type Currency = 'EUR' | 'USD';
const RATE: Record<Currency, number> = { EUR: 1, USD: 1.1 };
const SYMBOL: Record<Currency, string> = { EUR: '€', USD: '$' };

const fmt = (n: number, c: Currency) => `${SYMBOL[c]}${Math.round(n).toLocaleString('en-US')}`;
const round500 = (n: number) => Math.round(n / 500) * 500;

const PLANS = [
  {
    id: 'forecast',
    name: 'Forecast',
    price: 48000,
    unit: 'per year',
    for: 'For a city emergency team or water utility starting with the map.',
    includes: [
      'Tidemark Forecast for up to 50 km²',
      '25 named users, single sign-on',
      'Ten-year hindcast of your storms',
      'Eight-week onboarding',
      'Forecaster on call during named storms',
    ],
    cta: 'Talk to us about Forecast',
  },
  {
    id: 'alerts',
    name: 'Forecast and Alerts',
    price: 72000,
    unit: 'per year',
    for: 'For cities that want crews and residents warned street by street.',
    includes: [
      'Everything in Forecast',
      'Tidemark Alerts for unlimited crews',
      'Resident alerts by text, app and voice',
      '38 languages, delivery receipts',
      'Approval workflow for duty officers',
    ],
    cta: 'Talk to us about Alerts',
    featured: true,
  },
  {
    id: 'region',
    name: 'Region and ports',
    price: null,
    unit: 'priced per region',
    for: 'For several councils, a whole catchment, or a port estate with its own gauges.',
    includes: [
      'Forecast and Alerts across any area',
      'Your own gauges and sensors as inputs',
      'Dedicated forecaster and 24/7 line',
      'Data kept in your cloud or on site',
      'Custom thresholds per asset',
    ],
    cta: 'Talk to us about a region',
  },
];

const FAQ = [
  {
    q: 'Do you charge per storm or per alert?',
    a: 'No. Forecast and Alerts are a fixed annual price, so nobody hesitates to send a warning because of cost. Resident text messages are included up to 40 per resident per year, which no customer has reached.',
  },
  {
    q: 'Can we try it before we sign?',
    a: 'Yes. A paid pilot runs your last ten years of storms through Tidemark and scores every street against your records. It costs €15,000 and the full amount is credited to your first year if you continue.',
  },
  {
    q: 'Can we buy through a public procurement framework?',
    a: 'Tidemark is listed on public-sector software frameworks in the EU, UK and US. We also answer direct tenders, and can give you our standard terms before you write one.',
  },
  {
    q: 'What happens if Tidemark goes down during a storm?',
    a: 'Forecasts run in two cloud regions at once, and the last good forecast stays available offline in the app. Over the last three winters, availability during named storms was 99.98%.',
  },
  {
    q: 'Who owns the data?',
    a: 'You own your drain records, gauges and alert lists. They stay in your region, are never shared, and are never used to train models for other customers.',
  },
];

export default function Pricing() {
  useDocumentTitle('Pricing');
  const [cur, setCur] = useState<Currency>('EUR');
  const [area, setArea] = useState(120);
  const [alerts, setAlerts] = useState(true);
  const [residents, setResidents] = useState(60);

  // Estimator: base plan covers 50 km², then a tapering per-km² rate
  const extraKm = Math.max(0, area - 50);
  const areaCost = extraKm <= 250 ? extraKm * 240 : 250 * 240 + (extraKm - 250) * 120;
  const base = (alerts ? 72000 : 48000) + areaCost;
  const residentCost = alerts ? Math.max(0, residents - 50) * 90 : 0; // above 50k residents
  const total = round500((base + residentCost) * RATE[cur]);
  const shown = useTweenedNumber(total);

  return (
    <>
      <section className="wrap page-intro" aria-labelledby="pricing-title">
        <h1 id="pricing-title">Priced by the area you protect</h1>
        <p className="lede">
          Annual contracts, sized by the area we forecast. Every plan includes onboarding, a hindcast of your last ten years of storms,
          and a forecaster on call when a named storm is coming.
        </p>
      </section>

      <section className="section section--tight-top" aria-labelledby="plans-title">
        <div className="wrap">
          <div className="plans-head">
            <h2 id="plans-title" className="visually-hidden">Plans</h2>
            <fieldset className="seg seg--small">
              <legend className="visually-hidden">Currency</legend>
              <div className="seg__opts">
                {(['EUR', 'USD'] as Currency[]).map((c) => (
                  <label key={c} className="seg__opt">
                    <input type="radio" name="cur" value={c} checked={cur === c} onChange={() => setCur(c)} />
                    <span>{c === 'EUR' ? 'Euro' : 'US dollar'}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <ul className="plans">
            {PLANS.map((p) => (
              <li key={p.id} className={`plan ${p.featured ? 'plan--featured' : ''}`}>
                <h3>{p.name}</h3>
                {p.featured && <p className="plan__note">Chosen by most cities</p>}
                <p className="plan__price">
                  {p.price ? (
                    <>
                      <span className="plan__from">from</span>{' '}
                      <strong className="num">{fmt(round500(p.price * RATE[cur]), cur)}</strong>
                    </>
                  ) : (
                    <strong>Custom</strong>
                  )}
                  <span className="plan__unit">{p.unit}</span>
                </p>
                <p className="plan__for">{p.for}</p>
                <ul className="plan__list">
                  {p.includes.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <ButtonLink to={`/demo?plan=${p.id}`} variant={p.featured ? 'primary' : 'secondary'}>
                  {p.cta}
                </ButtonLink>
              </li>
            ))}
          </ul>

          <div className="api-price">
            <div>
              <h3>Tidemark API</h3>
              <p>For insurers, logistics and developers. Monthly, no annual commitment.</p>
            </div>
            <p className="api-price__num">
              <strong className="num">{fmt(round500(1500 * RATE[cur]), cur)}</strong> per month, including 2 million tile requests and 50,000
              time-series calls. Then {SYMBOL[cur]}
              {(0.4 * RATE[cur]).toFixed(2)} per thousand tiles.
            </p>
            <ButtonLink to="/demo?plan=api" variant="secondary">Get an API key</ButtonLink>
          </div>
        </div>
      </section>

      <section className="section section--sunk" aria-labelledby="est-title">
        <div className="wrap estimator">
          <div className="estimator__text">
            <h2 id="est-title">Estimate your annual cost</h2>
            <p className="lede">A starting point for your budget. Your quote will match it unless your drain data needs extra work.</p>
          </div>
          <form className="estimator__form" onSubmit={(e) => e.preventDefault()}>
            <div className="alerts__field">
              <label htmlFor="est-area">
                Area to forecast: <strong className="num">{area.toLocaleString('en-US')} km²</strong>
              </label>
              <input
                id="est-area"
                className="range"
                type="range"
                min={10}
                max={1500}
                step={10}
                value={area}
                style={{ ['--fill' as string]: `${((area - 10) / 1490) * 100}%` }}
                onChange={(e) => setArea(Number(e.target.value))}
              />
              <p className="estimator__hint">Kessling is 118 km². A large port estate is 20 to 60 km².</p>
            </div>
            <label className="check">
              <input type="checkbox" checked={alerts} onChange={(e) => setAlerts(e.target.checked)} />
              <span className="check__box" aria-hidden="true" />
              <span>Include Tidemark Alerts</span>
            </label>
            <div className={`alerts__field ${alerts ? '' : 'is-disabled'}`}>
              <label htmlFor="est-res">
                Residents who can sign up for alerts: <strong className="num">{(residents * 1000).toLocaleString('en-US')}</strong>
              </label>
              <input
                id="est-res"
                className="range"
                type="range"
                min={10}
                max={1000}
                step={10}
                value={residents}
                disabled={!alerts}
                style={{ ['--fill' as string]: `${((residents - 10) / 990) * 100}%` }}
                onChange={(e) => setResidents(Number(e.target.value))}
              />
            </div>
            <output className="estimator__out" htmlFor="est-area est-res" aria-live="polite">
              <span>Estimated annual cost</span>
              <strong className="num" aria-hidden="true">{fmt(round500(shown), cur)}</strong>
              <span className="visually-hidden">{fmt(total, cur)}</span>
            </output>
          </form>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-title">
        <div className="wrap faq">
          <h2 id="faq-title">Questions buyers ask</h2>
          <div className="faq__list">
            {FAQ.map((f) => (
              <details key={f.q} className="faq__item">
                <summary>
                  <span>{f.q}</span>
                  <span className="faq__icon" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
