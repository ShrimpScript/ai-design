# Benchmark: design-recon vs frontend-design (same prompt, blind judging)

## Setup (the only variable is the skill)
- **Prompt:** identical template for both runs. Only the working directory and the skill folder name differ:
  > …A design skill is installed at `<dir>/.claude/skills/<skill>/`. Read its SKILL.md first and follow it… **Task: Build a web app for keeping track of when to water your houseplants.** Deliver a single self-contained file at `<dir>/out/index.html`… No human is available to answer questions, so make your own decisions. Work only inside `<dir>`…
- **A** = `design-recon` (this repo at commit `923b446`, copied without `examples/` so it couldn't crib past outputs). **B** = Anthropic's `frontend-design` (`anthropics/skills`, SKILL.md + LICENSE, fetched 2026-09-30).
- Same model, fresh context for each, launched at the same moment (05:24:47Z). Parallel runs share CPU, which penalises A slightly (it runs a headless browser).
- Time and tokens come from the harness's own per-agent usage report.

## Cost
| | A: design-recon | B: frontend-design |
|---|---|---|
| Wall time | **461.9 s** | **139.8 s** |
| Tokens | **111,112** | **59,054** |
| Tool calls | 30 | 5 |
| Output | 45,968 B | 27,566 B |

A costs **3.3× the time and 1.9× the tokens**. That buys recon of 4 sites (2 more were skipped: robots.txt and a bot challenge), a brief, and 3 screenshot/verify rounds.

## Neutral checks (`eval.mjs`: third-party axe-core 4.13 + a generic functional probe)
| | A | B |
|---|---|---|
| axe serious / critical | **0** / 0 | **8** (colour-contrast) / 0 |
| axe moderate | 1 (no `<h1>`) | 1 (no `<main>` landmark) |
| Add a plant (open → fill → submit) | ✔ | ✔ |
| Persists after reload | ✔ | ✔ |
| Console errors | 0 | 0 |
| Mobile horizontal overflow | 0 px | 0 px |

The functional probe was first unfair to B: it filled a stray first-screen field and missed B's dialog. It was fixed to apply one rule to both apps (open the add flow when no submit control is visible) before the numbers above.

## Blind judging (4 fresh judges; labels X/Y counterbalanced; file names scrubbed)
| Round | Judge | A overall | B overall | Ships | A distinct. | B distinct. | A usability | B usability |
|---|---|---|---|---|---|---|---|---|
| 1: first screen each app shows | 1 (A = X) | 5 | **8** | B | 3 | 8 | 5 | 8 |
| 1: first screen each app shows | 2 (A = Y) | 5 | **7** | B | 4 | 7 | 5 | 7 |
| 2: populated with each app's own example data | 3 (A = X) | **8** | 6 | A | 6 | 7 | 9 | 6 |
| 2: populated with each app's own example data | 4 (A = Y) | **8** | 6 | A | 6 | 7 | 8 | 6 |

**Reading:** agreement within each round is unanimous and survives the label swap, so position bias doesn't explain it.
- **B wins the first impression.** It opens with sample plants; A opens on an empty state, with its examples behind a button.
- **A wins the working app:** urgency groups (Late / Today / Next 3 days), a detail panel with "still damp, check tomorrow", clearer mobile, and no contrast failures.
- **B is more distinctive in every round** (serif type, pot illustrations). A was called "plain", "generic blue utility buttons", and a "Google-Sans-style template".
- **B's rough edges:** the "Water today" list duplicated inside "All plants", calendar chips truncated to "Mon…", and a stray Undo toast.

## What changed in the skill because of this
1. **Apps open in a working state:** seeded, labelled example data by default. The empty state is a designed state, not the first impression (SKILL.md § 5, contexts.md).
2. **Distinctive even when utilitarian:** at least one subject-derived visual device on the main screen (contexts.md). A new `default-blue` palette rule flags framework blues (Tailwind, Bootstrap, Material, iOS, Chakra, Mantine, Ant, Vercel). A's `#2B6CB0` is Chakra `blue.600`.
3. **Rotate the "house" font:** a favourite used everywhere becomes the next tell (fonts.md). Specimen at least 3 faces and never reuse the last project's.
4. **Leaner quick mode:** 2 references, no board, a second shoot round only for real defects.

## Limitations (read before quoting)
- **n = 1 run per skill, one prompt.** The outputs vary run to run. This is an indication, not a statistically meaningful result.
- **Judges are LLMs** from the same model family as the builders, seeing screenshots only (no interaction). Human judges would be better.
- **The home-team metrics** (`slop-lint`, `palette`, `shoot`) favour A, since A runs them on itself. They're listed only below and weren't used in the verdict: A lint 100 / palette clean / 4 type sizes. B lint 100 / palette: 2 muddy earth tones and a vibrating blue–amber pair / radius sprawl.
- The A/B used the skill **before** the fixes above. A re-run is the honest next step.

Files: `A/`, `B/` (the full workspaces, including A's `.design/` brief, recon and shots), `eval.mjs`, `eval.json`, `populated.mjs`, `blind.sh`, `shots/`.
