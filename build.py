#!/usr/bin/env python3
"""Build the claims map.

Merges
  data/claims-index.json      claim list
  data/claims/Cxx.json        per-claim verification (see SCHEMA.md)
  data/base-graph.json        shared entities / relationships / themes (optional)
  research/Cxx-<slug>.md      long-form reports (optional)
into
  map/graph-data.js           window.GRAPH = {...}  (read by map/index.html, no server needed)
  vault/                      an Obsidian vault: one note per claim, entity and theme

Standard library only. Every input is optional or may be partial; missing
pieces degrade to "pending" rather than failing.  Run:  python3 build.py
"""
import json
import re
import shutil
import sys
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
RESEARCH = ROOT / "research"
MAP_DIR = ROOT / "map"
VAULT = ROOT / "vault"

# --------------------------------------------------------------------------
# Near-duplicate entity ids -> canonical id.  Add to this table when the
# build prints two ids that are plainly the same thing.
# --------------------------------------------------------------------------
ALIASES = {
    "dt-marks-defi-llc": "dt-marks-defi",
    "trump": "donald-trump",
    "president-trump": "donald-trump",
    "donald-j-trump": "donald-trump",
    "don-jr": "donald-trump-jr",
    "don-trump-jr": "donald-trump-jr",
    "cz": "changpeng-zhao",
    "changpeng-zhao-cz": "changpeng-zhao",
    "sheikh-tahnoon": "tahnoon-bin-zayed",
    "tahnoon": "tahnoon-bin-zayed",
    "sheikh-tahnoon-bin-zayed": "tahnoon-bin-zayed",
    "tahnoon-bin-zayed-al-nahyan": "tahnoon-bin-zayed",
    "mbz": "mohamed-bin-zayed",
    "mohammed-bin-zayed": "mohamed-bin-zayed",
    "mbs": "mohammed-bin-salman",
    "mohamed-bin-salman": "mohammed-bin-salman",
    "wlf": "world-liberty-financial",
    "wlfi": "wlfi-token",
    "world-liberty": "world-liberty-financial",
    "world-liberty-financial-llc": "world-liberty-financial",
    "tmtg": "trump-media-technology-group",
    "trump-media": "trump-media-technology-group",
    "trump-media-and-technology-group": "trump-media-technology-group",
    "djt": "trump-media-technology-group",
    "pif": "saudi-pif",
    "public-investment-fund": "saudi-pif",
    "saudi-public-investment-fund": "saudi-pif",
    "alt5": "alt5-sigma",
    "alt5-sigma-corp": "alt5-sigma",
    "affinity": "affinity-partners",
    "drw": "drw-investments",
    "cumberland": "cumberland-drw",
    "trump-org": "trump-organization",
    "the-trump-organization": "trump-organization",
    "trump-meme-coin": "trump-coin",
    "trump-memecoin": "trump-coin",
    "official-trump": "trump-coin",
    "melania-meme-coin": "melania-coin",
    "melania-memecoin": "melania-coin",
    "wlfi-tokens": "wlfi-token",
    "usd1-stablecoin": "usd1",
    "t1": "t1-phone",
    "trump-t1-phone": "t1-phone",
    "congress": "us-congress",
    "doj": "us-doj",
    "justice-department": "us-doj",
    "department-of-justice": "us-doj",
    "treasury": "us-treasury",
    "treasury-department": "us-treasury",
    "commerce-department": "us-commerce-department",
    "department-of-defense": "pentagon",
    "dod": "pentagon",
    "defense-department": "pentagon",
    "united-arab-emirates": "uae",
    "wsj": "wall-street-journal",
    "the-wall-street-journal": "wall-street-journal",
    "nyt": "new-york-times",
    "the-new-york-times": "new-york-times",
    "twitter": "x-twitter",
    "x": "x-twitter",
    "stargate-project": "stargate",
    "strategic-bitcoin-reserve-eo": "strategic-bitcoin-reserve",
    "oge": "office-of-government-ethics",
    "qia": "qatar-investment-authority",
    "boeing-747-qatar": "qatar-jet",
    "qatar-747": "qatar-jet",
    "tron-dao": "tron",
    "tron-foundation": "tron",
    "polymarket-us": "polymarket",
    "1789": "1789-capital",
}

VERDICTS = ["confirmed", "mostly-accurate", "partly-accurate", "misleading",
            "unverified", "false", "pending"]
VERDICT_SYNONYMS = {
    "true": "confirmed", "accurate": "confirmed", "correct": "confirmed",
    "mostly-true": "mostly-accurate", "largely-accurate": "mostly-accurate",
    "largely-confirmed": "mostly-accurate", "mostly-confirmed": "mostly-accurate",
    "partially-accurate": "partly-accurate", "partly-true": "partly-accurate",
    "partially-true": "partly-accurate", "mixed": "partly-accurate",
    "partly-confirmed": "partly-accurate", "partially-confirmed": "partly-accurate",
    "unproven": "unverified", "unconfirmed": "unverified", "unsupported": "unverified",
    "incorrect": "false", "inaccurate": "false", "wrong": "false",
}
ENTITY_TYPES = ["person", "company", "government", "fund", "asset", "country",
                "law", "media", "event", "product"]
REL_TYPES = ["money", "ownership", "family", "regulatory", "advisory",
             "political", "legal", "media", "commercial"]
# claude.ai reserves these hash names; a node may not use them.
RESERVED_HASHES = {"settings", "sidebar", "customize", "upgrade", "downloads",
                   "map", "claims", "common"}

warnings = []


def warn(msg):
    warnings.append(msg)


def load_json(path, default):
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # partial write by a concurrent producer, etc.
        warn(f"could not parse {path.relative_to(ROOT)}: {exc}")
        return default


def as_list(v):
    if v is None:
        return []
    if isinstance(v, list):
        return v
    return [v]


def slugify(text):
    text = str(text or "").strip().lower()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def canon(raw):
    """Canonical entity id: kebab-case, then the alias table."""
    eid = slugify(raw)
    seen = set()
    while eid in ALIASES and eid not in seen:
        seen.add(eid)
        eid = ALIASES[eid]
    return eid


def norm_verdict(raw, where=""):
    if not raw:
        return "pending"
    v = slugify(raw)
    v = VERDICT_SYNONYMS.get(v, v)
    if v in VERDICTS:
        return v
    for known in VERDICTS:           # "confirmed-with-nuance" -> confirmed
        if v.startswith(known):
            return known
    warn(f"unknown verdict {raw!r} {where} -> treated as unverified")
    return "unverified"


def clean_str(v):
    return v.strip() if isinstance(v, str) else ""


def title_from_id(eid):
    small = {"of", "and", "the", "for", "in", "bin"}
    words = eid.split("-")
    return " ".join(w if (w in small and i) else w.capitalize() for i, w in enumerate(words))


def claim_sort_key(cid):
    m = re.match(r"([A-Za-z]+)(\d+)(.*)", cid)
    return (m.group(1), int(m.group(2)), m.group(3)) if m else (cid, 0, "")


# --------------------------------------------------------------------------
# Load
# --------------------------------------------------------------------------
def load_inputs():
    index = load_json(DATA / "claims-index.json", [])
    if isinstance(index, dict):
        index = index.get("claims", [])
    index = [c for c in index if isinstance(c, dict) and c.get("id")]

    claim_files = {}
    cdir = DATA / "claims"
    if cdir.is_dir():
        for p in sorted(cdir.glob("*.json")):
            d = load_json(p, None)
            if isinstance(d, dict):
                cid = str(d.get("id") or p.stem)
                claim_files[cid] = d

    reports = {}
    if RESEARCH.is_dir():
        for p in sorted(RESEARCH.glob("*.md")):
            m = re.match(r"([A-Za-z]+\d+[A-Za-z]?)[-_ ]", p.name)
            if not m:
                continue
            try:
                reports[m.group(1).upper()] = (p.name, p.read_text(encoding="utf-8"))
            except Exception as exc:
                warn(f"could not read {p.name}: {exc}")

    base = load_json(DATA / "base-graph.json", {})
    if not isinstance(base, dict):
        base = {}
    return index, claim_files, reports, base


# --------------------------------------------------------------------------
# Merge
# --------------------------------------------------------------------------
class Entities:
    def __init__(self):
        self.by_id = {}

    def add(self, raw_id, name=None, etype=None, description=None, aliases=None,
            origin="", authoritative=False):
        eid = canon(raw_id)
        if not eid:
            return None
        e = self.by_id.get(eid)
        if e is None:
            e = self.by_id[eid] = {
                "id": eid, "names": Counter(), "types": Counter(), "descs": [],
                "aliases": set(), "raw_ids": set(), "base_name": None,
                "base_type": None, "stub": True,
            }
        raw_slug = slugify(raw_id)
        if raw_slug != eid:
            e["raw_ids"].add(raw_slug)
        name = clean_str(name)
        if name:
            e["names"][name] += 1
            e["stub"] = False
            if authoritative and not e["base_name"]:
                e["base_name"] = name
        etype = slugify(etype) if etype else ""
        if etype:
            if etype not in ENTITY_TYPES:
                warn(f"entity {eid}: unknown type {etype!r} ({origin})")
            else:
                e["types"][etype] += 1
                if authoritative and not e["base_type"]:
                    e["base_type"] = etype
        description = clean_str(description)
        if description and description.lower() not in {d.lower() for d in e["descs"]}:
            if authoritative:
                e["descs"].insert(0, description)
            else:
                e["descs"].append(description)
        for a in as_list(aliases):
            a = clean_str(a)
            if a:
                e["aliases"].add(a)
        return eid

    def finish(self):
        out = {}
        for eid, e in self.by_id.items():
            name = e["base_name"] or (e["names"].most_common(1)[0][0] if e["names"] else title_from_id(eid))
            etype = e["base_type"] or (e["types"].most_common(1)[0][0] if e["types"] else "company")
            if len(e["types"]) > 1 and not e["base_type"]:
                warn(f"entity {eid}: conflicting types {dict(e['types'])} -> {etype}")
            descs = e["descs"]
            if e["base_type"] is None and descs:
                # no authoritative description: lead with the fullest one
                descs = sorted(descs, key=len, reverse=True)
            aliases = sorted({a for a in (set(e["names"]) | e["aliases"]) if a != name})
            out[eid] = {
                "id": eid, "name": name, "type": etype,
                "description": descs[0] if descs else "",
                "more": descs[1:6],
                "aliases": aliases,
                "stub": e["stub"],
            }
        return out


def merge(index, claim_files, reports, base):
    ents = Entities()
    rels = {}          # key -> relationship
    claim_ents = defaultdict(dict)   # cid -> {eid: inferred?}
    claims = {}
    order = []

    # ---- claims: index first, then any claim file / report not in the index
    for c in index:
        cid = str(c["id"])
        claims[cid] = {"id": cid, "slug": clean_str(c.get("slug")),
                       "title": clean_str(c.get("title")) or cid,
                       "claim": clean_str(c.get("claim")), "lines": clean_str(c.get("lines")),
                       "origin": "follow-up" if slugify(c.get("origin")) in ("follow-up", "followup", "lead") else "video",
                       "parents": [str(x) for x in as_list(c.get("parents")) if x]}
        order.append(cid)
    for cid in sorted(set(claim_files) | set(reports), key=claim_sort_key):
        if cid not in claims:
            d = claim_files.get(cid, {})
            claims[cid] = {"id": cid, "slug": "", "title": clean_str(d.get("title")) or cid,
                           "claim": clean_str(d.get("claim")), "lines": "",
                           "origin": "follow-up" if slugify(d.get("origin")) in ("follow-up", "followup", "lead") else "video",
                           "parents": [str(x) for x in as_list(d.get("parents")) if x]}
            order.append(cid)
            if cid not in claim_files:
                warn(f"{cid}: report exists but claim is in neither the index nor data/claims/")
    order.sort(key=claim_sort_key)
    for cid in order:
        kept = []
        for par in claims[cid]["parents"]:
            if par in claims and par != cid:
                kept.append(par)
            else:
                warn(f"{cid}: unknown parent claim {par}")
        claims[cid]["parents"] = kept

    # ---- base graph entities (authoritative names/types)
    for e in as_list(base.get("entities")):
        if isinstance(e, dict) and e.get("id"):
            ents.add(e["id"], e.get("name"), e.get("type"), e.get("description"),
                     e.get("aliases"), "base-graph", authoritative=True)

    def add_rel(r, cid=None, origin=""):
        if not isinstance(r, dict):
            return
        s, t = canon(r.get("source")), canon(r.get("target"))
        if not s or not t or s == t:
            return
        label = clean_str(r.get("label")) or "linked to"
        rtype = slugify(r.get("type")) or "commercial"
        if rtype not in REL_TYPES:
            warn(f"relationship {s} -> {t}: unknown type {rtype!r} ({origin})")
        for end in (s, t):
            if end not in ents.by_id:
                ents.add(end, origin=origin)
                dangling.add(end)
        key = (s, t, re.sub(r"[^a-z0-9]+", " ", label.lower()).strip())
        rel = rels.get(key)
        if rel is None:
            rel = rels[key] = {"source": s, "target": t, "label": label, "type": rtype,
                               "claims": [], "date": "", "amount_usd": None}
        for c2 in ([cid] if cid else []) + [str(x) for x in as_list(r.get("claims"))]:
            if c2 and c2 not in rel["claims"]:
                rel["claims"].append(c2)
        d = r.get("date")
        if d and not rel["date"]:
            rel["date"] = str(d)
        amt = r.get("amount_usd")
        if isinstance(amt, (int, float)) and not isinstance(amt, bool) and rel["amount_usd"] is None:
            rel["amount_usd"] = amt

    dangling = set()

    # ---- per-claim verification files
    for cid in order:
        c = claims[cid]
        d = claim_files.get(cid)
        rep = reports.get(cid)
        c["report"] = rep[1] if rep else ""
        c["report_file"] = rep[0] if rep else ""
        c["verified"] = bool(d)
        if d:
            if clean_str(d.get("title")) and c["title"] == cid:
                c["title"] = clean_str(d["title"])
            c["verdict"] = norm_verdict(d.get("verdict"), f"in {cid}")
            c["confidence"] = slugify(d.get("confidence")) or ""
            c["summary"] = clean_str(d.get("summary"))
            subs = []
            for s in as_list(d.get("sub_claims")):
                if isinstance(s, str):
                    s = {"statement": s}
                if not isinstance(s, dict):
                    continue
                subs.append({
                    "statement": clean_str(s.get("statement")),
                    "verdict": norm_verdict(s.get("verdict"), f"in {cid} sub-claim"),
                    "finding": clean_str(s.get("finding")),
                    "sources": [u for u in as_list(s.get("sources")) if isinstance(u, str)],
                })
            c["sub_claims"] = subs
            c["corrections"] = [x for x in as_list(d.get("corrections")) if isinstance(x, str)]
            c["denials_and_context"] = [x for x in as_list(d.get("denials_and_context")) if isinstance(x, str)]
            srcs = []
            for s in as_list(d.get("sources")):
                if isinstance(s, str):
                    s = {"url": s}
                if isinstance(s, dict):
                    srcs.append({"title": clean_str(s.get("title")), "publisher": clean_str(s.get("publisher")),
                                 "url": clean_str(s.get("url")), "date": clean_str(str(s.get("date") or ""))})
            c["sources"] = srcs
            leads = []
            for l in as_list(d.get("leads")):
                if isinstance(l, dict):
                    leads.append({"title": clean_str(l.get("title")),
                                  "why_connected": clean_str(l.get("why_connected")),
                                  "entities": [canon(x) for x in as_list(l.get("entities")) if x],
                                  "source_url": clean_str(l.get("source_url"))})
            c["leads"] = leads
            for e in as_list(d.get("entities")):
                if isinstance(e, dict) and e.get("id"):
                    eid = ents.add(e["id"], e.get("name"), e.get("type"), e.get("description"),
                                   e.get("aliases"), cid)
                    if eid:
                        claim_ents[cid][eid] = False
            for r in as_list(d.get("relationships")):
                add_rel(r, cid, cid)
                if isinstance(r, dict):
                    for k in ("source", "target"):
                        eid = canon(r.get(k))
                        if eid:
                            claim_ents[cid].setdefault(eid, False)
        else:
            c.update({"verdict": "pending", "confidence": "", "summary": "", "sub_claims": [],
                      "corrections": [], "denials_and_context": [], "sources": [], "leads": []})
            if rep:   # a report without its JSON yet: take the headline verdict from it
                m = re.search(r"\*\*\s*Verdict:?\s*\**\s*([A-Za-z][A-Za-z \-]+?)\s*\**\s*(\(|$|\.|,|;|\u2014|\*)",
                              rep[1], re.M | re.I)
                if m:
                    v = slugify(m.group(1))
                    v = VERDICT_SYNONYMS.get(v, v)
                    if v in VERDICTS:
                        c["verdict"] = v
                        c["verdict_from_report"] = True
                m2 = re.search(r"confidence:?\s*\**\s*(high|medium|low)", rep[1][:1500], re.I)
                if m2 and c.get("verdict_from_report"):
                    c["confidence"] = m2.group(1).lower()

    # ---- base graph relationships / claim-entity table / themes
    for r in as_list(base.get("relationships")):
        add_rel(r, None, "base-graph")
    ce = base.get("claim_entities")
    if isinstance(ce, dict):
        for cid, ids in ce.items():
            cid = str(cid)
            if cid not in claims:
                warn(f"base-graph claim_entities: unknown claim {cid}")
                continue
            for raw in as_list(ids):
                eid = canon(raw)
                if not eid:
                    continue
                if eid not in ents.by_id:
                    ents.add(eid, origin="base-graph claim_entities")
                    dangling.add(eid)
                claim_ents[cid].setdefault(eid, False)

    # relationships name their claims too
    for rel in rels.values():
        kept = []
        for cid in rel["claims"]:
            if cid in claims:
                kept.append(cid)
                claim_ents[cid].setdefault(rel["source"], False)
                claim_ents[cid].setdefault(rel["target"], False)
            else:
                warn(f"relationship {rel['source']} -> {rel['target']}: unknown claim {cid}")
        rel["claims"] = sorted(kept, key=claim_sort_key)

    # leads may point at entities nobody defined
    for cid in order:
        for l in claims[cid]["leads"]:
            l["entities"] = [e for e in l["entities"] if e]
            for e in l["entities"]:
                if e not in ents.by_id:
                    warn(f"{cid} lead {l['title'][:40]!r}: entity {e} is not defined anywhere (shown as text)")

    entities = ents.finish()
    for eid in sorted(dangling):
        if entities[eid]["stub"]:
            warn(f"dangling entity id {eid!r}: referenced but never defined (stub node created)")

    # ---- claims still without any entity: infer from names in the claim text
    name_index = []
    for e in entities.values():
        for n in [e["name"]] + e["aliases"]:
            if len(n) >= 4:
                name_index.append((n, e["id"]))
    name_index.sort(key=lambda x: -len(x[0]))
    for cid in order:
        if claim_ents[cid]:
            continue
        text = claims[cid]["title"] + ". " + claims[cid]["claim"]
        for n, eid in name_index:
            if re.search(r"(?<![A-Za-z0-9])" + re.escape(n) + r"(?![A-Za-z0-9])", text):
                claim_ents[cid].setdefault(eid, True)

    # ---- themes
    themes = []
    used_theme_ids = set()
    for t in as_list(base.get("themes")):
        if not isinstance(t, dict):
            continue
        tid = slugify(t.get("id") or t.get("name"))
        if not tid or tid in used_theme_ids:
            continue
        used_theme_ids.add(tid)
        tclaims, tents = [], []
        for cid in as_list(t.get("claims")):
            cid = str(cid)
            if cid in claims:
                tclaims.append(cid)
            else:
                warn(f"theme {tid}: unknown claim {cid}")
        for raw in as_list(t.get("entities")):
            eid = canon(raw)
            if eid in entities:
                tents.append(eid)
            else:
                warn(f"theme {tid}: unknown entity {raw}")
        themes.append({"id": tid, "name": clean_str(t.get("name")) or title_from_id(tid),
                       "description": clean_str(t.get("description")),
                       "claims": sorted(set(tclaims), key=claim_sort_key),
                       "entities": sorted(set(tents))})

    return claims, order, entities, list(rels.values()), claim_ents, themes


# --------------------------------------------------------------------------
# Graph assembly
# --------------------------------------------------------------------------
def assemble(claims, order, entities, rels, claim_ents, themes):
    used = set(c.lower() for c in order)
    nodes = []
    key_of = {}

    def uniq_hash(want):
        h = re.sub(r"[^A-Za-z0-9-]+", "-", want).strip("-") or "node"
        if h.lower() in RESERVED_HASHES or h.lower().startswith("comment-") or h.lower() in used:
            h = "e-" + h
        base_h, i = h, 2
        while h.lower() in used:
            h = f"{base_h}-{i}"
            i += 1
        used.add(h.lower())
        return h

    for cid in order:
        c = claims[cid]
        n = dict(c)
        n.update({"key": cid, "kind": "claim", "hash": cid, "name": c["title"]})
        nodes.append(n)
    for eid in sorted(entities):
        e = entities[eid]
        n = dict(e)
        n.update({"key": "e:" + eid, "kind": "entity", "hash": uniq_hash(eid)})
        nodes.append(n)
    for t in themes:
        n = {"key": "t:" + t["id"], "kind": "theme", "hash": uniq_hash(t["id"] if t["id"].startswith("theme-") else "theme-" + t["id"]),
             "id": t["id"], "name": t["name"], "description": t["description"],
             "claims": t["claims"], "entities": ["e:" + e for e in t["entities"]]}
        nodes.append(n)
    for n in nodes:
        key_of[n["key"]] = n

    links = []
    for cid in order:
        for eid, inferred in sorted(claim_ents.get(cid, {}).items()):
            if eid in entities:
                l = {"s": cid, "t": "e:" + eid, "k": "claim"}
                if inferred:
                    l["inferred"] = True
                links.append(l)
    rel_out = []
    for r in sorted(rels, key=lambda r: (r["source"], r["target"], r["label"])):
        o = {"s": "e:" + r["source"], "t": "e:" + r["target"], "k": "rel",
             "label": r["label"], "type": r["type"], "claims": r["claims"]}
        if r["date"]:
            o["date"] = r["date"]
        if r["amount_usd"] is not None:
            o["amount_usd"] = r["amount_usd"]
        rel_out.append(o)
    for t in themes:
        for cid in t["claims"]:
            links.append({"s": "t:" + t["id"], "t": cid, "k": "theme"})
    for cid in order:
        for par in claims[cid]["parents"]:
            links.append({"s": cid, "t": par, "k": "parent"})

    neigh = defaultdict(set)
    for l in links + rel_out:
        if l["s"] in key_of and l["t"] in key_of:
            neigh[l["s"]].add(l["t"])
            neigh[l["t"]].add(l["s"])
    for n in nodes:
        n["degree"] = len(neigh[n["key"]])
        if n["kind"] == "entity":
            n["claim_count"] = sum(1 for k in neigh[n["key"]] if key_of[k]["kind"] == "claim")

    tally = Counter(claims[c]["verdict"] for c in order)
    graph = {
        "meta": {
            "generated": date.today().isoformat(),
            "claims": len(order),
            "verified": sum(1 for c in order if claims[c]["verified"]),
            "video_claims": sum(1 for c in order if claims[c]["origin"] == "video"),
            "followups": sum(1 for c in order if claims[c]["origin"] == "follow-up"),
            "entities": len(entities),
            "themes": len(themes),
            "relationships": len(rel_out),
            "tally": {v: tally.get(v, 0) for v in VERDICTS},
            "verdicts": VERDICTS, "entity_types": ENTITY_TYPES, "rel_types": REL_TYPES,
            "source": "Coffeezilla, \u201cInvestigating The President\u201d",
        },
        "nodes": nodes,
        "links": links,
        "rels": rel_out,
    }
    return graph, neigh, key_of


def write_graph_js(graph):
    MAP_DIR.mkdir(exist_ok=True)
    js = json.dumps(graph, ensure_ascii=False, separators=(",", ":"))
    js = js.replace("\u2028", "\\u2028").replace("\u2029", "\\u2029").replace("</", "<\\/")
    out = MAP_DIR / "graph-data.js"
    out.write_text("/* Generated by build.py \u2014 do not edit. */\nwindow.GRAPH = " + js + ";\n", encoding="utf-8")
    return out


# --------------------------------------------------------------------------
# Obsidian vault
# --------------------------------------------------------------------------
VERDICT_LABEL = {"confirmed": "Confirmed", "mostly-accurate": "Mostly accurate",
                 "partly-accurate": "Partly accurate", "misleading": "Misleading",
                 "unverified": "Unverified", "false": "False", "pending": "Pending"}


def fname(text):
    text = re.sub(r'[\\/:*?"<>|#^\[\]]+', " ", text)
    text = re.sub(r"\s+", " ", text).strip(" .")
    return text[:90] or "untitled"


def yaml_str(s):
    return '"' + str(s).replace("\\", "\\\\").replace('"', '\\"').replace("\n", " ") + '"'


def frontmatter(d):
    lines = ["---"]
    for k, v in d.items():
        if v is None or v == "" or v == []:
            continue
        if isinstance(v, list):
            lines.append(f"{k}:")
            lines += [f"  - {yaml_str(x)}" for x in v]
        elif isinstance(v, (int, float)) and not isinstance(v, bool):
            lines.append(f"{k}: {v}")
        else:
            lines.append(f"{k}: {yaml_str(v)}")
    lines.append("---")
    return "\n".join(lines)


def money(n):
    if n is None:
        return ""
    a = abs(n)
    for div, suf in ((1e12, "T"), (1e9, "B"), (1e6, "M"), (1e3, "K")):
        if a >= div:
            return "$" + (f"{n / div:.2f}".rstrip("0").rstrip(".")) + suf
    return f"${n:,.0f}"


def write_vault(graph, neigh, key_of):
    for sub in ("Claims", "Entities", "Themes"):
        d = VAULT / sub
        if d.exists():
            shutil.rmtree(d)
        d.mkdir(parents=True)

    # unique note names
    note = {}
    taken = set()
    for n in graph["nodes"]:
        if n["kind"] == "claim":
            base = fname(f"{n['id']} {n['title']}")
        elif n["kind"] == "theme":
            base = fname("Theme - " + n["name"])
        else:
            base = fname(n["name"])
        name = base
        if name.lower() in taken:
            name = fname(f"{base} ({n['id']})")
        taken.add(name.lower())
        note[n["key"]] = name

    def wl(key, alias=None):
        nm = note[key]
        return f"[[{nm}|{alias}]]" if alias else f"[[{nm}]]"

    rels_by = defaultdict(list)
    for r in graph["rels"]:
        rels_by[r["s"]].append(r)
        rels_by[r["t"]].append(r)
    theme_of_claim = defaultdict(list)
    for n in graph["nodes"]:
        if n["kind"] == "theme":
            for c in n["claims"]:
                theme_of_claim[c].append(n["key"])
    inferred = {(l["s"], l["t"]) for l in graph["links"] if l.get("inferred")}

    def rel_line(r):
        extra = ", ".join(x for x in [r.get("date", ""), money(r.get("amount_usd")), r["type"]] if x)
        cl = " ".join(wl(c, c) for c in r["claims"])
        return f"- {wl(r['s'])} *{r['label']}* {wl(r['t'])} ({extra})" + (f" · {cl}" if cl else "")

    count = 0
    for n in graph["nodes"]:
        key = n["key"]
        out = []
        if n["kind"] == "claim":
            ents = sorted((k for k in neigh[key] if key_of[k]["kind"] == "entity"),
                          key=lambda k: key_of[k]["name"].lower())
            out.append(frontmatter({
                "id": n["id"], "kind": "claim", "title": n["title"], "verdict": n["verdict"],
                "confidence": n["confidence"], "origin": n["origin"], "transcript_lines": n["lines"],
                "parents": n["parents"], "aliases": [n["id"]],
                "tags": ["claim", "origin/" + n["origin"], "verdict/" + n["verdict"]],
            }))
            out.append(f"# {n['id']}: {n['title']}\n")
            conf = f" (confidence: {n['confidence']})" if n["confidence"] else ""
            out.append(f"**Verdict:** {VERDICT_LABEL[n['verdict']]}{conf}\n")
            if n["verdict"] == "pending":
                out.append("Verification of this claim has not been completed yet.\n")
            if n["claim"]:
                head = "Lead investigated" if n["origin"] == "follow-up" else "What the video said"
                out.append(f"## {head}\n\n> " + n["claim"] + "\n")
            if n["parents"]:
                out.append("## Follows up on\n")
                out += [f"- {wl(p)}" for p in n["parents"]]
                out.append("")
            kids = [c for c in graph["nodes"] if c["kind"] == "claim" and n["id"] in c["parents"]]
            if kids:
                out.append("## Follow-up checks\n")
                out += [f"- {wl(c['key'])} · {VERDICT_LABEL[c['verdict']]}" for c in kids]
                out.append("")
            if n["summary"]:
                out.append("## Summary\n\n" + n["summary"] + "\n")
            if n["sub_claims"]:
                out.append("## Sub-claims\n")
                for s in n["sub_claims"]:
                    out.append(f"- **{VERDICT_LABEL[s['verdict']]}**: {s['statement']}")
                    if s["finding"]:
                        out.append(f"  - {s['finding']}")
                    for u in s["sources"]:
                        out.append(f"  - <{u}>")
                out.append("")
            for head, k in (("Corrections", "corrections"), ("Denials and context", "denials_and_context")):
                if n[k]:
                    out.append(f"## {head}\n")
                    out += [f"- {x}" for x in n[k]]
                    out.append("")
            if theme_of_claim[key]:
                out.append("## Themes\n")
                out += [f"- {wl(t)}" for t in theme_of_claim[key]]
                out.append("")
            if ents:
                out.append("## People and organisations\n")
                for k in ents:
                    tag = " (named in the claim text)" if (key, k) in inferred else ""
                    out.append(f"- {wl(k)}{tag}")
                out.append("")
            crels = [r for r in graph["rels"] if n["id"] in r["claims"]]
            if crels:
                out.append("## Relationships documented\n")
                out += [rel_line(r) for r in crels]
                out.append("")
            if n["leads"]:
                out.append("## Leads not covered by the video\n")
                for l in n["leads"]:
                    links = " ".join(wl("e:" + e) if ("e:" + e) in note else e for e in l["entities"])
                    src = f" [source]({l['source_url']})" if l["source_url"] else ""
                    out.append(f"- **{l['title']}**: {l['why_connected']}{src}" + (f" · {links}" if links else ""))
                out.append("")
            if n["sources"]:
                out.append("## Sources\n")
                for i, s in enumerate(n["sources"], 1):
                    meta = ", ".join(x for x in [s["publisher"], s["date"]] if x)
                    t = s["title"] or s["url"]
                    out.append(f"{i}. [{t}]({s['url']})" + (f" ({meta})" if meta else "") if s["url"]
                               else f"{i}. {t}" + (f" ({meta})" if meta else ""))
                out.append("")
            if n["report"]:
                body = re.sub(r"^#\s.*\n", "", n["report"].lstrip(), count=1)
                body = re.sub(r"^(#{1,5})\s", lambda m: "#" + m.group(1) + " ", body, flags=re.M)
                out.append("## Full report\n\n" + body.strip() + "\n")
            sub = "Claims"
        elif n["kind"] == "entity":
            cl = sorted((k for k in neigh[key] if key_of[k]["kind"] == "claim"), key=claim_sort_key)
            out.append(frontmatter({
                "id": n["id"], "kind": "entity", "type": n["type"], "aliases": n["aliases"],
                "connections": n["degree"], "claims": len(cl),
                "tags": ["entity", "type/" + n["type"]],
            }))
            out.append(f"# {n['name']}\n")
            out.append(f"*{n['type']}*\n")
            if n["description"]:
                out.append(n["description"] + "\n")
            for d in n["more"]:
                out.append(f"- {d}")
            if n["more"]:
                out.append("")
            if cl:
                out.append("## Appears in claims\n")
                for k in cl:
                    c = key_of[k]
                    out.append(f"- {wl(k)} · {VERDICT_LABEL[c['verdict']]}")
                out.append("")
            if rels_by[key]:
                out.append("## Relationships\n")
                out += [rel_line(r) for r in rels_by[key]]
                out.append("")
            th = [t for t in graph["nodes"] if t["kind"] == "theme" and key in t["entities"]]
            if th:
                out.append("## Themes\n")
                out += [f"- {wl(t['key'])}" for t in th]
                out.append("")
            sub = "Entities"
        else:
            out.append(frontmatter({"id": n["id"], "kind": "theme", "tags": ["theme"]}))
            out.append(f"# {n['name']}\n")
            if n["description"]:
                out.append(n["description"] + "\n")
            if n["claims"]:
                out.append("## Claims\n")
                out += [f"- {wl(c)} · {VERDICT_LABEL[key_of[c]['verdict']]}" for c in n["claims"]]
                out.append("")
            if n["entities"]:
                out.append("## People and organisations\n")
                out += [f"- {wl(e)}" for e in n["entities"]]
                out.append("")
            sub = "Themes"
        (VAULT / sub / (note[key] + ".md")).write_text("\n".join(out).rstrip() + "\n", encoding="utf-8")
        count += 1

    # home note + graph colour groups so Obsidian's graph view matches the web map
    m = graph["meta"]
    home = [frontmatter({"kind": "index", "tags": ["index"]}),
            "# Trump Claims Map\n",
            f"A fact-check of {m['video_claims']} claims made in {m['source']}"
            + (f", plus {m['followups']} follow-up leads the video did not cover" if m["followups"] else "")
            + ". Each claim was checked "
            "independently against public records and reporting. Open the graph view to explore.\n",
            "Everyone named denies wrongdoing. Nothing here is an accusation of a crime.\n",
            "## Verdicts\n"]
    home += [f"- {VERDICT_LABEL[v]}: {m['tally'][v]}" for v in VERDICTS if m["tally"][v]]
    home.append("\n## Claims\n")
    home += [f"- {wl(n['key'])} · {VERDICT_LABEL[n['verdict']]}" for n in graph["nodes"] if n["kind"] == "claim"]
    themes = [n for n in graph["nodes"] if n["kind"] == "theme"]
    if themes:
        home.append("\n## Themes\n")
        home += [f"- {wl(t['key'])}" for t in themes]
    home.append("\n## Most connected\n")
    top = sorted((n for n in graph["nodes"] if n["kind"] == "entity"), key=lambda n: -n["degree"])[:25]
    home += [f"- {wl(n['key'])} ({n.get('claim_count', 0)} claims, {n['degree']} connections)" for n in top]
    (VAULT / "Home.md").write_text("\n".join(home) + "\n", encoding="utf-8")

    obs = VAULT / ".obsidian"
    obs.mkdir(exist_ok=True)
    rgb = lambda h: int(h, 16)
    groups = [("tag:#verdict/confirmed", "4fae7f"), ("tag:#verdict/mostly-accurate", "8fb85a"),
              ("tag:#verdict/partly-accurate", "d6a13a"), ("tag:#verdict/misleading", "db7a3c"),
              ("tag:#verdict/unverified", "9aa3ad"), ("tag:#verdict/false", "d2554f"),
              ("tag:#verdict/pending", "6b7480"), ("tag:#theme", "c98fd0"),
              ("tag:#type/person", "e0c9a0"), ("tag:#entity", "6f9fc4")]
    gj = obs / "graph.json"
    cfg = load_json(gj, {}) if gj.exists() else {}
    if not isinstance(cfg, dict):
        cfg = {}
    cfg["colorGroups"] = [{"query": q, "color": {"a": 1, "rgb": rgb(h)}} for q, h in groups]
    cfg.setdefault("showTags", False)
    gj.write_text(json.dumps(cfg, indent=2), encoding="utf-8")
    return count + 1


# --------------------------------------------------------------------------
def main():
    index, claim_files, reports, base = load_inputs()
    if not index and not claim_files:
        print("No claims found (data/claims-index.json and data/claims/ are both empty).", file=sys.stderr)
    claims, order, entities, rels, claim_ents, themes = merge(index, claim_files, reports, base)
    graph, neigh, key_of = assemble(claims, order, entities, rels, claim_ents, themes)
    out = write_graph_js(graph)
    notes = write_vault(graph, neigh, key_of)

    m = graph["meta"]
    print("Claims map build")
    print(f"  claims         {m['claims']:>4}   ({m['verified']} with verification data, "
          f"{sum(1 for c in order if claims[c]['report'])} with a report)")
    print(f"  entities       {m['entities']:>4}")
    print(f"  themes         {m['themes']:>4}" + ("" if base else "   (data/base-graph.json not found)"))
    print(f"  relationships  {m['relationships']:>4}")
    print(f"  graph nodes    {len(graph['nodes']):>4}   edges {len(graph['links']) + len(graph['rels'])}")
    print(f"  origin         {m['video_claims']} from the video, {m['followups']} follow-up")
    print("  verdicts       " + ", ".join(f"{v} {m['tally'][v]}" for v in VERDICTS if m["tally"][v]))
    top = sorted((n for n in graph["nodes"] if n["kind"] == "entity"), key=lambda n: -n["degree"])[:8]
    print("  most connected " + ", ".join(f"{n['name']} ({n['degree']})" for n in top))
    pend = [c for c in order if claims[c]["verdict"] == "pending"]
    if pend:
        print("  pending        " + " ".join(pend))
    inf = sorted({l["s"] for l in graph["links"] if l.get("inferred")}, key=claim_sort_key)
    if inf:
        print("  entity links inferred from claim text (no data yet): " + " ".join(inf))
    iso = [n["key"] for n in graph["nodes"] if n["degree"] == 0]
    if iso:
        print(f"  unconnected nodes: {' '.join(iso)}")
    print(f"  wrote {out.relative_to(ROOT)} ({out.stat().st_size / 1024:.0f} KB), "
          f"{notes} notes in {VAULT.relative_to(ROOT)}/")
    if warnings:
        print(f"\n{len(warnings)} warning(s):")
        for w in warnings:
            print("  ! " + w)


if __name__ == "__main__":
    main()
