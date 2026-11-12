/*
  # Création des profils pour les utilisateurs existants

  1. Modifications
    - Ajouter des profils pour tous les utilisateurs existants qui n'en ont pas encore
*/

-- Create profiles for existing users who don't have one
INSERT INTO profiles (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM profiles)
ON CONFLICT (user_id) DO NOTHING;
