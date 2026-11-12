/*
  # Fonction de suppression de compte utilisateur

  1. Nouvelle Fonction
    - `delete_user()`: Fonction sécurisée pour supprimer un compte utilisateur
      - Supprime toutes les données associées à l'utilisateur
      - Vérifie que l'utilisateur ne supprime que son propre compte
      - Retourne un statut de succès

  2. Sécurité
    - Fonction exécutée avec les privilèges de l'appelant (SECURITY INVOKER)
    - Vérifie l'authentification de l'utilisateur
    - Empêche la suppression du compte admin
*/

CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
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

  -- Supprimer l'utilisateur de auth.users (la suppression en cascade s'occupera du reste)
  DELETE FROM auth.users
  WHERE id = v_user_id;
END;
$$;
