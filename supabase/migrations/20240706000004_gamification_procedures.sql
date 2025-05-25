-- Gamification Stored Procedures Migration

-- Function to execute a dynamic leaderboard query
CREATE OR REPLACE FUNCTION execute_leaderboard_query(p_query TEXT, p_params JSONB)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Replace parameter placeholders in the query
  IF p_params ? 'startDate' THEN
    p_query := REPLACE(p_query, '$1', quote_literal(p_params->>'startDate'));
  END IF;
  
  IF p_params ? 'endDate' THEN
    p_query := REPLACE(p_query, '$2', quote_literal(p_params->>'endDate'));
  END IF;
  
  IF p_params ? 'category' THEN
    p_query := REPLACE(p_query, '$3', quote_literal(p_params->>'category'));
  END IF;
  
  -- Add limit and offset
  p_query := REPLACE(p_query, '$4', (p_params->>'limit')::TEXT);
  p_query := REPLACE(p_query, '$5', (p_params->>'offset')::TEXT);
  
  -- Execute the query
  EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || p_query || ') t' INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get custom leaderboard data
CREATE OR REPLACE FUNCTION get_custom_leaderboard(
  p_leaderboard_id UUID,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_leaderboard RECORD;
  v_query TEXT;
  v_result JSONB;
BEGIN
  -- Get the leaderboard
  SELECT * INTO v_leaderboard
  FROM leaderboards
  WHERE id = p_leaderboard_id;
  
  IF NOT FOUND THEN
    RETURN '[]'::JSONB;
  END IF;
  
  -- Get the custom query from the leaderboard metadata
  v_query := v_leaderboard.metadata->>'query';
  
  IF v_query IS NULL THEN
    RETURN '[]'::JSONB;
  END IF;
  
  -- Replace limit and offset placeholders
  v_query := REPLACE(v_query, '{limit}', p_limit::TEXT);
  v_query := REPLACE(v_query, '{offset}', p_offset::TEXT);
  
  -- Execute the query
  EXECUTE 'SELECT array_to_json(array_agg(row_to_json(t))) FROM (' || v_query || ') t' INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user gamification stats
CREATE OR REPLACE FUNCTION get_user_gamification_stats(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT
    jsonb_build_object(
      'points', (
        SELECT COALESCE(SUM(points), 0)
        FROM user_points
        WHERE user_id = p_user_id
      ),
      'level', (
        SELECT level
        FROM user_levels
        WHERE user_id = p_user_id
      ),
      'achievements', (
        SELECT COUNT(*)
        FROM user_achievements
        WHERE user_id = p_user_id
      ),
      'challenges_completed', (
        SELECT COUNT(*)
        FROM user_challenges
        WHERE user_id = p_user_id AND is_completed = true
      ),
      'challenges_in_progress', (
        SELECT COUNT(*)
        FROM user_challenges
        WHERE user_id = p_user_id AND is_completed = false
      ),
      'events_participated', (
        SELECT COUNT(*)
        FROM user_event_participations
        WHERE user_id = p_user_id
      ),
      'daily_tasks_completed_today', (
        SELECT COUNT(*)
        FROM user_daily_tasks
        WHERE user_id = p_user_id AND is_completed = true AND created_at >= DATE_TRUNC('day', NOW())
      ),
      'login_streak', (
        SELECT current_count
        FROM streaks
        WHERE user_id = p_user_id AND type = 'login'
      ),
      'titles', (
        SELECT COUNT(*)
        FROM user_titles
        WHERE user_id = p_user_id
      ),
      'team', (
        SELECT jsonb_build_object(
          'id', t.id,
          'name', t.name,
          'role', tm.role,
          'points_contributed', tm.points_contributed
        )
        FROM teams t
        JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = p_user_id
      )
    ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity feed
CREATE OR REPLACE FUNCTION get_user_activity_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT
    array_to_json(array_agg(row_to_json(t)))
  FROM (
    SELECT
      ga.id,
      ga.action,
      ga.target_id,
      ga.metadata,
      ga.created_at,
      CASE
        WHEN ga.action = 'challenge_completed' THEN
          jsonb_build_object(
            'type', 'challenge',
            'data', (
              SELECT jsonb_build_object(
                'id', c.id,
                'title', c.title,
                'points', c.points
              )
              FROM challenges c
              WHERE c.id = ga.target_id::UUID
            )
          )
        WHEN ga.action = 'achievement_unlocked' THEN
          jsonb_build_object(
            'type', 'achievement',
            'data', (
              SELECT jsonb_build_object(
                'id', a.id,
                'name', a.name,
                'points', a.points,
                'icon', a.icon
              )
              FROM achievements a
              WHERE a.id = ga.target_id::UUID
            )
          )
        WHEN ga.action = 'level_up' THEN
          jsonb_build_object(
            'type', 'level',
            'data', (
              SELECT jsonb_build_object(
                'level', ga.target_id::INTEGER,
                'name', ld.name
              )
              FROM level_definitions ld
              WHERE ld.level = ga.target_id::INTEGER
            )
          )
        WHEN ga.action = 'event_joined' OR ga.action = 'event_completed' THEN
          jsonb_build_object(
            'type', 'event',
            'data', (
              SELECT jsonb_build_object(
                'id', e.id,
                'title', e.title,
                'type', e.type
              )
              FROM events e
              WHERE e.id = ga.target_id::UUID
            )
          )
        WHEN ga.action = 'team_created' OR ga.action = 'team_joined' OR ga.action = 'team_left' THEN
          jsonb_build_object(
            'type', 'team',
            'data', (
              SELECT jsonb_build_object(
                'id', t.id,
                'name', t.name
              )
              FROM teams t
              WHERE t.id = ga.target_id::UUID
            )
          )
        WHEN ga.action = 'daily_task_completed' THEN
          jsonb_build_object(
            'type', 'daily_task',
            'data', (
              SELECT jsonb_build_object(
                'id', dt.id,
                'title', dt.title,
                'points', dt.points
              )
              FROM daily_tasks dt
              WHERE dt.id = ga.target_id::UUID
            )
          )
        WHEN ga.action = 'streak_milestone' THEN
          jsonb_build_object(
            'type', 'streak',
            'data', ga.metadata
          )
        ELSE
          jsonb_build_object(
            'type', 'other',
            'data', ga.metadata
          )
      END AS related_data
    FROM
      gamification_activities ga
    WHERE
      ga.user_id = p_user_id
    ORDER BY
      ga.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) t INTO v_result;
  
  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get recommended challenges for a user
CREATE OR REPLACE FUNCTION get_recommended_challenges(p_user_id UUID, p_limit INTEGER DEFAULT 5)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT
    array_to_json(array_agg(row_to_json(t)))
  FROM (
    -- Get active challenges that the user hasn't joined yet
    SELECT
      c.id,
      c.title,
      c.description,
      c.category,
      c.difficulty,
      c.points,
      c.badge_url,
      c.is_repeatable,
      c.cooldown_days,
      (
        SELECT array_to_json(array_agg(row_to_json(r)))
        FROM (
          SELECT type, action, count, target_id
          FROM challenge_requirements
          WHERE challenge_id = c.id
        ) r
      ) AS requirements,
      (
        SELECT array_to_json(array_agg(row_to_json(r)))
        FROM (
          SELECT type, value, metadata
          FROM challenge_rewards
          WHERE challenge_id = c.id
        ) r
      ) AS rewards,
      -- Calculate a relevance score based on user's past activities
      (
        SELECT COUNT(*)
        FROM gamification_activities ga
        JOIN challenge_requirements cr ON ga.action = cr.action
        WHERE ga.user_id = p_user_id AND cr.challenge_id = c.id
      ) AS relevance_score
    FROM
      challenges c
    WHERE
      c.is_active = true
      AND c.start_date <= NOW()
      AND (c.end_date IS NULL OR c.end_date >= NOW())
      AND NOT EXISTS (
        SELECT 1
        FROM user_challenges uc
        WHERE uc.user_id = p_user_id AND uc.challenge_id = c.id AND (NOT c.is_repeatable OR NOT uc.is_completed)
      )
    ORDER BY
      relevance_score DESC,
      c.points DESC
    LIMIT p_limit
  ) t INTO v_result;
  
  RETURN COALESCE(v_result, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's next level information
CREATE OR REPLACE FUNCTION get_user_next_level_info(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_current_level INTEGER;
  v_next_level RECORD;
  v_current_points INTEGER;
  v_points_needed INTEGER;
  v_progress_percentage INTEGER;
  v_result JSONB;
BEGIN
  -- Get user's current level
  SELECT level, current_points
  INTO v_current_level, v_current_points
  FROM user_levels
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    -- User doesn't have a level yet, return level 1 info
    SELECT *
    INTO v_next_level
    FROM level_definitions
    WHERE level = 1;
    
    v_current_level := 0;
    v_current_points := 0;
  ELSE
    -- Get next level definition
    SELECT *
    INTO v_next_level
    FROM level_definitions
    WHERE level = v_current_level + 1;
    
    IF NOT FOUND THEN
      -- User is at max level
      RETURN jsonb_build_object(
        'current_level', v_current_level,
        'current_points', v_current_points,
        'is_max_level', true
      );
    END IF;
  END IF;
  
  -- Calculate points needed and progress
  v_points_needed := v_next_level.points_required - v_current_points;
  v_progress_percentage := CASE
    WHEN v_current_level = 0 THEN
      CASE WHEN v_next_level.points_required = 0 THEN 100
      ELSE ROUND((v_current_points::NUMERIC / v_next_level.points_required) * 100)
      END
    ELSE
      ROUND(((v_current_points - (
        SELECT points_required
        FROM level_definitions
        WHERE level = v_current_level
      ))::NUMERIC / (v_next_level.points_required - (
        SELECT points_required
        FROM level_definitions
        WHERE level = v_current_level
      ))) * 100)
    END;
  
  -- Build result
  v_result := jsonb_build_object(
    'current_level', v_current_level,
    'next_level', v_next_level.level,
    'next_level_name', v_next_level.name,
    'current_points', v_current_points,
    'points_required', v_next_level.points_required,
    'points_needed', v_points_needed,
    'progress_percentage', v_progress_percentage,
    'rewards', (
      SELECT array_to_json(array_agg(row_to_json(r)))
      FROM (
        SELECT type, value, metadata
        FROM level_rewards
        WHERE level = v_next_level.level
      ) r
    )
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
