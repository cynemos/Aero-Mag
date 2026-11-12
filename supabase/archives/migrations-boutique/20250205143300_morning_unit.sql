-- Fonction pour mettre à jour le stock des magazines
CREATE OR REPLACE FUNCTION update_magazine_stock_on_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la commande est annulée
  IF NEW.status = 'cancelled' THEN
    -- Mettre à jour le statut des magazines de cette commande
    UPDATE magazines m
    SET stock_status = 'available'
    WHERE m.id IN (
      SELECT magazine_id 
      FROM order_items 
      WHERE order_id = NEW.id
    )
    AND NOT EXISTS (
      -- Vérifier qu'il n'y a pas d'autres commandes actives pour ce magazine
      SELECT 1 
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      WHERE oi.magazine_id = m.id
      AND o.id != NEW.id
      AND o.status NOT IN ('cancelled')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS update_stock_on_order_status_change ON orders;
CREATE TRIGGER update_stock_on_order_status_change
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled')
  EXECUTE FUNCTION update_magazine_stock_on_order_status_change();

-- Mettre à jour le stock pour toutes les commandes annulées existantes
DO $$ 
DECLARE 
  cancelled_order RECORD;
BEGIN
  FOR cancelled_order IN 
    SELECT DISTINCT o.id 
    FROM orders o
    WHERE o.status = 'cancelled'
  LOOP
    UPDATE magazines m
    SET stock_status = 'available'
    WHERE m.id IN (
      SELECT magazine_id 
      FROM order_items 
      WHERE order_id = cancelled_order.id
    )
    AND NOT EXISTS (
      SELECT 1 
      FROM orders o2
      JOIN order_items oi2 ON o2.id = oi2.order_id
      WHERE oi2.magazine_id = m.id
      AND o2.id != cancelled_order.id
      AND o2.status NOT IN ('cancelled')
    );
  END LOOP;
END $$;
