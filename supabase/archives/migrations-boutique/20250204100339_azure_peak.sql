/*
  # Correction de la relation entre orders et profiles

  1. Modifications
    - Ajout d'une contrainte de clé étrangère entre orders.user_id et profiles.user_id
    - Mise à jour des politiques RLS pour prendre en compte la nouvelle relation

  2. Sécurité
    - Maintien des politiques RLS existantes
    - Ajout de politiques pour la nouvelle relation
*/

-- Ajout de la contrainte de clé étrangère
ALTER TABLE orders
ADD CONSTRAINT fk_orders_profiles
FOREIGN KEY (user_id)
REFERENCES profiles(user_id)
ON DELETE CASCADE;

-- Mise à jour des politiques RLS pour les commandes
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;

CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  auth.jwt() ->> 'email' = 'cynemos@gmail.com'
);

CREATE POLICY "Users can create their own orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Mise à jour des politiques RLS pour les éléments de commande
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;

CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND (orders.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'cynemos@gmail.com')
  )
);
