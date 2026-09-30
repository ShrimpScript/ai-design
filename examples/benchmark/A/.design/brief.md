# Design brief: Soak (houseplant watering tracker)
Updated: 2026-09-30
lint-allow:
Assuming (quick mode, no human): product app, no brand (light identity created here), "plant tag" direction, competitor Planta + adjacent The Sill / RHS. greg.app skipped (robots), kew.org skipped (bot challenge).

## Product
What it does: tells you which houseplants need water today, and lets you log a watering in one tap.
Who: one household, checks it most mornings, phone first, sometimes laptop.
Primary job of the key screen: see what's thirsty now, water it, done.
Context: product
Brand assets: none
Voice IS: plain, practical, a little dry / IS NOT: cute, preachy, gamified

## Direction
"Nursery plant tag": the white plastic stake tag stuck in every pot. Label-white stock, near-black print, 1px rules, and one colour taken from the water itself. Green appears only as a status word, never as the brand (every competitor measured is green-on-green).

## References
| site | why | steal (measured) | avoid |
| getplanta.com | direct competitor | 4px base spacing, 0.15s transitions, 8px radius on controls | all-green identity (#234823 on #e7edde), pill everything, 96px marketing type |
| thesill.com | adjacent (plant retail) | 1px low-alpha ink borders (#282f2f26) for structure instead of shadows | 12-step type scale, DM Serif display, popups |
| rhs.org.uk | adjacent (horticulture authority) | ink #3b3630-style warm near-black text, bottom-rule buttons, compact 16px body | 11 sizes, magenta CTA |

## Tokens
Colour: paper #F6F7F4 (bg), tag #FFFFFF (surface), ink #1B1F1D, ink-2 #58605C, rule #DCDFDA, water #2B6CB0 (accent, primary action + gauge), water-tint #E4EEF7, late #7A2314 (status only, darkened so it does not vibrate against water blue), fine #2F6B3A (status text only). Dark theme: soil-dark #121614 bg, #1A1F1C surface, water #6FA8DE.
Type: Google Sans Flex (round, ROND axis at display sizes, opsz), tabular-nums for days. Scale 1.2: 12/14/16/19/23/28/40.
Spacing base 4. Radius ladder 4 control / 8 row group / 14 sheet. Elevation: borders; shadow only on dialog.
Motion: 100/160/240/400ms, gauge refill 400ms is the one moment; reduced-motion = instant.

## Layout
```
Soak                                   [+ Add plant]
3 plants need water today. Fern is 2 days late.
[ Th Fr Sa Su Mo Tu We ... 14-day strip, drop count per day ]
[All] [Living room] [Bathroom] [Bedroom]
Late ─────────────────────────────  | Detail (desktop)
 ▮ Boston fern · Bathroom  2 days late [Water] | name, every N days
Today ────────────────────────────  | history w/ gaps
 ▯ Monstera · Living room   today   [Water] | notes, actions
Next few days / Later ...            |
```
Mobile: single column, detail opens as bottom sheet.

## One memorable thing
Each plant row carries a plant-tag gauge: a vertical water column that drains as days pass since the last watering, and refills with a 400ms rise when you tap Water.
