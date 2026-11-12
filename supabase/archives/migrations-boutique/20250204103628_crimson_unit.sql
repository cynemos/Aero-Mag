/*
  # Ajout de la politique de mise à jour des commandes

  1. Modifications
    - Ajout d'une politique permettant à l'administrateur de mettre à jour le statut des commandes
    
  2. Sécurité
    - Seul l'administrateur (cynemos@gmail.com) peut mettre à jour le statut des commandes
*/

-- Ajout de la politique pour la mise à jour des commandes
CREATE POLICY "Admin can update order status"
ON orders FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'email' = 'cynemos@gmail.com')
WITH CHECK (auth.jwt() ->> 'email' = 'cynemos@gmail.com');
