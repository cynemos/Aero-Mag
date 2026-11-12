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

`scripts/serveur/1_creer_instance.sh` crée sur le serveur personnel une instance Supabase
réservée à AéroMag, avec ses propres clés (la CLI Supabase utilise sinon des clés
d'administration par défaut, publiques).

## Secrets

Aucun secret ne doit entrer dans ce dépôt. L'historique antérieur à la v2.0.0 contient
d'anciennes clés (Supabase, Stripe en mode test, Postmark) : elles doivent être révoquées
chez ces services.
