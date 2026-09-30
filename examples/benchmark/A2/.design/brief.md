# Brief — Sill, a houseplant watering tracker
Mode: Quick (no human available). Assumptions: personal single-user web app, one file, data in localStorage, light theme, desktop + phone, opens seeded with labelled example plants.

## Recon (2 refs)
- getplanta.com (competitor): all-green palette #234823/#e7edde/#c5dfaa, GT-America everywhere, pill buttons r=pill h52. **Avoid** the green-on-green monotone and one-face voice; **steal** body 20/1.4 comfort and cubic-bezier(.4,0,.2,1) 150ms hovers.
- eastfork.com (adjacent world: hand-made pottery): glaze palette clay #b05c0c, olive #635c38, navy #001a70, bone #ede6d6; small radii 4/8, 1px black rules as structure, base 4px spacing. **Steal** glaze colours for the drawn pots and 1px rules instead of card shadows; **avoid** their cream+serif shop look.
- Craft technique: parametric SVG plants on a sill, 2–3 flat tones + one highlight, light from top-left (pot highlight left, shade right, contact shadow).

## Tokens
wall #E8EBE9 · page #F4F5F2 · ink #1E2320 · muted #59605B · rule #CFD5D0 · sill wood #C4A175/#9E7B52 · water (accent, actions; enamel watering-can petrol) #1F6F8B text #17596F · thirsty #B26B12 text #8A5000 · fine #4E7A45
Radius: 4 control / 8 row / 16 sheet. Spacing base 4. Motion: 160ms UI, 450ms water rise, ease cubic-bezier(.2,.8,.2,1).

## Craft
Display: Corben 700 for key line, plant names, big numbers · Text: Golos Text 400/500/600 · Key line: "Two plants need water today." at ~4× body (64px desktop, 40px phone)
Signature: parametric SVG windowsill — every plant standing on a wooden sill, each with a moisture stake whose blue fill = days left / interval; leaves droop and yellow as soil dries; sorted by urgency.
Item graphics: draw(kind, moisture, glaze, size) — silhouettes: monstera (split leaves), snake plant (upright banded blades), cactus (ribbed column + arm), fern (arching fronds), pothos (trailing vines), fiddle-leaf fig (tall stem, violin leaves), ZZ (arching stems, paired oval leaflets), peace lily (lance leaves + white spathe).
Motion: moment = sill plants rise in on load (staggered 50ms); state = on "Water" the stake fills and leaves lift (450ms tween), row slides to its new group.
Material/light: glazed ceramic pots (clay, bone speckle, indigo, celadon, charcoal, ochre), wood sill, limewash wall; light from top-left.

## Layout
header: Sill wordmark · date · [Add plant]
hero: key line + one-sentence detail | sill SVG (full width, scrolls sideways inside itself on phone)
main: schedule (Late & today / This week / Later) rows w/ drawn plant, stake bar, due, [Water] | aside: next 14 days grid, recent waterings
drawer: add/edit plant (kind picker drawn, glaze swatches, interval stepper, last watered date, room, notes)
