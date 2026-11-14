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
- Website builder agent was still running at 18:45. When `map/` is final: `python3 build.py`, review the page in headless Chromium (desktop and phone width, light and dark), publish `map/index.html` as an Artifact with `files` for `style.css`, `app.js`, `graph-data.js`, and send the user the link. Rebuild and republish to the same link after each research batch.
- Then: rewrite `README.md` for the project, attempt repo rename and description (no GitHub tool for repo settings was available; if still blocked, give the user a suggested name and description).
- Network: news and government hosts are blocked for direct fetch; two requests to widen the environment were rejected by the service. If the user has widened Network access in settings, tell agents to read primary documents in full.
