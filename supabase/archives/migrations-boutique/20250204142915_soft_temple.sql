/*
  # Création de la vue et de la fonction pour les détails des commandes

  1. Modifications
    - Suppression des objets existants pour éviter les conflits
    - Création d'une vue pour joindre les commandes et les profils
    - Création d'une fonction sécurisée pour récupérer les détails d'une commande
    - Attribution des permissions appropriées

  2. Sécurité
    - Utilisation de SECURITY DEFINER pour la fonction
    - Contrôle d'accès basé sur l'utilisateur
    - Schéma public explicite
*/

-- Supprimer les objets existants s'ils existent
DROP FUNCTION IF EXISTS public.get_order_details(uuid);
DROP VIEW IF EXISTS public.order_details;

-- Créer la vue pour joindre les commandes et les profils
CREATE VIEW public.order_details AS
SELECT 
  o.id,
  o.user_id,
  o.status,
  o.total_amount,
  o.shipping_address,
  o.created_at,
  p.first_name,
  p.last_name,
  p.email
FROM public.orders o
JOIN public.profiles p ON p.user_id = o.user_id;

-- Créer une fonction sécurisée pour récupérer les détails d'une commande
CREATE FUNCTION public.get_order_details(p_order_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  status text,
  total_amount numeric,
  shipping_address jsonb,
  created_at timestamptz,
  first_name text,
  last_name text,
  email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT d.*
  FROM public.order_details d
  WHERE d.id = p_order_id
  AND (
    d.user_id = auth.uid() OR
    EXISTS (
      SELECT 1
      FROM auth.users
      WHERE id = auth.uid()
      AND email = 'cynemos@gmail.com'
    )
  );
END;
$$;

-- Accorder les permissions nécessaires
GRANT SELECT ON public.order_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_details(uuid) TO authenticated;
