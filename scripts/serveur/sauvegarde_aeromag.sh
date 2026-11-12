#!/bin/bash
# Sauvegarde quotidienne du site AéroMag : base Supabase, fichiers (couvertures),
# configurations. Copie locale (7 jours) puis copie sur le NAS (30 jours + 1 par mois sur 12 mois).
# Lancé chaque nuit par cron ; journal dans ~/sauvegardes/auto-aeromag/journal.log
set -euo pipefail

LOCAL=/home/cynemos/sauvegardes/auto-aeromag
NAS=/mnt/nas-sauvegardes/aeromag
GARDER_LOCAL=7          # jours gardés sur le serveur
GARDER_NAS_JOURS=30     # sauvegardes quotidiennes gardées sur le NAS
GARDER_NAS_MOIS=12      # sauvegardes du 1er du mois gardées sur le NAS
DB=supabase_db_aeromag
STOCKAGE=supabase_storage_aeromag

D=$(date +%F_%H%M)
W="$LOCAL/$D"
JOURNAL="$LOCAL/journal.log"
ETAT="$LOCAL/ETAT"
mkdir -p "$LOCAL"
exec 2>>"$JOURNAL"   # les messages d'erreur des commandes vont dans le journal

log() { echo "$(date '+%F %T') $*" | tee -a "$JOURNAL"; }

# Alertes sur téléphone via ntfy (application gratuite). Le nom du canal, secret,
# est dans ~/.config/lambretta-alerte (NTFY_CANAL=...), commun aux deux sites, et jamais dans le dépôt.
# Sans ce fichier, aucune alerte n'est envoyée.
NTFY_CANAL=""
[ -r "$HOME/.config/lambretta-alerte" ] && . "$HOME/.config/lambretta-alerte"
alerte() {  # alerte <priorité 1-5> <étiquette> <titre> <message>
  [ -n "$NTFY_CANAL" ] || return 0
  python3 -c 'import json,sys; print(json.dumps({"topic":sys.argv[1],"priority":int(sys.argv[2]),"tags":[sys.argv[3]],"title":sys.argv[4],"message":sys.argv[5]}))' \
    "$NTFY_CANAL" "$1" "$2" "$3" "$4" \
    | curl -s -m 20 -o /dev/null -X POST -H "Content-Type: application/json" --data-binary @- https://ntfy.sh \
    || log "alerte ntfy non envoyée"
}

echec() {
  trap - ERR
  local cause
  cause=$(grep -v '^20[0-9][0-9]-' "$JOURNAL" | tail -n 1 | cut -c1-200)   # dernier message d'erreur d'une commande
  log "ÉCHEC : $* ${cause:+($cause)}"
  echo "ECHEC $(date '+%F %T') : $* ${cause:+($cause)}" > "$ETAT"
  alerte 5 rotating_light "Sauvegarde AéroMag : ÉCHEC" "$*${cause:+ : $cause}. Détail dans ~/sauvegardes/auto-aeromag/journal.log sur le serveur." || true
  exit 1
}
trap 'echec "erreur ligne $LINENO"' ERR

log "=== Début de la sauvegarde $D"
mkdir -p "$W"

# 1. Base de données complète (contenu, comptes, règles d'accès, fiches du stockage)
docker exec "$DB" pg_dump -U postgres -d postgres -Fc > "$W/base.dump"
docker exec "$DB" pg_dumpall -U postgres --roles-only > "$W/roles.sql"
docker exec -i "$DB" pg_restore -l < "$W/base.dump" > /dev/null || echec "base.dump illisible"

# 2. Fichiers envoyés sur le site (couvertures)
docker exec "$STOCKAGE" tar -cf - -C /mnt . | gzip -6 > "$W/fichiers.tar.gz"
gzip -t "$W/fichiers.tar.gz" || echec "fichiers.tar.gz corrompu"

# 3. Configurations nécessaires pour tout reconstruire
mkdir -p "$W/config"
cp /home/cynemos/supabase-aeromag/supabase/config.toml "$W/config/supabase-config.toml"
cp /home/cynemos/apps/aeromag/.env "$W/config/site.env"
cp /etc/nginx/sites-available/aeromag "$W/config/nginx-aeromag"
git -C /home/cynemos/apps/aeromag describe --tags --always > "$W/config/version-site.txt"

# 4. Inventaire pour vérifier une restauration
{
  echo "Sauvegarde du $D"
  docker exec "$DB" psql -U postgres -d postgres -At -c "
    select 'numeros ' || count(*) from magazines union all
    select 'revues ' || count(distinct title) from magazines union all
    select 'plans ' || count(*) from magazines where has_plan union all
    select 'comptes ' || count(*) from auth.users union all
    select 'admins ' || count(*) from admins union all
    select 'fichiers_stockage ' || count(*) from storage.objects"
  echo "fichiers_dans_archive $(tar -tzf "$W/fichiers.tar.gz" | grep -vc '/$')"
} > "$W/INVENTAIRE.txt"
( cd "$W" && find . -type f ! -name SHA256SUMS -exec sha256sum {} + > SHA256SUMS )
log "Sauvegarde locale : $(du -sh "$W" | cut -f1) — $(tr '\n' ' ' < "$W/INVENTAIRE.txt" | cut -c1-200)"

# 5. Rotation locale : on garde les $GARDER_LOCAL plus récentes
ls -1d "$LOCAL"/20??-??-??_???? 2>/dev/null | sort | head -n -"$GARDER_LOCAL" | xargs -r rm -rf

# 6. Copie sur le NAS
if mountpoint -q /mnt/nas-sauvegardes && mkdir -p "$NAS" 2>/dev/null && [ -w "$NAS" ]; then
  rsync -rt --no-perms --no-owner --no-group "$W/" "$NAS/$D/"
  ( cd "$NAS/$D" && sha256sum --quiet -c SHA256SUMS ) || echec "copie sur le NAS différente de l'original"
  # Rotation NAS : quotidiennes de moins de $GARDER_NAS_JOURS jours, et celles du 1er du mois sur $GARDER_NAS_MOIS mois
  limite_jour=$(date -d "-$GARDER_NAS_JOURS days" +%F)
  limite_mois=$(date -d "-$GARDER_NAS_MOIS months" +%F)
  for dossier in "$NAS"/20??-??-??_????; do
    [ -d "$dossier" ] || continue
    jour=$(basename "$dossier" | cut -c1-10)
    if [[ "$jour" < "$limite_jour" ]]; then
      if [[ "${jour:8:2}" == "01" && ! "$jour" < "$limite_mois" ]]; then continue; fi
      rm -rf "$dossier"
    fi
  done
  NB_NAS=$(ls -1d "$NAS"/20??-??-??_???? | wc -l)
  log "Copie NAS vérifiée : $NAS/$D ($NB_NAS sauvegardes sur le NAS)"
  echo "OK $(date '+%F %T') : locale + NAS ($D)" > "$ETAT"
  # Le lundi (ou à la demande), un petit bilan : l'absence de ce message signale aussi un problème
  if [ "$(date +%u)" = 1 ] || [ "${BILAN:-0}" = 1 ]; then
    alerte 2 white_check_mark "Sauvegarde AéroMag : tout va bien" \
      "Dernière sauvegarde $D vérifiée, $NB_NAS sur le NAS ($(df -h /mnt/nas-sauvegardes | awk 'NR==2 {print $4}') libres). $(sed -n '2,4p' "$W/INVENTAIRE.txt" | tr '\n' ',' | sed 's/,$//; s/,/, /g')." || true
  fi
else
  log "ATTENTION : NAS non monté ou non accessible en écriture, sauvegarde locale seulement"
  echo "PARTIEL $(date '+%F %T') : locale seulement, NAS indisponible ($D)" > "$ETAT"
  alerte 4 warning "Sauvegarde AéroMag : NAS injoignable" \
    "La sauvegarde $D est faite sur le serveur seulement. Vérifier que le NAS est allumé et le partage sauvegardes-serveur accessible." || true
  exit 2
fi
log "=== Fin"
