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
