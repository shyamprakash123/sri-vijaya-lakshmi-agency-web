/*
  # Create categories table and update product details

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text, optional)
      - `image` (text, optional)
      - `is_active` (boolean, default true)
      - `sort_order` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Table Updates
    - Add `transportation_required` (boolean, default false) to orders table
    - Add `transportation_amount` (numeric, default 0) to orders table

  3. Security
    - Enable RLS on `categories` table
    - Add policies for public read access and admin management
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (((jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Add transportation fields to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'transportation_required'
  ) THEN
    ALTER TABLE orders ADD COLUMN transportation_required boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'transportation_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN transportation_amount numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_active_sort ON categories (is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);

-- Insert default categories
INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Basmati Rice', 'basmati', 'Premium long-grain basmati rice varieties', 1),
  ('Regular Rice', 'regular', 'Everyday rice varieties for daily consumption', 2),
  ('Premium Rice', 'premium', 'High-quality premium rice selections', 3),
  ('Organic Rice', 'organic', 'Certified organic rice varieties', 4)
ON CONFLICT (slug) DO NOTHING;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();