import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="section">
      <div className="wrap nf">
        <p className="kicker">404</p>
        <h1>This street isn’t on our map.</h1>
        <p className="lede">The page may have moved when we last re-surveyed the site. Try the forecast instead.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-ink">Back to the forecast</Link>
          <Link to="/demo" className="btn btn-quiet">Request a demo</Link>
        </div>
      </div>
    </section>
  );
}
