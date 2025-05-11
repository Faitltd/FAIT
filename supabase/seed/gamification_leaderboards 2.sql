-- Initial Leaderboards Seed Data

-- Create custom leaderboard queries
CREATE OR REPLACE FUNCTION create_leaderboard_queries()
RETURNS void AS $$
BEGIN
    -- Update the weekly points leaderboard with a custom query
    UPDATE leaderboards
    SET metadata = jsonb_build_object(
        'query', 'SELECT 
            p.id as user_id, 
            p.first_name, 
            p.last_name, 
            p.avatar_url, 
            p.user_type,
            COALESCE(SUM(up.points), 0) as score,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(up.points), 0) DESC) as rank
        FROM 
            profiles p
        LEFT JOIN 
            user_points up ON p.id = up.user_id
        WHERE 
            up.created_at >= date_trunc(''week'', CURRENT_DATE)
            AND p.leaderboard_visibility = ''public''
        GROUP BY 
            p.id
        ORDER BY 
            score DESC, p.first_name
        LIMIT {limit} OFFSET {offset}'
    )
    WHERE name = 'Weekly Points';

    -- Update the monthly points leaderboard with a custom query
    UPDATE leaderboards
    SET metadata = jsonb_build_object(
        'query', 'SELECT 
            p.id as user_id, 
            p.first_name, 
            p.last_name, 
            p.avatar_url, 
            p.user_type,
            COALESCE(SUM(up.points), 0) as score,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(up.points), 0) DESC) as rank
        FROM 
            profiles p
        LEFT JOIN 
            user_points up ON p.id = up.user_id
        WHERE 
            up.created_at >= date_trunc(''month'', CURRENT_DATE)
            AND p.leaderboard_visibility = ''public''
        GROUP BY 
            p.id
        ORDER BY 
            score DESC, p.first_name
        LIMIT {limit} OFFSET {offset}'
    )
    WHERE name = 'Monthly Points';

    -- Update the all-time points leaderboard with a custom query
    UPDATE leaderboards
    SET metadata = jsonb_build_object(
        'query', 'SELECT 
            p.id as user_id, 
            p.first_name, 
            p.last_name, 
            p.avatar_url, 
            p.user_type,
            COALESCE(SUM(up.points), 0) as score,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(up.points), 0) DESC) as rank
        FROM 
            profiles p
        LEFT JOIN 
            user_points up ON p.id = up.user_id
        WHERE 
            p.leaderboard_visibility = ''public''
        GROUP BY 
            p.id
        ORDER BY 
            score DESC, p.first_name
        LIMIT {limit} OFFSET {offset}'
    )
    WHERE name = 'All-Time Points';

    -- Update the achievement masters leaderboard with a custom query
    UPDATE leaderboards
    SET metadata = jsonb_build_object(
        'query', 'SELECT 
            p.id as user_id, 
            p.first_name, 
            p.last_name, 
            p.avatar_url, 
            p.user_type,
            COUNT(ua.id) as score,
            ROW_NUMBER() OVER (ORDER BY COUNT(ua.id) DESC) as rank
        FROM 
            profiles p
        LEFT JOIN 
            user_achievements ua ON p.id = ua.user_id
        WHERE 
            p.leaderboard_visibility = ''public''
        GROUP BY 
            p.id
        ORDER BY 
            score DESC, p.first_name
        LIMIT {limit} OFFSET {offset}'
    )
    WHERE name = 'Achievement Masters';

    -- Update the challenge champions leaderboard with a custom query
    UPDATE leaderboards
    SET metadata = jsonb_build_object(
        'query', 'SELECT 
            p.id as user_id, 
            p.first_name, 
            p.last_name, 
            p.avatar_url, 
            p.user_type,
            COUNT(uc.id) as score,
            ROW_NUMBER() OVER (ORDER BY COUNT(uc.id) DESC) as rank
        FROM 
            profiles p
        LEFT JOIN 
            user_challenges uc ON p.id = uc.user_id
        WHERE 
            uc.is_completed = true
            AND uc.completed_at >= date_trunc(''month'', CURRENT_DATE)
            AND p.leaderboard_visibility = ''public''
        GROUP BY 
            p.id
        ORDER BY 
            score DESC, p.first_name
        LIMIT {limit} OFFSET {offset}'
    )
    WHERE name = 'Challenge Champions';
END;
$$ LANGUAGE plpgsql;

-- Create additional leaderboards
INSERT INTO leaderboards (name, description, type, period, is_active)
VALUES
  ('Service Provider Stars', 'Top-rated service providers this month', 'ratings', 'monthly', true),
  ('Community Contributors', 'Most active community forum contributors', 'forum_posts', 'monthly', true),
  ('Referral Leaders', 'Users who have referred the most new members', 'referrals', 'all_time', true),
  ('Streak Masters', 'Users with the longest active login streaks', 'streaks', 'current', true);

-- Update the new leaderboards with custom queries
UPDATE leaderboards
SET metadata = jsonb_build_object(
    'query', 'SELECT 
        p.id as user_id, 
        p.first_name, 
        p.last_name, 
        p.avatar_url, 
        p.user_type,
        COALESCE(AVG(r.rating), 0) as score,
        ROW_NUMBER() OVER (ORDER BY COALESCE(AVG(r.rating), 0) DESC) as rank
    FROM 
        profiles p
    LEFT JOIN 
        reviews r ON p.id = r.service_agent_id
    WHERE 
        r.created_at >= date_trunc(''month'', CURRENT_DATE)
        AND p.user_type IN (''service_agent'', ''contractor'')
        AND p.leaderboard_visibility = ''public''
    GROUP BY 
        p.id
    HAVING 
        COUNT(r.id) >= 3
    ORDER BY 
        score DESC, p.first_name
    LIMIT {limit} OFFSET {offset}'
)
WHERE name = 'Service Provider Stars';

UPDATE leaderboards
SET metadata = jsonb_build_object(
    'query', 'SELECT 
        p.id as user_id, 
        p.first_name, 
        p.last_name, 
        p.avatar_url, 
        p.user_type,
        COUNT(fp.id) as score,
        ROW_NUMBER() OVER (ORDER BY COUNT(fp.id) DESC) as rank
    FROM 
        profiles p
    LEFT JOIN 
        forum_posts fp ON p.id = fp.user_id
    WHERE 
        fp.created_at >= date_trunc(''month'', CURRENT_DATE)
        AND p.leaderboard_visibility = ''public''
    GROUP BY 
        p.id
    ORDER BY 
        score DESC, p.first_name
    LIMIT {limit} OFFSET {offset}'
)
WHERE name = 'Community Contributors';

UPDATE leaderboards
SET metadata = jsonb_build_object(
    'query', 'SELECT 
        p.id as user_id, 
        p.first_name, 
        p.last_name, 
        p.avatar_url, 
        p.user_type,
        COUNT(r.id) as score,
        ROW_NUMBER() OVER (ORDER BY COUNT(r.id) DESC) as rank
    FROM 
        profiles p
    LEFT JOIN 
        referrals r ON p.id = r.referrer_id
    WHERE 
        r.status = ''completed''
        AND p.leaderboard_visibility = ''public''
    GROUP BY 
        p.id
    ORDER BY 
        score DESC, p.first_name
    LIMIT {limit} OFFSET {offset}'
)
WHERE name = 'Referral Leaders';

UPDATE leaderboards
SET metadata = jsonb_build_object(
    'query', 'SELECT 
        p.id as user_id, 
        p.first_name, 
        p.last_name, 
        p.avatar_url, 
        p.user_type,
        COALESCE(s.current_count, 0) as score,
        ROW_NUMBER() OVER (ORDER BY COALESCE(s.current_count, 0) DESC) as rank
    FROM 
        profiles p
    LEFT JOIN 
        streaks s ON p.id = s.user_id AND s.type = ''login''
    WHERE 
        p.leaderboard_visibility = ''public''
    ORDER BY 
        score DESC, p.first_name
    LIMIT {limit} OFFSET {offset}'
)
WHERE name = 'Streak Masters';

-- Call the function to update the initial leaderboards
SELECT create_leaderboard_queries();

-- Create a function to refresh leaderboard data
CREATE OR REPLACE FUNCTION refresh_leaderboards()
RETURNS void AS $$
BEGIN
    -- This function would typically update materialized views or cache data
    -- For our implementation, we're using dynamic queries so no refresh is needed
    -- But we could add additional logic here if needed
    RAISE NOTICE 'Refreshing leaderboards...';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled function to refresh leaderboards periodically
CREATE OR REPLACE FUNCTION schedule_leaderboard_refresh()
RETURNS void AS $$
BEGIN
    PERFORM cron.schedule(
        'refresh-leaderboards',
        '0 * * * *', -- Run every hour
        $$SELECT refresh_leaderboards()$$
    );
END;
$$ LANGUAGE plpgsql;
