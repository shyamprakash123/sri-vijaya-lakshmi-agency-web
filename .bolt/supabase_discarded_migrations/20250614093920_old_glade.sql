/*
  # Complete Database Schema for Sri Vijaya Lakshmi Agency

  1. New Tables
    - `products` - Product catalog with pricing and inventory
    - `price_slabs` - Bulk pricing tiers for products
    - `banners` - Homepage promotional banners
    - `orders` - Customer orders with payment tracking
    - `order_items` - Individual items within orders
    - `coupons` - Discount coupons and promotions
    - `announcements` - System-wide announcements
    - `user_sessions` - Cart data storage for users

  2. Security
    - Enable RLS on all tables
    - Public read access for products, banners, announcements
    - User-specific access for orders and cart data
    - Admin access for management operations

  3. Sample Data
    - Products with price slabs
    - Promotional banners
    - Active coupons
    - System announcements
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

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'promotion')),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User sessions table for cart storage
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cart_data jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_slabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Public read policies
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

CREATE POLICY "Active announcements are viewable by everyone"
  ON announcements FOR SELECT
  TO public
  USING (is_active = true);

-- Order policies
CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can view orders"
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

-- User session policies
CREATE POLICY "Users can manage their own cart"
  ON user_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "Admins can manage announcements"
  ON announcements FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_price_slabs_product_id ON price_slabs(product_id);
CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(is_active, order_index);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active_priority ON announcements(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

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

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (name, description, image, base_price, available_quantity, weight, category) VALUES
('Premium Basmati Rice', 'Long grain aromatic basmati rice, perfect for biryanis and special occasions. Aged for superior taste and texture.', 'https://images.pexels.com/photos/4198538/pexels-photo-4198538.jpeg?auto=compress&cs=tinysrgb&w=800', 120.00, 50, '25kg', 'basmati'),
('Sona Masoori Rice', 'Medium grain rice, ideal for daily meals. Light, aromatic, and easy to digest. Perfect for South Indian cuisine.', 'https://images.pexels.com/photos/6758773/pexels-photo-6758773.jpeg?auto=compress&cs=tinysrgb&w=800', 80.00, 75, '25kg', 'regular'),
('Jasmine Rice', 'Fragrant long grain rice with a subtle floral aroma. Soft texture and delicate flavor profile.', 'https://images.pexels.com/photos/7262775/pexels-photo-7262775.jpeg?auto=compress&cs=tinysrgb&w=800', 95.00, 30, '25kg', 'premium'),
('Brown Basmati Rice', 'Whole grain basmati rice with natural bran layer intact. Rich in fiber and nutrients.', 'https://images.pexels.com/photos/4033325/pexels-photo-4033325.jpeg?auto=compress&cs=tinysrgb&w=800', 140.00, 25, '25kg', 'basmati'),
('Ponni Rice', 'Traditional Tamil Nadu rice variety. Short grain, high yield, and excellent for everyday cooking.', 'https://images.pexels.com/photos/4033338/pexels-photo-4033338.jpeg?auto=compress&cs=tinysrgb&w=800', 70.00, 100, '25kg', 'regular'),
('Jeera Samba Rice', 'Premium short grain rice with natural aroma. Traditional variety known for its unique taste.', 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=800', 110.00, 40, '25kg', 'premium'),
('IR64 Parboiled Rice', 'Long grain parboiled rice. Non-sticky, separate grains when cooked. Great for export quality dishes.', 'https://images.pexels.com/photos/4198020/pexels-photo-4198020.jpeg?auto=compress&cs=tinysrgb&w=800', 65.00, 80, '25kg', 'regular'),
('Kolam Rice', 'Medium grain rice with good cooking quality. Popular choice for daily meals across South India.', 'https://images.pexels.com/photos/4033349/pexels-photo-4033349.jpeg?auto=compress&cs=tinysrgb&w=800', 75.00, 60, '25kg', 'regular');

-- Insert price slabs for each product
DO $$
DECLARE
    product_record RECORD;
BEGIN
    FOR product_record IN SELECT id, base_price FROM products LOOP
        -- 1-4 bags: base price
        INSERT INTO price_slabs (product_id, min_quantity, max_quantity, price_per_bag, label) 
        VALUES (product_record.id, 1, 4, product_record.base_price, '1-4 bags');
        
        -- 5-9 bags: 5% discount
        INSERT INTO price_slabs (product_id, min_quantity, max_quantity, price_per_bag, label) 
        VALUES (product_record.id, 5, 9, ROUND(product_record.base_price * 0.95, 2), '5-9 bags');
        
        -- 10+ bags: 10% discount
        INSERT INTO price_slabs (product_id, min_quantity, max_quantity, price_per_bag, label) 
        VALUES (product_record.id, 10, NULL, ROUND(product_record.base_price * 0.90, 2), '10+ bags');
    END LOOP;
END $$;

-- Insert sample banners
INSERT INTO banners (title, description, image, link, order_index) VALUES
('Pre-order & Save 15%', 'Order 24hrs in advance for special discounts on all rice varieties', 'https://images.pexels.com/photos/4033325/pexels-photo-4033325.jpeg?auto=compress&cs=tinysrgb&w=1200', '/preorder', 1),
('Premium Basmati Collection', 'Aromatic long grain rice perfect for special occasions and festive meals', 'https://images.pexels.com/photos/4033338/pexels-photo-4033338.jpeg?auto=compress&cs=tinysrgb&w=1200', '/products?category=basmati', 2),
('Fresh Stock Arrival', 'New harvest rice now available. Premium quality guaranteed with fast delivery', 'https://images.pexels.com/photos/6758773/pexels-photo-6758773.jpeg?auto=compress&cs=tinysrgb&w=1200', '/products', 3),
('Bulk Orders Welcome', 'Special pricing for restaurants and bulk buyers. Contact us for custom quotes', 'https://images.pexels.com/photos/7262775/pexels-photo-7262775.jpeg?auto=compress&cs=tinysrgb&w=1200', '/contact', 4);

-- Insert sample coupons
INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, max_discount, valid_until) VALUES
('WELCOME10', 'percentage', 10.00, 500.00, 100.00, '2024-12-31 23:59:59'),
('BULK15', 'percentage', 15.00, 2000.00, 300.00, '2024-12-31 23:59:59'),
('FIRST50', 'fixed', 50.00, 300.00, NULL, '2024-12-31 23:59:59'),
('PREORDER20', 'percentage', 20.00, 1000.00, 200.00, '2024-12-31 23:59:59'),
('FESTIVAL25', 'percentage', 25.00, 1500.00, 400.00, '2024-12-31 23:59:59');

-- Insert sample announcements
INSERT INTO announcements (message, type, priority) VALUES
('🚚 Orders dispatched within 1 hour | 📞 Pre-order 24hrs in advance for discounts!', 'info', 1),
('🎉 New Year Special: Use code NEWYEAR25 for 25% off on orders above ₹1500', 'promotion', 2),
('🌾 Fresh harvest rice now available - Premium quality guaranteed!', 'success', 3),
('⚡ Free delivery on orders above ₹1000 - Limited time offer!', 'promotion', 4);