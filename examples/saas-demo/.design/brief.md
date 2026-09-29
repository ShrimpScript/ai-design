# Design brief: Firstlight
Updated: 2026-09-29
lint-allow:

> **Quick mode, deliberately vague request** ("a modern AI-centred SaaS site"). The vagueness is the delegation, so the skill chose everything and stated it:
> "Assuming: brand/marketing site for a fictional AI product, an **AI on-call engineer** (investigates production alerts at night). No existing brand, so a light identity is created. Direction 'first light'. References: incident.io (competitor), Cursor (AI craft), Stripe (scroll storytelling), DarkSky (adjacent world: night sky), plus Linear and Resend motion measured earlier."

## Product
What it does: when a production alert fires, Firstlight investigates like an on-call engineer. It reads logs, metrics, traces, recent deploys and runbooks, then posts a root cause with evidence. It acts only within policies you set, and pages a human otherwise.
Who: engineering teams of 20–500, SREs and on-call engineers. They evaluate it on a laptop, skeptically. They hate being woken up and hate AI hype more.
Primary job of the page: make a skeptical engineer believe the investigation is real and the guardrails are tight, then get them to replay one of their own past incidents.
Context: brand/marketing (with pricing and changelog routes)
Voice: IS precise, calm, engineer-to-engineer. IS NOT hype, "AI-powered", cute.

## Direction: "First light"
On-call is a night job. The page **starts at 03:12 at night** (deep navy, starlight text, one warm first-light amber) and **scrolls into morning**: the night-shift story section moves the page from night to dawn as the timeline advances. By the time you reach proof and pricing, it's daylight and calm (cool pale sky, ink text). The metaphor is the product promise: you sleep, it works, you wake to a summary.

## References (measured, see recon/*/digest.md, motion.md)
| site | why | steal (measured) | avoid |
|---|---|---|---|
| incident.io | direct competitor | serif-free restraint in UI panels; h1 −0.04em tracking at 80px; 6/8px radii ladder | warm paper `#f1ebe2` + orange `#f25533` (now the category look), centred hero with no subhead |
| cursor.com | AI craft | the product (agent UI) is the hero, left-aligned 9-word H1, standard `cubic-bezier(.4,0,.2,1)` | `#f7f7f4` paper + `#f54e00` orange (same category look), 3 CTAs |
| linear.app | restraint | 2 scroll reveals on the whole homepage; 1px low-alpha borders on dark; 100–160ms UI timing | Inter |
| resend.com | state motion | springs on accordions (opacity, scale and translate, 200ms `cubic-bezier(0,0,.2,1)`) | reduced motion not honoured (9 loops keep running) |
| stripe.com | scroll storytelling | see motion.md | — |
| darksky.org | adjacent world: night | deep blue night rather than black; stars as texture, not decoration | — |

Two AI-dev competitors share **warm paper + orange**, so Firstlight owns **navy night → cool dawn with one amber**.

## Tokens
- Night: `--night #0E1628` (ground) · `--night-2 #16213A` (panels) · `--night-line #24314F` · `--star #E6ECF5` (text) · `--star-2 #9AA8C2` (muted) · `--alert #FF7A6B` (incident red on night)
- First light (accent): `--amber #FFB36B` on night, `--amber-ink #9A4A0B` on day
- Day: `--sky #EEF2F7` (ground) · `--paper #FFFFFF` (panels) · `--ink #0E1628` · `--ink-2 #4A5873` · `--line #D5DDE8` · `--ok #1F7A55`
- Type: **Mona Sans** (variable width 75–125, weight 200–900). Expanded (wdth 112) for display, normal for text, condensed (wdth 85) for data labels. One family with three voices. **Martian Mono** only for log lines, queries and IDs (the product literally reads logs). Scale 13/15/17/20/28/40/64 (~×1.3).
- Space: 4px base, section rhythm 120px desktop / 72px mobile. Content max 1200px.
- Radius ladder: 4 (tags) → 8 (controls) → 14 (product panels). Elevation: 1px lines on night; one shadow for the floating product panel on day.
- Motion: `--ease-out cubic-bezier(.2,0,0,1)`, 160/240/420ms. **One** scroll-linked signature (night → dawn); reveals only on the story steps. Route changes use a view transition (≤ 280ms crossfade + shared page title). Reduced motion means static colours per section, and no replay animation.

## Layout
```
NIGHT ─────────────────────────────────────────────────────────────
[◠ Firstlight]   Product  Pricing  Changelog  Docs        Sign in [Replay an incident]
H1 (wdth 112, 64px, 2 lines, left)          │ ┌ INC-2291 · checkout-api 5xx 8.4% ─┐
"The 3 a.m. page, investigated               │ │ 03:12:07 PagerDuty alert            │
 before you wake up."                        │ │ ✓ read 2,341 log lines              │
sub 140 chars                                │ │ ✓ deploy #4812 changed pool 50→5    │
[Replay an incident]  See a full investigation│ │ ✓ payments-db p99 ×9 at 03:05      │
Reads from PagerDuty · Datadog · Grafana …   │ │ ROOT CAUSE  high confidence         │
                                             │ │ [Approve revert] [Page Maya]        │
STORY (pinned, scroll-linked) ─ night → dawn ─┴─────────────────────────────────────
 sticky clock 03:12 → 07:40 + rising horizon │ steps: alert, acked, evidence, revert, recovered, summary
DAY ───────────────────────────────────────────────────────────────
How it investigates (diagram: signals → hypotheses → evidence → action, with the guardrail gate)
Guardrails table (reads / proposes / acts alone under policy / never)
Sample week of investigations (table, labelled sample)
Final CTA: replay one of your own incidents (read-only token)
```

## One memorable thing
Scrolling **through the night shift turns the page from night into morning**, with the clock, the horizon, and the timeline all moving together.

## Slop pre-check
- No orb, sparkle, neural net, typewriter, or "AI-powered" headline. The hero is a real investigation with real evidence. ✔
- Palette from the subject (night on call → dawn), not purple glow and not the category's paper+orange. ✔
- Type: Mona Sans (not in any AI tier), chosen for its width axis. Mono only for logs. ✔
- Proof is a labelled sample table, not "trusted by 10,000 teams". ✔
