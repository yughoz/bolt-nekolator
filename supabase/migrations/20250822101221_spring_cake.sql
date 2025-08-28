/*
  # Create calculations table for Nekolators

  1. New Tables
    - `calculations`
      - `id` (uuid, primary key)
      - `discount_value` (text) - The discount input string
      - `discount_result` (numeric) - Calculated discount amount
      - `tax_value` (text) - The tax input string  
      - `tax_result` (numeric) - Calculated tax amount
      - `persons` (jsonb) - Array of person entries with names and prices
      - `overall_total` (numeric) - Total before discount/tax
      - `final_total` (numeric) - Final total after discount/tax
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `calculations` table
    - Add policy for public read access to calculations
    - Add policy for public insert access (anonymous users can create)

  3. Notes
    - Using JSONB for flexible person data storage
    - Public access allows sharing without authentication
    - Each calculation gets a unique UUID for sharing
*/

CREATE TABLE IF NOT EXISTS calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discount_value text DEFAULT '',
  discount_result numeric DEFAULT 0,
  tax_value text DEFAULT '',
  tax_result numeric DEFAULT 0,
  persons jsonb DEFAULT '[]'::jsonb,
  overall_total numeric DEFAULT 0,
  final_total numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Allow public read access for sharing calculations
CREATE POLICY "Allow public read access"
  ON calculations
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access for creating new calculations
CREATE POLICY "Allow public insert access"
  ON calculations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public update access for updating calculations
CREATE POLICY "Allow public update access"
  ON calculations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);