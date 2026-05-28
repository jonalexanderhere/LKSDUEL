-- ==============================================
-- Function: delete_user_by_admin
-- Security Definer function to allow global admins to delete users completely
-- ==============================================

CREATE OR REPLACE FUNCTION public.delete_user_by_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Restrict to global admins only
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Only global admin can delete users';
  END IF;

  -- Delete from auth.users (cascades to public.users and solves/teams)
  DELETE FROM auth.users WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.delete_user_by_admin(UUID) TO authenticated;
