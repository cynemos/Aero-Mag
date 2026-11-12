# AéroMag — Bibliothèque de revues d'aéromodélisme

Catalogue d'une collection personnelle de revues d'aéromodélisme : chaque numéro avec sa
couverture, sa date de parution, ses mots-clés et, s'il y en a un, le plan encarté.
La consultation est libre ; seul l'administrateur peut ajouter ou modifier des numéros.

Depuis la v2.0.0, l'ancienne boutique (panier, paiement, commandes, messagerie, comptes
clients) a été retirée : le site ne sert plus qu'à présenter et retrouver les numéros.

## Fonctions

- **Collection** : numéros regroupés par revue, recherche (titre, numéro, description,
  modèle du plan, mots-clés, sans tenir compte des accents) et filtre « avec plan encarté ».
  La recherche est dans l'adresse (`/collection?q=…`).
- **Fiche d'un numéro** : couverture, parution, plan, description, mots-clés cliquables.
- **Gérer** (administrateur) : ajout, modification, suppression. La couverture peut être
  choisie, glissée ou photographiée ; elle est réduite avant l'envoi, et son texte est lu
  (OCR) pour proposer des mots-clés.

## Technologies

- React 18 + TypeScript + Vite, Tailwind CSS, icônes lucide-react
- Supabase : base de données, authentification, stockage des couvertures
- tesseract.js pour la lecture du texte des couvertures (dans le navigateur ; ses fichiers
  sont téléchargés depuis un CDN à la première utilisation)

## Démarrage

```bash
npm install
npm run dev
```

Créer un fichier `.env` (jamais versionné, voir `.env.example`) :

```
VITE_SUPABASE_URL=https://<adresse de l'API Supabase>
VITE_SUPABASE_ANON_KEY=<clé publique anon>
```

Vérifications : `npm run typecheck`, `npm run lint`, `npm run build`.

## Base de données

Le schéma complet tient dans `supabase/migrations/20261112200000_schema_bibliotheque.sql`
(tables `magazines` et `admins`, fonction `is_admin()`, règles d'accès, stockage
`magazines`). Les 36 migrations de l'ancienne boutique sont archivées dans
`supabase/archives/` pour mémoire.

- Tout le monde peut lire les revues ; seuls les comptes listés dans `public.admins`
  peuvent écrire. C'est la base qui l'impose, pas le site.
- L'inscription doit rester fermée dans Supabase.
- Déclarer un administrateur, une fois son compte créé :

  ```sql
  INSERT INTO public.admins (user_id)
  SELECT id FROM auth.users WHERE email = 'adresse-admin@exemple.fr';
  ```

## Hébergement

Le site tourne sur le serveur personnel : https://aeromag.cyneprod.org
(API Supabase : https://api-aeromag.cyneprod.org). Les scripts sont dans `scripts/serveur/`
et se lancent sur le serveur :

- `1_creer_instance.sh` : crée l'instance Supabase d'AéroMag, avec ses propres clés
  (la CLI Supabase utilise sinon des clés d'administration par défaut, publiques).
- `2_deployer_site.sh` : installe le site, puis le met à jour **après chaque push sur
  `main`** (récupère `main`, compile, bascule en gardant la version précédente).
- `3_nginx_certificat.sh` : configuration nginx et certificat HTTPS (demande sudo).
- `creer_admin.sh` : crée le compte administrateur ou change son mot de passe
  (saisie masquée ; les inscriptions restent fermées).
- `importer_ancienne_base.sh` : reprend les revues et les couvertures de l'ancien Supabase
  cloud, avec sa seule clé publique.
- `sauvegarde_aeromag.sh` : sauvegarde quotidienne (base, couvertures, configuration) sur
  le serveur et sur le NAS ; copié dans `~/bin/` et planifié par cron.

Les scripts appellent `/usr/bin/supabase` par son chemin complet : une ancienne CLI
présente dans le dossier personnel passe sinon devant dans une session interactive.

## Secrets

Aucun secret ne doit entrer dans ce dépôt. L'historique antérieur à la v2.0.0 contient
d'anciennes clés (Supabase, Stripe en mode test, Postmark) : elles doivent être révoquées
chez ces services.
