/*
  # Initial Schema Setup for Aeromodel Magazine Collection

  1. New Tables
    - magazines
      - id (uuid, primary key)
      - title (text)
      - issue_number (text)
      - publication_date (date)
      - price (decimal)
      - description (text)
      - cover_image_url (text)
      - keywords (text[])
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - orders
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - status (text)
      - total_amount (decimal)
      - shipping_address (jsonb)
      - created_at (timestamp)
    
    - order_items
      - id (uuid, primary key)
      - order_id (uuid, foreign key)
      - magazine_id (uuid, foreign key)
      - quantity (integer)
      - price_at_time (decimal)
    
    - cart_items
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - magazine_id (uuid, foreign key)
      - quantity (integer)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Magazines table
CREATE TABLE magazines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  issue_number text NOT NULL,
  publication_date date,
  price decimal(10,2),
  description text,
  cover_image_url text,
  keywords text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(title, issue_number)
);

-- Orders table
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders ON DELETE CASCADE,
  magazine_id uuid REFERENCES magazines ON DELETE RESTRICT,
  quantity integer NOT NULL CHECK (quantity > 0),
  price_at_time decimal(10,2) NOT NULL
);

-- Cart items table
CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  magazine_id uuid REFERENCES magazines ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

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

-- Cart items policies
CREATE POLICY "Users can manage their own cart"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
