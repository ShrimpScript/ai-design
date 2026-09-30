import { useEffect, useRef, useState, type RefObject } from 'react';

const RM_QUERY = '(prefers-reduced-motion: reduce)';

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(RM_QUERY).matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(RM_QUERY);
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function useInView<T extends Element>(ref: RefObject<T | null>, rootMargin = '0px', once = false) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setInView(e.isIntersecting);
        if (e.isIntersecting && once) io.disconnect();
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, once]);
  return inView;
}

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title === 'Tidemark' ? 'Tidemark: street-level flood forecasts, 72 hours ahead' : `${title} | Tidemark`;
  }, [title]);
}

export function useMediaQuery(q: string) {
  const [m, setM] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(q).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(q);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [q]);
  return m;
}

export function useElementSize<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const r = e.contentRect;
      setSize((s) => (Math.abs(s.w - r.width) > 0.5 || Math.abs(s.h - r.height) > 0.5 ? { w: r.width, h: r.height } : s));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/**
 * Continuous step position for scrollytelling: 0 when the first step's centre
 * sits at the reading line, n-1 when the last one does, interpolated between.
 */
export function useStepProgress<T extends HTMLElement>(listRef: RefObject<T | null>, line = 0.55) {
  const [t, setT] = useState(0);
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const items = Array.from(list.children) as HTMLElement[];
      if (!items.length) return;
      const target = window.innerHeight * (window.innerWidth < 960 ? 0.8 : line);
      const centres = items.map((el) => {
        const r = el.getBoundingClientRect();
        const h1 = el.querySelector('h3')?.getBoundingClientRect();
        return h1 ? h1.top + h1.height / 2 : r.top + r.height / 2;
      });
      let v = 0;
      if (target <= centres[0]) v = 0;
      else if (target >= centres[centres.length - 1]) v = centres.length - 1;
      else {
        for (let i = 0; i < centres.length - 1; i++) {
          if (target >= centres[i] && target < centres[i + 1]) {
            v = i + (target - centres[i]) / (centres[i + 1] - centres[i]);
            break;
          }
        }
      }
      setT((prev) => (Math.abs(prev - v) > 0.001 ? v : prev));
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [listRef, line]);
  return t;
}

/** Smoothly tweens a number toward `target` (instant with reduced motion). */
export function useTweenedNumber(target: number, ms = 450) {
  const reduced = usePrefersReducedMotion();
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (reduced) {
      setV(target);
      from.current = target;
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - k, 3);
      const cur = a + (target - a) * e;
      setV(cur);
      from.current = cur;
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduced]);
  return v;
}
