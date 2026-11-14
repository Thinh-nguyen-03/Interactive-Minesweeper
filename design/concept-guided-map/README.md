# Concept C: Guided map

A calm map of six topic areas, with guided tours that walk a reader through one storyline at a time. Open `index.html` directly in a browser; it is a single file with a 16-claim sample of the real data embedded.

## Who it is for

Someone who watched (or heard about) the video and wants to know what holds up, without learning to read a network graph. They arrive with a storyline in mind ("the Qatar jet", "that crypto guy and the SEC"), not a name to look up. They are probably on a phone.

## Information hierarchy

1. **The question and the tally**: "What holds up?" and the four verdict counts, at the top of the home screen.
2. **Six topic areas**: crypto ventures, Gulf money, regulators and enforcement, media and tech, defence and minerals, with the Trump family in the middle. Each shows three or four well-known names and nothing else.
3. **Storylines (tours)**: three to five steps each, one or two sentences per step, always ending on "What the record does not show".
4. **Claim pages**: verdict, what the video says, bottom line, what holds up, what needs correcting, what is unproven, the other side, sources, how it was checked.
5. **Name pages**: who or what it is, the claims that mention it, and every connection as a plain sentence.

## Navigation

- Three top links: Map, All claims, About. Everything is a plain `#/` deep link, so the back button works.
- Home map → choose a topic area → that topic opens large, with more names and its claims listed beside it → choose a name → its links are numbered on the map and explained in the side panel → open the full page.
- Or: home → a tour → Next/Back → "Read the full finding".
- Claim and name pages link to each other and back to the right spot on the map.
- "The same claims as a list" sits under the map, so nobody is forced through the map.

## How the map is used

- **Hand-placed, not simulated.** Topic areas sit in a fixed grid (3 × 2 on desktop, 2 × 3 on phones); names sit in fixed slots. Nothing moves, so the picture is the same every visit.
- **Progressive disclosure.** At rest the overview shows about 22 names and only the links inside a topic. Links across topics appear when a name is chosen or a tour step needs them. Opening a topic adds its second tier of names and a row of "connected names from other topics".
- **Numbers, not edge labels.** Highlighted links carry a number; the sentence explaining it is in the panel next to the map. The same numbered-key device is used in the small diagrams on claim and name pages.
- **Unverified items are never drawn as lines.** C46 appears in lists with a dashed question-mark verdict and a dashed warning box, and its claim page shows no diagram at all.
- Two shapes only: circle for a person, square for anything else.

## Typography and colour

- **Lexend** for headings and **Atkinson Hyperlegible** for text (fallbacks: Inter, system UI). Both were designed for reading ease; together they feel like a public-information site, not a newsroom or a dashboard.
- Light theme first: cool off-white page, white surfaces, dark slate text, one blue accent for actions and highlighted links. Dark theme uses slate blues with the same roles.
- Each topic has a pale tint (the area) and a darker tone (its names). Colour identifies the topic only; it never carries a verdict.
- Verdicts use shape plus words: solid tick (confirmed), outlined tick (mostly accurate), half-filled circle (partly accurate), dashed circle with question mark (unverified). Green, amber and grey reinforce them.
- Sentence case throughout; no uppercase labels, badges or tag clusters.

## What it deliberately leaves out

- The full graph of 1,159 names and 3,037 links. The map is curated to about 40 names and 50 links.
- Filters, relationship-type colours, path tracing, node isolation, zoom and pan.
- Link-type legends and evidence-grade glyphs on the map.
- Search (needed in the full build; omitted here to keep the prototype small).

## Risks and open questions

- **Curation is editorial.** Someone must choose which names are on the map, which topic each belongs to, and write the short link labels and tour text. That is real work and a place for bias or error; every label must trace to a claim file.
- **Coverage.** The remaining ~1,100 names are reachable only through claim and name pages. Readers may assume a name is absent because it is not on the map.
- **One topic per claim** is a simplification (C05 is crypto and regulators). The full build should allow two.
- **Evidence grades** (documented, single-source, inferred) live in sub-claim text, not on relationships, so the prototype cannot label each link. Needs a data field.
- **Cross-topic lines** on a phone can still cross labels when a well-connected name is chosen.
- Tours cover three storylines; 82 items need perhaps eight to ten tours, plus a decision about items that fit none.

## What the full build would involve

1. A small curation file (`data/map.json`): topics, map names with tier and short label, plain-language link labels with claim ids, claim-to-topic assignments, and tour scripts. `build.py` validates it against the claim files.
2. Split the page into `index.html`, `style.css`, `app.js` and reuse `graph-data.js`; load claim detail lazily.
3. Search across claims and names; an A–Z "People and organisations" index for names not on the map.
4. Write and review the remaining tours; second-review the tour text like any other finding.
5. Keyboard and screen-reader pass on the SVG map (names are focusable now; add arrow-key movement and a text summary per topic), plus testing at 400px and 1280px in both themes.
