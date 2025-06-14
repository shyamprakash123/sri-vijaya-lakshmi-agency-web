/*
  # Admin Features Migration

  1. New Tables
    - `announcements` table for admin announcements
    - Enhanced RLS policies for admin access

  2. Security
    - Admin role-based access control
    - Enhanced RLS policies for all tables

  3. Functions
    - Update timestamp trigger function
*/

-- Create announcements table if not exists
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'promotion')),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Create policies for announcements
CREATE POLICY "Active announcements are viewable by everyone"
  ON announcements
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_announcements_active_priority 
  ON announcements (is_active, priority DESC);

-- Create or replace the update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ensure other tables have the trigger
DO $$
BEGIN
  -- Check if trigger exists for products
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_products_updated_at'
  ) THEN
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Check if trigger exists for orders
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_orders_updated_at'
  ) THEN
    CREATE TRIGGER update_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert sample announcements
INSERT INTO announcements (message, type, priority) VALUES
  ('🎉 New Year Special: Get 20% off on all Basmati rice varieties!', 'promotion', 10),
  ('📦 Free delivery on orders above ₹1000. Order now!', 'success', 8),
  ('⚡ Lightning fast delivery within 1 hour via Porter', 'info', 5)
ON CONFLICT DO NOTHING;

-- Add admin policies for products
CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Add admin policies for orders
CREATE POLICY "Admins can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);

-- Add admin policies for banners
CREATE POLICY "Admins can manage banners"
  ON banners
  FOR ALL
  TO authenticated
  USING ((jwt() ->> 'role'::text) = 'admin'::text);