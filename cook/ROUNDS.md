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
- 19:55 Network access opened by the user; captured ten real reference screens (ProPublica, Full Fact, OpenSanctions, Kumu, Cambridge Intelligence, Bostock matrix). From round 1 scoring onward, critics get side-by-side images: reference left, our render right, per the pairing in cook/refs/REFERENCES.md.
- 19:55 The references use sentence case and a kicker line; the user's Title Case with "&" stays, and no eyebrow/kicker labels are added (brief ban list).

## User feedback inbox

Exact words. Close an item only when a still proves it.
- 19:25 "I want something that looks clean, sleek, intuitive like a mix of intelligence and investigative analysis" | round 1 | open
- 19:25 "The design should not look like AI slop with the generative AI design" | round 1 | open
- 19:25 "Make sure the map is clean and easy to use, showing the matrix of connections" | round 1 | open
- 19:50 "Spawn some sub agents to look at similar tools for inspirations" | round 2 onward | open: three research agents writing `cook/refs/inspiration-*.md`
- 19:50 "Try about 2-3 iterative before coming back to me for checkup" | gate | open: send stills after round 3 (or round 2 if the bar is met), not after every round
- 20:20 "don't like the design of the circle network, it's missing something" (on round 1 stills) | round 2 | open: recompose around Trump with orbits by closeness, curved weighted links, depth
- 20:20 "the matrix is just straight up bad, it looks cheaply built" (on round 1 stills) | round 2 | open: rebuild as a crafted figure (scale, group headers, counts in cells, marginal bars, real header)

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

## Round 01

Time: 19:45 to 20:05 | total elapsed 0.6h
Usage: not readable
Focus: the map (lowest baseline scores), plus site-wide typographic tells.

Changes:
- Map: layout recomputed so names cluster by topic; top ~50 names larger and labelled with collision avoidance; only key links at rest (Donald Trump's links not drawn at rest); Detail control (Key Names / More / Everything); topic arcs tinted with names on the arc; selection re-laid out radially by relationship type; side card with grouped connections; slim legend, Filters popover; own dark palette; phone ellipse, chips and bottom sheets.
- Matrix view added (direct links, top names, Trump pinned as a strip, six group bands, three-step ramp, hollow unverified cells, cross-hair hover, cell panel, "Show on Network", "Names by Topic").
- Home teaser redrawn as a 15-name mini-network.
- Type: Public Sans for text and UI, Source Serif 4 for headlines; no monospace. Dates formatted "1 Feb 2026". Names in lists are ink-coloured with hover underline; no ellipsis truncation; one callout style.

Stills: `cook/stills/r01/` (12) | Side by side: `cook/compare/r01/` (8, reference left)

Scores, eyeballed: critic median, raw (2 critics: same model and Opus; side-by-sides with references R01-R09)

| Shot | Layout | Type | Colour | Clarity | Polish | Not generated | Map | vs r00 |
|---|---|---|---|---|---|---|---|---|
| S01 home | 7.25 | 7.75 | 7.5 | 7.5 | 7.25 | 6.75 | | up ~0.7 |
| S02 home list | 7.25 | 8 | 7.25 | 8.25 | 7.5 | 7.5 | | up ~1.3 |
| S03 check | 7.75 | 8 | 7.75 | 8.25 | 7.5 | 7.5 | | up ~0.6 |
| S04 profile | 7 | 7.75 | 7.25 | 7.5 | 7 | 7 | | up ~0.7 |
| S05 map light | 6.5 | 6.5 | 7 | 5.75 | 6.5 | 7.25 | 5.5 | up ~1.3 (map +1.75) |
| S06 map selected | 7.25 | 7 | 7.5 | 7.25 | 7 | 8 | 7.25 | up ~1.5 (map +2.25) |
| S07 map dark | 6.5 | 6.5 | 7 | 5.75 | 6.5 | 7.25 | 5.5 | up ~1.1 (map +2) |
| S08 home phone | 7 | 7.5 | 7.75 | 7.25 | 7 | 7 | | up ~0.7 |
| S09 map phone | 6.75 | 7 | 7.25 | 6.25 | 6.75 | 7.25 | 6 | up ~2 (map +3) |
| S10 check phone | 7.75 | 8 | 7.75 | 8.25 | 7.5 | 7.5 | | up ~0.6 |
| S11 matrix | 6.5 | 6.5 | 6.75 | 6.5 | 6.75 | 7.75 | 6.25 | new |
| S12 map topic | 6.5 | 6.75 | 6.75 | 5.75 | 6.25 | 7.25 | 5.5 | new |

Own score (logged, never decides): map default 7, selected 7.5, matrix 6.5, reading pages 7.5.

Measured: `node cook/harness/shots.js 01` — 12 stills, no console errors, no horizontal overflow.

Not checked this round: fonts in the published frame; pinch-zoom on a real phone.

Top gaps from critics (both agree):
1. Map default: labels still collide in the core and sit on lines; all links one weight; core fills only half the canvas; the outer dot clouds read as confetti and the arc beads are unexplained; rotated topic labels; dark-theme links nearly invisible; toolbar "Detail" label unclear and the black hint looks like a stuck tooltip.
2. Topic-selected state: hundreds of lines fan into a haze; the topic's own names are a heap; non-members not dimmed enough; map not re-fitted when the panel opens.
3. Matrix: cells too small with unused width; three blues too close; unverified outline invisible; no column group headers; Trump strip not clearly separate; "Names by Name" wording.
4. Reading pages: statistics buried in a paragraph on home; no figure rows on home and profile; verdict not a proper block; no date or provenance under titles; profile star diagram says little; repeated grey disclaimer; three pill buttons and a boxed teaser card look templated; phone header crowded.

Decisions:
- 20:05 Critics want the outer name clouds removed. The user said the full set of nodes is what makes the map interesting, so they stay, but quieter and explained (a count per topic, clearer grouping), with the full web at "Everything". This is the one point to raise with the user at the checkpoint.
- 20:05 Round 2 runs two builders in parallel with separate ownership (map and matrix / reading pages and header) to stay inside the 3h cap.

Stop check: bar no | cap not reached (0.6h of 3h) | stills approved no -> next round
Next focus: round 2 — map and matrix legibility; editorial structure of home, check and profile pages; phone header.
