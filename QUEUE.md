# Work queue (state as of 2026-11-13 18:45 Central)

Resume point for the scheduled 23:12 Central run. Check what already exists before launching anything:
`ls data/claims/` against `data/claims-index.json`, and look for an `audit` object in each claim JSON.

Constraint learned the hard way: web search is capped at 200 calls per turn, shared by every agent in the turn. Twenty agents at once starve each other. Launch in batches of about 5-6 research agents (roughly 30-35 searches each) and start the next batch only in a later turn.

All research agents: model `opus`, effort `medium`, instructions are in `SCHEMA.md`.

## 1. Connection hunts not yet finished
- C61-C67 were launched at ~18:20; any whose `data/claims/<ID>.json` is missing or thin must be re-run.
- C68 (tech-billionaire nexus), C69 (master timeline proximity), C70 (foreign intermediaries) never launched. Run C69 last, after everything else is in, because it reads all claim files.

## 2. Second-opinion audit still owed (see "Instructions for audit agents" in SCHEMA.md)
- Never audited: C06 C07 C08 C09 C10 C12 C13 C20 C21 C22 C23 C24 C25 C26 C27 C28 C29 C32 C33 C34 C35 C36 C37 C38 C39 C53-C60 and the hunts C61+.
- Wording review only, no fresh searches: C45 C46 C47 C48 C49 C50 C51 C52.
- Known fix owed: C29 states Trump's 2025 World Liberty income as ~$800M; C42's audit found outlets reporting ~$594M (about $515-529M token sales + ~$65M equity sale). Apply the same contested $594M-$800M range to C29.
- Possible duplication error in C31: "~$21.9M again" from Dar Al Arkan in the 2025 filing equals the prior year's figure; re-verify.
- Give each audit agent 4-5 claims, not 13.

## 3. Deeper digging (user request: find what goes unnoticed, more layers, more connections)
- Mine every `leads` array in `data/claims/*.json` (200+ leads) plus the "Not connected in the coverage we found" sections of the hunt reports; pick the leads that add new people/organisations/countries or a new layer to an existing chain, add them to `data/claims-index.json` as C71+ (`origin: "follow-up"` or `"connection-hunt"`), and research them.
- Gaps flagged by researchers who ran out of searches: C32 (Cerebras/Anduril/xAI contracts after 1789 invested), C33 (Meta/Google/Disney regulatory outcomes), C34 (did Sacks sue the NYT; BitGo IPO), C35 (Cantor's Nvidia interests), C54 (Gould ethics agreement; named SEC staff moves), C56 (MNNA designation; F-35 review; Diriyah ownership), C58 (CFTC oil-trade probe updates; SEC reply), C59 (India per-project fees), C60 (family ties of Energy Fuels, Titan, Guardian, American Ocean Minerals).
- Evidence rules stay as they are: every link graded documented / single-source / inferred; denials recorded; no allegation stated as fact (especially C37 and C46).

## 4. Map and repo
- PUBLISHED 19:10 Central at https://claude.ai/artifact/Hodpp6u6fLoqSvbVs8Y9XP (67 of 70 items; C68-C70 pending). To update: `python3 build.py`, then republish `map/index.html` with the same three supporting files (same file path keeps the link).
- Website builder agent was still running at 18:45. When `map/` is final: `python3 build.py`, review the page in headless Chromium (desktop and phone width, light and dark), publish `map/index.html` as an Artifact with `files` for `style.css`, `app.js`, `graph-data.js`, and send the user the link. Rebuild and republish to the same link after each research batch.
- Then: rewrite `README.md` for the project, attempt repo rename and description (no GitHub tool for repo settings was available; if still blocked, give the user a suggested name and description).
- Network: news and government hosts are blocked for direct fetch; two requests to widen the environment were rejected by the service. If the user has widened Network access in settings, tell agents to read primary documents in full.

## 5. UI polish (user request, 19:20 Central)
The user wants the map UI to look clean and professional and less "AI-coded", with correct letter case everywhere.
- Text case: no all-caps and no all-lowercase UI text. Remove every `text-transform: uppercase` and letter-spaced caps label in `map/style.css` (brand title, section headers such as "FILTERS AND KEY", "CLAIM FILE", stat strip labels, key-fact row labels like VERDICT/ORIGIN/SOURCES, chips such as "CLAIM FROM THE VIDEO"). Use sentence case for labels, headings, buttons, tabs and tooltips ("Filters and key", "Claim file", "Video claims"); keep proper nouns and acronyms as they are written (SEC, CFTC, UAE, USD1, World Liberty Financial). Check strings generated in `map/app.js` and `build.py` too, including verdict labels, relationship-type labels, entity-type labels and theme names, and the Obsidian vault notes.
- Fix data-side casing: entity names and relationship labels coming from the claim files that are all lower-case or inconsistently cased should be normalised in `build.py` (labels start with a capital only where they stand alone as a row; names keep their real spelling).
- Less templated look: drop the monospace-everywhere treatment (keep tabular numerals for ids, dates, amounts only), reduce the number of chips/pills and bordered boxes, quieter stat strip, more whitespace in the dossier, plain readable type hierarchy, restrained colour. It should read like a finished professional product (a research or analyst tool), not a generated dashboard. Keep all functionality, theming rules, phone layout and the neutral tone.
- After the change: retest desktop and phone, light and dark, look at screenshots, then republish to the same link.
- Content presentation (user request, 19:25 Central): findings, descriptions and write-ups must not appear as undifferentiated blocks of text. In every dossier and in the Claims view:
  - Summary: a one-sentence bottom line first, then "What holds up" / "What needs correcting" / "What is unproven" as short bullet lists. Derive these from `sub_claims` verdicts, `corrections` and unverified items rather than dumping the `summary` paragraph.
  - Sub-claims: one row or card each with the statement, a verdict marker, the finding broken into short sentences, key figures (amounts, dates) pulled out and aligned, and its sources as numbered links.
  - Long findings and denials: split into bullets at sentence boundaries; highlight amounts, dates and names consistently; cap line length near 65 characters; clear spacing between items.
  - Corrections as "Video said → Record shows" pairs where the text allows it.
  - Sources: grouped by publisher with date, title as the link; show a count.
  - Connections: grouped by relationship type with headers, each row "label · counterpart · date · amount · claim ids".
  - Entity descriptions: one-line role first, then facts as label/value rows (type, country, role, appears in N claims), then grouped connections.
  - Full report: render the markdown properly (headings, lists, tables, links, block quotes) with a small table of contents for long reports.
  - Where the source data is one long paragraph, restructure it at build time in `build.py` (sentence splitting, figure extraction) so the page receives structured fields; do not change the meaning or drop caveats and denials.

## Status at 23:20 Central (resume run)
- Batch 1 launched 23:15: hunts C68, C70; audits C06-C10, C12/C13/C20-C22, C23-C26/C29, C27/C28/C32-C34; map redesign agent.
- Briefs C71-C82 (second-layer connection hunts) added to the index, not yet launched. Next batches of 6: [C71-C76], [C77-C82], then audits [C35-C39], [C45-C49 fresh searches], [C50-C52,C53,C54], [C55-C60], [C61-C67], then C69 (master timeline) last.

## Status at pause (user instruction, about 23:40 Central 13 Nov): no new agents; let running ones finish; restart 04:30 Central
- Done and pushed: all research C01-C82 except C69; second reviews for C01-C54; map redesign published (version 3) at the same link; README written.
- Running at pause (finish on their own): C69 master timeline; second reviews for C55-C60, C61-C64, C65-C67, C68/C70-C72, C73-C77, C78-C82.
- As each finishes: commit and push. When all are in: `python3 build.py`, republish `map/index.html` with `style.css`, `app.js`, `graph-data.js` to the same link, update README counts.
- For the 04:30 restart:
  1. Check every claim JSON has a full `audit` object (not "language review only"); re-run any reviewer that was cut short.
  2. Third layer: mine the `leads` arrays of C53-C82 and the "Not connected in the coverage we found" sections for new C83+ connection hunts (ideas noted so far: Heritage Advisors / Sheikh Sultan bin Jassim network; Schiller-Sorial ventures (Javelin, GreenMet); Yorkville SPACs incl. the Venezuela vehicle and Blue Water III; Paulson holdings with federal backing; Silver Lake as recurring co-investor; Damac's unannounced Abu Dhabi projects; Hungary and Serbia unannounced deals; WLF token-swap pitch and partner AB / Prince Group link; Korea Aluminium final ruling; Hayes/Wool option grant the day before the Trump sons' Dominari announcement; Valor Equity / DOGE alumni; Kremlev/IBA; Boehly-led Lukoil consortium; ballroom donor spreadsheet in full).
  3. Batches of at most 6-7 search agents at a time (opus, medium), each told to stay within ~30 searches.
  4. Map follow-ups from the redesign report: only a third of corrections parse into pairs; name highlighting too faint; verdict tallies hidden below 1480px; `window.__dbg` test hook still in app.js.
  5. Repo rename/description cannot be done with the available GitHub tools; suggested name `trump-claims-map` given to the user.
- Consistency fixes to apply at restart (no searches needed): (a) Attorney General — C49 and C61 audits confirm Todd Blanche was confirmed 50-49 in Aug 2026 (C61 says confirmed Aug 8, C49 says sworn in Aug 10) after Bondi's removal on Apr 2 2026; C65's audit says only "acting AG, current holder not established" — align C65 with C49/C61. (b) Cross-check each entity description for Bondi, Blanche, McGurn, Kollitides and Patel across all claim files against these audited facts.

## 6. Complete UI redesign (user request, about 00:55 Central 14 Nov) — do at the 04:30 restart, in parallel with the third research layer
The user finds the current map "too intelligence-esque" and wants something better: a design that fits the purpose of the tool and conveys the information to users in the best way. They asked for sub-agents to brainstorm designs first.
Purpose to design for: a member of the public (not an analyst) wants to know, for a 40-minute video making about 30 claims, what is true, what was corrected, what is unproven, who is involved, and how the people and organisations connect. The network graph is one way in, not necessarily the home screen.
Step 1 — brainstorm (3 agents in parallel, no web search needed, default model): each reads README.md, SCHEMA.md, `map/` and a sample of `data/claims/*.json`, then proposes ONE distinct direction and builds a small static prototype of its 3 key screens with real data (home/overview, one claim, one person or organisation) as a standalone HTML file under `design/concept-<name>/`, plus a one-page rationale (`design/concept-<name>/README.md`: who it is for, information hierarchy, navigation, how the graph is used, typography and colour, what it deliberately leaves out, risks). Give each a different starting point so they do not converge:
  - A. Reader-first / editorial explainer: starts from the claims as a readable, scannable fact-check (verdict list, story-like claim pages), with the network as a supporting figure per claim and per person.
  - B. Explorer / reference: starts from people and organisations ("who is connected to whom"), profile pages, relationship lists and small focused diagrams instead of one giant graph; strong search and browse.
  - C. Guided map: keeps a visual map as the centrepiece but makes it calm and legible — clustered by topic (crypto, Gulf money, regulators, media, defence), progressive disclosure, guided tours through the main storylines, light theme first.
  All three: plain, friendly, trustworthy; nothing that looks like surveillance or analyst software (no dark graphite dashboards, glyph legends, dossier/case-file language, dense filter rails); correct sentence case; structured findings, never walls of text; phone-first layout; accessible; neutral tone with the standing note that everyone named denies wrongdoing and unverified items (C37, C46) are clearly marked. Each takes screenshots (desktop and phone) and looks at them.
Step 2 — choose: compare the three against the purpose, pick the strongest or merge the best parts, and publish a short comparison page with the screenshots so the user can see the alternatives and redirect.
Step 3 — build the chosen design as the new site in `map/` (same publishing constraints as before: content-only index.html, d3 only from cdnjs if a graph is used, Google Fonts only, relative files, colour tokens with light and dark, plain #hash deep links, no downloads/alerts/print), reusing `build.py` data; test at 400px and 1280px in light and dark; republish to the same link; tell the user what changed and why.

### Update to section 6 (user decision, about 01:00 Central 14 Nov)
- At 04:30: run the research queue AND steps 1-2 of the redesign only. Do NOT do step 3 (do not rebuild or replace the live map). The user will choose the direction themselves; the redesign happens later.
- Publish the comparison page as a NEW, separate artifact (different file path, e.g. `design/comparison/index.html`; never the existing map link). It should show, for each of the three concepts: name, who it is for, how it organises the information, how the graph is used, strengths, weaknesses, and desktop and phone screenshots of its three screens (embed images as data URIs or publish them as supporting files), plus a short side-by-side summary and my recommendation, clearly labelled as a recommendation. If practical, also publish each working prototype so the user can click through it.
- Then give the user the comparison link and stop work on the redesign until they choose.

## Status at about 05:30 Central 14 Nov (restart run)
- Design: three concept prototypes built under `design/` (concept-reader, concept-explorer, concept-guided-map). Comparison page published as a separate artifact: https://claude.ai/artifact/TBTCffR5d8bMUGZ5DLAupF (source `design/comparison/index.html`; prototypes and screenshots published as supporting files). My recommendation on the page: A as the base, plus B's search and name profiles and C's guided tours. WAITING FOR THE USER TO CHOOSE — do not rebuild the live map until they do.
- Research: third-layer hunts C83-C91 and C94 done; C92 (ballroom donor list) and C93 (Kremlev/IBA) still running. Second reviews done for C83-C88; a reviewer for C89-C94 is running.
- Then: `python3 build.py`, republish the live map (`map/index.html` + three supporting files) to https://claude.ai/artifact/Hodpp6u6fLoqSvbVs8Y9XP, update README counts.
- Data gap all three designers hit: no explicit "what is unproven" field per claim; needed before any full redesign build.
