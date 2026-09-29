# design-recon

A Claude Code skill for **all frontend work**. It replaces the model's average taste with **measurements from real references** and a **brief you approve once**, then **lints and screenshots** the result until the AI-slop is gone.

```
context (silent) → ≤4 questions, once → recon live sites → brief + tokens → build → slop-lint + shoot → 1 feedback round
```

## Install

```bash
# as a plugin
/plugin marketplace add shrimpscript/ai-design
/plugin install design-recon@ai-design

# or copy the skill
cp -r skills/design-recon ~/.claude/skills/            # all projects
cp -r skills/design-recon .claude/skills/              # one project

# scripts need Playwright + Chromium (the linter needs nothing)
npm i -D playwright && npx playwright install chromium
```

**Zero-explanation setup.** Put this line in your project's `CLAUDE.md`, and from then on "build the settings page" is enough:

```md
Use the design-recon skill for all frontend/UI work. The design brief lives in .design/brief.md.
```

The first time, the skill asks at most four questions: context, brand, direction, and references. Each option is written for *your* product, never "Modern / Minimal / Bold". It saves the answers to `.design/brief.md`. Every later session reads that file instead of asking again. Say "quick" and it asks nothing, states its assumptions in one line, and proceeds.

## What's inside

```
skills/design-recon/
  SKILL.md                 the workflow (72 lines; references load only when needed)
  references/
    intake.md              the 4 questions, brief template, feedback dials
    contexts.md            product/SaaS · brand/marketing · content+ads (IAB, Better Ads, CLS, consent) · personal
    slop.md                tells → replacements (visual, copy, app-specific) + plan pre-check
    sources.md             where references come from, per need (flows, motion, diagrams, fonts…)
    motion.md              motion tokens, tool choice (CSS → View Transitions → Motion/GSAP → Lottie/Rive), diagrams
    fonts.md               choosing, overused list, commercial → free equivalents, self-hosting
  scripts/
    recon.mjs              measure live sites → digest.md (~1k tokens) + one contact sheet
    board.mjs              merge recons → comparison table + board.html the user ticks and copies back
    shoot.mjs              screenshot YOUR build at 390/768/1440 + runtime audit
    slop-lint.mjs          static detector for generated-UI tells (no dependencies)
    fetch-font.mjs         self-host Google Fonts / Fontshare faces (woff2 + @font-face)
  tests/fixtures/slop.html a "typical AI landing page" (scores 0/100, 19 findings)
```

### What recon measures, per site
| | |
|---|---|
| **Colour** | area-weighted surfaces, text colours by character share, link/button accent, borders, gradients, the site's own CSS custom properties |
| **Type** | families by text share, type scale + ratio, h1/h2/h3/body/button specs (size/line-height/weight/tracking/case), font sources (Google/Adobe/self-hosted) + `@font-face` |
| **Space & shape** | spacing base unit, radii and shadow inventory, container widths, header behaviour, hero composition |
| **Components** | button signatures (bg/fg/radius/padding/height), repeated card anatomy, form/table/dialog counts, **primary-CTA hover diff** |
| **Motion** | transition durations + easing curves, `@keyframes` (deduped, with samples), running animations, libraries (GSAP, Motion/Framer, Lottie, Rive, Three, Lenis…), `.riv`/Lottie assets, reduced-motion, scroll-driven CSS, view transitions; `--motion` adds a load + scroll **filmstrip** |
| **Frames & flows** | desktop, mobile, full page, auto-discovered pricing/signup/docs pages (`--pages`), click-through flows (`--flow "Pricing>Sign up"`, never submits forms) |
| **Diagrams** | large inline SVG/canvas saved as source + frames |
| **Ads** | slot sizes (IAB match), positions, sticky, for ad-supported briefs |
| **Voice** | h1/h2/CTA/nav copy |

It respects `robots.txt` (RFC 9309 matching), dismisses cookie banners with "reject" first, and never logs in.

## How it compares with existing frontend skills

| | Anthropic `frontend-design` | `impeccable` | `ui-ux-pro-max` | **design-recon** |
|---|---|---|---|---|
| Anti-slop guidance | ✔ principles | ✔ 24 commands | style database | ✔ tells → replacements, plan pre-check |
| Grounded in **live, chosen references** | — | — | static curated lists | ✔ measured tokens, motion, flows |
| Context-specific rules (SaaS / brand / **ads** / personal) | partial | partial | by industry | ✔ incl. IAB slots, Better Ads, CLS, consent |
| Asks once, remembers | — | ✔ PRODUCT.md | — | ✔ `.design/brief.md` + `log.md` of rejected ideas |
| Structured user feedback | — | — | — | ✔ tickable reference board + dial questions |
| Deterministic slop detector | — | ✔ | — | ✔ `slop-lint` (static) + `shoot` (runtime) |
| Screenshot critique loop | suggested | ✔ | — | ✔ one contact sheet per round |
| Fonts | advice | advice | pairings list | ✔ commercial→free map + self-host script |

It **stacks** with the others: `frontend-design`'s taste principles and `impeccable`'s commands both work on top of a recon-grounded brief. This skill adds the evidence and the verification.

**Token budget:** the model reads digests (~1k tokens per site), one board image, and one contact sheet per build round, never raw HTML or individual frames.

## Test run
[`examples/test-run/`](examples/test-run/) is a full run on a restaurant shift-scheduling web app ("Rail"): recon of 4 sites → brief → build → 4 verify rounds. It records what recon changed and what the verifier caught.
