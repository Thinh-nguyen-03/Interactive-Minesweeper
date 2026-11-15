# Inspiration: connection matrix and editorial design

Research notes for the site redesign. Two parts: (A) the connection matrix and alternatives to the node-link map, (B) editorial and fact-check design that reads as authoritative and made by a person.

How this was researched: about 30 web searches on 2026-11-15. Direct page fetches are blocked in this session (for example `guides.propublica.org` and `www.utsubo.com` did not resolve), so claims rest on search-result summaries, paper abstracts and design write-ups. Where a point comes from my own prior knowledge and was not confirmed by a search result, it is marked **(unconfirmed)**. Every numbered source is listed at the end.

Numbers about our own data were measured from `map/graph-data.js` (generated 2026-11-14): 1,345 entities, 2,926 relationships over 2,402 distinct pairs, 94 checks.

---

## 0. What our data says about the matrix (measured, not assumed)

These facts drive the specification and should be re-measured if the data changes.

| Fact | Value | Consequence |
|---|---|---|
| Pairs with exactly 1 relationship | 2,043 of 2,402 (85%) | A long colour ramp for "count" would be wasted. Three steps are enough. |
| Highest count for one pair | 6 (2 pairs); 5 for 6 pairs; 4 for 23 | Steps: 1, 2, 3 or more. |
| Most connected name | Donald Trump, 278 relationships; next is World Liberty Financial, 140, then SEC, 83 | One hub dominates. Left inside the square it fills a whole row and column and hides everything else. |
| Top 40 names by degree | 127 connected pairs out of 780 possible (16% filled); 107 without the hub | Good density for a matrix: enough empty space to see blocks. |
| Top 60 names | 186 pairs of 1,770 (11%) | Still readable on desktop as an optional larger size. |
| Same top 40, counted by "appear in the same fact-check" | 743 of 780 (95%) | Co-occurrence (the Les Misérables method) is useless here: almost every cell fills. Use documented direct relationships only. |
| Relationships that touch an unverified check (C37, C46) | 54 | Enough to need a distinct, non-colour mark. The data also carries an `alleged` flag per relationship. |
| Relationship types | 9 (commercial, ownership, political, money, regulatory, legal, media, advisory, family) | Too many for cell colour. Type belongs in the tooltip and the detail panel, and as a filter. |

---

## 1. Connection matrix: build specification

### 1.1 Why a matrix at all (so the page can say it in one sentence)

- Ghoniem, Fekete and Castagliola (InfoVis 2004; journal version 2005) tested seven generic tasks on random graphs of three sizes and three densities. Above about twenty vertices the matrix beat the node-link diagram on most tasks. The one consistent exception was path finding, which favours node-link. [1][2]
- Okoe, Jianu and Kobourov (TVCG 2019, 864 online participants, 14 tasks, real networks) refined this: node-link was better on topology and memorability tasks, the matrix was better on some group and cluster tasks. The preprint and the journal version disagree on how many cluster tasks the matrix won, so only cite the direction. [3]
- Henry, Fekete and McGuffin (NodeTrix, 2007): social networks are "globally sparse and locally dense", which is why neither view wins alone. [4]

Design consequence: the matrix is for "is A linked to B, how strongly, and which names form a block". The map keeps "how do I get from A to B" (trace path). The two must hand off to each other. Do not try to make the matrix answer path questions.

### 1.2 Which names, and how many

1. **Default 40 names** on screens 900px and wider. Offer one size switch: `40` / `60`. Never render more than 60: at 60 the labels are already at the legibility floor.
2. **Selection rule**: people and organisations only (types person, company, fund, government, media, country). Exclude event, law, asset and product types, which are not parties to a connection. Rank by number of distinct connected partners inside the candidate set, not by raw relationship count, so one much-documented pair does not buy two seats.
3. **Take the hub out of the square.** Donald Trump is not one of the 40. He gets a pinned strip above the grid: one row of 40 cells labelled "Linked to Donald Trump", same encoding, separated from the grid by 10px. This is the single most important readability decision for this dataset: the remaining 40 by 40 block then shows who is linked to whom independently of him.
4. **Guarantee coverage**: after ranking, force in any name that is the subject of a profile linked from the home page, and state the rule under the chart ("The 40 names with the most documented connections to one another. Events, laws and products are left out.").
5. **Scope filter**: a topic select (13 topics) rebuilds the matrix from that topic's relationships with its own top names. This is the route to everything outside the top 40 and is better than a bigger grid.
6. ICIJ's Offshore Leaks database refuses to draw a graph when a node has too many connections and offers a table and download instead. [5] Follow that honesty: when a filter leaves fewer than 8 names, show the list view (1.8) instead of a tiny matrix.

### 1.3 Ordering

Order is the thing that makes or breaks a matrix. Bertin's reorderable matrix exists to permute rows and columns until blocks appear [6]; Bostock's Les Misérables example states that effectiveness "is heavily dependent on the order of rows and columns" [7]; Behrisch et al.'s survey says the ordering decides which visual patterns are visible at all. [8]

1. **Default order: by group, then by similarity inside each group.**
   - Groups, in this fixed order: Family, Officials & Agencies, Companies & Ventures, Funds & Investors, Foreign States, Media. Derive from entity type plus a small hand-written override list in `build.py` (family members are type person, so they need the override).
   - Inside each group, order by hierarchical clustering with optimal leaf ordering on the rows of the 40 by 40 matrix. Fekete's reorder.js documentation calls optimal leaf ordering "probably the most reliable" method, with cubic cost, which is irrelevant at 40 to 60 rows. [9]
   - **Compute the order in `build.py`**, not in the browser (the site may only load d3 from cdnjs). SciPy has `scipy.cluster.hierarchy.optimal_leaf_ordering` **(unconfirmed by search, from memory)**; if SciPy is unavailable, a barycenter pass (repeat: sort each row by the mean position of its neighbours, 10 iterations) is 20 lines and good enough. Emit three integer arrays per matrix size: `order.group`, `order.degree`, `order.alpha`.
2. **Alternative orders** in a three-way segmented control, wording exactly: `By Group` (default), `Most Connected`, `A to Z`. These mirror Bostock's Name / Frequency / Cluster control [7], which readers of data journalism already know. A to Z is the lookup order; Most Connected pushes filled cells to the top-left.
3. **Fourth order, on demand**: clicking a row label sorts all other names by strength of link to that name (connected first, then by count). Label it in the status line: "Sorted by connection to Jared Kushner. Reset".
4. **Animate the reorder**: rows first, then columns, 450ms total, ease-in-out, no stagger per cell. Respect `prefers-reduced-motion` (then swap instantly). Animation is what lets the reader keep their place; it is not decoration.
5. Rows and columns always use the same order (symmetric matrix). Draw both triangles: reading along one row is easier than following an L-shape in a half matrix.

### 1.4 Grouping bands

- Insert a **6px gap** between groups on both axes. The gap is the separator; do not draw boxes round groups.
- Group name appears once per axis: horizontal, above the column labels and left of the row labels, in the regular UI sans at 12px, medium weight, Title Case, muted ink. No uppercase tracking, no coloured chips.
- Within-group blocks (the squares on the diagonal) get a background tint one step off the page colour (about 3% ink). Off-diagonal blocks stay page colour. This makes "inside the family" versus "family to funds" readable before any cell is read.
- No colour per group. Position already encodes the group.

### 1.5 Cell encoding

One visual channel per meaning, and nothing that depends on hue alone.

| State | Mark | Notes |
|---|---|---|
| No documented link | Empty. Background only. | No dot, no grey square. Empty space is the signal. |
| 1 documented relationship | Filled square, accent at step 1 (about 45% strength) | |
| 2 | Filled square, step 2 (about 70%) | |
| 3 or more | Filled square, step 3 (full accent) | Exact number shown in the tooltip and panel. |
| All relationships for the pair are unverified or alleged | **Hollow square**: 1.5px outline in the neutral "unverified" ink, no fill | Shape, not colour, carries "unverified". Works in greyscale and for colour-blind readers. |
| Mixed: some verified, some unverified | Filled by the verified count, plus a small hollow corner notch (top-right triangle cut to page colour with outline) | Count only verified relationships towards the fill step. |
| Diagonal (same name) | Thin diagonal hairline through the cell, muted | Gives the eye the axis of symmetry. |

Further rules:

- **One hue, three steps.** A sequential single-hue ramp, light to dark in light theme, and re-derived for dark theme (dark to bright). Do not reuse the verdict colours here.
- **Cell size**: 18px at 40 names, 13px at 60, with a 1px gap. Cells are square with 1px radius at most. A recent encoding study fixed cells at 23px purely so labels stayed readable [10]; label legibility is the real constraint, so label size sets cell size, not the other way round.
- **No numbers inside cells** by default. At 18px a digit is noise when 85% of values are 1.
- **Relationship type is not in the cell.** A filter above the grid (a plain select: "All Types", then the nine types) redraws the matrix for one type. One type at a time keeps the single-hue rule.
- Draw on SVG (1,600 to 3,600 rects is fine) so text and hairlines stay crisp, or on canvas at `devicePixelRatio` with an invisible DOM grid for focus and screen readers.

### 1.6 Headers and labels

- **Row labels**: left of the grid, right-aligned to the grid edge, 13px UI sans, one line. Truncate at 24 characters with an ellipsis; full name in `title` and in the tooltip. Prefer the short form already used in profiles ("World Liberty Financial", not the legal name).
- **Column labels**: above the grid, rotated 50 degrees anticlockwise, anchored at the bottom-left of each column. Angled labels are far easier to read than vertical ones and need about 110px of height. Same size and truncation as rows.
- **Sticky headers**: when the grid is taller than the viewport, the column label block sticks to the top and the row label column sticks to the left, each on the page background colour.
- **Entity type** is shown by a 6px shape before the row label only (circle for person, square for organisation), in muted ink. Not in the column labels.
- **Above the chart**: a plain sentence as the title that states what the reader is looking at, for example "Who is linked to whom", with one line of dek: "Each square marks a documented connection between two names. Darker means more separate connections." Then the legend, then the controls. Reuters, FT and Datawrapper practice is a sentence title, a one-line explanation and a source line under the chart **(unconfirmed by search, standard practice)**.
- **Legend**: one horizontal row of four sample cells with labels, directly above the grid, left-aligned with it: `1 Connection`, `2`, `3 or More`, `Unverified`. No legend box.
- **Under the chart**: a source and method line: count of names and pairs shown, selection rule, date generated, link to methodology.

### 1.7 Interaction

Hover row and column highlighting is the standard pattern in every interactive matrix study found [3][10][11]; a temporal-matrix tool from TU Wien uses crosshairs on hover to show a cell's two endpoints. [11]

1. **Hover a cell (pointer devices)**: tint the whole row and whole column with a 6% ink band (the cross-hair), set both labels to full ink and semibold, drop all other labels to 55% opacity. Do not dim other cells; dimming destroys the block pattern the reader is using.
2. **Tooltip** (appears after 80ms, anchored to the cell, never under the cursor): line 1 both names; line 2 "3 documented connections" or "No documented connection"; line 3 the types, for example "Ownership, Money"; line 4 only if relevant, "1 of these is unverified". Maximum four lines, no card chrome beyond a hairline border.
3. **Hover a label**: highlight that row and its mirrored column.
4. **Click a cell**: selection persists (2px ink outline on the cell, cross-hair stays). The detail panel opens (1.9). Click again or press Esc to clear.
5. **Click a label**: selects the name (row and column bands persist) and offers two actions in the panel header: "Sort by This Name" and "Open Profile".
6. **Keyboard**: the grid is one tab stop with roving focus. Arrow keys move the cross-hair, Enter selects, Esc clears, Home and End jump along the row. Expose as `role="grid"` with each filled cell's accessible name equal to tooltip lines 1 and 2.
7. **Deep link**: every state is a plain hash route, for example `#/matrix?n=40&order=group&type=money&sel=jared-kushner,affinity-partners`.
8. **Hand-off to the map**: the panel always carries "Show on Map", which opens the map with the two names isolated, or runs trace path when the cell is empty ("No direct connection. Trace the shortest path on the map"). This is the matrix admitting what the research says it is bad at. [1]
9. **Empty cells are selectable**. "No documented connection" is a finding on a site like this, and saying so plainly is part of the neutral tone.

### 1.8 Phone behaviour (under 700px)

Research on responsive news graphics (231 examples analysed, CHI 2020) and the Mobile Data Visualization book both say the same thing: small screens need a changed layout or encoding, not a scaled-down desktop chart. [12] A 40 by 40 grid at 400px gives 8px cells and no room for labels, and there is no hover on touch.

1. **Do not show the square grid by default on phones.** Show the **focus list**: a name picker at the top (search field plus the 40 names in group order), then for the chosen name a list of its connections, sorted by count, grouped under the same group headings. Each line: partner name, then the same cell mark (filled step or hollow) at 14px, then the count as a figure, then a chevron. This is one row of the matrix turned on its side, with the same encoding and legend.
2. Default focus name on load: the first name in the Family group, or the name in the deep link.
3. **Optional overview**: a "See Full Grid" link opens the matrix in a full-screen sheet with 14px cells, row labels sticky on the left at 120px wide, column labels sticky on top, two-axis scroll. Tap a cell to select; the cross-hair appears on tap and the tooltip content goes into a fixed bar at the bottom of the sheet (two lines plus "Details"). No pinch-zoom handling of our own; let the sheet scroll.
4. Touch targets: list rows 44px high. In the sheet, a tap selects the nearest filled cell within 10px so 14px cells remain usable.
5. Between 700 and 900px: show the grid with 30 names and 16px cells.

### 1.9 What to show on select (the detail panel)

Desktop: a panel 360px wide to the right of the grid, replacing the page's right margin, never overlaying the grid. Phone: a bottom sheet. One flat surface, no nested cards.

Order of content:

1. **Both names** as links to their profiles, each with its one-line role.
2. **Summary sentence** in running text: "Three documented connections, the earliest in March 2021." or "No documented direct connection."
3. **Relationship list**, one entry per relationship, newest first. Each entry: the relationship as a sentence built from the label ("Affinity Partners received an investment from the Public Investment Fund"), then one muted line with date, amount if any (tabular figures, "about $2 billion"), and type.
4. **Verification status per entry**: for unverified or alleged entries, the hollow-square mark and the words "Unverified, single source" before the sentence. Same mark as the cell so the legend teaches both.
5. **Fact-checks that document it**: check title with its verdict word, linked. This is the evidence trail and must never be more than one tap away.
6. **Actions**: "Show on Map", "Open Profile" (if a label was selected), "Copy Link".
7. The standing note that everyone named denies wrongdoing appears once at the foot of the panel in small muted text, not per entry. ICIJ puts an equivalent disclaimer on every entity page. [5]

### 1.10 Acceptance checks for the matrix

- With the hub strip removed mentally, can a first-time reader name two blocks within 10 seconds? If not, the order is wrong.
- Greyscale screenshot: verified, unverified and mixed cells still distinguishable.
- 400px wide: no horizontal page scroll; focus list usable with one thumb.
- Reorder does not lose the current selection.
- Every filled cell reachable and announced by keyboard and screen reader.

---

## 2. Alternative views worth adding later

Ranked by how much each adds that the map and matrix cannot do.

### 2.1 Money-flow diagram (Sankey style): first priority

- **What**: a left-to-right flow in three fixed columns, `Source of Funds` to `Vehicle` to `Recipient`, band width proportional to dollars. We have 453 money relationships and an `amount_usd` field.
- **When it beats the network**: whenever the question is "how much, from whom, to whom". A node-link map shows that a tie exists; it cannot show magnitude or direction honestly. Chart guidance treats Sankey as the right substitute for chord diagrams when flow is linear. [13] Flow and Sankey diagrams are a common analyst tool for tracing transaction chains in leak data such as the FinCEN Files. [14]
- **Rules**: at most 20 nodes per diagram, one diagram per topic or per recipient; sort each column by total; label bands directly with name and amount, no legend; show only relationships with a sourced amount and say how many were left out; unverified amounts drawn as an outlined band with no fill; estimates carry "about"; never sum across overlapping reports without saying so. Colour: all bands neutral, the selected path in the accent.
- **Phone**: becomes a ranked list of flows ("From, To, Amount") with a proportional bar.
- **Risk**: band width implies precision. Put the range and the source next to every figure.

### 2.2 Dated timeline with tracks: second priority

- **What**: a vertical timeline (time runs down the page, which suits phones), with two or three parallel tracks: `Money & Deals`, `Government Decisions`, `Statements & Filings`. Each event is one dated line that links to its check. Relationships already carry `date`; `data/timeline.json` exists.
- **When it beats the network**: when order is the argument. One theme in our data is "enforcement case dropped near a money flow"; that is a claim about sequence, and neither a map nor a matrix can show before and after. A timeline also shows gaps and clustering in time.
- **Rules**: true time scale within a track when dates cluster matters, otherwise an ordered list with the dates printed (guidance: sequence often matters more than exact spacing) [15]; cap a default view at about 30 to 50 events and filter by topic or name for the rest [15]; print full dates in one format; mark approximate dates with "about"; draw a thin connector only between events the checks explicitly link, never to imply causation. Brehmer et al.'s timeline design space (263 timelines surveyed) is the reference for choosing linear versus other forms; linear chronological is the right one for this audience. [16]
- **Placement**: a timeline per profile and per topic is more useful than one site-wide timeline.

### 2.3 Small multiples of the matrix by topic: third priority

- **What**: the same 40 names in the same order, drawn as 13 small matrices (about 160px each), one per topic, each showing only that topic's relationships. Click one to open it at full size.
- **When it beats the network**: comparison. "Which names recur across crypto, real estate and foreign funds?" Thirteen node-link maps would each lay out differently and could not be compared; matrices with a fixed order can, because position is stable. This is Bertin's and Tufte's small-multiples argument applied to adjacency. [6]
- **Rules**: identical order and scale in every panel; no labels inside the small panels (labels appear on the shared axis of the first row and on hover); sentence title per panel with the count of pairs.

### 2.4 Considered and not recommended for a public audience

- **Chord diagram**: readability collapses past roughly 10 to 12 nodes, direction is hard to see, and attention goes to the meaningless centre of the circle. [13][17] It also looks like a stock "data art" piece.
- **Hive plot** (Krzywinski 2011): rule-based and comparable across networks, but needs explaining before it can be read. [18] Analyst tool, not reader tool.
- **BioFabric** (Longabaugh 2012): nodes as horizontal lines, edges as vertical lines, scales to thousands of nodes without hairballs, but unfamiliar to general readers. [19]
- **Arc diagram**: good only when the order of nodes means something and the node count is small; it hides clusters. [20] A defensible small use: on a profile page, one name's connections along a time-ordered line.
- **NodeTrix** (matrices embedded in the map for dense groups): the right idea for our "globally sparse, locally dense" data, and a possible later upgrade of the map itself (collapse the family or the WLF cluster into a mini-matrix), but costly to build and to explain. [4]

### 2.5 Published references in journalism and investigations

- Bostock's "Les Misérables Co-occurrence" (2012): the canonical web matrix, with the Order control. [7]
- New York Times, "Trump and His Associates Had More Than 100 Contacts With Russians" (January 2019): a catalogue graphic of named people and their documented contacts, a list-and-grid treatment rather than a node-link map. [21]
- ICIJ Offshore Leaks database: entity pages show connections as a table (role, jurisdiction, status, data source) and decline to draw a graph when it would be too dense. [5]
- New York Times, "Connecting the Dots Behind the 2016 Presidential Candidates" (2015), a grid of campaigns and administrations with links **(unconfirmed, from memory)**.

---

## 3. Ten editorial patterns for the reading pages

Each is an instruction. Reasons and sources follow each one.

1. **Lead with the verdict, then layer the nuance.** At the top of every check: the claim in one sentence, the verdict word, and a two to four sentence finding. Everything else follows. PolitiFact's founder describes the same "layered approach": rating first, analysis after [22]; Full Fact pairs "what was claimed" with "our verdict" at the head of each check **(labels unconfirmed by search)** [23]. Build it as plain typeset text on the page background with a 3px rule in the verdict colour at the left, not a tinted rounded card.
2. **Make the verdict a word, not a badge.** Set the verdict in the heading serif at about 1.25 times body size, in the verdict colour, followed by the confidence as ordinary text ("Mostly accurate. Confidence: medium."). No pill, no icon-in-circle, no meter graphic. The scale itself is explained once on the methodology page and linked from every verdict.
3. **Break evidence into numbered sub-claims, each with its own finding and sources.** One row per sub-claim: the statement, a one-word status, the finding in one or two sentences with corrected figures, then its sources inline. This mirrors our data (`sub_claims`) and Bellingcat's step-by-step evidence trail, where each data point is shown with its link or image so a reader can repeat the work. [24] Use real ordered-list numbering in the text face, not large decorative numerals.
4. **Cite like a newsroom: publisher, title, date, link, every time.** End every check with "Sources", a numbered list: Publisher, "Title", date, linked. PolitiFact publishes a source list with every item and links to freely available versions. [22] In running text, cite by naming the publisher in the sentence and linking the specific words ("according to the SEC's filing of 4 March 2025"), with an optional superscript number that jumps to the list. Never a bare "source" link.
5. **Put corrections and other-side statements in fixed, visible places.** "What the record corrects" directly after the finding; "Denials and context" before the sources, same weight as the evidence, not small print. Site-level corrections: dated, plain-language note saying what changed and why, placed at the top for significant changes and at the foot otherwise; publish a corrections policy (only 16.5% of 7,000 sites surveyed had one). [25]
6. **Dateline everything and show who checked it.** Under the title, one line: "Checked 14 November 2026. Updated 15 November 2026." in the UI sans, muted. PolitiFact shows writer and editor on each item. [22] If there are no named authors, state the method instead ("Researched from public filings and news reports. Method") and link to it.
7. **Treat figures as content.** Money and counts in body text use proportional lining figures; anything in a column, table, timeline or panel uses tabular lining figures, right-aligned. Round for reading ("about $2 billion"), give the exact figure and its source on first mention or in the evidence row. One date format site-wide ("4 March 2025"). One style for ranges and units. Where our figure corrects the original claim, print both: "Claimed: $600 million. Record: about $350 million."
8. **One callout type, used rarely.** A "Key figure" or "What this means" aside: a 2px top rule, a short label in sentence or Title Case in the body sans, then text in the body face. Maximum one per screen of reading. No tinted boxes with icons, no box inside a box. The methodology note is the same component. The Markup labels methodology pieces "Show Your Work" next to the headline, which makes method part of the editorial hierarchy rather than a footer. [26]
9. **Links look like links and nothing else does.** Body links: ink-coloured or accent-coloured text with a 1px underline offset about 0.15em, darker underline on hover, visited state kept. No colour-only links in body text, no underline on things that are not links, no buttons that are really links. Navigation and list titles may drop the underline but gain it on hover and focus.
10. **A centred reading column and a strict hierarchy of four levels.** One text column of 60 to 72 characters (Butterick: 45 to 90, body 15 to 25px on the web, line spacing 120 to 145%) [27]; charts, tables and the matrix may run wider than the text, centred on the same axis, which is ProPublica's article framework: a centred text block with supporting elements placed at centre or edges. [28] Levels: page title (serif), section heading (serif, smaller), label (sans, medium weight), body. If a fifth level seems necessary, restructure the content.

Supporting patterns worth keeping in view:

- **Entity cards as a definition list, not a tile.** Name, one-line role, then label and value pairs (Type, First documented, Connections, Checks), then the connections as a table with role and source, as ICIJ does. [5] OpenSecrets profiles lead with summary totals broken down by category and offer the data as a download. [29]
- **Standing disclaimer in the reading flow**, once per page, in ordinary muted text: inclusion does not imply wrongdoing; everyone named denies it. [5]
- **Grey is the main colour of every chart.** Colour is reserved for the thing the sentence title is about. [30]

---

## 4. Type and colour recommendation

### 4.1 What the reference publications do

- ProPublica: a serif (Tiempos Text and Tiempos Headline) for editorial text, a sans (Graphik) for interface, navigation and non-editorial contexts; its guide advises against light weights and uses bold or black for headlines. [31]
- New York Times: a serif for headlines (Cheltenham), a serif for text (Imperial), a sans (Franklin) for captions, metadata and navigation. Sources differ on details. [32]
- Financial Times: Financier (serif) for display, Metric (sans) for UI and data, one signature accent on a tinted paper background (third-party description of the Origami system). [33]

The common structure: **a text serif for the argument, one sans for everything that is interface or data, two to three weights each, one accent.** That structure is what reads as "publication" rather than "app".

### 4.2 Families (Google Fonts) and roles

Recommended pair, chosen because the two are a designed superfamily and both have complete OpenType figure sets:

| Role | Family | Settings |
|---|---|---|
| Page titles, section headings, verdict word | **Source Serif 4** (variable, optical size axis) | Weight 600, `font-optical-sizing: auto`, tracking -0.01em above 28px, line height 1.15 to 1.25 |
| Body text of checks and profiles | **Source Serif 4** | Weight 400, 18px desktop and 17px phone, line height 1.55, measure 60 to 72 characters, italic for titles of works only |
| Interface, labels, navigation, tables, matrix and map labels, captions, datelines | **Source Sans 3** (variable) | Weights 400 and 600 only, 13 to 15px, line height 1.35 |

- Source Serif 4 is already loaded by the site for headings, so this extends an existing choice rather than adding a "random serif". It was drawn as a text face with optical sizes, is described in news-design guides as a professional free option for newspaper body text, and has broad language support. [34]
- Source Sans 3 replaces Atkinson Hyperlegible Next for interface and data. Reason: it was designed to pair with Source Serif and it ships tabular, proportional, lining and old-style figures plus a slashed zero **(feature list from memory; verify in the browser with the test below)**. If the team prefers to keep Atkinson Hyperlegible Next, confirm that `tnum` works in it before relying on it for tables.
- **Alternative pair** if more character is wanted: **Newsreader** (Production Type, made for on-screen reading, optical size axis) [35] for headings and body, with **Libre Franklin** for interface (the same lineage as the Franklin used for news metadata) **(Libre Franklin's tabular figures unconfirmed; test first)**.
- **Do not use**: Inter (reported on 13% of admired gallery sites and 24% of Framer sites, and named in almost every list of generated-design tells) [36], Playfair Display, Space Grotesk, any monospace for labels or dates.
- Load at most two families. Request only the weights used. Serve italics only for the body serif.

### 4.3 Figure settings

```css
body            { font-variant-numeric: lining-nums proportional-nums; }
table, .data, .panel-meta, .timeline-date, .matrix-count
                { font-variant-numeric: lining-nums tabular-nums; }
```

- Lining figures everywhere: old-style figures read as bookish and sit badly next to capitals, dollar signs and dates in fact-check prose.
- Tabular figures wherever numbers stack vertically, right-aligned, with units in the column header.
- Test: render `1111` and `8888` in a table cell. If the widths differ, `tnum` is not active in that font.
- Typographic punctuation: real apostrophes and quotation marks, a thin or non-breaking space in "$2 billion", en dash for ranges, non-breaking space between day and month.

### 4.4 Type scale

A short scale with real jumps: 13 (labels, captions), 15 (interface), 18 (body), 22 (section heading), 30 (page title on phone), 40 (page title on desktop). Six sizes. No size in between.

### 4.5 Colour approach

Principle: **neutral ink on a neutral ground, one accent, and semantic colour only for verdicts.** Datawrapper's guidance: grey for everything that is not the point, colour reserved for the most important data, and if you need more than about seven colours change the chart. [30]

- **Neutrals**: a cool-neutral grey scale of six steps (page, raised surface, hairline, muted text, secondary text, ink). No beige, no cream, no warm paper tint (the brief bans it, and the FT's tint is theirs).
- **Accent**: one deep, slightly desaturated blue used for links, the selected state, and the matrix fill ramp. Blue is the most neutral choice politically in a US context only if red is absent; do not introduce a party red or blue pairing anywhere.
- **Verdict colours**: four muted hues used only on the verdict word and its 3px rule: confirmed and mostly accurate (a green-teal), partly accurate (an ochre), misleading or false (a brick red), unverified (neutral grey, with the hollow mark). Always paired with the word.
- **Relationship types on the map**: at most four colour groups (for example Money & Ownership, Government & Legal, Commercial, Family & Personal), the rest by line style. Nine hues is beyond what readers can hold.
- **Starting values** (check each pair for WCAG AA contrast before use; these are proposals, not validated tokens):

| Token | Light | Dark |
|---|---|---|
| Page | `#FFFFFF` | `#111418` |
| Raised surface | `#F5F6F7` | `#191D22` |
| Hairline | `#DADDE1` | `#2C3238` |
| Muted text | `#646B74` | `#98A0AA` |
| Ink | `#14181D` | `#E7EAEE` |
| Accent | `#1F4E8C` | `#8DB4EC` |
| Matrix steps 1, 2, 3 | `#A9C1E2`, `#5C87C4`, `#1F4E8C` | `#2F4A70`, `#5A86C4`, `#A9CBF5` |

- **Dark theme**: not pure black, not pure white text; the accent is lightened and desaturated rather than reused; the matrix ramp runs dark to bright so "more" is always the stronger contrast against the page; tints become lighter-than-page steps rather than darker.
- No gradients, no glows, no translucent blurred panels, no shadows beyond a single 1px hairline or one soft shadow on floating elements (tooltip, sheet).

---

## 5. Checklist: generated-looking tells to remove

Critics' core diagnosis: generated design is "fluent" rather than ugly, "design with no author", the statistical mean of the web (Tailwind and component-library defaults). [36][37] The cure is evidence of decisions specific to this content. One caution from the same sources: the usual failure of anti-slop work is swapping one default look for another. [36]

Layout and structure
- [ ] Centred hero with a big headline, a subline and two buttons. Replace with the content itself: the latest checks, a search field, the numbers.
- [ ] A row of exactly three or four equal cards, each with icon, heading and two lines. Use a list or table when items are comparable; vary the layout by content.
- [ ] Cards inside cards, or every block wrapped in a bordered rounded box. Use spacing, rules and type to group.
- [ ] Stat tiles ("94 Checks", "1,345 Names") as big-number cards. Put the numbers in one sentence.
- [ ] Small label above every heading (eyebrow), or a badge above the headline.
- [ ] Section counters 01, 02, 03.
- [ ] Everything centre-aligned. Reading pages are left-aligned on a centred column.
- [ ] Identical vertical rhythm for every section, so nothing is more important than anything else.

Type
- [ ] Inter, or any system default, as the only face.
- [ ] Monospace or uppercase tracked labels for dates, tags or section names.
- [ ] Gradient-filled headline text.
- [ ] Too many sizes and weights; light weights for body; headings in a display serif chosen for "elegance".
- [ ] Straight quotes, double hyphens, default figure styles in tables.

Colour and surface
- [ ] Purple or indigo to blue gradients, lavender accents. [36]
- [ ] Glow, blurred orbs, glass panels, decorative particles or grid backgrounds.
- [ ] Soft large-radius shadows on everything; 12 to 16px radius everywhere. Use 2 to 4px or none.
- [ ] Tinted callout boxes with a coloured left border and an icon, used more than once per screen.
- [ ] A different bright colour per category. Use grey plus one accent.
- [ ] Dark theme that is pure black with neon accents.

Components
- [ ] Clusters of pills and chips for tags, types and filters. Use plain text lists, a select, or a segmented control with at most four options.
- [ ] Generic line icons (Lucide style) beside every heading and list item. [38] Remove icons that do not replace a word.
- [ ] Emoji as icons or bullets.
- [ ] Buttons with arrows and sparkle marks; "Get Started", "Explore", "Learn More" labels. Name the action: "Open the Map", "Read the Check".
- [ ] One weak hover effect (lift and shadow) applied to everything. [38]
- [ ] Skeleton shimmer and entrance animations on scroll.

Copy
- [ ] Marketing voice: "Uncover", "Dive in", "Powerful", "Seamless", "Your guide to".
- [ ] Triads everywhere ("clear, fast, reliable"); "It's not X, it's Y" constructions.
- [ ] Em dashes in interface text; exclamation marks; rhetorical questions as headings.
- [ ] Headings that describe the component ("Key Insights", "Overview") rather than the content ("What the filings show").
- [ ] Vague numbers without date and source.

Charts and map
- [ ] Rainbow categorical palettes; legends in boxes far from the marks.
- [ ] Chart titles that name the chart type ("Network Graph") rather than state the content.
- [ ] Glowing nodes, animated edges, physics that never settles.
- [ ] Tooltips styled as dark rounded cards with many rows.

Signs of authorship to add
- [ ] A dated methodology page, a corrections page, and source lists with real publication dates.
- [ ] Specific wording that only this project could have written (the selection rule under the matrix, the standing note).
- [ ] Consistent small decisions: one date format, one figure style, one link style, one rule weight.
- [ ] Uneven but motivated layout: the widest element on a page is the one that matters most.

---

## Sources

Matrix and network research
1. Ghoniem, Fekete, Castagliola, "A Comparison of the Readability of Graphs Using Node-Link and Matrix-Based Representations", IEEE InfoVis 2004. https://bibbase.org/network/publication/ghoniem-fekete-castagliola-acomparisonofthereadabilityofgraphsusingnodelinkandmatrixbasedrepresentations-2004
2. Journal version, Information Visualization 4(2), 2005, pp. 114 to 135. https://dblp.org/rec/journals/ivs/GhoniemFC05 ; overview in Fekete, "Visualization of Graphs": https://aviz.fr/~fekete/Visualization%20of%20Graphs.pdf
3. Okoe, Jianu, Kobourov, "Node-link or Adjacency Matrices: Old Question, New Insights", IEEE TVCG 25(10), 2019. https://smsf.cs.arizona.edu/~kobourov/NL-AM-TVCG18.pdf ; preprint https://arxiv.org/pdf/1709.00293
4. Henry, Fekete, McGuffin, "NodeTrix: A Hybrid Visualization of Social Networks", IEEE TVCG 13(6), 2007. https://arxiv.org/abs/0705.0599
5. ICIJ Offshore Leaks Database, entity pages and guidance. https://offshoreleaks.icij.org/nodes/289141 ; https://www.icij.org/inside-icij/2018/01/how-to-explore-networks-and-entity-metadata-in-the-offshore-leaks-database/
6. Perin, Dragicevic, Fekete, "Jacques Bertin's Legacy in Information Visualization and the Reorderable Matrix". https://hal-universite-paris-saclay.archives-ouvertes.fr/LISN/hal-01786606 ; Bertifier bibliography https://aviz.fr/Bertifier/Bibliography ; TU Graz survey of reorderable matrices (2025) https://courses.isds.tugraz.at/ivis/surveys/ss2025/ivis-ss2025-g2-survey-reorderable-matrices.pdf
7. Bostock, "Les Misérables Co-occurrence" matrix (copies and ports): https://gist.github.com/vasturiano/7c5f24ef7d4237f7eb33f17e59a6976e ; Protovis matrix example https://mbostock.github.io/protovis/ex/matrix.html ; Heer, Bostock, Ogievetsky, "A Tour through the Visualization Zoo" https://idl.uw.edu/papers/visualization-zoo
8. Behrisch, Bach, Henry Riche, Schreck, Fekete, "Matrix Reordering Methods for Table and Network Visualization", Computer Graphics Forum 35(3), 2016. https://hal.archives-ouvertes.fr/hal-01326759
9. Fekete, reorder.js (optimal leaf ordering, barycenter and others). https://github.com/jdfekete/reorder.js/wiki/API-Reference ; https://www.npmjs.com/package/reorder.js
10. "Evaluating Encodings for Bivariate Edges in Adjacency Matrices" (cell size set by label legibility; row and column highlighting). https://arxiv.org/pdf/2604.14791
11. TU Wien temporal adjacency matrix tool (crosshair on hover). https://repositum.tuwien.at/bitstream/20.500.12708/203904/2/graphical-abstract-217652.pdf ; Pavlopoulos et al., Nature Methods 2012, on reordering matrices https://www.nature.com/articles/nmeth.1862.pdf
12. Hoffswell, Li, Liu, "Techniques for Flexible Responsive Visualization Design", CHI 2020. https://research.adobe.com/publication/techniques-for-flexible-responsive-visualization-design ; Horak et al., "Responsive Visualization Design for Mobile Devices" https://www.tableau.com/research/publications/responsive-visualization-design-mobile-devices
13. Chord diagram limits and Sankey as substitute (vendor guides; treat thresholds as rules of thumb). https://www.domo.com/learn/charts/arc-diagrams ; https://dojo.amcharts.com/chart-types/charts/chord-diagram/
14. FinCEN Files flow and Sankey analysis (third-party analyst post). https://bpostance.github.io/posts/finCEN
15. Timeline guidance: Flourish https://flourish.studio/visualisations/timeline-maker/ ; Fat Pencil Studio https://www.fatpencilstudio.com/blog/timeline-tips
16. Brehmer, Lee, Bach, Henry Riche, Munzner, "Timelines Revisited: A Design Space and Considerations for Expressive Storytelling". https://aviz.fr/~bbach/timelines/Brehmer2016timelines.pdf
17. "CHORDination: Evaluating Visual Design Choices in Chord Diagrams for Network Data". https://arxiv.org/pdf/2408.02268
18. Krzywinski et al., "Hive Plots: Rational Approach to Visualizing Networks", 2011. https://mk.bcgsc.ca/linnet
19. Longabaugh, "Combing the hairball with BioFabric", BMC Bioinformatics 2012. https://link.springer.com/content/pdf/10.1186/1471-2105-13-275.pdf
20. Wattenberg, "Arc Diagrams: Visualizing Structure in Strings", 2002. https://research.ibm.com/publications/arc-diagrams-visualizing-structure-in-strings ; EU data visualisation guide on networks https://data.europa.eu/apps/data-visualisation-guide/visualising-networks ; Munzner network slides https://cs.ubc.ca/~tmm/talks/vad/VAD-networks.pdf
21. Coverage of the NYT contacts graphic (January 2019). https://archive.kyivpost.com/world/new-york-times-trump-his-associates-had-over-100-contacts-with-russians-before-inauguration.html

Editorial and fact-check design
22. PolitiFact: principles and source lists https://politifact.com/article/2013/may/31/principles-politifact/ ; 2014 redesign https://politifact.com/article/2014/sep/16/welcome-new-look-politifact-2014/ ; Adair on the layered approach https://rjionline.org/news/world-of-trade-offs-what-journalists-think-of-rating-scales-in-fact-checking/ ; https://reporterslab.org/2022/08/22/politifact-at-15-lessons-about-the-truth-o-meter-innovation-and-pirates/
23. Full Fact, "How we fact check" and FAQ. https://fullfact.org/how-we-fact-check/ ; https://www.fullfact.org/about/frequently-asked-questions
24. Bellingcat method and evidence presentation. https://reutersinstitute.politics.ox.ac.uk/news/how-bellingcat-collects-verifies-and-archives-digital-evidence-war-crimes-ukraine ; https://www.sg.uu.nl/artikelen/2019/05/finding-truth-post-truth-world
25. Corrections practice. https://newscollab.org/2020/05/04/fixing-our-mistakes-in-public/ ; https://trustingnews.org/be-loud-about-mistakes-and-how-you-correct-them/ ; https://ethics.sjmc.wisc.edu/2024/12/13/correcting-the-record-experts-weigh-in-on-ethical-news-corrections
26. The Markup. https://v7.robweychert.com/projects/the-markup/ ; https://themarkup.org/2023/09/14/zine-how-we-illustrate-tech-and-ai-at-the-markup
27. Butterick, Practical Typography: line length and key rules. https://practicaltypography.com/line-length.html ; https://practicaltypography.com/summary-of-key-rules.html
28. ProPublica article layout framework and 2021 article redesign. https://www.propublica.org/article/inside-propublicas-article-layout-framework ; https://www.propublica.org/article/2021-article-page-redesign ; https://projects.robweychert.com/propublica
29. OpenSecrets profiles as described in Bellingcat's toolkit. https://bellingcat.gitbook.io/toolkit/more/all-tools/opensecrets
30. Datawrapper on colour. https://www.datawrapper.de/blog/colors ; https://www.datawrapper.de/blog/10-ways-to-use-fewer-colors-in-your-data-visualizations ; https://www.datawrapper.de/blog/emphasize-with-color-in-data-visualizations
31. ProPublica design guide, typography and colours (not fetchable from this session; summarised from search results). https://guides.propublica.org/design/typography ; https://guides.propublica.org/design/colors ; 2026 redesign note https://www.niemanlab.org/2026/05/propublica-gets-a-new-look-built-to-work-across-platforms/
32. New York Times typefaces. https://www.fontsinuse.com/uses/3907/the-new-york-times-article-redesign-may-2013 ; https://rogerblack.com/blog/post/type_for_the_times
33. Financial Times Origami design system. https://medium.com/ft-product-technology/ft-design-basics-1-why-we-finally-built-a-ui-kit-850e98b127bf ; https://medium.com/ft-product-technology/origami-and-177-ft-sites-89c95f54e0b2
34. Free fonts for news and editorial sites (secondary source). https://fontalternatives.com/best-fonts-for/news-editorial/
35. Production Type on Newsreader. https://www.productiontype.com/news/new_fonts_from_production_type_newsreader

Generated-looking design
36. "Why Your AI Keeps Building the Same Purple Gradient Website" https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website ; Muzli font study https://muz.li/blog/are-we-out-of-new-things/ ; "Why every AI-built website looks the same" https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p
37. Kosta Canatselis, "Spot the slop: a UI designer's guide to fixing AI defaults" https://world.hey.com/kostac/spot-the-slop-a-ui-designer-s-guide-to-fixing-ai-defaults-4c448c9c ; "AI design isn't ugly, it's fluent" https://uxdesign.cc/ai-design-isnt-ugly-it-s-fluent-and-thats-the-problem-131b2f4eb78c
38. "How to Keep Your Website From Looking Like Every Other Vibe Coded Website" https://codemyspec.com/blog/vibe-coded-websites-look-the-same ; "The Built with AI Tell: 12 Signals" (not fetchable here) https://www.utsubo.com/blog/built-with-ai-trust-signals-2026 ; anti-pattern lists https://www.mintlify.com/pbakaus/impeccable/concepts/anti-patterns

Caveats on sources: most items under "Generated-looking design" and several chart-guidance links are blogs or vendor pages, so treat their numbers as rules of thumb. Items marked **(unconfirmed)** in the text should be checked before being quoted publicly; none of them affects the build instructions.
