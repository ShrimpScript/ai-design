import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, m } from 'motion/react';
import { Button } from '../components/Button';
import { useDocumentTitle } from '../lib/hooks';
import '../styles/demo.css';

type Values = {
  name: string;
  email: string;
  org: string;
  orgType: string;
  area: string;
  products: string[];
  message: string;
  consent: boolean;
};
type Errors = Partial<Record<keyof Values, string>>;

const ORG_TYPES = ['City emergency management', 'Water utility', 'Port authority', 'Insurer or logistics', 'Something else'];
const PRODUCTS = [
  { id: 'forecast', label: 'Forecast' },
  { id: 'alerts', label: 'Alerts' },
  { id: 'api', label: 'API' },
];
const FREE_MAIL = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com'];
const MAX_MSG = 800;

function validate(v: Values): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = 'Enter your name.';
  const email = v.email.trim();
  if (!email) e.email = 'Enter your work email.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = 'Enter an email address like name@city.gov.';
  else if (FREE_MAIL.includes(email.split('@')[1].toLowerCase()))
    e.email = 'Use your work email, so we can prepare a forecast for your organisation.';
  if (!v.org.trim()) e.org = 'Enter your organisation’s name.';
  if (!v.orgType) e.orgType = 'Choose the option closest to your organisation.';
  if (!v.area.trim()) e.area = 'Enter the city, catchment or port you want forecast.';
  if (v.products.length === 0) e.products = 'Choose at least one product.';
  if (v.message.length > MAX_MSG) e.message = `Keep your note under ${MAX_MSG} characters.`;
  if (!v.consent) e.consent = 'Tick the box so we can reply to you.';
  return e;
}

/** Stand-in for the CRM endpoint. Fails when offline, or when the email contains "+fail" (for testing the error state). */
function submitRequest(v: Values): Promise<{ ref: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!navigator.onLine || v.email.includes('+fail')) reject(new Error('network'));
      else resolve({ ref: `TM-${Math.floor(10000 + Math.random() * 89999)}` });
    }, 1100);
  });
}

function Field({
  id,
  label,
  hint,
  error,
  children,
  optional,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id} className="field__label">
        {label}
        {optional && <span className="field__opt"> (optional)</span>}
      </label>
      {hint && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {children}
      <p className="field__error" id={`${id}-error`} aria-live="polite">
        {error}
      </p>
    </div>
  );
}

export default function Demo() {
  useDocumentTitle('Request a demo');
  const [params] = useSearchParams();
  const plan = params.get('plan');
  const initialProducts =
    plan === 'alerts' ? ['forecast', 'alerts'] : plan === 'api' ? ['api'] : plan === 'region' ? ['forecast', 'alerts'] : ['forecast'];
  const [v, setV] = useState<Values>({
    name: '',
    email: '',
    org: '',
    orgType: '',
    area: '',
    products: initialProducts,
    message: '',
    consent: false,
  });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'error' | 'done'>('idle');
  const [ref, setRef] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  const errors = validate(v);
  const show = (k: keyof Values) => (submitted || touched[k] ? errors[k] : undefined);
  const errorList = Object.entries(errors) as [keyof Values, string][];

  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((p) => ({ ...p, [k]: val }));
  const blur = (k: keyof Values) => () => setTouched((t) => ({ ...t, [k]: true }));
  const aria = (k: keyof Values, hint = false) => ({
    'aria-invalid': show(k) ? true : undefined,
    'aria-describedby': [hint ? `${uid}-${k}-hint` : '', show(k) ? `${uid}-${k}-error` : ''].filter(Boolean).join(' ') || undefined,
  });

  useEffect(() => {
    if (status === 'error') errorRef.current?.focus();
  }, [status]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (errorList.length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setStatus('sending');
    try {
      const r = await submitRequest(v);
      setRef(r.ref);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const focusField = (k: keyof Values) => {
    const el = document.getElementById(`${uid}-${k}`) ?? document.querySelector<HTMLElement>(`[name="${uid}-${k}"]`);
    el?.focus();
  };

  return (
    <section className="wrap demo" aria-labelledby="demo-title">
      <div className="demo__intro">
        <h1 id="demo-title">Request a demo</h1>
        <p className="lede">Thirty minutes with a Tidemark hydrologist, using your own city’s streets.</p>
        <ol className="demo__steps">
          <li>
            <h2>We run your last big storm</h2>
            <p>Before the call, we put a storm you remember through Tidemark, using public elevation and gauge data.</p>
          </li>
          <li>
            <h2>You see it street by street</h2>
            <p>We show what the forecast would have said 72, 24 and 6 hours out, and where it would have been wrong.</p>
          </li>
          <li>
            <h2>You decide on a pilot</h2>
            <p>If it is useful, we scope a paid pilot with your drain data. If not, you keep the storm replay.</p>
          </li>
        </ol>
        <p className="demo__contact">
          Prefer email? Write to <a href="mailto:demo@tidemark.ai">demo@tidemark.ai</a>.
        </p>
      </div>

      <div className="demo__panel">
        <AnimatePresence mode="wait" initial={false}>
          {status === 'done' ? (
            <m.div
              key="done"
              className="demo__done"
              ref={(el: HTMLDivElement | null) => {
                if (el && doneRef.current !== el) {
                  doneRef.current = el;
                  el.focus({ preventScroll: true });
                  const top = el.getBoundingClientRect().top + window.scrollY - 100;
                  if (el.getBoundingClientRect().top < 80) window.scrollTo({ top, behavior: 'auto' });
                }
              }}
              tabIndex={-1}
              role="status"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="demo__done-mark" viewBox="0 0 64 64" aria-hidden="true">
                <rect x="1" y="1" width="62" height="62" fill="none" stroke="currentColor" strokeWidth="2" />
                <m.rect
                  x="2"
                  width="60"
                  fill="var(--depth-2)"
                  initial={{ y: 62, height: 0 }}
                  animate={{ y: 30, height: 32 }}
                  transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
                />
                <m.line
                  x1="2"
                  x2="62"
                  stroke="var(--signal)"
                  strokeWidth="4"
                  initial={{ y1: 62, y2: 62 }}
                  animate={{ y1: 30, y2: 30 }}
                  transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1], delay: 0.1 }}
                />
                <path d="M20 22l8 8 16-16" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
              <h2>Request received</h2>
              <p>
                Thanks, {v.name.trim().split(' ')[0]}. A hydrologist will email <strong>{v.email}</strong> within one working day to
                pick a time and a storm for {v.area.trim()}.
              </p>
              <p className="demo__ref">
                Your reference is <strong className="num">{ref}</strong>.
              </p>
              <div className="demo__done-actions">
                <Link to="/how-it-works" className="btn btn--secondary btn--md">
                  <span className="btn__label">Read how the model works</span>
                </Link>
              </div>
            </m.div>
          ) : (
            <m.form
              key="form"
              className="demo__form"
              noValidate
              onSubmit={onSubmit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              aria-describedby={`${uid}-req`}
            >
              <p id={`${uid}-req`} className="demo__req">All fields are required unless marked optional.</p>

              {submitted && errorList.length > 0 && (
                <div className="form-summary" ref={summaryRef} tabIndex={-1} role="alert" aria-labelledby={`${uid}-sum`}>
                  <h2 id={`${uid}-sum`}>
                    {errorList.length === 1 ? 'One thing to fix before sending' : `${errorList.length} things to fix before sending`}
                  </h2>
                  <ul>
                    {errorList.map(([k, msg]) => (
                      <li key={k}>
                        <a
                          href={`#${uid}-${k}`}
                          onClick={(e) => {
                            e.preventDefault();
                            focusField(k);
                          }}
                        >
                          {msg}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {status === 'error' && (
                <div className="form-error" ref={errorRef} tabIndex={-1} role="alert">
                  <h2>Your request wasn’t sent</h2>
                  <p>
                    We couldn’t reach our server. Check your connection and send it again. Your answers are still here. If it keeps
                    failing, email <a href="mailto:demo@tidemark.ai">demo@tidemark.ai</a>.
                  </p>
                </div>
              )}

              <div className="demo__row">
                <Field id={`${uid}-name`} label="Your name" error={show('name')}>
                  <input
                    id={`${uid}-name`}
                    type="text"
                    autoComplete="name"
                    value={v.name}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={blur('name')}
                    {...aria('name')}
                  />
                </Field>
                <Field id={`${uid}-email`} label="Work email" error={show('email')}>
                  <input
                    id={`${uid}-email`}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={v.email}
                    onChange={(e) => set('email', e.target.value)}
                    onBlur={blur('email')}
                    {...aria('email')}
                  />
                </Field>
              </div>

              <Field id={`${uid}-org`} label="Organisation" error={show('org')}>
                <input
                  id={`${uid}-org`}
                  type="text"
                  autoComplete="organization"
                  value={v.org}
                  onChange={(e) => set('org', e.target.value)}
                  onBlur={blur('org')}
                  {...aria('org')}
                />
              </Field>

              <fieldset className={`field ${show('orgType') ? 'has-error' : ''}`} aria-describedby={show('orgType') ? `${uid}-orgType-error` : undefined}>
                <legend className="field__label">What kind of organisation is it?</legend>
                <div className="chips">
                  {ORG_TYPES.map((t, i) => (
                    <label key={t} className="chip">
                      <input
                        type="radio"
                        name={`${uid}-orgType`}
                        id={i === 0 ? `${uid}-orgType` : undefined}
                        value={t}
                        checked={v.orgType === t}
                        onChange={() => {
                          set('orgType', t);
                          setTouched((x) => ({ ...x, orgType: true }));
                        }}
                      />
                      <span className="chip__tick" aria-hidden="true" />
                      {t}
                    </label>
                  ))}
                </div>
                <p className="field__error" id={`${uid}-orgType-error`}>
                  {show('orgType')}
                </p>
              </fieldset>

              <Field
                id={`${uid}-area`}
                label="Where should we forecast?"
                hint="A city, a river catchment or a port estate."
                error={show('area')}
              >
                <input
                  id={`${uid}-area`}
                  type="text"
                  autoComplete="address-level2"
                  value={v.area}
                  onChange={(e) => set('area', e.target.value)}
                  onBlur={blur('area')}
                  {...aria('area', true)}
                />
              </Field>

              <fieldset className={`field ${show('products') ? 'has-error' : ''}`} aria-describedby={show('products') ? `${uid}-products-error` : undefined}>
                <legend className="field__label">Which products are you interested in?</legend>
                <div className="chips">
                  {PRODUCTS.map((p, i) => (
                    <label key={p.id} className="chip">
                      <input
                        type="checkbox"
                        id={i === 0 ? `${uid}-products` : undefined}
                        checked={v.products.includes(p.id)}
                        onChange={(e) => {
                          set('products', e.target.checked ? [...v.products, p.id] : v.products.filter((x) => x !== p.id));
                          setTouched((x) => ({ ...x, products: true }));
                        }}
                      />
                      <span className="chip__tick chip__tick--square" aria-hidden="true" />
                      Tidemark {p.label}
                    </label>
                  ))}
                </div>
                <p className="field__error" id={`${uid}-products-error`}>
                  {show('products')}
                </p>
              </fieldset>

              <Field
                id={`${uid}-message`}
                label="Is there a storm you’d like us to replay?"
                optional
                hint="A date and the streets that flooded help us prepare."
                error={show('message')}
              >
                <textarea
                  id={`${uid}-message`}
                  rows={4}
                  value={v.message}
                  onChange={(e) => set('message', e.target.value)}
                  onBlur={blur('message')}
                  {...aria('message', true)}
                />
                <p className={`field__count num ${v.message.length > MAX_MSG ? 'is-over' : ''}`} aria-live="off">
                  {v.message.length} / {MAX_MSG}
                </p>
              </Field>

              <div className={`field ${show('consent') ? 'has-error' : ''}`}>
                <label className="check">
                  <input
                    type="checkbox"
                    id={`${uid}-consent`}
                    checked={v.consent}
                    onChange={(e) => {
                      set('consent', e.target.checked);
                      setTouched((x) => ({ ...x, consent: true }));
                    }}
                    {...aria('consent')}
                  />
                  <span className="check__box" aria-hidden="true" />
                  <span>Tidemark may contact me about this request. We don’t add you to a newsletter.</span>
                </label>
                <p className="field__error" id={`${uid}-consent-error`}>
                  {show('consent')}
                </p>
              </div>

              <div className="demo__submit">
                <Button type="submit" size="lg" disabled={status === 'sending'} aria-disabled={status === 'sending'}>
                  {status === 'sending' ? (
                    <>
                      <span className="spinner" aria-hidden="true" />
                      Sending request
                    </>
                  ) : status === 'error' ? (
                    'Send request again'
                  ) : (
                    'Request a demo'
                  )}
                </Button>
                <p className="demo__sla">We reply within one working day.</p>
              </div>
            </m.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
