# Data contract

Source: `transcript.txt` (Coffeezilla video "Investigating The President", auto-transcribed, so names are often misspelled).
Claim list: `data/claims-index.json`. C01–C30 come from the video (`origin: "video"`, with transcript line ranges). C31+ are follow-up leads the video did not cover (`origin: "follow-up"`, `parents`: related video claims); for those the `claim` text is a research brief, and the verdict rates whether the lead is substantiated by the record.

## Research output (one pair of files per claim)

- `research/<ID>-<slug>.md` — human-readable report: verdict, what the video says, what the evidence shows per sub-claim, corrections, denials/other side, numbered source list with URLs and dates.
- `data/claims/<ID>.json`:

```json
{
  "id": "C05",
  "title": "Justin Sun, WLF and the SEC",
  "verdict": "confirmed | mostly-accurate | partly-accurate | misleading | unverified | false",
  "confidence": "high | medium | low",
  "summary": "2-4 sentences: what holds up and what does not.",
  "sub_claims": [
    {"statement": "...", "verdict": "confirmed", "finding": "what the evidence shows, with corrected figures/dates", "sources": ["https://..."]}
  ],
  "corrections": ["Transcript says X; the record says Y."],
  "denials_and_context": ["Who denies what; missing context that cuts either way."],
  "sources": [{"title": "...", "publisher": "...", "url": "https://...", "date": "YYYY-MM-DD"}],
  "entities": [
    {"id": "justin-sun", "name": "Justin Sun", "type": "person", "description": "one line"}
  ],
  "relationships": [
    {"source": "justin-sun", "target": "world-liberty-financial", "label": "invested $75M in", "type": "money", "date": "2024-11", "amount_usd": 75000000}
  ]
}
```

Also include a `"leads"` array in the claim JSON: related or adjacent stories you came across that the video did NOT cover (or only brushed) but that connect to the same people/orgs and deserve their own fact-check — e.g. another deal by the same investor, another dropped enforcement case tied to a donor, another family venture. Each: `{"title": "...", "why_connected": "...", "entities": ["ids"], "source_url": "https://..."}`. Only real, sourced leads; empty array if none.

Entity `type`: `person | company | government | fund | asset | country | law | media | event | product`.
Relationship `type`: `money | ownership | family | regulatory | advisory | political | legal | media | commercial`.

## Canonical entity ids (use these exactly; mint new kebab-case ids for anything else)

People: donald-trump, melania-trump, donald-trump-jr, eric-trump, barron-trump, jared-kushner, steve-witkoff, zach-witkoff, chase-herro, justin-sun, tahnoon-bin-zayed, changpeng-zhao, steve-bannon, molly-white, sam-kessler, isaac-saul, coffeezilla, karoline-leavitt, don-wilson, kevin-mcgurn, mike-selig, matt-prusak, sankaet-pathak
Companies/funds: world-liberty-financial, mgx, binance, alt5-sigma, affinity-partners, saudi-pif, trump-media-technology-group, truth-social, crypto-com, cumberland-drw, american-bitcoin, hut-8, metaplanet, tae-technologies, kalshi, polymarket, 1789-capital, vulcan-elements, new-america-acquisition-i, foundation-future-industries, trump-organization, trump-mobile, coinbase, kraken, gemini, openai, softbank, oracle, tron
Assets/products: trump-coin, melania-coin, wlfi-token, usd1, bitcoin, t1-phone, truth-predict, truth-plus, truth-social-etfs, stargate
Government: white-house, sec, cftc, occ, pentagon, state-department, us-congress
Countries: uae, qatar, saudi-arabia, china, iran
Laws/events: genius-act, clarity-act, strategic-bitcoin-reserve, cz-pardon, qatar-jet, uae-chips-deal
Media: wall-street-journal, new-york-times, propublica, wired, forbes, fox-news, tangle-news

## Instructions for follow-up research agents (C31+)

Your item's `claim` text in `data/claims-index.json` is a research brief, not a quote from the video. Read the parent claims' files in `data/claims/` (listed in `parents`) so you reuse their entity ids, build on what they established and don't repeat it. Research with web search and establish what is documented: who, what, when, how much, which officials/agencies are involved, what the other side says, and what remains allegation or insinuation. Today is Nov 2026; search rather than rely on memory. Many news sites are blocked for direct fetch here — rely on search results across several outlets when a fetch fails, and say so. Break the lead into concrete sub-claims with a verdict each; the overall verdict rates how well the lead as briefed is substantiated. Mark anything unconfirmed as unverified, attribute single-source material to its source, and never invent a URL. Write exactly two files, `research/<ID>-<slug>.md` and `data/claims/<ID>.json` (valid JSON per this contract, with entities, relationships including edges to the parents' people/orgs, and `leads`). Do not touch other files or run git. Final reply: verdict plus 3-5 lines of key findings.

## Instructions for audit agents (second-opinion pass)

You are an independent, sceptical second reviewer. For each claim id you are given: read `data/claims/<ID>.json` and `research/<ID>-*.md`, pick the 3-4 most consequential or most surprising factual assertions (dollar figures, dates, who-did-what, verdict-driving findings), and re-verify them from scratch with fresh web searches using different queries/outlets than the cited ones. Actively look for contradicting or more recent reporting (through Nov 2026), for errors that favour either side, and for places where the write-up states as fact something that is only alleged. Do not rubber-stamp. If you find an error or a material update, fix it in both files (sub_claims, corrections, summary, verdict/confidence if warranted, sources). In every case add to the JSON an `"audit"` object: `{"checked": ["assertion ..."], "result": "upheld | corrected | weakened | strengthened", "changes": ["what you changed and why"], "new_sources": [{"title","publisher","url","date"}]}`. Keep the JSON valid and all entity ids intact. Never invent a URL. Only edit the files for your assigned ids; do not run git. Final reply: per claim, one line with the result and any change.

## Instructions for connection-hunting agents (C61+)

Goal: surface non-obvious, under-reported or multi-layered connections between the people, companies, funds, intermediaries, officials and countries in this project and Donald Trump, his family and his administration — the links a reader of any single news story would miss. Method:
1. First mine what we already have: grep/read `data/claims/*.json` and `research/*.md` for your theme. Look for the same lawyer, lobbyist, banker, custodian, shell company, registered agent, address, board member, fund, or foreign intermediary recurring across claims that were researched separately; for chains (A owns B which paid C who lobbied D); and for dates that sit close together across different claims.
2. Then research outward with web search to confirm, extend and date each link, and to find further layers (ownership chains, prior employment, prior clients, family ties, co-investments, shared counsel, donations, appointments). Many news sites are blocked for direct fetch here; rely on search results across outlets and say so. Today is Nov 2026.
3. Rigor is the whole point. For every connection record: the two endpoints, the nature of the link, date(s), amount(s), source URL(s), and an evidence grade in the sub-claim finding: `documented` (filings/official records/multiple outlets), `single-source` (one outlet or anonymous sourcing), or `inferred` (our own observation from timing or co-occurrence — say explicitly that no source asserts it). Never present an inferred link as fact, never invent a URL, and record denials. A documented relationship is not proof of wrongdoing; say what it does and does not show. Discard anything you cannot source rather than padding.
4. In the report add a section "Not connected in the coverage we found" listing links that appear to be your own cross-referencing, each with its evidence grade.
Output: `research/<ID>-<slug>.md` and `data/claims/<ID>.json` per the contract (sub_claims = individual connections; rich `entities` and `relationships` using existing ids wherever the entity already exists in other claim files; `leads`). The overall verdict rates how well the connections found are substantiated. Do not touch other files or run git. Final reply: the 5 most significant connections found, each with its evidence grade.

## Reframing (user decision, 14 Nov): the site no longer mentions the video

The project is now presented as a tool for exploring the money, deals and connections around Donald Trump, his family and his administration. Nothing shown on the site may mention the video, Coffeezilla, a transcript, a narrator, "the video says", guests of the video, or "follow-up to the video". The research itself and its verdicts do not change; only how each item is worded.

New fields in `data/claims-index.json` (written by the editor agent, read by `build.py`):
- `display_title`: short standalone title (sentence case), no video reference.
- `question`: one or two sentences stating what was checked, as a standalone claim or question ("Did Trump's meme coin earn him about $600 million, and what happened to buyers?").
- `topic`: one of `crypto-ventures`, `gulf-money`, `regulators-and-enforcement`, `pardons-lobbyists-and-access`, `trump-media-and-markets`, `defence-minerals-and-contracts`, `family-ventures-and-wealth`, `foreign-deals`, `tech-and-media-companies`.
- `hidden`: true for items that are only about the video itself (not shown on the site).
- `origin` stays for internal use but is not shown as "from the video"; the site shows three kinds only where useful: "Check" (C01–C60) and "Connection check" (C61+).

Rules for rewriting text in `data/claims/<ID>.json` and `research/<ID>-*.md` (rewrite agents):
- Rewrite every reader-facing string so it stands alone: `title`, `summary`, each sub-claim `statement` and `finding`, `corrections`, `denials_and_context`, lead titles and `why_connected`, entity descriptions, relationship labels, and the whole markdown report. Replace "the video says X" with the claim itself ("Claim: X" or simply X as the statement being checked); "the video overstates" becomes "this is often overstated" or "the claim overstates"; "transcript says X; the record says Y" becomes "Claimed: X. The record shows: Y". Remove references to Coffeezilla, the narrator, the transcript, line numbers, clips, guests appearing in the video, garbled transcription, and "the video did not cover". Where a named journalist or researcher (Molly White, Sam Kessler, Isaac Saul) matters as a source of reporting, keep them as a journalist/researcher, not as a guest.
- Do not change any fact, figure, date, verdict, confidence, evidence grade, source, URL, entity id, relationship endpoints, or caveat. Do not add new claims. Keep every denial and every "unverified / single-source / inferred" marker. Sub-claims that are only about the video's production (a lawyer's threat to the creator, requests for comment the creator sent, who appeared in the video) get `"hidden": true` added rather than being deleted.
- Keep JSON valid. In the report, rename headings such as "What the video says" to "The claim". Keep the audit sections but reword any video references in them.
- Neutral tone throughout. Everyone named denies wrongdoing; nothing is an accusation of a crime.
- When finished, grep your files (case-insensitive) for: video, coffeezilla, transcript, narrator, youtube (as a reference to the source video; YouTube the company in the settlement story stays), "the clip", "host" — and fix every remaining reference.

## Balance-sheet research (C95 to C100, 16 Nov) and the ledger

These checks test the claim that Donald Trump takes no presidential salary against what he and his family have earned during the term. Network access is open: read original documents (OGE Form 278e filings, SEC filings on EDGAR via efts/full-text search or third-party mirrors if sec.gov blocks, court records, White House and agency releases, company statements) with WebFetch wherever possible, and say in `sources` which were read in full (`"read": "full"`) and which are search excerpts (`"read": "excerpt"`). Prefer primary documents; where a figure exists in an older check (C11, C29, C42 and others), re-verify it against the primary source and record any difference under `corrections`.

Besides the usual `data/claims/Cxx.json` and `research/Cxx-<slug>.md`, write `data/ledger/Cxx.json`: a list of rows, one per documented sum, each:

    {"id": "Cxx-01", "recipient": "<entity id>", "recipient_name": "...", "venture": "<entity id or short name>",
     "category": "salary | crypto | media | licensing | property | merchandise | fund-fees | settlement | other",
     "kind": "cash-received | reported-income | paper-value | salary-forgone | settlement-paid | estimate",
     "amount_low_usd": 0, "amount_high_usd": 0, "period": "2025-01 to 2026-06", "as_of": "YYYY-MM-DD",
     "basis": "one plain sentence on what the number is and who states it",
     "grade": "documented | single-source | inferred", "sources": ["url", "..."], "notes": "double-counting risks, disputes, denials"}

Rules: never add paper value to cash; never present income earned during the presidency as income earned because of it; record the response of those named; flag overlaps between rows (the same money reported two ways) in `notes`; ranges, not false precision. Neutral wording; no mention of any video or creator.
