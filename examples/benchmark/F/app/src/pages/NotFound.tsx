import { ButtonLink } from '../components/Button';
import { useDocumentTitle } from '../lib/hooks';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <section className="wrap notfound">
      <h1>This street isn’t on our map</h1>
      <p className="lede">The page you asked for doesn’t exist or has moved. The forecast, the products and the case study are all one click away.</p>
      <div className="notfound__actions">
        <ButtonLink to="/">Go to the home page</ButtonLink>
        <ButtonLink to="/product" variant="secondary">See the products</ButtonLink>
      </div>
    </section>
  );
}
