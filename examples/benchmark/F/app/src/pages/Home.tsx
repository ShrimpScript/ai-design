import { Link } from 'react-router-dom';
import HeroForecast from '../graphics/HeroForecast';
import StormStory, { type StoryStep } from '../graphics/StormStory';
import { ButtonLink } from '../components/Button';
import CtaBand from '../components/CtaBand';
import { useDocumentTitle } from '../lib/hooks';
import '../styles/pages.css';

const STEPS: StoryStep[] = [
  {
    hour: 0,
    title: 'Storm Idris is still 900 km offshore',
    body: 'The first run for the storm already points at Wednesday night: the heaviest rain is due within two hours of a spring high tide. Kessling’s duty officer gets a watch notice, not an alarm.',
  },
  {
    hour: 21,
    title: 'The first rain band tests the drains',
    body: 'Four millimetres an hour, well inside what the drains can carry. The forecast tightens. The question is no longer whether Wednesday floods, but which streets, and when.',
  },
  {
    hour: 35,
    title: 'Rain and surge line up',
    body: 'The surge forecast climbs past a metre. Tidemark Alerts sends road crews their closures and the pump contractor the Carver Street underpass, seven hours before the water.',
  },
  {
    hour: 40,
    title: 'Peak: rain, tide and surge together',
    body: 'Water reaches Wharf Road at 21:50, ten minutes before the forecast said it would. The road has been shut since the afternoon, and 212 households on it were told by text at 15:00.',
  },
  {
    hour: 47,
    title: 'The river crests after the sky clears',
    body: 'The Aske peaks well after the heaviest rain. Instead of reopening Bridge Street when the rain stops, the crew keeps it closed until the forecast shows the river back inside its banks.',
  },
];

const PRODUCTS = [
  {
    name: 'Tidemark Forecast',
    to: '/product',
    what: 'A live map of flood depth and timing for every street, updated every 15 minutes, 72 hours ahead.',
    who: 'For duty officers and control rooms deciding what to close, where to send pumps and when to stand down.',
  },
  {
    name: 'Tidemark Alerts',
    to: '/product?p=alerts',
    what: 'Automatic warnings by text and app when a street’s forecast depth crosses the threshold you set.',
    who: 'For crews who need a job, a street and a time, and for residents who need to move the car.',
  },
  {
    name: 'Tidemark API',
    to: '/product?p=api',
    what: 'Forecast map tiles and street time series over HTTPS, in the same model run the city sees.',
    who: 'For insurers pricing exposure and logistics teams rerouting depots and trucks.',
  },
];

const AUDIENCES = [
  {
    title: 'City emergency management',
    body: 'Close roads before cars drive into water, pre-position sandbags and pumps, and warn residents street by street instead of city-wide.',
  },
  {
    title: 'Water utilities',
    body: 'See which drain catchments will surcharge, and when. Send crews to clear the right gullies the day before, not the morning after.',
  },
  {
    title: 'Port authorities',
    body: 'Know which quays, gates and yard roads will take water at each high tide, so moves, berths and staff can be rescheduled with a day’s notice.',
  },
];

export default function Home() {
  useDocumentTitle('Tidemark');
  return (
    <>
      <section className="home-hero" aria-labelledby="hero-title">
        <div className="wrap home-hero__grid">
          <div className="home-hero__copy">
            <h1 id="hero-title">Know which streets will flood, three days before the water arrives.</h1>
            <p className="lede">
              Tidemark forecasts flood depth for every street in your city, hour by hour, up to 72 hours ahead. Emergency teams use
              it to close roads, move pumps and warn residents while there is still time.
            </p>
            <div className="home-hero__actions">
              <ButtonLink to="/demo" size="lg">Request a demo</ButtonLink>
              <ButtonLink to="/how-it-works" variant="secondary" size="lg">How the forecast works</ButtonLink>
            </div>
            <p className="home-hero__proof">
              Running every 15 minutes for 31 cities and 9 ports. Last winter it called 91% of flooded streets at least 24 hours
              ahead.
            </p>
          </div>
          <div className="home-hero__viz">
            <HeroForecast />
          </div>
        </div>
      </section>

      <section className="clients" aria-label="Organisations using Tidemark">
        <div className="wrap clients__inner">
          <p className="clients__lead">Forecasting for</p>
          <ul className="clients__list">
            <li className="wm wm--civic">City of Kessling</li>
            <li className="wm wm--water">Ostmere Water</li>
            <li className="wm wm--port">Port of Brannock</li>
            <li className="wm wm--civic2">Havenstad Gemeente</li>
            <li className="wm wm--water2">Lower Tamsin Drainage Board</li>
            <li className="wm wm--port2">Marrow Bay Harbour Trust</li>
          </ul>
        </div>
      </section>

      <StormStory
        steps={STEPS}
        heading="One storm, hour by hour"
        intro="This is the forecast Kessling’s emergency team watched during Storm Idris last October. Scroll to move through the 72 hours."
      />

      <section className="section" aria-labelledby="products-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="products-title">One forecast, three ways to act on it</h2>
            <p className="lede">
              Every product reads from the same model run, so the map in the control room, the text on a crew’s phone and the
              feed in an insurer’s system never disagree.
            </p>
          </div>
          <ul className="product-rows">
            {PRODUCTS.map((p) => (
              <li key={p.name} className="product-row">
                <h3>
                  <Link to={p.to}>{p.name}</Link>
                </h3>
                <p className="product-row__what">{p.what}</p>
                <p className="product-row__who">{p.who}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--sunk" aria-labelledby="who-title">
        <div className="wrap audience">
          <h2 id="who-title">Built with the people who get the phone call at 3 a.m.</h2>
          <div className="audience__list">
            {AUDIENCES.map((a) => (
              <div key={a.title} className="audience__item">
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section quote-block" aria-labelledby="quote-title">
        <div className="wrap quote-block__grid">
          <h2 id="quote-title" className="visually-hidden">What Kessling said</h2>
          <figure>
            <blockquote>
              <p>
                “For twenty years we found out which streets flooded from the calls. During Idris we had the list at breakfast, and
                the roads were closed before the first car got stuck.”
              </p>
            </blockquote>
            <figcaption>
              <strong>Maren Okafor</strong>
              <span>Head of Emergency Management, City of Kessling</span>
            </figcaption>
          </figure>
          <div className="quote-block__facts">
            <p>
              <strong className="num">0</strong> vehicles rescued from floodwater during Idris, against 23 in the comparable 2019
              storm.
            </p>
            <p>
              <strong className="num">7 h</strong> median warning before water reached a street, for the 41 streets that flooded.
            </p>
            <ButtonLink to="/customers" variant="secondary">Read the Kessling case study</ButtonLink>
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
