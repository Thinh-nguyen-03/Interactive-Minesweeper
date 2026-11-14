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
