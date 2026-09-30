import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer on-dark">
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <Logo onDark />
          <p>
            Street-level flood forecasts for the people who close roads, clear drains and knock on doors.
          </p>
        </div>
        <nav aria-label="Footer" className="site-footer__nav">
          <div>
            <h2>Products</h2>
            <ul>
              <li><Link to="/product">Tidemark Forecast</Link></li>
              <li><Link to="/product?p=alerts">Tidemark Alerts</Link></li>
              <li><Link to="/product?p=api">Tidemark API</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h2>Company</h2>
            <ul>
              <li><Link to="/how-it-works">How the model works</Link></li>
              <li><Link to="/customers">Kessling case study</Link></li>
              <li><Link to="/demo">Request a demo</Link></li>
            </ul>
          </div>
          <div>
            <h2>Contact</h2>
            <ul>
              <li><a href="mailto:hello@tidemark.ai">hello@tidemark.ai</a></li>
              <li><a href="mailto:duty@tidemark.ai">Storm duty desk</a></li>
              <li>Rotterdam and Norfolk, Virginia</li>
            </ul>
          </div>
        </nav>
      </div>
      <div className="wrap site-footer__base">
        <p>© 2026 Tidemark Hydrometrics B.V.</p>
        <p>Forecasts support, and never replace, official warnings from your national weather and flood agencies.</p>
      </div>
    </footer>
  );
}
