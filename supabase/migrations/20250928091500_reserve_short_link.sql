/*
  # Reserve short link IDs via RPC

  1. New Functions
    - `reserve_short_link()` returns the next sequence id and its base-36 short code

  2. Access
    - Exposed as a `rpc` callable by `anon` and `authenticated` roles
*/

CREATE OR REPLACE FUNCTION reserve_short_link()
RETURNS TABLE (id bigint, short_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id bigint;
BEGIN
  new_id := nextval('short_links_id_seq');
  RETURN QUERY SELECT new_id, generate_short_code(new_id);
END;
$$;

GRANT EXECUTE ON FUNCTION reserve_short_link() TO anon, authenticated;
