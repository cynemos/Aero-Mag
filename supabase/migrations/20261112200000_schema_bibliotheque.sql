/*
  Schéma de la bibliothèque AéroMag (v2.0.0)

  Remplace les 36 migrations de l'ancienne boutique (archivées dans supabase/archives/).
  À appliquer sur une base neuve.

  - magazines : un numéro de revue par ligne, lisible par tous
  - admins    : comptes autorisés à modifier la bibliothèque
  - is_admin(): utilisée par les règles d'accès et par le site
  - stockage « magazines » : couvertures, lisibles par tous, modifiables par les admins

  Déclarer un administrateur (après avoir créé son compte dans Supabase) :
    INSERT INTO public.admins (user_id)
    SELECT id FROM auth.users WHERE email = 'adresse-admin@exemple.fr';
*/

-- ---------------------------------------------------------------------------
-- Administrateurs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
-- Aucune règle : la table n'est lisible ni modifiable par l'API, seulement par is_admin()
-- et par l'éditeur SQL.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admins WHERE user_id = (SELECT auth.uid()));
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Revues
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.magazines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issue_number text NOT NULL,
  publication_date date,
  description text,
  cover_image_url text,
  keywords text[],
  has_plan boolean NOT NULL DEFAULT false,
  plan_model_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (title, issue_number)
);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS magazines_set_updated_at ON public.magazines;
CREATE TRIGGER magazines_set_updated_at
  BEFORE UPDATE ON public.magazines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.magazines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "magazines_lecture_publique" ON public.magazines;
CREATE POLICY "magazines_lecture_publique" ON public.magazines
  FOR SELECT TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "magazines_ajout_admin" ON public.magazines;
CREATE POLICY "magazines_ajout_admin" ON public.magazines
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "magazines_modification_admin" ON public.magazines;
CREATE POLICY "magazines_modification_admin" ON public.magazines
  FOR UPDATE TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "magazines_suppression_admin" ON public.magazines;
CREATE POLICY "magazines_suppression_admin" ON public.magazines
  FOR DELETE TO authenticated
  USING ((SELECT public.is_admin()));

GRANT SELECT ON public.magazines TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.magazines TO authenticated;

-- ---------------------------------------------------------------------------
-- Couvertures (stockage)
-- ---------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('magazines', 'magazines', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Le dossier est public : les images se lisent par leur adresse, sans règle de lecture
-- (une règle SELECT permettrait en plus de lister tout le contenu du dossier).
DROP POLICY IF EXISTS "couvertures_ajout_admin" ON storage.objects;
CREATE POLICY "couvertures_ajout_admin" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'magazines' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "couvertures_lecture_admin" ON storage.objects;
CREATE POLICY "couvertures_lecture_admin" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'magazines' AND (SELECT public.is_admin()));

DROP POLICY IF EXISTS "couvertures_suppression_admin" ON storage.objects;
CREATE POLICY "couvertures_suppression_admin" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'magazines' AND (SELECT public.is_admin()));
