# Concept B: Explorer

A reference site that starts from names. You look up a person or organisation and get a profile: who they are, who they are linked to, what happened in order, how much money moved, and which checked claims mention them. Claims are the evidence behind every line, one click away.

Open `index.html` directly in a browser. Screens: home (`#/`), claim (`#/claim/C05`, also `#/claim/C46` for an unverified item), profile (`#/who/justin-sun`, `#/who/jared-kushner`, `#/who/world-liberty-financial`), and a browse list (`#/browse`).

## Who it is for

Someone who watched the video, or heard a name in the news, and wants to ask "what is actually known about this person or company?" They are not an analyst. They arrive with a name more often than with a claim number, and they want a straight answer with the caveats attached.

## Information hierarchy

1. **Home**: one sentence on what this is, a large search box, the standing note, and the verdict tally. Then the most-named people and organisations, the claims with verdicts, recurring themes, and how the checking was done.
2. **Profile** (person or organisation): name, kind and one-line description; a note that they deny wrongdoing; closest connections (small diagram); what happened in order; all connections grouped by the other party; claims that mention them; largest sums.
3. **Claim**: what the video said; verdict, confidence and second review; bottom line; what holds up; what needs correcting; what is unproven; the other side; dated events; sources; related claims. Who is involved and the money mentioned sit alongside.

Every relationship line names the actor, what they did, the date and the claim it comes from, so a reader can always get from a connection to its evidence.

## Navigation

Three top-level links (people and organisations, claims, how we checked) and a search box on every page. Search covers names, aliases and claim titles, works from the keyboard, and groups results by kind. Everything else is ordinary links between profiles and claims, with plain `#/...` addresses that can be shared. The browse page offers a kind filter, a text filter and two orderings; nothing more.

## How the network graph is used

There is no whole-network graph. Each profile has one small diagram: the subject in the middle and their eight to ten most-linked names around it. Selecting a name shows the specific documented links underneath and a link to that profile, so the reader walks the network one step at a time. Lines are plain; a dashed line marks an unverified allegation. The same relationships are always listed as text below, so the diagram is never the only way in. Two other small figures do work a graph cannot: a timeline of dated events and a strip of the largest sums, payer to recipient.

## Typography and colour

- **Atkinson Hyperlegible Next** for text (designed for legibility, with clearly distinct numerals, which matters on a page full of dollar figures and dates) and **Gabarito** for headings (round and friendly without being playful). Fallback is Inter, then system fonts; the screenshots show Inter because Google Fonts is blocked in the sandbox.
- White page, dark blue-grey text, ordinary blue underlined links. It should read like a public reference work, not a tool.
- People are round marks and everything else is square, tinted blue (people), green (companies and funds), yellow (governments and countries) or grey (media and events). The kind is always also written out.
- Verdicts are an icon plus words: filled tick (confirmed), outlined tick (mostly accurate), half-filled circle (partly accurate), dashed circle with a question mark (unverified). Colour is secondary. Unverified items also get a dashed outline, a hatched bar and the words "Alleged, unverified" wherever they surface, including inside profiles.
- Light theme first; dark theme follows the system setting and can be toggled.

## What it deliberately leaves out

- The full graph, path tracing, isolate mode, filter rails and legends.
- Relationship-type colour coding and evidence-grade badges on every line (the data does not yet carry a grade per relationship; see below).
- The long-form research reports. The structured findings and sources stand in for them.
- Counts as decoration: no "degree" or "centrality" language.

## Risks and open questions

- **A profile can look like a charge sheet.** Collecting everything about one person on one page is the point, but it concentrates implication. The per-profile denial note, the "alleged" marks and neutral verbs help; wording needs an editorial pass on every high-profile page.
- **It undersells the video's storyline.** A reader who wants "what did the video get right?" has to go to the claims list; the narrative across claims is weaker here than in an editorial design.
- **Data quality shows.** The same relationship is restated across claims with different wording and dates. The prototype merges by pair, kind, month and amount, which is crude; some duplicates remain and some distinct facts may be merged.
- **"What is unproven" is partly inferred.** Where no sub-claim is marked unverified, the prototype picks summary sentences that say something is not proven. The full build needs an explicit field.
- Relationship labels are verb fragments ("named adviser to"); shown as "actor: label" they read acceptably but not always gracefully.
- Should Donald Trump (81 claims, 266 connections) have a normal profile, or a specially structured one?

## What the full version would involve

- Extend `build.py` to emit per-entity data: merged relationships with a canonical sentence, an evidence grade and an allegation flag per relationship, and an `unproven` list per claim.
- Split data so pages load on demand (the prototype embeds 13 of 82 claims and 270 of 1,159 names, about 375 KB, extracted from `map/graph-data.js`).
- Theme pages, an A to Z index, and profile pages for all names, with thin "mentioned once" entries folded into their claim.
- Search over all names, aliases, claims and sources.
- An editorial review of descriptions and labels for neutral wording, and accessibility testing with a screen reader.
