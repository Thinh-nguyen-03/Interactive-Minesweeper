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

## Round 02

Time: 20:05 to 20:45 | total elapsed 1.25h
Usage: not readable
Focus: user feedback first ("don't like the design of the circle network, it's missing something" / "the matrix is just straight up bad, it looks cheaply built"), then round 1 gaps on the reading pages.

Changes:
- Network recomposed: Donald Trump at the centre, three orbits by documented steps, topic arcs outside with horizontal captions, curved weighted links, 50 key names, reading panel (Most Connected Names, Topics), legend bar.
- Matrix rebuilt as a figure: title, legend, group headers, 20px cells with counts, row total bars, separate "Linked to Donald Trump" band, Order control.
- Reading pages: figure rows on home and profile, results strip, provenance line and claim + verdict unit on checks, ranked connections table on profiles, phone header simplified.

Stills: `cook/stills/r02/` (12) | Side by side: `cook/compare/r02/` (8)

Scores, eyeballed: critic median, raw (2 critics: same model and Opus)

| Shot | Layout | Type | Colour | Clarity | Polish | Not generated | Map | vs r01 |
|---|---|---|---|---|---|---|---|---|
| S01 home | 7 | 7 | 7 | 7 | 6 | 6.5 | | flat/down ~0.5 |
| S02 home list | 7.5 | 7 | 6.5 | 8 | 7 | 7 | | flat |
| S03 check | 7.5 | 7.5 | 7 | 7 | 7 | 7.5 | | down ~0.4 |
| S04 profile | 7.5 | 7 | 7 | 7.5 | 7 | 6.5 | | flat |
| S05 map light | 6 | 6 | 6 | 5 | 6 | 5.5 | 5 | down ~0.5 |
| S06 map selected | 7.5 | 7 | 7 | 8 | 7 | 7.5 | 8 | map up 0.75 |
| S07 map dark | 6 | 6 | 7 | 5 | 6 | 6 | 5 | down ~0.5 |
| S08 home phone | 6.5 | 7 | 7 | 6 | 4.5 | 6 | | down ~1 |
| S09 map phone | 5.5 | 6 | 6 | 4.5 | 5 | 5.5 | 4 | map down 2 |
| S10 check phone | 8 | 7.5 | 7 | 8 | 7 | 7.5 | | flat |
| S11 matrix | 6 | 5 | 5.5 | 6 | 5 | 5.5 | 6 | down ~0.5 |
| S12 map topic | 7 | 6.5 | 7 | 7 | 6 | 6.5 | 7 | map up 1.5 |

Different critics each round, so a half-point move is noise. Honest reading: selected and topic states improved; default network, phone map and matrix did not.

Measured: `node cook/harness/shots.js 02` — 12 stills, no console errors, no horizontal overflow.

Critics' verdict on the user's two complaints: network partly fixed, matrix not fixed.

Top gaps (both agree):
1. Network default: no visible reason for position (sectors unmarked, topic colours absent from canvas, outer dots read as texture); centre hairball with one edge weight; ~25 large unlabelled nodes; label collisions; ring captions on top of nodes; ellipse not circle; Trump node not dominant; 11-item legend.
2. Matrix: empty cells filled pale blue so everything looks linked; count chips look like badges; 45-degree headers pile up; uneven cell widths between groups; unexplained corner flags; dead space right of grid and under Strongest Pairs.
3. Phone: map labels in white boxes, clipped chips, three-line disclaimer; home teaser labels collide.
4. Reading: teaser label overlaps; six-stat row uneven; "At a Glance" wording contradicts itself; claim/verdict column imbalance; "Show on Map" placement; profile intro repeats the stats; ragged source links.

Stop check: bar no | cap not reached (1.25h of 3h) | stills approved no -> next round
Next focus: round 3 — network default and matrix (user's complaints), phone map, then the reading fixes. After round 3: checkpoint with the user, as they asked.

## Round 03

Time: 20:45 to 21:40, interrupted by the usage limit, resumed 00:22 to 00:55 (15 Nov) | working time about 2.8h of the 3h cap
Usage: 5-hour limit hit at about 21:40; resumed by the scheduled wake-up.
Focus: the user's two complaints (network, matrix), phone map, reading-page gaps from round 2.

Changes:
- Network: nine topic sectors with tint, dividers and a coloured outer arc with the topic name set along it; true circle; ring captions on one axis; Donald Trump node 44px and ringed; large marks only where a label fits; halo labels with collision pass; at rest only his spokes plus the 20 strongest links; legend cut to six items plus one stated finding (most-linked pair).
- Matrix: blank empty cells in a hairline grid, five-step ramp, one 24px cell pitch, vertical headers, 30 names, sticky headers, cross-hair hover, pair detail panel, "Most Linked in This View", Trump band, Topics columns as a heat table.
- Reading: teaser with 10 names and placed labels, five-stat row, results strip with ink labels, plain "At a Glance" counts, balanced claim and verdict, provenance line with "Show on Map", ranked "Who Is Involved" table on checks, profile header simplified, aligned dates, neutral dark palette, constant review date removed.

Stills: `cook/stills/r03/` (12 plus extras mx-*, X01-X12) | Side by side: `cook/compare/r03/` (8)

Scores, eyeballed: critic median, raw (2 critics: same model and Opus)

| Shot | Layout | Type | Colour | Clarity | Polish | Not generated | Map | vs r02 |
|---|---|---|---|---|---|---|---|---|
| S01 home | 8 | 8 | 7 | 8 | 7.5 | 6.5 | | up ~0.8 |
| S02 home list | 8 | 8 | 7 | 8 | 7.5 | 7 | | up ~0.4 |
| S03 check | 7.5 | 8 | 7.5 | 8 | 7.5 | 7.5 | | up ~0.4 |
| S04 profile | 7.5 | 7.5 | 6.5 | 7.5 | 6.5 | 6.5 | | flat |
| S05 map light | 7 | 6.5 | 7 | 5.5 | 5.5 | 6 | 5.5 | map up 0.5 |
| S06 map selected | 7.5 | 7 | 7 | 8 | 7 | 7.5 | 8 | flat |
| S07 map dark | 7 | 6.5 | 7 | 5.5 | 5.5 | 6 | 5.5 | map up 0.5 |
| S08 home phone | 7.5 | 8 | 7 | 7.5 | 6.5 | 6.5 | | up ~1 |
| S09 map phone | 6 | 6.5 | 7 | 5.5 | 6 | 6 | 5.5 | map up 1.5 |
| S10 check phone | 8 | 8 | 7.5 | 8 | 8 | 8 | | up ~0.4 |
| S11 matrix | 6.5 | 6.5 | 6 | 6.5 | 6 | 5.5 | 6 | up ~0.5 |
| S12 map topic | 7 | 6.5 | 7 | 6 | 6 | 6 | 5.5 | map down 1.5 |

Measured: `node cook/harness/shots.js 03` — 12 stills, no console errors, no horizontal overflow. `mapfunc.js` 24 of 25 (trace-a-path check clicks a fixed pixel that moved; trace works from a fresh click).

Critics on the user's complaints: network still "partly" earns "missing something" (structure is there; the lines at rest carry no reading order; dot rows read as texture; a few label collisions). Matrix: one critic says no longer cheap but not premium, the other says still cheap (outlined empty cells look like a form grid; ramp steps too close; rows clipped at the fold).

Top gaps:
1. Network at rest: heavy straight grey links through the hub; remaining label collisions and unlabelled marks; fine-dot rows as texture; topic-selected view converges into one rim point.
2. Matrix: empty-cell outlines, ramp contrast, header size, clipped last row, ragged totals column.
3. Profile: truncated source titles, no visual anchor. Check: verdict could be more prominent; meta line reads as a run-on. Phone map: dead bands, spokes only.

Decisions:
- 00:55 Three rounds done and the cap is nearly reached. Per the user's instruction ("2-3 iterative before coming back to me for checkup"), stop here and send the stills. Bar (9) not met; reported plainly.

Stop check: bar no | cap reached | stills approved no -> checkpoint with the user; live site not republished.

## User feedback after round 03 (exact words, 15 Nov)

"It still doesn't give you that vibe of an investigative analysis tool. The network still doesn't look like it's an interactive globe full of nodes conenecting to each other like how a brain scan or tools like obsidian would look. The matrix still look cheaply designed and you just edititing it instead of rethinking the layout. Try again"

Decisions:
- The cap is extended by the user's "Try again". Round 4 replaces the flat sector wheel with a rotating 3D globe of all names and links (every node visible, drag to rotate), and rebuilds the matrix from a blank page instead of editing it. The user's wish for a glowing brain-scan look overrides the default ban on glow for this view.
- The map workspace uses a dark analysis canvas in both themes.
- Further user words (15 Nov, during round 4): "The current network looks like a bunch of circles with line between, not a network with nodes, connections and links". Relayed to the globe builder: no rings, orbits or sector scaffolding; only nodes and the web of links, structure from the layout itself.
- Further user words (15 Nov): "I want that vibe but combine with the vibe of an investigative analysis and journalism tool". Relayed to both builders: graph as centrepiece, surrounded by a case-file dossier, evidence-graded links with citations, chain-of-evidence path tracing, leads as entry points, editorial typography.

## Round 04

Time: 15 Nov, about 01:00 to 01:45
Focus: user feedback after round 3 (network must be a globe of nodes and links like Obsidian or a brain scan, combined with an investigative journalism tool; matrix rethought, not edited).

Changes:
- Network: sector wheel replaced by a 3D globe of all 1,332 names, 94 checks, 2,402 links and 3,512 mentions on a dark canvas; hand-written seeded 3D force layout; no drawn scaffolding; drag, inertia, zoom, auto-rotation; hover and select light a neighbourhood; links solid (documented) or dashed (unverified), coloured by kind when lit; dossier panel with evidence lines, grades and citations; Trace a Path as numbered chain of evidence; "Where to Start" leads; Colour By Topic or Kind.
- Matrix: rebuilt from a blank page in `map/matrix.js` and `map/matrix.css` (must be added to the publish file list): names rail, canvas heatmap of 48 names in cluster order with marginal bars, case-file panel, Names or Topics, phone version.

Stills: `cook/stills/r04/` (S01-S12, G-*, mx-*)
Scores: critics not run yet; stills sent to the user first because they are steering directly.
Measured: `shots.js 04` 12 stills, no console errors, no overflow; `globefunc.js` 26 of 26; frame interval while rotating 16.7 ms median in headless software rendering (with adaptive fallback); layout about 0.4 to 0.5 s on first load. Not measured: real GPU, cached load.

Known weak points: bright crowded core at rest; weak lobes for smaller topics; light toolbar above dark workspace in light theme; matrix column labels dense at 1x; about 700 lines of dead wheel code still in app.js; "Single-Source" grade inferred from checks.

Stop check: bar not scored | stills approved no -> waiting on the user's read of the new direction; live site not republished.

## User feedback after round 04 (exact words, 15 Nov)

"Ok we going in the right direction, the network just look a little too busy and cramped, can we make it a bit more spacious. Another big problem is the fonts, the icons, the layout of the rest of the UI just look too ai-generated, can we make it better, improve it, aim for clean and professional look, fitting the new look of the network. Also, the network should be changed as well in light mode, not just keeping it the same and change the outside layout only. Make sure to also test the text colors on all modes, no dimmed and faded color on dark mode, no too bright color on beight mode, etc"

Decisions:
- Round 5: (a) globe more spacious, with a real light-mode rendering; (b) matrix light-mode rendering; (c) fonts, icons and layout of the whole UI redone to match the workspace; (d) an automated text-contrast audit in both themes, then fixes.
- Further user words (15 Nov, during round 5): "Use better font family to fit the vibe as well instead of these generic fonts". Relayed to the UI builder: choose typefaces with character (newsroom grotesque, condensed data face, editorial headline face), compare two or three pairings in stills before choosing.
- Further user words (15 Nov, during round 5, after seeing the r05 globe): "Can they be even more spacious and the lines connecting them be designed in a better way that it doesn't take away the focus of the nodes?" Relayed to the globe builder: more air, links as quiet curved or bundled texture that fades mid-length and stops at node edges, strongest cross-topic links only at rest, crisp on hover.

## Round 05

Time: 15 Nov, about 02:30 to 04:20
Focus: user feedback after round 4 and during this round (more spacious network; links that do not compete with nodes; real light mode; fonts, icons and layout that do not look generated; text colours tested in all modes).

Changes:
- Globe: retuned layout (lobes per topic, air between nodes), mention lines off at rest, 16 labels at rest, light-mode rendering, then a second pass: links thin, near-surface tone, curved and bundled between lobes, faded mid-length, stopped at node edges; strongest links only at rest; crisp coloured links on hover or selection; dead wheel code removed.
- Matrix: theme-aware (light ramp), 36 names at 14px pitch, clean labels, contrast fixes, phone ordering.
- UI system (`map/ui.css`, new; must be on the publish file list with `matrix.js` and `matrix.css`): Schibsted Grotesk, Bricolage Grotesque headlines, Barlow Condensed data; one 1.5px icon set and new logo; compact themed header; home with the whole graph as hero and three lead tables; check pages as case files; profiles and lists restyled; tokens for both themes.

Stills: `cook/stills/r05/` (S01-S12, G-light-*, G-dark-*, mx-*-light|dark, X01-X22, F-* font candidates)
Scores: critics not run; the user is steering round by round.
Measured: `shots.js 05` no console errors, no overflow; `contrast.js` 60 page states, 0 text elements under AA (DOM only; canvas labels computed from palette: names about 16:1, weakest topic caption 4.8:1); `globefunc.js` 26 of 26; ink coverage at rest 26.8% (r04) to 10.9% dark and 8.8% light; frame interval while turning 16.7 ms median in software rendering. Not measured: real GPU, pixel-sampled canvas contrast.

Known weak points: topic-selected view is a dense mesh; hovering a very large hub is busy; phone core tight; two topic captions adjacent; small condensed type in dense panel metadata; old rules left in style.css under ui.css.

Stop check: stills approved no -> stills sent; waiting on the user. Live site not republished.

## User feedback after round 05 (exact words, 15 Nov)

Quoting the four weak points (topic-selected mesh, busy hub hover, tight phone core, adjacent topic captions): "These are correct, keep going"

Decision: round 6 fixes those four in the globe.
