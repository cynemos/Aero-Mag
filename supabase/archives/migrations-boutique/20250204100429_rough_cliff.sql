/*
  # Mise à jour des politiques RLS pour les commandes

  1. Modifications
    - Mise à jour des politiques RLS pour les commandes et les éléments de commande
    - Ajout de l'accès administrateur aux commandes

  2. Sécurité
    - Les utilisateurs peuvent voir uniquement leurs propres commandes
    - L'administrateur (cynemos@gmail.com) peut voir toutes les commandes
    - Les utilisateurs peuvent créer uniquement leurs propres commandes
*/

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
