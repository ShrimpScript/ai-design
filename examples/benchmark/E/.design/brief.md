# Design brief: Tidemark
Updated: 2026-09-30
Mode: Quick (no human available). Assuming: brand/marketing site, no existing brand (create one), "Staff gauge" direction, references metoffice.gov.uk (adjacent world) + fathom.global (competitor, to differ from).
lint-allow: (none)

## Product
What it does: forecasts urban flooding street by street, up to 72 h ahead, from rainfall radar, tide gauges, river levels, drain-network maps and ground elevation.
Who: city emergency-management teams, water utilities, port authorities (Forecast + Alerts); insurers and logistics (API). Desktop at work, phone in the field.
Key screen job: prove in one glance that the model shows *which street floods, how deep, when*.
Context: brand / marketing site (B). Light theme by deliberate choice, with dark "ops-room" bands where the product UI appears.
Voice IS: exact, calm, operational. IS NOT: alarmist, hype-y, cute.

## Direction — "Staff gauge"
From the flood world's own instruments: the white staff gauge with E-shaped graduations and a red datum line, OS-map contour lines, cast-iron drain covers, hi-vis crew amber. Survey-paper surfaces (cool, slightly green grey — not cream), estuary-ink text, depth encoded in one sequential blue ramp, one amber brand accent used sparingly for actions/alerts, gauge red only for the threshold line.

## References
| site | why | steal (measured) | avoid |
|---|---|---|---|
| metoffice.gov.uk | adjacent world: public forecasting | scale ×1.22, 8/12px radii, border-only structure (no shadows), sentence-case plain H2s ("Find a forecast") | no reduced-motion rules; hero video |
| fathom.global | competitor (flood risk) | h1 72/1.0, body 21.6/1.35 on marketing, ease cubic-bezier(.25,1,.5,1) 0.5–0.65s | their identity: near-black #0d0d0d + electric blue #021cc7, 0 radius, mono labels, fadeInUp on everything, a hero with no product |

## Tokens
Colour: paper #F2F4F1 · paper-2 #E7EBE7 · surface #FFFFFF · ink #0E2229 · ink-2 #3F5359 · muted #5E6F73 · line #CAD3D0 · ops #0B1C22 (dark bands) · ops-2 #13292F · accent (hi-vis amber) #F0A81C · accent-ink #7A4A00 · datum red #C23A2B · depth ramp d1 #D4ECF0 d2 #9CCFDC d3 #5AA8C4 d4 #2A7BA6 d5 #16507F d6 #0F2F5C
Type: display Mona Sans (wdth 118, wght 640) for H1/H2, key numbers, product names · text Atkinson Hyperlegible Next 400/600 (legibility-first: same face as resident SMS/app alerts) · Martian Mono only for API code & coordinates.
Scale (×1.25, marketing): 13 · 15 · 18 · 22 · 34 · 52 · 84 (clamp); body 18 on marketing.
Space: 4px base; section rhythm 96/128 desktop, 64 mobile. Radius ladder: 4 control · 8 card · 16 sheet/panel · 999 pills only for status.
Elevation: borders and tone steps; one shadow for floating things (menus, tooltips).
Motion: 100/160/240/420ms; ease-out cubic-bezier(.25,1,.5,1); route transition = tide line sweep + crossfade 320ms; all instant under reduced motion.

## Layout (Home, desktop)
[header: mark+wordmark | Product How-it-works Customers Pricing | Request a demo]
[H1 left 6 cols: "Know which streets flood, 72 hours before the water does." sub + 1 CTA + secondary] [live forecast map 6 cols: city streets coloured by depth, T+h scrubber, gauge readout]
[proof strip: 3 real-looking metrics from the case study]
[pinned story: "One storm, 72 hours" — map advances with scroll through 5 steps]
[three products as working crops] [case study teaser] [CTA band]

## Craft
Display: Mona Sans wide for key line, numbers, product names · Text: Atkinson Hyperlegible Next · Key line: "Know which streets flood, 72 hours before the water does." at ~4.5× body
Signature: generative canvas — seeded fictional city (Kelsford) street network; depth per street computed from a moving rain cell, tide curve, river level, drain capacity and elevation; scrub 0–72 h with pointer/keyboard, auto-advances with time, hover a street for depth + timing.
Item graphics: draw(input kind) — radar (concentric arcs), tide gauge (E-staff), river level (channel section), drain network (node graph), elevation (contours): each input gets its own drawn silhouette; streets drawn by depth state.
Motion: moment = the forecast clock running T+0→72 h with water rising in low streets; state = scrubber, alert thresholds tripping, segmented controls sliding, form field validation.
Material/light: survey paper + ink linework, water as depth-tone (the only gradient is water depth), light from top-left.

## One memorable thing
The live street map where the water rises as the forecast clock runs — reused as the pinned scroll story.
