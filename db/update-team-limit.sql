CREATE OR REPLACE FUNCTION join_team(p_invite_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_count INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_user_id) THEN
    RAISE EXCEPTION 'User already in a team';
  END IF;

  SELECT t.id INTO v_team_id
  FROM public.teams t
  WHERE t.invite_code = p_invite_code;

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  SELECT COUNT(*) INTO v_count
  FROM public.team_members tm
  WHERE tm.team_id = v_team_id;

  IF v_count >= 3 THEN
    RAISE EXCEPTION 'Team is full (Max 3 members)';
  END IF;

  INSERT INTO public.team_members(team_id, user_id)
  VALUES (v_team_id, v_user_id);

  RETURN v_team_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth;
