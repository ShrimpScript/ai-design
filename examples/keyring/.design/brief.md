# Design brief: keyring
Updated: 2026-09-30
lint-allow:

> **Quick mode.** Request: "a website for a company that lets you use your AI subscription models in the cloud". Stated assumptions: marketing site plus an interactive product demo, for developers who already pay for Claude, ChatGPT and/or Gemini plans. No brand exists, so a brand system is created (`.design/brand.json` → `brand/board.jpg`). House type preference applies: round, open, regular width.

## Product
What it does: you sign in to your own AI subscriptions inside a Keyring cloud workspace (the providers' official CLIs: Claude Code, Codex CLI, Gemini CLI). Agents keep working when your laptop is closed, and you steer from a phone or browser. You pay Keyring for machine time only; the model usage comes from the plans you already have.
Who: individual developers and small teams on Pro/Max/Plus plans who want long agent runs without keeping a laptop awake.
Primary job: make "bring your own subscription" instantly clear, make the cost obvious (machine hours, not tokens), and make access feel safe (your login, never shared).
Context: brand/marketing (with product demo)
Voice: IS plain about money, reassuring about access, specific. IS NOT hype, techno-mystic, cute.

## Metaphor → brand
You already own the keys; Keyring holds them and opens the doors while you're away. Mark: a ring with a key fob (chosen from 4 candidates at 16–96px; rejected: magnifier look-alike, cloud + keyhole cliché, chain link). Graphic devices: the fob shape (a rounded square with a hole) used for tags, chips and plan cards, plus the **3D keyring** hero object.

## References (see recon/*/digest.md)
| site | why | measured | take / avoid |
|---|---|---|---|
| ona.com | competitor (cloud agents) | `#f9f9f9` + near-black, ABC Diatype, full-width video hero | avoid the grey-monochrome category look |
| factory.ai | competitor | `#f5f5f5`, Geist (default tier), CAPS headline, 3 CTAs | avoid caps shouting and Geist |
| orbitkey.com | adjacent world (key organisers) | product photography of keys; Suisse Intl | take the physical-object-as-hero idea |

Category = cold grey + black + a default grotesk. Keyring = **warm paper, ink green, brass**, round type, and a physical object.

## Tokens
Colours from `brand.json` (palette audit: clean): paper `#F5F6F3`, card `#FFFFFF`, sage `#E4ECE6`, ink `#16211C`, ink-2 `#4B5A52`, line `#D8DFDA`, accent (brass) `#D4A72C`, accent-ink `#7A5C0E`.
Type: **Google Sans Flex**. Display `wght 600, ROND 100, opsz auto`, text `wght 420, ROND 30`, tracking ≥ −0.02em. **Google Sans Code** for commands and costs. Scale 14/16/18/22/32/48/72.
Radius ladder: 6 (chips) → 12 (controls, fob) → 22 (panels). Motion: 160/240ms `cubic-bezier(.2,0,0,1)`. One ambient motion (the keyring's sway), everything else responds to input.

## Layout
Hero: headline + sub + actions on the left, 3D keyring on the right (with an SVG fallback). Then the dark "workspaces" demo (toggle laptop open/closed and the sessions keep running) → 3 real steps → cost calculator (hours slider → $/month, numerals as graphics) → security → pricing (fob-shaped cards) → FAQ.

## One memorable thing
The **3D keyring**: brushed-steel ring, brass key, and three fobs engraved Claude / ChatGPT / Gemini, gently swaying and tilting toward the pointer.

## Slop pre-check
No sparkle, brain, glow, or purple. Vendor names appear as plain text only: no logos or vendor colours; the fobs use brand neutrals. No invented social proof. Cost example labelled as an example. Type is round and never condensed or thin.
