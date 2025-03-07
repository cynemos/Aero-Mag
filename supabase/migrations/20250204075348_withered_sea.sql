/*
  # Update Security Policies

  1. Changes
    - Add new RLS policy for order items creation
    - Update cart items policy to be more specific
    - Ensure proper security for all tables

  2. Security
    - Enable RLS on all tables if not already enabled
    - Add policies for authenticated users
    - Add specific policies for order items
*/

-- Ensure RLS is enabled on all tables
DO $$ 
BEGIN
  EXECUTE format('ALTER TABLE IF EXISTS magazines ENABLE ROW LEVEL SECURITY');
  EXECUTE format('ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY');
  EXECUTE format('ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY');
  EXECUTE format('ALTER TABLE IF EXISTS cart_items ENABLE ROW LEVEL SECURITY');
END $$;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
  -- Magazines policies
  EXECUTE format('DROP POLICY IF EXISTS "Anyone can view magazines" ON magazines');
  EXECUTE format('DROP POLICY IF EXISTS "Only admins can modify magazines" ON magazines');
  
  -- Orders policies
  EXECUTE format('DROP POLICY IF EXISTS "Users can view their own orders" ON orders');
  EXECUTE format('DROP POLICY IF EXISTS "Users can create their own orders" ON orders');
  
  -- Order items policies
  EXECUTE format('DROP POLICY IF EXISTS "Users can view their own order items" ON order_items');
  EXECUTE format('DROP POLICY IF EXISTS "Users can create order items" ON order_items');
  
  -- Cart items policies
  EXECUTE format('DROP POLICY IF EXISTS "Users can manage their own cart" ON cart_items');
END $$;

-- Recreate policies

-- Magazines policies
CREATE POLICY "Anyone can view magazines"
  ON magazines FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Only admins can modify magazines"
  ON magazines FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Orders policies
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Order items policies
CREATE POLICY "Users can view their own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Cart items policies
CREATE POLICY "Users can manage their own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
