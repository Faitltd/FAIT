-- Analytics System Functions Migration

-- Function to get user A/B test variant
CREATE OR REPLACE FUNCTION get_user_ab_test_variant(p_user_id UUID, p_test_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_variant_id TEXT;
  v_test_status TEXT;
  v_variants JSONB;
  v_variant JSONB;
  v_total_weight INTEGER := 0;
  v_random_number INTEGER;
  v_current_weight INTEGER := 0;
BEGIN
  -- Check if test exists and is running
  SELECT status, variants INTO v_test_status, v_variants
  FROM analytics_ab_tests
  WHERE id = p_test_id;
  
  IF v_test_status IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF v_test_status != 'running' THEN
    RETURN NULL;
  END IF;
  
  -- Check if user is already assigned to a variant
  SELECT variant_id INTO v_variant_id
  FROM analytics_ab_test_assignments
  WHERE test_id = p_test_id AND user_id = p_user_id;
  
  IF v_variant_id IS NOT NULL THEN
    RETURN v_variant_id;
  END IF;
  
  -- Assign user to a variant based on allocation percentages
  -- Calculate total weight
  FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
  LOOP
    v_total_weight := v_total_weight + (v_variant->>'allocation_percentage')::INTEGER;
  END LOOP;
  
  -- Generate random number between 1 and total weight
  v_random_number := floor(random() * v_total_weight) + 1;
  
  -- Find the variant based on the random number
  FOR v_variant IN SELECT * FROM jsonb_array_elements(v_variants)
  LOOP
    v_current_weight := v_current_weight + (v_variant->>'allocation_percentage')::INTEGER;
    IF v_random_number <= v_current_weight THEN
      v_variant_id := v_variant->>'id';
      EXIT;
    END IF;
  END LOOP;
  
  -- Insert the assignment
  INSERT INTO analytics_ab_test_assignments (test_id, user_id, variant_id)
  VALUES (p_test_id, p_user_id, v_variant_id);
  
  RETURN v_variant_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get growth metrics
CREATE OR REPLACE FUNCTION get_growth_metrics(
  p_time_range TEXT,
  p_custom_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_custom_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_user_segment TEXT DEFAULT 'all'
)
RETURNS JSONB AS $$
DECLARE
  v_start_date TIMESTAMP WITH TIME ZONE;
  v_end_date TIMESTAMP WITH TIME ZONE := NOW();
  v_previous_start_date TIMESTAMP WITH TIME ZONE;
  v_previous_end_date TIMESTAMP WITH TIME ZONE;
  v_new_users INTEGER;
  v_previous_new_users INTEGER;
  v_active_users INTEGER;
  v_previous_active_users INTEGER;
  v_user_retention NUMERIC;
  v_previous_user_retention NUMERIC;
  v_referrals INTEGER;
  v_previous_referrals INTEGER;
  v_conversion_rate NUMERIC;
  v_previous_conversion_rate NUMERIC;
  v_verification_rate NUMERIC;
  v_previous_verification_rate NUMERIC;
  v_forum_activity INTEGER;
  v_previous_forum_activity INTEGER;
  v_points_awarded INTEGER;
  v_previous_points_awarded INTEGER;
  v_achievements_unlocked INTEGER;
  v_previous_achievements_unlocked INTEGER;
  v_user_segment_condition TEXT := '';
  v_result JSONB;
BEGIN
  -- Set date range based on time_range parameter
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
  
  -- Set user segment condition
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
  
  -- Get new users
  EXECUTE 'SELECT COUNT(*) FROM auth.users WHERE created_at BETWEEN $1 AND $2' || v_user_segment_condition
  INTO v_new_users
  USING v_start_date, v_end_date;
  
  -- Get previous period new users
  IF v_previous_start_date IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(*) FROM auth.users WHERE created_at BETWEEN $1 AND $2' || v_user_segment_condition
    INTO v_previous_new_users
    USING v_previous_start_date, v_previous_end_date;
  ELSE
    v_previous_new_users := 0;
  END IF;
  
  -- Get active users (users with events in the period)
  EXECUTE 'SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at BETWEEN $1 AND $2 AND user_id IS NOT NULL'
  INTO v_active_users
  USING v_start_date, v_end_date;
  
  -- Get previous period active users
  IF v_previous_start_date IS NOT NULL THEN
    EXECUTE 'SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at BETWEEN $1 AND $2 AND user_id IS NOT NULL'
    INTO v_previous_active_users
    USING v_previous_start_date, v_previous_end_date;
  ELSE
    v_previous_active_users := 0;
  END IF;
  
  -- Get user retention (percentage of users who returned after first visit)
  -- This is a simplified calculation
  SELECT 
    CASE 
      WHEN COUNT(DISTINCT u.id) = 0 THEN 0
      ELSE ROUND((COUNT(DISTINCT e.user_id)::NUMERIC / COUNT(DISTINCT u.id)) * 100, 2)
    END
  INTO v_user_retention
  FROM auth.users u
  LEFT JOIN analytics_events e ON u.id = e.user_id AND e.created_at > u.created_at + INTERVAL '1 day' AND e.created_at BETWEEN v_start_date AND v_end_date
  WHERE u.created_at BETWEEN v_start_date - INTERVAL '90 days' AND v_end_date - INTERVAL '1 day';
  
  -- Get previous period user retention
  IF v_previous_start_date IS NOT NULL THEN
    SELECT 
      CASE 
        WHEN COUNT(DISTINCT u.id) = 0 THEN 0
        ELSE ROUND((COUNT(DISTINCT e.user_id)::NUMERIC / COUNT(DISTINCT u.id)) * 100, 2)
      END
    INTO v_previous_user_retention
    FROM auth.users u
    LEFT JOIN analytics_events e ON u.id = e.user_id AND e.created_at > u.created_at + INTERVAL '1 day' AND e.created_at BETWEEN v_previous_start_date AND v_previous_end_date
    WHERE u.created_at BETWEEN v_previous_start_date - INTERVAL '90 days' AND v_previous_end_date - INTERVAL '1 day';
  ELSE
    v_previous_user_retention := 0;
  END IF;
  
  -- Get referrals (users who signed up with a referral code)
  SELECT COUNT(*)
  INTO v_referrals
  FROM analytics_events
  WHERE event_type = 'referral_signup' AND created_at BETWEEN v_start_date AND v_end_date;
  
  -- Get previous period referrals
  IF v_previous_start_date IS NOT NULL THEN
    SELECT COUNT(*)
    INTO v_previous_referrals
    FROM analytics_events
    WHERE event_type = 'referral_signup' AND created_at BETWEEN v_previous_start_date AND v_previous_end_date;
  ELSE
    v_previous_referrals := 0;
  END IF;
  
  -- Get conversion rate (percentage of visitors who register)
  -- This is a simplified calculation
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(DISTINCT user_id)::NUMERIC / COUNT(*)) * 100, 2)
    END
  INTO v_conversion_rate
  FROM analytics_events
  WHERE event_type IN ('page_view', 'signup') AND created_at BETWEEN v_start_date AND v_end_date;
  
  -- Get previous period conversion rate
  IF v_previous_start_date IS NOT NULL THEN
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(DISTINCT user_id)::NUMERIC / COUNT(*)) * 100, 2)
      END
    INTO v_previous_conversion_rate
    FROM analytics_events
    WHERE event_type IN ('page_view', 'signup') AND created_at BETWEEN v_previous_start_date AND v_previous_end_date;
  ELSE
    v_previous_conversion_rate := 0;
  END IF;
  
  -- Get verification rate (percentage of service agents who complete verification)
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(CASE WHEN status = 'approved' THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2)
    END
  INTO v_verification_rate
  FROM verifications
  WHERE created_at BETWEEN v_start_date AND v_end_date;
  
  -- Get previous period verification rate
  IF v_previous_start_date IS NOT NULL THEN
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 0
        ELSE ROUND((COUNT(CASE WHEN status = 'approved' THEN 1 END)::NUMERIC / COUNT(*)) * 100, 2)
      END
    INTO v_previous_verification_rate
    FROM verifications
    WHERE created_at BETWEEN v_previous_start_date AND v_previous_end_date;
  ELSE
    v_previous_verification_rate := 0;
  END IF;
  
  -- Get forum activity (number of posts and threads)
  SELECT 
    (SELECT COUNT(*) FROM forum_posts WHERE created_at BETWEEN v_start_date AND v_end_date) +
    (SELECT COUNT(*) FROM forum_threads WHERE created_at BETWEEN v_start_date AND v_end_date)
  INTO v_forum_activity;
  
  -- Get previous period forum activity
  IF v_previous_start_date IS NOT NULL THEN
    SELECT 
      (SELECT COUNT(*) FROM forum_posts WHERE created_at BETWEEN v_previous_start_date AND v_previous_end_date) +
      (SELECT COUNT(*) FROM forum_threads WHERE created_at BETWEEN v_previous_start_date AND v_previous_end_date)
    INTO v_previous_forum_activity;
  ELSE
    v_previous_forum_activity := 0;
  END IF;
  
  -- Get points awarded
  SELECT COALESCE(SUM(points), 0)
  INTO v_points_awarded
  FROM user_points
  WHERE created_at BETWEEN v_start_date AND v_end_date;
  
  -- Get previous period points awarded
  IF v_previous_start_date IS NOT NULL THEN
    SELECT COALESCE(SUM(points), 0)
    INTO v_previous_points_awarded
    FROM user_points
    WHERE created_at BETWEEN v_previous_start_date AND v_previous_end_date;
  ELSE
    v_previous_points_awarded := 0;
  END IF;
  
  -- Get achievements unlocked
  SELECT COUNT(*)
  INTO v_achievements_unlocked
  FROM user_achievements
  WHERE created_at BETWEEN v_start_date AND v_end_date;
  
  -- Get previous period achievements unlocked
  IF v_previous_start_date IS NOT NULL THEN
    SELECT COUNT(*)
    INTO v_previous_achievements_unlocked
    FROM user_achievements
    WHERE created_at BETWEEN v_previous_start_date AND v_previous_end_date;
  ELSE
    v_previous_achievements_unlocked := 0;
  END IF;
  
  -- Calculate changes
  v_result := jsonb_build_object(
    'new_users', jsonb_build_object(
      'value', v_new_users,
      'previous_value', v_previous_new_users,
      'change', v_new_users - v_previous_new_users,
      'change_percentage', CASE WHEN v_previous_new_users = 0 THEN 0 ELSE ROUND(((v_new_users - v_previous_new_users)::NUMERIC / v_previous_new_users) * 100, 2) END
    ),
    'active_users', jsonb_build_object(
      'value', v_active_users,
      'previous_value', v_previous_active_users,
      'change', v_active_users - v_previous_active_users,
      'change_percentage', CASE WHEN v_previous_active_users = 0 THEN 0 ELSE ROUND(((v_active_users - v_previous_active_users)::NUMERIC / v_previous_active_users) * 100, 2) END
    ),
    'user_retention', jsonb_build_object(
      'value', v_user_retention,
      'previous_value', v_previous_user_retention,
      'change', v_user_retention - v_previous_user_retention,
      'change_percentage', CASE WHEN v_previous_user_retention = 0 THEN 0 ELSE ROUND(((v_user_retention - v_previous_user_retention)::NUMERIC / v_previous_user_retention) * 100, 2) END
    ),
    'referrals', jsonb_build_object(
      'value', v_referrals,
      'previous_value', v_previous_referrals,
      'change', v_referrals - v_previous_referrals,
      'change_percentage', CASE WHEN v_previous_referrals = 0 THEN 0 ELSE ROUND(((v_referrals - v_previous_referrals)::NUMERIC / v_previous_referrals) * 100, 2) END
    ),
    'conversion_rate', jsonb_build_object(
      'value', v_conversion_rate,
      'previous_value', v_previous_conversion_rate,
      'change', v_conversion_rate - v_previous_conversion_rate,
      'change_percentage', CASE WHEN v_previous_conversion_rate = 0 THEN 0 ELSE ROUND(((v_conversion_rate - v_previous_conversion_rate)::NUMERIC / v_previous_conversion_rate) * 100, 2) END
    ),
    'verification_rate', jsonb_build_object(
      'value', v_verification_rate,
      'previous_value', v_previous_verification_rate,
      'change', v_verification_rate - v_previous_verification_rate,
      'change_percentage', CASE WHEN v_previous_verification_rate = 0 THEN 0 ELSE ROUND(((v_verification_rate - v_previous_verification_rate)::NUMERIC / v_previous_verification_rate) * 100, 2) END
    ),
    'forum_activity', jsonb_build_object(
      'value', v_forum_activity,
      'previous_value', v_previous_forum_activity,
      'change', v_forum_activity - v_previous_forum_activity,
      'change_percentage', CASE WHEN v_previous_forum_activity = 0 THEN 0 ELSE ROUND(((v_forum_activity - v_previous_forum_activity)::NUMERIC / v_previous_forum_activity) * 100, 2) END
    ),
    'points_awarded', jsonb_build_object(
      'value', v_points_awarded,
      'previous_value', v_previous_points_awarded,
      'change', v_points_awarded - v_previous_points_awarded,
      'change_percentage', CASE WHEN v_previous_points_awarded = 0 THEN 0 ELSE ROUND(((v_points_awarded - v_previous_points_awarded)::NUMERIC / v_previous_points_awarded) * 100, 2) END
    ),
    'achievements_unlocked', jsonb_build_object(
      'value', v_achievements_unlocked,
      'previous_value', v_previous_achievements_unlocked,
      'change', v_achievements_unlocked - v_previous_achievements_unlocked,
      'change_percentage', CASE WHEN v_previous_achievements_unlocked = 0 THEN 0 ELSE ROUND(((v_achievements_unlocked - v_previous_achievements_unlocked)::NUMERIC / v_previous_achievements_unlocked) * 100, 2) END
    )
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;
