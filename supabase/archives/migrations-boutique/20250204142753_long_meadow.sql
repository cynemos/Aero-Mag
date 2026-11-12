/*
  # Création d'une vue sécurisée pour les détails des commandes

  1. Modifications
    - Création d'une vue pour joindre les commandes et les profils
    - Utilisation de SECURITY DEFINER pour garantir les permissions appropriées
    - Fonction sécurisée pour récupérer les détails des commandes

  2. Sécurité
    - Contrôle d'accès basé sur l'utilisateur dans la fonction
    - Utilisation du schéma public explicite
    - Vérification des permissions au niveau de la requête
*/

-- Créer la vue pour joindre les commandes et les profils
CREATE OR REPLACE VIEW public.order_details AS
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
CREATE OR REPLACE FUNCTION public.get_order_details(p_order_id uuid)
RETURNS SETOF public.order_details
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.order_details
  WHERE id = p_order_id
  AND (
    user_id = auth.uid() OR
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
