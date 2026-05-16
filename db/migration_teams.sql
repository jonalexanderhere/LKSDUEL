-- =============================================================
-- MIGRATION: Modern Team Management System
-- Run this in your Supabase SQL Editor
-- =============================================================

-- 1. Update Schema
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS secret_key TEXT UNIQUE;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE;
ALTER TABLE public.teams ALTER COLUMN captain_user_id DROP NOT NULL;

-- 2. Helper for Random Tokens
CREATE OR REPLACE FUNCTION generate_random_token(length INT DEFAULT 32)
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. Update create_team Function
DROP FUNCTION IF EXISTS create_team(TEXT);
CREATE OR REPLACE FUNCTION create_team(p_name TEXT)
RETURNS UUID AS $$
DECLARE
  v_team_id UUID;
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Only admins can create teams';
  END IF;

  INSERT INTO public.teams (name, invite_code, secret_key, access_token)
  VALUES (
    p_name,
    generate_random_token(12),
    NULL,
    NULL
  )
  RETURNING id INTO v_team_id;

  RETURN v_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. New Admin Function: Get All Teams
DROP FUNCTION IF EXISTS admin_get_all_teams();
CREATE OR REPLACE FUNCTION admin_get_all_teams()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_result JSON;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id AND is_admin = true) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_agg(t) INTO v_result
  FROM (
    SELECT
      t.id, t.name, t.invite_code, t.secret_key, t.access_token, t.created_at,
      t.captain_user_id,
      (SELECT count(*) FROM public.team_members WHERE team_id = t.id) as member_count,
      (
        SELECT json_agg(u.username)
        FROM public.team_members tm
        JOIN public.users u ON u.id = tm.user_id
        WHERE tm.team_id = t.id
      ) as member_names
    FROM public.teams t
    ORDER BY t.created_at DESC
  ) t;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update get_team_by_name
DROP FUNCTION IF EXISTS get_team_by_name(TEXT);
CREATE OR REPLACE FUNCTION get_team_by_name(p_name TEXT)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_is_member BOOLEAN;
  v_is_admin BOOLEAN;
BEGIN
  SELECT id INTO v_team_id FROM public.teams WHERE name = p_name;
  IF v_team_id IS NULL THEN RETURN NULL; END IF;

  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = v_team_id AND user_id = v_user_id) INTO v_is_member;
  SELECT EXISTS (SELECT 1 FROM public.users WHERE id = v_user_id AND is_admin = true) INTO v_is_admin;

  RETURN (
    SELECT json_build_object(
      'id', id,
      'name', name,
      'invite_code', invite_code,
      'secret_key', CASE WHEN v_is_member OR v_is_admin THEN secret_key ELSE NULL END,
      'access_token', CASE WHEN v_is_member OR v_is_admin THEN access_token ELSE NULL END,
      'created_at', created_at
    )
    FROM public.teams WHERE id = v_team_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Update get_my_team
DROP FUNCTION IF EXISTS get_my_team();
CREATE OR REPLACE FUNCTION get_my_team(
  p_event_id uuid DEFAULT NULL,
  p_event_mode text DEFAULT 'any'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_team JSON;
  v_members JSON;
  v_solved_event_ids UUID[];
  v_has_main_solved BOOLEAN := FALSE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NULL THEN
    RETURN json_build_object('success', true, 'team', NULL, 'members', '[]'::json);
  END IF;

  SELECT json_build_object(
    'id', t.id,
    'name', t.name,
    'invite_code', t.invite_code,
    'secret_key', t.secret_key,
    'access_token', t.access_token,
    'created_at', t.created_at
  )
  INTO v_team
  FROM public.teams t
  WHERE t.id = v_team_id;

  WITH team_users AS (
    SELECT tm.user_id, tm.joined_at
    FROM public.team_members tm
    WHERE tm.team_id = v_team_id
  ), team_first AS (
    SELECT DISTINCT ON (s.challenge_id)
      s.challenge_id,
      s.user_id,
      s.created_at
    FROM public.solves s
    JOIN team_users tu ON tu.user_id = s.user_id
    JOIN public.challenges c ON c.id = s.challenge_id
    WHERE (
      p_event_mode = 'any'
      OR (p_event_mode = 'main' AND c.event_id IS NULL)
      OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
    )
    ORDER BY s.challenge_id, s.created_at ASC, s.id ASC
  ), user_stats AS (
    SELECT
      tu.user_id,
      COALESCE(SUM(c.points), 0) AS solo_score
    FROM team_users tu
    LEFT JOIN public.solves s ON s.user_id = tu.user_id
    LEFT JOIN public.challenges c ON c.id = s.challenge_id
      AND (
        p_event_mode = 'any'
        OR (p_event_mode = 'main' AND c.event_id IS NULL)
        OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
      )
    GROUP BY tu.user_id
  ), first_stats AS (
    SELECT
      tf.user_id,
      COALESCE(COUNT(*), 0) AS first_solves,
      COALESCE(SUM(c.points), 0) AS first_solve_score
    FROM team_first tf
    JOIN public.challenges c ON c.id = tf.challenge_id
    GROUP BY tf.user_id
  )
  SELECT COALESCE(
    json_agg(
      json_build_object(
        'user_id', u.id,
        'username', u.username,
        'role', CASE WHEN u.id = t.captain_user_id THEN 'captain' ELSE 'member' END,
        'joined_at', tm.joined_at,
        'solo_score', COALESCE(us.solo_score, 0),
        'first_solve_count', COALESCE(fs.first_solves, 0),
        'first_solve_score', COALESCE(fs.first_solve_score, 0)
      )
      ORDER BY (u.id = t.captain_user_id) DESC, tm.joined_at ASC
    ),
    '[]'::json
  )
  INTO v_members
  FROM public.team_members tm
  JOIN public.users u ON u.id = tm.user_id
  JOIN public.teams t ON t.id = tm.team_id
  LEFT JOIN user_stats us ON us.user_id = tm.user_id
  LEFT JOIN first_stats fs ON fs.user_id = tm.user_id
  WHERE tm.team_id = v_team_id;

  SELECT COALESCE(
    array_agg(DISTINCT c.event_id) FILTER (WHERE c.event_id IS NOT NULL),
    '{}'::uuid[]
  ),
  COALESCE(bool_or(c.event_id IS NULL), FALSE)
  INTO v_solved_event_ids, v_has_main_solved
  FROM public.solves s
  JOIN public.challenges c ON c.id = s.challenge_id
  JOIN public.team_members tm ON tm.user_id = s.user_id
  WHERE tm.team_id = v_team_id;

  RETURN json_build_object(
    'success', true,
    'team', v_team,
    'members', v_members,
    'solved_event_ids', v_solved_event_ids,
    'has_main_solved', v_has_main_solved
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 7. Update get_my_team_summary
DROP FUNCTION IF EXISTS get_my_team_summary();
CREATE OR REPLACE FUNCTION get_my_team_summary(
  p_event_id uuid DEFAULT NULL,
  p_event_mode text DEFAULT 'any'
)
RETURNS JSON AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_team JSON;
  v_unique_score BIGINT := 0;
  v_total_score BIGINT := 0;
  v_unique_challenges INT := 0;
  v_total_solves BIGINT := 0;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NULL THEN
    RETURN json_build_object('success', true, 'team', NULL, 'stats', json_build_object(
      'unique_score', 0,
      'total_score', 0,
      'unique_challenges', 0,
      'total_solves', 0
    ));
  END IF;

  SELECT json_build_object(
    'id', t.id,
    'name', t.name,
    'invite_code', t.invite_code,
    'secret_key', t.secret_key,
    'access_token', t.access_token,
    'created_at', t.created_at
  )
  INTO v_team
  FROM public.teams t
  WHERE t.id = v_team_id;

  WITH team_users AS (
    SELECT user_id FROM public.team_members WHERE team_id = v_team_id
  ), solves_filtered AS (
    SELECT s.challenge_id, c.points
    FROM public.solves s
    JOIN team_users tu ON tu.user_id = s.user_id
    JOIN public.challenges c ON c.id = s.challenge_id
    WHERE (
      p_event_mode = 'any'
      OR (p_event_mode = 'main' AND c.event_id IS NULL)
      OR (p_event_id IS NOT NULL AND c.event_id = p_event_id)
    )
  ), unique_calc AS (
    SELECT
      COALESCE(SUM(t.points), 0)::BIGINT AS unique_score,
      COALESCE(COUNT(*), 0)::INT AS unique_challenges
    FROM (
      SELECT sf.challenge_id, MAX(sf.points) AS points
      FROM solves_filtered sf
      GROUP BY sf.challenge_id
    ) t
  ), totals AS (
    SELECT
      COALESCE(SUM(sf.points), 0)::BIGINT AS total_score,
      COALESCE(COUNT(*), 0)::BIGINT AS total_solves
    FROM solves_filtered sf
  )
  SELECT
    uc.unique_score,
    t.total_score,
    uc.unique_challenges,
    t.total_solves
  INTO v_unique_score, v_total_score, v_unique_challenges, v_total_solves
  FROM unique_calc uc
  CROSS JOIN totals t;

  RETURN json_build_object('success', true, 'team', v_team, 'stats', json_build_object(
    'unique_score', v_unique_score,
    'total_score', v_total_score,
    'unique_challenges', v_unique_challenges,
    'total_solves', v_total_solves
  ));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 8. Update join_team to Auto-Assign Captain
DROP FUNCTION IF EXISTS join_team(TEXT);
CREATE OR REPLACE FUNCTION join_team(p_invite_code TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_count INT;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_user_id) THEN RAISE EXCEPTION 'User already in a team'; END IF;

  SELECT id INTO v_team_id FROM public.teams WHERE invite_code = p_invite_code;
  IF v_team_id IS NULL THEN RAISE EXCEPTION 'Invalid invite code'; END IF;

  SELECT COUNT(*) INTO v_count FROM public.team_members WHERE team_id = v_team_id;
  IF v_count >= 3 THEN RAISE EXCEPTION 'Team is full'; END IF;

  -- Set captain if NULL
  UPDATE public.teams
  SET captain_user_id = v_user_id
  WHERE id = v_team_id AND captain_user_id IS NULL;

  INSERT INTO public.team_members(team_id, user_id)
  VALUES (v_team_id, v_user_id);

  RETURN v_team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- 9. Update leave_team to NOT delete the team
DROP FUNCTION IF EXISTS leave_team();
CREATE OR REPLACE FUNCTION leave_team()
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
  v_team_id UUID;
  v_captain_id UUID;
  v_count INT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT team_id INTO v_team_id
  FROM public.team_members
  WHERE user_id = v_user_id;

  IF v_team_id IS NULL THEN
    RAISE EXCEPTION 'User is not in a team';
  END IF;

  SELECT captain_user_id INTO v_captain_id
  FROM public.teams
  WHERE id = v_team_id;

  SELECT COUNT(*) INTO v_count
  FROM public.team_members
  WHERE team_id = v_team_id;

  IF v_captain_id = v_user_id AND v_count = 1 THEN
    UPDATE public.teams SET captain_user_id = NULL WHERE id = v_team_id;
  END IF;

  DELETE FROM public.team_members
  WHERE team_id = v_team_id AND user_id = v_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;
