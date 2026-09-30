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

## Rerun (A2) after adding the craft layer
The same prompt was sent to a fresh agent with the updated skill (`A2/`, commit `57bbe1f` plus the craft layer). **B was not re-run.** Its output is the same file, so run-to-run variance on B's side isn't captured.
| | A2: design-recon + craft | B: frontend-design |
|---|---|---|
| Wall time | 605.8 s | 139.8 s |
| Tokens | 123,427 | 59,054 |
| axe serious / moderate | **0 / 0** | 8 / 1 |
| Add → persists, console errors, mobile overflow | ✔ ✔, 0, 0 px | ✔ ✔, 0, 0 px |

**Blind judges** (4 fresh judges on the first screen, which both apps now open populated; X/Y counterbalanced 2 and 2):
| Judge | A2 overall | B overall | A2 distinct. | B distinct. | A2 mobile | B mobile | Ships |
|---|---|---|---|---|---|---|---|
| 1 (A2 = X) | **8** | 6 | 9 | 5 | 7 | 6 | A2 |
| 2 (A2 = Y) | **8** | 6 | 9 | 5 | 7 | 6 | A2 |
| 3 (A2 = X) | **8** | 6 | 9 | 5 | 7 | 6 | A2 |
| 4 (A2 = Y) | **8** | 6 | 9 | 5 | 7 | 6 | A2 |

- **What changed the verdict:**
  - Corben display type paired with Golos Text.
  - A parametric SVG windowsill of 8 distinct plant silhouettes, drawn in glaze colours taken from a measured pottery site.
  - Each pot has a moisture stake, and its leaves droop as the soil dries.
  - The same drawings reappear in the rows and the calendar.
- **Weaknesses all 4 judges named:**
  - On phones the sill crops and pushes the list below the fold. `shoot.mjs` now flags this as `TASK BELOW FOLD`.
  - The moisture bars are unlabelled.
  - The heavy display face on every heading is loud.
  All three are now guardrails in `craft.md`.
- A first attempt at judges 3–4 accidentally reused stale screenshots from the old round. It was discarded and re-run with the correct images.

## Round 2: a different prompt (landing page), both skills run fresh and in parallel
**Prompt:** "Build a landing page for a neighbourhood bakery that takes pre-orders for weekend bread." It uses the same template as round 1. `C/` = design-recon (craft layer included), `D/` = frontend-design. Both were launched at the same moment.
| | C: design-recon | D: frontend-design |
|---|---|---|
| Wall time | 392.1 s | 148.5 s |
| Tokens | 107,059 | 60,198 |
| Tool calls | 19 | 5 |
| axe serious | **1** (contrast) | 3 (contrast) |
| Pre-order form submits and confirms | ✔ | ✔ |
| Console errors / mobile overflow | 0 / 0 px | 0 / 0 px |

**Blind judges** (4, counterbalanced; `eval2.json`, `shots/C-*`, `shots/D-*`):
| Judge | C overall | D overall | C distinct. | D distinct. | C clarity | D clarity | C mobile | D mobile | Ships |
|---|---|---|---|---|---|---|---|---|---|
| 1 (C = X) | **8** | 7 | 8 | 7 | 9 | 8 | 8 | 7 | C |
| 2 (C = Y) | **8** | 7 | 8 | 6 | 8 | 8 | 7 | 6 | C |
| 3 (C = X) | **8** | 7 | 8 | 6 | 9 | 8 | 7 | 6 | C |
| 4 (C = Y) | **8** | 7 | 8 | 7 | 9 | 8 | 8 | 7 | C |

- **Why C won:** its hero is live data. "38 loaves left for Saturday." sits above a bake board of drawn loaves, each with a count and an Add button, so scarcity and the action are visible without scrolling. A real bake timeline explains the Thursday cutoff.
- **D's strengths:** a warm serif and a confident blue order band.
- **D's weaknesses:** a stock hero (headline plus one clip-art loaf), a numbered 3-step section and an FAQ read as a template, and on phones the loaf pushes the offer down.
- **The margin is narrower than round 1 (8 vs 7).**
- **C's weaknesses:**
  - The palette is cool and clinical for a bakery (2 judges).
  - Display and sans section headings are mixed (2).
  - On mobile the bag comes after the whole list (2).
  - The hero's loaves repeat the list below.
  All four became guardrails in `craft.md`.

## Limitations (read before quoting)
- **n = 1 run per skill per prompt (2 prompts).** The outputs vary run to run. This is an indication, not a statistically meaningful result.
- **Judges are LLMs** from the same model family as the builders, seeing screenshots only (no interaction). Human judges would be better.
- **The home-team metrics** (`slop-lint`, `palette`, `shoot`) favour A, since A runs them on itself. They're listed only below and weren't used in the verdict: A lint 100 / palette clean / 4 type sizes. B lint 100 / palette: 2 muddy earth tones and a vibrating blue–amber pair / radius sprawl.
- The original A/B used the skill **before** the fixes above. The A2 rerun used them, but B was not re-run.

Files: `A/`, `B/` (the full workspaces, including A's `.design/` brief, recon and shots), `eval.mjs`, `eval.json`, `populated.mjs`, `blind.sh`, `shots/`.
