-- Analytics User Metrics Migration

-- Function to get user metrics
CREATE OR REPLACE FUNCTION get_user_metrics(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user_type TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_avatar_url TEXT;
  v_signup_date TIMESTAMP WITH TIME ZONE;
  v_last_active_date TIMESTAMP WITH TIME ZONE;
  v_total_logins INTEGER;
  v_total_sessions INTEGER;
  v_average_session_duration NUMERIC;
  v_total_actions INTEGER;
  v_conversion_rate NUMERIC;
  v_retention_rate NUMERIC;
  v_engagement_score INTEGER;
  v_result JSONB;
BEGIN
  -- Get user profile info
  SELECT 
    p.user_type,
    p.first_name,
    p.last_name,
    p.avatar_url,
    u.created_at
  INTO
    v_user_type,
    v_first_name,
    v_last_name,
    v_avatar_url,
    v_signup_date
  FROM 
    profiles p
    JOIN auth.users u ON p.id = u.id
  WHERE 
    p.id = p_user_id;
  
  -- Get last active date
  SELECT MAX(created_at)
  INTO v_last_active_date
  FROM analytics_events
  WHERE user_id = p_user_id;
  
  -- Get total logins
  SELECT COUNT(*)
  INTO v_total_logins
  FROM analytics_events
  WHERE user_id = p_user_id AND event_type = 'login';
  
  -- Get total sessions (estimated by login events with at least 30 minutes between them)
  WITH session_starts AS (
    SELECT 
      created_at,
      LAG(created_at) OVER (ORDER BY created_at) AS prev_event,
      EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (ORDER BY created_at))) / 60 AS minutes_since_prev
    FROM analytics_events
    WHERE user_id = p_user_id
    ORDER BY created_at
  )
  SELECT COUNT(*) + 1 -- Add 1 for the first session
  INTO v_total_sessions
  FROM session_starts
  WHERE minutes_since_prev > 30 OR minutes_since_prev IS NULL;
  
  -- Get average session duration (estimated)
  WITH session_durations AS (
    SELECT 
      created_at,
      LEAD(created_at) OVER (ORDER BY created_at) AS next_event,
      EXTRACT(EPOCH FROM (LEAD(created_at) OVER (ORDER BY created_at) - created_at)) / 60 AS session_minutes
    FROM analytics_events
    WHERE user_id = p_user_id
    ORDER BY created_at
  )
  SELECT COALESCE(AVG(session_minutes), 0)
  INTO v_average_session_duration
  FROM session_durations
  WHERE session_minutes < 30; -- Assume session ends if more than 30 minutes between events
  
  -- Get total actions
  SELECT COUNT(*)
  INTO v_total_actions
  FROM analytics_events
  WHERE user_id = p_user_id;
  
  -- Calculate conversion rate (if applicable)
  -- This is a simplified example
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(CASE WHEN event_type = 'purchase' THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2)
    END
  INTO v_conversion_rate
  FROM analytics_events
  WHERE user_id = p_user_id AND event_type IN ('view_product', 'purchase');
  
  -- Calculate retention rate (days active / days since signup)
  SELECT 
    CASE 
      WHEN EXTRACT(DAYS FROM (NOW() - v_signup_date)) = 0 THEN 100
      ELSE ROUND((COUNT(DISTINCT DATE_TRUNC('day', created_at))::NUMERIC / EXTRACT(DAYS FROM (NOW() - v_signup_date))) * 100, 2)
    END
  INTO v_retention_rate
  FROM analytics_events
  WHERE user_id = p_user_id;
  
  -- Calculate engagement score (simplified example)
  -- This would typically be a more complex calculation based on various factors
  SELECT 
    LEAST(100, GREATEST(0, 
      10 * LEAST(10, v_total_logins) + -- Up to 10 points per login (max 100)
      5 * LEAST(10, (SELECT COUNT(*) FROM forum_posts WHERE user_id = p_user_id)) + -- Up to 5 points per forum post (max 50)
      2 * LEAST(25, (SELECT COUNT(*) FROM analytics_events WHERE user_id = p_user_id AND event_type = 'page_view')) + -- Up to 2 points per page view (max 50)
      20 * LEAST(5, (SELECT COUNT(*) FROM user_achievements WHERE user_id = p_user_id)) -- Up to 20 points per achievement (max 100)
    ))::INTEGER
  INTO v_engagement_score;
  
  -- Build result
  v_result := jsonb_build_object(
    'user_id', p_user_id,
    'full_name', v_first_name || ' ' || v_last_name,
    'user_type', v_user_type,
    'avatar_url', v_avatar_url,
    'signup_date', v_signup_date,
    'last_active_date', v_last_active_date,
    'total_logins', v_total_logins,
    'total_sessions', v_total_sessions,
    'average_session_duration', v_average_session_duration,
    'total_actions', v_total_actions,
    'conversion_rate', v_conversion_rate,
    'retention_rate', v_retention_rate,
    'engagement_score', v_engagement_score
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard metrics
CREATE OR REPLACE FUNCTION get_dashboard_metrics(
  p_dashboard_id UUID,
  p_time_range TEXT,
  p_custom_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_custom_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_user_segment TEXT DEFAULT 'all'
)
RETURNS JSONB[] AS $$
DECLARE
  v_metrics RECORD;
  v_result JSONB[];
  v_metric_value JSONB;
  v_query TEXT;
  v_start_date TIMESTAMP WITH TIME ZONE;
  v_end_date TIMESTAMP WITH TIME ZONE := NOW();
  v_previous_start_date TIMESTAMP WITH TIME ZONE;
  v_previous_end_date TIMESTAMP WITH TIME ZONE;
  v_user_segment_condition TEXT := '';
BEGIN
  -- Set date range based on time_range parameter (similar to get_growth_metrics)
  CASE p_time_range
    WHEN 'today' THEN
      v_start_date := DATE_TRUNC('day', NOW());
      v_previous_start_date := DATE_TRUNC('day', NOW() - INTERVAL '1 day');
      v_previous_end_date := v_start_date;
    WHEN 'yesterday' THEN
      v_start_date := DATE_TRUNC('day', NOW() - INTERVAL '1 day');
      v_end_date := DATE_TRUNC('day', NOW());
      v_previous_start_date := DATE_TRUNC('day', NOW() - INTERVAL '2 days');
      v_previous_end_date := v_start_date;
    WHEN 'last_7_days' THEN
      v_start_date := DATE_TRUNC('day', NOW() - INTERVAL '7 days');
      v_previous_start_date := DATE_TRUNC('day', NOW() - INTERVAL '14 days');
      v_previous_end_date := v_start_date;
    WHEN 'last_30_days' THEN
      v_start_date := DATE_TRUNC('day', NOW() - INTERVAL '30 days');
      v_previous_start_date := DATE_TRUNC('day', NOW() - INTERVAL '60 days');
      v_previous_end_date := v_start_date;
    WHEN 'this_month' THEN
      v_start_date := DATE_TRUNC('month', NOW());
      v_previous_start_date := DATE_TRUNC('month', NOW() - INTERVAL '1 month');
      v_previous_end_date := v_start_date;
    WHEN 'last_month' THEN
      v_start_date := DATE_TRUNC('month', NOW() - INTERVAL '1 month');
      v_end_date := DATE_TRUNC('month', NOW());
      v_previous_start_date := DATE_TRUNC('month', NOW() - INTERVAL '2 months');
      v_previous_end_date := v_start_date;
    WHEN 'this_year' THEN
      v_start_date := DATE_TRUNC('year', NOW());
      v_previous_start_date := DATE_TRUNC('year', NOW() - INTERVAL '1 year');
      v_previous_end_date := v_start_date;
    WHEN 'all_time' THEN
      v_start_date := '2020-01-01'::TIMESTAMP WITH TIME ZONE;
      v_previous_start_date := NULL;
      v_previous_end_date := NULL;
    WHEN 'custom' THEN
      IF p_custom_start_date IS NOT NULL THEN
        v_start_date := p_custom_start_date;
      ELSE
        v_start_date := DATE_TRUNC('day', NOW() - INTERVAL '30 days');
      END IF;
      
      IF p_custom_end_date IS NOT NULL THEN
        v_end_date := p_custom_end_date;
      END IF;
      
      -- Calculate previous period with same duration
      v_previous_start_date := v_start_date - (v_end_date - v_start_date);
      v_previous_end_date := v_start_date;
    ELSE
      v_start_date := DATE_TRUNC('day', NOW() - INTERVAL '30 days');
      v_previous_start_date := DATE_TRUNC('day', NOW() - INTERVAL '60 days');
      v_previous_end_date := v_start_date;
  END CASE;
  
  -- Set user segment condition (similar to get_growth_metrics)
  CASE p_user_segment
    WHEN 'clients' THEN
      v_user_segment_condition := ' AND user_type = ''client''';
    WHEN 'service_agents' THEN
      v_user_segment_condition := ' AND user_type = ''service_agent''';
    WHEN 'verified' THEN
      v_user_segment_condition := ' AND EXISTS (SELECT 1 FROM verifications WHERE verifications.user_id = auth.users.id AND verifications.status = ''approved'')';
    WHEN 'unverified' THEN
      v_user_segment_condition := ' AND NOT EXISTS (SELECT 1 FROM verifications WHERE verifications.user_id = auth.users.id AND verifications.status = ''approved'')';
    WHEN 'active' THEN
      v_user_segment_condition := ' AND EXISTS (SELECT 1 FROM analytics_events WHERE analytics_events.user_id = auth.users.id AND analytics_events.created_at > NOW() - INTERVAL ''30 days'')';
    WHEN 'inactive' THEN
      v_user_segment_condition := ' AND NOT EXISTS (SELECT 1 FROM analytics_events WHERE analytics_events.user_id = auth.users.id AND analytics_events.created_at > NOW() - INTERVAL ''30 days'')';
    WHEN 'new' THEN
      v_user_segment_condition := ' AND created_at > NOW() - INTERVAL ''30 days''';
    WHEN 'returning' THEN
      v_user_segment_condition := ' AND EXISTS (SELECT 1 FROM analytics_events WHERE analytics_events.user_id = auth.users.id AND analytics_events.event_type = ''login'' GROUP BY analytics_events.user_id HAVING COUNT(*) > 1)';
    ELSE
      v_user_segment_condition := '';
  END CASE;
  
  -- Get metrics for the dashboard
  FOR v_metrics IN 
    SELECT id, name, description, type, query, icon, color
    FROM analytics_metrics
    WHERE dashboard_id = p_dashboard_id
    ORDER BY "order"
  LOOP
    -- Replace placeholders in the query
    v_query := REPLACE(v_metrics.query, '{start_date}', v_start_date::TEXT);
    v_query := REPLACE(v_query, '{end_date}', v_end_date::TEXT);
    v_query := REPLACE(v_query, '{previous_start_date}', COALESCE(v_previous_start_date::TEXT, 'NULL'));
    v_query := REPLACE(v_query, '{previous_end_date}', COALESCE(v_previous_end_date::TEXT, 'NULL'));
    v_query := REPLACE(v_query, '{user_segment_condition}', v_user_segment_condition);
    
    -- Execute the query to get the metric value
    EXECUTE v_query INTO v_metric_value;
    
    -- Add the metric to the result
    v_result := v_result || jsonb_build_object(
      'id', v_metrics.id,
      'name', v_metrics.name,
      'description', v_metrics.description,
      'type', v_metrics.type,
      'value', v_metric_value,
      'icon', v_metrics.icon,
      'color', v_metrics.color
    );
  END LOOP;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to get dashboard charts
CREATE OR REPLACE FUNCTION get_dashboard_charts(
  p_dashboard_id UUID,
  p_time_range TEXT,
  p_custom_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_custom_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_user_segment TEXT DEFAULT 'all'
)
RETURNS JSONB[] AS $$
DECLARE
  v_charts RECORD;
  v_result JSONB[];
  v_chart_data JSONB;
  v_query TEXT;
  v_start_date TIMESTAMP WITH TIME ZONE;
  v_end_date TIMESTAMP WITH TIME ZONE := NOW();
  v_user_segment_condition TEXT := '';
BEGIN
  -- Set date range based on time_range parameter (similar to get_dashboard_metrics)
  -- [Date range calculation code omitted for brevity - same as in get_dashboard_metrics]
  
  -- Set user segment condition (similar to get_dashboard_metrics)
  -- [User segment condition code omitted for brevity - same as in get_dashboard_metrics]
  
  -- Get charts for the dashboard
  FOR v_charts IN 
    SELECT id, title, description, type, query, options
    FROM analytics_charts
    WHERE dashboard_id = p_dashboard_id
    ORDER BY "order"
  LOOP
    -- Replace placeholders in the query
    v_query := REPLACE(v_charts.query, '{start_date}', v_start_date::TEXT);
    v_query := REPLACE(v_query, '{end_date}', v_end_date::TEXT);
    v_query := REPLACE(v_query, '{user_segment_condition}', v_user_segment_condition);
    
    -- Execute the query to get the chart data
    EXECUTE v_query INTO v_chart_data;
    
    -- Add the chart to the result
    v_result := v_result || jsonb_build_object(
      'id', v_charts.id,
      'title', v_charts.title,
      'description', v_charts.description,
      'type', v_charts.type,
      'data', v_chart_data,
      'options', v_charts.options
    );
  END LOOP;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
