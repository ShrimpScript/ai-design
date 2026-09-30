import type React from 'react';
import { Link } from 'react-router-dom';
import CtaBand from '../components/CtaBand';
import { CUSTOMERS } from '../data/content';

const TIMELINE: { t: string; when: string; kind?: 'alert' | 'water'; text: React.ReactNode }[] = [
  { t: 'T+0', when: 'Tue 06:00', text: <><b>First street-level forecast.</b> Tidemark flags 31 streets likely to exceed 30&nbsp;cm on Wednesday night; the national service has a yellow rain warning out for the region.</> },
  { t: 'T+10', when: 'Tue 16:00', text: <><b>Surge confirmed.</b> Tide-gauge forecasts firm up at +1.2&nbsp;m. The list grows to 56 streets, 19 of them on the harbour front where outfalls will be tide-locked.</> },
  { t: 'T+26', when: 'Wed 08:00', kind: 'alert', text: <><b>Pumps moved.</b> Brackwater Water pre-deploys 9 mobile pumps to the Wharf Road basin and Culvert Lane, from Tidemark’s surcharge list.</> },
  { t: 'T+32', when: 'Wed 14:00', kind: 'alert', text: <><b>Residents warned.</b> Duty officer approves a message to 1,930 households on 56 streets: move cars, check on neighbours, keep gullies clear.</> },
  { t: 'T+36', when: 'Wed 18:00', kind: 'alert', text: <><b>Roads closed.</b> Highways closes 17 roads in 90 minutes, working down Tidemark’s arrival-time order.</> },
  { t: 'T+37', when: 'Wed 19:00', kind: 'water', text: <><b>Water reaches Quay Street.</b> 61 hours after the first forecast named it.</> },
  { t: 'T+42', when: 'Thu 00:00', kind: 'water', text: <><b>Peak.</b> High water meets the river crest. 41 streets flood above 30&nbsp;cm; the deepest, Wharf Road, reaches 1.1&nbsp;m.</> },
  { t: 'T+54', when: 'Thu 12:00', text: <><b>All clear.</b> Roads reopen in the order Tidemark forecast them to drain.</> },
];

function HitMap() {
  // 59 streets: 38 flagged and flooded, 18 flagged but stayed below 30 cm, 3 flooded without a flag
  const cells = [...Array(38).fill('hit'), ...Array(18).fill('falsealarm'), ...Array(3).fill('miss')];
  return (
    <figure className="hitmap">
      <div className="hitmap-grid" role="img" aria-label="59 squares: 38 streets flagged and flooded, 18 flagged that stayed below 30 centimetres, 3 flooded without a flag.">
        {cells.map((c, i) => <i key={i} className={c} />)}
      </div>
      <ul className="hitmap-legend">
        <li><i className="hit" />38 flagged 48&nbsp;h ahead and flooded</li>
        <li><i className="falsealarm" />18 flagged, stayed below 30&nbsp;cm</li>
        <li><i className="miss" />3 flooded without a flag</li>
      </ul>
    </figure>
  );
}

export default function Customers() {
  return (
    <>
      <section className="page-head">
        <div className="wrap case-hero">
          <div>
            <p className="kicker">Case study · Kelsford City Council</p>
            <h1>Storm Hollis: 17 roads closed before the water came.</h1>
            <p className="lede">How a coastal city of 412,000 people used Tidemark Forecast and Alerts to get two days ahead of the worst tidal-and-river flood since 1953.</p>
          </div>
          <ul className="case-facts">
            <li><b>Customer</b><span>Kelsford City Council, Emergency Planning</span></li>
            <li><b>With</b><span>Brackwater Water (drainage)</span></li>
            <li><b>Products</b><span>Forecast, Alerts</span></li>
            <li><b>Live since</b><span>October 2024</span></li>
            <li><b>Event</b><span>10–12 February 2026</span></li>
            <li><b>Streets modelled</b><span className="tabular">6,318</span></li>
          </ul>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="outcome-grid">
            <div><span className="num tabular">38/41</span><p>flooded streets on the list 48&nbsp;h before</p></div>
            <div><span className="num tabular">61 h</span><p>from first warning to water on Quay Street</p></div>
            <div><span className="num tabular">0</span><p>cars stranded, against 64 in November 2023</p></div>
            <div><span className="num tabular">1,930</span><p>households warned before water reached their street</p></div>
          </div>

          <div className="case-body">
            <aside aria-label="Case study sections">
              <ul>
                <li><a href="#/customers#challenge" onClick={(e) => { e.preventDefault(); document.getElementById('challenge')?.scrollIntoView(); }}>The problem</a></li>
                <li><a href="#/customers#setup" onClick={(e) => { e.preventDefault(); document.getElementById('setup')?.scrollIntoView(); }}>Setting up</a></li>
                <li><a href="#/customers#storm" onClick={(e) => { e.preventDefault(); document.getElementById('storm')?.scrollIntoView(); }}>The storm, hour by hour</a></li>
                <li><a href="#/customers#results" onClick={(e) => { e.preventDefault(); document.getElementById('results')?.scrollIntoView(); }}>How the forecast scored</a></li>
                <li><a href="#/customers#next" onClick={(e) => { e.preventDefault(); document.getElementById('next')?.scrollIntoView(); }}>What changed</a></li>
              </ul>
            </aside>
            <div className="case-prose">
              <h2 id="challenge">The problem: a warning for the region, not the street</h2>
              <p>Kelsford sits where the River Leve meets a funnel-shaped estuary. Its old harbour district floods from three directions: rain the drains can’t carry, a river that backs up through the culverts, and high tides that shut the outfalls. In November 2023 all three arrived together. Sixty-four cars were caught in water on roads that were still open, and the council’s emergency team learned which streets had flooded from social media.</p>
              <p>“We had regional rain warnings and a tide table,” says Aoife Brennan, Head of Emergency Planning. “Neither tells you whether Culvert Lane will be under half a metre at eleven o’clock on Wednesday.”</p>

              <h2 id="setup">Setting up: eleven weeks, one spreadsheet of drains</h2>
              <p>Brackwater Water shared its asset register of 38,000 pipes and 1,240 gullies in the flood-prone districts. Tidemark connected the city’s three tide gauges, two river gauges on the Leve and the national radar feed, and built Kelsford’s network model. A blind hindcast of the 2023 flood was the acceptance test: 44 of the 49 streets that flooded were flagged 48 hours ahead.</p>
              <p>The team set two Alerts rules: crew tasks at 20&nbsp;cm forecast depth, sent straight to highways and pump crews; resident warnings at 30&nbsp;cm, always approved by the duty officer first.</p>

              <h2 id="storm">The storm, hour by hour</h2>
              <ol className="timeline">
                {TIMELINE.map((e) => (
                  <li key={e.t} data-kind={e.kind}>
                    <span className="tl-t">{e.t}<small>{e.when}</small></span>
                    <p>{e.text}</p>
                  </li>
                ))}
              </ol>

              <h2 id="results">How the forecast scored</h2>
              <p>After the event, council surveyors logged every street with standing water above 30&nbsp;cm. We compared that survey with the forecast issued 48 hours before the peak.</p>
              <HitMap />
              <p>Three streets flooded without being flagged, all from blocked gullies the model could not see. Eighteen flagged streets stayed below 30&nbsp;cm; the team accepted that trade. “I will close a road that stays dry before I leave open one that floods,” Brennan says.</p>

              <h2 id="next">What changed</h2>
              <p>Kelsford now runs its flood duty rota from Tidemark’s 72-hour outlook rather than from the weather warning. Crews report blocked gullies through the Tidemark Crew app, which feeds the next model run. The council has since added its two underpasses and 14 care homes as named assets with their own alert thresholds.</p>
              <blockquote className="big-quote" style={{ margin: '48px 0 0' }}>
                <p>“On Tuesday morning I had a list of the fifty-six streets we were likely to lose on Wednesday night. We’d never had a list before. We had a feeling.”</p>
                <footer><span className="q-name">Aoife Brennan</span><span className="small muted">Head of Emergency Planning, Kelsford City Council</span></footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <section className="section paper-2" aria-labelledby="others-h">
        <div className="wrap">
          <div className="section-head">
            <h2 id="others-h">Also forecasting with Tidemark</h2>
          </div>
          <ul className="other-customers">
            {CUSTOMERS.slice(1).map((c) => (
              <li key={c.name}>
                <span className="oc-name">{c.name}</span>
                <p>{c.kind}, since {c.since}</p>
              </li>
            ))}
            <li>
              <span className="oc-name">Your city</span>
              <p><Link to="/demo" className="text-link">Ask for a hindcast of your last flood</Link></p>
            </li>
          </ul>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
