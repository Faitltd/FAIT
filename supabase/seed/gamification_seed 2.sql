-- Master Gamification Seed File

-- Run all gamification seed files
\i 'supabase/seed/gamification_challenges.sql'
\i 'supabase/seed/gamification_events.sql'
\i 'supabase/seed/gamification_daily_tasks.sql'
\i 'supabase/seed/gamification_leaderboards.sql'
\i 'supabase/seed/gamification_teams.sql'

-- Initialize user levels for existing users
INSERT INTO user_levels (user_id, level, points_required, current_points, progress_percentage)
SELECT 
    id, 
    1, 
    (SELECT points_required FROM level_definitions WHERE level = 2), 
    0, 
    0
FROM 
    auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Create streaks for existing users
INSERT INTO streaks (user_id, type, current_count, longest_count, last_activity_date)
SELECT 
    id, 
    'login', 
    FLOOR(RANDOM() * 10)::INTEGER, 
    FLOOR(RANDOM() * 15)::INTEGER, 
    NOW() - (FLOOR(RANDOM() * 3)::INTEGER * INTERVAL '1 day')
FROM 
    auth.users
ON CONFLICT (user_id, type) DO NOTHING;

-- Create gamification settings for existing users
INSERT INTO gamification_settings (user_id, notifications_enabled, leaderboard_visibility, achievement_sharing, challenge_reminders, daily_task_reminders)
SELECT 
    id, 
    TRUE, 
    'public', 
    TRUE, 
    TRUE, 
    TRUE
FROM 
    auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Assign initial titles to users based on their user type
INSERT INTO user_titles (user_id, title, source, source_id, is_active, unlocked_at)
SELECT 
    id, 
    CASE 
        WHEN user_type = 'client' THEN 'Platform Member'
        WHEN user_type = 'service_agent' THEN 'Service Provider'
        WHEN user_type = 'contractor' THEN 'Contractor'
        WHEN user_type = 'admin' THEN 'Administrator'
        ELSE 'New User'
    END,
    'system',
    'initial_title',
    TRUE,
    NOW()
FROM 
    profiles
ON CONFLICT DO NOTHING;

-- Assign some random challenges to users
DO $$
DECLARE
    v_user RECORD;
    v_challenge RECORD;
    v_progress INTEGER;
    v_completed BOOLEAN;
    v_completed_at TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Loop through some users
    FOR v_user IN SELECT id, user_type FROM profiles LIMIT 50
    LOOP
        -- Assign 2-5 random challenges to each user
        FOR i IN 1..FLOOR(RANDOM() * 4 + 2)::INTEGER LOOP
            -- Get a random challenge appropriate for the user type
            IF v_user.user_type = 'client' THEN
                SELECT id INTO v_challenge
                FROM challenges
                WHERE category IN ('profile', 'service', 'community', 'referral', 'activity', 'special')
                ORDER BY RANDOM()
                LIMIT 1;
            ELSIF v_user.user_type IN ('service_agent', 'contractor') THEN
                SELECT id INTO v_challenge
                FROM challenges
                WHERE category IN ('service', 'verification', 'community', 'referral', 'activity', 'special')
                ORDER BY RANDOM()
                LIMIT 1;
            ELSE
                SELECT id INTO v_challenge
                FROM challenges
                WHERE category IN ('activity', 'special')
                ORDER BY RANDOM()
                LIMIT 1;
            END IF;
            
            -- Determine progress and completion status
            v_progress := FLOOR(RANDOM() * 100 + 1)::INTEGER;
            v_completed := v_progress = 100;
            
            IF v_completed THEN
                v_completed_at := NOW() - (RANDOM() * INTERVAL '30 days');
            ELSE
                v_completed_at := NULL;
            END IF;
            
            -- Insert the user challenge
            INSERT INTO user_challenges (user_id, challenge_id, progress, is_completed, completed_at, last_progress_date)
            VALUES (
                v_user.id,
                v_challenge.id,
                v_progress,
                v_completed,
                v_completed_at,
                NOW() - (RANDOM() * INTERVAL '10 days')
            )
            ON CONFLICT (user_id, challenge_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Assign some users to events
DO $$
DECLARE
    v_user RECORD;
    v_event RECORD;
    v_challenges_completed INTEGER;
    v_points_earned INTEGER;
    v_rewards_claimed BOOLEAN;
BEGIN
    -- Get active events
    FOR v_event IN SELECT id FROM events WHERE is_active = true
    LOOP
        -- Assign 10-20 random users to each event
        FOR v_user IN SELECT id FROM profiles ORDER BY RANDOM() LIMIT FLOOR(RANDOM() * 11 + 10)::INTEGER
        LOOP
            -- Determine participation details
            v_challenges_completed := FLOOR(RANDOM() * 4)::INTEGER;
            v_points_earned := v_challenges_completed * FLOOR(RANDOM() * 30 + 20)::INTEGER;
            v_rewards_claimed := v_challenges_completed > 0 AND RANDOM() > 0.5;
            
            -- Insert the participation
            INSERT INTO user_event_participations (user_id, event_id, points_earned, challenges_completed, rewards_claimed, joined_at)
            VALUES (
                v_user.id,
                v_event.id,
                v_points_earned,
                v_challenges_completed,
                v_rewards_claimed,
                NOW() - (RANDOM() * INTERVAL '10 days')
            )
            ON CONFLICT (user_id, event_id) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;

-- Create sample teams if there are users in the system
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM auth.users LIMIT 1) THEN
        PERFORM create_sample_teams();
    END IF;
END $$;

-- Assign daily tasks to all users
SELECT assign_daily_tasks();

-- Set up scheduled tasks if pg_cron extension is available
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = 'pg_cron'
    ) THEN
        PERFORM schedule_daily_task_reset();
        PERFORM schedule_leaderboard_refresh();
    END IF;
END $$;
