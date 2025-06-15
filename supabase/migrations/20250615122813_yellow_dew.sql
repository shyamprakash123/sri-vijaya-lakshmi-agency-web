/*
  # Add Coupon Usage Tracking

  1. New Tables
    - `coupon_usage` - Track individual coupon uses
    
  2. Schema Changes
    - Add usage limits to coupons table
    - Add coupon tracking to orders table
    
  3. Security
    - Enable RLS on coupon_usage table
    - Add policies for coupon usage tracking
*/

-- Add usage tracking fields to coupons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'max_uses'
  ) THEN
    ALTER TABLE coupons ADD COLUMN max_uses integer DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'max_uses_per_user'
  ) THEN
    ALTER TABLE coupons ADD COLUMN max_uses_per_user integer DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'current_uses'
  ) THEN
    ALTER TABLE coupons ADD COLUMN current_uses integer DEFAULT 0;
  END IF;
END $$;

-- Add coupon tracking fields to orders table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_code text DEFAULT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_discount'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_discount numeric(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'subtotal_amount'
  ) THEN
    ALTER TABLE orders ADD COLUMN subtotal_amount numeric(10,2) DEFAULT NULL;
  END IF;
END $$;

-- Create coupon_usage table if it doesn't exist
CREATE TABLE IF NOT EXISTS coupon_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE,
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  user_id uuid DEFAULT NULL,
  discount_amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on coupon_usage table
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for coupon_usage
CREATE POLICY "Users can view their own coupon usage"
  ON coupon_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert coupon usage"
  ON coupon_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can manage coupon usage"
  ON coupon_usage
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_order_id ON coupon_usage(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);

-- Create function to update coupon usage count
CREATE OR REPLACE FUNCTION update_coupon_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment current_uses when a new usage is recorded
  IF TG_OP = 'INSERT' THEN
    UPDATE coupons 
    SET current_uses = current_uses + 1 
    WHERE id = NEW.coupon_id;
    RETURN NEW;
  END IF;
  
  -- Decrement current_uses when usage is deleted
  IF TG_OP = 'DELETE' THEN
    UPDATE coupons 
    SET current_uses = GREATEST(current_uses - 1, 0) 
    WHERE id = OLD.coupon_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update coupon usage count
DROP TRIGGER IF EXISTS trigger_update_coupon_usage_count ON coupon_usage;
CREATE TRIGGER trigger_update_coupon_usage_count
  AFTER INSERT OR DELETE ON coupon_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_coupon_usage_count();

-- Create function to check coupon usage limits
CREATE OR REPLACE FUNCTION check_coupon_usage_limits(
  p_coupon_id uuid,
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_coupon coupons%ROWTYPE;
  v_user_usage_count integer := 0;
  v_result jsonb;
BEGIN
  -- Get coupon details
  SELECT * INTO v_coupon FROM coupons WHERE id = p_coupon_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Coupon not found'
    );
  END IF;
  
  -- Check if coupon is active and not expired
  IF NOT v_coupon.is_active OR v_coupon.valid_until < NOW() THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Coupon is expired or inactive'
    );
  END IF;
  
  -- Check max uses limit
  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Coupon usage limit exceeded'
    );
  END IF;
  
  -- Check max uses per user limit
  IF v_coupon.max_uses_per_user IS NOT NULL AND p_user_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_user_usage_count
    FROM coupon_usage
    WHERE coupon_id = p_coupon_id AND user_id = p_user_id;
    
    IF v_user_usage_count >= v_coupon.max_uses_per_user THEN
      RETURN jsonb_build_object(
        'valid', false,
        'message', 'You have reached the maximum uses for this coupon'
      );
    END IF;
  END IF;
  
  -- All checks passed
  RETURN jsonb_build_object(
    'valid', true,
    'message', 'Coupon is valid',
    'coupon', row_to_json(v_coupon),
    'user_usage_count', v_user_usage_count
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_coupon_usage_limits(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_coupon_usage_limits(uuid) TO anon;