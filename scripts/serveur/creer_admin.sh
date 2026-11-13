#!/bin/bash
# Crée (ou met à jour) le compte administrateur de la bibliothèque. Sans sudo.
# À lancer sur le serveur :   ~/apps/aeromag/scripts/serveur/creer_admin.sh
# Rien ne s'affiche pendant la saisie du mot de passe. Les inscriptions restant fermées,
# c'est la seule façon de créer un compte.
set -euo pipefail
# Le chemin complet /usr/bin/supabase est voulu : une ancienne CLI (2.x) traîne dans ~/.local/share/supabase
# et passe devant dans une session interactive ; elle ne sait pas lire la configuration actuelle.

INSTANCE=/home/cynemos/supabase-aeromag
DB=supabase_db_aeromag
API=http://127.0.0.1:54329
REPONSE=$(mktemp)
trap 'rm -f "$REPONSE"' EXIT
trap 'echo "Arrêt inattendu à la ligne $LINENO : rien de plus n a été fait."' ERR

echo "Création du compte administrateur d'AéroMag"

CLE=$( (cd "$INSTANCE" && /usr/bin/supabase status -o env 2>/dev/null </dev/null) | grep '^SERVICE_ROLE_KEY=' | cut -d'"' -f2)
[ -n "$CLE" ] || { echo "Instance Supabase AéroMag non démarrée."; exit 1; }

read -rp "Adresse email du compte administrateur : " EMAIL || { echo; echo "Saisie interrompue : rien n a été fait."; exit 1; }
[ -n "$EMAIL" ] || { echo "Adresse vide : rien n a été fait."; exit 1; }
read -rsp "Mot de passe (8 caractères au moins, rien ne s'affiche) : " MDP; echo
read -rsp "Le même mot de passe, pour vérifier : " MDP2; echo
[ "$MDP" = "$MDP2" ] || { echo "Les deux saisies sont différentes : rien n'a été fait."; exit 1; }
[ "${#MDP}" -ge 8 ] || { echo "Mot de passe trop court : rien n'a été fait."; exit 1; }
export EMAIL MDP

sql() { docker exec -i "$DB" psql -U postgres -d postgres -At -v ON_ERROR_STOP=1 -v email="$EMAIL"; }

# Le corps (email + mot de passe) est fabriqué par python et passé par un tube :
# le mot de passe n'apparaît jamais dans la liste des processus.
envoyer() {  # envoyer <méthode> <adresse>
  python3 -c 'import json, os; print(json.dumps({"email": os.environ["EMAIL"], "password": os.environ["MDP"], "email_confirm": True}))' \
    | curl -s -o "$REPONSE" -w '%{http_code}' -X "$1" -H "apikey: $CLE" -H "Authorization: Bearer $CLE" \
        -H "Content-Type: application/json" --data-binary @- "$2"
}

ID=$(echo "select id from auth.users where email = :'email'" | sql)
if [ -n "$ID" ]; then
  CODE=$(envoyer PUT "$API/auth/v1/admin/users/$ID"); ACTION="mot de passe mis à jour"
else
  CODE=$(envoyer POST "$API/auth/v1/admin/users"); ACTION="compte créé"
fi
[ "$CODE" = 200 ] || { echo "ÉCHEC ($CODE) : $(cut -c1-200 "$REPONSE")"; exit 1; }

echo "insert into public.admins (user_id) select id from auth.users where email = :'email' on conflict do nothing" | sql > /dev/null
echo "ADMIN_OK : $ACTION pour $EMAIL, déclaré administrateur ($(echo 'select count(*) from public.admins' | sql) administrateur(s) au total)."
