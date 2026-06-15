-- Dummy Seed Data for LKSDUEL
-- This script adds dummy event, challenges, and solves for existing users.

-- 1. Create a dummy event
INSERT INTO public.events (id, name, description, start_time, end_time)
VALUES 
  ('e1e1e1e1-e1e1-4e1e-a1e1-e1e1e1e1e1e1', 'LKSDUEL Warmup 2026', 'A quick warmup event to test your skills.', now() - interval '1 day', now() + interval '7 days')
ON CONFLICT (id) DO NOTHING;

-- 2. Create challenges
DO $$
DECLARE
    v_chall1 UUID := gen_random_uuid();
    v_chall2 UUID := gen_random_uuid();
    v_chall3 UUID := gen_random_uuid();
    v_chall4 UUID := gen_random_uuid();
    v_user1 UUID := '03c2df41-70c3-4b06-9419-cef136e96165';
    v_user2 UUID := '5fcf673b-9223-4087-bb71-e1727c80fef2';
    v_event_id UUID := 'e1e1e1e1-e1e1-4e1e-a1e1-e1e1e1e1e1e1';
BEGIN
    -- Intro
    INSERT INTO public.challenges (id, event_id, title, description, category, points, difficulty, is_active)
    VALUES (v_chall1, v_event_id, 'Welcome to LKSDUEL', 'Just a simple welcome challenge. Flag is LKSDUEL{w3lc0m3_t0_lksduel}', 'Intro', 100, 'Easy', true);
    
    INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
    VALUES (v_chall1, 'LKSDUEL{w3lc0m3_t0_lksduel}', encode(digest('LKSDUEL{w3lc0m3_t0_lksduel}', 'sha256'), 'hex'));

    -- Web
    INSERT INTO public.challenges (id, event_id, title, description, category, points, difficulty, is_active)
    VALUES (v_chall2, v_event_id, 'Broken Login', 'Can you bypass this login form? Flag is LKSDUEL{sqli_is_st1ll_aliv3}', 'Web', 250, 'Medium', true);
    
    INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
    VALUES (v_chall2, 'LKSDUEL{sqli_is_st1ll_aliv3}', encode(digest('LKSDUEL{sqli_is_st1ll_aliv3}', 'sha256'), 'hex'));

    -- Crypto
    INSERT INTO public.challenges (id, event_id, title, description, category, points, difficulty, is_active)
    VALUES (v_chall3, v_event_id, 'Simple XOR', 'Decrypt this XORed string. Flag is LKSDUEL{x0r_is_fun}', 'Crypto', 200, 'Easy', true);
    
    INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
    VALUES (v_chall3, 'LKSDUEL{x0r_is_fun}', encode(digest('LKSDUEL{x0r_is_fun}', 'sha256'), 'hex'));

    -- Pwn
    INSERT INTO public.challenges (id, event_id, title, description, category, points, difficulty, is_active)
    VALUES (v_chall4, v_event_id, 'Buffer Overflow 101', 'Classic pwn challenge. Flag is LKSDUEL{pwn_th3_stack}', 'Pwn', 500, 'Hard', true);
    
    INSERT INTO public.challenge_flags (challenge_id, flag, flag_hash)
    VALUES (v_chall4, 'LKSDUEL{pwn_th3_stack}', encode(digest('LKSDUEL{pwn_th3_stack}', 'sha256'), 'hex'));

    -- Create Teams (if they don't have one)
    IF NOT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_user1) THEN
        INSERT INTO public.teams (id, name, invite_code, captain_user_id)
        VALUES ('a1a1a1a1-a1a1-4a1a-b1b1-b1b1b1b1b1b1', 'Team Alpha', 'ALPHA123', v_user1);
        
        INSERT INTO public.team_members (team_id, user_id)
        VALUES ('a1a1a1a1-a1a1-4a1a-b1b1-b1b1b1b1b1b1', v_user1);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.team_members WHERE user_id = v_user2) THEN
        INSERT INTO public.teams (id, name, invite_code, captain_user_id)
        VALUES ('b2b2b2b2-b2b2-4b2b-c2c2-c2c2c2c2c2c2', 'Cyber Wizards', 'WIZARD99', v_user2);
        
        INSERT INTO public.team_members (team_id, user_id)
        VALUES ('b2b2b2b2-b2b2-4b2b-c2c2-c2c2c2c2c2c2', v_user2);
    END IF;

    -- Add Solves
    INSERT INTO public.solves (user_id, challenge_id, created_at)
    VALUES (v_user1, v_chall1, now() - interval '2 hours');

    INSERT INTO public.solves (user_id, challenge_id, created_at)
    VALUES (v_user2, v_chall1, now() - interval '1 hour');

    INSERT INTO public.solves (user_id, challenge_id, created_at)
    VALUES (v_user1, v_chall2, now() - interval '30 minutes');

END $$;
