DROP FUNCTION IF EXISTS get_solve_info(UUID, UUID);

CREATE OR REPLACE FUNCTION get_solve_info(
  p_user_id UUID,
  p_challenge_id UUID
)
RETURNS TABLE (
  username TEXT,
  challenge TEXT,
  is_first_blood BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.username,
    c.title,
    NOT EXISTS (
      SELECT 1 
      FROM public.solves s 
      WHERE s.challenge_id = p_challenge_id 
        AND s.id <> (SELECT id FROM public.solves WHERE challenge_id = p_challenge_id AND user_id = p_user_id LIMIT 1)
        AND s.created_at <= (SELECT created_at FROM public.solves WHERE challenge_id = p_challenge_id AND user_id = p_user_id LIMIT 1)
    ) AS is_first_blood
  FROM public.users u
  JOIN public.challenges c ON c.id = p_challenge_id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_solve_info(UUID, UUID) TO authenticated;
