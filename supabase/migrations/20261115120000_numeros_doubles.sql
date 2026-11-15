/*
  Numéros doubles (v2.3.0)

  Les revues sont mensuelles : la date de parution ne retient que le mois et l'année
  (publication_date vaut le 1er du mois). Certains numéros couvrent deux mois
  (juillet-août) : double_issue indique que le numéro couvre aussi le mois suivant.

  Migration rejouable sans effet (IF NOT EXISTS).
*/

ALTER TABLE public.magazines
  ADD COLUMN IF NOT EXISTS double_issue boolean NOT NULL DEFAULT false;

-- L'API (PostgREST) relit le schéma pour voir la nouvelle colonne
NOTIFY pgrst, 'reload schema';
