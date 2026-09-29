# Design log

## 2026-09-29 · test run (quick mode)
- Tried: "ticket rail" direction. Shifts as square thermal-paper tickets under a steel rail, day-dot colours on day headers, heat-lamp amber for open shifts and requests, Archivo width axis (condensed 72) for ticket print.
- Verifier caught: overtime red at 4.32:1 (now #B02A22); font preload broken over file:// (shoot.mjs now serves over http); a float in "target 28.000000000000004%"; the empty state leaking under the grid ([hidden] vs display:grid); rows ~100px tall from invisible add targets (now a 24px corner "+"); a 22px target regression.
- Keeps: no KPI cards (labour % lives in each day header), 1px rules instead of shadows, one soft shadow only on the floating editor, requests panel drops under the grid below 1100px, one-day-at-a-time on phones.
- Open for checkpoint B: accent loudness (amber may be too quiet at 768px); whether condensed uppercase role labels on every ticket are too much.
