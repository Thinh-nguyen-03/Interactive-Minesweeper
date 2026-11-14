# Concept A: Reader-first ("The claims, checked")

An editorial fact-check you read from the top, not a map you have to learn to operate. Open `index.html` directly in a browser; it is one file with a real data subset embedded.

## Who it is for

Someone who watched the video, or heard about it, and wants to know in a few minutes what is true. They do not know the names, will mostly arrive on a phone, and will not learn a tool. They read a headline, scan a list, open one or two claims, and perhaps follow a name.

## Information hierarchy

1. **The answer.** The home page headline says how the 30 claims fared. One bar and three short columns, *what holds up*, *what needed correcting*, *what is unproven*, give the split across the 708 individual points checked. This matters because 72 of 82 overall verdicts are "mostly accurate", so the overall verdict alone tells readers very little. The per-point split is the real information, and it repeats as a small bar and a plain sentence on every claim row.
2. **The standing note**, directly under the answer and in every page footer: everyone named denies wrongdoing, nothing is an accusation of a crime, and a link is not a cause.
3. **The 30 claims in the order the video makes them**, in seven chapters, each row with a verdict, a one-sentence finding and the tally.
4. **Beyond the video**: the two unverified items first and visibly set apart, then follow-up leads and connection checks, folded to four each.
5. **Who is involved** and **How we checked**, including the limits.

A claim page always runs in the same order: what the video says, verdict, bottom line, what holds up, what needs correcting (the video said / the record shows), what is unproven, the other side, everyone named, sources. A person or organisation page runs: one-line description, events in date order, connections by kind, the other side, claims that name them.

## Navigation

Three destinations in the header: Claims, Who is involved, How we checked. Every page is a plain `#/` link (`#/claim/C05`, `#/name/justin-sun`), so pages can be shared and the back button works. Claim pages have previous and next links so the whole fact-check can be read in sequence. A single filter box on the home page narrows the 30 claims. Names are links everywhere they appear.

## How the network graph is used

There is no global graph. Each claim and each name gets one small figure of at most eight or nine names: the most connected names in that claim, or a name and its closest connections. Selecting a name highlights its lines and writes the relationships out as sentences underneath, with a link to that name's page. The figure is a supporting illustration beside the text. On a phone it sits below the bottom line. Everything it shows is also available as text (the timeline, connections by kind, everyone named).

## Typography and colour

- **Source Serif 4** for headlines and verdicts, **Source Sans 3** for everything else, with Charter and Inter or system fonts as fallbacks. A serif headline over a humanist sans reads as a publication, not an application, and both are built for long reading at small sizes. Body text is 17px, 16.5px on phones.
- White page, blue-black ink, one blue for links. Colour is otherwise reserved for meaning: green for what holds up, amber for what needs correcting, violet for what is unproven, red for wrong.
- Every verdict has a shape as well as a colour (filled tick, outlined tick, half-filled circle, dashed circle with a question mark, cross) and is always written out in words. Bar segments differ by pattern: solid, hatched, dashed outline, striped.
- Structure comes from rules and spacing, not cards. The only tinted areas are the standing note and the unverified markers. Sentence case throughout, no uppercase labels.
- Light theme first; dark follows the system setting and has a toggle.

## What it deliberately leaves out

- The whole-network graph, path tracing, filters by relationship type, and theme pages. Readers who want to explore 1,159 names freely are not served here.
- Confidence and audit detail beyond one line under the verdict.
- The long-form research reports. The structured findings replace them; a link to the full report could be added per claim.
- Item codes (C05, C46) in the interface. Video claims are numbered 1 to 30; other items are called follow-up leads and connection checks.

## Risks and open questions

- **Length.** The home page lists 30 claims in full and is long. The chapter labels and filter help, but a contents strip may be needed.
- **"Most of them hold up" is an editorial headline.** It is accurate to the data but it is a judgement the owner should sign off, and it must be regenerated if verdicts change.
- **Chapter titles are mine**, grouped by claim number. They need review.
- **"What is unproven" is partly derived.** Where an item has no unverified point, the prototype pulls sentences that mention "not proven", "insinuation" and similar from the summary and denials. The full version needs an explicit field written by the researcher.
- **Relationship labels are not sentences.** Timeline lines such as "Tron deal / adviser to Tron Inc" come straight from the data, and the same event can appear twice when two claims record it. Timelines need de-duplication and a light edit, or a `sentence` field in the data.
- **Some source text is written for researchers** (ISO dates in prose, "Deeper follow-up to C37", "I found no reporting"). It shows up as-is.
- **Names with hundreds of connections** (Donald Trump, World Liberty Financial) produce very long timelines; these are folded but need curation.
- **The small figures hide structure across claims.** A reader cannot see that the same lobbyist recurs unless they open that name's page or a connection check.

## What building the full version would involve

1. Extend `build.py` to emit what `extract.py` here computes: the per-claim tally, parsed corrections, an explicit unproven list, a short label for every name, and de-duplicated dated relationships.
2. Split the data so the home page loads only the light list (about 30 KB) and each claim or name loads on demand; the prototype embeds 12 full claims and 272 names in about 350 KB.
3. Build the three templates for all 82 items and about 1,159 names, plus a names index with search and a page per recurring theme if wanted.
4. An editorial pass on chapter titles, one-sentence findings, timeline wording and the headline.
5. Accessibility and device testing (keyboard use of the figure, screen-reader order, 400px and 1280px, light and dark), then publishing under the existing constraints (single content page, Google Fonts only, plain hash links).

## Files

- `index.html`: the prototype. Screens: `#/`, `#/claim/C05` (also `C16`, and `C46` for an unverified item), `#/name/justin-sun` (also `world-liberty-financial`).
- `extract.py`: rebuilds the embedded data from `map/graph-data.js` and writes it into `index.html`.
- `shots/`: desktop (1280x800) and phone (400x860) screenshots of the three screens, light theme.
