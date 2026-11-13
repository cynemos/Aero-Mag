#!/bin/bash
# Reprend les revues et leurs couvertures de l'ancien Supabase cloud (époque de la boutique)
# dans la bibliothèque du serveur. Sans sudo. L'ancienne base n'est pas modifiée.
#
# Tout ce qui est repris est public (lecture des revues, couvertures) : seule la clé publique
# « anon » de l'ancien projet est nécessaire, aucun mot de passe.
#   CLE_ANON='eyJ…' ~/apps/aeromag/scripts/serveur/importer_ancienne_base.sh
#
# Seuls les champs de la bibliothèque sont repris (pas le prix ni le stock).
# Refuse de tourner si la bibliothèque contient déjà des revues.
set -euo pipefail
# Le chemin complet /usr/bin/supabase est voulu : une ancienne CLI (2.x) traîne dans ~/.local/share/supabase
# et passe devant dans une session interactive ; elle ne sait pas lire la configuration actuelle.

export ANCIENNE_API=${ANCIENNE_API:-https://hnhtcskauvjcrhvtsgrw.supabase.co}
export NOUVELLE_API_PUBLIQUE=${NOUVELLE_API_PUBLIQUE:-https://api-aeromag.cyneprod.org}
export API=http://127.0.0.1:54329
: "${CLE_ANON:?Indiquer la clé publique anon de l ancien projet : CLE_ANON=… $0}"
export CLE_ANON

LOCAL_SERVICE_KEY=$( (cd /home/cynemos/supabase-aeromag && /usr/bin/supabase status -o env 2>/dev/null </dev/null) | grep '^SERVICE_ROLE_KEY=' | cut -d'"' -f2)
[ -n "$LOCAL_SERVICE_KEY" ] || { echo "Instance Supabase AéroMag non démarrée."; exit 1; }
export LOCAL_SERVICE_KEY
export SIMULATION=${SIMULATION:-0}   # SIMULATION=1 : lit l'ancienne base et affiche le bilan, sans rien écrire

python3 - <<'PY'
import json, os, sys, urllib.error, urllib.parse, urllib.request

ancienne, api, publique = os.environ["ANCIENNE_API"].rstrip("/"), os.environ["API"], os.environ["NOUVELLE_API_PUBLIQUE"].rstrip("/")
cle_anon, cle_locale = os.environ["CLE_ANON"], os.environ["LOCAL_SERVICE_KEY"]
simulation = os.environ["SIMULATION"] == "1"
CHAMPS = ["id", "title", "issue_number", "publication_date", "description", "cover_image_url",
          "keywords", "has_plan", "plan_model_name", "created_at", "updated_at"]
MARQUE = "/storage/v1/object/public/magazines/"


def appel(url, cle, methode="GET", corps=None, entetes=None, brut=False):
    requete = urllib.request.Request(url, data=corps, method=methode,
        headers={"apikey": cle, "Authorization": f"Bearer {cle}", **(entetes or {})})
    reponse = urllib.request.urlopen(requete, timeout=120)
    contenu = reponse.read()
    return (contenu, reponse.headers.get("Content-Type")) if brut else (json.loads(contenu) if contenu else None)


# 1. Lecture de l'ancienne base
revues = []
while True:
    page = appel(f"{ancienne}/rest/v1/magazines?select=*&order=created_at&offset={len(revues)}&limit=1000", cle_anon)
    revues += page
    if len(page) < 1000:
        break
titres = {}
for r in revues:
    titres[r["title"]] = titres.get(r["title"], 0) + 1
print(f"Ancienne base : {len(revues)} numéros, {len(titres)} revues, "
      f"{sum(1 for r in revues if r.get('has_plan'))} plans, {sum(1 for r in revues if r.get('cover_image_url'))} couvertures")
for titre, nombre in sorted(titres.items(), key=lambda t: -t[1])[:15]:
    print(f"  {nombre:4d}  {titre}")
if not revues:
    sys.exit("Rien à reprendre.")
if simulation:
    sys.exit(0)

# 2. La bibliothèque doit être vide
if appel(f"{api}/rest/v1/magazines?select=id&limit=1", cle_locale):
    sys.exit("La bibliothèque contient déjà des revues : import annulé pour ne rien écraser.")

# 3. Couvertures : copie dans le stockage du serveur, puis nouvelle adresse dans la fiche
copiees, externes, echecs = 0, 0, []
for numero, r in enumerate(revues, 1):
    url = r.get("cover_image_url")
    if not url:
        continue
    if MARQUE not in url:
        externes += 1          # image hébergée ailleurs : adresse gardée telle quelle
        continue
    chemin = url.split(MARQUE, 1)[1].split("?")[0]
    try:
        contenu, type_image = appel(f"{ancienne}{MARQUE}{chemin}", cle_anon, brut=True)
        appel(f"{api}/storage/v1/object/magazines/{chemin}", cle_locale, "POST", contenu,
              {"Content-Type": type_image or "image/jpeg", "x-upsert": "true", "cache-control": "max-age=31536000"})
        r["cover_image_url"] = f"{publique}{MARQUE}{chemin}"
        copiees += 1
    except urllib.error.HTTPError as erreur:
        echecs.append(f"{r['title']} n° {r['issue_number']} : {erreur.code} {erreur.read().decode()[:100]}")
        r["cover_image_url"] = None
    except Exception as erreur:
        echecs.append(f"{r['title']} n° {r['issue_number']} : {erreur}")
        r["cover_image_url"] = None
    if numero % 50 == 0:
        print(f"  couvertures : {numero}/{len(revues)}…", flush=True)
print(f"Couvertures copiées : {copiees} ; externes gardées : {externes} ; en échec : {len(echecs)}")

# 4. Fiches (champs de la bibliothèque seulement)
lignes = [{c: r.get(c) for c in CHAMPS if c in r} for r in revues]
for ligne in lignes:
    ligne["has_plan"] = bool(ligne.get("has_plan"))
for debut in range(0, len(lignes), 200):
    try:
        appel(f"{api}/rest/v1/magazines", cle_locale, "POST", json.dumps(lignes[debut:debut + 200]).encode(),
              {"Content-Type": "application/json", "Prefer": "return=minimal"})
    except urllib.error.HTTPError as erreur:
        sys.exit(f"ÉCHEC de l'écriture des fiches : {erreur.code} {erreur.read().decode()[:300]}")

total = len(appel(f"{api}/rest/v1/magazines?select=id", cle_locale))
print(f"Bibliothèque : {total} numéros (ancienne base : {len(revues)})")
if echecs:
    print("Couvertures non reprises :\n  " + "\n  ".join(echecs[:30]))
print("IMPORT_OK" if total == len(revues) and not echecs else "IMPORT À VÉRIFIER")
PY
