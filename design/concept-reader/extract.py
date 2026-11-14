#!/usr/bin/env python3
"""Extracts the small data subset embedded in the prototype from map/graph-data.js.
Injects it into index.html between the DATA-START and DATA-END markers. Standard library only."""
import json, re, os, collections
here = os.path.dirname(os.path.abspath(__file__))
t = open(os.path.join(here, '..', '..', 'map', 'graph-data.js')).read()
g = json.loads(t[t.index('{'):t.rindex('}') + 1])
N = {n['key']: n for n in g['nodes']}
claims = [n for n in g['nodes'] if n['kind'] == 'claim']
FULL = ['C01', 'C03', 'C04', 'C05', 'C06', 'C09', 'C16', 'C37', 'C42', 'C46', 'C47', 'C64']
FEATURED = ['justin-sun', 'world-liberty-financial']
HOLD = {'confirmed', 'mostly-accurate'}
UNPROVEN_RE = re.compile(r'not proven|unproven|insinuation|not established|no document|no evidence|uncorroborated|not been shown|unverified', re.I)

def sentences(s):
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+(?=[A-Z\'"(])', s) if x.strip()]

def tally(c):
    k = collections.Counter()
    for s in c['sub_claims']:
        v = s['verdict']
        k['hold' if v in HOLD else 'part' if v == 'partly-accurate' else 'unp' if v == 'unverified' else 'wrong'] += 1
    return [k['hold'], k['part'], k['unp'], k['wrong']]

def unproven_notes(c):
    out = []
    for s in list(c.get('summary_points', [])) + [c['bottom_line']] + list(c['denials_and_context']):
        for x in sentences(s):
            if UNPROVEN_RE.search(x) and x not in out:
                out.append(x)
    return out[:3]

ent_claims = collections.defaultdict(list)
claim_ents = collections.defaultdict(list)
for l in g['links']:
    if l['k'] == 'claim':
        ent_claims[l['t']].append(l['s']); claim_ents[l['s']].append(l['t'])

light = []
for c in claims:
    light.append({'id': c['id'], 'title': c['title'], 'origin': c['origin'], 'verdict': c['verdict'],
                  'line': c['bottom_line'], 'tally': tally(c), 'fixes': len(c['corrections']),
                  'full': c['id'] in FULL})

full = {}
keep_e = set('e:' + f for f in FEATURED)
for cid in FULL:
    c = N[cid]
    src_idx = {s['url']: i + 1 for i, s in enumerate(c['sources'])}
    subs = [{'s': s['statement'], 'v': s['verdict'], 'p': s.get('points') or sentences(s['finding']),
             'src': sorted({src_idx[u] for u in s.get('sources', []) if u in src_idx})} for s in c['sub_claims']]
    pairs = c.get('correction_pairs') or []
    fixes = []
    for i, txt in enumerate(c['corrections']):
        p = pairs[i] if i < len(pairs) else None
        fixes.append({'said': p['said'], 'record': p['record'], 'who': p['who']} if p else {'text': txt})
    ents = claim_ents[cid]
    rels = [r for r in g['rels'] if cid in r.get('claims', []) and r['s'] in ents and r['t'] in ents]
    deg = collections.Counter()
    for r in rels: deg[r['s']] += 1; deg[r['t']] += 1
    ents = sorted(ents, key=lambda e: (-deg[e], N[e]['name']))
    keep_e.update(ents)
    full[cid] = {'claim': c['claim'], 'confidence': c['confidence'], 'more': c.get('summary_points', []),
                 'subs': subs, 'fixes': fixes, 'unproven': unproven_notes(c),
                 'other': c['denials_and_context'], 'audit': c.get('audit', {}).get('result', ''),
                 'parents': c.get('parents', []), 'lines': c.get('lines', ''),
                 'sources': [[s.get('title', ''), s.get('publisher', ''), s.get('url', ''), s.get('date', '')] for s in c['sources']],
                 'ents': [e[2:] for e in ents]}

top = sorted([n for n in g['nodes'] if n['kind'] == 'entity' and n['type'] != 'media' and n['id'] != 'coffeezilla'],
             key=lambda n: -n.get('claim_count', 0))[:14]
keep_e.update(n['key'] for n in top)
feat = set('e:' + f for f in FEATURED)
rels = []
for r in g['rels']:
    if r['s'] in feat or r['t'] in feat:
        keep_e.update([r['s'], r['t']])
for r in g['rels']:
    if r['s'] in keep_e and r['t'] in keep_e and (set(r.get('claims', [])) & set(FULL) or r['s'] in feat or r['t'] in feat):
        o = {'s': r['s'][2:], 't': r['t'][2:], 'l': r['label'], 'k': r['type'], 'c': r.get('claims', [])}
        if r.get('date'): o['d'] = r['date']
        rels.append(o)

def short(n):
    name = n['name']
    if len(name) <= 24: return name
    base = re.split(r' [(/]', name)[0].strip()
    if len(base) <= 24: return base
    al = [a for a in n.get('aliases', []) if a.isupper() and 2 <= len(a) <= 6]
    return al[0] if al else name

entities = {}
for k in sorted(keep_e):
    n = N[k]
    entities[n['id']] = {'n': n['name'], 'sh': short(n), 't': n['type'], 'd': n.get('description', ''),
                         'a': (n.get('aliases') or [])[:4],
                         'c': sorted(set(ent_claims[k]))}
out = {'meta': {k: g['meta'][k] for k in ['generated', 'claims', 'video_claims', 'followups', 'connection_hunts', 'entities', 'relationships', 'tally']},
       'top': [n['id'] for n in top], 'claims': light, 'full': full, 'entities': entities, 'rels': rels}
sub = collections.Counter()
for c in claims:
    for i, v in enumerate(tally(c)): sub[i] += v
out['meta']['points'] = [sub[i] for i in range(4)]
out['meta']['sources'] = sum(len(c['sources']) for c in claims)
blob = json.dumps(out, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
page = os.path.join(here, 'index.html')
html = open(page).read()
a, b = html.index('/*DATA-START*/'), html.index('/*DATA-END*/')
open(page, 'w').write(html[:a] + '/*DATA-START*/const DATA=' + blob + ';' + html[b:])
print(len(json.dumps(out)), len(entities), len(rels), out['meta'])
