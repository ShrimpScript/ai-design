import { useEffect, useState, type RefObject } from 'react';

/** 0 when the element's top reaches the viewport top, 1 when its bottom reaches the viewport bottom. */
export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      const v = total > 0 ? -r.top / total : r.top < 0 ? 1 : 0;
      setP(Math.max(0, Math.min(1, v)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [ref]);
  return p;
}

/** Index of the step element closest to the viewport's reading line. */
export function useActiveStep(refs: RefObject<(HTMLElement | null)[]>, line = 0.55) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const els = refs.current ?? [];
      const y = window.innerHeight * line;
      let idx = 0;
      els.forEach((el, i) => { if (el && el.getBoundingClientRect().top < y) idx = i; });
      setActive(idx);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(measure); };
    measure();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [refs, line]);
  return active;
}
