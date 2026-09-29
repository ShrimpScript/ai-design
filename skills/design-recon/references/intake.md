# Intake: ask once, write it down, never ask again

## Rules
- One AskUserQuestion call, 1–4 questions, and only for gaps step 1 couldn't fill.
- Options are **specific to this product** and written so the user can pick without thinking. Put your recommendation first and mark it "(Recommended)".
- Use `preview` to show what an option means: an ASCII layout, a 5-hex palette, or a type sample.
- The user can always choose "Other". Don't add a "Something else" option.

## The four questions (drop any already answered)

**Q1 Context**: "What is this, mainly?" (header: `Context`)
- Product / SaaS app: people *use* it repeatedly (tasks, data, settings).
- Brand / marketing site: it has to *persuade* and be remembered.
- Content / ad-supported: people *read* it, ads pay for it.
- Personal / portfolio / experiment: it *expresses* someone, and risk is welcome.
(If it's an app with a marketing site, ask which surface we're doing now.)

**Q2 Brand**: "What brand exists already?" (header: `Brand`)
- Full kit (logo, colours, fonts). I'll point to it or it's in the repo.
- Logo only. Derive the rest from the product's world.
- Nothing. Create a light identity (wordmark treatment, palette, type, voice).
- Stay neutral / white-label (it will be themed per customer).

**Q3 Direction**: "Which direction fits?" (header: `Direction`)
Write **3 directions derived from the subject's world**, each one line plus a preview (palette hexes, type pairing, a tiny ASCII layout). Example for a tide-log app:
- "Nautical chart": paper white, chart-blue depth tints, condensed labels, contour lines as dividers.
- "Harbour noticeboard": off-white, one signal orange, big numerals for tide times, dense tables.
- "Wetsuit": near-black neoprene, one reflective accent, rubbery rounded controls.
Never offer "Modern", "Minimal", "Clean", "Bold", "Playful", or "Professional". Those are adjectives, not directions.

**Q4 References**: "Any sites or apps to learn from (or avoid)?" (header: `References`)
- I'll paste URLs (they can go in "Other").
- Find them for me: competitors plus adjacent-world picks.
- Skip recon, go straight to building.

Extra questions, only when they really are unknown and matter:
- Ads: "Which ad formats are sold?" (display IAB / native / sponsor slots / none yet)
- Motion: "How much motion?" (functional only / one signature moment / motion is the product)
- Platform: "Primary device?" (desktop work tool / phone-first / both equally)
- Density: "How often do users come back?" (all day / weekly / once)

## Quick mode
Infer all answers, then state them in one line: *"Assuming: SaaS app, no brand, 'harbour noticeboard' direction, competitors X and Y. Say if any is wrong."* Then proceed.

## Brief template → `.design/brief.md`
```md
# Design brief: <product>
Updated: <date>
lint-allow:            <!-- rule ids deliberately allowed, e.g. default-font (Inter chosen for x-height in dense tables) -->

## Product
What it does (1 line, the user's words):
Who uses it, how often, on what device:
Primary job of the key screen:
Context: product | brand | content+ads | personal
Brand assets: <paths / none>
Voice: 3 adjectives it IS / 3 it is NOT

## Direction
<chosen direction, 1–2 lines, including the subject-world source>

## References
| site | why | steal (measured) | avoid |

## Tokens
<colours with roles, type families + scale, spacing base, radius ladder, elevation, motion>

## Layout
<ASCII wireframe of the key screen>

## One memorable thing
<where boldness is spent>
```

## Feedback (checkpoint B): dial templates
Pick 2–4 whose answer you actually don't know. Always offer "As is".
- Density: Tighter (more on screen) / As is / Airier
- Accent: Louder / As is / Quieter (more neutral)
- Type: More character in headings / As is / Plainer
- Contrast: Stronger structure (lines, tones) / As is / Softer
- Motion: More presence / As is / Less (functional only)
- Direction: Push further into <direction> / As is / Pull back toward conventional
- Specific component: "The <shift block> reads as…" A / B / As is (with previews)
Record the answers in `.design/log.md`.
