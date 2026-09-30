import { useId, useRef, type ReactNode, type KeyboardEvent } from 'react';
import { m } from 'motion/react';

type Tab = { id: string; label: string; panel: ReactNode };

export default function Tabs({ tabs, value, onChange, label }: { tabs: Tab[]; value: string; onChange: (id: string) => void; label: string }) {
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = tabs.findIndex((t) => t.id === value);
  const onKey = (e: KeyboardEvent) => {
    let n = idx;
    if (e.key === 'ArrowRight') n = (idx + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') n = (idx - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = tabs.length - 1;
    else return;
    e.preventDefault();
    onChange(tabs[n].id);
    refs.current[n]?.focus();
  };
  return (
    <div className="tabs">
      <div role="tablist" aria-label={label} className="tabs__list" onKeyDown={onKey}>
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            id={`${uid}-tab-${t.id}`}
            aria-selected={t.id === value}
            aria-controls={`${uid}-panel-${t.id}`}
            tabIndex={t.id === value ? 0 : -1}
            className="tabs__tab"
            onClick={() => onChange(t.id)}
          >
            {t.label}
            {t.id === value && <m.span layoutId={`${uid}-ind`} className="tabs__indicator" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${uid}-panel-${t.id}`}
          aria-labelledby={`${uid}-tab-${t.id}`}
          hidden={t.id !== value}
          tabIndex={0}
          className="tabs__panel"
        >
          {t.id === value && t.panel}
        </div>
      ))}
    </div>
  );
}
