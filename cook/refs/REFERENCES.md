# Visual references

Captured 2026-11-15 with headless Chromium at 1440x900 (phone captures at 400x860), device scale 1. Every capture is in `cook/refs/raw/` (about 100 files); the ten below are copied to `cook/refs/R01.png` … `R10.png`.

These are third-party screenshots for local side-by-side scoring only. They are listed in `.gitignore` and must not be committed or published.

**Rule for every reference: take the principle, never the element.** No colour value, typeface, logo, illustration, component or layout is to be reproduced 1:1. If a shot of ours could be mistaken for one of these sites, it has failed.

## What could not be captured

| Wanted | Result |
|---|---|
| ICIJ Offshore Leaks node page with its graph | Every page sits behind a "Please read the statement below before searching" dialog that needs a tick in "I have read and understood the terms". An automated tick was not permitted in this session, so the graph was not captured. `raw/icij-node.png` shows the dialog and the standing disclaimer bar, which are useful in themselves. |
| LittleSis Oligrapher map | `littlesis.org/oligrapher` rendered "Content missing" in headless Chromium and exposed no map links. The entity page loaded (`raw/littlesis-entity.png`, `raw/littlesis-entity-interlocks.png`). |
| OCCRP Aleph | Login only (`raw/aleph-home.png` is the marketing page). |
| OpenSecrets profile | Blocked by a bot check (403). |
| Observable notebooks | Blocked by a bot check (429). Vega's own examples were used instead. |
| Reuters Graphics | The index redirects to the news front page; no graphic was reached. |
| Linkurious, Neo4j Bloom, Graphistry, Cosmograph | Marketing pages only, or 404. Captured to raw, none chosen. |
| OpenCorporates company page | Loaded, but most fields say "Please log in to see this data". |

Other raw captures worth a look although not chosen: `sigma-hover-embed` (the purest dimming selection), `gephi-lite-lesmis` and `gephi-lite-dark` (what library defaults look like, a negative reference), `vega-matrix`, `vega-edge-bundling`, `vega-arc`, `yfiles-*` (layout demos buried in demo chrome), `ci-hairball-*`, `occrp-rat-home` and `occrp-rat-profile`, `politifact-check`, `pp-disclosures-witkoff`, `opensanctions-statements`, `bovs-core`, and the phone captures `fullfact-phone`, `pp-sc-thomas-phone`, `opensanctions-entity-phone`.

---

## R01 — ProPublica, Trump Team Financials, landing page

- **Source:** https://projects.propublica.org/trump-team-financial-disclosures/
- **What it is:** The front page of a searchable database of financial disclosures. Left half: a small kicker, a three-line serif headline that says what the database is, a four-line plain description, a byline with publication and update dates, one search field with five example queries as links beneath it. Right half: a single flat illustration. Below: one row of four totals (2,326 appointees, 5,996 documents, 192K assets reported, $30B–$74B asset values), then two list headings, "Wealthiest Officials" and "Search by Category".
- **Take from it:**
  - Layout: the page states what it is, who made it and when it was updated before anything else. Search is the only control above the fold. The totals are plain figures on the page ground with a small grey label, separated by space. They are not cards.
  - Density: about 60 words of copy above the fold. The second screen is ranked lists, not more explanation.
  - Type: a heavy condensed serif for the headline only; a neutral sans for everything else. Two sizes of body text. Figures in a bold sans, roughly 1.5 times body size, no bigger.
  - Colour: black header bar, off-white ground, one accent used once for the search button and links.
  - Sources and uncertainty: byline and "Updated" date sit directly under the description. The asset total is given as a range, "$30B–$74B", because the filings give ranges. Example searches show the reader what a good query looks like.
- **Do not copy:** the illustration or any figurative artwork of a named person, the red block, the headline typeface, the black masthead. Do not turn the four totals into tiles.

## R02 — Full Fact, a fact-check article

- **Source:** https://fullfact.org/politics/angela-eagle-us-uk-trade-2-5bn/
- **What it is:** A single fact check. A narrow left rail holds the label "FACT CHECK", author and role, published and updated dates, reading time, topic, tags and share buttons, each under a tiny uppercase field name and separated by hairlines. The main column has a breadcrumb, a heavy headline, then one grey box split into two columns: "WHAT WAS CLAIMED" on the left in normal weight, "OUR VERDICT" on the right in a white inset with a thick accent rule on its left edge and the first sentence in bold. Body text follows at a measure of about 75 characters.
- **Take from it:**
  - Layout: claim and verdict are read side by side before any prose, and the verdict is a sentence, not a rating dial or a coloured badge.
  - Density: the metadata rail keeps dates, author and topic out of the reading column. Each item is a field name over a value.
  - Type: one sans family throughout; headline about three times body size; field names at about 11 px uppercase with wide tracking in mid grey.
  - Colour: near-black, white, two greys, and one accent used for the label, the verdict rule and link underlines. Links in body text are underlined in the accent, the text itself stays black.
  - Sources and uncertainty: both published and updated dates are shown. Sources are inline links at the exact phrase they support ("the latest figures"). The verdict states the correct figure and its period ("four quarters to the end of Q1 2026").
- **Do not copy:** the cyan and yellow, the block logo, the heavy geometric headline face, the row of share buttons. Do not copy the two-column claim box shape exactly; ours also has to carry who made the claim and how many documented links the check rests on.

## R03 — ProPublica, Supreme Connections, a person's page

- **Source:** https://projects.propublica.org/supreme-connections/justices/clarence-thomas
- **What it is:** A profile. A dark bar carries the project name as a breadcrumb root ("Supreme Connections › Justices › Clarence Thomas") and a search field. The header band has a small round portrait, the name in a heavy serif, one line of role with a date, a row of four figures divided by thin vertical rules (411 connections, $2M–$7.3M investments, 34 gifts, 228 reimbursements), a year filter and a three-sentence summary. Below, on white: "Top Connections", a two-sentence explanation of what a connection is, and a table of name, category, mentions.
- **Take from it:**
  - Layout: a fixed order of name, role, counts, summary, then ranked table. The content column is about 940 px wide inside a 1440 px window, with generous side margins.
  - Density: the header band is calm; the table is tight. Rows are about 46 px with alternating faint tint and hairline borders. The mentions column is right-aligned.
  - Type: serif only for the name and section headings; sans for all data. The counts are bold, about 28 px, with 13 px labels beneath.
  - Colour: links are one blue. The category column is a link in the same blue at normal weight, the name in bold, so two columns of links still read as primary and secondary.
  - Sources and uncertainty: the summary says exactly what the numbers rest on ("178 organizations … 34 financial disclosures filed since 1990") and what is missing ("We do not have disclosures for 1991"). Each section opens by defining its term in plain words.
- **Do not copy:** the portrait on a coloured disc, the navy bar, the serif. Do not copy the counts row as a set of four identical stat blocks if our counts are not comparable quantities.

## R04 — OpenSanctions, an entity page

- **Source:** https://www.opensanctions.org/entities/Q315514/
- **What it is:** A record page. The name, a one-sentence status notice in a pale tinted box, then a property table with three columns: bold field name, value, and at the far right of every row a small link "24 sources ›". Topics are small monospace tags with thin outlines. Long value lists end with "25 more…". A right-hand column gives in-page navigation: Factsheet, Descriptions, Relationships, Data sources.
- **Take from it:**
  - Layout: one row per fact, and the source count belongs to the row, right-aligned in its own column. A reader can run an eye down that column and see that everything is sourced.
  - Density: rows of about 41 px separated by single hairlines, no zebra, no boxes. Long lists are cut with an explicit "N more…" instead of being hidden without a count.
  - Type: field names bold at body size, values regular. Tags and identifiers are monospace at a smaller size, which marks them as data.
  - Colour: black on white, one blue for links and source counts. Tag outlines use two muted hues by class (red-brown for sanction-related, amber for others) with the text in the same hue; neutral tags are grey.
  - Sources and uncertainty: the per-row source count. The status notice is a sentence with a link to the listings, not a warning icon. Lower on the page (`raw/opensanctions-entity-relationships.png`) every description carries its dataset name, a "non-official source" tag where that applies, and a date.
- **Do not copy:** the saturated blue header and call-to-action panel, the green buttons, the list of every alias and transliteration at full weight. That page serves compliance staff; ours serves readers and needs a written summary first.

## R05 — Kumu, Hewlett Foundation Madison Initiative, map at rest

- **Source:** https://kumu.io/hewlettfoundation/hewlett-foundation-madison-initiative
- **What it is:** A published relationship map with a reading column. The left 46 percent is a white panel with "Overview / Discussions" tabs, a title and several paragraphs in a serif at about 20 px. The right is the canvas: about 45 circles in four muted colours (teal, sage, grey, mauve), laid out by hand so that each colour forms a region, with thin curved connections in pale tints of the same hues. Five or six nodes carry a darker ring. A search field sits at the top left of the canvas, zoom and settings buttons at the top right, and a legend at the bottom left with four colour rows and two line styles (dotted "Inverse Relationship", solid "Direct Relationship").
- **Take from it:**
  - Layout: words and picture share the screen as equals. The panel explains what the map is before the reader touches it. The map sits inside a clear margin and does not run under the panel.
  - Density: about 45 nodes and roughly 80 connections fill the canvas without crossing into a tangle, because the layout was arranged by a person and connections curve around nodes.
  - Type: labels sit inside the circles in a small sans. A few region names ("Electoral Blind Spot", "Partisan Echo Chamber") are set as plain bold text on the canvas with no node, which names clusters without adding marks.
  - Colour: four desaturated fills of similar lightness. Connections are tints of their source colour at low contrast, so the nodes carry the picture. Key nodes are marked by a darker ring of the same hue and a slightly larger size, not by a different colour.
  - Keeping the network readable: curved connections, hand placement, colour by group forming regions, one line-style distinction that is explained in the legend.
  - Controls: three small icon buttons and a search field. Nothing else at rest.
- **Do not copy:** text inside circles (ours are names of people and firms and will not fit; our research says label beside the node), the 46 percent panel width (too wide for a map that is the main subject), the faint circular halo around the whole map, the Kumu toolbar along the bottom. Our map has about thirty times as many entities, so only the calm and the proportions transfer.

## R06 — Kumu, the same map with one node under the pointer

- **Source:** https://kumu.io/hewlettfoundation/hewlett-foundation-madison-initiative (pointer resting on the node "Balance of institutional and partisan imperatives")
- **What it is:** The selection treatment. The node under the pointer, its one direct neighbour and the arrow between them stay at full strength. Every other node, label and connection drops to roughly 10 to 15 percent opacity. Nothing moves, nothing changes colour, the legend and panel stay put.
- **Take from it:**
  - Selection is made by taking strength away from everything else. The focused nodes are not recoloured, enlarged or given a glow.
  - The dimmed layer stays just visible, so the reader keeps their place in the whole map.
  - Dimmed labels disappear almost completely; only the focused labels are readable. That is what makes the state legible in one glance.
  - The connection in focus gains a visible arrowhead and a slightly darker stroke, and it is the only place direction is shown.
- **Do not copy:** this is a hover state with no panel content. Our selected state (S06) must also fill the panel with the entity's profile, its connections grouped by type and the fact-checks behind each. `raw/kumu-madison-selected.png` shows Kumu's clicked state, where the panel swaps to the selected item with a permalink; note how empty that panel is, and avoid that. Do not dim as far as Kumu does if neighbours of neighbours matter for the story.

## R07 — Cambridge Intelligence, wireframe versus styled network (dark)

- **Source:** https://cambridge-intelligence.com/blog/designing-intuitive-data-experiences-with-graph-visualizations/ (figure captioned "The difference between wireframe and styled graph visualization")
- **What it is:** The same network of about 150 nodes drawn twice. Left: black outlines on white, every node and link at the same weight, unreadable. Right: on a charcoal ground (about #222), most nodes are mid-grey rounded squares with thin grey links; two subsets are picked out in flat yellow and flat coral red, and the links between highlighted nodes take the same colour. Larger nodes carry a one-word label.
- **Take from it:**
  - A dark map can be calm: neutral charcoal, not black and not navy; no glow, no gradient, no blur.
  - On dark, the default state of a node is grey. Colour is spent only on the nodes that mean something, and at most two colours at once.
  - Highlighted links take the highlight colour; all other links stay a grey only a little lighter than the ground.
  - Size steps are few (three sizes), and only the largest nodes are labelled.
  - The left half is the negative reference: equal weight everywhere is what an unstyled, generated graph looks like.
- **Do not copy:** the pictogram glyph inside each node, the rounded-square node shape, the yellow and red pair (in our subject red reads as a verdict), links drawn at full strength through the middle. The figure has no labels on most nodes and no panel; it is a reference for ground, contrast and colour budget only.

## R08 — Mike Bostock, Les Misérables co-occurrence matrix (ordered by cluster)

- **Source:** https://bost.ocks.org/mike/miserables/ (the "Order" control set to "by Cluster")
- **What it is:** A 77 by 77 adjacency matrix about 720 px square. Row labels are right-aligned on the left, column labels rotated 90 degrees along the top, both at about 9 px. Cells sit on a pale grey ground separated by thin white lines. A filled cell is coloured by cluster when both characters are in the same cluster and dark grey when they are not; darker means more co-occurrences. Ordered by cluster, six coloured blocks run down the diagonal, and a few long dark rows and columns show the characters who connect everything. To the right: one "Order" drop-down and four short paragraphs explaining what a cell means.
- **Take from it:**
  - Ordering is the design. The same data ordered by name is noise (`raw/vega-matrix.png` and the default state show this); ordered by group it shows blocks and bridges at once.
  - Two-level cell colour: group hue inside a block, neutral dark for a tie that crosses groups. Cross-group ties are the interesting ones and they stand out because they are not coloured.
  - Shade encodes strength in about four steps.
  - The empty grid is drawn (pale cells with white gutters), so absence is visible and rows can be followed by eye.
  - Explanation sits beside the figure in four sentences, with one control.
  - Page character: off-white ground, one large italic-and-roman title, a date and author line. It reads as a published figure.
- **Do not copy:** 77 labels at 9 px (unreadable, and several collide when the order animates), six saturated cluster hues, the plain select control. Ours should show fewer rows with larger labels, highlight the row and column under the pointer, and open the same relationship panel as the map when a cell is chosen.

## R09 — Kumu, the same map at phone width

- **Source:** https://kumu.io/hewlettfoundation/hewlett-foundation-madison-initiative at 400x860
- **What it is:** The map occupies the top 280 px of the screen at full width, the whole network fitted and still coloured by group, with search at top left and three stacked buttons (zoom in, zoom out, fit) plus a settings button at top right. Below a drag handle the reading panel takes the rest of the screen: tabs, title, body text at about 19 px.
- **Take from it:**
  - Stack, do not shrink: picture on top as an overview, words below, a handle between them to change the split.
  - The reading text keeps a comfortable size and line height; nothing is scaled down to fit.
  - Controls shrink to a search field and four buttons with generous touch targets (about 40 px).
- **Do not copy:** at this size the node labels are illegible and the map is only a thumbnail, and the legend bleeds through under the panel text (visible in the capture as ghost text). Ours must show a focused neighbourhood with a dozen readable labels, or a list, and a panel that fully covers what is beneath it. See also `raw/pp-sc-thomas-phone.png` and `raw/fullfact-phone.png` for how the profile counts row and the claim/verdict box reflow to one column.

## R10 — ProPublica, Supreme Connections, an organisation's page (evidence tables)

- **Source:** https://projects.propublica.org/supreme-connections/organizations/the-federalist-society
- **What it is:** The body of an organisation page, grouped by the person connected to it. A small sticky index on the left lists "5 Justices" with thumbnail and name, the current one in bold and the rest muted. Each person section has a 76 px portrait, the name in heavy sans, "3 mentions" right-aligned on the same line, a hairline, then a sub-heading by relationship type ("Travel Reimbursements"), a two-sentence definition with the key caveat in bold ("but justices are not required to report reimbursements' dollar values"), and a table: Date, Location, Purpose, Items Paid or Provided.
- **Take from it:**
  - Layout: a connection is shown as dated rows under a heading that names the relationship type, inside a section for the other party. This is the record behind an edge of the map.
  - Density: table rows are tight and tinted alternately; the secondary detail of a cell ("Guest speaker, Florida Chapters Conference") is a smaller grey second line in the same cell, so the columns stay few.
  - Type: dates in bold as the row key. Section name large, count small and right-aligned.
  - The side index doubles as a count and a way to jump; inactive entries are faded, not removed.
  - Sources and uncertainty: the limit of the data is stated in the sentence above the table, in bold, at the place it applies.
- **Do not copy:** portraits on coloured discs, the exact four-column table, the heavy black name weight. Our rows also need an evidence level and a source marker per row, which this page leaves to the project's methodology.

---

## 1. The character these references share

They look like publications, not products. Each sits on a white or off-white ground with near-black text, one typeface for data and at most one more for headlines, and a single accent colour that is spent on links and one or two marks. Structure is carried by hairline rules, alignment and white space; there are no shadows, gradients or rounded cards doing that work. Numbers are specific and labelled in small plain words, dates and bylines are on the page, and the limits of the data are stated in a sentence where they apply. Density is uneven on purpose: headers and reading text are calm and wide, tables are tight. Where a network is drawn it is small enough to read, arranged by a person, coloured in a few muted group hues, and selection works by fading everything else. Every page shows that someone decided what comes first.

## 2. The ten most important visual moves

Based on what the captures actually show.

1. **Map selection by subtraction (R06).** Selected node, direct neighbours and their connections stay at full strength; everything else, including labels, drops to about 12 percent. No recolouring, no glow, no movement.
2. **Muted group fills, paler connections (R05).** Four or five desaturated node colours of similar lightness. Connections are thinner and lighter than any node, in a tint or neutral grey, and curve around nodes. The nodes carry the picture.
3. **Mark importance with ring and size, not hue (R05).** Key nodes get a darker ring of their own colour and one size step up. Name clusters with plain text set on the canvas.
4. **A reading panel beside the map that is never empty (R05, R06).** At rest it says what the map shows and how to read it; on selection it holds the profile. Search and three or four buttons are the only canvas controls; the legend lists colours and line styles in six rows.
5. **Dark mode in neutral charcoal with grey as the default (R07).** Ground about #222, nodes and links in greys, at most two flat highlight colours at a time, highlighted links take the highlight colour. No navy, no neon.
6. **Matrix ordered by group, with two-level cell colour (R08).** Blocks on the diagonal in the group's hue, cross-group ties in neutral dark, shade for strength in about four steps, the empty grid drawn pale with white gutters, one ordering control and a four-sentence explanation beside it.
7. **Profile header in a fixed order (R03).** Name, one-line role with a date, a row of three or four bold counts with small labels divided by thin rules, a three-sentence summary that states what the counts rest on and what is missing. Then the ranked table.
8. **A source count on every row (R04, R10).** Facts and relationships are rows separated by hairlines, with the source link right-aligned in its own column. Long lists end in "N more…". Secondary detail is a smaller grey second line in the cell. Tags and identifiers in small monospace.
9. **Claim and verdict side by side, verdict in words (R02).** A two-part box before the prose: the claim in normal weight, the verdict in a white inset with one accent rule and a bold first sentence. Dates, author and topic live in a narrow rail of field-name-over-value items separated by hairlines. Inline links sit on the exact phrase they support.
10. **A home page that says what, who and when, then offers search (R01).** Kicker, headline, sixty words, byline with updated date, one search field with example queries, a row of plain totals with ranges where the data is a range, then ranked lists. On phones, stack picture over words at a readable size and never scale the desktop view down (R09).

## 3. Side-by-side pairing for scoring

| Our shot | Stand next to | Second opinion |
|---|---|---|
| S01 home | R01 | R03 for the counts row |
| S03 check page | R02 | R10 for the evidence tables under the verdict |
| S04 profile | R03 | R04 for per-row sources, R10 for relationship rows |
| S05 map default | R05 | — |
| S06 map with a name selected | R06 | R05 for the panel's proportions and legend |
| S07 map dark | R07 | R06 for how far to dim |
| S09 map phone | R09 | `raw/pp-sc-thomas-phone.png` for the panel content |
| S11 matrix | R08 | — |
