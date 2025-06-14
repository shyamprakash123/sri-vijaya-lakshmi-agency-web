/*
  # Create announcements table

  1. New Tables
    - `announcements`
      - `id` (uuid, primary key)
      - `message` (text, required)
      - `type` (text, required) - info, warning, success, promotion
      - `is_active` (boolean, default true)
      - `priority` (integer, default 0) - higher numbers show first
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `announcements` table
    - Add policy for public to read active announcements
    - Add policy for admins to manage announcements
*/

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('info', 'warning', 'success', 'promotion')),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_announcements_active_priority 
  ON announcements (is_active, priority DESC);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample announcements
INSERT INTO announcements (message, type, priority) VALUES
  ('🎉 New Year Special: Get 20% off on all Basmati rice varieties!', 'promotion', 10),
  ('📦 Free delivery on orders above ₹1000. Order now!', 'success', 8),
  ('⚡ Lightning fast delivery within 1 hour via Porter', 'info', 5);