# inspect3d /tmp/claude-0/-home-user-ai-design/38b42669-3ed5-5d21-92b2-2aff67255a48/scratchpad/keyring-buggy.html
Parts: ring, fob-Claude, fob-ChatGPT, fob-Gemini, key

FAIL fob-Claude threads ring: hole centre 0.220 from wire (max 0.102), hole axis ∥ wire 0.20 (min 0.85) → the part is NOT on the wire (floating or in front of it)
FAIL fob-ChatGPT threads ring: hole centre 0.051 from wire (max 0.102), hole axis ∥ wire 0.00 (min 0.85) → the hole is turned sideways to the wire
FAIL fob-Gemini threads ring: hole centre 0.140 from wire (max 0.102), hole axis ∥ wire 0.23 (min 0.85) → the part is NOT on the wire (floating or in front of it)
FAIL key threads ring: hole centre 0.361 from wire (max 0.102), hole axis ∥ wire 0.18 (min 0.85) → the part is NOT on the wire (floating or in front of it)
FAIL ring clear of fob-Claude: 9.2% of ring's surface is inside fob-Claude (threaded parts must pass through the hole, not the body) → parts pass through each other
FAIL fob-Claude clear of ring: 2.8% of fob-Claude's surface is inside ring (threaded parts must pass through the hole, not the body) → parts pass through each other
FAIL ring clear of fob-ChatGPT: 19.8% of ring's surface is inside fob-ChatGPT (threaded parts must pass through the hole, not the body) → parts pass through each other
PASS fob-ChatGPT clear of ring: 0 of 157 nearby surface points inside
FAIL ring clear of fob-Gemini: 10.4% of ring's surface is inside fob-Gemini (threaded parts must pass through the hole, not the body) → parts pass through each other
FAIL fob-Gemini clear of ring: 5.7% of fob-Gemini's surface is inside ring (threaded parts must pass through the hole, not the body) → parts pass through each other
FAIL fob-Claude clear of fob-ChatGPT: 3.1% of fob-Claude's surface is inside fob-ChatGPT → parts pass through each other
FAIL fob-ChatGPT clear of fob-Claude: 8.9% of fob-ChatGPT's surface is inside fob-Claude → parts pass through each other
FAIL fob-Claude clear of key: 2.1% of fob-Claude's surface is inside key → parts pass through each other
FAIL key clear of fob-Claude: 8% of key's surface is inside fob-Claude → parts pass through each other
FAIL fob-ChatGPT clear of fob-Gemini: 6.3% of fob-ChatGPT's surface is inside fob-Gemini → parts pass through each other
PASS fob-Gemini clear of fob-ChatGPT: 0 of 16 nearby surface points inside
PASS fob-ChatGPT clear of key: 0 of 69 nearby surface points inside
FAIL key clear of fob-ChatGPT: 0.5% of key's surface is inside fob-ChatGPT → parts pass through each other

Views: .design/shots/3d/before/views.jpg — now cross-review (references/3d.md § Review protocol).