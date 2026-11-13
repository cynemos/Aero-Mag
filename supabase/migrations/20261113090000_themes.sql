/*
  Thèmes de la bibliothèque (v2.1.0)

  La bibliothèque ne contient plus seulement des revues d'aéromodélisme : chaque numéro
  reçoit un thème (Aéromodélisme, Porsche, Enduro, Trial…). Le thème est un texte libre,
  le site propose ceux déjà utilisés.

  Le plan encarté n'existe que dans les revues d'aéromodélisme : une contrainte l'impose.
*/

ALTER TABLE public.magazines
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Aéromodélisme';

ALTER TABLE public.magazines
  DROP CONSTRAINT IF EXISTS magazines_category_non_vide,
  ADD CONSTRAINT magazines_category_non_vide CHECK (btrim(category) <> '');

ALTER TABLE public.magazines
  DROP CONSTRAINT IF EXISTS magazines_plan_aeromodelisme,
  ADD CONSTRAINT magazines_plan_aeromodelisme CHECK (NOT has_plan OR category = 'Aéromodélisme');

CREATE INDEX IF NOT EXISTS magazines_category_idx ON public.magazines (category);
