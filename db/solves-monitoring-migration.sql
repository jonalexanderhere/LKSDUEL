-- ==============================================================
-- Solves Monitoring Migration Script
-- Creates:
--   1. flag_submissions (table for telemetry)
--   2. challenge_views (table for telemetry)
--   3. log_challenge_view (function to record views)
--   4. submit_flag (updated to record submissions)
--   5. get_solves_monitoring (function for dashboard analytics)
-- ==============================================================

-- 1. Create table flag_submissions
CREATE TABLE IF NOT EXISTS public.flag_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  submitted_flag TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on flag_submissions
ALTER TABLE public.flag_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for flag_submissions
DROP POLICY IF EXISTS "Flag submissions can select own" ON public.flag_submissions;
CREATE POLICY "Flag submissions can select own"
  ON public.flag_submissions
  FOR SELECT
  USING (auth.uid() = user_id OR has_admin_access());

DROP POLICY IF EXISTS "Flag submissions can insert own" ON public.flag_submissions;
CREATE POLICY "Flag submissions can insert own"
  ON public.flag_submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Create table challenge_views
CREATE TABLE IF NOT EXISTS public.challenge_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID DEFAULT auth.uid() REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on challenge_views
ALTER TABLE public.challenge_views ENABLE ROW LEVEL SECURITY;

-- Create policies for challenge_views
DROP POLICY IF EXISTS "Challenge views can select own" ON public.challenge_views;
CREATE POLICY "Challenge views can select own"
  ON public.challenge_views
  FOR SELECT
  USING (auth.uid() = user_id OR has_admin_access());

DROP POLICY IF EXISTS "Challenge views can insert own" ON public.challenge_views;
CREATE POLICY "Challenge views can insert own"
  ON public.challenge_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Create challenge view logger function
CREATE OR REPLACE FUNCTION public.log_challenge_view(p_challenge_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID := auth.uid()::uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.challenge_views(user_id, challenge_id)
  VALUES (v_user_id, p_challenge_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.log_challenge_view(UUID) TO authenticated;

-- 4. Drop and Recreate submit_flag function to log submissions
CREATE OR REPLACE FUNCTION submit_flag(
  p_challenge_id uuid,
  p_flag text
)
RETURNS json AS $$
DECLARE
  v_user_id uuid := auth.uid()::uuid;
  v_flag_hash TEXT;
  v_points INTEGER;
  v_max_points INTEGER;
  v_is_dynamic BOOLEAN;
  v_is_maintenance BOOLEAN;
  v_is_active BOOLEAN;
  v_min_points INTEGER;
  v_decay_per_solve INTEGER;
  v_event_id UUID;
  v_event_start TIMESTAMPTZ;
  v_event_end TIMESTAMPTZ;
  v_event_exists BOOLEAN;
  v_event_join_mode TEXT;
  v_is_event_member BOOLEAN := FALSE;
  v_solver_count INTEGER;
  v_awarded_points INTEGER;
  v_existing INT;
  v_is_correct BOOLEAN;
  v_is_admin_override BOOLEAN := FALSE;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  SELECT cf.flag_hash, c.points, c.max_points, c.is_dynamic, c.is_active, c.is_maintenance, c.min_points, c.decay_per_solve,
        c.event_id, e.start_time, e.end_time, (e.id IS NOT NULL), e.join_mode
    INTO v_flag_hash, v_points, v_max_points, v_is_dynamic, v_is_active, v_is_maintenance, v_min_points, v_decay_per_solve,
      v_event_id, v_event_start, v_event_end, v_event_exists, v_event_join_mode
  FROM public.challenge_flags cf
  JOIN public.challenges c ON c.id = cf.challenge_id
  LEFT JOIN public.events e ON e.id = c.event_id
  WHERE cf.challenge_id = p_challenge_id;

  IF v_flag_hash IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Challenge not found');
  END IF;

  v_is_admin_override := is_admin() OR can_manage_challenge(p_challenge_id);

  IF NOT v_is_admin_override THEN
    IF COALESCE(v_is_maintenance, false) THEN
      RETURN json_build_object('success', false, 'message', 'Challenge is under maintenance');
    END IF;

    IF NOT COALESCE(v_is_active, TRUE) THEN
      RETURN json_build_object('success', false, 'message', 'Challenge is not active');
    END IF;
  END IF;

  IF v_event_id IS NOT NULL AND NOT COALESCE(v_event_exists, false) THEN
    RETURN json_build_object('success', false, 'message', 'Event not found');
  END IF;

  IF NOT v_is_admin_override THEN
    IF v_event_id IS NOT NULL THEN
      IF COALESCE(v_event_join_mode, 'open') <> 'open' THEN
        SELECT EXISTS (
          SELECT 1
          FROM public.event_participants ep
          WHERE ep.event_id = v_event_id
            AND ep.user_id = v_user_id
        ) INTO v_is_event_member;

        IF NOT v_is_event_member THEN
          RETURN json_build_object('success', false, 'message', 'Join this event first before submitting flags');
        END IF;
      END IF;

      IF v_event_start IS NOT NULL AND now() < v_event_start THEN
        RETURN json_build_object('success', false, 'message', 'Event has not started yet');
      END IF;

      IF v_event_end IS NOT NULL AND now() > v_event_end THEN
        RETURN json_build_object('success', false, 'message', 'Event has ended');
      END IF;
    END IF;
  END IF;

  v_is_correct := encode(digest(p_flag, 'sha256'), 'hex') = v_flag_hash;

  -- Log the submission attempt
  IF NOT v_is_admin_override THEN
    INSERT INTO public.flag_submissions (user_id, challenge_id, submitted_flag, is_correct)
    VALUES (v_user_id, p_challenge_id, p_flag, v_is_correct);
  END IF;

  IF NOT v_is_correct THEN
    RETURN json_build_object('success', false, 'message', 'Incorrect flag');
  END IF;

  SELECT count(*) INTO v_existing
  FROM public.solves
  WHERE user_id = v_user_id AND challenge_id = p_challenge_id;

  IF v_existing > 0 THEN
    IF v_is_admin_override THEN
      RETURN json_build_object('success', true, 'message', 'Correct (admin). No points awarded.');
    ELSE
      RETURN json_build_object('success', true, 'message', 'Correct, but already solved.');
    END IF;
  END IF;

  IF v_is_admin_override THEN
    RETURN json_build_object('success', true, 'message', 'Correct (admin). No points awarded.');
  END IF;

  IF v_is_dynamic THEN
    SELECT points INTO v_awarded_points FROM public.challenges WHERE id = p_challenge_id;
  ELSE
    v_awarded_points := v_points;
  END IF;

  INSERT INTO public.solves(user_id, challenge_id) VALUES (v_user_id, p_challenge_id);

  RETURN json_build_object('success', true, 'message', format('Correct! +%s points.', v_awarded_points));
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION submit_flag(uuid, text) TO authenticated;

-- 5. Create the solves monitoring RPC
CREATE OR REPLACE FUNCTION public.get_solves_monitoring()
RETURNS TABLE (
  solve_id UUID,
  user_id UUID,
  username TEXT,
  team_name TEXT,
  challenge_id UUID,
  challenge_title TEXT,
  points INTEGER,
  solved_at TIMESTAMPTZ,
  time_since_prev_solve_seconds DOUBLE PRECISION,
  time_since_user_prev_solve_seconds DOUBLE PRECISION,
  incorrect_attempts_count INTEGER,
  time_to_solve_seconds DOUBLE PRECISION
) AS $$
BEGIN
  IF NOT has_admin_access() THEN
    RAISE EXCEPTION 'Only admin can view solves monitoring data';
  END IF;

  RETURN QUERY
  SELECT
    s.id AS solve_id,
    s.user_id,
    u.username,
    COALESCE(tm.team_name, ''::text) AS team_name,
    c.id AS challenge_id,
    c.title AS challenge_title,
    c.points,
    s.created_at AS solved_at,
    (
      SELECT CAST(EXTRACT(EPOCH FROM (s.created_at - prev_s.created_at)) AS DOUBLE PRECISION)
      FROM public.solves prev_s
      WHERE prev_s.challenge_id = s.challenge_id
        AND prev_s.created_at < s.created_at
      ORDER BY prev_s.created_at DESC
      LIMIT 1
    ) AS time_since_prev_solve_seconds,
    (
      SELECT CAST(EXTRACT(EPOCH FROM (s.created_at - prev_user_s.created_at)) AS DOUBLE PRECISION)
      FROM public.solves prev_user_s
      WHERE prev_user_s.user_id = s.user_id
        AND prev_user_s.created_at < s.created_at
      ORDER BY prev_user_s.created_at DESC
      LIMIT 1
    ) AS time_since_user_prev_solve_seconds,
    (
      SELECT COUNT(*)::integer
      FROM public.flag_submissions fs
      WHERE fs.challenge_id = s.challenge_id
        AND fs.user_id = s.user_id
        AND fs.is_correct = false
        AND fs.created_at < s.created_at
    ) AS incorrect_attempts_count,
    (
      SELECT CAST(EXTRACT(EPOCH FROM (s.created_at - cv.created_at)) AS DOUBLE PRECISION)
      FROM public.challenge_views cv
      WHERE cv.challenge_id = s.challenge_id
        AND cv.user_id = s.user_id
        AND cv.created_at < s.created_at
      ORDER BY cv.created_at ASC
      LIMIT 1
    ) AS time_to_solve_seconds
  FROM public.solves s
  JOIN public.users u ON u.id = s.user_id
  JOIN public.challenges c ON c.id = s.challenge_id
  LEFT JOIN (
    SELECT t.name AS team_name, tm_sub.user_id
    FROM public.team_members tm_sub
    JOIN public.teams t ON t.id = tm_sub.team_id
  ) tm ON tm.user_id = s.user_id
  ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_solves_monitoring() TO authenticated;
