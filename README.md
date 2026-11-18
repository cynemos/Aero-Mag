# AéroMag — La bibliothèque des revues anciennes

Catalogue d'une collection personnelle de revues anciennes : aéromodélisme, Porsche, enduro,
trial… Chaque numéro est rangé par thème puis par revue, avec sa couverture et sa date de
parution. La consultation est libre ; seul l'administrateur peut inscrire
ou modifier des numéros.

- v2.0.0 : l'ancienne boutique (panier, paiement, commandes, messagerie, comptes clients)
  a été retirée.
- v2.1.0 : thèmes, et habillage « vieille bibliothèque » (boiseries, plaques de laiton,
  rayonnages, fiches de catalogue).

## Fonctions

- **Accueil** : la collection en chiffres et un tiroir par thème.
- **Les rayonnages** (`/collection`) : onglets par thème, numéros debout sur leurs tablettes,
  regroupés par revue ; recherche sans accents (titre, numéro, thème, description, modèle
  du plan). Thème, recherche et filtre sont dans l'adresse
  (`?theme=…&q=…&plans=1`).
- **Fiche d'un numéro** : la revue sur son sous-main, avec sa fiche de catalogue.
- **Le registre** (administrateur) : inscription, modification, retrait. La couverture peut
  être choisie, glissée ou photographiée ; elle est réduite avant l'envoi, et son texte est
  lu (OCR) pour reconnaître la revue, le numéro et la date de parution (champs laissés vides
  si rien n’est reconnu, jamais écrasés s’ils sont déjà remplis). Revues reconnues : celles
  déjà inscrites dans la bibliothèque, plus quelques titres courants (`TITRES_CONNUS` dans
  `src/lib/ocr.ts`) ; le premier numéro d’une nouvelle revue se saisit à la main. Le texte
  écrit à la verticale (souvent le long du code-barres) est lu aussi, en tournant la
  couverture d’un quart de tour dans chaque sens : la lecture peut alors prendre jusqu’à une minute.
  Elle s’arrête dès que la revue, le numéro et la date sont trouvés. Le thème suit la revue
  (reconnue ou choisie dans la liste) : celui de ses numéros déjà inscrits, sinon celui
  indiqué dans `REVUES_CONNUES` (`src/lib/ocr.ts`).
- **Saisie** : la revue se choisit dans une liste (revues courantes et déjà inscrites, ou
  « Autre revue » pour en ajouter une). Les revues étant mensuelles, la parution se donne en
  mois et année, avec les numéros doubles (juillet-août) : `publication_date` vaut le 1er du
  mois, `double_issue` indique que le numéro couvre aussi le mois suivant.
- **Le récapitulatif** (`/recapitulatif`, public) : chiffres clés, puis revue par revue le
  nombre de numéros, la plage du premier au dernier, la part de série continue et les numéros
  manquants entre les deux, avec leur parution estimée d'après les numéros voisins datés.
  Des pistes sont proposées : séries presque complètes, plus grand trou, revues à un seul
  numéro, dates incohérentes avec l'ordre des numéros, numéros sans date. Répartition par
  thème et par décennie ; bouton pour copier la liste des numéros recherchés. Pour
  l'administrateur, liste des fiches à compléter (couverture, date, description, modèle du
  plan). Calculs dans `src/lib/statistiques.ts`. Un hors-série se note « HS 13 » (proposé
  ainsi par l'OCR quand la couverture porte « Hors-série ») : tout numéro qui n'est pas un
  simple nombre est listé à part et n'entre pas dans le calcul des manquants.
- **Inscription en série** (`/admin/serie`, bouton « Inscrire en série » du registre) : on
  photographie plusieurs couvertures à la suite (sur ordinateur, la caméra reste ouverte ;
  sur téléphone, un appui par photo) ou on en choisit plusieurs, puis « Lire les photos »
  les envoie et les lit une par une. Chaque photo devient une fiche pré-remplie (revue,
  thème, numéro, parution) à vérifier, puis à inscrire seule ou avec « Tout inscrire ». Les
  couvertures des photos retirées ou non inscrites en quittant la page sont supprimées du
  stockage. Description et plan se complètent ensuite depuis la fiche.
- **Plan encarté** : réservé au thème « Aéromodélisme ». La case n'apparaît que pour ce
  thème, et la base refuse un plan sur une autre revue.

## Thèmes et habillage

- Le thème d'un numéro est un texte libre (`magazines.category`). Les thèmes proposés à la
  saisie et leur ordre d'affichage sont dans `src/lib/categories.ts`.
- Tout l'habillage est dans `src/index.css` (aucune image : bois, laiton et cuir sont des
  dégradés) ; les couleurs sont déclarées en haut du fichier et reprises dans
  `tailwind.config.js`.
- Les polices (Playfair Display, EB Garamond) sont embarquées dans le site par les paquets
  `@fontsource` : aucun appel à un service extérieur.

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

Le schéma tient dans `supabase/migrations/` : `…_schema_bibliotheque.sql` (tables `magazines`
et `admins`, fonction `is_admin()`, règles d'accès, stockage `magazines`), puis `…_themes.sql`
(thème de chaque numéro, plan encarté réservé à l'aéromodélisme), puis `…_numeros_doubles.sql`.
`2_deployer_site.sh` applique lui-même les nouvelles migrations, une seule fois chacune
(suivi dans la table `deploiement.migrations`). Les 36 migrations de l'ancienne boutique sont archivées dans
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
