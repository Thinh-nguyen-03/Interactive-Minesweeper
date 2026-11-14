# Data contract

Source: `transcript.txt` (Coffeezilla video "Investigating The President", auto-transcribed, so names are often misspelled).
Claim list: `data/claims-index.json` (ids C01–C30, with transcript line ranges).

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
