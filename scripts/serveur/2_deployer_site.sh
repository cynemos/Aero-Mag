#!/bin/bash
# Étape 2, puis à chaque mise à jour — Installe ou met à jour le site AéroMag sur le serveur.
# Sans sudo. Après un push sur GitHub (branche main), lancer sur le serveur :
#   ~/apps/aeromag/scripts/serveur/2_deployer_site.sh
#
# Récupère la branche main, compile dans un dossier à part, puis bascule : le site n'est jamais
# servi à moitié compilé, et la version précédente est gardée (dist.vX.Y.Z-date).
set -euo pipefail
# Le chemin complet /usr/bin/supabase est voulu : une ancienne CLI (2.x) traîne dans ~/.local/share/supabase
# et passe devant dans une session interactive ; elle ne sait pas lire la configuration actuelle.

DEPOT=https://github.com/cynemos/Aero-Mag.git
SITE=/home/cynemos/apps/aeromag
INSTANCE=/home/cynemos/supabase-aeromag
API_PUBLIQUE=https://api-aeromag.cyneprod.org
GARDER=3   # anciennes versions conservées

# node est installé par nvm (nvm ne supporte pas « set -u », d'où la parenthèse)
if [ -s "$HOME/.nvm/nvm.sh" ]; then set +u; . "$HOME/.nvm/nvm.sh"; set -u; fi

if [ -d "$SITE/.git" ]; then
  git -C "$SITE" fetch --quiet origin main
  git -C "$SITE" merge --ff-only origin/main
else
  git clone --quiet --branch main "$DEPOT" "$SITE"
fi
cd "$SITE"

if [ ! -f .env ]; then
  CLE=$( (cd "$INSTANCE" && /usr/bin/supabase status -o env 2>/dev/null) | grep '^ANON_KEY=' | cut -d'"' -f2)
  [ -n "$CLE" ] || { echo "Instance Supabase AéroMag non démarrée (étape 1)."; exit 1; }
  ( umask 077; printf 'VITE_SUPABASE_URL=%s\nVITE_SUPABASE_ANON_KEY=%s\n' "$API_PUBLIQUE" "$CLE" > .env )
  echo "Fichier .env créé."
fi

npm ci --no-audit --no-fund --silent
rm -rf dist-new
node_modules/.bin/vite build --outDir dist-new > /dev/null
[ -s dist-new/index.html ] || { echo "ÉCHEC de la compilation : l'ancien site reste en place."; exit 1; }

VERSION=$(node -p "require('./package.json').version")
[ -d dist ] && mv dist "dist.v$(cat dist/.version 2>/dev/null || echo ancienne)-$(date +%Y%m%d-%H%M%S)"
echo "$VERSION" > dist-new/.version
mv dist-new dist
{ ls -1d dist.v* 2>/dev/null || true; } | sort -t- -k2 | head -n -"$GARDER" | xargs -r rm -rf
echo "SITE_OK : version $VERSION en place dans $SITE/dist"
