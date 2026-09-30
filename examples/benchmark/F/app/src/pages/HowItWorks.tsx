import LayerStack, { type LayerStep } from '../graphics/LayerStack';
import SkillChart from '../graphics/SkillChart';
import CtaBand from '../components/CtaBand';
import { useDocumentTitle } from '../lib/hooks';
import '../styles/pages.css';

const STEPS: LayerStep[] = [
  {
    key: 'radar',
    label: 'Rainfall radar',
    title: 'Rainfall radar and weather models',
    body: 'Radar shows the rain falling now and where it is heading. For hours 6 to 72 we blend in three weather-model ensembles, so the forecast carries their uncertainty instead of hiding it.',
    source: 'Every 5 minutes. National radar networks plus ECMWF, ICON and GFS ensembles.',
  },
  {
    key: 'tide',
    label: 'Tide gauges',
    title: 'Tide gauges and storm surge',
    body: 'The sea sets the lower boundary. When the tide is high, drains that empty into the harbour cannot. We combine astronomical tides with surge forecasts and correct both against your own gauges.',
    source: 'Harbour and estuary gauges every 6 minutes, national surge models every hour.',
  },
  {
    key: 'river',
    label: 'River levels',
    title: 'River levels upstream',
    body: 'Upstream gauges tell the model what the river will bring into town hours before it arrives, and how long it will stay high after the rain has stopped.',
    source: 'Every gauge in the catchment, typically 4 to 30 per city.',
  },
  {
    key: 'drains',
    label: 'Drain network',
    title: 'The drain network',
    body: 'Pipe sizes, gullies, outfalls, flap valves and pumps from your utility’s asset records. This is where water leaves the street, and where it backs up when a pipe is full or an outfall sits under the tide.',
    source: 'Imported from GIS asset registers. Gaps filled from survey and street imagery.',
  },
  {
    key: 'ground',
    label: 'Ground elevation',
    title: 'Ground elevation, down to the kerb',
    body: 'One-metre lidar with kerbs, walls, underpasses and building footprints burned in, so water in the model runs the way it runs on the street, not across a smoothed surface.',
    source: 'National lidar surveys, refreshed when roads or flood defences change.',
  },
  {
    key: 'model',
    label: 'Forecast',
    title: 'One model, run every 15 minutes',
    body: 'A physics-guided neural network turns the five inputs into depth and timing for every 5-metre cell of your city. It learned from 40,000 simulated storms and eleven years of observed floods, and each run takes under 90 seconds.',
    source: '50-member ensemble. Outputs depth, arrival time, peak time and the chance of passing your thresholds.',
  },
];

const LIMITS = [
  {
    title: 'Cloudbursts with no warning',
    body: 'A thunderstorm that forms and breaks over one district in 30 minutes is beyond any forecast. Tidemark switches to radar nowcasting and gives you what lead time there is, usually 20 to 45 minutes.',
  },
  {
    title: 'Slow groundwater flooding',
    body: 'Water that rises through cellars over weeks follows geology, not drains. We flag known groundwater areas on the map but do not forecast them.',
  },
  {
    title: 'Defences that fail',
    body: 'We model walls, gates and pumps as they are designed to work. If a gate is left open or a wall is breached, the forecast catches up as soon as gauges or crews report it.',
  },
];

const ONBOARDING = [
  { when: 'Weeks 1 and 2', title: 'Data', body: 'We import your drain network, gauges, defences and lidar, and flag gaps for your engineers to check.' },
  { when: 'Weeks 3 and 4', title: 'Hindcast', body: 'We rerun the last ten years of storms and score every street against your flood records, so you see our misses before you rely on us.' },
  { when: 'Weeks 5 to 7', title: 'Shadow running', body: 'Live forecasts go to your duty officers only. Thresholds are agreed street by street with the people who will act on them.' },
  { when: 'Week 8', title: 'Live', body: 'Alerts are switched on for crews, then residents. A Tidemark forecaster joins your first three storm calls.' },
];

export default function HowItWorks() {
  useDocumentTitle('How it works');
  return (
    <>
      <section className="wrap page-intro" aria-labelledby="hiw-title">
        <h1 id="hiw-title">A flood forecast, built street by street</h1>
        <p className="lede">
          Tidemark combines five sources of data into one model that predicts how deep the water will be on every street, every 15
          minutes, for the next three days.
        </p>
      </section>

      <section className="section section--tight-top" aria-labelledby="inputs-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="inputs-title">Five inputs, one forecast</h2>
            <p className="lede">Scroll through the layers the model reads, from the sky down to the ground.</p>
          </div>
          <LayerStack steps={STEPS} />
        </div>
      </section>

      <section className="section section--sunk" aria-labelledby="acc-title">
        <div className="wrap accuracy">
          <div className="accuracy__text">
            <h2 id="acc-title">How often it is right, and how early</h2>
            <div className="prose">
              <p>
                Accuracy falls with lead time, and we publish by how much. A street counts as called if the forecast put it above
                10 cm within two hours of when water was reported there.
              </p>
              <p>
                At 24 hours ahead Tidemark called 91% of flooded streets. The city-wide rain warnings those cities used before called
                52%, and could not say which streets.
              </p>
              <p>
                False alarms matter too: 1 in 7 streets we flagged at 24 hours stayed dry. You see the probability behind every
                flag, and set your own thresholds for when crews move.
              </p>
            </div>
          </div>
          <SkillChart />
        </div>
      </section>

      <section className="section" aria-labelledby="limits-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="limits-title">What Tidemark does not forecast</h2>
            <p className="lede">You should know where the model stops before a storm, not during one.</p>
          </div>
          <div className="limits">
            {LIMITS.map((l) => (
              <div key={l.title} className="limits__item">
                <h3>{l.title}</h3>
                <p>{l.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--sunk" aria-labelledby="onb-title">
        <div className="wrap">
          <div className="section-head">
            <h2 id="onb-title">From contract to live forecast in eight weeks</h2>
          </div>
          <ol className="timeline">
            {ONBOARDING.map((o) => (
              <li key={o.title} className="timeline__item">
                <p className="timeline__when">{o.when}</p>
                <h3>{o.title}</h3>
                <p>{o.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
