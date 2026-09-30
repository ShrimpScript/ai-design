import { useId, useState } from 'react';

export default function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className="accordion">
      {items.map((it, i) => {
        const on = open === i;
        return (
          <div className="acc-item" key={i}>
            <h3 style={{ fontSize: 'inherit', margin: 0 }}>
              <button
                className="acc-trigger"
                aria-expanded={on}
                aria-controls={`${id}-p${i}`}
                id={`${id}-b${i}`}
                onClick={() => setOpen(on ? null : i)}
              >
                {it.q}
                <span className="acc-icon" aria-hidden="true" />
              </button>
            </h3>
            <div className="acc-panel" data-open={on} id={`${id}-p${i}`} role="region" aria-labelledby={`${id}-b${i}`} inert={!on}>
              <div><p>{it.a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
