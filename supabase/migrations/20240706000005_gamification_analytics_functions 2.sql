-- Gamification Analytics Functions Migration

-- Function to get popular challenges
CREATE OR REPLACE FUNCTION get_popular_challenges(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  difficulty TEXT,
  completions BIGINT,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH challenge_stats AS (
    SELECT
      c.id,
      c.title,
      c.category,
      c.difficulty,
      COUNT(uc.id) FILTER (WHERE uc.is_completed = true) AS completions,
      COUNT(uc.id) AS attempts
    FROM
      challenges c
    LEFT JOIN
      user_challenges uc ON c.id = uc.challenge_id
    WHERE
      (uc.completed_at IS NULL OR uc.completed_at BETWEEN start_date AND end_date)
    GROUP BY
      c.id, c.title, c.category, c.difficulty
  )
  SELECT
    cs.id,
    cs.title,
    cs.category,
    cs.difficulty,
    cs.completions,
    CASE WHEN cs.attempts > 0 THEN (cs.completions::NUMERIC / cs.attempts) * 100 ELSE 0 END AS completion_rate
  FROM
    challenge_stats cs
  ORDER BY
    cs.completions DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get popular events
CREATE OR REPLACE FUNCTION get_popular_events(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  limit_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  type TEXT,
  participants BIGINT,
  participation_rate NUMERIC,
  challenges_completed_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH event_stats AS (
    SELECT
      e.id,
      e.title,
      e.type,
      COUNT(DISTINCT uep.user_id) AS participants,
      (SELECT COUNT(*) FROM auth.users) AS total_users,
      SUM(uep.challenges_completed) AS total_challenges_completed,
      COUNT(ec.challenge_id) AS total_possible_challenges
    FROM
      events e
    LEFT JOIN
      user_event_participations uep ON e.id = uep.event_id
    LEFT JOIN
      event_challenges ec ON e.id = ec.event_id
    WHERE
      e.start_date <= end_date AND
      (e.end_date IS NULL OR e.end_date >= start_date) AND
      (uep.joined_at IS NULL OR uep.joined_at BETWEEN start_date AND end_date)
    GROUP BY
      e.id, e.title, e.type
  )
  SELECT
    es.id,
    es.title,
    es.type,
    es.participants,
    CASE WHEN es.total_users > 0 THEN (es.participants::NUMERIC / es.total_users) * 100 ELSE 0 END AS participation_rate,
    CASE 
      WHEN es.participants > 0 AND es.total_possible_challenges > 0 
      THEN (es.total_challenges_completed::NUMERIC / (es.participants * es.total_possible_challenges)) * 100 
      ELSE 0 
    END AS challenges_completed_rate
  FROM
    event_stats es
  ORDER BY
    es.participants DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get daily task statistics
CREATE OR REPLACE FUNCTION get_daily_task_stats(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  completion_rate NUMERIC,
  avg_completed NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (COUNT(*) FILTER (WHERE udt.is_completed = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100 AS completion_rate,
    AVG(CASE WHEN p.id IS NOT NULL THEN (
      SELECT COUNT(*) FROM user_daily_tasks udt2 
      WHERE udt2.user_id = p.id AND udt2.is_completed = true AND udt2.created_at BETWEEN start_date AND end_date
    ) ELSE 0 END) AS avg_completed
  FROM
    user_daily_tasks udt
  CROSS JOIN
    profiles p
  WHERE
    udt.created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get streak statistics
CREATE OR REPLACE FUNCTION get_streak_stats()
RETURNS TABLE (
  avg_streak NUMERIC,
  max_streak INTEGER,
  active_streaks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(s.current_count)::NUMERIC AS avg_streak,
    MAX(s.current_count) AS max_streak,
    COUNT(*) FILTER (WHERE s.current_count > 0 AND s.last_activity_date >= CURRENT_DATE - INTERVAL '1 day') AS active_streaks
  FROM
    streaks s
  WHERE
    s.type = 'login';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get team statistics
CREATE OR REPLACE FUNCTION get_team_stats()
RETURNS TABLE (
  avg_size NUMERIC,
  challenges_completed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(t.member_count)::NUMERIC AS avg_size,
    COUNT(tc.id) FILTER (WHERE tc.is_completed = true) AS challenges_completed
  FROM
    teams t
  LEFT JOIN
    team_challenges tc ON t.id = tc.team_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get point statistics
CREATE OR REPLACE FUNCTION get_point_stats(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  total_points BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(up.points), 0) AS total_points
  FROM
    user_points up
  WHERE
    up.created_at BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get points by source
CREATE OR REPLACE FUNCTION get_points_by_source(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  source TEXT,
  points BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    up.source,
    SUM(up.points) AS points
  FROM
    user_points up
  WHERE
    up.created_at BETWEEN start_date AND end_date
  GROUP BY
    up.source
  ORDER BY
    points DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get retention metrics
CREATE OR REPLACE FUNCTION get_retention_metrics(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  overall_retention NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_activity AS (
    SELECT
      user_id,
      MIN(created_at) AS first_activity,
      MAX(created_at) AS last_activity
    FROM
      gamification_activities
    GROUP BY
      user_id
  )
  SELECT
    (COUNT(*) FILTER (WHERE ua.last_activity >= end_date - INTERVAL '7 days')::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE ua.first_activity <= start_date + INTERVAL '7 days'), 0)) * 100 AS overall_retention
  FROM
    user_activity ua;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get retention by engagement level
CREATE OR REPLACE FUNCTION get_retention_by_engagement_level(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  engagement_level TEXT,
  retention_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_engagement AS (
    SELECT
      ga.user_id,
      CASE
        WHEN COUNT(*) > 100 AND COUNT(DISTINCT DATE(ga.created_at)) > 30 THEN 'power_user'
        WHEN COUNT(*) > 50 AND COUNT(DISTINCT DATE(ga.created_at)) > 14 THEN 'highly_engaged'
        WHEN COUNT(*) > 20 AND COUNT(DISTINCT DATE(ga.created_at)) > 7 THEN 'engaged'
        WHEN COUNT(*) > 0 THEN 'casual'
        ELSE 'inactive'
      END AS engagement_level,
      MIN(ga.created_at) AS first_activity,
      MAX(ga.created_at) AS last_activity
    FROM
      gamification_activities ga
    WHERE
      ga.created_at BETWEEN start_date AND end_date
    GROUP BY
      ga.user_id
  )
  SELECT
    ue.engagement_level,
    (COUNT(*) FILTER (WHERE ue.last_activity >= end_date - INTERVAL '7 days')::NUMERIC / 
     NULLIF(COUNT(*) FILTER (WHERE ue.first_activity <= start_date + INTERVAL '7 days'), 0)) * 100 AS retention_rate
  FROM
    user_engagement ue
  GROUP BY
    ue.engagement_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get activity metrics
CREATE OR REPLACE FUNCTION get_activity_metrics(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  avg_session_duration NUMERIC,
  sessions_per_user NUMERIC
) AS $$
BEGIN
  -- This is a simplified version. In a real implementation, you would need session tracking
  RETURN QUERY
  SELECT
    30.0 AS avg_session_duration, -- Placeholder value in minutes
    (COUNT(*)::NUMERIC / NULLIF(COUNT(DISTINCT user_id), 0)) AS sessions_per_user
  FROM
    gamification_activities
  WHERE
    created_at BETWEEN start_date AND end_date AND
    action = 'login';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get activity by engagement level
CREATE OR REPLACE FUNCTION get_activity_by_engagement_level(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  engagement_level TEXT,
  avg_sessions NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_engagement AS (
    SELECT
      ga.user_id,
      CASE
        WHEN COUNT(*) > 100 AND COUNT(DISTINCT DATE(ga.created_at)) > 30 THEN 'power_user'
        WHEN COUNT(*) > 50 AND COUNT(DISTINCT DATE(ga.created_at)) > 14 THEN 'highly_engaged'
        WHEN COUNT(*) > 20 AND COUNT(DISTINCT DATE(ga.created_at)) > 7 THEN 'engaged'
        WHEN COUNT(*) > 0 THEN 'casual'
        ELSE 'inactive'
      END AS engagement_level,
      COUNT(*) FILTER (WHERE ga.action = 'login') AS login_count
    FROM
      gamification_activities ga
    WHERE
      ga.created_at BETWEEN start_date AND end_date
    GROUP BY
      ga.user_id
  )
  SELECT
    ue.engagement_level,
    AVG(ue.login_count)::NUMERIC AS avg_sessions
  FROM
    user_engagement ue
  GROUP BY
    ue.engagement_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get business metrics
CREATE OR REPLACE FUNCTION get_business_metrics(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  bookings_per_user NUMERIC,
  booking_value_per_user NUMERIC,
  referrals_per_user NUMERIC
) AS $$
BEGIN
  -- This is a simplified version. In a real implementation, you would join with actual booking tables
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM auth.users), 0) 
     FROM gamification_activities 
     WHERE action = 'service_book' AND created_at BETWEEN start_date AND end_date) AS bookings_per_user,
    (SELECT COALESCE(AVG(CAST(metadata->>'value' AS NUMERIC)), 0) 
     FROM gamification_activities 
     WHERE action = 'service_book' AND created_at BETWEEN start_date AND end_date) AS booking_value_per_user,
    (SELECT COUNT(*)::NUMERIC / NULLIF((SELECT COUNT(*) FROM auth.users), 0) 
     FROM gamification_activities 
     WHERE action = 'referral_signup' AND created_at BETWEEN start_date AND end_date) AS referrals_per_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get engagement comparison metrics
CREATE OR REPLACE FUNCTION get_engagement_comparison_metrics(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  engaged_retention NUMERIC,
  non_engaged_retention NUMERIC,
  retention_difference NUMERIC,
  engaged_bookings NUMERIC,
  non_engaged_bookings NUMERIC,
  bookings_difference NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH user_engagement AS (
    SELECT
      ga.user_id,
      CASE
        WHEN COUNT(*) > 20 AND COUNT(DISTINCT DATE(ga.created_at)) > 7 THEN true
        ELSE false
      END AS is_engaged,
      MIN(ga.created_at) AS first_activity,
      MAX(ga.created_at) AS last_activity,
      COUNT(*) FILTER (WHERE ga.action = 'service_book') AS booking_count
    FROM
      gamification_activities ga
    WHERE
      ga.created_at BETWEEN start_date AND end_date
    GROUP BY
      ga.user_id
  ),
  retention_stats AS (
    SELECT
      is_engaged,
      (COUNT(*) FILTER (WHERE last_activity >= end_date - INTERVAL '7 days')::NUMERIC / 
       NULLIF(COUNT(*) FILTER (WHERE first_activity <= start_date + INTERVAL '7 days'), 0)) * 100 AS retention_rate,
      AVG(booking_count)::NUMERIC AS avg_bookings
    FROM
      user_engagement
    GROUP BY
      is_engaged
  )
  SELECT
    (SELECT retention_rate FROM retention_stats WHERE is_engaged = true) AS engaged_retention,
    (SELECT retention_rate FROM retention_stats WHERE is_engaged = false) AS non_engaged_retention,
    (SELECT retention_rate FROM retention_stats WHERE is_engaged = true) - 
    (SELECT retention_rate FROM retention_stats WHERE is_engaged = false) AS retention_difference,
    (SELECT avg_bookings FROM retention_stats WHERE is_engaged = true) AS engaged_bookings,
    (SELECT avg_bookings FROM retention_stats WHERE is_engaged = false) AS non_engaged_bookings,
    (SELECT avg_bookings FROM retention_stats WHERE is_engaged = true) - 
    (SELECT avg_bookings FROM retention_stats WHERE is_engaged = false) AS bookings_difference;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user engagement metrics
CREATE OR REPLACE FUNCTION get_user_engagement_metrics(
  user_id UUID
)
RETURNS TABLE (
  total_points BIGINT,
  challenges_completed BIGINT,
  events_participated BIGINT,
  daily_tasks_completed BIGINT,
  current_login_streak INTEGER,
  longest_login_streak INTEGER,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  days_active BIGINT,
  avg_sessions_per_week NUMERIC,
  team_participation BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE((SELECT SUM(points) FROM user_points WHERE user_points.user_id = get_user_engagement_metrics.user_id), 0) AS total_points,
    COALESCE((SELECT COUNT(*) FROM user_challenges WHERE user_challenges.user_id = get_user_engagement_metrics.user_id AND is_completed = true), 0) AS challenges_completed,
    COALESCE((SELECT COUNT(*) FROM user_event_participations WHERE user_event_participations.user_id = get_user_engagement_metrics.user_id), 0) AS events_participated,
    COALESCE((SELECT COUNT(*) FROM user_daily_tasks WHERE user_daily_tasks.user_id = get_user_engagement_metrics.user_id AND is_completed = true), 0) AS daily_tasks_completed,
    COALESCE((SELECT current_count FROM streaks WHERE streaks.user_id = get_user_engagement_metrics.user_id AND type = 'login'), 0) AS current_login_streak,
    COALESCE((SELECT longest_count FROM streaks WHERE streaks.user_id = get_user_engagement_metrics.user_id AND type = 'login'), 0) AS longest_login_streak,
    COALESCE((SELECT MAX(created_at) FROM gamification_activities WHERE gamification_activities.user_id = get_user_engagement_metrics.user_id), NOW()) AS last_activity_date,
    COALESCE((SELECT COUNT(DISTINCT DATE(created_at)) FROM gamification_activities WHERE gamification_activities.user_id = get_user_engagement_metrics.user_id), 0) AS days_active,
    COALESCE((
      SELECT COUNT(*) FILTER (WHERE action = 'login')::NUMERIC / 
      NULLIF(EXTRACT(EPOCH FROM (MAX(created_at) - MIN(created_at))) / (60*60*24*7), 0)
      FROM gamification_activities 
      WHERE gamification_activities.user_id = get_user_engagement_metrics.user_id
    ), 0) AS avg_sessions_per_week,
    EXISTS(SELECT 1 FROM team_members WHERE team_members.user_id = get_user_engagement_metrics.user_id) AS team_participation;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user engagement distribution
CREATE OR REPLACE FUNCTION get_user_engagement_distribution(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  engagement_level TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_engagement AS (
    SELECT
      ga.user_id,
      CASE
        WHEN COUNT(*) > 100 AND COUNT(DISTINCT DATE(ga.created_at)) > 30 THEN 'power_user'
        WHEN COUNT(*) > 50 AND COUNT(DISTINCT DATE(ga.created_at)) > 14 THEN 'highly_engaged'
        WHEN COUNT(*) > 20 AND COUNT(DISTINCT DATE(ga.created_at)) > 7 THEN 'engaged'
        WHEN COUNT(*) > 0 THEN 'casual'
        ELSE 'inactive'
      END AS engagement_level
    FROM
      gamification_activities ga
    WHERE
      ga.created_at BETWEEN start_date AND end_date
    GROUP BY
      ga.user_id
  ),
  all_users AS (
    SELECT
      id AS user_id,
      'inactive' AS engagement_level
    FROM
      auth.users
    WHERE
      NOT EXISTS (
        SELECT 1 FROM gamification_activities 
        WHERE user_id = auth.users.id AND created_at BETWEEN start_date AND end_date
      )
    UNION ALL
    SELECT
      user_id,
      engagement_level
    FROM
      user_engagement
  )
  SELECT
    engagement_level,
    COUNT(*) AS count
  FROM
    all_users
  GROUP BY
    engagement_level;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get points over time
CREATE OR REPLACE FUNCTION get_points_over_time(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  time_interval TEXT
)
RETURNS TABLE (
  date TEXT,
  points BIGINT,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC(time_interval, created_at), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS date,
    SUM(points) AS points,
    source
  FROM
    user_points
  WHERE
    created_at BETWEEN start_date AND end_date
  GROUP BY
    DATE_TRUNC(time_interval, created_at),
    source
  ORDER BY
    DATE_TRUNC(time_interval, created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user engagement over time
CREATE OR REPLACE FUNCTION get_user_engagement_over_time(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  time_interval TEXT
)
RETURNS TABLE (
  date TEXT,
  active_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(DATE_TRUNC(time_interval, created_at), 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS date,
    COUNT(DISTINCT user_id) AS active_users
  FROM
    gamification_activities
  WHERE
    created_at BETWEEN start_date AND end_date
  GROUP BY
    DATE_TRUNC(time_interval, created_at)
  ORDER BY
    DATE_TRUNC(time_interval, created_at);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get retention over time
CREATE OR REPLACE FUNCTION get_retention_over_time(
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  time_interval TEXT
)
RETURNS TABLE (
  date TEXT,
  retention_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH time_periods AS (
    SELECT
      DATE_TRUNC(time_interval, d) AS period_start,
      DATE_TRUNC(time_interval, d) + ('1 ' || time_interval)::INTERVAL AS period_end
    FROM
      generate_series(start_date, end_date, ('1 ' || time_interval)::INTERVAL) d
  ),
  period_retention AS (
    SELECT
      tp.period_start,
      (COUNT(DISTINCT ga2.user_id)::NUMERIC / NULLIF(COUNT(DISTINCT ga1.user_id), 0)) * 100 AS retention_rate
    FROM
      time_periods tp
    LEFT JOIN
      gamification_activities ga1 ON DATE_TRUNC(time_interval, ga1.created_at) = tp.period_start
    LEFT JOIN
      gamification_activities ga2 ON ga2.user_id = ga1.user_id AND 
                                    DATE_TRUNC(time_interval, ga2.created_at) = tp.period_start + ('1 ' || time_interval)::INTERVAL
    GROUP BY
      tp.period_start
  )
  SELECT
    TO_CHAR(period_start, 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS date,
    retention_rate
  FROM
    period_retention
  ORDER BY
    period_start;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
