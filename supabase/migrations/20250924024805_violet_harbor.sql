/*
  # Add discount_value and tax_value columns to expert_calculations

  1. Changes
    - Add `discount_value` column (text) to store discount input string
    - Add `tax_value` column (text) to store tax input string
    - Both columns have empty string as default value

  2. Notes
    - These columns store the original user input (e.g., "10000+5000")
    - The existing `discount` and `tax` columns store the calculated numeric values
    - Backward compatible with existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expert_calculations' AND column_name = 'discount_value'
  ) THEN
    ALTER TABLE expert_calculations ADD COLUMN discount_value text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expert_calculations' AND column_name = 'tax_value'
  ) THEN
    ALTER TABLE expert_calculations ADD COLUMN tax_value text DEFAULT '';
  END IF;
END $$;