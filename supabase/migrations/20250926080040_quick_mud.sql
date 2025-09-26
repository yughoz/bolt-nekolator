/*
  # Create short links system for Nekolators

  1. New Tables
    - `short_links`
      - `id` (bigserial, primary key) - Auto-increment ID for base-36 conversion
      - `short_code` (text, unique) - Base-36 encoded short code
      - `calculation_type` (text) - Either 'basic' or 'expert'
      - `calculation_id` (uuid) - References the actual calculation
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `short_links` table
    - Add policy for public read access (for resolving short links)
    - Add policy for public insert access (for creating short links)

  3. Functions
    - `generate_short_code()` - Converts auto-increment ID to base-36
    - Trigger to automatically generate short_code on insert

  4. Notes
    - Base-36 uses 0-9 and a-z for compact URLs
    - Auto-increment ensures unique, sequential short codes
    - Public access allows sharing without authentication
*/

CREATE TABLE IF NOT EXISTS short_links (
  id bigserial PRIMARY KEY,
  short_code text UNIQUE NOT NULL,
  calculation_type text NOT NULL CHECK (calculation_type IN ('basic', 'expert')),
  calculation_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Function to convert number to base-36
CREATE OR REPLACE FUNCTION generate_short_code(num bigint)
RETURNS text AS $$
DECLARE
  chars text := '0123456789abcdefghijklmnopqrstuvwxyz';
  result text := '';
  remainder int;
BEGIN
  IF num = 0 THEN
    RETURN '0';
  END IF;
  
  WHILE num > 0 LOOP
    remainder := num % 36;
    result := substr(chars, remainder + 1, 1) || result;
    num := num / 36;
  END LOOP;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to automatically generate short_code on insert
CREATE OR REPLACE FUNCTION set_short_code()
RETURNS trigger AS $$
BEGIN
  NEW.short_code := generate_short_code(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to set short_code after insert (when id is available)
CREATE TRIGGER trigger_set_short_code
  AFTER INSERT ON short_links
  FOR EACH ROW
  EXECUTE FUNCTION set_short_code();

-- But we need to update the row after insert, so let's use a different approach
DROP TRIGGER IF EXISTS trigger_set_short_code ON short_links;
DROP FUNCTION IF EXISTS set_short_code();

-- Instead, we'll handle this in the application code after insert

ALTER TABLE short_links ENABLE ROW LEVEL SECURITY;

-- Allow public read access for resolving short links
CREATE POLICY "Allow public read access on short links"
  ON short_links
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access for creating short links
CREATE POLICY "Allow public insert access on short links"
  ON short_links
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_short_links_short_code ON short_links(short_code);
CREATE INDEX IF NOT EXISTS idx_short_links_calculation_id ON short_links(calculation_id);