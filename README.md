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

If you're deliberately vague ("a modern AI SaaS site"), the skill treats that as delegation: it chooses everything, writes it down, and asks nothing. Otherwise, the first time, the skill asks at most four questions: context, brand, direction, and references. Each option is written for *your* product, never "Modern / Minimal / Bold". It saves the answers to `.design/brief.md`. Every later session reads that file instead of asking again. Say "quick" and it asks nothing, states its assumptions in one line, and proceeds.

## What's inside

```
skills/design-recon/
  SKILL.md                 the workflow (~1.6k tokens, was 2.4k; references load only when needed)
  references/
    intake.md              the 4 questions, brief template, feedback dials
    contexts.md            product/SaaS · brand/marketing · content+ads (IAB, Better Ads, CLS, consent) · personal
    slop.md                tells → replacements (visual, copy, app-specific) + plan pre-check
    sources.md             where references come from, per need (flows, motion, diagrams, fonts…)
    brand.md               brand systems: metaphor → mark (16px test) → wordmark/lockups → palette roles → advanced typography → graphic devices; awkward-branding rejects
    3d.md                  3D objects: assembly spec → build from relationships → inspect3d → independent cross-review ×2; lighting, materials, fallback, budget, 3D slop
    patterns.md            motion tokens + tool choice, clean heroes, scroll transitions, page transitions, in-page updates: recipes, budgets, exemplars to measure
    fonts.md               house preference (round, open, regular width, ≥ 400), Google and Anthropic-style fallbacks, tiers (AI-default / saturated / condensed / novelty), commercial → free
  scripts/
    recon.mjs              measure live sites → digest.md (~1k tokens, incl. hero anatomy) + one contact sheet
    motion.mjs             measure HOW a site moves: reveals (from→to, timing, stagger), scroll-linked/pinned, GSAP/ScrollTrigger, page transitions, tab/toggle/accordion motion
    board.mjs              merge recons → comparison table + board.html the user ticks and copies back
    shoot.mjs              screenshot YOUR build at 390/768/1440 + runtime audit (--frames for scroll states, --click for UI states)
    inspect3d.mjs          3D assembly verification: threading, gravity, attachment, interpenetration in every pose; 6 orbit views + x-ray; --poster fallback
    doctor.mjs             environment check (Playwright, Chromium, WebGL, network) with the fix for each gap
    slop-lint.mjs          static detector for generated-UI tells (no dependencies)
    brandboard.mjs         brand.json → one brand board (lockups, 16px favicon test, palette, type, voice, OG) + og.png, favicon.svg, tokens.css
    palette.mjs            awkward or AI colour-scheme audit in OKLCH (muddy, vibrating, neon pairs, grey temperature, duplicates, contrast)
    specimen.mjs           render candidate fonts with your headline on your colours → one image, tier-flagged
    fetch-font.mjs         self-host Google Fonts / Fontshare faces (woff2 + @font-face)
    lib/fonts.mjs          font tiers + round list shared by lint, shoot, recon, specimen, brandboard
    lib/color.mjs          OKLCH, contrast, palette audit
  tests/smoke.mjs          9 smoke tests: every script against known-good and known-bad fixtures (~20s; --offline)
  tests/fixtures/          slop page (0/100, 19 findings), threaded vs floating 3D part
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
| **Hero** | headline words/lines, subhead length, eyebrow, CTA count and labels, logo strip, media position, background type, section height |
| **Motion mechanics** (`motion.mjs`) | reveal values and timing, stagger, scroll-linked and pinned elements, GSAP tweens and ScrollTrigger configs, Lenis, CSS scroll timelines, SPA vs full reload, View Transitions, springs in state changes, reduced-motion compliance |
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
| 3D assembly verification | — | — | — | ✔ geometric checks + x-ray + independent cross-review |
| Fonts | advice (its recommended list is now itself overused) | advice | pairings list | ✔ 3 enforced tiers, specimen renders, commercial→free map, self-host |
| Motion from real sites | — | `animate` command | — | ✔ measured reveals, scrub, pinning, transitions, springs |
| Verification budget (no over-checking) | — | — | — | ✔ ≤ 3 targeted shoot rounds |

It **stacks** with the others: `frontend-design`'s taste principles and `impeccable`'s commands both work on top of a recon-grounded brief. This skill adds the evidence and the verification.

**Token budget:** the model reads digests (~1k tokens per site), one board image, and one contact sheet per build round, never raw HTML or individual frames.

## Examples
- [`examples/test-run/`](examples/test-run/) **Rail**: a product web app (restaurant shift scheduling). Recon of 4 sites → brief → build → 4 verify rounds.
- [`examples/keyring/`](examples/keyring/) **keyring**: "use your AI subscriptions in the cloud". A generated brand system (board, OG, favicon), a procedural 3D keyring hero, round type (Google Sans Flex `ROND`), and a palette audit.
- [`examples/saas-demo/`](examples/saas-demo/) **Firstlight**: an AI SaaS marketing site from a one-line prompt, with zero questions asked. Recon plus motion recon, a scroll-linked night → dawn story, view-transition routes, and 3 budget-capped verify rounds.

## Limitations (known, measured while building the examples)
- **Bot walls and logins:** Cloudflare-style challenges, login-walled apps (Mobbin, Refero, most SaaS dashboards), and paywalls can't be recon'd. Use public pages, docs, or user-supplied screenshots.
- **Heavy WebGL/animated sites are slow:** under headless software rendering, `motion.mjs` can take 1–2 min per site, because every measurement waits on a busy main thread. Run it in the background on 1–2 sites.
- **JS-driven motion timing:** Motion (Framer Motion) and custom rAF animations don't expose durations to the browser, so reveals show from→to values but "timing: not exposed". GSAP is introspected fully. Springs show up as `linear()` easings and are labelled "spring".
- **Heuristics:** button, card, hero, and ad detection are heuristics. They are usually right but can misread unusual markup, e.g. a CTA label swallowing a whole panel's text (now length-capped).
- **One viewport per pass:** recon measures 1440 and 390 only, in the light scheme. Dark-mode variants and tablet layouts aren't captured.
- **Fonts behind cross-origin CSS:** `@font-face` names can be missing. Families still appear via computed styles and loaded fonts.
- **Static lint is textual:** it can't see styles computed at runtime (CSS-in-JS themes). `shoot.mjs` covers the runtime side (fonts, radii, contrast), and neither judges taste, so the sheet still needs a look.
- **Frames are timing snapshots:** filmstrips show states, not smooth motion. `--video` records a webm for humans.
- **3D verification covers declared relationships:** threading, attachment, gravity and clearance are checked only for parts you annotate. Undeclared mistakes (wrong proportions, ugly composition) still need the cross-review, which is why it's mandatory for 3D.
- **3D in the artifact viewer:** the hero loads Three.js from jsDelivr; if a host blocks it, the built-in SVG fallback stays. Heavy glTF models need a real host (keep them < 1.5 MB).
- **Brand marks are drawn by the model:** strong for geometric marks, weak for illustrative or hand-drawn identities. Use a designer for those; the brandboard still tests the result.
- **Round preference is house taste:** earlier demos (Rail's condensed Archivo, Firstlight's tight tracking) predate it and now draw MED lint findings. Set `lint-allow` in a brief to opt out.
- **Tiers age:** "trend-saturated" fonts and palettes change. Update `lib/fonts.mjs` and `slop.md` as new defaults emerge.
