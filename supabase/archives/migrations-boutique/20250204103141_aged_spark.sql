/*
  # Fix orders-profiles relationship

  1. Changes
    - Drop existing foreign key constraints to clean up
    - Re-create foreign key relationship between orders and profiles
    - Update RLS policies for better access control

  2. Security
    - Maintain RLS policies for orders and order_items
    - Ensure proper access control for admin and regular users
*/

-- Drop existing constraints if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'orders_user_id_fkey'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'fk_orders_profiles'
  ) THEN
    ALTER TABLE orders DROP CONSTRAINT fk_orders_profiles;
  END IF;
END $$;

-- Re-create the foreign key relationship
ALTER TABLE orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Update RLS policies for better access control
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;

-- Orders policies
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

-- Order items policies
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
