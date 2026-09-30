import { ButtonLink } from './Button';

type Props = { title?: string; body?: string };

export default function CtaBand({
  title = 'See your own streets in the forecast',
  body = 'Send us your city boundary. Within two weeks we run last winter’s storms through Tidemark and show you, street by street, what it would have told you and when.',
}: Props) {
  return (
    <section className="cta-band" aria-labelledby="cta-title">
      <div className="wrap cta-band__inner">
        <div className="cta-band__line" aria-hidden="true" />
        <h2 id="cta-title">{title}</h2>
        <p>{body}</p>
        <div className="cta-band__actions">
          <ButtonLink to="/demo" size="lg">Request a demo</ButtonLink>
          <ButtonLink to="/pricing" variant="secondary" size="lg">See pricing</ButtonLink>
        </div>
      </div>
    </section>
  );
}
