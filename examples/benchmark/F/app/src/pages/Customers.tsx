import CtaBand from '../components/CtaBand';
import { useDocumentTitle } from '../lib/hooks';
import '../styles/pages.css';
import '../styles/case.css';

type Entry = { time: string; lead: string; product: 'Forecast' | 'Alerts' | 'Crews' | 'Storm'; title: string; body: string; depth?: number };

const TIMELINE: Entry[] = [
  {
    time: 'Mon 13 Oct, 06:00',
    lead: '63 h before peak',
    product: 'Forecast',
    title: 'First watch',
    body: 'Tidemark flags Wednesday night: heavy rain within two hours of a spring tide. Eleven streets near East Docks show a one-in-three chance of passing 30 cm.',
    depth: 0.18,
  },
  {
    time: 'Tue 14 Oct, 09:30',
    lead: '36 h before peak',
    product: 'Crews',
    title: 'Gullies cleared on 14 streets',
    body: 'Kessling Water sends two jetting crews to the catchments Tidemark ranks highest, instead of working through the usual autumn rota.',
    depth: 0.34,
  },
  {
    time: 'Wed 15 Oct, 08:00',
    lead: '13 h before peak',
    product: 'Forecast',
    title: 'Plan agreed at the morning call',
    body: 'The duty team signs off 38 closures and four pump positions from the street list, sorted by arrival time. The call takes 25 minutes.',
    depth: 0.52,
  },
  {
    time: 'Wed 15 Oct, 15:00',
    lead: '6 h before peak',
    product: 'Alerts',
    title: '9,400 residents texted',
    body: 'Residents on 41 streets get a message naming their street and the hour to move cars. Crews receive closures as jobs with diversion plans attached.',
    depth: 0.61,
  },
  {
    time: 'Wed 15 Oct, 21:50',
    lead: 'Peak',
    product: 'Storm',
    title: 'Water reaches Wharf Road',
    body: 'Ten minutes before the forecast time, at 64 cm against a forecast of 58 cm. The road has been closed for five hours. Pumps at the Carver Street underpass are already running.',
    depth: 0.64,
  },
  {
    time: 'Thu 16 Oct, 05:00',
    lead: '7 h after peak',
    product: 'Forecast',
    title: 'Bridge Street stays shut',
    body: 'Rain has stopped but the Aske is still rising. The forecast holds the closure until 11:00, when the river drops back inside its banks.',
    depth: 0.36,
  },
];

const COMPARE = [
  { label: 'Vehicles rescued from floodwater', before: '23', after: '0' },
  { label: 'Homes flooded inside', before: '610', after: '170' },
  { label: 'Roads closed before water arrived', before: '3', after: '38' },
  { label: 'Median warning before a street flooded', before: 'None', after: '7 hours' },
  { label: 'Residents warned by street', before: '0', after: '9,400' },
];

export default function Customers() {
  useDocumentTitle('Customers');
  return (
    <>
      <article className="case" aria-labelledby="case-title">
        <header className="wrap case__intro">
          <p className="case__kicker">Case study: City of Kessling</p>
          <h1 id="case-title">How Kessling closed its roads before Storm Idris reached them</h1>
          <p className="lede">
            A tidal river city of 340,000 used to learn which streets had flooded from 999 calls. In October 2025 its emergency team
            had the list two days early.
          </p>
          <dl className="case__meta">
            <div>
              <dt>Customer</dt>
              <dd>Office of Emergency Management, City of Kessling, with Kessling Water</dd>
            </div>
            <div>
              <dt>Products</dt>
              <dd>Tidemark Forecast and Tidemark Alerts</dd>
            </div>
            <div>
              <dt>Live since</dt>
              <dd>March 2024</dd>
            </div>
          </dl>
        </header>

        <section className="section case__compare" aria-labelledby="compare-title">
          <div className="wrap">
            <h2 id="compare-title">Two storms of the same size, six years apart</h2>
            <p className="lede">
              Storm Idris in 2025 and the November 2019 storm brought similar rain and a similar surge. What changed was the warning.
            </p>
            <div className="table-wrap">
              <table className="compare">
                <caption className="visually-hidden">Outcomes of the November 2019 storm compared with Storm Idris, October 2025</caption>
                <thead>
                  <tr>
                    <th scope="col">Outcome</th>
                    <th scope="col" className="num">November 2019</th>
                    <th scope="col" className="num">Idris, October 2025</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE.map((c) => (
                    <tr key={c.label}>
                      <th scope="row">{c.label}</th>
                      <td className="num">{c.before}</td>
                      <td className="num compare__after">{c.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="section section--sunk" aria-labelledby="problem-title">
          <div className="wrap case__cols">
            <h2 id="problem-title">The problem: warnings for a whole city</h2>
            <div className="prose">
              <p>
                Kessling sits where the Aske meets the sea. Heavy rain on its own is manageable, and so is a high tide. When both arrive
                together, water leaving the drains meets water coming up the outfalls, and the low streets around the docks and the old
                creek bed fill within an hour.
              </p>
              <p>
                Until 2024 the city relied on national rain warnings that covered the whole region. They came often, rarely named a
                street, and people had stopped acting on them. In the 2019 storm, 23 drivers had to be pulled from cars in water they
                could not see the depth of.
              </p>
              <p>
                “We had good people and good plans,” says Maren Okafor, who leads the emergency team. “We just didn’t know where to
                send them until the calls came in.”
              </p>
            </div>
          </div>
        </section>

        <section className="section" aria-labelledby="tl-title">
          <div className="wrap">
            <div className="section-head">
              <h2 id="tl-title">Storm Idris, hour by hour</h2>
              <p className="lede">The bar beside each moment shows the forecast depth for Wharf Road at the time.</p>
            </div>
            <ol className="case-tl">
              {TIMELINE.map((e) => (
                <li key={e.time} className={`case-tl__item case-tl__item--${e.product.toLowerCase()}`}>
                  <div className="case-tl__when">
                    <p className="num">{e.time}</p>
                    <p className="case-tl__lead">{e.lead}</p>
                  </div>
                  <div className="case-tl__gauge" aria-hidden="true">
                    <span style={{ height: `${Math.min(100, ((e.depth ?? 0) / 0.8) * 100)}%` }} />
                    <em className="num">{Math.round((e.depth ?? 0) * 100)} cm</em>
                  </div>
                  <div className="case-tl__body">
                    <p className="case-tl__tag">{e.product === 'Storm' ? 'The storm' : e.product === 'Crews' ? 'Kessling Water' : `Tidemark ${e.product}`}</p>
                    <h3>{e.title}</h3>
                    <p>{e.body}</p>
                    <p className="visually-hidden">Forecast depth for Wharf Road: {Math.round((e.depth ?? 0) * 100)} centimetres.</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="section section--dark on-dark" aria-labelledby="voices-title">
          <div className="wrap voices">
            <h2 id="voices-title" className="visually-hidden">What the Kessling team says</h2>
            <figure className="voice voice--lead">
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
            <figure className="voice">
              <blockquote>
                <p>
                  “Jetting the right fourteen streets the day before did more than any number of crews the morning after. The ranking
                  told us where the pipes would matter.”
                </p>
              </blockquote>
              <figcaption>
                <strong>Dev Anand</strong>
                <span>Drainage Operations Lead, Kessling Water</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="section" aria-labelledby="changed-title">
          <div className="wrap case__cols">
            <h2 id="changed-title">What Kessling changed</h2>
            <ul className="changed">
              <li>
                <h3>A morning call built on the street list</h3>
                <p>From October to March, the duty team starts each day with the 72-hour list. On dry days it takes four minutes.</p>
              </li>
              <li>
                <h3>Thresholds set with the crews</h3>
                <p>Road crews chose 25 cm for closures, because that is where cars stall. Residents are warned at 15 cm, six hours ahead.</p>
              </li>
              <li>
                <h3>A shared picture with the water utility</h3>
                <p>Kessling Water sees the same forecast and plans drain clearance and pump hire from it, instead of from a separate model.</p>
              </li>
            </ul>
          </div>
        </section>

        <section className="section section--sunk" aria-labelledby="others-title">
          <div className="wrap">
            <h2 id="others-title" className="others__title">Also forecasting with Tidemark</h2>
            <ul className="others">
              <li>
                <strong>Port of Brannock</strong>
                <p>Moves container stacks off the two lowest yard blocks when Tidemark shows water on the quay roads at the next tide.</p>
              </li>
              <li>
                <strong>Ostmere Water</strong>
                <p>Ranks 1,900 drain catchments by forecast surcharge and sends jetting crews to the top twenty before each storm.</p>
              </li>
              <li>
                <strong>Havenstad Gemeente</strong>
                <p>Texts residents of basement flats in Dutch, English, Turkish and Arabic when their street passes 10 cm.</p>
              </li>
            </ul>
          </div>
        </section>
      </article>
      <CtaBand title="Find out what your last big storm would have looked like" />
    </>
  );
}
