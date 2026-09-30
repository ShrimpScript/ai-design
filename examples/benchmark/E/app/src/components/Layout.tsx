import { Suspense, useEffect, useRef, useState } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Header from './Header';
import Footer from './Footer';

const TITLES: Record<string, string> = {
  '/': 'Tidemark — street-level flood forecasts, 72 hours ahead',
  '/product': 'Product — Tidemark Forecast, Alerts and API',
  '/how-it-works': 'How it works — the Tidemark flood model',
  '/customers': 'Customers — Kelsford and Storm Hollis · Tidemark',
  '/pricing': 'Pricing · Tidemark',
  '/demo': 'Request a demo · Tidemark',
};

/** Keeps the outgoing page rendered while it animates out. */
function FrozenOutlet() {
  const o = useOutlet();
  const [frozen] = useState(o);
  return frozen;
}

function PageFallback() {
  return <div style={{ minHeight: '100vh' }} aria-busy="true" />;
}

export default function Layout() {
  const loc = useLocation();
  const reduce = useReducedMotion();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    document.title = TITLES[loc.pathname] ?? 'Page not found · Tidemark';
  }, [loc.pathname]);

  // In-page anchors (#forecast) inside the hash route
  useEffect(() => {
    if (!loc.hash) return;
    const id = loc.hash.slice(1);
    const tm = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }, 420);
    return () => window.clearTimeout(tm);
  }, [loc.hash, loc.pathname, reduce]);

  const onEntered = () => {
    if (first.current) { first.current = false; return; }
    if (!loc.hash) mainRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>Skip to content</a>
      <Header />
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => { if (!loc.hash) window.scrollTo(0, 0); }}>
        <motion.main
          key={loc.pathname}
          id="main"
          ref={mainRef}
          tabIndex={-1}
          style={{ outline: 'none' }}
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0 : 0.42, ease: [0.25, 1, 0.5, 1] } }}
          exit={reduce ? { opacity: 1 } : { opacity: 0, y: -8, transition: { duration: 0.18, ease: [0.4, 0, 1, 1] } }}
          onAnimationComplete={onEntered}
        >
          {!reduce && (
            <motion.div
              className="tide-sweep"
              aria-hidden="true"
              style={{ top: 'var(--header-h)' }}
              initial={{ scaleX: 0, opacity: 1 }}
              animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0], transition: { duration: 0.7, times: [0, 0.6, 1], ease: [0.25, 1, 0.5, 1] } }}
            />
          )}
          <Suspense fallback={<PageFallback />}>
            <FrozenOutlet />
          </Suspense>
        </motion.main>
      </AnimatePresence>
      <Footer />
    </>
  );
}
