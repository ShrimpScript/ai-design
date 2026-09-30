import { Suspense, useEffect, useRef } from 'react';
import { useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'motion/react';
import Header from './Header';
import Footer from './Footer';
import { preloadAll } from '../routes';
import { usePrefersReducedMotion } from '../lib/hooks';

function PageFallback() {
  return <div className="page-fallback" aria-hidden="true" />;
}

export default function Layout() {
  const location = useLocation();
  const outlet = useOutlet();
  const reduced = usePrefersReducedMotion();
  const navigated = useRef(false);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    const t = idle ? idle(preloadAll) : window.setTimeout(preloadAll, 2500);
    return () => {
      if (!idle) clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (!navigated.current) {
      navigated.current = true;
      return;
    }
    if (reduced) {
      window.scrollTo(0, 0);
      mainRef.current?.focus({ preventScroll: true });
    }
  }, [location.pathname, reduced]);

  const onEntered = () => {
    if (navigated.current && !reduced && document.activeElement === document.body) {
      mainRef.current?.focus({ preventScroll: true });
    }
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus(); }}>
          Skip to content
        </a>
        <Header />
        <main id="main" ref={mainRef} tabIndex={-1}>
          <AnimatePresence
            mode="wait"
            initial={false}
            onExitComplete={() => {
              window.scrollTo(0, 0);
            }}
          >
            <m.div
              key={location.pathname}
              className="page"
              initial={reduced ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 1, transition: { duration: 0.28 } }}
              onAnimationComplete={onEntered}
            >
              {!reduced && (
                <m.div
                  className="tide-wipe"
                  aria-hidden="true"
                  initial={{ y: '0%' }}
                  animate={{ y: '101%', transition: { duration: 0.42, ease: [0.65, 0, 0.35, 1], delay: 0.04 } }}
                  exit={{ y: ['101%', '0%'], transition: { duration: 0.28, ease: [0.65, 0, 0.35, 1] } }}
                />
              )}
              <Suspense fallback={<PageFallback />}>{outlet}</Suspense>
            </m.div>
          </AnimatePresence>
        </main>
        <Footer />
      </MotionConfig>
    </LazyMotion>
  );
}
