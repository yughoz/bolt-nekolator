/*
  # Add user_id column to calculations table

  1. Changes
    - Add `user_id` column (uuid) to store the authenticated user's ID
    - Add foreign key constraint to auth.users table
    - Column is nullable to maintain backward compatibility
    - Add index for performance

  2. Security
    - Update RLS policies to allow users to access their own calculations
    - Maintain public access for anonymous calculations

  3. Notes
    - Backward compatible with existing data
    - Existing records will have NULL user_id (anonymous users)
    - New records can optionally associate with authenticated users
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calculations' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE calculations ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);

-- Update existing RLS policies to support user-specific access
DROP POLICY IF EXISTS "Allow public read access" ON calculations;
DROP POLICY IF EXISTS "Allow public insert access" ON calculations;
DROP POLICY IF EXISTS "Allow public update access" ON calculations;

-- Allow read access: users can see their own calculations + all anonymous calculations
CREATE POLICY "Allow read access to own calculations"
  ON calculations
  FOR SELECT
  TO public
  USING (user_id IS NULL OR user_id = auth.uid());

-- Allow insert access: users can insert with their own user_id or NULL (anonymous)
CREATE POLICY "Allow insert access"
  ON calculations
  FOR INSERT
  TO public
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

-- Allow update access: users can update their own calculations
CREATE POLICY "Allow update access to own calculations"
  ON calculations
  FOR UPDATE
  TO public
  USING (user_id IS NULL OR user_id = auth.uid())
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());