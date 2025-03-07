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
RETURNS SETOF public.order_details
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Accorder les permissions nécessaires
GRANT SELECT ON public.order_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_details(uuid) TO authenticated;

-- Créer une vue pour la liste des utilisateurs
CREATE OR REPLACE VIEW public.user_list AS
SELECT 
  p.user_id,
  p.email,
  p.first_name,
  p.last_name,
  p.created_at,
  CASE 
    WHEN p.email = 'cynemos@gmail.com' THEN 'admin'::text
    ELSE 'user'::text
  END as role
FROM public.profiles p;

-- Accorder les permissions nécessaires pour la vue user_list
GRANT SELECT ON public.user_list TO authenticated;
