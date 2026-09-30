import { useMemo, useState } from 'react';
import { AnimatePresence, m } from 'motion/react';
import { clockLabel, streetEvents } from '../lib/city';
import './alerts.css';

type Audience = 'crews' | 'residents';

const households = (name: string) => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 40 + (h % 220);
};

export default function AlertBuilder() {
  const [audience, setAudience] = useState<Audience>('crews');
  const [cm, setCm] = useState(30);
  const [lead, setLead] = useState(6);

  const events = useMemo(() => streetEvents(cm / 100), [cm]);
  const first = events[0];
  const sendAt = first ? Math.max(0, first.first - lead) : 0;
  const homes = events.reduce((a, e) => a + households(e.name), 0);

  const message = first
    ? audience === 'crews'
      ? `Tidemark: ${first.name} forecast ${Math.round(first.peak * 100)} cm from ${clockLabel(first.first)}. Close to traffic by ${clockLabel(Math.max(0, first.first - 2))}. Diversion plan K-${(first.name.length % 9) + 1}.`
      : `Kessling flood alert: water is forecast on ${first.name} from ${clockLabel(first.first)}, up to ${Math.round(first.peak * 100)} cm. Move vehicles off the street before then. Updates: kessling.city/flood`
    : 'No street crosses this threshold in the current forecast. Nothing is sent.';

  return (
    <div className="alerts" role="group" aria-label="Alert rule builder, using the Storm Idris forecast">
      <div className="alerts__rule">
        <fieldset className="seg">
          <legend>Who gets the alert</legend>
          <div className="seg__opts">
            {(['crews', 'residents'] as Audience[]).map((a) => (
              <label key={a} className="seg__opt">
                <input type="radio" name="aud" value={a} checked={audience === a} onChange={() => setAudience(a)} />
                <span>{a === 'crews' ? 'Road crews' : 'Residents'}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="alerts__field">
          <label htmlFor="al-cm">
            Alert when a street’s forecast depth passes <strong className="num">{cm} cm</strong>
          </label>
          <input
            id="al-cm"
            className="range"
            type="range"
            min={10}
            max={60}
            step={5}
            value={cm}
            style={{ ['--fill' as string]: `${((cm - 10) / 50) * 100}%` }}
            onChange={(e) => setCm(Number(e.target.value))}
          />
        </div>
        <div className="alerts__field">
          <label htmlFor="al-lead">
            Send it <strong className="num">{lead} hours</strong> before the water arrives
          </label>
          <input
            id="al-lead"
            className="range"
            type="range"
            min={2}
            max={24}
            step={1}
            value={lead}
            style={{ ['--fill' as string]: `${((lead - 2) / 22) * 100}%` }}
            onChange={(e) => setLead(Number(e.target.value))}
          />
        </div>

        <p className="alerts__result" aria-live="polite">
          During Storm Idris this rule would have covered <strong className="num">{events.length}</strong>{' '}
          {events.length === 1 ? 'street' : 'streets'}
          {audience === 'residents' && (
            <>
              {' '}
              and <strong className="num">{homes.toLocaleString('en-GB')}</strong> households
            </>
          )}
          {first ? (
            <>
              , with the first alert sent at <strong className="num">{clockLabel(sendAt)}</strong>.
            </>
          ) : (
            '.'
          )}
        </p>
      </div>

      <div className="phone" aria-label="Message preview">
        <div className="phone__screen">
          <p className="phone__from">{audience === 'crews' ? 'Tidemark Alerts' : 'Kessling Council'}</p>
          <p className="phone__msg phone__msg--old">
            {audience === 'crews'
              ? 'Tidemark watch: Storm Idris may flood streets near East Docks on Wednesday night. No action yet.'
              : 'Kessling flood watch: heavy rain and a high tide are possible on Wednesday night. We will text again if your street is at risk.'}
          </p>
          <p className="phone__time num">{first ? clockLabel(sendAt) : ''}</p>
          <AnimatePresence mode="popLayout" initial={false}>
            <m.p
              key={message}
              className="phone__msg"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            >
              {message}
            </m.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
