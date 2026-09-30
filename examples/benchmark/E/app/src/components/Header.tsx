import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Wordmark } from './Logo';
import { Arrow } from './Icons';

export const NAV = [
  { to: '/product', label: 'Product' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/customers', label: 'Customers' },
  { to: '/pricing', label: 'Pricing' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const loc = useLocation();
  const reduce = useReducedMotion();
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = menuRef.current?.querySelector<HTMLElement>('a,button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus(); }
      if (e.key === 'Tab' && menuRef.current) {
        const f = Array.from(menuRef.current.querySelectorAll<HTMLElement>('a,button'));
        const all = [btnRef.current!, ...f];
        const i = all.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); all[all.length - 1].focus(); }
        else if (!e.shiftKey && i === all.length - 1) { e.preventDefault(); all[0].focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <header className={`site-header ${scrolled || open ? 'scrolled' : ''}`}>
      <div className="wrap bar">
        <Link to="/" className="brand-link" aria-label="Tidemark home">
          <Wordmark />
        </Link>
        <nav className="main-nav" aria-label="Main">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to}>
                  {({ isActive }) => (
                    <>
                      {n.label}
                      {isActive && (
                        <motion.span layoutId="nav-ind" className="nav-indicator" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 40 }} />
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/demo" className="btn btn-ink btn-sm header-cta">Request a demo</Link>
        <button
          ref={btnRef}
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="bars" aria-hidden="true"><span /><span /><span /></span>
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            className="mobile-menu"
            initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.25, 1, 0.5, 1] }}
          >
            <nav aria-label="Mobile">
              <ul>
                {[{ to: '/', label: 'Home' }, ...NAV].map((n, i) => (
                  <motion.li
                    key={n.to}
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.06 + i * 0.04, duration: 0.3 }}
                  >
                    <NavLink to={n.to} end className="m-link">{n.label}</NavLink>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="m-foot">
              <Link to="/demo" className="btn btn-primary">Request a demo <Arrow /></Link>
              <p className="small muted" style={{ margin: 0 }}>Duty line for existing customers: +44 20 3890 4417</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
