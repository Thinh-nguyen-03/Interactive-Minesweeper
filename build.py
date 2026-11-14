#!/usr/bin/env python3
"""Build the claims map.

Merges
  data/claims-index.json      list of checks (display_title, question, topic, hidden)
  data/topics.json            the topics the checks are grouped under, in display order
  data/claims/Cxx.json        per-claim verification (see SCHEMA.md)
  data/base-graph.json        shared entities / relationships / themes (optional)
  research/Cxx-<slug>.md      long-form reports (optional)
into
  map/graph-data.js           window.GRAPH = {...}  (read by map/index.html, no server needed)
  vault/                      an Obsidian vault: one note per claim, entity and theme

Standard library only. Every input is optional or may be partial; missing
pieces degrade to "pending" rather than failing.  Run:  python3 build.py
"""
import hashlib
import json
import math
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
    "trump-bible": "god-bless-the-usa-bible",
    "us-marine-corps": "marine-corps",
    "us-department-of-commerce": "us-commerce-department",
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
                   "map", "claims", "common", "names", "method", "home"}
RESERVED_PREFIXES = ("comment-", "name-", "map-")

# Nothing shown on the site or in the vault refers to where the first claims were collected from.
# Entities that exist only to describe that source are left out, and the build lists every
# reader-facing string that still matches BANNED so that the data can be reworded.
BANNED = re.compile(r"video|coffeezilla|transcript|narrator", re.I)
HIDDEN_ENTITIES = {"coffeezilla", "unnamed-lawyer", "patreon", "investigating-the-president-video",
                   "hyper-gamblification-video", "voidzilla"}

# Used only when data/topics.json is missing or a check has no topic in the index.
TOPIC_FALLBACK = [
    ("crypto-ventures", "Crypto ventures",
     "Meme coins, World Liberty Financial, its stablecoin and the people who bought in.",
     r"meme coin|\$trump|\$melania|world liberty|wlf|usd1|token|binance|alt5|bitcoin|crypto"),
    ("gulf-money", "Gulf money",
     "Investments, property deals and gifts involving the UAE, Saudi Arabia and Qatar.",
     r"uae|gulf|qatar|saudi|abu dhabi|tahnoon|mgx|affinity|damac|silver lake|sovereign"),
    ("regulators-and-enforcement", "Regulators and enforcement",
     "Cases dropped or settled, new laws, and the agencies that oversee family-linked firms.",
     r"\bsec\b|cftc|occ\b|enforcement|genius|clarity|charter|dropped|probes|revolving door|officials who"),
    ("pardons-lobbyists-and-access", "Pardons, lobbyists and access",
     "Clemency, paid intermediaries, donors and officials with earlier clients.",
     r"pardon|clemency|lobby|fixer|donor|ballroom|library|lawyers|schiller|dinner"),
    ("trump-media-and-markets", "Trump Media and markets",
     "Trump Media, Truth Social posts, stock trades and prediction markets.",
     r"tmtg|trump media|truth|stock|prediction market|polymarket|etf|market-moving|spac|yorkville"),
    ("defence-minerals-and-contracts", "Defence, minerals and contracts",
     "Federal contracts, loans and equity stakes near firms the family invests in or advises.",
     r"pentagon|drone|vulcan|mineral|rare earth|contract|robots|procurement|greenland|congo|federal backing"),
    ("family-ventures-and-wealth", "Family ventures and wealth",
     "What the family sells, owns and has earned, and who runs the vehicles.",
     r"wealth|merchandise|t1 phone|family|dominari|witkoff|kushner|melania|eric trump|don jr|shell"),
    ("foreign-deals", "Foreign deals",
     "Trump Organization and envoy-linked deals outside the Gulf.",
     r"foreign|albania|serbia|pakistan|russia|lukoil|hungary|tariff|kremlev|azerbaijan|tbilisi"),
    ("tech-and-media-companies", "Tech and media companies",
     "Settlements, donations and deals involving large technology and media firms.",
     r"tech|amazon|documentary|settlement|sacks|nvidia|chips|ellison|musk"),
]

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
# Text structuring.  The research files hold findings, denials and
# descriptions as paragraphs; the page wants short, separate statements.
# Nothing here rewrites meaning: sentences are split, never dropped, and the
# only wording change is the letter case of evidence-grade words that some
# files shout in capitals (DOCUMENTED -> documented).
# --------------------------------------------------------------------------
GRADE_WORDS = ["SINGLE-SOURCE", "SINGLE SOURCE", "DOCUMENTED", "INFERRED", "UNVERIFIED",
               "ESTIMATE", "ALLEGED"]
_GRADE_RE = re.compile(r"\b(" + "|".join(re.escape(w) for w in GRADE_WORDS) + r")\b")
_ABBR = {"jr", "sr", "inc", "corp", "co", "ltd", "llc", "mr", "mrs", "ms", "dr", "sen", "sens", "rep",
         "reps", "gov", "gen", "lt", "col", "st", "vs", "v", "u.s", "u.k", "u.a.e", "d.c", "e.g", "i.e",
         "etc", "approx", "est", "jan", "feb", "mar", "apr", "jun", "jul", "aug", "sep", "sept", "oct",
         "nov", "dec", "a.m", "p.m", "fig", "vol", "prof", "hon", "ret", "dept", "al", "cf", "bros",
         "ave", "pp", "p", "lit", "rel", "n.d", "s.d", "e.d", "w.d", "cal", "fla", "tex", "ex", "ed",
         "eds", "cir", "supp", "art", "para", "ch", "pres", "amb", "adm", "capt", "cmdr", "sgt", "rev",
         "messrs", "ph.d", "esq", "ft", "mt", "viz", "ca", "c"}
_GRADE_START = re.compile(r"(?i)^(evidence( grade)?\s*:|grade\s*:|documented\b|single[- ]source\b|inferred\b|"
                          r"each \w+ is documented|(the )?facts? (are )?documented)")
_BREAK = re.compile(r"[.!?]+[\"'’”)\]]*\s+")


def lower_grades(text):
    """DOCUMENTED / SINGLE-SOURCE / INFERRED -> ordinary case (capital only at a sentence start)."""
    def fix(m):
        w = m.group(1).lower()
        before = text[:m.start()].rstrip()
        return w.capitalize() if (not before or before[-1] in ".!?") else w
    return _GRADE_RE.sub(fix, text)


def tidy(text):
    """Display form of a free-text field: trimmed, single spaces, grade words in normal case."""
    return lower_grades(re.sub(r"\s+", " ", clean_str(text)))


def cap_first(text):
    """Capital first letter for text that stands alone as a row; leaves xAI, eToro, iPhone alone."""
    if not text:
        return text
    first = text.split(" ", 1)[0]
    if text[0].islower() and not any(ch.isupper() for ch in first[1:]):
        return text[0].upper() + text[1:]
    return text


def sentences(text):
    """Split a paragraph at sentence boundaries, keeping every word."""
    text = tidy(text)
    if not text:
        return []
    out, start, depth_at = [], 0, {}
    depth = 0
    for i, ch in enumerate(text):       # bracket depth, so "(... . ...)" stays whole
        if ch in "([":
            depth += 1
        elif ch in ")]" and depth:
            depth -= 1
        depth_at[i] = depth
    for m in _BREAK.finditer(text):
        end = m.end()
        if end >= len(text):
            break
        nxt = text[end]
        if not (nxt.isupper() or nxt.isdigit() or nxt in "\"'‘“$["):   # a following "(...)" stays with its sentence
            continue
        if depth_at.get(m.start(), 0) > 0:
            close = min([x for x in (text.find(")", m.start()), text.find("]", m.start())) if x >= 0] or [-1])
            if 0 <= close - m.start() < 400:
                continue
        word = re.search(r"([A-Za-z][A-Za-z.]*)$", text[start:m.start()])
        w = word.group(1).lower() if word else ""
        if w in _ABBR or (word and len(word.group(1)) == 1 and word.group(1).isupper()):
            continue
        if w == "no" and nxt.isdigit():
            continue
        out.append(text[start:end].strip())
        start = end
    out.append(text[start:].strip())
    merged = []
    for s in out:
        if merged and (len(s) < 24 or len(merged[-1]) < 24) and not _GRADE_START.match(merged[-1]):
            merged[-1] += " " + s
        elif s:
            merged.append(s)
    return merged


_MONTH = r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b\.?"
_QUAL = r"(?:(?:about|around|roughly|nearly|almost|over|under|up to|at least|more than|less than|approximately|an estimated|some)\s+|~\s?)?"
_NUM = r"\d+(?:,\d{3})*(?:\.\d+)?"
_UNIT = r"(?:\s?(?:trillion|billion|million|thousand)\b|[TBMKk]\b|\s?bn\b|\s?mn\b)?"
AMOUNT_RE = re.compile(
    _QUAL + r"(?:US)?\$\s?" + _NUM + _UNIT + r"(?:\s?(?:-|–|to)\s?\$?" + _NUM + _UNIT + r")?\+?"
    r"(?:/(?:month|year|day|share|token))?"
    r"|" + _QUAL + _NUM + r"(?:\s?(?:-|–)\s?" + _NUM + r")?\s?%", re.I)
DATE_RE = re.compile(
    r"\b(?:19|20)\d\d-\d\d(?:-\d\d)?\b"
    r"|\b\d{1,2}\s" + _MONTH + r"(?:\s(?:19|20)\d\d)?"
    r"|\b" + _MONTH + r"\s\d{1,2}(?:\s?(?:-|–)\s?\d{1,2})?(?:,\s(?:19|20)\d\d)?(?!\d)"
    r"|\b" + _MONTH + r"\s(?:19|20)\d\d\b"
    r"|\b(?:early|mid|late)[- ](?:" + _MONTH + r"\s)?(?:19|20)\d\d\b")


def figures(text, limit=5):
    """Amounts and dates quoted in a finding, in order of appearance, for an aligned side list."""
    def collect(rx):
        seen, out = set(), []
        for m in rx.finditer(text):
            v = re.sub(r"\s+", " ", m.group(0)).strip(" ,.")
            k = v.lower()
            if v and k not in seen:
                seen.add(k)
                out.append(v)
        return out[:limit]
    return collect(AMOUNT_RE), collect(DATE_RE)


def split_listing(sentence):
    """A long opening sentence of the form 'Head: a; b; c.' becomes the head plus its items."""
    if len(sentence) > 240 and ": " in sentence:
        head, rest = sentence.split(": ", 1)
        parts = [x.strip() for x in re.split(r";\s+", rest) if x.strip()]
        if len(head) >= 40 and len(parts) >= 3 and "(" not in head.rsplit(")", 1)[-1]:
            parts = [cap_first(re.sub(r"^and\s+", "", x)) for x in parts]
            parts[-1] = parts[-1].rstrip(".")
            return head + ":", parts
    return sentence, []


_GRADE_HINT = re.compile(r"\b(documented|single[- ]source|inferred)\b", re.I)


def split_grade(points):
    """Connection hunts open each finding with an evidence grade; lift it into its own field."""
    if not points:
        return "", points
    first = points[0]
    if len(first) <= 90 and _GRADE_START.match(first) and ": " not in re.sub(r"(?i)^(evidence( grade)?|grade)\s*:\s*", "", first):
        g = re.sub(r"(?i)^(evidence( grade)?|grade)\s*:\s*", "", first).rstrip(".")
        return cap_first(g), points[1:]
    return "", points


_SAID = re.compile(r"^(?:the\s+)?(transcript|video|brief|lead)\s+"
                   r"(says|said|states|stated|calls|called|lists|listed|implies|implied|frames|framed|"
                   r"groups|grouped|quotes|quoted|gives|gave|describes|described|puts|names|named|treats|"
                   r"suggests|suggested|claims|claimed)\b\s*(?:that\s+)?", re.I)


_CLAIMED = re.compile(r"^(?:claimed|claim|the claim|as claimed)\s*:\s*(.+?)[.;]?\s+(?:the\s+)?record(?:\s+shows)?\s*:\s*(.+)$", re.I)


def correction_pair(text):
    """'Claimed: X. The record shows: Y.' -> {said, record}.  None when it does not parse.

    The older wording ('<source> says X; the record says Y') is still read, and comes out the same way.
    """
    text = tidy(text)
    m = _CLAIMED.match(text)
    if m and len(m.group(2)) >= 12:
        return {"said": cap_first(m.group(1).rstrip(".")), "record": cap_first(m.group(2))}
    m = _SAID.match(text)
    if not m:
        return None
    cut = None
    for rx in (r";\s+", r"\.\s+In fact,?\s+", r",\s+but\s+", r"\.\s+But\s+", r"\.\s+(?=[A-Z\"'$0-9])"):
        mm = re.search(rx, text[m.end():])
        if mm and (cut is None or mm.start() < cut[0]):
            cut = (mm.start(), mm.end())
    if not cut:
        return None
    said_full = text[:m.end() + cut[0]]
    record = text[m.end() + cut[1]:].strip()
    if len(record) < 12:
        return None
    plain_verb = m.group(2).lower() in ("says", "said", "states", "stated")
    said = text[m.end():m.end() + cut[0]].strip()
    if not plain_verb:      # "... implies X" -> "The claim implies X"
        verb = m.group(2).lower()
        verb = {"said": "says", "stated": "states", "called": "calls", "listed": "lists", "implied": "implies",
                "framed": "frames", "grouped": "groups", "quoted": "quotes", "gave": "gives",
                "described": "describes", "named": "names", "suggested": "suggests", "claimed": "says"}.get(verb, verb)
        said = "The claim " + verb + " " + ("that " if re.search(r"\bthat\s*$", m.group(0)) else "") + said
    record = re.sub(r"^(in fact,?|but)\s+", "", record, flags=re.I)
    record = re.sub(r"^the record (shows|says|states)\s*(that\s+)?:?\s*", "", record, flags=re.I)
    return {"said": cap_first(said.rstrip(".")), "record": cap_first(record)}


def clean_name(name):
    """Entity names keep their real spelling; one that arrives all lower-case is title-cased."""
    name = re.sub(r"\s+", " ", clean_str(name))
    if name and name == name.lower() and re.search(r"[a-z]", name):
        return title_from_id(slugify(name))
    return name


_SCRUB_PAREN = re.compile(r"\s*\((?:[^()]*)\)")
_SCRUB_PHRASE = re.compile(r",?\s*(?:per|according to|for|in|by|of)\s+(?:the|this|that)\s+video\b,?", re.I)
scrubbed = []


def scrub(text, where=""):
    """Remove a reference to the original source from a short description, keeping the rest.

    Used for entity and theme descriptions only (never for findings): a bracket that mentions it is
    dropped, then a short phrase such as 'per the video', then any clause or sentence that still does.
    """
    text = tidy(text)
    if not text or not BANNED.search(text):
        return text
    out = _SCRUB_PAREN.sub(lambda m: "" if BANNED.search(m.group(0)) else m.group(0), text)
    out = _SCRUB_PHRASE.sub("", out)
    if BANNED.search(out):
        kept = []
        for sent in sentences(out):
            clauses = [c for c in re.split(r";\s+", sent) if not BANNED.search(c)]
            if clauses:
                kept.append("; ".join(clauses))
        out = " ".join(kept)
    out = re.sub(r"\s+([,.;])", r"\1", re.sub(r"\s{2,}", " ", out)).strip(" ;,")
    if out and out[-1] not in ".!?" and text[-1] in ".!?":
        out += "."
    scrubbed.append((where, text, out))
    return out


def clean_title(title):
    """Fallback display title: the working title without an internal prefix."""
    return re.sub(r"(?i)^(follow-up|connection hunt|lead|framing)\s*:\s*", "", clean_str(title)).strip()


def is_hidden_entity(eid, name=""):
    return eid in HIDDEN_ENTITIES or bool(BANNED.search(eid.replace("-", " "))) or bool(BANNED.search(name or ""))


def clean_label(label):
    """Relationship labels read mid-sentence ('X invested in Y'): no trailing full stop, grade words lower-cased."""
    return tidy(label).rstrip(".")


def ctype_of(raw):
    """Two kinds of item: a check of a claim, and a connection check across several checks."""
    return "connection" if slugify(raw) in ("connection-hunt", "connection-hunts", "hunt", "connection") else "check"


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
    topics = load_json(DATA / "topics.json", [])
    if isinstance(topics, dict):
        topics = topics.get("topics", [])
    topics = [t for t in as_list(topics) if isinstance(t, dict) and t.get("id")]
    return index, claim_files, reports, base, topics


# --------------------------------------------------------------------------
# Merge
# --------------------------------------------------------------------------
class Entities:
    def __init__(self):
        self.by_id = {}

    def add(self, raw_id, name=None, etype=None, description=None, aliases=None,
            origin="", authoritative=False):
        eid = canon(raw_id)
        if not eid or is_hidden_entity(eid, clean_str(name)):
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
        name = clean_name(name)
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
        description = scrub(description, f"entity {eid}")
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
            lead = sentences(descs[0]) if descs else []
            out[eid] = {
                "id": eid, "name": name, "type": etype,
                "description": descs[0] if descs else "",
                "role": cap_first(lead[0]) if lead else "",
                "details": lead[1:],
                "more": descs[1:6],
                "aliases": aliases,
                "stub": e["stub"],
            }
        return out


def merge(index, claim_files, reports, base, topic_list):
    ents = Entities()
    rels = {}          # key -> relationship
    claim_ents = defaultdict(dict)   # cid -> {eid: inferred?}
    claims = {}
    order = []

    # ---- topics, in display order
    topics = []
    for t in topic_list:
        tid = slugify(t.get("id"))
        if tid and tid not in {x["id"] for x in topics}:
            topics.append({"id": tid, "name": cap_first(tidy(t.get("name"))) or title_from_id(tid),
                           "description": tidy(t.get("description"))})
    if not topics:
        warn("data/topics.json not found or empty: using the built-in topic list")
        topics = [{"id": i, "name": n, "description": d} for i, n, d, _ in TOPIC_FALLBACK]
    topic_ids = {t["id"] for t in topics}

    def guess_topic(text):
        low, best, score = text.lower(), None, 0
        for tid, _, _, rx in TOPIC_FALLBACK:
            n = len(re.findall(rx, low))
            if tid in topic_ids and n > score:
                best, score = tid, n
        return best or topics[-1]["id"]

    # ---- items flagged hidden never reach the site: checks, sub-claims, entities, relationships
    hidden = {str(c["id"]) for c in index if c.get("hidden")}
    hidden |= {cid for cid, d in claim_files.items() if d.get("hidden")}
    for d in list(claim_files.values()) + [base]:
        for e in as_list(d.get("entities")):
            if isinstance(e, dict) and e.get("id") and e.get("hidden"):
                HIDDEN_ENTITIES.add(canon(e["id"]))

    # ---- checks: index first, then any claim file / report not in the index
    guessed = []
    for c in index:
        cid = str(c["id"])
        if cid in hidden:
            continue
        title = tidy(c.get("display_title")) or clean_title(c.get("title")) or cid
        topic = slugify(c.get("topic"))
        if topic not in topic_ids:
            if topic:
                warn(f"{cid}: unknown topic {topic!r}")
            topic = guess_topic(clean_str(c.get("title")) + " " + clean_str(c.get("claim")))
            guessed.append(cid)
        claims[cid] = {"id": cid, "slug": clean_str(c.get("slug")), "title": title,
                       "has_display_title": bool(tidy(c.get("display_title"))),
                       "question": tidy(c.get("question")), "topic": topic,
                       "ctype": ctype_of(c.get("origin")),
                       "parents": [str(x) for x in as_list(c.get("parents")) if x]}
        order.append(cid)
    for cid in sorted(set(claim_files) | set(reports), key=claim_sort_key):
        if cid not in claims and cid not in hidden:
            d = claim_files.get(cid, {})
            title = clean_title(d.get("title")) or cid
            claims[cid] = {"id": cid, "slug": "", "title": title, "has_display_title": False,
                           "question": "", "topic": guess_topic(title),
                           "ctype": ctype_of(d.get("origin")),
                           "parents": [str(x) for x in as_list(d.get("parents")) if x]}
            order.append(cid)
            guessed.append(cid)
            if cid not in claim_files:
                warn(f"{cid}: report exists but claim is in neither the index nor data/claims/")
    if guessed:
        warn(f"{len(guessed)} check(s) have no topic in the index and were placed by keyword: " + " ".join(guessed))
    no_title = [cid for cid in order if not claims[cid]["has_display_title"]]
    if no_title:
        warn(f"{len(no_title)} check(s) have no display_title in the index (working title used): " + " ".join(no_title))
    no_q = [cid for cid in order if not claims[cid]["question"]]
    if no_q:
        warn(f"{len(no_q)} check(s) have no question in the index (title shown instead): " + " ".join(no_q))
    order.sort(key=claim_sort_key)
    for cid in order:
        claims[cid]["question_points"] = sentences(claims[cid]["question"])
        kept = []
        for par in claims[cid]["parents"]:
            if par in claims and par != cid:
                kept.append(par)
            elif par not in hidden:
                warn(f"{cid}: unknown parent claim {par}")
        claims[cid]["parents"] = kept

    # ---- base graph entities (authoritative names/types)
    for e in as_list(base.get("entities")):
        if isinstance(e, dict) and e.get("id"):
            ents.add(e["id"], e.get("name"), e.get("type"), e.get("description"),
                     e.get("aliases"), "base-graph", authoritative=True)

    def add_rel(r, cid=None, origin=""):
        if not isinstance(r, dict) or r.get("hidden"):
            return
        s, t = canon(r.get("source")), canon(r.get("target"))
        if not s or not t or s == t or is_hidden_entity(s) or is_hidden_entity(t):
            return
        if BANNED.search(clean_str(r.get("label"))) and origin == "base-graph":
            return                  # a line that only describes the original source
        named = ([cid] if cid else []) + [str(x) for x in as_list(r.get("claims")) if x]
        if named and all(c2 in hidden for c2 in named):
            return                  # recorded only under an item that is not shown
        label = clean_label(r.get("label")) or "linked to"
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
        for c2 in named:
            if c2 and c2 not in hidden and c2 not in rel["claims"]:
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
            if clean_title(d.get("title")) and c["title"] == cid:
                c["title"] = clean_title(d["title"])
            c["verdict"] = norm_verdict(d.get("verdict"), f"in {cid}")
            c["confidence"] = slugify(d.get("confidence")) or ""
            c["summary"] = tidy(d.get("summary"))
            sm = sentences(c["summary"])
            if len(sm) > 1 and len(sm[0]) < 60:      # "The money is documented." needs its next sentence
                sm[:2] = [sm[0] + " " + sm[1]]
            c["bottom_line"], c["bottom_parts"] = split_listing(sm[0]) if sm else ("", [])
            c["summary_points"] = sm[1:]
            subs = []
            for s in as_list(d.get("sub_claims")):
                if isinstance(s, str):
                    s = {"statement": s}
                if not isinstance(s, dict) or s.get("hidden"):
                    continue
                finding = tidy(s.get("finding"))
                grade, points = split_grade(sentences(finding))
                amounts, dates = figures(finding)
                subs.append({
                    "statement": tidy(s.get("statement")),
                    "verdict": norm_verdict(s.get("verdict"), f"in {cid} sub-claim"),
                    "finding": finding,
                    "grade": grade,
                    "points": points,
                    "amounts": amounts,
                    "dates": dates,
                    "sources": [u for u in as_list(s.get("sources")) if isinstance(u, str)],
                })
            c["sub_claims"] = subs
            c["corrections"] = [tidy(x) for x in as_list(d.get("corrections")) if isinstance(x, str) and x.strip()]
            c["correction_pairs"] = [correction_pair(x) for x in c["corrections"]]
            c["denials_and_context"] = [tidy(x) for x in as_list(d.get("denials_and_context")) if isinstance(x, str) and x.strip()]
            c["denial_points"] = [sentences(x) for x in c["denials_and_context"]]
            blob = " ".join([c["summary"]] + [x["finding"] for x in subs])
            c["single_source"] = bool(re.search(r"(?i)single[- ]source|sole source|anonymous sources alone", blob))
            au = d.get("audit")
            if isinstance(au, dict) and clean_str(au.get("result")):
                c["audit"] = {"result": slugify(au.get("result")), "scope": tidy(au.get("scope")),
                              "checked": [cap_first(tidy(x)) for x in as_list(au.get("checked")) if isinstance(x, str) and x.strip()],
                              "changes": [cap_first(tidy(x)) for x in as_list(au.get("changes")) if isinstance(x, str) and x.strip()]}
            srcs = []
            for s in as_list(d.get("sources")):
                if isinstance(s, str):
                    s = {"url": s}
                if isinstance(s, dict):
                    srcs.append({"title": tidy(s.get("title")), "publisher": tidy(s.get("publisher")),
                                 "url": clean_str(s.get("url")), "date": clean_str(str(s.get("date") or ""))})
            c["sources"] = srcs
            leads = []
            for l in as_list(d.get("leads")):
                if isinstance(l, dict) and not l.get("hidden"):
                    leads.append({"title": cap_first(tidy(l.get("title"))),
                                  "why_connected": tidy(l.get("why_connected")),
                                  "why_points": sentences(l.get("why_connected")),
                                  "entities": [canon(x) for x in as_list(l.get("entities"))
                                               if x and not is_hidden_entity(canon(x))],
                                  "source_url": clean_str(l.get("source_url"))})
            c["leads"] = leads
            for e in as_list(d.get("entities")):
                if isinstance(e, dict) and e.get("id") and not e.get("hidden"):
                    eid = ents.add(e["id"], e.get("name"), e.get("type"), e.get("description"),
                                   e.get("aliases"), cid)
                    if eid:
                        claim_ents[cid][eid] = False
            for r in as_list(d.get("relationships")):
                add_rel(r, cid, cid)
                if isinstance(r, dict) and not r.get("hidden"):
                    ends = [canon(r.get(k)) for k in ("source", "target")]
                    if all(ends) and not any(is_hidden_entity(e) for e in ends):
                        for eid in ends:
                            claim_ents[cid].setdefault(eid, False)
        else:
            c.update({"verdict": "pending", "confidence": "", "summary": "", "bottom_line": "", "bottom_parts": [],
                      "summary_points": [], "single_source": False, "sub_claims": [], "corrections": [], "correction_pairs": [],
                      "denials_and_context": [], "denial_points": [], "sources": [], "leads": []})
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
                if cid not in hidden:
                    warn(f"base-graph claim_entities: unknown claim {cid}")
                continue
            for raw in as_list(ids):
                eid = canon(raw)
                if not eid or is_hidden_entity(eid):
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
            elif cid not in hidden:
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
    # a name left with no check and no relationship (its only mentions were hidden) is not shown
    linked = {e for m in claim_ents.values() for e in m} | {x for r in rels.values() for x in (r["source"], r["target"])}
    entities = {eid: e for eid, e in entities.items() if eid in linked}
    for eid in sorted(dangling):
        if eid in entities and entities[eid]["stub"]:
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
        text = claims[cid]["title"] + ". " + claims[cid]["question"]
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
            elif cid not in hidden:
                warn(f"theme {tid}: unknown claim {cid}")
        for raw in as_list(t.get("entities")):
            eid = canon(raw)
            if eid in entities:
                tents.append(eid)
            elif not is_hidden_entity(eid):
                warn(f"theme {tid}: unknown entity {raw}")
        if not tclaims or t.get("hidden"):
            continue
        desc = scrub(t.get("description"), f"theme {tid}")
        themes.append({"id": tid, "name": cap_first(clean_name(t.get("name"))) or title_from_id(tid),
                       "description": desc,
                       "points": sentences(desc),
                       "claims": sorted(set(tclaims), key=claim_sort_key),
                       "entities": sorted(set(tents))})

    return claims, order, entities, list(rels.values()), claim_ents, themes, topics


# --------------------------------------------------------------------------
# Graph assembly
# --------------------------------------------------------------------------
def assemble(claims, order, entities, rels, claim_ents, themes, topics):
    used = set(c.lower() for c in order)
    nodes = []
    key_of = {}

    def uniq_hash(want):
        h = re.sub(r"[^A-Za-z0-9-]+", "-", want).strip("-") or "node"
        if h.lower() in RESERVED_HASHES or h.lower().startswith(RESERVED_PREFIXES) or h.lower() in used:
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
             "id": t["id"], "name": t["name"], "description": t["description"], "points": t["points"],
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
            "checks": sum(1 for c in order if claims[c]["ctype"] == "check"),
            "connection_checks": sum(1 for c in order if claims[c]["ctype"] == "connection"),
            "topics": [dict(t) for t in topics],
            "entities": len(entities),
            "themes": len(themes),
            "relationships": len(rel_out),
            "tally": {v: tally.get(v, 0) for v in VERDICTS},
            "verdicts": VERDICTS, "entity_types": ENTITY_TYPES, "rel_types": REL_TYPES,
        },
        "nodes": nodes,
        "links": links,
        "rels": rel_out,
    }
    return graph, neigh, key_of


# --------------------------------------------------------------------------
# What the website's pages need on top of the raw graph: explicit lists per
# claim, chapters, evidence grades, merged relationship lines, per-name
# timelines and sums, global tallies and a precomputed map layout.
# --------------------------------------------------------------------------
HOLDS_UP = ("confirmed", "mostly-accurate")
NEEDS_CORRECTING = ("partly-accurate", "misleading", "false")

# Sentences that say something is not shown.  They are listed under "what is
# unproven" as well as where they stand, so a caveat is never only in the small print.
_UNPROVEN_RE = re.compile(
    r"(?i)\b(not proven|unproven|insinuat\w+|not (been )?established|no evidence|no proof|uncorroborated|"
    r"not been shown|(does|do|did) not (show|prove|establish)|not shown|no source (shows|asserts|says|states)|"
    r"asserted by no source|cannot be (verified|confirmed)|could not be (verified|confirmed|corroborated)|"
    r"not (been )?(independently )?(verified|confirmed|corroborated)|unverified|unconfirmed|our (own )?inference|"
    r"is inferred|are inferred|speculat\w+)\b")


def claim_number(cid):
    m = re.match(r"[A-Za-z]+(\d+)", cid)
    return int(m.group(1)) if m else 0


def grade_kind(grade, points):
    """documented | single-source | inferred | mixed | none-found | '' for a connection's evidence grade."""
    text = grade or (points[0][:240] if points else "")
    if not grade and not re.match(r"(?i)\s*(evidence|grade|documented|single|inferred|each |not found|none found|partly)", text):
        return ""
    low = text.lower()
    if re.search(r"\b(none found|not found)\b", low):
        return "none-found"
    kinds = [k for k, rx in (("documented", r"\bdocumented\b"), ("single-source", r"\bsingle[- ]source\b"),
                             ("inferred", r"\binferred\b")) if re.search(rx, low)]
    if not kinds:
        return ""
    return kinds[0] if len(kinds) == 1 else "mixed"


_STOP = {"of", "the", "a", "an", "to", "in", "and", "by", "for", "on", "at", "with", "from", "its", "as", "is",
         "was", "his", "her", "their", "via", "per", "about", "roughly", "that", "it", "into", "over"}
_CAVEAT = re.compile(r"(?i)alleg|report|single[- ]source|unverified|denie|disputed|unconfirmed|inferred|claimed|said to")


def _tokens(label):
    out = set()
    for w in re.findall(r"[a-z0-9$%.~]+", label.lower()):
        w = w.strip(".~")
        if w and w not in _STOP:
            out.add(w[:5] if w[0].isalpha() else w)
    return out


def _date_clash(a, b):
    if not a or not b:
        return False
    a, b = a.split("/")[0], b.split("/")[0]
    n = 7 if (len(a) >= 7 and len(b) >= 7 and a[4:5] == "-" and b[4:5] == "-" and a[5:7].isdigit() and b[5:7].isdigit()) else 4
    return a[:n] != b[:n]


def _amount_clash(a, b):
    if a is None or b is None:
        return False
    return abs(a - b) > 0.1 * max(abs(a), abs(b), 1)


def merge_lines(rels, unverified):
    """The same relationship restated across claims (same pair, similar wording) becomes one line.

    Nothing is merged across a different date or amount.  The wording kept is the one that carries a
    caveat (alleged, reported, single-source) if any does, otherwise the fullest; every claim is listed.
    """
    by_pair = defaultdict(list)
    for r in rels:
        by_pair[(r["s"], r["t"])].append(r)
    out = []
    for (s, t), group in by_pair.items():
        clusters = []
        for r in sorted(group, key=lambda r: (-len(r["label"]), r["label"])):
            tok = _tokens(r["label"])
            home = None
            for c in clusters:
                for o, otok in c:
                    small = min(len(tok), len(otok))
                    if not small:
                        continue
                    if (len(tok & otok) / small >= 0.6 and not _date_clash(r.get("date"), o.get("date"))
                            and not _amount_clash(r.get("amount_usd"), o.get("amount_usd"))):
                        home = c
                        break
                if home:
                    break
            if home is None:
                clusters.append([(r, tok)])
            else:
                home.append((r, tok))
        for c in clusters:
            members = [r for r, _ in c]
            caveated = [r for r in members if _CAVEAT.search(r["label"])]
            pool = caveated or members
            best = max(pool, key=lambda r: (min(len(r["label"]), 90), -len(r["label"])))
            claims = sorted({cid for r in members for cid in r["claims"]}, key=claim_sort_key)
            line = {"s": s, "t": t, "label": best["label"], "type": best["type"], "claims": claims}
            dates = sorted((r["date"] for r in members if r.get("date")), key=lambda d: (-len(d.split("/")[0]), d))
            if dates:
                line["date"] = best.get("date") or dates[0]
            amounts = [r["amount_usd"] for r in members if r.get("amount_usd") is not None]
            if amounts:
                line["amount_usd"] = best["amount_usd"] if best.get("amount_usd") is not None else amounts[0]
            if len(members) > 1:
                line["restated"] = len(members)
            if claims and all(cid in unverified for cid in claims):
                line["alleged"] = True     # rests only on an unverified item
            out.append(line)
    out.sort(key=lambda r: (r["s"], r["t"], r.get("date") or "9999", r["label"]))
    return out


# ---- who is involved: the entry point for people on the home page ---------
_OFFICIAL = re.compile(
    r"(?i)\b(secretary|attorney general|deputy ag|acting ag|special envoy|envoy to|chief of staff|czar|"
    r"(sec|cftc|fcc|ftc|occ|fed|fhfa) (chair|chairman|chief|nominee|commissioner|director)|"
    r"chair(man)? of the (sec|cftc|fcc|ftc)|trump-appointed|white house (counsel|adviser|advisor|aide|official)|"
    r"director of national intelligence|administrator|comptroller|ambassador|senior adviser to the president)\b")
_NOT_OFFICIAL = re.compile(r"(?i)\b(senator|sen\.|representative|rep\.|congress(wo)?man|ranking member|democrat\w*|"
                           r"journalist|reporter|researcher|writer|professor|watchdog|biden|obama|"
                           r"foreign minister|prime minister|emir|crown prince|sheikh|king)\b")
_NOT_PARTNER = re.compile(r"(?i)\b(senator|sen\.|representative|rep\.|congress(wo)?man|ranking member|journalist|reporter|"
                          r"researcher|writer|author|professor|watchdog|judge|prosecutor|spokes\w+|whistleblower)\b")
_FOREIGN = re.compile(r"(?i)\b(uae|emirat\w+|abu dhabi|dubai|saudi\w*|qatar\w*|kuwait\w*|bahrain\w*|oman\w*|"
                      r"sovereign wealth|sovereign fund|pakistan\w*|serbia\w*|albania\w*|vietnam\w*|indonesia\w*|"
                      r"kazakh\w*|azerbaijan\w*|chinese|china|russia\w*|india\w*)\b")
_US_BODY = re.compile(r"(?i)\b(u\.?s\.?|united states|america\w*|federal|white house|pentagon|trump|kushner)\b")


def who_groups(entities, lines, key_of, per=6):
    """The most-named people and bodies in four plain groups, derived from types, relationships and roles."""
    by_ent = defaultdict(list)
    for r in lines:
        by_ent[r["s"]].append(r)
        by_ent[r["t"]].append(r)
    rank = lambda e: (-e.get("claim_count", 0), -e["degree"], e["name"])
    people = [e for e in entities if e["type"] == "person" and not e.get("unverified_only")
              and not re.search(r"(?i)\b(investors|supporters|buyers|holders|family|donors)\b", e["name"])]
    text = lambda e: " ".join([e["name"], e.get("role") or ""] + list(e.get("details") or []) + list(e.get("more") or []))
    trump = key_of.get("e:donald-trump")
    family = set()
    if trump:
        family.add(trump["key"])
        for r in by_ent[trump["key"]]:
            if r["type"] == "family":
                other = key_of[r["t"] if r["s"] == trump["key"] else r["s"]]
                if other["type"] == "person":
                    family.add(other["key"])
    family |= {e["key"] for e in people if re.search(r"\bTrump\b", e["name"])}
    fam = sorted((e for e in people if e["key"] in family), key=lambda e: (e["id"] != "donald-trump",) + rank(e))
    officials = sorted((e for e in people if e["key"] not in family and _OFFICIAL.search(e.get("role") or "")
                        and not _NOT_OFFICIAL.search(e.get("role") or "")), key=rank)
    taken = family | {e["key"] for e in officials}
    partners = sorted((e for e in people if e["key"] not in taken and not _NOT_PARTNER.search(e.get("role") or "")
                       and not _OFFICIAL.search(e.get("role") or "")
                       and sum(1 for r in by_ent[e["key"]] if r["type"] in ("money", "ownership", "commercial")) >= 2), key=rank)
    foreign = sorted((e for e in entities if not e.get("unverified_only") and (
        (e["type"] == "country" and e["id"] not in ("united-states", "usa", "us", "america"))
        or (e["type"] in ("fund", "government", "company") and _FOREIGN.search(e["name"] + " " + (e.get("role") or ""))
            and not _US_BODY.search(e["name"]) and (e["type"] != "company" or re.search(
                r"(?i)sovereign|state[- ](owned|backed|linked|fund|investment)|government", e.get("role") or ""))))
        and any(r["type"] in ("money", "ownership", "commercial") for r in by_ent[e["key"]])), key=rank)
    groups = [("family", "Trump family", fam), ("officials", "Administration officials", officials),
              ("partners", "Business partners and investors", partners),
              ("foreign", "Foreign governments and funds", foreign)]
    return [{"id": gid, "title": title, "names": [e["id"] for e in grp[:per]], "total": len(grp)}
            for gid, title, grp in groups if grp]


def date_key(d):
    """Sortable form of the loose dates in the data (2025, 2025-03, 2025-Q2, 2025-03/2025-07, 2025-spring)."""
    d = str(d or "").split("/")[0]
    m = re.match(r"(\d{4})(?:-(\d{2})(?:-(\d{2}))?|-Q(\d)|-(spring|summer|autumn|fall|winter))?", d)
    if not m:
        return "9999"
    y, mo, da, q, season = m.groups()
    if q:
        mo = "%02d" % (int(q) * 3 - 2)
    if season:
        mo = {"spring": "04", "summer": "07", "autumn": "10", "fall": "10", "winter": "01"}[season]
    return f"{y}-{mo or '00'}-{da or '00'}"


# ---- map layout -----------------------------------------------------------
# A force layout computed here so the map appears at once and looks the same on
# every visit.  The checks are held on a ring, grouped into one arc per topic;
# every name settles between the checks that mention it.  The result is cached by
# the shape of the graph, so editing text does not move the map.
RING = 1600
RING_GAP = 1.8          # empty slots between two topic arcs
LAYOUT_CACHE = ROOT / ".layout-cache.json"
LAYOUT_VERSION = 7


def layout_pairs(graph):
    idx = {n["key"]: i for i, n in enumerate(graph["nodes"])}
    pairs = {}
    for r in graph["rels"]:
        a, b = idx.get(r["s"]), idx.get(r["t"])
        if a is not None and b is not None and a != b:
            pairs.setdefault((min(a, b), max(a, b)), "rel")
    for l in graph["links"]:
        a, b = idx.get(l["s"]), idx.get(l["t"])
        if a is not None and b is not None and a != b:
            pairs.setdefault((min(a, b), max(a, b)), l["k"])
    return pairs


def ring_targets(graph):
    """Position on the ring for every check, and the arc each topic covers (written into meta.topics)."""
    idx = {n["key"]: i for i, n in enumerate(graph["nodes"])}
    topics = [t for t in graph["meta"]["topics"] if t.get("claims")]
    slots = sum(len(t["claims"]) for t in topics) + RING_GAP * len(topics)
    out, pos = {}, RING_GAP / 2
    for t in topics:
        step = 2 * math.pi / slots
        t["a0"] = round(-math.pi / 2 + (pos + 0.15) * step, 4)
        for cid in t["claims"]:
            a = -math.pi / 2 + (pos + 0.5) * step
            out[idx[cid]] = (RING * math.cos(a), RING * math.sin(a))
            pos += 1
        t["a1"] = round(-math.pi / 2 + (pos - 0.15) * step, 4)
        pos += RING_GAP
    return out, slots


def compute_layout(graph):
    nodes = graph["nodes"]
    n = len(nodes)
    pairs = layout_pairs(graph)
    targets, slots = ring_targets(graph)
    graph["meta"]["ring_slots"] = slots
    sig = hashlib.sha1(json.dumps([LAYOUT_VERSION, [x["key"] for x in nodes], sorted(pairs.items()),
                                   sorted((i, round(t[0]), round(t[1])) for i, t in targets.items())],
                                  separators=(",", ":")).encode()).hexdigest()
    cached = load_json(LAYOUT_CACHE, {}) if LAYOUT_CACHE.exists() else {}
    if isinstance(cached, dict) and cached.get("sig") == sig and len(cached.get("xy", [])) == n:
        return cached["xy"], "from cache"

    deg = [0] * n
    for a, b in pairs:
        deg[a] += 1
        deg[b] += 1
    kind = [x["kind"] for x in nodes]
    rad = [3.2 + 1.5 * math.sqrt(deg[i]) if kind[i] == "entity" else
           8 + 0.9 * math.sqrt(deg[i]) if kind[i] == "claim" else 9 + 1.1 * math.sqrt(deg[i]) for i in range(n)]
    x, y = [0.0] * n, [0.0] * n
    for rank, i in enumerate(sorted(range(n), key=lambda i: (-deg[i], nodes[i]["key"]))):
        r, a = 15 * math.sqrt(rank + 0.5), rank * 2.399963
        x[i], y[i] = r * math.cos(a), r * math.sin(a)
    for i, (tx, ty) in targets.items():
        x[i], y[i] = tx, ty
    vx, vy = [0.0] * n, [0.0] * n
    q = [-(230 + 34 * math.sqrt(deg[i]) + (460 if kind[i] == "claim" else 0)) for i in range(n)]
    links = []
    for (a, b), k in sorted(pairs.items()):
        dist = 74 if k == "rel" else 100 if k == "claim" else 150
        base = 0.9 if k == "claim" else 0.5 if k == "rel" else 0.6 if k == "theme" else 0.2
        links.append((a, b, dist, base / math.sqrt(min(deg[a], deg[b]) or 1), deg[a] / (deg[a] + deg[b])))
    pad = [rad[i] + (16 if kind[i] == "claim" else 7) for i in range(n)]
    cell = 2 * max(pad)
    max_d2 = 1400.0 ** 2
    ax, ay = [0.0] * n, [0.0] * n

    def charge():
        minx, miny = min(x), min(y)
        size = max(max(x) - minx, max(y) - miny, 1.0) / 13
        cells = defaultdict(list)
        for i in range(n):
            cells[(int((x[i] - minx) / size), int((y[i] - miny) / size))].append(i)
        summary = {}
        for c, members in cells.items():
            tq = sum(q[i] for i in members)
            summary[c] = (sum(x[i] * q[i] for i in members) / tq, sum(y[i] * q[i] for i in members) / tq, tq)
        for c, members in cells.items():
            far, near = [], []
            for d, sm in summary.items():
                if abs(d[0] - c[0]) <= 1 and abs(d[1] - c[1]) <= 1:
                    near += cells[d]
                else:
                    far.append(sm)
            nx, ny, nq = [x[j] for j in near], [y[j] for j in near], [q[j] for j in near]
            for i in members:
                xi, yi, fx, fy = x[i], y[i], 0.0, 0.0
                for cx, cy, cq in far:
                    dx, dy = cx - xi, cy - yi
                    l = dx * dx + dy * dy
                    if l < max_d2:
                        w = cq / l
                        fx += dx * w
                        fy += dy * w
                for k in range(len(near)):
                    dx, dy = nx[k] - xi, ny[k] - yi
                    l = dx * dx + dy * dy
                    if l < 1.0:
                        if near[k] == i:
                            continue
                        l = 1.0
                    w = nq[k] / l
                    fx += dx * w
                    fy += dy * w
                ax[i], ay[i] = fx, fy

    def collide():
        grid = defaultdict(list)
        for i in range(n):
            grid[(int((x[i] + vx[i]) // cell), int((y[i] + vy[i]) // cell))].append(i)
        for (cx, cy), members in grid.items():
            for ox, oy in ((0, 0), (1, 0), (-1, 1), (0, 1), (1, 1)):
                other = grid.get((cx + ox, cy + oy))
                if not other:
                    continue
                same = ox == 0 and oy == 0
                for ai, i in enumerate(members):
                    xi, yi, ri = x[i] + vx[i], y[i] + vy[i], pad[i]
                    for j in (members[ai + 1:] if same else other):
                        dx, dy = xi - x[j] - vx[j], yi - y[j] - vy[j]
                        r = ri + pad[j]
                        l = dx * dx + dy * dy
                        if l < r * r:
                            l = math.sqrt(l) or 0.01
                            l = (r - l) / l * 0.8
                            share = pad[j] * pad[j] / (ri * ri + pad[j] * pad[j])
                            vx[i] += dx * l * share
                            vy[i] += dy * l * share
                            vx[j] -= dx * l * (1 - share)
                            vy[j] -= dy * l * (1 - share)

    alpha, ticks = 1.0, 300
    for tick in range(ticks):
        alpha += (0 - alpha) * 0.0228
        for a, b, dist, strength, bias in links:
            dx = x[b] + vx[b] - x[a] - vx[a] or 0.01
            dy = y[b] + vy[b] - y[a] - vy[a] or 0.01
            l = math.sqrt(dx * dx + dy * dy)
            l = (l - dist) / l * alpha * strength
            dx *= l
            dy *= l
            vx[b] -= dx * bias
            vy[b] -= dy * bias
            vx[a] += dx * (1 - bias)
            vy[a] += dy * (1 - bias)
        if tick % 3 == 0:
            charge()
        for i in range(n):
            vx[i] += ax[i] * alpha
            vy[i] += ay[i] * alpha
        collide()
        for i in range(n):
            t = targets.get(i)
            if t:                       # the checks stay on the ring
                x[i], y[i], vx[i], vy[i] = t[0], t[1], 0.0, 0.0
                continue
            vx[i] += -x[i] * 0.02 * alpha
            vy[i] += -y[i] * 0.02 * alpha
            vx[i] *= 0.6
            vy[i] *= 0.6
            x[i] += vx[i]
            y[i] += vy[i]
    xy = [[round(x[i]), round(y[i])] for i in range(n)]
    try:
        LAYOUT_CACHE.write_text(json.dumps({"sig": sig, "xy": xy}, separators=(",", ":")), encoding="utf-8")
    except OSError as exc:
        warn(f"could not write {LAYOUT_CACHE.name}: {exc}")
    return xy, "computed"


def enrich(graph, neigh, key_of):
    nodes, meta = graph["nodes"], graph["meta"]
    claims = [n for n in nodes if n["kind"] == "claim"]
    entities = [n for n in nodes if n["kind"] == "entity"]
    unverified = {c["id"] for c in claims if c["verdict"] == "unverified"}

    # ---- per claim: tally and the three explicit lists
    points = Counter()
    for c in claims:
        holds, fix, unp = [], [], []
        for i, s in enumerate(c["sub_claims"]):
            s["grade_kind"] = grade_kind(s["grade"], s["points"]) if (c["ctype"] == "connection" or s["grade"]) else ""
            (holds if s["verdict"] in HOLDS_UP else fix if s["verdict"] in NEEDS_CORRECTING else unp).append({"sub": i})
        tally = [len(holds), len(fix), len(unp)]
        fix += [{"fix": j} for j in range(len(c["corrections"]))]
        seen = set()
        notes = []
        for src, texts in (("summary", [c["bottom_line"]] + c["bottom_parts"] + c["summary_points"]),):
            for t in texts:
                for sent in sentences(t):
                    if _UNPROVEN_RE.search(sent) and len(sent) > 40 and sent.lower() not in seen:
                        seen.add(sent.lower())
                        notes.append({"note": sent, "from": src})
        for i, s in enumerate(c["sub_claims"]):
            if s["verdict"] in ("unverified", "pending"):
                continue
            for p in s["points"]:
                if _UNPROVEN_RE.search(p) and len(p) > 40 and p.lower() not in seen:
                    seen.add(p.lower())
                    notes.append({"note": p, "from": "point", "sub": i})
        c["tally"] = tally
        c["holds_up"], c["needs_correcting"], c["unproven"] = holds, fix, unp + notes
        c["number"] = claim_number(c["id"])
        points["hold"] += tally[0]
        points["correct"] += tally[1]
        points["unproven"] += tally[2]

    # ---- topics: the checks under each, and how they came out
    for t in meta["topics"]:
        mine = [c for c in claims if c["topic"] == t["id"]]
        t["claims"] = [c["id"] for c in mine]
        tv = Counter(c["verdict"] for c in mine)
        t["tally"] = {v: tv[v] for v in VERDICTS if tv[v]}
    meta["topics"] = [t for t in meta["topics"] if t["claims"]]

    # ---- relationships: one line per fact, however many claims restate it
    lines = merge_lines(graph["rels"], unverified)
    graph["lines"] = lines
    by_ent = defaultdict(list)
    for i, r in enumerate(lines):
        by_ent[r["s"]].append(i)
        by_ent[r["t"]].append(i)
    for e in entities:
        mine = by_ent[e["key"]]
        e["timeline"] = sorted((i for i in mine if lines[i].get("date")), key=lambda i: (date_key(lines[i]["date"]), i))
        e["sums"] = sorted((i for i in mine if lines[i].get("amount_usd")),
                           key=lambda i: (-lines[i]["amount_usd"], i))[:6]
        cl = [k for k in neigh[e["key"]] if key_of[k]["kind"] == "claim"]
        unv = sorted((k for k in cl if k in unverified), key=claim_sort_key)
        if unv:
            e["unverified_in"] = unv
            if len(unv) == len(cl):
                e["unverified_only"] = True

    # ---- global tallies
    def tally_of(group):
        t = Counter(c["verdict"] for c in group)
        return {v: t[v] for v in VERDICTS if t[v]}
    points["total"] = points["hold"] + points["correct"] + points["unproven"]
    meta["points"] = dict(points)
    meta["corrections"] = sum(len(c["corrections"]) for c in claims)
    meta["sources"] = sum(len(c["sources"]) for c in claims)
    meta["second_reviewed"] = sum(1 for c in claims if c.get("audit"))
    meta["tally_by_kind"] = {o: tally_of([c for c in claims if c["ctype"] == o]) for o in ("check", "connection")}
    meta["who"] = who_groups(entities, lines, key_of)
    meta["unverified"] = sorted(unverified, key=claim_sort_key)
    meta["lines"] = len(lines)

    # ---- map positions
    xy, how = compute_layout(graph)
    for n, (px, py) in zip(nodes, xy):
        n["x"], n["y"] = px, py
    meta["layout"] = how
    meta["ring"] = RING


_DROP_CLAIM = ("summary", "question", "has_display_title", "denials_and_context", "slug", "report_file", "verified",
               "lines", "origin", "claim", "claim_points")
_DROP_ENTITY = ("description", "stub")


def slim(graph):
    """The copy written for the website: merged relationship lines, and no field the pages do not read."""
    nodes = []
    for n in graph["nodes"]:
        m = dict(n)
        if n["kind"] == "claim":
            for k in _DROP_CLAIM:
                m.pop(k, None)
            m["sub_claims"] = [{k: v for k, v in s.items() if k != "finding"} for s in n["sub_claims"]]
        elif n["kind"] == "entity":
            for k in _DROP_ENTITY:
                m.pop(k, None)
        nodes.append(m)
    return {"meta": graph["meta"], "nodes": nodes, "links": graph["links"], "rels": graph.get("lines", graph["rels"])}


def write_graph_js(graph):
    MAP_DIR.mkdir(exist_ok=True)
    js = json.dumps(slim(graph), ensure_ascii=False, separators=(",", ":"))
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
TYPE_LABEL = {"person": "Person", "company": "Company", "government": "Government body", "fund": "Fund",
              "asset": "Asset", "country": "Country", "law": "Law or policy", "media": "Media",
              "event": "Event", "product": "Product"}
REL_LABEL = {"money": "Money", "ownership": "Ownership", "family": "Family", "regulatory": "Regulatory",
             "advisory": "Advisory", "political": "Political", "legal": "Legal", "media": "Media",
             "commercial": "Commercial"}
ORIGIN_LABEL = {"video": "Claim from the video", "follow-up": "Follow-up lead", "connection-hunt": "Connection hunt"}
CLAIM_HEAD = {"video": "What the video said", "follow-up": "Lead investigated",
              "connection-hunt": "Connections searched for"}
HOLDS = ("confirmed", "mostly-accurate")
CORRECT = ("partly-accurate", "misleading", "false")
UNPROVEN_NOTE = ("Unverified {}allegation: this could not be independently corroborated. "
                 "It is reported as an allegation, not as an established fact.")


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
        extra = " · ".join(x for x in [r.get("date", ""), money(r.get("amount_usd"))] if x)
        cl = " ".join(wl(c, c) for c in r["claims"])
        unv = r["claims"] and all(key_of[c]["verdict"] == "unverified" for c in r["claims"])
        return (f"- {wl(r['s'])} *{r['label']}* {wl(r['t'])}" + (f" · {extra}" if extra else "")
                + (f" · {cl}" if cl else "") + (" · unverified allegation" if unv else ""))

    def rel_groups(rs):
        out = []
        for t in REL_TYPES + sorted({r["type"] for r in rs} - set(REL_TYPES)):
            grp = [r for r in rs if r["type"] == t]
            if grp:
                out.append(f"### {REL_LABEL.get(t, cap_first(t))} ({len(grp)})\n")
                out += [rel_line(r) for r in sorted(grp, key=lambda r: r.get("date") or "9999")]
                out.append("")
        return out

    def claim_line(c):
        flag = " · unverified allegation, single source" if c["verdict"] == "unverified" else ""
        return f"- {wl(c['key'])} · {VERDICT_LABEL[c['verdict']]}{flag}"

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
            conf = f" · {n['confidence']} confidence" if n["confidence"] else ""
            out.append(f"**Verdict:** {VERDICT_LABEL[n['verdict']]}{conf}  ")
            out.append(f"**Origin:** {ORIGIN_LABEL[n['origin']]}"
                       + (f" · transcript lines {n['lines']}" if n["lines"] else "") + "\n")
            if n["verdict"] == "unverified":
                out.append("> [!warning] " + UNPROVEN_NOTE.format("single-source " if n["single_source"] else "") + "\n")
            if n["verdict"] == "pending":
                out.append("Verification of this claim has not been completed yet.\n")
            if n["bottom_line"]:
                out.append("## Bottom line\n\n" + n["bottom_line"] + "\n")
                if n["bottom_parts"]:
                    out += [f"- {x}" for x in n["bottom_parts"]]
                    out.append("")
            subs = n["sub_claims"]
            holds = [s for s in subs if s["verdict"] in HOLDS]
            fix = [s for s in subs if s["verdict"] in CORRECT]
            unproven = [s for s in subs if s["verdict"] in ("unverified", "pending")]
            if holds:
                out.append("## What holds up\n")
                out += [f"- {s['statement']}" if s["verdict"] == "confirmed"
                        else f"- {s['statement'].rstrip('.')} (mostly accurate)" for s in holds]
                out.append("")
            if fix or n["corrections"]:
                out.append("## What needs correcting\n")
                out += [f"- {s['statement'].rstrip('.')} ({VERDICT_LABEL[s['verdict']].lower()})" for s in fix]
                for text, pair in zip(n["corrections"], n["correction_pairs"]):
                    if pair:
                        who = ("Claim" if not pair["plain"] else
                               "Video said" if pair["who"] == "video" else "Brief said")
                        rec = "Record shows" if pair["plain"] else "Record"
                        out.append(f"- **{who}:** {pair['said']}  \n  **{rec}:** {pair['record']}")
                    else:
                        out.append(f"- {text}")
                out.append("")
            if unproven:
                out.append("## What is unproven\n")
                out += [f"- {s['statement']}" for s in unproven]
                out.append("")
            if n["summary_points"]:
                out.append("## In more detail\n")
                out += [f"- {x}" for x in n["summary_points"]]
                out.append("")
            if n["claim"]:
                out.append(f"## {CLAIM_HEAD[n['origin']]}\n\n> " + n["claim"] + "\n")
            if n["parents"]:
                out.append("## Follows up on\n")
                out += [claim_line(key_of[p]) for p in n["parents"]]
                out.append("")
            kids = [c for c in graph["nodes"] if c["kind"] == "claim" and n["id"] in c["parents"]]
            if kids:
                out.append("## Follow-up checks\n")
                out += [claim_line(c) for c in kids]
                out.append("")
            if subs:
                out.append("## Sub-claims\n")
                src_no = {x["url"]: i for i, x in enumerate(n["sources"], 1) if x["url"]}
                for i, s in enumerate(subs, 1):
                    out.append(f"### {i}. {s['statement']}\n")
                    out.append(f"**{VERDICT_LABEL[s['verdict']]}**" + (f" · Evidence: {s['grade']}" if s["grade"] else "") + "\n")
                    out += [f"- {x}" for x in s["points"]]
                    if s["amounts"]:
                        out.append(f"- Amounts: {'; '.join(s['amounts'])}")
                    if s["dates"]:
                        out.append(f"- Dates: {'; '.join(s['dates'])}")
                    refs = [f"[{src_no[u]}]({u})" if u in src_no else f"<{u}>" for u in s["sources"]]
                    if refs:
                        out.append("- Sources: " + " ".join(refs))
                    out.append("")
            if n["denials_and_context"]:
                out.append("## Denials and context\n")
                for pts in n["denial_points"]:
                    out.append(f"- {pts[0]}")
                    out += [f"  - {x}" for x in pts[1:]]
                out.append("")
            if theme_of_claim[key]:
                out.append("## Themes\n")
                out += [f"- {wl(t)}" for t in theme_of_claim[key]]
                out.append("")
            if ents:
                out.append("## People and organisations\n")
                for k in ents:
                    tag = " (named in the claim text)" if (key, k) in inferred else ""
                    out.append(f"- {wl(k)} · {TYPE_LABEL[key_of[k]['type']]}{tag}")
                out.append("")
            crels = [r for r in graph["rels"] if n["id"] in r["claims"]]
            if crels:
                out.append("## Relationships documented\n")
                out += rel_groups(crels)
            if n["leads"]:
                out.append("## Leads not covered here\n")
                for l in n["leads"]:
                    links = " ".join(wl("e:" + e) if ("e:" + e) in note else e for e in l["entities"])
                    src = f" [Source]({l['source_url']})" if l["source_url"] else ""
                    out.append(f"- **{l['title']}**")
                    out += [f"  - {x}" for x in l["why_points"]]
                    if links or src:
                        out.append("  - " + " · ".join(x for x in [links, src.strip()] if x))
                out.append("")
            if n["sources"]:
                out.append(f"## Sources ({len(n['sources'])})\n")
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
            if n["role"]:
                out.append(n["role"] + "\n")
            unv = [k for k in cl if key_of[k]["verdict"] == "unverified"]
            if unv:
                out.append("> [!warning] Appears in " + ("only " if len(unv) == len(cl) else "")
                           + "an unverified, single-source allegation (" + ", ".join(wl(k, k) for k in unv)
                           + "). Nothing in it has been independently corroborated.\n")
            out.append("| | |\n|---|---|")
            out.append(f"| Type | {TYPE_LABEL[n['type']]} |")
            out.append(f"| Appears in | {len(cl)} claim{'' if len(cl) == 1 else 's'} |")
            out.append(f"| Connections | {n['degree']} |")
            if n["aliases"]:
                out.append("| Also known as | " + "; ".join(a.replace("|", "/") for a in n["aliases"]) + " |")
            out.append("")
            if n["details"]:
                out.append("## Background\n")
                out += [f"- {d}" for d in n["details"]]
                out.append("")
            if n["more"]:
                out.append("## How other claims describe it\n")
                out += [f"- {d}" for d in n["more"]]
                out.append("")
            if cl:
                out.append("## Appears in claims\n")
                out += [claim_line(key_of[k]) for k in cl]
                out.append("")
            if rels_by[key]:
                out.append("## Relationships\n")
                out += rel_groups(rels_by[key])
            th = [t for t in graph["nodes"] if t["kind"] == "theme" and key in t["entities"]]
            if th:
                out.append("## Themes\n")
                out += [f"- {wl(t['key'])}" for t in th]
                out.append("")
            sub = "Entities"
        else:
            out.append(frontmatter({"id": n["id"], "kind": "theme", "tags": ["theme"]}))
            out.append(f"# {n['name']}\n")
            out += [f"- {x}" for x in n["points"]]
            if n["points"]:
                out.append("")
            if n["claims"]:
                out.append("## Claims\n")
                out += [claim_line(key_of[c]) for c in n["claims"]]
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
            + (f" and {m['connection_hunts']} connection hunts across the claims" if m["connection_hunts"] else "")
            + ". Each claim was checked "
            "independently against public records and reporting. Open the graph view to explore.\n",
            "Everyone named denies wrongdoing. Nothing here is an accusation of a crime.\n",
            "## Verdicts\n"]
    home += [f"- {VERDICT_LABEL[v]}: {m['tally'][v]}" for v in VERDICTS if m["tally"][v]]
    for o, head in (("video", "Claims from the video"), ("follow-up", "Follow-up leads"),
                    ("connection-hunt", "Connection hunts")):
        grp = [n for n in graph["nodes"] if n["kind"] == "claim" and n["origin"] == o]
        if grp:
            home.append(f"\n## {head}\n")
            home += [claim_line(n) for n in grp]
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
    enrich(graph, neigh, key_of)
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
    print(f"  origin         {m['video_claims']} from the video, {m['followups']} follow-up, "
          f"{m['connection_hunts']} connection hunt")
    print("  verdicts       " + ", ".join(f"{v} {m['tally'][v]}" for v in VERDICTS if m["tally"][v]))
    pt = m["points"]
    print(f"  points checked {pt['total']:>4}   ({pt['hold']} hold up, {pt['correct']} needed correcting, {pt['unproven']} unproven)")
    print(f"  merged lines   {m['lines']:>4}   (from {m['relationships']} relationships as recorded)")
    print(f"  layout         {m['layout']}")
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
