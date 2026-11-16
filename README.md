# Trump Claims Map

A tool for looking deeper into Donald Trump, his family, his cabinet and administration, and the business, financial and political connections around them. It is presented as a website with a page for every check, a profile for every person and organisation, and an interactive map of how they connect.

**Live map:** https://claude.ai/artifact/Hodpp6u6fLoqSvbVs8Y9XP (private until the owner shares it)

This is a verification project, not an accusation. Everyone named denies wrongdoing, and nothing here alleges a crime. A line between two names on the map means a documented relationship, or that both appear in the same check. It does not show that one caused the other.

## What is in it

| | Count |
|---|---|
| Checks of claims and of the questions they raised | 60 |
| Connection checks (cross-referencing across checks) | 34 |
| Topics the checks are grouped under | 9 |
| Individual points checked | about 830 |
| Sources cited | about 3,300 |
| People, organisations and other names mapped | about 1,300 |
| Documented relationships between them | about 2,900 |

Verdicts across all 94 checks: 2 confirmed, 79 mostly accurate, 11 partly accurate, 2 unverified. All 94 have had an independent second review. `python3 build.py` prints the current counts.

"Mostly accurate" usually means the core facts hold and specific figures, dates or framings needed correcting. The corrections are listed on each check's page.

The nine topics are family ventures and wealth; crypto ventures; Trump Media and markets; Gulf money; foreign deals; regulators and enforcement; pardons, lobbyists and access; defence, minerals and contracts; and tech and media companies. They are defined in `data/topics.json`.

## How the research was done

1. The starting point was a set of claims in public circulation about the Trump family's business dealings: the crypto ventures, the Gulf investments, Trump Media, the pardons and the dropped enforcement cases. Each was written down as a specific claim that can be tested (`data/claims-index.json`).
2. Each claim was researched by its own agent, which split it into separate points, checked every figure, date and name against news reporting, filings and official releases, and recorded what the people named say in reply.
3. Related stories and open questions that surfaced along the way became further checks, each researched the same way.
4. Connection checks then cross-referenced the finished files for recurring lawyers, lobbyists, financiers, shell entities, investors and foreign partners, and searched outward to confirm and date each link.
5. An independent second reviewer re-checked the most consequential assertions in each check with fresh searches and corrected the files where needed. Each claim file records the result in an `audit` field.

### Verdicts

- **Confirmed**: the record supports the claim as stated.
- **Mostly accurate**: the core facts hold; specific figures, dates or framings needed correcting.
- **Partly accurate**: some parts hold up and others do not.
- **Misleading**: the underlying facts exist, but the framing gives a wrong impression.
- **Unverified**: an allegation that could not be independently corroborated. It is neither confirmed nor refuted.
- **False**: the record contradicts the claim.

### Evidence grades

Every connection in a connection check carries one of three grades:

- **Documented**: filings, official records or several outlets.
- **Single-source**: one outlet, or anonymous sourcing.
- **Inferred**: our own observation from timing or co-occurrence. No source asserts it.

An inferred link is never presented as fact. A documented relationship is not proof of wrongdoing.

### Limits

- Most news and government sites could not be opened directly from the research environment. Findings rest on search-result excerpts that agree across several outlets, not on reading the original articles, filings or court dockets in full. This is why most checks are rated medium confidence.
- Two checks (C37 and C46, about Jared Kushner) are single-source allegations from one book, denied by everyone named. They are marked unverified wherever they appear.
- The inference that a payment bought an official act is not established in any check. Where a claim implies it, the point is marked unverified.
- Research ran in November 2026. Later developments are not reflected.

## Repository layout

| Path | Contents |
|---|---|
| `data/claims-index.json` | The list of all checks: display title, the question checked, topic, kind, parent checks, and a `hidden` flag for anything not shown |
| `data/topics.json` | The nine topics, in display order, with a one-line description each |
| `data/claims/Cxx.json` | Structured findings per check: verdict, sub-claims, corrections, denials, sources, entities, relationships, leads, audit |
| `research/Cxx-*.md` | The long-form report for each check |
| `data/base-graph.json` | Shared entities, relationships and recurring themes |
| `build.py` | Merges everything into the map data and the Obsidian vault |
| `map/` | The interactive website as one page with hash addresses: the artifact build |
| `make_site.mjs` | Builds `site/`, the deployable static site, from `map/` (Node, no dependencies) |
| `static/og.png` | The link-preview image, drawn once by `tools/make_og.js` and copied into the site |
| `render.yaml`, `.node-version` | The Render blueprint for the static site, and the Node version it builds with |
| `tools/` | Checks for the built site: a local static server, a crawl test and a link check |
| `cook/harness/` | Checks for the artifact build: stills, map behaviour, contrast |
| `site/` | Build output. Not committed |
| `vault/` | The same graph as an Obsidian vault, one note per check, name and theme |
| `SCHEMA.md` | The data contract and the instructions the research agents followed |
| `QUEUE.md` | Working notes on what remains |

Other files in the root are working material and are not read by the build.

## Using it

**The website.** Open the live link, or build the site and serve it locally:

```
python3 build.py          # only after editing data/ or research/; its output is committed
node make_site.mjs        # writes site/
node tools/serve_site.js  # http://localhost:8080/
```

The site has four areas. The home page says what the tool covers and how the checks came out, introduces the people involved (the Trump family, administration officials, business partners and investors, foreign governments and funds), and lists every check under its topic, with a topic list for jumping between them. Each check page runs in a fixed order: the claim, verdict, bottom line, what holds up, what needs correcting, what is unproven, the other side, who is involved, sources, second review and the full report. People and organisations have profiles with their closest connections, a timeline, the largest sums and every relationship written out with the checks it comes from. The map shows every name and connection, with the checks arranged around a ring in nine topic arcs: select a mark for a summary, double-click to isolate its network, pick a topic to see only its checks and the names they mention, and use "Trace a path" to find the shortest connection between two names.

**Obsidian.** Open the `vault/` folder as a vault and use the graph view. Notes link to each other with wikilinks.

**Rebuilding.** After editing anything under `data/` or `research/`, run `python3 build.py`. It rewrites `map/graph-data.js` and regenerates `vault/`. Then run `node make_site.mjs` if you want the site locally; the host runs it on every deploy. It needs only the Python standard library. Checks, sub-claims, entities and relationships flagged `"hidden": true` are left out of everything. The map layout is computed in the build (about ten seconds) and cached in `.layout-cache.json`; it is recomputed only when names, connections or topics change. The build ends with a wording check: it lists any text of our own in the output that still refers to where a claim was first collected from rather than to the claim itself, so that it can be reworded. Publishers' headlines and URLs are not checked.

## Two builds from one source

`map/` is the product: `index.html` (body content only), the stylesheets, `matrix.js`, `app.js` and the generated `graph-data.js`. It is published in two forms, and `app.js` serves both.

| | Artifact build | Site build |
|---|---|---|
| What is published | `map/` as it stands | `site/`, written by `node make_site.mjs` |
| Addresses | Hashes on one page: `#C06`, `#name-jared-kushner`, `#map-topic-gulf-money` | Real paths, one pre-built page each: `/checks/C06/`, `/names/jared-kushner/`, `/map/topic/gulf-money/` |
| Data | All of `graph-data.js` on every visit (about 1.3 MB gzipped) | A core file for the lists, search, map and matrix (about 260 KB gzipped), plus one detail file per check, fetched when its page is opened |
| Content before JavaScript runs | None | Each page carries its text in the HTML: the check with its points, corrections, the other side and sources; the profile with its figures, strongest connections and checks |
| Page head | Set by the artifact host | Its own title, description, canonical link, Open Graph and Twitter tags |
| File names | Fixed | Content-hashed under `/assets/`, cacheable for a year |
| Third-party script | d3 from cdnjs (`index.html` loads it; the code no longer calls it) | None |

How `app.js` tells them apart: the site's pages load a small start-up file that sets `window.__SITE__ = { base: '/' }`. With it, every link is a path, moving between pages uses the History API, and an address from the hash-routed version (`/#C06`) is rewritten to its path. Without it nothing changes: hash routes, all data in memory. All links are made by one function, `U()`, at the top of `app.js`.

Site addresses: `/`, `/checks/`, `/checks/<ID>/`, `/names/`, `/names/<slug>/`, `/method/`, `/map/`, `/map/matrix/`, `/map/topic/<slug>/`. A topic has no page of its own; it is a section of the checks list, `/checks/#topic-<slug>`. A selection on the map is `/map/#<slug or ID>`. Anything else answers with `404.html`.

**Building the site.** `node make_site.mjs` needs Node 18 or later and nothing else. It reads `map/` and `static/og.png` and rewrites `site/` from scratch. Set `SITE_URL` to the public address (for example `SITE_URL=https://example.org node make_site.mjs`) to get canonical links, `og:url`, `og:image` and `sitemap.xml`; on Render the build falls back to `RENDER_EXTERNAL_URL`. Without either, those are left out. `SITE_BASE` sets a path prefix if the site is not served from the root.

**Deploying.** `render.yaml` describes a Render static site: build command `node make_site.mjs`, publish directory `site/`, long-lived caching for `/assets/`, revalidation for pages, and a Content-Security-Policy that allows scripts and data from the site only and fonts from Google Fonts. It has no rewrite rules, so a wrong address is a real 404.

**Checking it.**

```
node make_site.mjs
node tools/check_links.js     # every internal link in every page resolves
node tools/crawl_site.js      # Playwright: content in the raw HTML, the interface, navigation, old addresses, 404, sizes
node cook/harness/shots.js 10 && node cook/harness/globefunc.js && node cook/harness/contrast.js   # the artifact build
```

`node tools/make_og.js` redraws `static/og.png` from the dark map. It needs Playwright; the site build does not.

## Corrections

If a finding is wrong or out of date, the fix belongs in the check's `data/claims/Cxx.json` and `research/Cxx-*.md`, with a source, followed by a rebuild.
