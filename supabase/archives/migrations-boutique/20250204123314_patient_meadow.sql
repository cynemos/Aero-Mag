/*
  # Mise à jour de la fonction de suppression de compte utilisateur

  1. Modifications
    - Changement de SECURITY INVOKER à SECURITY DEFINER
    - Ajout de SET search_path pour la sécurité
    - Amélioration de la gestion des erreurs

  2. Sécurité
    - Exécution avec les privilèges du propriétaire
    - Protection contre les attaques d'injection SQL
    - Vérification de l'authentification
    - Protection du compte admin
*/

-- Supprimer l'ancienne version de la fonction
DROP FUNCTION IF EXISTS public.delete_user();

-- Créer la nouvelle version avec les privilèges appropriés
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_user_email text;
BEGIN
  -- Récupérer l'ID et l'email de l'utilisateur authentifié
  v_user_id := auth.uid();
  v_user_email := auth.jwt() ->> 'email';

  -- Vérifier que l'utilisateur est authentifié
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;

  -- Empêcher la suppression du compte admin
  IF v_user_email = 'cynemos@gmail.com' THEN
    RAISE EXCEPTION 'Le compte administrateur ne peut pas être supprimé';
  END IF;

  -- Supprimer l'utilisateur de auth.users
  -- La suppression en cascade s'occupera des données associées
  DELETE FROM auth.users
  WHERE id = v_user_id;
END;
$$;

-- Accorder les privilèges d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.delete_user() TO authenticated;
