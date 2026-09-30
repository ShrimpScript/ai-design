import { Link } from 'react-router-dom';
import { Arrow } from './Icons';

export default function CtaBand({ title = 'See your own city’s next storm, street by street.', body = 'Send us a drain-network export and a recent event. In three weeks we’ll show you a hindcast of that event, with the streets that flooded, against what Tidemark would have forecast.' }: { title?: string; body?: string }) {
  return (
    <section className="section cta-band paper-2" aria-labelledby="cta-h">
      <svg className="gauge-bg" width="220" viewBox="0 0 220 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <rect x="92" y="0" width="16" height="400" fill="#d5dcd9" />
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x="108" y={8 + i * 20} width={i % 2 ? 18 : 34} height="8" rx="2" fill="#d5dcd9" />
        ))}
        <rect x="40" y="262" width="160" height="8" rx="4" fill="var(--accent)" />
      </svg>
      <div className="wrap inner">
        <div>
          <h2 id="cta-h">{title}</h2>
        </div>
        <div>
          <p className="lede" style={{ marginBottom: 24 }}>{body}</p>
          <div className="actions">
            <Link to="/demo" className="btn btn-primary">Request a demo <Arrow /></Link>
            <Link to="/pricing" className="btn btn-quiet">See pricing</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
