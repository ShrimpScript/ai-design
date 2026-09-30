import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Segmented from '../components/Segmented';
import Accordion from '../components/Accordion';
import CtaBand from '../components/CtaBand';
import { Check } from '../components/Icons';

const PLANS = [
  {
    name: 'Town', for: 'Up to 250,000 people, one drainage network', price: '£38,000', unit: 'per year',
    items: ['Tidemark Forecast for every street', 'Crew alerts, up to 50 staff', 'One hindcast of a past flood', '8-week onboarding'],
    cta: 'Talk to us about Town',
  },
  {
    name: 'City', for: '250,000 to 1.5 million people', price: 'from £96,000', unit: 'per year',
    items: ['Everything in Town', 'Resident alerts in 14 languages (SMS at cost)', 'Worst-case (p90) views and closure exports', '24/7 duty line with a hydrologist', 'Three hindcasts a year'],
    cta: 'Talk to us about City', featured: true,
  },
  {
    name: 'Region & port', for: 'Several networks, estuaries or a port estate', price: 'Custom', unit: 'annual contract',
    items: ['Everything in City', 'Berths, lock gates and quays as named assets', 'Multiple utilities on one forecast', '99.95% forecast availability SLA'],
    cta: 'Talk to us about a region',
  },
];

function estimate(pop: number) {
  if (pop <= 250_000) return { plan: 'Town', price: 38_000 };
  if (pop <= 1_500_000) return { plan: 'City', price: Math.round((96_000 + ((pop - 250_000) / 1000) * 40) / 1000) * 1000 };
  return { plan: 'Region & port', price: null };
}
// log-scale slider: 50k .. 3M
const toPop = (v: number) => Math.round(Math.exp(Math.log(50_000) + (v / 100) * (Math.log(3_000_000) - Math.log(50_000))) / 5000) * 5000;

function Estimator() {
  const [v, setV] = useState(58);
  const pop = toPop(v);
  const e = estimate(pop);
  const reduce = useReducedMotion();
  return (
    <div className="estimator">
      <div>
        <label htmlFor="pop" style={{ fontWeight: 700, display: 'block', marginBottom: 8 }}>Population inside your flood-risk boundary</label>
        <p className="num tabular" style={{ fontSize: '2rem', margin: '0 0 8px' }}>{pop.toLocaleString('en-GB')}</p>
        <input id="pop" type="range" min={0} max={100} value={v} onChange={(ev) => setV(Number(ev.target.value))} aria-valuetext={`${pop.toLocaleString('en-GB')} people`} />
        <div className="est-ticks tabular" aria-hidden="true"><span>50k</span><span>250k</span><span>1.5m</span><span>3m</span></div>
      </div>
      <div className="est-out" aria-live="polite">
        <span className="small muted">Estimated plan: <b style={{ color: 'var(--ink)' }}>{e.plan}</b></span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={e.price ?? 'custom'}
            className="num tabular"
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
          >
            {e.price ? `£${e.price.toLocaleString('en-GB')}` : 'Custom'}
          </motion.span>
        </AnimatePresence>
        <span className="small muted">{e.price ? 'per year, before resident SMS (about 3.2p a message)' : 'We price regions on the number of networks and assets.'}</span>
      </div>
    </div>
  );
}

function ApiRates() {
  return (
    <div className="chart-card" style={{ marginTop: 32 }}>
      <table className="data api-rates">
        <caption className="visually-hidden">Tidemark API pricing</caption>
        <thead>
          <tr><th scope="col">Plan</th><th scope="col">Includes</th><th scope="col" className="r">Price</th></tr>
        </thead>
        <tbody>
          <tr><td><b>Developer</b></td><td>5,000 calls a month on hindcast data, one city</td><td className="r">Free</td></tr>
          <tr><td><b>Growth</b></td><td>250,000 live calls a month, all published cities, p50 and p90</td><td className="r tabular">£1,200 / month</td></tr>
          <tr><td>Extra series calls</td><td>Per-street or per-point time series beyond the allowance</td><td className="r tabular">£0.004 each</td></tr>
          <tr><td>Map tiles</td><td>Forecast depth tiles, any hour to 72&nbsp;h</td><td className="r tabular">£0.50 / 1,000</td></tr>
          <tr><td><b>Portfolio</b></td><td>Bulk exposure for up to 5 million insured addresses or depots, event hindcasts for pricing</td><td className="r">Custom</td></tr>
        </tbody>
      </table>
    </div>
  );
}

const FAQ = [
  { q: 'What do we need to provide?', a: 'Your drainage asset register (pipes, gullies, outfalls, pumps) and the names of any gauges you operate. We connect national radar, tide and river feeds ourselves. Most councils send one export and one spreadsheet.' },
  { q: 'How long until we have a live forecast?', a: 'Eight to twelve weeks. The last two weeks are a blind hindcast of a flood you choose; you decide whether we pass before any contract fee is due.' },
  { q: 'Who pays for resident SMS?', a: 'You do, at the carrier’s cost with no markup, about 3.2p per message in the UK. App push and email are included.' },
  { q: 'Can the water utility and the council share one licence?', a: 'Yes. City and Region plans cover every organisation responding to the same flood area, each with its own users and alert rules.' },
  { q: 'Where is our data held?', a: 'In the UK or EU for European customers and in the US for American ones. Drain registers never leave your region, and we hold no resident contact data.' },
];

export default function Pricing() {
  const [tab, setTab] = useState<'ops' | 'api'>('ops');
  const reduce = useReducedMotion();
  return (
    <>
      <section className="page-head">
        <div className="wrap page-head-grid">
          <div>
            <p className="kicker">Pricing, 2026–27 season</p>
            <h1>Priced by the people you protect.</h1>
          </div>
          <p className="lede">Cities, utilities and ports pay one annual fee based on the population inside the flood-risk boundary. Insurers and logistics teams pay for what they call.</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Segmented
            tabs
            idBase="price"
            label="Pricing for"
            value={tab}
            onChange={setTab}
            options={[{ value: 'ops', label: 'Cities, utilities & ports' }, { value: 'api', label: 'API for insurers & logistics' }]}
          />
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              role="tabpanel"
              id={`price-panel-${tab}`}
              aria-labelledby={`price-tab-${tab}`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.15 }}
            >
              {tab === 'ops' ? (
                <>
                  <div className="plans">
                    {PLANS.map((p) => (
                      <article key={p.name} className={`plan ${p.featured ? 'featured' : ''}`} aria-labelledby={`plan-${p.name}`}>
                        <div>
                          <h2 id={`plan-${p.name}`} className="plan-name">{p.name}</h2>
                          <p className="for">{p.for}</p>
                        </div>
                        <div className="price"><span className="num tabular">{p.price}</span><small>{p.unit}</small></div>
                        <ul>
                          {p.items.map((it) => <li key={it}><Check size={13} />{it}</li>)}
                        </ul>
                        <Link to="/demo" className={`btn ${p.featured ? 'btn-primary' : 'btn-quiet'}`}>{p.cta}</Link>
                      </article>
                    ))}
                  </div>
                  <Estimator />
                </>
              ) : (
                <ApiRates />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section className="section paper-2" aria-labelledby="faq-h">
        <div className="wrap faq-grid">
          <div className="section-head">
            <h2 id="faq-h">Questions procurement teams ask.</h2>
          </div>
          <Accordion items={FAQ} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
