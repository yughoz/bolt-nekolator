/*
  # Create expert calculations table for Nekolators Expert Mode

  1. New Tables
    - `expert_calculations`
      - `id` (uuid, primary key)
      - `items` (jsonb) - Array of items with id, name, price, category
      - `persons` (jsonb) - Array of persons with id, name, color
      - `assignments` (jsonb) - Array of item-person assignments
      - `discount` (numeric) - Total discount amount
      - `tax` (numeric) - Total tax and shipping amount
      - `subtotal` (numeric) - Subtotal before discount/tax
      - `final_total` (numeric) - Final total after discount/tax
      - `receipt_data` (jsonb) - Optional receipt data from upload
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `expert_calculations` table
    - Add policy for public read access to calculations
    - Add policy for public insert access (anonymous users can create)
    - Add policy for public update access

  3. Notes
    - Using JSONB for flexible data storage
    - Public access allows sharing without authentication
    - Each calculation gets a unique UUID for sharing
*/

CREATE TABLE IF NOT EXISTS expert_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb DEFAULT '[]'::jsonb,
  persons jsonb DEFAULT '[]'::jsonb,
  assignments jsonb DEFAULT '[]'::jsonb,
  discount numeric DEFAULT 0,
  tax numeric DEFAULT 0,
  subtotal numeric DEFAULT 0,
  final_total numeric DEFAULT 0,
  receipt_data jsonb DEFAULT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE expert_calculations ENABLE ROW LEVEL SECURITY;

-- Allow public read access for sharing calculations
CREATE POLICY "Allow public read access on expert calculations"
  ON expert_calculations
  FOR SELECT
  TO public
  USING (true);

-- Allow public insert access for creating new calculations
CREATE POLICY "Allow public insert access on expert calculations"
  ON expert_calculations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow public update access for updating calculations
CREATE POLICY "Allow public update access on expert calculations"
  ON expert_calculations
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);