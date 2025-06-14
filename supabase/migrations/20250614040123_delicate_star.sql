/*
  # Initial Database Schema for Sri Vijaya Lakshmi Agency

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `image` (text)
      - `base_price` (decimal)
      - `available_quantity` (integer)
      - `weight` (text)
      - `category` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `price_slabs`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `min_quantity` (integer)
      - `max_quantity` (integer, nullable)
      - `price_per_bag` (decimal)
      - `label` (text)
    
    - `banners`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text, nullable)
      - `image` (text)
      - `link` (text, nullable)
      - `is_active` (boolean)
      - `order_index` (integer)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `total_amount` (decimal)
      - `gst_number` (text, nullable)
      - `delivery_address` (jsonb)
      - `order_type` (text)
      - `payment_status` (text)
      - `order_status` (text)
      - `payment_hash` (text)
      - `upi_link` (text)
      - `scheduled_delivery` (timestamp, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (uuid, foreign key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price_per_bag` (decimal)
      - `slab_label` (text)
    
    - `coupons`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `discount_type` (text)
      - `discount_value` (decimal)
      - `min_order_amount` (decimal)
      - `max_discount` (decimal, nullable)
      - `is_active` (boolean)
      - `valid_until` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access on products, banners
    - Add policies for authenticated users on orders
    - Add policies for admin access
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  base_price decimal(10,2) NOT NULL,
  available_quantity integer NOT NULL DEFAULT 0,
  weight text NOT NULL,
  category text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Price slabs table
CREATE TABLE IF NOT EXISTS price_slabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  min_quantity integer NOT NULL,
  max_quantity integer,
  price_per_bag decimal(10,2) NOT NULL,
  label text NOT NULL
);

-- Banners table
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image text NOT NULL,
  link text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  total_amount decimal(10,2) NOT NULL,
  gst_number text,
  delivery_address jsonb NOT NULL,
  order_type text NOT NULL CHECK (order_type IN ('instant', 'preorder')),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
  order_status text NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'prepaid', 'fully_paid', 'dispatched', 'delivered')),
  payment_hash text NOT NULL,
  upi_link text NOT NULL,
  scheduled_delivery timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id),
  quantity integer NOT NULL,
  price_per_bag decimal(10,2) NOT NULL,
  slab_label text NOT NULL
);

-- Coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value decimal(10,2) NOT NULL,
  min_order_amount decimal(10,2) NOT NULL DEFAULT 0,
  max_discount decimal(10,2),
  is_active boolean DEFAULT true,
  valid_until timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Public read policies for products and banners
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Price slabs are viewable by everyone"
  ON price_slabs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Active banners are viewable by everyone"
  ON banners FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Active coupons are viewable by everyone"
  ON coupons FOR SELECT
  TO public
  USING (is_active = true);

-- Order policies
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create order items"
  ON order_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view order items"
  ON order_items FOR SELECT
  TO public
  USING (true);

-- Admin policies (for authenticated users with admin role)
CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage orders"
  ON orders FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_price_slabs_product_id ON price_slabs(product_id);
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();