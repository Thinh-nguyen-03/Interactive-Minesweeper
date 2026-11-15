# Inspiration: investigative-journalism and public-accountability tools

Design research for the redesign of the connections site (about 94 fact-checks, 1,300 people and organisations, 2,900 relationships; reading pages, profiles, network map, connection matrix). Brief: clean, sleek, intuitive, "a mix of intelligence and investigative analysis", must not look machine-generated.

## How to read this file

- Research method: about 32 web searches. Direct page fetches were blocked in this session (littlesis.org, icij.org, openownership.org, fathom.info, storybench.org and cambridge-intelligence.com all failed to resolve), so nothing here comes from looking at a live page or a screenshot.
- Each claim is marked by where it comes from:
  - **[S]** stated in a search result from the tool's own docs, help pages, a design write-up or press coverage. The link is in that tool's Sources line.
  - **[R]** recalled from prior familiarity with the interface, not confirmed in this session. Treat as a lead and check against the live site before copying a detail exactly.
- Typography and colour notes are almost all [R]. The one confirmed typeface is Forensic Architecture's (GT Zirkon).
- Not covered well: Follow the Money (ftm.eu), Washington Post and FT graphics, and the Storybench interview on the WSJ graphic (found, but its design detail was not retrievable). Bellingcat and Global Witness are covered only for how they present evidence.

---

## Part 1. Tool by tool

### 1. LittleSis and Oligrapher (Public Accountability Initiative)

The closest structural match to our site: a people-and-organisations database with profile pages, plus a separate curated map tool.

| Aspect | What it does |
|---|---|
| Default view | Database side: search box and featured maps, never a whole-database graph [R]. Oligrapher maps are authored one at a time and open on a hand-arranged layout with a title, author and date [S]. What is hidden: everything the author did not place on the map. |
| Profile page | Header with name, one-line description and type tags; tabs for Relationships, Interlocks, Giving, Political and Data [S]. Interlocks lists other organisations that share people with this one, sorted by number of shared people [S]. Giving lists recipients ordered by total amount [S]. The Data tab filters by relationship category, entity type, industry and interlocks [S]. A side column carries "Source Links" with a document count and a "see all" link [S]. |
| Relationship labels and sources | Twelve relationship categories (Position, Lobbying, Hierarchy, Donation/Grant, Membership, Ownership, Family, Education, Service/Transaction, Generic and others) [S]. Relationships on the profile are grouped under category headings, with the role title printed under the other party's name [S]. Each relationship has its own page. A relationship cannot be saved without a source: an existing document or a new URL [S]. |
| Avoiding the hairball | Maps are curated by a person, not generated. Layout is force-directed or preset and then hand-adjusted [S]. One command adds only the interlocks between two chosen entities [S]. Annotations walk the viewer through the map in an ordered sequence, each step highlighting part of the graph [S]. |
| Uncertainty and allegations | Mostly handled by sourcing every edge and by labelling current versus past. Past relationships are drawn as dashed lines and listed in grey [R]. A known weakness: relationships are counted, not weighted by importance [S]. |
| Typography and colour | White canvas, circular nodes with portrait photos, grey curved edges with the label set along the curve, a narrative column on the right [R]. The database pages look like a dated wiki: small sans-serif, link-blue, little hierarchy [R]. |
| Borrow | The annotated map: a numbered story column beside the graph where each step highlights a few nodes and fades the rest. |
| Avoid | The profile page's flat wall of grouped links with no summary of what matters. Counting relationships without ranking them. |

Sources: [Introducing Oligrapher](https://littlesis.org/news/introducing-oligrapher-power-mapping-on-littlesis) · [Oligrapher for beginners](https://littlesis.org/news/littlesiss-oligrapher-for-beginners) · [Oligrapher updates](https://littlesis.org/news/oligrapher-updates-home-page-interlocks-and-more) · [Oligrapher repo listing](https://awesome.ecosyste.ms/projects/github.com%2Fpublic-accountability%2Foligrapher) · [Influence Mapping on Oligrapher](https://influencemapping.github.io/blog/2016/02/08/oligrapher.html) · [Relationship page help](https://littlesis.org/help/relationships) · [Entity help](https://littlesis.org/help/entities) · [Adding a relationship](https://littlesis.org/help/new_relationship) · [Bellingcat toolkit entry](https://bellingcat.gitbook.io/toolkit/more/all-tools/littlesis)

### 2. ICIJ Offshore Leaks Database

| Aspect | What it does |
|---|---|
| Default view | A search box, country and jurisdiction filters, and a filter for which leak a record came from [S]. No graph until a record is opened. A separate curated "Power Players" gallery presents the politicians, each with an illustrated portrait and a short story [R]. |
| Entity page | Each record is a "node" page: individual, company, address or intermediary [S]. It shows the node type, which leak the data came from, a small graph of immediate connections, and below it tables of connections with role and dates such as incorporation or appointment [S]. More detail appears on hovering the icons or scrolling down [S]. |
| Relationship labels and sources | Roles come straight from the source records ("shareholder of", "intermediary of", "registered address"). Every row carries a "data from" label naming the leak [R]. |
| Avoiding the hairball | The graph starts as an ego network of one node. Double-clicking a neighbour expands it [S]. When a node has too many connections the graph is withheld and the page says so: "too many connections ... to display a useful graph" [S]. Node types have fixed colours [R]. |
| Uncertainty and allegations | A standing disclaimer on every page: there are legitimate uses for offshore companies, and inclusion "is not intended to suggest or imply" illegal or improper conduct [S]. A request to cite ICIJ when reusing data [S]. |
| Typography and colour | Dark header with a single red accent, white content area, plain sans-serif tables. Reads as a registry, not a magazine [R]. |
| Borrow | The honest fallback: when a node is too connected to draw usefully, say so and show the table instead. |
| Avoid | Raw source field names as labels, and a graph with no explanation of what the reader is meant to see. |

Sources: [Node schema page](https://offshoreleaks.icij.org/schema/oldb/node) · [Disclaimer](https://offshoreleaks.icij.org/pages/disclaimer) · [How to use](https://offshoreleaks.icij.org/pages/howtouse) · [FAQ](https://offshoreleaks.icij.org/pages/faq) · [How to explore networks and entity metadata](https://www.icij.org/inside-icij/2018/01/how-to-explore-networks-and-entity-metadata-in-the-offshore-leaks-database/) · [Investigating companies in the database](https://www.icij.org/inside-icij/2018/01/investigate-companies-found-offshore-leaks-database/) · [Inside story of the database](https://www.icij.org/investigations/pandora-papers/the-inside-story-of-how-the-offshore-leaks-database-became-a-go-to-resource-on-offshore-finance/) · [Example node with the too-many-connections message](https://offshoreleaks.icij.org/nodes/239016)

### 3. OpenSanctions

The best model for a credible profile page without any graph at all.

| Aspect | What it does |
|---|---|
| Default view | Search. Dataset pages show "Last processed" and "Last change" timestamps [S]. No network view on the public site [R]. |
| Entity page | A two-column fact table (property, value), topic tags near the name such as "Politician" or "Sanctioned entity", then separate tables for each relationship type (family, associates, directorships, ownership) with role and start and end dates, then a "Data sources" section describing each contributing dataset [R]. |
| Relationship labels and sources | Every property value carries provenance [S]. A statements view lists each single assertion with columns Property, Value, Language, Source dataset, Source ID and First seen [S]. On the profile, values carry small numbered references that resolve to the datasets listed at the foot [R]. |
| Avoiding the hairball | Does not draw one. Relationships are tables grouped by type. |
| Uncertainty and allegations | Entities show `first_seen` and `last_change` dates, and the docs explain that a change date is when the system noticed the change, not when the source published it [S]. Conflicting values from different sources are shown side by side, each with its own reference [R]. |
| Typography and colour | Near-monochrome with one blue accent, generous white space, identifiers in monospace, tables with hairline rules [R]. |
| Borrow | Per-claim source markers: a small numbered reference on each fact and each relationship row that resolves to a source list on the same page. |
| Avoid | Showing every alias and raw field at equal weight; the page serves compliance staff, not readers. |

Sources: [Entity structure docs](https://www.opensanctions.org/docs/entities/) · [Statements docs](https://www.opensanctions.org/docs/statements.md) · [Metadata docs](https://www.opensanctions.org/docs/metadata/) · [Example statements page](https://www.opensanctions.org/statements/Q855/?prop=name) · [Dataset page example](https://www.opensanctions.org/datasets/sanctions/) · [FollowTheMoney 4.0 announcement](https://www.opensanctions.org/articles/2025-07-13-followthemoney)

### 4. OCCRP Aleph (and Aleph Pro, OpenAleph)

| Aspect | What it does |
|---|---|
| Default view | A search bar over datasets. Network diagrams are not a default: an investigator creates one inside an investigation and adds entities deliberately [S]. |
| Entity page | An information pane with key properties, plus tabs with counts for each kind of linked record (documents, directorships, ownership, mentions, similar entities) [R]. Source documents can be opened and downloaded [S]. |
| Relationship labels and sources | Built on FollowTheMoney, where a relationship (ownership, directorship, payment) is itself a record with its own properties, dates and source [S]. Results are labelled with the dataset they came from [S]. |
| Avoiding the hairball | Diagrams start empty and grow by adding or expanding nodes. Clicking a node opens its details in a sidebar; zoom, pan and image export are standard [S]. Nodes are coloured by entity type and there is a table mode for the same data [R]. |
| Uncertainty and allegations | Cross-referencing returns candidate matches with a similarity score and leaves the decision to the investigator [S]. Automatically extracted name "mentions" are kept separate from confirmed entities [S]. |
| Typography and colour | Dense tool UI built on the Blueprint component kit: system sans-serif, grey panels, blue accent, small type [R]. Legacy Aleph is no longer developed; Aleph Pro, a rewrite, was released in December 2025 [S]. |
| Borrow | Tabs with counts on the profile ("Companies 12 · Family 4 · Fact-checks 7") and a graph sidebar that shows the selected node's details without leaving the map. |
| Avoid | The component-kit look. It reads as an internal admin tool and is the opposite of "designed". |

Sources: [Drawing network diagrams](https://docs.aleph.occrp.org/users/investigations/network-diagrams) · [OpenAleph network diagrams](https://openaleph.org/docs/user-guide/103/network-diagrams) · [FollowTheMoney explanation](https://docs.aleph.occrp.org/developers/explanation/followthemoney) · [Cross-referencing](https://docs.aleph.occrp.org/developers/explanation/cross-referencing) · [About Aleph](https://docs.aleph.occrp.org/about) · [GIJN Aleph Pro tutorial](https://gijn.org/stories/aleph-pro-tutorial-occrp-updated-investigative-data-platform/) · [Bellingcat toolkit entry](https://bellingcat.gitbook.io/toolkit/more/all-tools/occrp-aleph)

### 5. ProPublica news apps (Trump Town, Dollars for Docs, Nonprofit Explorer)

The best model for how a public database should be structured as a whole.

| Aspect | What it does |
|---|---|
| Default view | The "far" view: the overall picture, with ranked examples (an ordered list of agencies, companies or people) and a prominent search [S]. Trump Town is searchable by staffer name, agency or former employer [S]. |
| Entity page | The "near" view, the lowest-level page where a reader finds the one person or place they care about [S]. A Trump Town staffer page lists job and office, then sections such as "Former Positions Outside Government" and "Former Compensation Sources", lobbying records, and the ethics and financial disclosure documents themselves [S]. |
| Relationship labels and sources | Relationships are rows in labelled sections, taken from named filings. The underlying documents are linked from the page and the full data set is downloadable [S]. A separate methodology article explains how it was compiled [S]. |
| Avoiding the hairball | No network diagram. Connection is shown by shared attributes: click a former employer to see everyone in government who came from it [S]. |
| Uncertainty and allegations | Plain statements of coverage limits on the page: staffing data current to a stated date, later hires or departures may be missing [S]. The "Explore Sources" feature highlights sentences in a story; clicking shows the exact passage of the source document [S]. |
| Typography and colour | Editorial: serif headlines, sans-serif for data and labels, mostly black and white with one accent colour, generous margins [R]. |
| Borrow | Far and near as the site's skeleton, and the page-level note stating what the data covers and when it was last updated. |
| Avoid | Long undifferentiated tables once a page passes about fifty rows. |

Sources: [Design principles for news apps and graphics](https://www.propublica.org/nerds/design-principles-for-news-apps-graphics) · [ProPublica news app guides](https://www.propublica.org/nerds/propublicas-news-app-guides) · [News Apps at ProPublica (Data Journalism Handbook)](https://datajournalism.com/read/handbook/one/delivering-data/news-apps-at-pro-publica) · [How you can use Trump Town](https://www.propublica.org/article/how-you-can-use-trump-town) · [How we compiled Trump Town](https://www.propublica.org/article/how-we-compiled-trump-town) · [Trump Town awards entry](https://awards.journalists.org/entries/trump-town/) · [Explore Sources](https://www.propublica.org/nerds/explore-sources-a-new-feature-to-show-our-work) · [Poynter on Explore Sources](https://www.poynter.org/news/propublica-makes-it-easier-see-sources-behind-story)

### 6. Reuters Connected China (with Fathom Information Design, 2013)

The most carefully designed public network map of a political elite, and the one with a published design rationale.

| Aspect | What it does |
|---|---|
| Default view | Several named views (social power, institutional power, career comparison) reached from featured stories, not one all-purpose graph [S]. |
| Entity page | A person view centred on that person, with their connections arranged around them [S]. |
| Relationship labels and sources | Hand-curated relationship types; the team chose curated ties over an algorithmic "affinity" score because the curated data supported a more specific presentation [S]. |
| Avoiding the hairball | The team tried clustering the whole network and rejected it. The insight was that the stories were egocentric: one person and how they connect to others [S]. The final tool centres on one person and lets the reader choose degrees of separation; two degrees was enough [S]. Family is placed consistently to the left of the central person [S]. People are sized by political importance, using weights the editors tuned [S]. |
| Uncertainty and allegations | Rivalries are marked distinctly (red dots) from alliances [S]. |
| Typography and colour | Dark, restrained, a small palette with red reserved for meaning [R]. |
| Borrow | Fixed positions with meaning: family always in the same place relative to the centre, so layout itself tells the reader what kind of tie it is. |
| Avoid | Building so elaborate an application that it cannot be maintained. It was shelved soon after launch [S]. |

Sources: [Fathom notebook on the social view](https://fathom.info/notebook/3871/) · [Fathom retrospective](https://www.fathom.info/notebook/180306/) · [CJR, Connecting China visually](https://www.cjr.org/data_points/connecting_china_visually.php) · [Nieman Lab coverage](https://niemanlab.org/2013/04/reuters-bets-big-on-context-structure-and-dataviz-to-understand-power-in-china) · [Influence Mapping project entry](https://influencemapping.github.io/projects/connected-china)

### 7. They Rule (Josh On, Futurefarmers, 2001 and 2004)

| Aspect | What it does |
|---|---|
| Default view | An almost empty canvas. The reader picks one company and its board appears around it [R]. |
| Entity display | A company is a boardroom-table icon; directors are small figures around it. A director who sits on more boards is drawn fatter [R]. |
| Relationship labels and sources | One relationship type only (board seat). Data from company sites and SEC filings, with a dated caveat that it may no longer be accurate [S]. |
| Avoiding the hairball | Pure expand-on-demand: click a director to reveal their other boards. A "find connection" function draws the path between two chosen companies. Readers save and title their own maps [R]. |
| Uncertainty and allegations | The author frames the site as "a launch pad for investigations rather than a definitive representation of reality" [S]. |
| Typography and colour | Monochrome, pictogram figures, a deliberate hand-made tone [R]. |
| Borrow | Path finding between two entities ("how is A connected to B?") as a primary action, and encoding one quantity in the node's shape so no legend is needed. |
| Avoid | A blank start with no suggested entry points. |

Sources: [Influence Mapping project entry](https://influencemapping.github.io/projects/they-rule) · [Exposing the Invisible entry](https://exposingtheinvisible.org/en/databases/they-rule-data-visualisations-american-corporations/) · [Rhizome, So Few Serve on So Many (Boards)](https://old.rhizome.org/editorial/2003/feb/26/so-few-serve-on-so-many-boards) · [Boing Boing 2004](https://boingboing.net/2004/05/10/theyrule-applying-in.html/amp) · [MoMA Talk to Me](https://www.moma.org/interactives/exhibitions/2011/talktome/objects/146226/)

### 8. Open Ownership: Beneficial Ownership Visualisation System (BOVS) and Register

Not a journalism product but the only published rule book for drawing people-and-company diagrams honestly.

| Aspect | What it does |
|---|---|
| Default view | A diagram with a declared focus (one entity) and a declared depth; if depth is limited the diagram must say so [S]. |
| Relationship labels and sources | Arrows run from the party holding the interest to the thing they hold it in [S]. Ownership and control each get one colour used consistently (purple and cyan in their own tool) [S]. Solid line for direct, dotted for indirect [S]. Line weight can show strength, 0 to 100 percent [S]. Diagrams flow in one direction, top to bottom or left to right [S]. |
| Avoiding the hairball | Similar parties are collapsed into a labelled stack ("3 Unknown Entities") [S]. |
| Uncertainty and allegations | The system has explicit rules for missing knowledge so a diagram never claims more than is known [S]. An unknown party uses the same icon outline with a question mark and the label "Unknown" or "Anonymous" [S]. Unknown counts say "3 or more" [S]. It separates "nature of the interest unknown" from "nature known, strength unknown" [S]. |
| Borrow | A drawn vocabulary for not knowing: a distinct line style for alleged or unverified ties, a question-mark node for an unidentified party, "or more" on counts. |
| Avoid | Strict ownership-tree layouts for our data; ours is a mixed network, not a hierarchy. |

Sources: [BOVS overview](https://openownership.org/visualisation) · [Principles](https://www.openownership.org/visualisation/principles/) · [Core rules](https://www.openownership.org/visualisation/core/) · [Unknowns](https://www.openownership.org/visualisation/core/unknowns/) · [Colour](https://www.openownership.org/visualisation/optional/colour/) · [Focus and depth](https://openownership.org/visualisation/core/focus-depth) · [What graph visualisation teaches us about beneficial ownership](https://www.openownership.org/en/blog/what-graph-visualisation-teaches-us-about-beneficial-ownership/)

### 9. OpenCorporates

| Aspect | What it does |
|---|---|
| Default view | Search across companies and officers [R]. |
| Entity page | A registry-style record: company number, status, jurisdiction, incorporation and dissolution dates, address, officers, and a link to the original register entry [S]. Inactive officers are greyed [R]. |
| Relationship labels and sources | "Obsessive about provenance": every datum says where it came from and when it was retrieved [S]. Provenance records carry a confidence value and whether a bot or a person made the match [S]. |
| Avoiding the hairball | Network maps show only a section at a time; clicking a node recentres the graph on it [S]. |
| Uncertainty and allegations | Officers with the same name are deliberately not merged across companies [S]. The page does not assert identity it cannot prove. |
| Typography and colour | Plain and dense, registry-like [R]. |
| Borrow | "Retrieved on" dates beside sources, and click-to-recentre navigation. |
| Avoid | Leaving the reader to work out whether two same-named records are the same person, with no flag at all. |

Sources: [API documentation](https://api.opencorporates.com/documentation/API-Reference) · [Bellingcat guide to OpenCorporates](https://bellingcat.com/resources/2023/08/24/following-the-money-a-beginners-guide-to-using-the-opencorporates-api) · [Bellingcat toolkit entry](https://bellingcat.gitbook.io/toolkit/more/all-tools/opencorporates) · [ODI on corporate network maps](https://theodi.org/article/power-of-open-data-reveals-global-corporate-networks) · [Maltego on officers not being merged](https://www.maltego.com/blog/investigating-companies-with-opencorporates-and-maltego/)

### 10. Sayari Graph (commercial intelligence tool)

The "intelligence" half of the brief.

| Aspect | What it does |
|---|---|
| Default view | Search, then an entity profile; the graph is a workspace the analyst adds to [S]. |
| Entity page | A summary block at the top with key identifiers and source count, a navigation pane on the left, and three fixed parts: Attributes, Relationships, Source Records [S]. |
| Relationship labels and sources | Each relationship drills down to the source record. Time-stamped copies of records allow ownership history to be rewound [S]. |
| Avoiding the hairball | Add one entity, double-click to expand its network [S]. |
| Uncertainty and allegations | Separates "seed risk" (a direct tie to an authoritative list) from "network risk" (indirect exposure), and states the number of hops to the nearest risk [S]. Risk markers are grouped by severity and appear consistently on graph nodes, profiles and relationship lists [S]. |
| Typography and colour | Dark navy, compact sans-serif, small coloured severity badges [R]. |
| Borrow | "Direct" versus "N steps away" stated in words on every profile, and the same badge appearing on the node, the list row and the profile header. |
| Avoid | Risk-score language and red warning badges. On a site about named people they read as a verdict. |

Sources: [Sayari Graph product features](https://sayari.com/?p=1256) · [Risk factors guide](https://documentation.sayari.com/api/guides/risk-factors) · [Sayari tutorial (entity profile structure)](https://sayari.notion.site/Sayari-for-Export-Controls-1848f136c68880ba8a59e6e2f53d1813) · [Sayari for Investigations](https://sayari.com/?p=21868)

### Shorter notes

**Newsroom graphics on political money networks (WSJ, NYT, Bloomberg, BuzzFeed).** The WSJ team described its task as distilling "a complex, messy dataset into a clean visualization with a clear takeaway" for 500+ potential conflicts [S]. A later WSJ analysis mapped 268 ventures, and FlowingData's note on it makes the key editorial point: direct links to the president are few, and the money reaches the same place through a convoluted path [S]. BuzzFeed released 1,500 connections as raw data; when a graph vendor drew it, the standard layout was unusable until the central node was taken out and its neighbours were given a small marker instead [S]. That fix applies directly to us, because our politician is the same kind of supernode.
Sources: [Storybench on the WSJ graphic](https://www.storybench.org/?p=5635) · [FlowingData, network of presidential business deals](https://flowingdata.com/2026/01/02/network-of-presidential-business-deals/) · [FlowingData, Trump business network spreads](https://flowingdata.com/2025/12/19/trump-business-network-spreads/) · [Cambridge Intelligence, Untangling the hairball](https://cambridge-intelligence.com/?p=11611) · [How to fix hairballs](https://cambridge-intelligence.com/how-to-fix-hairballs/) · [Bloomberg, Trump family wealth](https://www.bloomberg.com/features/2025-trump-family-presidency-wealth/) · [Graph Commons, The Trump Network](https://medium.com/graph-commons/the-trump-network-8610c92035fb)

**OCCRP Russian Asset Tracker.** A "visual-first interactive database": a gallery of people, each opening to their assets, the sanctions against them (who imposed them and from what date) and family members [S]. Known assets and claimed assets are listed separately [S]. The page states the date of its final update [S]. Design credits name individuals [S].
Sources: [Russian Asset Tracker](https://www.occrp.org/interactives/russian-asset-tracker/) · [OCCRP project page](https://www.occrp.org/en/investigations/16096-russian-asset-tracker) · [Business Insider description](https://businessinsider.nl/you-can-now-check-out-russian-oligarchs-yachts-helicopters-homes-and-more-on-this-new-asset-tracker-site/)

**Forensic Architecture.** The whole site is set in one typeface, GT Zirkon Regular and Italic, designed by Alan Woo [S]. Each investigation page states the methods used, the people involved and why the investigation was done [S]. A fixed metadata block lists incident date, location, methodologies and collaborators [R].
Sources: [Fonts in Use](https://www.fontsinuse.com/uses/29195/forensic-architecture) · [Forensic Architecture](https://forensic-architecture.org/project/) · [Wallpaper profile](https://www.wallpaper.com/architecture/forensic-architecture-architectural-analysis-hold-power-to-account)

**Bellingcat.** Articles build "the trail of evidence crumb-by-crumb" through links and annotated images, and the methodology is published as a living document [S]. Images must be credited and described accurately [S].
Sources: [Editorial standards and practices](https://bellingcat.com/about/editorial-standards-practices) · [Big Think on Bellingcat](https://bigthink.com/the-present/bellingcat/) · [Reuters Institute on Bellingcat's verification](https://reutersinstitute.politics.ox.ac.uk/news/how-bellingcat-collects-verifies-and-archives-digital-evidence-war-crimes-ukraine)

**DocumentCloud and MuckRock.** A single annotation can be embedded in a story like a block quote, showing the highlighted passage of the original document [S]. ProPublica linked 500+ annotations in 64 documents to sentences in one story [S].
Sources: [MuckRock, getting the most out of DocumentCloud](https://www.muckrock.com/news/archives/2018/sep/24/dc-features/) · [MediaShift on DocumentCloud annotations](https://mediashift.org/2011/06/reporters-bring-sources-right-into-the-story-with-documentcloud144/) · [ProPublica DocDiver](https://www.propublica.org/nerds/introducing-docdiver)

**Global Witness.** Used graph tools internally for the Trump Ocean Club investigation but published only "an interactive snapshot of some limited portions" of the data [S]. The lesson is that the public graph is an excerpt chosen by an editor.
Sources: [Global Witness on using graph technology](https://globalwitness.org/en/blog/joining-dots-property-deals-trump-ocean-club-panama-latin-american-drug-cartels-how-were-using-new-technology-expose-corrupt-networks) · [The Companies We Keep](https://globalwitness.org/en/campaigns/corruption-and-money-laundering/the-companies-we-keep/introduction/)

---

## Part 2. What the tools agree on

1. **None of the credible ones opens on the whole graph.** They open on search, a ranked list, a gallery of people, or a curated map. The full network is something the reader builds toward.
2. **The profile page, not the graph, carries the facts.** Relationships live in grouped, dated, sourced tables. The graph is for seeing shape and finding paths.
3. **Every edge has a type, a date range and a source.** LittleSis will not save an edge without a source. OpenSanctions sources every value.
4. **Ego networks beat global layouts.** Connected China, ICIJ, OpenCorporates, Sayari, Aleph and They Rule all centre on one node and expand on request.
5. **They say what they do not know.** ICIJ's disclaimer, ProPublica's coverage dates, BOVS's unknown icons, OCCRP's "known" versus "claimed", They Rule's "launch pad" framing.
6. **The designed ones are restrained.** One or two typefaces, one accent colour, colour used only to carry meaning.

---

## Part 3. The ten most transferable patterns, ranked by impact

Each is written as an instruction a front-end builder can implement.

**1. Never open the map on all 1,300 nodes. Open on a curated, labelled view.**
Default the network map to the politician's first ring plus the highest-ranked second-ring nodes, capped at about 40 visible nodes, with every visible node labelled. Offer 5 to 8 named views as chips above the canvas ("Family", "Foreign funds", "Appointed officials", "Companies"), each a saved filter with a hand-set layout. Show a count of what is hidden: "Showing 38 of 1,312. 1,274 more appear as you explore." (LittleSis, Connected China, Global Witness.)

**2. Take the politician out of the edge drawing.**
He connects to almost everything, so his edges form the hairball. Pin him as a fixed anchor (top centre or centre), do not draw his direct edges by default, and mark each directly connected node with a small ring or tick instead. Add a toggle, "Show direct links to [name]". Apply the same rule automatically to any node whose degree exceeds a threshold (start at 60). (Cambridge Intelligence on the BuzzFeed data; ICIJ's too-many-connections fallback.)

**3. Give every relationship a type, a plain-language label, a date range and at least one source, and print all four wherever the relationship appears.**
One row format used in profile lists, the map side panel and the matrix cell popover: `[Other party]  ·  [role in words, e.g. "director, 2019 to 2022"]  ·  [status]  ·  [source marker]`. Reduce relationship types to 6 to 8 families (family, position, ownership, money, contract, association) with one fixed colour and one icon each, used identically in the map legend, the profile headings and the matrix. (LittleSis categories, FollowTheMoney, OpenSanctions.)

**4. Draw certainty.**
Three evidence levels, encoded by line style and never by colour alone: documented (solid line, full-weight text), reported (dashed), alleged or disputed (dotted, with the word "alleged" or "disputed" in the label). Past relationships: same hue at 40 percent opacity with the end year. Unidentified parties: the node outline with a question mark, labelled "Unidentified". Counts that may be incomplete: "3 or more". Put the key to these in the legend and repeat it in the methodology page. (BOVS unknowns, LittleSis past ties, OCCRP known versus claimed.)

**5. Build the site on far and near.**
Far: the home page states the overall finding in one sentence with three or four real totals, then ranked lists ("Most connected people", "Largest recorded transactions", "Most fact-checked claims") and a search box that is the largest control on the page. Near: every person, organisation and fact-check has its own page with a stable URL. Search must autocomplete across all three kinds and show the kind beside each result. (ProPublica design guides.)

**6. Make the profile page a sourced record with a summary on top.**
Order: name, kind, one-sentence description written by a person; a "Why this entry matters" line of at most 30 words; a row of counts that act as anchors ("14 relationships · 6 fact-checks · 9 sources"); a small ego-network thumbnail linking to the map centred on this entity; relationships grouped by type with the row format from pattern 3, sorted current first then by date; fact-checks that mention the entity; sources; a "last reviewed" date. (OpenSanctions, Sayari, Trump Town, Aleph.)

**7. Pair the map with a story column.**
Offer guided tours: a numbered column of short paragraphs beside the map; each step highlights 3 to 10 nodes, fades the rest to 15 percent and moves the camera. Each fact-check that involves a network gets a tour. On reading pages, embed the same thing as a static figure with a caption and a link to open it live. (Oligrapher annotations, newsroom scrollytelling.)

**8. Make "how are these two connected?" a first-class action.**
A two-field control ("From" and "To") on the map and on every profile ("Find the path to..."). Show the shortest path as a horizontal chain of cards with the relationship label on each link and its source marker, then offer "Show on map". State the distance in words on profiles: "Two steps from [politician]: via [X]". (They Rule, Sayari hops, Connected China degrees.)

**9. Always provide the table behind the picture.**
Every map view and every matrix view has a "View as list" switch that shows the same nodes and edges as a sortable table, and the list is the default on phones. When a selection is too dense to draw legibly, do not draw it: show the list with a line saying why. Offer CSV download of the current view. (ICIJ, Aleph table mode, ProPublica data store.)

**10. State scope, method and dates on the page itself.**
A one-line footer on every data page: "Covers [period]. Last updated [date]. [N] sources. How we compiled this." One standing sentence near any network view: "A connection shown here is a documented link, not evidence of wrongdoing." A methodology page that defines each relationship type and each evidence level, names the editors and gives a corrections address. (ICIJ disclaimer, ProPublica coverage notes, Forensic Architecture method blocks, Bellingcat living methodology.)

---

## Part 4. The network map

### Default state

- Canvas shows the capped, curated view from pattern 1. The layout is computed once and stored, so the map looks the same on every visit. A map that reshuffles on load looks generated and stops readers building a mental picture.
- Position carries meaning. Give each relationship family a fixed sector around the anchor: family left, officials above, companies right, foreign funds below. State this in a small compass-style key. (Connected China placed family consistently to the left.)
- Size encodes one thing only, and the legend says what. Prefer an editorial importance rank or number of fact-checks over raw degree.
- Shape or icon encodes kind (person, company, public body, fund). Colour is reserved for relationship family on edges. Do not colour nodes by a clustering algorithm's output.
- All visible nodes are labelled. If a label cannot fit, the node should not be in the default view.
- Edges are thin, neutral grey and slightly curved. Colour and labels appear on hover or selection, not at rest.
- Controls, in one row: search-to-focus, the named view chips, an evidence filter (documented / reported / alleged), a time range, "View as list". Nothing else at rest.
- A visible legend that fits in four lines and can collapse.
- No physics animation after the first paint. No drifting nodes, no glow, no particles.

### Selection state

- Clicking a node makes it the centre of an ego view: it and its direct neighbours stay at full strength, everything else falls to about 12 percent opacity, and edge labels appear only on the selected node's edges.
- A side panel opens (right on desktop) with: name, kind, the one-sentence description, distance from the politician in words, relationships grouped by type using the standard row, and three actions: "Open profile", "Expand connections", "Find path to...".
- Expanding adds neighbours in batches of at most 15, ranked by importance, with "Show 15 more of 62" beneath. Never dump all neighbours at once.
- Clicking an edge selects the relationship: the panel shows its label, dates, evidence level, the quoted passage from the source and a link to the source and to any fact-check.
- A breadcrumb trail of visited nodes with a single "Reset view" control. The browser back button must work, and the URL must encode the centre node and filters so a view can be shared.
- Hover shows name and kind only. Everything else waits for a click, which keeps touch and mouse behaviour the same.

### Phone layout

- Do not ship the desktop canvas scaled down. The default phone view of the map section is the list of the current view, with a compact ego diagram on top showing the selected entity and at most 8 to 12 neighbours.
- Selection opens a bottom sheet with three heights (peek showing the name and one line, half, full). The canvas stays visible above the peek state.
- Tap selects; a second tap or the sheet's button expands. No hover-dependent information anywhere. Tap targets at least 44 px, so cap visible nodes at about 15 on a phone.
- Guided tours become a vertical swipe sequence: one step per screen, diagram on top, text beneath.
- The path finder returns the chain of cards stacked vertically; this needs no canvas at all.
- The matrix on a phone becomes "pick one entity, see its row as a list". A scrolling grid of 1,300 columns is unusable on a small screen.

### The connection matrix

- Offer it for a chosen subset (a named view or a selected group of up to about 40 entities), never for everything.
- Order rows and columns by group, then by importance, so blocks are visible. Keep the same order as the map's sectors.
- A cell shows the relationship family colour, with the evidence level as fill style (solid, hatched, outline). Clicking a cell opens the same relationship popover used on the map.
- Sticky row and column headers; highlight the full row and column on hover.

---

## Part 5. Entity profile pages, evidence and sources

### Profile page

- **Header.** Name in the display face; kind and role beneath in small caps or a quiet label; alternative spellings in one muted line. A portrait only where a properly licensed photograph exists, otherwise a plain monogram. Never a generated face or a stock silhouette.
- **Summary.** One or two sentences written by an editor, signed off with a "last reviewed" date. Then the counts row, which doubles as in-page navigation.
- **Distance line.** "Directly connected to [politician] as [role]" or "Two steps away, via [X]".
- **Relationships.** Grouped under the relationship families, each with a count. Current before past; past rows muted and carrying an end year. Amounts right-aligned in tabular figures with currency and date. Show the first 8 rows per group and a "Show all 23" control.
- **Timeline.** Where a profile has five or more dated relationships, add a simple horizontal timeline of them. Dates explain a network better than a diagram does.
- **Fact-checks.** Cards for each fact-check mentioning the entity: the claim in quotes, the verdict as a word, the date.
- **Mini map.** A static, non-interactive ego diagram that links to the full map centred here.
- **Organisations.** Add registered number, jurisdiction, status and a link to the registry entry, in a small registry block. (OpenCorporates.)

### Evidence and sources

- **Per-claim markers.** Every factual sentence and every relationship row carries a small superscript number or bracketed marker. Hover or tap shows the source title, publisher, date and the quoted passage; the marker also anchors to the full list at the foot. (OpenSanctions, ProPublica Explore Sources.)
- **Source list entry format.** Publisher, title, publication date, date accessed, source kind (court filing, company registry, official disclosure, news report, statement), link to the original, and an archive link. Kind is a text label, not an icon alone.
- **Quote the document.** Where a relationship rests on a document, show the passage as a pull-out with the document name and page number, in the style of an embedded annotation. (DocumentCloud.)
- **Separate what is established from what is claimed.** On any page that mixes them, use two headed lists, "Documented" and "Reported or alleged", in that order. (OCCRP's known versus claimed assets.)
- **Verdicts in words.** A fact-check shows the claim, who made it and when, the verdict as a word or short phrase, then the reasoning, then sources. Do not use a traffic-light dial or a percentage "confidence score". A number implies a precision the reporting does not have.
- **Right of reply.** If a subject has responded, show the response in its own labelled block on the profile and on the fact-check.
- **Standing notice.** One sentence, set in normal text weight and not hidden in a footer: inclusion records a documented connection and does not imply wrongdoing. (ICIJ.)
- **Corrections.** A dated corrections log per page, and a "Report an error" link on every profile.

---

## Part 6. What makes these tools look credible and made by people

**What the credible ones do**

- **Restraint in type.** Forensic Architecture uses one typeface in two styles for the entire site. ProPublica pairs a serif for reading with a sans-serif for data. Pick two families at most, set data in tabular figures, and keep identifiers and reference numbers in a monospace.
- **Colour that means something.** A near-monochrome base, one accent, and a small fixed set of relationship colours that are identical everywhere. If a colour does not encode something, remove it.
- **Editorial judgement on show.** Ranked lists, featured stories, named views, hand-placed maps and written summaries all prove that a person decided what matters. A site that presents everything at equal weight looks like a database dump.
- **Specifics.** Exact dates, exact amounts with currency, document names with page numbers, registry numbers. Round numbers and vague labels read as invented.
- **Admitted limits.** Coverage dates, "may be incomplete", "too many connections to display", "last updated". Tools that admit gaps are trusted more than tools that look complete.
- **Named people.** Bylines, design credits, a methodology with an author, a corrections address. OCCRP credits its designers by name.
- **Stable, meaningful layout.** The same node in the same place on every visit; family always in the same sector.
- **Plain language.** "Director, 2019 to 2022", not "POSITION_HELD". "Two steps away", not "path length 2".
- **Dense where data is, calm elsewhere.** Tables with hairline rules and tight rows; reading pages with a measure of 60 to 75 characters and wide margins.

**What signals "generated", and should be avoided**

- A force-directed graph of everything, drifting on load, on a dark background with glowing nodes and blue-to-purple gradients.
- Nodes coloured by a community-detection result that no one has named.
- A row of large statistic tiles with icons as the main content of the home page.
- Identical rounded cards with soft shadows for every kind of content.
- Emoji or generic line icons standing in for entity kinds without a text label.
- Percentages and scores without a stated method: "risk 87%", "confidence 0.92", "influence score".
- Placeholder-style summaries that restate the name and kind ("X is a company connected to Y").
- Uniform treatment of documented and alleged ties.
- Layouts that change between visits, and animation that conveys nothing.
- Avatars for people that are illustrations or silhouettes of no one in particular.

---

## Part 7. Open points for the build team

- Our data needs an evidence level and a source on every one of the 2,900 relationships for patterns 3 and 4 to work. If some lack one, decide the fallback label now ("source pending" is better than silence).
- An editorial importance rank per entity is needed for the default view, the batch expansion order and the ranked lists. Degree alone will over-promote registries and holding companies.
- Guided tours need an editor's time: roughly one per major fact-check. Start with five.
- Check the [R] details against live sites once network access allows, especially the OpenSanctions profile layout and the Oligrapher annotation column, which are the two we would copy most closely.
