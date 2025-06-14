/*
  # Fix Admin Dashboard Policies

  1. Security Updates
    - Add proper admin role checks for all tables
    - Ensure admin users can perform CRUD operations
    - Fix RLS policies for admin access

  2. Admin Role Setup
    - Admin users should have role 'admin' in their JWT claims
    - All admin operations require authentication and admin role
*/

-- Update products policies for admin access
DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Update price_slabs policies for admin access
DROP POLICY IF EXISTS "Admins can manage price slabs" ON price_slabs;
CREATE POLICY "Admins can manage price slabs"
  ON price_slabs
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Update banners policies for admin access
DROP POLICY IF EXISTS "Admins can manage banners" ON banners;
CREATE POLICY "Admins can manage banners"
  ON banners
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Update orders policies for admin access
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Update order_items policies for admin access
DROP POLICY IF EXISTS "Admin can manage order_items" ON order_items;
CREATE POLICY "Admin can manage order_items"
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Update coupons policies for admin access
DROP POLICY IF EXISTS "Admin can manage coupons" ON coupons;
CREATE POLICY "Admin can manage coupons"
  ON coupons
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Update announcements policies for admin access
DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Update categories policies for admin access
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  )
  WITH CHECK (
    (current_setting('request.jwt.claims', true)::json ->> 'role') = 'admin'
    OR
    (current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Create a function to set admin role for testing
CREATE OR REPLACE FUNCTION set_admin_role(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE auth.users 
  SET raw_app_meta_data = 
    COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('role', 'admin')
  WHERE email = user_email;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION set_admin_role(text) TO authenticated;