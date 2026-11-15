# Cook ledger: Trump Claims Map — site design

Started: 2026-11-14 19:30, America/Chicago
Time: floor none | cap 3h
Bar (1-10, critic median): layout 9 | type and components 9 | colour 9 | clarity 9 | map 9 | polish 9 | not machine-generated 9
Calibration offset: none yet
Usage: not readable; small batches
Gate: stills approved no | final publish not started
Best so far: round 00 (baseline), `cook/stills/r00/`

## Decisions

Made without asking, one line each.
- 19:30 No reference images supplied; proceeding with "no references" as the intake default allowed.
- 19:30 Hard cap 3h rather than the skill's 8h floor: this is a site polish, not a 3D or film build.
- 19:30 "Showing the matrix of connections" read as: the network map must make who-connects-to-whom clear; in addition, add a compact connection-matrix view (names by topic or name by name) if it helps, as a second view on the map page.
- 19:30 The user's earlier dislike of an "intelligence-esque" dark dashboard and their new wish for "a mix of intelligence and investigative analysis" are reconciled as: light, precise, evidence-led and calm, with analyst-grade tools, not a dark control room.

## User feedback inbox

Exact words. Close an item only when a still proves it.
- 19:25 "I want something that looks clean, sleek, intuitive like a mix of intelligence and investigative analysis" | round 1 | open
- 19:25 "The design should not look like AI slop with the generative AI design" | round 1 | open
- 19:25 "Make sure the map is clean and easy to use, showing the matrix of connections" | round 1 | open
- 19:50 "Spawn some sub agents to look at similar tools for inspirations" | round 2 onward | open: three research agents writing `cook/refs/inspiration-*.md`
- 19:50 "Try about 2-3 iterative before coming back to me for checkup" | gate | open: send stills after round 3 (or round 2 if the bar is met), not after every round

---

## Round 00 (baseline, no changes)

Time: 19:30 to 19:40 | total elapsed 0.2h
Usage: not readable
Focus: score the current site before changing it.

Stills: `cook/stills/r00/` | Side by side: none (no references)

Scores, eyeballed: critic median (2 critics: one same model, one Opus), raw, no calibration

| Shot | Layout | Type | Colour | Clarity | Polish | Not generated | Map |
|---|---|---|---|---|---|---|---|
| S01 home | 6.75 | 6.75 | 6.75 | 6.75 | 6.5 | 5.75 | |
| S02 home list | 6.5 | 6.5 | 6.25 | 7 | 6 | 5.5 | |
| S03 check | 7.25 | 7 | 7.25 | 7.75 | 6.75 | 6.5 | |
| S04 profile | 6.5 | 7 | 6.75 | 7 | 6.25 | 6 | |
| S05 map light | 6 | 6.25 | 5.75 | 4.25 | 5.75 | 5.75 | 3.75 |
| S06 map selected | 6.25 | 5.75 | 6.5 | 5.5 | 5.25 | 6 | 5 |
| S07 map dark | 6 | 6.25 | 6.25 | 4 | 6 | 5.75 | 3.5 |
| S08 home phone | 6.75 | 7 | 6.75 | 6.75 | 6.25 | 6 | |
| S09 map phone | 4.75 | 5.5 | 5.75 | 3.5 | 4.75 | 5.25 | 3 |
| S10 check phone | 7.25 | 7 | 7.25 | 7.75 | 6.75 | 6.5 | |

Own score (logged, never decides): map 5, reading pages 7.

Measured: `node cook/harness/shots.js 00` — 10 stills, no console errors, no horizontal overflow.

Top gaps from critics (both agree):
1. Map default state is a hairball: every link drawn, labels piled in the centre, decorative ring, tall filter form with instructions; phone map unusable.
2. Typographic tells: slashed-zero digits, ISO dates in prose, every name an underlined blue link, truncated titles.
3. Home hero: statistics as a paragraph, redundant pill buttons, cropped hairball thumbnail; inconsistent callout styles.
Critics also asked for sentence-case headings; not adopted, because the user explicitly chose Title Case with "&".

Stop check: bar no | cap not reached | stills approved no -> next round
Next focus: round 1 — rebuild the map's default, selected, dark and phone states; add the connection matrix view; fix digits, dates and link noise site-wide.
