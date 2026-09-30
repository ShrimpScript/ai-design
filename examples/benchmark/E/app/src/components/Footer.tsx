import { Link } from 'react-router-dom';
import { Wordmark } from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <Link to="/" className="brand-link" style={{ color: 'var(--ops-ink)' }} aria-label="Tidemark home"><Wordmark /></Link>
            <p>Street-level flood forecasts for the people who close the roads, run the pumps and warn the residents.</p>
          </div>
          <div>
            <h2 className="foot-h">Product</h2>
            <ul>
              <li><Link to="/product#forecast">Tidemark Forecast</Link></li>
              <li><Link to="/product#alerts">Tidemark Alerts</Link></li>
              <li><Link to="/product#api">Tidemark API</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="foot-h">The model</h2>
            <ul>
              <li><Link to="/how-it-works">How it works</Link></li>
              <li><Link to="/how-it-works#verification">Verification</Link></li>
              <li><Link to="/customers">Kelsford case study</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="foot-h">Company</h2>
            <ul>
              <li><Link to="/demo">Request a demo</Link></li>
              <li><a href="mailto:hello@tidemark.ai">hello@tidemark.ai</a></li>
              <li>Bristol · Rotterdam · Norfolk, VA</li>
            </ul>
          </div>
        </div>
        <div className="foot-base">
          <span>Tidemark Forecasting Ltd, 2026. Forecasts support, and never replace, official warnings.</span>
          <span className="status-dot">All forecast regions running · model v4.3</span>
        </div>
      </div>
    </footer>
  );
}
