# Design brief: Rail
Updated: 2026-09-29
lint-allow:

> Test run in **quick mode**. Intake answers were inferred and stated, not asked:
> "Assuming: product app (the manager's scheduling screen), no brand yet (light identity), 'ticket rail' direction, competitors 7shifts and Homebase, craft ref Linear, adjacent-world ref DayMark. Say if any is wrong."

## Product
What it does: builds and posts the weekly staff schedule for one independent restaurant, and handles swap and time-off requests.
Who: the GM or kitchen manager, on a laptop in the back office, 2–3 times a week (build Mon, adjust daily). Staff read it on their phones.
Primary job of the key screen: see the whole week by person, fix gaps (open shifts), keep labour % in line with forecast sales, then post it.
Context: product
Brand assets: none, so this brief creates a light identity.
Voice: IS plain, kitchen-literate, brief. IS NOT cheerful, corporate, or "empowering".

## Direction: "Ticket rail"
A restaurant's schedule competes with the ticket rail on the pass for attention. Each shift is a **ticket**: square-cut thermal paper, condensed print, clipped under a steel rail per day. Day headers carry the **day-dot colours** kitchens already use on food-rotation labels (Mon blue, Tue yellow, Wed red, Thu brown, Fri green, Sat orange, Sun black), so this is information cooks recognise. **Heat-lamp amber** marks anything "waiting on the pass": open shifts and pending requests.

## References (measured, see recon/*/digest.md)
| site | why | steal (measured) | avoid |
|---|---|---|---|
| 7shifts.com | direct competitor | plain voice: "Built around how restaurant teams actually work"; 4px base grid | blue `#4570ff` pill buttons, rounded 12/20px cards (category default) |
| joinhomebase.com | direct competitor | condensed display type suits the trade; schedule grid as the product hero | purple `#7e3dd4`, pastel shift blocks, 88px uppercase shouting |
| linear.app | craft: density and motion | 1px low-alpha borders instead of shadows; 13px/510 controls; transitions 100–160ms `cubic-bezier(.25,.46,.45,.94)`; reduced-motion rules | dark theme, and Inter (a default) |
| daymarksafety.com | adjacent world: kitchen labels | hard offset shadow with no blur (`0 3px 0 #ab1e26`) reads as printed or stamped; day-dot colour system | Open Sans; 4px red borders everywhere |

Both competitors own blue or purple with rounded pastel blocks, so Rail goes steel, paper, and amber, with square tickets.

## Tokens
- Colour: `--steel #E6E8EA` (app ground, the rail/counter) · `--paper #FFFFFF` (tickets, panels) · `--ink #1A1D20` (text, primary button) · `--ink-2 #5B636B` (secondary text) · `--rule #C9CED3` (1px lines) · `--amber #F0A12E` / `--amber-ink #7A4A00` (waiting on the pass) · `--red #C4382F` (conflict/overlap only)
- Day dots: Mon `#2F6FD0` · Tue `#F2C94C` · Wed `#D64541` · Thu `#8A5A3C` · Fri `#3E9B5A` · Sat `#EE8A2F` · Sun `#1A1D20`
- Type: Archivo (variable width + weight, self-hosted). Condensed (`wdth` 72) 600–700 for names on tickets, times, and day headers. Normal width 400/500 for UI. `tabular-nums` everywhere. Scale 11 / 12 / 13 / 14 / 16 / 20 / 28 (≈×1.2).
- Space: 4px base. Controls 30px high. Grid row min 52px.
- Radius ladder: ticket 1px (cut paper) → control 5px → sheet/drawer 8px. No pills.
- Elevation: tickets `0 1px 0 var(--rule), 0 2px 0 rgb(0 0 0 / .06)` (a hard paper edge, from DayMark). Structure by 1px rules (from Linear). One soft shadow, only for the floating editor.
- Motion: 100ms colour, 160ms small UI, 240ms drawer; ease `cubic-bezier(.25,.46,.45,.94)`. Reduced motion means instant.

## Layout
```
┌ RAIL  Nonna's Kitchen ▾ │ ‹ Week of 5–11 Oct › │ Draft · 3 open │ [Copy last week] [Post schedule] ┐
│ All · Kitchen · Floor · Bar                    Labour $9,862 = 27.4% of $36,000 forecast            │
├──────────────┬─●Mon 5──┬─●Tue 6──┬ … ─┬─●Sun 11─┬──────┬ Requests 3 ─────────────────┤
│ forecast     │ $4.1k   │ $4.6k   │    │ $6.2k   │      │ Swap  Dani → Marco, Fri PM  │
│ labour %     │ 24%     │ 31% ▲   │    │ 22%     │ hrs  │ [Approve] [Decline]         │
│ KITCHEN      │═════════│═════════│ rail          │      │ Off   Sofia, Sat 10 Oct     │
│ Maria  Line  │[10–6 LN]│         │    │[3–11]   │ 32   │ …                           │
│ OPEN SHIFTS  │[amber]  │         │    │         │      │                             │
└──────────────┴─────────┴─────────┴────┴─────────┴──────┴─────────────────────────────┘
Mobile (staff): one day at a time, day-dot tabs, your shifts first.
```
Left-aligned, dense, and no cards. The grid is the page.

## One memorable thing
The **rail**: each day column is topped by a steel rail line, and shifts hang under it as square paper tickets with condensed print. Everything else stays quiet.

## Direction (slop pre-check)
- Palette: from the steel pass, thermal paper, and heat lamp, not "SaaS blue". ✔
- Type: Archivo width axis, chosen because condensed tickets fit 7 columns and it matches ticket-printer print. ✔
- No KPI cards: labour % sits in each day's header, next to forecast. ✔
- Copy: "Post schedule" (kitchens *post* the schedule), "Open shift", "86 this shift"? No, too cute. Use "Delete shift". ✔
