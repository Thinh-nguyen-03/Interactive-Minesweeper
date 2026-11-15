# Inspiration: professional link-analysis and graph-exploration products

Research for the network map and connection matrix (about 94 fact-checks, 1,300 people and organisations, 2,900 relationships).
Brief: clean, sleek, intuitive, "intelligence and investigative analysis", not machine-generated, and not the dark control-room look.

**How this was gathered.** 27 web searches on 2026-11-15. Direct page fetches were not used, so product notes rest on vendor documentation, UX blogs and release notes as surfaced in search results, plus general knowledge of these products. Items marked *(from general knowledge)* were not confirmed by a source in this pass. Numeric thresholds in sections 2 and 3 are my recommended starting values to tune on the real data, not figures taken from a vendor.

---

## 1. Product notes

### 1.1 Cambridge Intelligence (KeyLines / ReGraph, and their UX writing)

The most useful single source. Their guidance is explicit and consistent.

- **Default view / what is hidden.** They argue against showing everything: "a huge graph on one screen is rarely useful". Their five-stage order is: filter early, aggregate and remodel, choose a visual model that fits the user's questions, declutter with filters and grouping, and only then run a layout. Layout is the last step, not the first.
- **Layouts.** Organic (force) for global structure of large data; sequential for clear levels and direction; radial for few top-level nodes with many children; lens pushes highly connected nodes to the centre and less connected ones outward, and is the default arrangement inside open circular combos; structural places leaf nodes in tight circles round their parent. The time bar is a filter component, not a layout: same data loaded into both, chart filtered on the time bar's change event.
- **Combos.** Visual groups that open, close and nest; they tidy without removing data. Styled separately for open and closed states. Inside a combo, "arrangements" replace layouts: concentric (rings, largest node in the centre, best when links inside the group do not matter), lens (circular combos), grid (rectangular combos). Typical interaction: load closed, open on double-click.
- **Starbursts and leaf nodes.** Nodes with one neighbour cause starbursts and are the least useful; group them into a small combo next to their parent, or stack them in a grid.
- **Encoding.** Match channel to data: glyphs for properties, halos for events, donuts for proportions, font icons for type. Link width for volume on aggregated links; dashed or dotted for a second link class; curved links for flow.
- **Labels.** Node labels on a semi-transparent background. Link labels kept horizontal; too many of them "turn your graph into a wordsearch". Font icons replace long text at zoomed-out scales.
- **Adaptive styling by zoom.** Small nodes are enlarged when zoomed out; links and text fade when too closely packed or too small to read; multiple labels per node can fade in at different zoom levels.
- **Selection.** Hover and select style the item and its neighbours; neighbours are brought to the foreground.
- **Restraint.** "Use colours in moderation", "use emphasis and animation in moderation", "detail on demand", "don't overload labels".
- **Character.** Demos pair a white-background version with a dark version of the same chart; light is fully supported.

Sources: [10 rules of great graph design](https://cambridge-intelligence.com/10-rules-great-graph-design/) · [Graph visualization at scale](https://cambridge-intelligence.com/visualize-large-networks) · [5 ways to tackle big graph data](https://neo4j.com/blog/graph-visualization/5-ways-to-tackle-big-graph-data-keylines-neo4j/) · [Choosing the right layout](https://cambridge-intelligence.com/layouts) · [Dealing with starbursts](https://cambridge-intelligence.com/dealing-with-starbursts/) · [Fixing data hairballs](https://cambridge-intelligence.com/?p=24339) · [Snowstorm effect](https://cambridge-intelligence.com/blog/snowstorm-effect-in-graph-visualization/) · [Combos docs (ReGraph)](https://developers.cambridge-intelligence.com/docs/regraph/combos) · [Styling combos](https://cambridge-intelligence.com/5-quirky-ways-to-style-combos-for-maximum-impact/) · [Aggregating links](https://developers.cambridge-intelligence.com/docs/regraph/aggregate-links) · [5 link visualization styles](https://cambridge-intelligence.com/link-visualization-styles/) · [Glyphs](https://cambridge-intelligence.com/graphs-with-glyphs/) · [Font icons for graph UX](https://cambridge-intelligence.com/blog/why-font-icons-are-the-key-to-better-graph-ux-ui/) · [Look and feel](https://cambridge-intelligence.com/getting-the-perfect-look-and-feel-for-your-network-visualizations/) · [Visual models users love](https://cambridge-intelligence.com/visual-models-that-delight-users) · [Choosing colours](https://cambridge-intelligence.com/choosing-colors-for-your-data-visualization/) · [Accessible graph apps](https://cambridge-intelligence.com/build-accessible-data-visualization-apps-with-keylines/) · [Time bar docs](https://developers.cambridge-intelligence.com/docs/keylines/time-bar)

### 1.2 yWorks yFiles

- **Level of detail.** Complex rendering at high zoom, much simpler at low zoom. Labels "often don't need to be displayed at low zoom levels, as they are not readable anyway". The Label Fading demo fades labels (and in newer versions nodes and edges) below a chosen zoom threshold, rather than switching them off abruptly. The Large Graphs demo switches renderer at a zoom threshold (25 %, 50 % or 100 %).
- **LOD by filtering as well as rendering.** A sub-graph is replaced by a single node at low zoom.
- **Collapsing.** Case study: collapse less relevant sections to single nodes so the user focuses on critical areas.
- **Label placement.** Generic labelling algorithms that eliminate overlaps where possible and minimise them otherwise; edge labels have candidate positions (near source, centre, near target) with preferences.
- **Edge bundling.** Bundled Edge Router merges shared segments of edges in dense drawings; shown together with automatic node labelling.
- **Advice.** Progressive disclosure by collapsing and expanding groups, search that expands neighbours, filtering by node type. "A hairball might look impressive but does not provide much insight."
- **Mental map.** Expand, collapse and hide change the graph a lot; keep unaffected nodes in place.

Sources: [Level of detail for large diagrams](https://www.yworks.com/pages/level-of-detail-for-large-diagrams) · [WebGL label fading demo](https://www.yfiles.com/demo/webgl-label-fading) · [Large graphs demo](https://www.yfiles.com/demos/showcase/large-graphs/) · [Large graph performance guide](https://docs.yfiles.com/yfiles-html/dguide/large_graph_performance/) · [Smooth visualization of big data structures](https://www.yfiles.com/resources/how-to/smooth-visualization-of-big-data-structures) · [Automatic label placement](https://www.yfiles.com/resources/how-to/automatic-labeling) · [Label placement guide](https://docs.yfiles.com/yfiles-html/dguide/label_placement/) · [Bundled edge router demo](https://yfiles.com/demos/layout-features/bundled-edge-router) · [Collapsing case study](https://www.yworks.com/blog/case-study-jdisc)

### 1.3 Palantir Gotham Graph and Foundry Vertex

- **Default view.** The canvas starts with what the analyst put there; the graph grows by "Search Around" (right-click an object, pick the relation type, linked objects are added). Nothing is shown that was not asked for.
- **Histogram helper.** A side panel that counts the current selection by object type, property and link type. Clicking a bar selects that subset on the graph. This is filter, legend and summary in one control.
- **Vertex.** Layout presets in the toolbar with a density setting of one to five and a choice of central node. A Layers tab in the sidebar handles object and edge styling. Edges coloured by object type or shared property; straight, curved or right-angle lines. A node can be a plain node or a full object card.
- **Character.** Blueprint, their design system, is built for dense desktop data interfaces, ships a light theme, 14 px body text, and advises never to rely on colour alone for status. *(From general knowledge: neutral greys, one blue accent, small sans-serif type, thin 1 px rules, very little decoration.)*

Sources: [Vertex: explore existing graphs](https://palantir.com/docs/foundry/vertex/graphs-explore/) · [Vertex: explore object relationships](https://palantir.com/docs/foundry/vertex/explore-object-relationships/) · [Vertex: object and edge display options](https://palantir.com/docs/foundry/vertex/graphs-display-options/) · [Object Explorer charts](https://palantir.com/docs/foundry/object-explorer/explore-charts/) · [Gotham training guide (DocumentCloud)](https://assets.documentcloud.org/documents/6204567/PALANTIR-Guide.pdf) · [Blueprint on GitHub](https://github.com/palantir/blueprint) · [Scaling product design with Blueprint](https://medium.com/@palantir/scaling-product-design-with-blueprint-25492827bb4a)

### 1.4 Neo4j Bloom (now "Explore")

- **Default view.** An empty scene and a search bar. The user types near-natural-language patterns or saved "search phrases"; results land on the scene and are then expanded.
- **Legend panel is the styling panel.** It lists every category and relationship type in the perspective with its colour; clicking an entry edits its style. Rule-based styling has three modes (single value, range, unique values); for numeric properties a small histogram shows the distribution in the current scene. Rules override the default.
- **Perspectives.** A curated business view of the data: only the categories and relations that matter to a given audience.
- *(From general knowledge: a card list at the bottom lists the scene's nodes as cards, an inspector opens on double-click, right-click offers expand by relationship type, dismiss, dismiss others, and shortest path between two selected nodes. Not confirmed in this pass.)*
- **Character.** Light canvas, filled circles in mid-saturation category colours, captions inside or under nodes, thin grey relationships.

Sources: [Legend panel](https://neo4j.com/docs/bloom-user-guide/current/bloom-visual-tour/legend-panel/) · [Bloom overview](https://neo4j.com/docs/bloom-user-guide/current/bloom-visual-tour/bloom-overview/) · [Perspectives](https://neo4j.com/docs/bloom-user-guide/current/bloom-perspectives/perspective-creation/) · [Bloom 2.0 and search phrases](https://neo4j.com/blog/developer/integrating-graph-data-visualizations-no-code-workflows-bloom-2-0/) · [Styling](https://neo4j.com/docs/aura/explore/explore-visual-tour/styling/)

### 1.5 Linkurious Enterprise and Ogma

- **Expand with a guard.** Double-click, actions panel or right-click. A node above the "supernode threshold" is not expanded blindly: a dialog opens with the neighbour categories and counts, and the user chooses which to bring in. Expanding several nodes is blocked if one is a supernode.
- **Design panel.** Two tabs, Styles and Captions, for nodes and edges; colour and size by property; a reset to defaults.
- **Captions.** A caption is built from chosen properties; a missing property shows nothing rather than a placeholder.
- **Grouping.** Node groups start collapsed and toggle on double-click. Ogma groups parallel edges into one edge whose width and label come from its members (only edges between the same two ends), and supports multi-level node grouping and highlighting a group's connections on hover.

Sources: [Expand](https://doc.linkurious.com/user-manual/2.9/expand) · [Design panel](https://doc.linkurious.com/user-manual/3.1/design) · [Captions](https://doc.linkurious.com/user-manual/2.9/captions) · [Ogma: group edges](https://doc.linkurious.com/ogma/5.3/examples/group-edges.html) · [Ogma: multilevel grouping](https://doc.linkurious.com/ogma/5.3/examples/multilevel-grouping.html) · [Ogma: grouping examples](https://doc.linkurious.com/ogma/latest/examples/tags/grouping.html)

### 1.6 Maltego

- **Views drive size.** Seven built-in views size entities by a different measure: outgoing links (normal view), rank (own links plus neighbours' links), weight, and so on. Switching the view re-reads the same graph by a different notion of importance.
- **Layouts.** Block (lowest level arranged in blocks sorted by type then weight), hierarchical, organic, circular.
- **Collections.** On by default: similar entities are merged into one collection node above a minimum count set by a slider (default 25). Pinned entities and entities with notes or attachments are never swallowed by a collection.
- **Character.** *(From general knowledge: pictorial icons per entity type and a dark default canvas; the icon-heavy look dates quickly and is the part not to copy.)*

Sources: [Graph sidebar](https://docs.maltego.com/support/solutions/articles/15000009615-graph-sidebar) · [Layouts](https://docs.maltego.com/en/support/solutions/articles/15000059535-visualizing-results-with-layouts) · [Collections tab](https://docs.maltego.com/support/solutions/articles/15000010775-collections-tab) · [View tab](https://docs.maltego.com/support/solutions/articles/15000010458-view-tab) · [Maltego views, part 1](https://maltego.com/blog/maltego-views-and-how-to-use-them-part-1)

### 1.7 i2 Analyst's Notebook

The grammar of the classic investigative chart.

- **Link multiplicity.** Three settings for several links between the same pair: one line per link (Multiple), one line per direction (Directed), or a single merged line (Single). A merged line can carry a count label.
- **Line strength.** Solid, dashed or dotted line encodes how well established a link is (confirmed, unconfirmed, tentative). This is the convention most worth borrowing for a fact-checking site.
- **Analysis tools.** Find Path (select exactly two items; fewest links by default; can respect direction and date order), Find Linked (extend a selection to depth N), List Most Connected (ranked list by links, linked records, connected entities, inbound), Find Networks and Find Clusters.
- **Representations.** Icon-and-link association charts versus theme-line-and-event timeline charts for the same data.
- **Character.** *(From general knowledge: white canvas, black text, labels under icons, an optional box round a group. Sober and legible, though the clip-art icons look dated.)*

Sources: [About links](https://docs.i2group.com/anb/9.4.0/about_links.html) · [Glossary (line strength)](https://docs.i2group.com/anb/9.4.0/glossary.html) · [Find path](https://docs.i2group.com/anb/9.4.0/searching_for_paths_between_two_items.html) · [Find linked](https://docs.i2group.com/anb/9.4.0/find_linked.html) · [Most connected items](https://docs.i2group.com/anb/9.4.0/most_connected_items.html) · [Find networks](https://docs.i2group.com/anb/9.4.0/find_networks.html) · [Find clusters](https://docs.i2group.com/anb/9.4.0/searching_for_clusters.html) · [Link summarization](https://docs.i2group.com/analyze/4.4.3/configuring_link_summarization.html)

### 1.8 Kumu

The closest to a public-facing, light, calm relationship map.

- **Showcase versus focus.** Showcase makes non-matching items translucent so they fade into the background; focus hides everything except an element and its neighbours to a chosen depth. Both are offered, and they are clearly different controls.
- **Decoration from data.** Size by a number and colour by a field, driven by the element's profile data, with an automatic legend.
- **Sidebar.** Shows the map overview when nothing is selected and the profile of the element, connection or loop when something is. One panel, two states.
- **Controls.** Author-defined filter, cluster, focus and showcase controls placed on the map for readers.

Sources: [Data-driven decorations](https://docs.kumu.io/guides/decorate/data-driven-decorations) · [Showcase](https://docs.kumu.io/guides/showcase) · [Focus control](https://docs.kumu.io/guides/controls/focus-control) · [Controls](https://docs.kumu.io/guides/controls) · [Legends](https://docs.kumu.io/guides/legends) · [View editors](https://docs.kumu.io/overview/user-interfaces/view-editors)

### 1.9 Sigma.js (and Gephi)

- **Label culling by grid.** The screen is divided into cells; in each cell only the largest nodes get a label. Three settings: label density, grid cell size, and a rendered-size threshold below which a node gets no label. Example values in the wild: density 0.5 with threshold 6; density 0.07, cell 60, threshold 8. Labels therefore appear for hubs first and for smaller nodes as the user zooms in.
- **Reducers.** Display attributes are computed at render time from state (hovered node, neighbour set, search match) without changing the data. The official hover example highlights a node and its neighbours and greys the rest.
- **Gephi conventions.** Size by degree, colour by community, label size proportional to node size, a final layout pass with "prevent overlap", and a separate label-adjust pass. Size range kept narrow (examples: 3 to 15).

Sources: [Sigma: customization](https://sigmajs.org/docs/advanced/customization) · [Sigma v4: hover and search](https://v4.sigmajs.org/how-to/interactivity/hover-search/) · [Sigma v4: add interactivity](https://v4.sigmajs.org/get-started/add-interactivity/) · [Sigma v4: label positioning](https://sigma-v4.pages.dev/how-to/labels/styles-positioning/) · [Gephi quick start](https://gephi.org/quickstart) · [Gephi layout tutorial](https://gephi.org/users/tutorial-layouts) · [Mapping controversies: Gephi and clusters](https://jacomyma.github.io/mapping-controversies/1.8) · [ForceAtlas2 paper](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0098679)

### 1.10 Others, briefly

- **Graphistry.** A histogram panel for any node or edge attribute; click or drag across bins to filter; a filter panel lists the active filters. Size bound to degree for a first look. [UI guide](https://pygraphistry.readthedocs.io/en/0.40.0/visualization/uiguide.html)
- **TigerGraph Insights.** A small red count beside a node says how many neighbours are hidden; double-click reveals them. Filtering dims non-matching edges instead of removing them. Shift-select two nodes for path finding. [Graph widget](https://docs.tigergraph.com/insights/4.1/widgets/graph-widget)
- **Siren Investigate.** Expand by relation; rectangle-select then Crop to keep only the selection; map mode and timeline mode for the same nodes; edge aggregates that summarise intermediate nodes with a count. [Link analysis](https://docs.siren.io/siren-platform-user-guide/14.8/graph-browser/t_link-analysis.html) · [Graph browser](https://docs.siren.io/siren-platform-user-guide/14.8/graph-browser/graph-browser.html)
- **GraphAware Hume.** "Virtual relationships": a direct edge that stands for a longer pattern (person to company via several records), which the analyst can open to see the concrete relationships behind it. Badges on nodes for values and icons. [Virtual relationships](https://graphaware.com/blog/virtual-relationships) · [Styling and grouping](https://graphaware.com/resources/hume-features-styling-grouping-computed-attributes/)
- **Quantexa.** Collapse and expand aggregations; an entity-to-entity view that hides the intermediate documents; their own community warns that expanding too far leads to information overload. [Managing large networks](https://community.quantexa.com/kb/articles/253-tips-tricks-for-managing-large-and-complex-networks)
- **Cytoscape.js.** Compound nodes with an expand-collapse extension, meta-edges for collapsed groups, and the advice to run the layout with `randomize: false` after expand or collapse to preserve the mental map. [expand-collapse](https://ivis-at-bilkent.github.io/cytoscape.js-expand-collapse) · [complexity management](https://www.github.com/iVis-at-Bilkent/cytoscape.js-complexity-management)
- **D3 / Observable.** Hierarchical edge bundling: leaves on a ring grouped by parent, edges bundled through the hierarchy, hover colours outgoing and incoming edges differently and greys the rest. Directly relevant to a ring of topic groups. [Hierarchical edge bundling](https://observablehq.com/@d3/hierarchical-edge-bundling) · [D3 graph gallery: bundle](https://d3-graph-gallery.com/bundle)
- **Matrix research.** Ghoniem, Fekete and Castagliola (2004): above about twenty nodes a matrix beats a node-link diagram on most tasks; only path finding consistently favours node-link. Later work (Okoe, Jianu, Kobourov) agrees for large dense graphs. This is the argument for keeping both views and giving each its own job. [Ghoniem et al.](https://bibbase.org/network/publication/ghoniem-fekete-castagliola-acomparisonofthereadabilityofgraphsusingnodelinkandmatrixbasedrepresentations-2004) · [Okoe et al.](https://par.nsf.gov/servlets/purl/10179526)
- **Small screens.** No vendor guide surfaced. Research on mobile network views points the same way: show a focus node and its neighbourhood rather than the whole graph, make targets much larger than on desktop, avoid excessive panning, and build a separate small-screen layout instead of shrinking the desktop one. [Multivariate networks on mobiles (Horak et al.)](https://mt.inf.tu-dresden.de/cnt/uploads/Horak2020MultivariateNetworksOnMobiles.pdf)

### What the products agree on

1. Nobody good opens on the whole graph. They open on a search, a curated starting set, or an aggregated overview.
2. Importance is carried by size and by which labels are shown, not by colour.
3. Colour is reserved for type or group, and there are few colours.
4. Selection works by dimming everything else, not by making the selection louder.
5. The legend is also the filter.
6. Groups are objects in their own right: they collapse, carry counts and have summary links.
7. Detail lives in a side panel, never in the canvas.
8. Layout stays put once shown; changes are local and animated.

---

## 2. The 12 most transferable patterns, ranked by impact

Each is a build instruction for our map.

**1. Open on an aggregated overview, not on 1,300 nodes.**
The first view shows the topic groups as group nodes on the ring, plus the few dozen hubs labelled, plus summary links between groups. Everything else is one step away. Target at most about 150 drawn marks and 30 to 40 labels on first paint. (Cambridge Intelligence five-stage order; yFiles LOD by filtering; Bloom empty scene.)

**2. Selection is dimming.**
On hover or select, keep the node, its direct neighbours and the links between them at full strength; drop everything else to about 12 to 18 % opacity and remove its labels. Do not recolour the selection in a bright hue; a 2 px dark ring on the selected node is enough. Hover previews; click locks; click on empty canvas or Escape clears. (Kumu showcase, Sigma reducers, TigerGraph dimming, Cambridge Intelligence neighbour styling.)

**3. Labels are rationed by importance and zoom, with collision culling.**
Grid-based culling: per screen cell, label only the highest-ranked node; raise the number of labels as the user zooms. Always label: selected node, its neighbours (up to a cap), hovered node, search hits. Fade labels in and out over about 150 ms rather than popping. (Sigma label grid; yFiles label fading; Cambridge Intelligence adaptive styling.)

**4. Groups are first-class: collapsed topic nodes that open in place.**
Each topic is a group node with a name and a member count. Clicking opens it in place with a concentric arrangement (hub in the centre, others on rings). Only one or two groups open at a time by default; opening one must not move the others. (ReGraph combos and arrangements; Cytoscape expand-collapse with `randomize: false`; yFiles collapsing.)

**5. Aggregate links between groups and between pairs.**
Between two closed groups draw one summary link whose width is the number of underlying relationships (use a square-root scale and cap the width) and show the count on hover. Between two nodes with several relationships draw one line with a small count, opening into the list in the side panel. (i2 Single/Directed/Multiple; Ogma edge grouping; ReGraph aggregate links; Siren edge aggregates.)

**6. One side panel with two states.**
Nothing selected: the panel shows what the map is, the legend with counts, and a ranked "most connected" list. Something selected: the profile card with name, type, one-line role, a list of connections grouped by relationship type with counts, and the fact-checks that document each. The panel is the place for words; the canvas carries no paragraphs. (Kumu sidebar; Bloom inspector; i2 List Most Connected.)

**7. The legend is the filter and carries counts.**
Each legend row is a type or link class with its swatch and the count in the current view. Clicking a row isolates it; a second control hides it; rows with zero count grey out. Add a small bar behind each row to act as a histogram. (Palantir Histogram helper; Bloom legend panel; Graphistry histograms.)

**8. Encode certainty with line style, in the i2 convention.**
Solid for documented and verified, dashed for alleged or disputed, dotted for inferred or indirect. Keep direction arrows off unless the relation is truly directional (ownership, payment, appointment), and then only show them at close zoom or on the selection. (i2 line strength; Cambridge Intelligence link styles.)

**9. Path finding between two entities as a named feature.**
"How is A connected to B?": pick two entities from search, draw the shortest path with all else dimmed, and list the steps in the panel as a readable chain with the supporting fact-check for each step. Research says path following is the one task where node-link clearly beats a matrix, so it is the map's strongest argument. (i2 Find Path; TigerGraph shift-select; Ghoniem et al.)

**10. Expansion with a guard and visible counts of what is hidden.**
A node with hidden neighbours shows a small count badge. Expanding a hub does not dump all neighbours: it offers them by relationship type with counts ("12 companies, 7 officials, 3 family") and brings in the chosen set. (Linkurious supernode threshold; TigerGraph red count; Maltego collections.)

**11. Search is the front door.**
A prominent search field with type-ahead over people and organisations. Choosing a result centres it, selects it and opens its neighbourhood. For most visitors this replaces free exploration. (Bloom search bar; yFiles "search to expand neighbours"; Sigma hover-search example.)

**12. Stable geometry and quiet motion.**
Precompute positions at build time so the map looks the same on every visit and never simmers on load. Transitions only when the user changes something: 200 to 300 ms, ease-out, no bounce, no continuous physics. Keep unaffected nodes where they are. (yFiles mental-map advice; Cytoscape expand-collapse guidance; Cambridge Intelligence "animation in moderation".)

Next in line, if there is room: a "focus" mode that hides rather than dims (Kumu) for a selected neighbourhood, with a clear way back; "virtual" direct links that stand for a person-to-fund chain through intermediaries and open on demand (Hume); a time range control as a filter over fact-check dates (KeyLines time bar).

---

## 3. Guidance for our case

### 3.1 Scale and the default view

- 1,300 nodes and 2,900 links is small for a renderer and too large for a reader. Performance is not the constraint; legibility is. Do not show more than a reader can take in because the machine can draw it.
- Classify nodes once, at build time, into three tiers by weighted degree (or by how many fact-checks cite them):
  - **Tier 1, hubs:** roughly the top 30 to 40. Always visible, always labelled.
  - **Tier 2, connectors:** roughly the next 150 to 250, including anything that links two topics. Visible from mid zoom; labelled when space allows.
  - **Tier 3, periphery:** the rest, many of them single-link leaves. Hidden inside their group until the group is opened or a neighbour is selected.
- Leaves with one neighbour should not be scattered individually. Stack them as a compact cluster beside their parent with a count, opened on demand (the starburst fix).
- The politician at the centre is linked to nearly everything. Treat him as a fixed anchor and do not draw his links by default; draw them only when he, or one of his neighbours, is selected. Otherwise one node produces a third of the ink.

### 3.2 Topic groups round a ring

- Fix the order of topics round the ring by similarity, so groups that share many links sit next to each other and long chords across the centre are few. Compute this once; never reorder at run time.
- Give each topic an arc proportional to the square root of its member count, with a minimum arc so small topics remain clickable.
- Topic name outside the ring, set horizontally where possible; if rotated, flip the lower half so no label is upside down. Member count in small figures after the name.
- Hubs sit on an inner ring or inside their group's wedge towards the centre; periphery towards the rim. Cross-topic connectors sit closest to the centre, which reads correctly as "between".
- A node belonging to two topics is placed in its primary topic and gets a small marker; do not duplicate it.
- The ring is the overview. A selected neighbourhood may re-arrange as a small radial "ego" view (selected node in the middle, neighbours on one ring grouped by type), entered and left by an animated transition.

### 3.3 Edge bundling or aggregation

- Prefer **aggregation** to bundling as the default. Aggregated group-to-group links give an honest number; bundles give a pleasing shape whose thickness is hard to read.
- Use **hierarchical bundling** only for the ring overview when groups are open, routing links through their topic's centre point with a bundle strength of about 0.7 to 0.85. Full strength hides which node a link ends on.
- On selection, un-bundle: draw the selected node's own links as plain gentle curves at full strength so each end point is unambiguous.
- Link ink: 1 px hairlines at 20 to 30 % opacity in a neutral grey at rest; the selection's links at 1.5 px in the ink colour. Never colour all links by type at rest.

### 3.4 Selection states

Define all of these explicitly; unfinished states are what make a graph UI feel amateur.

| State | Node | Label | Links |
|---|---|---|---|
| Rest | fill by type, no outline | by tier and zoom | hairline grey |
| Hover | 1.5 px dark ring | shown, with type in small caps beside it | own links darkened |
| Selected | 2 px dark ring, slight enlargement (at most 1.15×) | shown, bold | own links 1.5 px ink colour |
| Neighbour of selection | full opacity | shown up to a cap of about 25, by rank | as above |
| Dimmed | 12 to 18 % opacity | hidden | 5 to 8 % opacity |
| Search hit | full opacity, thin accent ring | shown | unchanged |
| On path | full opacity, numbered step | shown | 2 px accent |
| Pinned | small pin mark | always shown | unchanged |
| Keyboard focus | visible focus ring distinct from selection | shown | unchanged |

- Hover must respond in under 100 ms and must not move anything.
- Selection writes to the URL so a selected entity or a path can be shared and the back button works.
- Hit areas at least 24 px on desktop and 44 px on touch, regardless of the drawn size.

### 3.5 Progressive disclosure and level-of-detail thresholds

Starting values; tune against the real data. "Zoom 1" means the whole ring fits the viewport.

| Zoom | Shown | Labels |
|---|---|---|
| below 0.8 | topic groups as closed group nodes, summary links, hubs as dots | topic names only |
| 0.8 to 1.5 (default) | plus hubs at full size, tier-2 as small dots | topic names, all hubs |
| 1.5 to 3 | plus tier-2 at full size, tier-3 as faint dots in the group under the pointer | hubs, tier-2 by grid culling |
| above 3 | all nodes in view, individual links, direction arrows, link-type marks | all nodes in view by grid culling; link labels on selection only |

- Drive visibility by **rendered size** as well as zoom: no label for a node drawn under about 6 px radius; no node drawn under about 1.5 px.
- Cross-fade between levels over a zoom range of about 15 %, so nothing pops.
- Opening a group by click is equivalent to zooming into it; offer both.

### 3.6 Label rules

- One typeface, the same as the site's interface type. Labels 11 to 13 px on screen at every zoom (do not scale text with the canvas); two weights only.
- Hub labels a step larger or semi-bold; never more than three label sizes in one view.
- Place labels beside the node (right by default, flipping left on the left half of a ring), not centred on small nodes.
- A thin halo in the page background colour behind each label (2 to 3 px) so it reads over links; no boxes or pills at rest.
- Truncate at about 22 characters with an ellipsis at rest, full name on hover and in the panel. Organisations may use a curated short name.
- Priority when labels collide: selected, on path, hovered, pinned, search hit, neighbour by rank, then tier.
- No link labels at rest. On selection, show the relationship type as small text on the selected node's links only if there are fewer than about eight; otherwise list them in the panel.
- Numbers in labels and counts use tabular figures.

### 3.7 Encoding

- **Size = importance.** Area proportional to weighted degree or citation count, on a square-root scale, with a narrow range (about 4 to 18 px radius). Put a size key in the legend.
- **Colour = entity type**, with at most five or six categories (for example person, family member, official, company, fund or foreign entity, institution). Mid-saturation hues with similar lightness, tested for colour-vision deficiency. Topic is carried by position on the ring, not by colour, so the two never compete.
- **Shape as a redundant cue** for the main split: circles for people, rounded squares for organisations. Two shapes, three at most.
- **Line style = certainty** (solid, dashed, dotted). **Line width = number of underlying relationships**, on aggregated links only.
- One accent colour, reserved for the path and search hits.
- No pictorial icons on nodes, no photographs in the canvas. A photograph, if any, belongs in the profile card.

### 3.8 The matrix

- Give the matrix the jobs it is better at: "which groups are densely tied", "who is connected to both", comparing many pairs at once. Give the map path finding and neighbourhood reading.
- Order rows and columns by the same topic order as the ring, hubs first within each topic, so the two views can be read against each other and clusters appear as blocks on the diagonal.
- Default the matrix to group-by-group or hubs-by-hubs (tens of rows, not 1,300); drill into a block to see its members.
- Cell shade = number of relationships (one hue, four or five steps); a cell mark for certainty. Hover highlights the row and column headers; click opens the same panel as the map.
- Selection is shared: selecting an entity in one view selects it in the other.

### 3.9 Small screens

- Do not shrink the desktop map. Below about 720 px, lead with search and a ranked list of hubs; the map is a second step.
- When shown, the map presents a focus node and its neighbourhood only (one ring of neighbours grouped by type), not the whole ring.
- The side panel becomes a bottom sheet with three heights: peek (name and type), half, full.
- Tap selects; there is no hover, so every hover-only detail must also be in the sheet. Pinch zooms, one finger pans, and the page must still scroll when the finger starts outside the canvas.
- Fewer labels (about a dozen), larger hit areas (44 px), filters in a sheet rather than a rail.
- Offer the same content as a plain list ("12 companies, 7 officials…") for people who cannot or will not use the graph. This also serves screen readers.

---

## 4. Analyst-grade precision in a light, calm, public style

### Keep

- **Explicit counts everywhere**: members per group, relationships per pair, items per legend row, hidden neighbours. Numbers, not impressions, are what read as analytical.
- **A consistent grammar**: one meaning per visual channel, stated in a legend that is always reachable.
- **Certainty encoding** (solid, dashed, dotted) and a visible source for every link. For a fact-checking site this is the single most credible borrowing from intelligence charts.
- **Ranked lists beside the picture**: most connected, shared connections, steps of a path.
- **Hairlines and tight alignment**: 1 px rules, a strict spacing scale, tabular figures, small caps or small uppercase labels for field names, used sparingly.
- **Reproducibility**: the same layout every visit; a shareable URL for any state; "as of" date and the number of fact-checks behind the view.
- **Dense but ordered side panel**: key-value rows, grouped connection lists, no decorative cards.
- **Keyboard support**: arrow keys between neighbours, Enter to select, Escape to clear, `/` for search.

### Drop

- Dark canvas, neon accents, glow, bloom, scan lines, grid backdrops, radar sweeps, HUD corner brackets, monospace everywhere, fake coordinates or "classified" stamps.
- Animated flow along links, pulsing nodes, particles, perpetual simmering physics.
- Pictorial icon sets (the Maltego and i2 look) and avatar photographs in the canvas.
- Floating toolbars with a dozen tool icons, lasso and box-select modes, right-click context menus as the only route to a feature, layout pickers and physics sliders. The public reader gets a few decisions already made well.
- Per-node glyphs, badges, donuts and halos. Analysts learn them; visitors do not. At most one small marker (hidden-neighbour count).
- 3D and fisheye distortion.

### Character to aim for

- A warm or neutral off-white ground, near-black ink for text and selection, greys for structure, five or six restrained type colours, one accent.
- Closer to a printed atlas, an academic network figure or a well-set newspaper graphic than to a dashboard. Palantir's Blueprint light theme and Kumu show that dense and calm are compatible; the i2 chart shows that a white canvas with black type reads as serious.
- Flat fills, no gradients on nodes, no drop shadows in the canvas; a single soft shadow or a hairline border is enough to lift the panel.
- Generous canvas margin; the ring should not touch the edges or sit under the panel.
- Words do the explaining: a short sentence above the map saying what is shown and how to start, and a caption-style note on how to read size, colour and line style.

---

## 5. Common mistakes that make graph UIs look amateur or generated

**Structure**
- Opening on the full hairball with physics still running, then calling it exploration.
- A force layout that differs on every load, so nothing can be remembered or pointed to.
- A hub's links drawn at full strength at rest, turning the middle into a grey disc.
- Leaves scattered as a halo of dots round every hub (starburst) and disconnected nodes sprinkled round the edge (snowstorm).
- Showing the raw data model instead of the model the reader thinks in (for example, drawing the fact-check as a node between two people instead of as the evidence on their link).

**Encoding**
- Rainbow categorical palettes with ten or more hues; colour used for both type and group; saturated fills on a dark ground.
- All nodes the same size, or sizes spanning so wide that hubs cover their neighbours.
- Links coloured by type everywhere, arrows on every link, thick links.
- Glow, gradients, drop shadows and glossy spheres on nodes.
- A legend that does not match what is on screen, or no legend.

**Labels**
- Every label on at once, overlapping; or no labels until hover, so the picture says nothing.
- Text that scales with zoom, becoming huge or microscopic.
- Rotated link labels along every edge.
- Labels in pills with coloured backgrounds on every node.
- Truncated names with no way to see the whole.

**Interaction**
- Hover that re-runs the layout or makes nodes jump.
- Selection that only changes the selected node's colour and leaves the rest as noisy as before.
- Tooltips used as the only detail view; tooltips that cover the thing being inspected.
- Expanding a hub adds two hundred nodes with no warning and no undo.
- No reset, no back, no shareable state; the URL never changes.
- Scroll-wheel zoom that hijacks page scrolling; no pinch on touch; targets too small to tap.
- Elastic, bouncing transitions and springs that never settle.
- A minimap, a physics panel, a layout picker and a dozen toolbar icons added because the library offers them.

**Tells of generated work in particular**
- Library defaults left untouched: default blue circles, default grey lines, default tooltip.
- Decorative "intelligence" dressing with no function: hex grids, corner brackets, blinking status dots, fake coordinates, uppercase monospace captions.
- Identical rounded cards with an icon, a number and a label across the top of the page.
- Emoji or stock icons as node types.
- Empty, loading and error states not designed; a selected state with an empty panel.
- Copy that describes the interface rather than the subject ("Explore the interactive network").
- Purple-to-blue gradients, glass panels, and everything centred.

---

## 6. Open points for the build

- Which measure ranks importance: degree, weighted degree, or number of fact-checks citing the entity. The last is the most defensible for this site and should probably drive size.
- Whether certainty (verified, alleged, inferred) exists in the data for each relationship; pattern 8 depends on it.
- How topics are assigned to entities with several, and which is primary.
- Whether relationships carry dates; a time range filter is only worth building if most do.
