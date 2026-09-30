# Slop: what gives generated UI away, and what to do instead

The brief's explicit words override this list. Everything here is a *default*, not a crime. The test for any choice: **would I have made the same choice for a different product?** If yes, it's a default. Replace it with something derived from this brief.

## Plan (check the Direction section before writing code)
- [ ] The palette came from the subject's world or the brand, not from "tech = purple/blue", "premium = cream + serif", or "dev tool = black + acid green".
- [ ] The typeface was chosen for a reason you can state (x-height for dense data, a width axis for headings, the voice) and isn't on the default list without that reason.
- [ ] The hero or first screen shows the product's actual thing, not a generic headline + subhead + two buttons + gradient.
- [ ] The layout isn't the template stack (hero → logos → 3 feature cards → testimonial → pricing → CTA) unless the story needs that order.
- [ ] Boldness is spent in exactly one place.
- [ ] The copy uses the user's nouns and verbs. No sentence could be pasted onto another product's site unchanged.

## Visual tells → replacements
| Tell | Instead |
|---|---|
| Purple→blue/pink gradients, gradient text, blurred blobs | A flat palette from the subject. If you need a gradient, make it a *material* (light on paper, water depth), not decoration |
| Cream `#F4F1EA` + serif + terracotta `#D97757` | If warm and editorial really fits, pick a different paper tone and accent from the subject |
| Near-black + acid green / vermilion | Dark only if usage demands it (night use, media). Then take the accent from the domain |
| Same radius and the same soft shadow on everything | A radius ladder by hierarchy (e.g. 4 control / 8 card / 14 sheet), structure via 1px borders or tone steps |
| Everything in cards; cards in cards | Let whitespace and alignment group things. Use cards only for movable or selectable objects |
| 3-up feature grid of icon tile + title + blurb | Show the feature working: a screenshot crop, a live mini-demo, a before/after, or a table |
| Tracked ALL-CAPS eyebrow above every heading | Nothing, or a label that carries information (a date, a category the user filters by) |
| `01 / 02 / 03` markers | Only for real sequences (steps, a timeline) |
| `A · B · C` meta strings, `WORD — fragment` labels | Plain structure: separate lines, a table, or real labels |
| Emoji as icons, ✨ sparkles for "AI" | One icon set at one stroke weight, or none. Name the AI feature by what it does |
| Monospace for small labels as decoration | Mono only for code, IDs, or tabular alignment where it helps |
| Glassmorphism, noise overlays, grid-line backgrounds by default | Only when the direction calls for them |
| Centred everything | Left-aligned reading, centred only for short, singular moments |
| Fade-up on every section, hover-lift on every card, infinite pulses | One orchestrated moment; motion that answers actions (`motion.md`) |
| Tailwind default palette (`indigo-600`, `slate-*`) used raw | Named brand tokens; tints computed from them |
| Lucide icons at 24px/2px everywhere with no adjustment | Size icons to the text (1em-ish), and match stroke to the type weight |

## Copy tells → replacements
| Tell | Instead |
|---|---|
| Unlock, elevate, supercharge, seamless, effortless, empower, revolutionise, next-gen, cutting-edge, "built for the future" | The literal verb: "Swap shifts without texting the manager" |
| "Get started →", "Learn more", "Submit" | Name the action and its result: "Build this week's schedule", "Save changes" |
| "Trusted by 10,000+ teams", ★★★★★, "10x faster" | Real proof from the brief, or nothing |
| Lorem ipsum, John Doe, Acme, "Feature one" | Realistic, subject-specific content (real-looking names in the right culture, plausible numbers) |
| "Welcome back, Sam 👋" | The user's work, with what needs attention first |
| Title Case Everything | Sentence case |
| Errors that apologise ("Oops! Something went wrong") | What happened and what to do: "Couldn't publish. 2 shifts overlap on Friday. Fix them or publish anyway." |

## Awkward themes, colour schemes and branding
Run `node scripts/palette.mjs <css or name=#hex…>` on the tokens. It flags generated palettes (purple pair, cream + clay, black + acid, cyberpunk cyan + magenta, pastel rainbow) and awkward ones: muddy mid-tone accents, vibrating complements at equal lightness, two neons, one neon next to a dull accent, > 3 accents, warm and cool greys mixed, near-duplicate tokens, text below 4.5:1, and accents with no text shade.
Awkward **themes**: dark mode made by inverting the light palette (dark grey on black, oversaturated accents), glassmorphism on a busy background, a "premium" black-and-gold that reads as a casino, gradients on every surface, a theme whose palette contradicts the voice (a neon party palette on a finance tool), and a light and dark theme that don't feel like the same brand.
Awkward **branding**: see `brand.md` §7 (cliché names, marks that read as UI icons, personality mismatch, borrowed identity).

## AI-product tells
Glowing orb or neural-net art, sparkle icons, a typewriter cycling "for X / for Y", a "How can I help you today?" chat bubble, "AI-powered" as the headline, sci-fi fonts (`fonts.md` § novelty), purple-to-cyan glow, and a fake chat transcript that shows nothing specific. Instead: **show a real task being done end to end** (input → reasoning/evidence → output → the human's control over it), the guardrails, and the actual time or cost saved on an example.

## App-specific tells
Four equal KPI cards on top; donut charts for 3 values; the same icon-in-a-tile before each nav item; a table with every column the same weight; modal for everything (use inline edit or a drawer); a toast for every success (when the UI change itself is the confirmation, skip the toast).

## Automated
`scripts/slop-lint.mjs` catches most of the visual and copy tells statically (rule ids appear in its output, and you can allow one with `lint-allow:`). `scripts/shoot.mjs` catches runtime ones: radius sprawl, type-size sprawl, fonts that didn't load, contrast, focus, and reduced motion. Neither judges taste, so always look at the sheet.
