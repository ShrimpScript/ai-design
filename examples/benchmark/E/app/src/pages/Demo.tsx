import { useRef, useState } from 'react';
import type React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Alert, Arrow, Check } from '../components/Icons';

type Values = {
  name: string; email: string; org: string; role: string; orgType: string; region: string;
  products: string[]; timeline: string; message: string; consent: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;

const ORG_TYPES = [
  { v: 'city', t: 'City or county', s: 'Emergency management, highways' },
  { v: 'utility', t: 'Water utility', s: 'Drainage, wastewater, pumping' },
  { v: 'port', t: 'Port authority', s: 'Quays, berths, lock gates' },
  { v: 'api', t: 'Insurer or logistics', s: 'API and portfolio data' },
];
const PRODUCTS = ['Forecast', 'Alerts', 'API'];
const FREE_MAIL = /@(gmail|googlemail|yahoo|hotmail|outlook|live|icloud|aol|proton|protonmail)\./i;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = 'Enter your name.';
  if (!v.email.trim()) e.email = 'Enter your work email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'That email doesn’t look complete. Check for a missing @ or domain.';
  else if (FREE_MAIL.test(v.email)) e.email = 'Use your work email so we can match you to your organisation’s flood area.';
  if (!v.org.trim()) e.org = 'Enter your organisation.';
  if (!v.orgType) e.orgType = 'Choose the kind of organisation you work for.';
  if (!v.region.trim()) e.region = 'Tell us which city, catchment or port you cover.';
  if (v.products.length === 0) e.products = 'Choose at least one product.';
  if (v.message.length > 800) e.message = `Keep this under 800 characters (${v.message.length} now).`;
  if (!v.consent) e.consent = 'We need your agreement to contact you about this demo.';
  return e;
}

// Mock endpoint. Fails when the browser is offline, or when the organisation name contains
// "error" (so the error state can be reviewed).
async function submitDemo(v: Values) {
  await new Promise((r) => setTimeout(r, 1200));
  if (!navigator.onLine || /error/i.test(v.org)) throw new Error('scheduler-timeout');
  return { ref: `TM-${(Date.now() % 100000).toString().padStart(5, '0')}` };
}

const FIELD_ORDER: (keyof Values)[] = ['name', 'email', 'org', 'role', 'orgType', 'region', 'products', 'timeline', 'message', 'consent'];

function FieldError({ id, msg }: { id: string; msg?: string }) {
  const reduce = useReducedMotion();
  return (
    <AnimatePresence initial={false}>
      {msg && (
        <motion.p
          id={id}
          className="field-error"
          initial={reduce ? false : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
        >
          <Alert />
          {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export default function Demo() {
  const [v, setV] = useState<Values>({ name: '', email: '', org: '', role: '', orgType: '', region: '', products: ['Forecast'], timeline: '', message: '', consent: false });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'success'>('idle');
  const [ref, setRef] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const errors = validate(v);
  const show = (k: keyof Values) => (touched[k] || submitted ? errors[k] : undefined);
  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((p) => ({ ...p, [k]: val }));
  const blur = (k: keyof Values) => () => setTouched((t) => ({ ...t, [k]: true }));
  const fieldProps = (k: keyof Values) => ({
    id: `f-${k}`,
    'aria-invalid': show(k) ? true : undefined,
    'aria-describedby': [show(k) ? `e-${k}` : '', `h-${k}`].filter(Boolean).join(' ') || undefined,
    onBlur: blur(k),
  });
  const state = (k: keyof Values) => ({ 'data-invalid': show(k) ? 'true' : undefined, 'data-valid': touched[k] && !errors[k] && (v[k] as string) ? 'true' : undefined });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus('sending');
    try {
      const r = await submitDemo(v);
      setRef(r.ref);
      setStatus('success');
      requestAnimationFrame(() => successRef.current?.focus());
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    } catch {
      setStatus('error');
      requestAnimationFrame(() => errorRef.current?.focus());
    }
  };

  const errList = FIELD_ORDER.filter((k) => errors[k]);

  return (
    <section className="page-head" style={{ paddingBottom: 'var(--section)' }}>
      <div className="wrap demo-grid">
        <div className="demo-side">
          <p className="kicker">Request a demo</p>
          <h1>Bring us your last flood.</h1>
          <p className="lede" style={{ marginTop: 24 }}>A 45-minute call with a Tidemark hydrologist and someone who has run a flood duty rota. We’ll show your city’s streets in the live forecast and plan a hindcast of an event you remember.</p>
          <ol>
            <li><div><b>Within one working day</b><span>A hydrologist replies to book the call, usually the same day.</span></div></li>
            <li><div><b>On the call</b><span>We walk through a live forecast and agree which past flood to hindcast.</span></div></li>
            <li><div><b>Three weeks later</b><span>You see the streets we would have flagged, and when, beside what really flooded.</span></div></li>
          </ol>
          <p className="small muted" style={{ marginTop: 32 }}>Existing customer with a live incident? Call the duty line on <a className="text-link" href="tel:+442038904417">+44 20 3890 4417</a>.</p>
        </div>

        <div className="form-card">
          <AnimatePresence mode="wait" initial={false}>
            {status === 'success' ? (
              <motion.div
                key="ok"
                ref={successRef}
                tabIndex={-1}
                className="success"
                role="status"
                initial={reduce ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.36, ease: [0.25, 1, 0.5, 1] }}
                style={{ outline: 'none' }}
              >
                <svg className="gauge-anim" viewBox="0 0 88 88" aria-hidden="true">
                  <rect x="30" y="6" width="8" height="76" rx="2" fill="#0e2229" />
                  {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x="38" y={8 + i * 12} width={i % 2 ? 9 : 16} height="4" rx="1" fill="#0e2229" />)}
                  <motion.rect x="14" width="60" height="6" rx="3" fill="#f0a81c" initial={reduce ? { y: 30 } : { y: 78 }} animate={{ y: 30 }} transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1], delay: 0.1 }} />
                </svg>
                <h2>Request received, {v.name.split(' ')[0]}.</h2>
                <p style={{ margin: 0 }}>A Tidemark hydrologist will email <b>{v.email}</b> within one working day to book your call. Your reference is <b className="tabular">{ref}</b>.</p>
                <dl>
                  <dt>Organisation</dt><dd>{v.org}</dd>
                  <dt>Area</dt><dd>{v.region}</dd>
                  <dt>Interested in</dt><dd>{v.products.map((p) => `Tidemark ${p}`).join(', ')}</dd>
                </dl>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                  <Link to="/how-it-works" className="btn btn-ink">Read how the model works <Arrow /></Link>
                  <button type="button" className="btn btn-quiet" onClick={() => { setStatus('idle'); setSubmitted(false); setTouched({}); }}>Send another request</button>
                </div>
              </motion.div>
            ) : (
              <motion.form key="form" noValidate onSubmit={onSubmit} aria-labelledby="form-h" initial={false} exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <h2 id="form-h" className="visually-hidden">Demo request form</h2>
                {submitted && errList.length > 0 && (
                  <div ref={summaryRef} tabIndex={-1} className="form-summary" role="alert" style={{ outline: 'none' }}>
                    <h2>{errList.length === 1 ? 'One thing to fix before we can send this' : `${errList.length} things to fix before we can send this`}</h2>
                    <ul>
                      {errList.map((k) => (
                        <li key={k}><a href={`#f-${k}`} onClick={(ev) => { ev.preventDefault(); document.getElementById(`f-${k}`)?.focus(); }}>{errors[k]}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
                {status === 'error' && (
                  <div ref={errorRef} tabIndex={-1} className="send-error" role="alert" style={{ outline: 'none' }}>
                    <span style={{ color: 'var(--datum-ink)', marginTop: 3 }}><Alert /></span>
                    <div>
                      <h2>We couldn’t send your request.</h2>
                      <p>Our scheduling service didn’t answer in time. Everything you typed is still here: try again, or email <a className="text-link" href="mailto:demo@tidemark.ai">demo@tidemark.ai</a> and we’ll pick it up from there.</p>
                    </div>
                  </div>
                )}
                <div className="form-grid">
                  <div className="field" {...state('name')}>
                    <label htmlFor="f-name">Full name</label>
                    <input className="input" autoComplete="name" value={v.name} onChange={(e) => set('name', e.target.value)} {...fieldProps('name')} />
                    <FieldError id="e-name" msg={show('name')} />
                  </div>
                  <div className="field" {...state('email')}>
                    <label htmlFor="f-email">Work email</label>
                    <input className="input" type="email" autoComplete="email" inputMode="email" value={v.email} onChange={(e) => set('email', e.target.value)} {...fieldProps('email')} />
                    <FieldError id="e-email" msg={show('email')} />
                  </div>
                  <div className="field" {...state('org')}>
                    <label htmlFor="f-org">Organisation</label>
                    <input className="input" autoComplete="organization" value={v.org} onChange={(e) => set('org', e.target.value)} {...fieldProps('org')} />
                    <FieldError id="e-org" msg={show('org')} />
                  </div>
                  <div className="field" {...state('role')}>
                    <label htmlFor="f-role">Role <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
                    <input className="input" autoComplete="organization-title" value={v.role} onChange={(e) => set('role', e.target.value)} {...fieldProps('role')} />
                  </div>
                  <fieldset className="field full" {...state('orgType')} aria-describedby={show('orgType') ? 'e-orgType' : undefined}>
                    <legend id="f-orgType-l">Your organisation is a…</legend>
                    <div className="choice-grid" role="radiogroup" aria-labelledby="f-orgType-l">
                      {ORG_TYPES.map((o, i) => (
                        <label key={o.v} className="choice">
                          <input type="radio" name="orgType" value={o.v} id={i === 0 ? 'f-orgType' : undefined} checked={v.orgType === o.v} onChange={() => { set('orgType', o.v); setTouched((t) => ({ ...t, orgType: true })); }} />
                          <span className="tick round"><svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill="#fff" /></svg></span>
                          <span><span className="c-title">{o.t}</span><span className="c-sub">{o.s}</span></span>
                        </label>
                      ))}
                    </div>
                    <FieldError id="e-orgType" msg={show('orgType')} />
                  </fieldset>
                  <div className="field full" {...state('region')}>
                    <label htmlFor="f-region">City, catchment or port you cover</label>
                    <p className="hint" id="h-region">For example “Kelsford and the lower Leve” or “Port of Ostrand”.</p>
                    <input className="input" value={v.region} onChange={(e) => set('region', e.target.value)} {...fieldProps('region')} />
                    <FieldError id="e-region" msg={show('region')} />
                  </div>
                  <fieldset className="field full" {...state('products')}>
                    <legend>Interested in</legend>
                    <div className="choice-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
                      {PRODUCTS.map((p, i) => (
                        <label key={p} className="choice">
                          <input
                            type="checkbox"
                            id={i === 0 ? 'f-products' : undefined}
                            checked={v.products.includes(p)}
                            aria-describedby={show('products') ? 'e-products' : undefined}
                            onChange={() => { set('products', v.products.includes(p) ? v.products.filter((x) => x !== p) : [...v.products, p]); setTouched((t) => ({ ...t, products: true })); }}
                          />
                          <span className="tick"><Check size={12} /></span>
                          <span className="c-title">Tidemark {p}</span>
                        </label>
                      ))}
                    </div>
                    <FieldError id="e-products" msg={show('products')} />
                  </fieldset>
                  <div className="field full">
                    <label htmlFor="f-timeline">When do you need it running? <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
                    <select className="select" id="f-timeline" value={v.timeline} onChange={(e) => set('timeline', e.target.value)}>
                      <option value="">Not sure yet</option>
                      <option>Before this winter’s storm season</option>
                      <option>Within 12 months</option>
                      <option>We’re scoping a tender</option>
                    </select>
                  </div>
                  <div className="field full" {...state('message')}>
                    <label htmlFor="f-message">A flood you’d like us to hindcast <span className="muted" style={{ fontWeight: 400 }}>(optional)</span></label>
                    <p className="hint" id="h-message">A date and the streets you remember is plenty. <span className="tabular">{v.message.length}/800</span></p>
                    <textarea className="textarea" value={v.message} onChange={(e) => set('message', e.target.value)} {...fieldProps('message')} />
                    <FieldError id="e-message" msg={show('message')} />
                  </div>
                  <div className="field full" {...state('consent')}>
                    <label className="choice" style={{ alignItems: 'flex-start' }}>
                      <input type="checkbox" id="f-consent" checked={v.consent} aria-describedby={show('consent') ? 'e-consent' : undefined} onChange={(e) => { set('consent', e.target.checked); setTouched((t) => ({ ...t, consent: true })); }} />
                      <span className="tick"><Check size={12} /></span>
                      <span className="c-sub" style={{ color: 'var(--ink-2)' }}>Tidemark may contact me about this demo. We don’t add you to a mailing list.</span>
                    </label>
                    <FieldError id="e-consent" msg={show('consent')} />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" aria-disabled={status === 'sending'} disabled={status === 'sending'}>
                    {status === 'sending' ? (<><span className="spinner" aria-hidden="true" />Sending request…</>) : status === 'error' ? (<>Try sending again <Arrow /></>) : (<>Request my demo <Arrow /></>)}
                  </button>
                  <p>We reply within one working day.</p>
                </div>
                <p className="visually-hidden" aria-live="polite">{status === 'sending' ? 'Sending your request.' : ''}</p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
