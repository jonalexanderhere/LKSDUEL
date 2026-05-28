-- ==============================================
-- Function: set_user_admin_status
-- Security Definer function to allow global admins to promote/demote users
-- ==============================================

CREATE OR REPLACE FUNCTION public.set_user_admin_status(p_user_id UUID, p_is_admin BOOLEAN)
RETURNS BOOLEAN AS $$
BEGIN
  -- Restrict to global admins only
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only global admin can change user admin status';
  END IF;

  -- Prevent self-demotion to avoid accidental lockout
  IF p_user_id = auth.uid()::uuid AND NOT p_is_admin THEN
    RAISE EXCEPTION 'You cannot revoke admin permissions from yourself';
  END IF;

  UPDATE public.users
  SET is_admin = p_is_admin,
      updated_at = now()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.set_user_admin_status(UUID, BOOLEAN) TO authenticated;
