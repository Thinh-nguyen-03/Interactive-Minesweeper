# The Trump Connection

An interactive investigative map of the documented business, financial and political connections around Donald Trump, his family and his administration, with source-cited checks of 94 claims.

It is a static website with four parts:

- **Checks.** Each claim is split into separate points, tested against the public record, and given a verdict, with corrections, the other side's response and every source listed.
- **People & Organisations.** A profile for each of about 1,300 names, with its documented connections, largest sums, timeline and the checks that mention it.
- **Network.** A 3D graph of every name and every documented link, which you can rotate, zoom, filter by topic and trace paths through.
- **Matrix.** A clustered heatmap of who is linked to whom, with the evidence behind each pair.

This is a verification project, not an accusation. Everyone named denies wrongdoing, and nothing here alleges a crime. A link between two names means a documented relationship. It does not show that one thing caused another.

## What is in it

| | Count |
|---|---|
| Checks of claims and of the questions they raised | 60 |
| Connection checks (cross-referencing across checks) | 34 |
| Topics the checks are grouped under | 9 |
| Individual points checked | 834 |
| Sources cited | about 3,300 |
| People, organisations and other names | 1,332 |
| Documented links between them | 2,926 |

Verdicts across the 94 checks: 2 confirmed, 79 mostly accurate, 11 partly accurate, 2 unverified. Of the 834 points, 589 hold up, 146 needed correcting and 99 are unproven. All 94 checks have had an independent second review. `python3 build.py` prints the current counts.

"Mostly accurate" usually means the core facts hold and specific figures, dates or framings needed correcting. The corrections are listed on each check's page.

The nine topics are Family Ventures & Wealth; Crypto Ventures; Trump Media & Markets; Gulf Money; Foreign Deals; Regulators & Enforcement; Pardons, Lobbyists & Access; Defence, Minerals & Contracts; and Tech & Media Companies. They are defined in `data/topics.json`.

## How the research was done

1. The starting point was a set of claims in public circulation about the Trump family's business dealings: the crypto ventures, the Gulf investments, Trump Media, the pardons and the dropped enforcement cases. Each was written down as a specific claim that can be tested (`data/claims-index.json`).
2. Each claim was researched by its own AI research agent, which split it into separate points, checked every figure, date and name against news reporting, filings and official releases, and recorded what the people named say in reply.
3. Related stories and open questions that surfaced along the way became further checks, each researched the same way.
4. Connection checks then cross-referenced the finished files for recurring lawyers, lobbyists, financiers, shell entities, investors and foreign partners, and searched outward to confirm and date each link.
5. An independent second reviewer re-checked the most consequential assertions in each check with fresh searches and corrected the files where needed. Each check's file records the result in an `audit` field.

### Verdicts

- **Confirmed**: the record supports the claim as stated.
- **Mostly accurate**: the core facts hold; specific figures, dates or framings needed correcting.
- **Partly accurate**: some parts hold up and others do not.
- **Misleading**: the underlying facts exist, but the framing gives a wrong impression.
- **Unverified**: an allegation that could not be independently corroborated. It is neither confirmed nor refuted.
- **False**: the record contradicts the claim.

### Evidence grades

Links are graded by how well they are sourced:

- **Documented**: filings, official records or several outlets.
- **Single-source**: one outlet, or anonymous sourcing.
- **Inferred**: our own observation from timing or co-occurrence. No source asserts it.

An inferred link is never presented as fact, and unverified links are drawn differently from documented ones. A documented relationship is not proof of wrongdoing.

### Limits

- The research was done by AI agents and has not been reviewed line by line by a person. Treat it as a well-sourced starting point and check the cited sources before relying on a finding.
- Most findings rest on search-result excerpts that agree across several outlets, not on reading the original articles, filings or court dockets in full. This is why most checks are rated medium confidence.
- Two checks (C37 and C46, about Jared Kushner) are single-source allegations from one book, denied by everyone named. They are marked unverified wherever they appear.
- The inference that a payment bought an official act is not established in any check. Where a claim implies it, the point is marked unverified.
- Research ran in November 2026. Later developments are not reflected.

## Running it locally

You need Node 18 or later. Python 3 is needed only if you change the data.

```
node make_site.mjs        # builds the site into site/
node tools/serve_site.js  # serves it at http://localhost:8080/
```

After editing anything under `data/` or `research/`, regenerate the data first:

```
python3 build.py          # rewrites map/graph-data.js and vault/; standard library only
node make_site.mjs
```

The same graph is also available as an Obsidian vault: open the `vault/` folder in Obsidian and use the graph view.

## Deploying

The site is plain static files, with no server and no database. `render.yaml` is a ready-made blueprint for a [Render](https://render.com) static site:

1. In Render, choose **New → Blueprint** and select this repository and branch.
2. Render runs `node make_site.mjs` and publishes `site/`. Every later push redeploys.
3. If you add a custom domain, set the environment variable `SITE_URL` to the full address (for example `https://example.org`) so the sitemap, canonical links and link previews use it. Without it the build uses the onrender.com address.

Any other static host works the same way: run `node make_site.mjs` and publish the `site/` folder.

## How the site is built

`map/` is the source of the interface: `index.html`, the stylesheets, `app.js`, `matrix.js` and the generated `graph-data.js`. `make_site.mjs` turns it into the deployable site:

- **One pre-built page per address**: `/`, `/checks/`, `/checks/<ID>/`, `/names/`, `/names/<slug>/`, `/method/`, `/map/`, `/map/matrix/`, `/map/topic/<slug>/`, plus `404.html`. Each has its own title, description and link-preview tags, and carries its text in the HTML, so it is readable before any script runs.
- **Split data**: a core file for the lists, search, network and matrix (about 260 KB compressed), and one detail file per check, fetched when that check is opened.
- **Hashed assets** under `/assets/`, cacheable for a year.
- **Headers** set in `render.yaml`: a Content-Security-Policy that allows scripts and data from the site only and fonts from Google Fonts, and revalidation for pages so a new deploy is picked up at once.

A topic has no page of its own; it is a section of the checks list (`/checks/#topic-<slug>`). A selection on the map is `/map/#<slug or ID>`.

`map/` can also be opened as a single page with hash addresses (`#C06`, `#name-jared-kushner`, `#map`), which is how preview builds are published. `app.js` serves both forms: the site's pages set `window.__SITE__`, which switches links to real paths and navigation to the History API. All links are made by one function, `U()`, at the top of `app.js`.

### Checks

```
node make_site.mjs
node tools/check_links.js     # every internal link in every page resolves
node tools/crawl_site.js      # Playwright: content in the raw HTML, the interface, navigation, old addresses, 404, sizes
node cook/harness/shots.js 10 && node cook/harness/globefunc.js && node cook/harness/contrast.js   # single-page build: renders, network behaviour, text contrast
```

`node tools/make_og.js` redraws the link-preview image `static/og.png`. These checks need Playwright; the site build does not.

## Repository layout

| Path | Contents |
|---|---|
| `data/claims-index.json` | The list of all checks: display title, the question checked, topic, kind, parent checks, and a `hidden` flag for anything not shown |
| `data/topics.json` | The nine topics, in display order, with a one-line description each |
| `data/claims/Cxx.json` | Structured findings per check: verdict, sub-claims, corrections, denials, sources, entities, relationships, leads, audit |
| `research/Cxx-*.md` | The long-form report for each check |
| `data/base-graph.json` | Shared entities, relationships and recurring themes |
| `build.py` | Merges everything into `map/graph-data.js` and the Obsidian vault |
| `map/` | The interface source |
| `make_site.mjs` | Builds `site/`, the deployable static site (Node, no dependencies) |
| `render.yaml`, `.node-version` | The Render blueprint and the Node version it builds with |
| `static/og.png` | The link-preview image |
| `tools/` | A local static server, the crawl test, the link check and the preview-image script |
| `cook/` | Design-round notes and the render, behaviour and contrast checks |
| `vault/` | The same graph as an Obsidian vault, one note per check, name and theme |
| `SCHEMA.md` | The data contract and the instructions the research agents followed |
| `site/` | Build output. Not committed |

Other files and folders in the root are working material and are not read by the build.

## Corrections

If a finding is wrong or out of date, the fix belongs in the check's `data/claims/Cxx.json` and `research/Cxx-*.md`, with a source, followed by a rebuild. Corrections with a source are welcome as issues or pull requests.
