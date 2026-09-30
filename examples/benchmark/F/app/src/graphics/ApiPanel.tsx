import { useState } from 'react';
import Tabs from '../components/Tabs';
import './api.css';

const SNIPPETS: Record<string, { label: string; lang: string; code: string }> = {
  series: {
    label: 'Street time series',
    lang: 'Shell',
    code: `curl https://api.tidemark.ai/v2/forecast/series \\
  -H "Authorization: Bearer $TIDEMARK_KEY" \\
  -d city=kessling \\
  -d street="Wharf Road" \\
  -d hours=72

{
  "run": "2025-10-14T06:00:00Z",
  "street": "Wharf Road",
  "threshold_cm": 30,
  "series": [
    { "t": "2025-10-15T21:00:00Z", "depth_cm": 41, "p10": 28, "p90": 57 },
    { "t": "2025-10-15T22:00:00Z", "depth_cm": 64, "p10": 45, "p90": 88 },
    { "t": "2025-10-15T23:00:00Z", "depth_cm": 58, "p10": 39, "p90": 80 }
  ]
}`,
  },
  tiles: {
    label: 'Map tiles',
    lang: 'URL template',
    code: `https://tiles.tidemark.ai/v2/{city}/{run}/{hour}/{z}/{x}/{y}.png

# Depth tiles in the Tidemark palette, or raw values:
https://tiles.tidemark.ai/v2/{city}/{run}/{hour}/{z}/{x}/{y}.webp?encoding=depth_mm

# Latest run for Kessling, 38 hours ahead, zoom 16
https://tiles.tidemark.ai/v2/kessling/latest/38/16/32741/21795.png`,
  },
  python: {
    label: 'Python',
    lang: 'Python',
    code: `from tidemark import Client

tm = Client()  # reads TIDEMARK_KEY

# Every depot within 2 km of the port, flagged if its access road floods
for depot in tm.sites(tag="depot", near="Port of Brannock", km=2):
    risk = tm.forecast.site(depot.id, hours=72, threshold_cm=20)
    if risk.probability > 0.5:
        print(depot.name, risk.first_exceedance, f"{risk.peak_cm} cm")`,
  },
};

export default function ApiPanel() {
  const [tab, setTab] = useState('series');
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="api on-dark">
      <Tabs
        label="API examples"
        value={tab}
        onChange={(id) => {
          setTab(id);
          setCopied(false);
        }}
        tabs={Object.entries(SNIPPETS).map(([id, s]) => ({
          id,
          label: s.label,
          panel: (
            <div className="api__panel">
              <div className="api__meta">
                <span>{s.lang}</span>
                <button type="button" className={`copy-btn ${copied ? 'is-done' : ''}`} onClick={() => copy(s.code)}>
                  <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre>
                <code>{s.code}</code>
              </pre>
            </div>
          ),
        }))}
      />
    </div>
  );
}
