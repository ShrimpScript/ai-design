import type React from 'react';
import { useId } from 'react';
import { motion, useReducedMotion } from 'motion/react';

type Opt<T extends string> = { value: T; label: string };
export default function Segmented<T extends string>({ options, value, onChange, label, tabs = false, idBase }: {
  options: Opt<T>[]; value: T; onChange: (v: T) => void; label: string; tabs?: boolean; idBase?: string;
}) {
  const uid = useId();
  const reduce = useReducedMotion();
  const base = idBase ?? uid;
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const n = options[(i + (e.key === 'ArrowRight' ? 1 : options.length - 1)) % options.length];
    onChange(n.value);
    document.getElementById(`${base}-tab-${n.value}`)?.focus();
  };
  return (
    <div className="segmented" role={tabs ? 'tablist' : 'group'} aria-label={label}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            id={`${base}-tab-${o.value}`}
            type="button"
            role={tabs ? 'tab' : undefined}
            aria-selected={tabs ? on : undefined}
            aria-pressed={tabs ? undefined : on}
            aria-controls={tabs ? `${base}-panel-${o.value}` : undefined}
            tabIndex={tabs ? (on ? 0 : -1) : 0}
            onKeyDown={tabs ? (e) => onKey(e, i) : undefined}
            onClick={() => onChange(o.value)}
          >
            {on && <motion.span layoutId={`${base}-thumb`} className="seg-thumb" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }} />}
            <span style={{ position: 'relative' }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
