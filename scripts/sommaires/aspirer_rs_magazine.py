"""Rassemble les sommaires des anciens numéros de RS Magazine.

Le site de l'éditeur (rsmagazine.fr) n'a plus ses pages d'anciens numéros ; leurs copies archivées
par la Wayback Machine donnent la présentation et le sommaire de nombreux numéros. Deux versions
du site sont lues : la boutique actuelle (rsmagazine.fr/produit/rs-magazine-N/, captures 2020-2024)
puis l'ancienne (www.rsmagazine.fr, captures 2011) pour les numéros restants.

Usage : python3 scripts/sommaires/aspirer_rs_magazine.py public/sommaires/rs-magazine.json
Lent exprès (une page toutes les quelques secondes) ; les pages lues sont gardées dans
.cache-sommaires/ : en cas d'arrêt, relancer reprend là où il s'était arrêté.
"""
import hashlib, html, json, os, re, sys, time, urllib.parse, urllib.request

CACHE = '.cache-sommaires'
NOTE_SOURCE = 'https://web.archive.org/web/{ts}/{url}'

def lire(url):
    os.makedirs(CACHE, exist_ok=True)
    f = os.path.join(CACHE, hashlib.md5(url.encode()).hexdigest() + '.html')
    if os.path.exists(f):
        return open(f, encoding='utf-8').read()
    for essai in range(4):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (lecture d\'archives)'})
            with urllib.request.urlopen(req, timeout=90) as r:
                texte = r.read().decode('utf-8', errors='replace')
            open(f, 'w', encoding='utf-8').write(texte)
            time.sleep(1.5)
            return texte
        except Exception as e:
            print('  nouvel essai', url[-70:], e, flush=True)
            time.sleep(10 * (essai + 1))
    return ''

def lignes(fragment):
    fragment = re.sub(r'<br\s*/?>', '\n', fragment, flags=re.I)
    fragment = html.unescape(re.sub(r'<[^>]+>', '', fragment)).replace('\xa0', ' ')
    return [re.sub(r'\s+', ' ', l).strip() for l in fragment.split('\n') if l.strip()]

def paragraphes(bloc):
    return [l for l in (lignes(p) for p in re.findall(r'<(?:p|h[3-6])[^>]*>(.*?)</(?:p|h[3-6])>', bloc, re.S)) if l]

# --- Mise en forme : présentation, « Sommaire », puis « - RUBRIQUE (p. 12) • sujet – sujet » ---
PUB = re.compile(r"^(le magazine des passionn|les autos, les hommes|description$|mensuel\b|.*\b180 pages\b)", re.I)
MARQUE = re.compile(r"sommaire", re.I)
POINTS = re.compile(r"^(.*?)\s*(?:\.\s*){2,}\s*(\d+)$")

def majuscules(l):
    lettres = [c for c in l if c.isalpha()]
    return bool(lettres) and not any(c.islower() for c in lettres)

def mettre_en_forme(paras):
    suite = []
    for p in paras:
        suite += [l for l in p if not PUB.match(l)] + ['']
    debut = next((i for i, l in enumerate(suite) if MARQUE.search(l) and len(l) < 40), None)
    if debut is None:
        debut = next((i - 1 for i, l in enumerate(suite) if POINTS.match(l)), None)
    if debut is None:
        # Présentation seule (« Au sommaire de ce numéro, vous pourrez découvrir… ») : gardée telle quelle
        texte = '\n\n'.join(l for l in suite if l).strip()
        return texte if len(texte) > 80 and re.search(r'num[ée]ro', texte, re.I) else None
    intro =re.sub(r'\n{3,}', '\n\n', '\n'.join(suite[:max(debut, 0)]).strip())
    items, cour = [], None
    for l in suite[debut + 1:]:
        if not l:
            continue
        m = POINTS.match(l)
        if m:
            cour = [m.group(1).strip(), m.group(2), []]
            items.append(cour)
        elif '•' in l and (l.startswith('-') or majuscules(l.split('•', 1)[0])):
            titre, sujet = l.lstrip('-').split('•', 1)
            cour = None
            items.append([titre.strip(), None, [sujet.strip()]])
        elif majuscules(l) and len(l) < 60:
            cour = [l, None, []]
            items.append(cour)
        elif cour is not None:
            cour[2].append(l.lstrip('- ').strip())
        else:
            items.append([l.lstrip('- ').strip(), None, []])
    if not items:
        return None
    rubriques = [f"- {t}{f' (p. {pg})' if pg else ''}{' • ' + ' – '.join(s) if s else ''}" for t, pg, s in items]
    return ((intro + '\n\n') if intro else '') + 'Sommaire\n' + '\n'.join(rubriques)

def boutique(page):
    i = page.find('id="tab-description"')
    return mettre_en_forme(paragraphes(page[i:page.find('</div>', i)])) if i >= 0 else None

def ancien_site(page):
    m = re.search(r'<strong>\s*RS Magazine\s+0*(\d+)\s*</strong>', page)
    i = page.find('class="product-specs"')
    if not m or i < 0:
        return None, None
    fin = page.find('<div class="collateral-box">', i)
    return int(m.group(1)), mettre_en_forme(paragraphes(page[i:fin if fin > 0 else i + 20000]))

def cdx(motif):
    url = 'https://web.archive.org/cdx/search/cdx?' + urllib.parse.urlencode(
        {'url': motif, 'collapse': 'urlkey', 'fl': 'original,timestamp', 'filter': 'statuscode:200', 'limit': '2000'})
    return [l.split() for l in lire(url).splitlines() if l.strip()]

def capture(url, annee):
    d = json.loads(lire(f'https://archive.org/wayback/available?url={url}&timestamp={annee}') or '{}')
    snap = d.get('archived_snapshots', {}).get('closest')
    return snap['timestamp'] if snap and snap.get('status') == '200' else None

def principal(sortie):
    res = {}
    for url, ts in cdx('rsmagazine.fr/produit/rs-magazine-*'):
        n = re.search(r'rs-magazine-(\d+)/?$', url)
        if not n:
            continue
        n = int(n.group(1))
        url = f'https://rsmagazine.fr/produit/rs-magazine-{n}/'
        for t in (ts, capture(url, '20241201'), capture(url, '20221201')):
            texte = t and boutique(lire(f'https://web.archive.org/web/{t}id_/{url}'))
            if texte:
                res[n] = {'texte': texte, 'source': NOTE_SOURCE.format(ts=t, url=url)}
                break
    print('boutique :', len(res), flush=True)
    for url, ts in cdx('www.rsmagazine.fr/rs-magazine-porsche-voiture-*'):
        n, texte = ancien_site(lire(f'https://web.archive.org/web/{ts}id_/{url}'))
        if n and texte and n not in res:
            res[n] = {'texte': texte, 'source': NOTE_SOURCE.format(ts=ts, url=url)}
    print('total :', len(res), flush=True)
    json.dump({str(k): res[k] for k in sorted(res)}, open(sortie, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    principal(sys.argv[1] if len(sys.argv) > 1 else 'rs-magazine.json')
