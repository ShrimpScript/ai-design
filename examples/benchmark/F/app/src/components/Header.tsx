import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';
import { NAV, preloadRoute } from '../routes';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // close on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // modal behaviour for the mobile menu
  useEffect(() => {
    const main = document.getElementById('main');
    const footer = document.querySelector('footer');
    document.body.classList.toggle('menu-open', open);
    main?.toggleAttribute('inert', open);
    footer?.toggleAttribute('inert', open);
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>('a');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
      if (e.key === 'Tab' && panelRef.current) {
        const items = [btnRef.current, ...panelRef.current.querySelectorAll<HTMLElement>('a')].filter(Boolean) as HTMLElement[];
        const idx = items.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && idx === items.length - 1) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const mq = window.matchMedia('(min-width: 960px)');
    const onMq = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onMq);
    return () => {
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
      document.body.classList.remove('menu-open');
      main?.removeAttribute('inert');
      footer?.removeAttribute('inert');
    };
  }, [open]);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
      <div className="wrap site-header__bar">
        <Link to="/" className="site-header__logo" aria-label="Tidemark home">
          <Logo />
        </Link>
        <nav aria-label="Main" className="site-nav">
          <ul>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to} onMouseEnter={() => preloadRoute(n.to)} onFocus={() => preloadRoute(n.to)}>
                  {n.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/demo" className="btn btn--primary btn--md site-header__cta" onMouseEnter={() => preloadRoute('/demo')}>
          <span className="btn__label">Request a demo</span>
        </Link>
        <button
          ref={btnRef}
          type="button"
          className="menu-btn"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="visually-hidden">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-btn__icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </div>
      <div id="mobile-menu" ref={panelRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Main (mobile)">
          <ul>
            <li>
              <NavLink to="/" end>
                Home
              </NavLink>
            </li>
            {NAV.map((n) => (
              <li key={n.to}>
                <NavLink to={n.to}>{n.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <Link to="/demo" className="btn btn--primary btn--lg mobile-menu__cta">
          <span className="btn__label">Request a demo</span>
        </Link>
        <p className="mobile-menu__note">
          On call for a storm now? Email <a href="mailto:duty@tidemark.ai">duty@tidemark.ai</a> and a forecaster will reply within the hour.
        </p>
      </div>
    </header>
  );
}
