---
name: design-recon
description: Use for ALL frontend/UI/UX work — new pages, apps, dashboards, landing pages, components, restyles, design systems, brand identity, 3D heroes. Grounds design in measured reality instead of model defaults. Reads the project, asks only the questions that change the output, measures live reference sites (tokens, type, motion, flows), builds from a written brief, then verifies with slop/palette lint, breakpoint screenshots and, for 3D, geometric assembly checks.
---

# Design Recon

Generated UI looks generic because it comes from the average of the training data. This skill replaces the average with **measurements from chosen references** and a **brief written once**, then **verifies** the result with tools and screenshots. Scripts live in `scripts/` (Node 18+, Playwright). Run them from the project root. First run on a new machine: `node scripts/doctor.mjs`.

## 0. Decide the mode and effort (never ask)
| Situation | Do |
|---|---|
| `.design/brief.md` exists, small change | **Build**: read the brief → build → verify (step 5). No recon. |
| brief exists, new surface | **Surface**: recon only if this surface type has no references yet → 4 → 5 |
| no brief, clear request | **Full**: 1 → 6 |
| "quick", no human available, or a deliberately vague prompt ("a modern AI SaaS site") | **Quick**: infer every answer, state the assumptions in one line in the brief, **2 references, no board**, skip checkpoint A, and a second shoot round only for real defects |

Split the request first: what the brief, the code or this skill already covers (apply it, mention it in one line) versus what is new (where the effort goes). Don't re-verify decisions the user already made.

## 1. Context, silently (≤ 6 tool calls)
Stack and styling (`package.json`, Tailwind config, CSS vars), existing tokens/components/brand assets, product copy, audience. Also read `PRODUCT.md`/`DESIGN.md` (impeccable), a design section in `CLAUDE.md`, and `.design/log.md` (ideas already rejected). Never ask what you can find.

## 2. Intake: one AskUserQuestion, ≤ 4 questions → `.design/brief.md`
Use `references/intake.md`: context · brand · direction (3 options from the subject's world, never "Modern/Minimal/Bold") · references. The brief is the memory; later sessions read it instead of asking.

## 3. Recon (Full: 3–5 sites, Quick: 2–3)
Pick sites with `references/sources.md`: the user's picks, 1–2 competitors (to differ from), 1–2 **adjacent-world** sites (the subject's physical or cultural world). Then:
`recon.mjs <urls> --out .design/recon --pages 2` → read each `digest.md` (~1k tokens) and `board.mjs` → view `board.jpg`. Write **Steal / Avoid** lines into the brief. Each line cites a measured value and why it fits; steal systems (scale, density, borders, timing), never identity. Checkpoint A (Full only): the user ticks `board.html` and pastes back KEEP/NOTE.

## 4. Direction (in the brief, before code)
Tokens (colours by role, 1–2 families + scale, spacing, radius ladder, elevation, motion) · ASCII layout · **one memorable thing** · slop pre-check (`references/slop.md` § Plan). Load only what the brief needs:
| Need | Reference | Tool |
|---|---|---|
| Context rules (SaaS, brand, ads, personal) | `contexts.md` | — |
| Type (prefer round, open, regular width, ≥ 400; **rotate faces**, never the previous project's, specimen ≥ 3) | `fonts.md` | `specimen.mjs`, `fetch-font.mjs` |
| Brand system, logo, advanced typography | `brand.md` | `brandboard.mjs` → board, OG, favicon, tokens |
| Colour sanity | `slop.md` § Awkward | `palette.mjs` |
| Hero, scroll, page transitions, state motion, diagrams | `patterns.md` | `motion.mjs` (measure exemplars, runs in the background) |
| 3D object | `3d.md` | `inspect3d.mjs` |

## 5. Build, then verify (every mode)
Real content (no lorem, fake metrics, stock avatars, "acme"). **Apps open in a realistic working state:** seed clearly labelled example data by default (with a way to clear it), not behind a "try examples" button. The empty state is a state you design, not the first impression. Tokens first, then components, and every state (empty, loading, error, long text, mobile). Then:
```
node scripts/slop-lint.mjs src/                        # HIGH must be fixed
node scripts/palette.mjs src/styles.css                 # awkward / AI colour combinations
node scripts/shoot.mjs <url|file> --label v1           # 390/768/1440 + contrast, focus, overflow, fonts, motion
node scripts/inspect3d.mjs <url|file>                   # only if there is 3D: must PASS, then cross-review
```
View `sheet.jpg`, fix every reported item, then critique: *this* product, or any product? Remove one accessory.
**Budget:** ≤ 3 shoot rounds. Re-shoot only what changed (`--widths`, `--click`, `--frames`), and never re-run passing checks on unchanged code.
**3D is the exception to "look once":** declare the assembly (what threads, rests on, or attaches to what), pass `inspect3d` in every pose, then have an independent reviewer (a sub-agent given only the spec and `views.jpg`) confirm each relationship. Repeat until two consecutive clean passes. Models look right from the hero angle while floating or clipping in 3D.

## 6. Checkpoint B → log
One AskUserQuestion with 2–4 dials on what's actually uncertain (`intake.md` § Feedback). Apply the answers, then append tried / rejected / kept to `.design/log.md`.

## With other skills (hand-offs, no double work)
- **frontend-design, impeccable (taste and critique):** run on top of this brief. They critique; this skill measures and verifies. One intake only. If their defaults conflict with the brief (e.g. a serif/cream look), the brief wins.
- **artifact-design:** when the output is a claude.ai artifact, its page contract (single file, allowed CDNs, theme tokens) governs packaging. This skill governs the design.
- **dataviz:** charts, KPI tiles and chart colours follow it, with the brief's palette as input.
- **run:** start the app to get a URL for `shoot.mjs`/`inspect3d.mjs`. **code-review / simplify:** after the build, for the code.
- **Other stacks:** Tailwind v4 via `brandboard`'s `tokens.tailwind.css`; Next.js fonts via `next/font` with the chosen family. Native mobile is out of scope, but the brief, brand and palette still apply.

## Rules
- The brief's explicit words beat every rule here. Record exceptions as `lint-allow: rule-id`.
- Respect robots.txt, never bypass logins or paywalls, and never copy logos, copy, illustrations or paid font files. Third-party products appear as plain-text names, not logos or colours.
- Token budget: digests and contact sheets, not raw frames or `tokens.json`.
