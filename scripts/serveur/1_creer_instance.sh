#!/bin/bash
# Étape 1 — Crée sur le serveur une instance Supabase réservée à AéroMag, à côté de celles de Lambretta et Bultaco.
# Sans sudo. À lancer une seule fois (relancer ne change rien si l'instance existe déjà).
#
# - Ports 54329 (API) et 54320 (base) : les deux derniers libres de la plage 54320-54329, déjà fermée
#   au réseau par le service supabase-pare-feu. Seul nginx, sur le serveur, y accède.
#   Studio est désactivé (plus de port libre dans la plage) : la base se gère par psql.
# - Clés tirées au hasard (jwt_secret, publishable_key, secret_key) : sans cela, la CLI utilise
#   des clés d'administration par défaut, identiques sur toutes les installations et donc publiques.
# - Services inutiles à ce site désactivés (temps réel, fonctions Edge, journaux, courriels de test, Studio).
# - Une 4e instance demandera d'élargir la plage du pare-feu (scripts/installer_pare_feu.sh du dépôt lambretta).
set -euo pipefail
# Le chemin complet /usr/bin/supabase est voulu : une ancienne CLI (2.x) traîne dans ~/.local/share/supabase
# et passe devant dans une session interactive ; elle ne sait pas lire la configuration actuelle.

MODELE=/home/cynemos/supabase/supabase/config.toml   # configuration de Lambretta, qui sert de modèle
DOSSIER=/home/cynemos/supabase-aeromag
CONFIG="$DOSSIER/supabase/config.toml"

if [ -f "$CONFIG" ]; then
  echo "Configuration déjà présente : $CONFIG (non modifiée)"
else
  mkdir -p "$DOSSIER/supabase"
  SECRET=$(openssl rand -hex 32)
  alea() { openssl rand -base64 48 | tr -dc 'A-Za-z0-9' | cut -c1-"$1"; }
  CLE_PUBLIQUE="$(alea 22)_$(alea 8)"
  CLE_ADMIN="$(alea 22)_$(alea 8)"
  ( umask 077; SECRET="$SECRET" CLE_PUBLIQUE="$CLE_PUBLIQUE" CLE_ADMIN="$CLE_ADMIN" python3 - "$MODELE" "$CONFIG" <<'PY'
import os, re, sys
source, cible = sys.argv[1], sys.argv[2]
secret = os.environ["SECRET"]
# section -> {clé: nouvelle valeur}
reglages = {
    "": {"project_id": '"aeromag"'},
    "api": {"port": "54329"},
    "db": {"port": "54320", "shadow_port": "54330"},
    "studio": {"enabled": "false"},
    "realtime": {"enabled": "false"},
    "local_smtp": {"enabled": "false"},
    "storage.s3_protocol": {"enabled": "false"},
    "edge_runtime": {"enabled": "false"},
    "analytics": {"enabled": "false"},
    "auth": {
        "site_url": '"https://aeromag.cyneprod.org"',
        "additional_redirect_urls": '["https://aeromag.cyneprod.org"]',
        "enable_signup": "false",
    },
}
faits, section, sortie = set(), "", []
for ligne in open(source, encoding="utf-8").read().splitlines():
    titre = re.match(r"^\[([^\]]+)\]\s*$", ligne)
    if titre:
        section = titre.group(1)
        sortie.append(ligne)
        if section == "auth":
            sortie.append("# Clé de signature propre à cette instance (ne jamais la publier).")
            sortie.append(f'jwt_secret = "{secret}"')
            # Les clés « sb_… » ont elles aussi une valeur par défaut publique : on les remplace.
            sortie.append(f'publishable_key = "sb_publishable_{os.environ["CLE_PUBLIQUE"]}"')
            sortie.append(f'secret_key = "sb_secret_{os.environ["CLE_ADMIN"]}"')
        continue
    cle = re.match(r"^([a-z_]+)\s*=", ligne)
    if section == "auth" and (ligne.startswith("# Clés propres") or (cle and cle.group(1) in ("jwt_secret", "publishable_key", "secret_key"))):
        continue  # clés de l'instance modèle : celles de cette instance sont ajoutées plus haut
    if cle and cle.group(1) in reglages.get(section, {}):
        sortie.append(f"{cle.group(1)} = {reglages[section][cle.group(1)]}")
        faits.add((section, cle.group(1)))
        continue
    sortie.append(ligne)
manquants = [(s, c) for s, v in reglages.items() for c in v if (s, c) not in faits]
if manquants:
    sys.exit(f"Réglages introuvables dans le modèle : {manquants}")
open(cible, "w", encoding="utf-8").write("\n".join(sortie) + "\n")
PY
  )
  chmod 600 "$CONFIG"
  echo "Configuration créée : $CONFIG"
fi

cd "$DOSSIER"
if docker ps --format '{{.Names}}' | grep -q '^supabase_db_aeromag$'; then
  echo "Instance déjà démarrée."
else
  echo "Démarrage de l'instance (1 à 3 minutes)…"
  # La sortie de « supabase start » contient les clés : elle va dans un fichier privé, pas à l'écran.
  ( umask 077; /usr/bin/supabase start > "$DOSSIER/demarrage.log" 2>&1 ) || { echo "ÉCHEC du démarrage :"; grep -viE 'key|secret|eyJ' "$DOSSIER/demarrage.log" | tail -20; exit 1; }
fi

echo "--- Conteneurs"
docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}' | grep '_aeromag' | sort
echo "INSTANCE_OK"
