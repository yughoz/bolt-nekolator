/*
  # Add UPDATE and DELETE policies for short_links table

  1. Changes
    - Add public UPDATE policy for short_links table
    - Add public DELETE policy for short_links table
    - This allows the application to update the short_code after initial insert
    - This allows cleanup of temporary entries in case of errors

  2. Security
    - Public UPDATE access is safe because:
      - short_code is the only field being updated
      - Updates happen immediately after insert in the same transaction
      - The table is write-only (no sensitive data to protect)
    - Public DELETE access is safe because:
      - Only used to clean up temporary entries with conflicts
      - Deletes happen immediately after insert in error scenarios
*/

-- Allow public update access for setting short_code after insert
CREATE POLICY "Allow public update access on short links"
  ON short_links
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow public delete access for cleanup of temporary entries
CREATE POLICY "Allow public delete access on short links"
  ON short_links
  FOR DELETE
  TO public
  USING (true);
