---
name: design-recon
description: Use for ALL frontend/UI/UX work — new pages, apps, dashboards, landing pages, components, restyles, design systems, brand work. Grounds every design in measured reality instead of model defaults. It reads the project context, asks only the questions that change the output, scrapes live reference sites (tokens, fonts, frames, flows, diagrams, motion), builds from a written brief, then lints for AI-slop and screenshots the result for critique and user feedback.
---

# Design Recon

Generated UI looks generic because it is built from the average of the training data. Recon replaces the average with **measurements from real, chosen references** and a **brief the user approved**. After that, a **linter and screenshots** catch the defaults that slip through.

Scripts are in `scripts/` (Node 18+, Playwright). Run them from the project root. Every script prints a compact summary. Read the digests and look at the **sheets**, never at every frame.

## 0. Pick the mode (don't ask for this; decide)

| Situation | Mode |
|---|---|
| `.design/brief.md` exists, small change (component, fix, tweak) | **Build**: read brief → build → step 5 |
| brief exists, new page/surface | **Surface**: read brief, run recon only if this surface type has no references yet → 4 → 5 |
| no brief | **Full**: steps 1–6 |
| user says "quick", "just do it", or no time | **Full**, but infer every intake answer, state your assumptions in one line, and skip checkpoint A |

## 1. Read context silently (≤ 6 tool calls)

Get these from the repo before asking anything: framework and styling (`package.json`, tailwind config, CSS vars), existing tokens, components and brand assets (logo, `public/`, `/brand`), product copy (README, existing pages, docs), what the product actually does, and who it's for. Never ask about anything you can find.

## 2. Intake: one round, ≤ 4 questions (skip what step 1 answered)

Read `references/intake.md`. Ask with **one** AskUserQuestion call. Each option must be concrete to *this* product. Never offer generic choices like "Modern / Minimal / Bold". Then write `.design/brief.md` from the template there. Every later session starts from that file, so the user explains the product once.

## 3. Recon: measure 3–5 references

1. Choose references with `references/sources.md`: the user's URLs, 1–2 direct competitors, 1–2 **adjacent-world** references (from the subject's physical or cultural world, not the same product category), and one for motion if motion matters.
2. Run:
   `node scripts/recon.mjs <url> <url> … --out .design/recon --pages 2 [--flow "Pricing>Sign up"] [--motion]`
   - `--pages N`: auto-captures pricing, signup, docs, and product pages. `--flow`: clicks through named steps (it never submits forms).
   - `--motion`: load-sequence plus scroll filmstrip, hover diff, keyframes, and animation libraries. Use it when the brief's motion is not "none".
3. `node scripts/board.mjs .design/recon`: prints a comparison table and writes `board.html` for the user plus `board.jpg` for you.
4. Read each `digest.md` (~1k tokens) and view `board.jpg` plus at most 2 `sheet.jpg`.
5. Write a **Steal / Avoid** list into the brief, e.g. "Steal: Linear's 1px `#ffffff14` borders instead of shadows, 13px/510 controls, 160ms `cubic-bezier(.25,.46,.45,.94)`." Every line must cite a measured value and say *why it fits this brief*. Steal **systems** (scale ratios, density, border logic, motion timing), never identity (logos, illustrations, copy, proprietary fonts).

**Checkpoint A (skip in quick mode):** offer `board.html` (publish or open it). The user ticks traits and pastes back a `KEEP … / NOTE …` list. Apply it to the brief.

## 4. Direction: plan before code

Load `references/contexts.md` for the brief's context (SaaS/product, brand/marketing, content/ads, personal). Then write into `.design/brief.md` → `## Direction`:
- **Tokens**: 5–7 named colours (hex, each with a role), 1–2 families with roles and a type scale (px, with ratio), a spacing base, a radius ladder (control < card < sheet), elevation strategy, and motion tokens (`references/motion.md`).
- **Layout**: an ASCII wireframe of the key screen, plus alignment and grid.
- **The one memorable thing**: where boldness is spent. Everything else stays quiet.
- **Slop pre-check**: go through `references/slop.md` § Plan. Rewrite any choice you'd make for *any* similar product.

Fonts: `references/fonts.md`. Self-host with `node scripts/fetch-font.mjs "Family:wght@400..700" --out public/fonts`.

## 5. Build, then verify (every time, all modes)

Build with real content from the brief (no lorem, fake metrics, or stock avatars). Put tokens in CSS variables or the Tailwind theme first, then components. Include every state: empty, loading, error, long text, and mobile.

Then run both:
```
node scripts/slop-lint.mjs src/            # static tells; HIGH findings must be fixed
node scripts/shoot.mjs http://localhost:3000 --label v1   # or a .html path; add --click "Open drawer" for states
```
View `sheet.jpg`. Fix every item `report.md` lists: overflow, contrast, focus, fonts that didn't load, reduced motion, and radius or type-size sprawl. Then critique against the brief: does it look like *this* product, or like any product? Remove one accessory. Re-shoot until clean. Two or three iterations is normal.

## 6. Checkpoint B: targeted feedback, then log

Show the sheet and ask **one** AskUserQuestion with 2–4 dial questions chosen from what's actually uncertain (templates in `intake.md` § Feedback), e.g. density (tighter / as is / airier) or accent (louder / as is / quieter). Never ask "what do you think?". Apply the answers. Then append 3 lines to `.design/log.md`: what was tried, what the user rejected, and what stays. Read the log at the start of later sessions so you don't repeat rejected ideas.

## Rules

- The brief's explicit words beat every rule here, including a slop rule. Record a deliberate exception as `lint-allow: rule-id` in the brief.
- Legal and ethical: respect robots.txt (the default), never bypass logins or paywalls, and never copy logos, illustrations, copy, or paid font files. Recon is for measurement and inspiration.
- Token budget: digests and sheets only. Don't open `tokens.json` unless a value is missing from the digest. Don't read full-page frames individually.
- If Playwright is missing: `npm i -D playwright && npx playwright install chromium`. If a site blocks headless browsers, drop it and pick another.
