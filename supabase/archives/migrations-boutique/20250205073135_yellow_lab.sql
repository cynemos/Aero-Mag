/*
  # Ajout de la gestion des stocks

  1. Modifications de tables
    - Ajout de la colonne `stock_status` à la table `magazines`
    - Ajout de contraintes et valeurs par défaut

  2. Fonctions
    - Création d'un trigger pour mettre à jour le stock lors d'une commande
    - Création d'un trigger pour vérifier le stock avant l'ajout au panier
*/

-- Ajout de l'énumération pour le statut du stock
CREATE TYPE stock_status AS ENUM ('available', 'out_of_stock');

-- Ajout de la colonne stock_status à la table magazines
ALTER TABLE magazines
ADD COLUMN stock_status stock_status NOT NULL DEFAULT 'available';

-- Fonction pour mettre à jour le stock lors d'une commande
CREATE OR REPLACE FUNCTION update_magazine_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Mettre à jour le statut du stock en fonction des commandes
  UPDATE magazines
  SET stock_status = 
    CASE 
      WHEN EXISTS (
        SELECT 1 
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        WHERE oi.magazine_id = NEW.magazine_id
        AND o.status NOT IN ('cancelled')
        GROUP BY oi.magazine_id
        HAVING COUNT(*) > 0
      ) THEN 'out_of_stock'::stock_status
      ELSE 'available'::stock_status
    END
  WHERE id = NEW.magazine_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le stock après une commande
CREATE TRIGGER after_order_update_stock
AFTER INSERT OR UPDATE ON order_items
FOR EACH ROW
EXECUTE FUNCTION update_magazine_stock();

-- Fonction pour vérifier le stock avant l'ajout au panier
CREATE OR REPLACE FUNCTION check_magazine_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM magazines 
    WHERE id = NEW.magazine_id 
    AND stock_status = 'out_of_stock'
  ) THEN
    RAISE EXCEPTION 'Ce magazine est épuisé';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour vérifier le stock avant l'ajout au panier
CREATE TRIGGER before_cart_insert_check_stock
BEFORE INSERT ON cart_items
FOR EACH ROW
EXECUTE FUNCTION check_magazine_stock();
