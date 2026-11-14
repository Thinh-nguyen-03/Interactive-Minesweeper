# Trump Claims Map

An independent fact-check of Coffeezilla's video "Investigating The President", extended with follow-up research, and presented as an interactive map of the people, companies, agencies and countries involved.

**Live map:** https://claude.ai/artifact/Hodpp6u6fLoqSvbVs8Y9XP (private until the owner shares it)

This is a verification project, not an accusation. Everyone named denies wrongdoing, and nothing here alleges a crime. A line between two names on the map means they appear in the same documented claim or relationship. It does not show that one caused the other.

## What is in it

| | Count |
|---|---|
| Claims taken from the video | 30 |
| Follow-up leads the video did not cover | 30 |
| Connection hunts (cross-referencing across claims) | 22 |
| Individual sub-claims checked | about 710 |
| Sources cited | about 2,700 |
| People, organisations and other names mapped | about 1,100 |

Verdicts across all 82 items: 2 confirmed, 72 mostly accurate, 6 partly accurate, 2 unverified. 81 of the 82 have had an independent second review.

"Mostly accurate" usually means the core facts hold and specific figures, dates or framings needed correcting. The corrections are listed in each report.

## How the research was done

1. The transcript was split into 30 claims (`data/claims-index.json`).
2. Each claim was researched by its own agent, which checked every figure, date and name against news reporting, filings and official releases, and recorded what the other side says.
3. Leads that surfaced along the way became follow-up items, each researched the same way.
4. Connection hunts then cross-referenced the finished files for recurring lawyers, lobbyists, financiers, shell entities, investors and foreign partners, and searched outward to confirm and date each link.
5. An independent second reviewer re-checked the most consequential assertions in each item with fresh searches and corrected the files where needed. Each claim file records the result in an `audit` field.

### Evidence grades

Every connection carries one of three grades:

- **Documented**: filings, official records or several outlets.
- **Single-source**: one outlet, or anonymous sourcing.
- **Inferred**: our own observation from timing or co-occurrence. No source asserts it.

An inferred link is never presented as fact. A documented relationship is not proof of wrongdoing.

### Limits

- Most news and government sites could not be opened directly from the research environment. Findings rest on search-result excerpts that agree across several outlets, not on reading the original articles, filings or court dockets in full. This is why most items are rated medium confidence.
- Two items (C37 and C46, about Jared Kushner) are single-source allegations from one book, denied by everyone named. They are marked unverified wherever they appear.
- The inference that a payment bought an official act is not established for any item. Where the video or a lead implies it, the sub-claim is marked unverified.
- Research ran in November 2026. Later developments are not reflected.

## Repository layout

| Path | Contents |
|---|---|
| `transcript.txt` | The video transcript the claims were taken from |
| `data/claims-index.json` | The list of all items, with origin and parent claims |
| `data/claims/Cxx.json` | Structured findings per item: verdict, sub-claims, corrections, denials, sources, entities, relationships, leads, audit |
| `research/Cxx-*.md` | The long-form report for each item |
| `data/base-graph.json` | Entities, relationships and themes as the video itself presents them |
| `build.py` | Merges everything into the map data and the Obsidian vault |
| `map/` | The interactive website |
| `vault/` | The same graph as an Obsidian vault, one note per claim, name and theme |
| `SCHEMA.md` | The data contract and the instructions the research agents followed |
| `QUEUE.md` | Working notes on what remains |

## Using it

**The website.** Open the live link, or serve the `map/` folder locally:

```
python3 build.py
cd map && python3 -m http.server 8000
```

Click a node to open its file. Double-click to isolate its network. "Trace path" finds the shortest connection between two names. The Claims view lists every item with its verdict, and Common denominators ranks the most-connected names and the recurring themes.

**Obsidian.** Open the `vault/` folder as a vault and use the graph view. Notes link to each other with wikilinks.

**Rebuilding.** After editing anything under `data/` or `research/`, run `python3 build.py`. It rewrites `map/graph-data.js` and regenerates `vault/`. It needs only the Python standard library.

## Corrections

If a finding is wrong or out of date, the fix belongs in the item's `data/claims/Cxx.json` and `research/Cxx-*.md`, with a source, followed by a rebuild.
