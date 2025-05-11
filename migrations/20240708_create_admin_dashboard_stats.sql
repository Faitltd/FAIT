-- Create function to get admin dashboard statistics
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  user_counts JSON;
  booking_stats JSON;
  revenue_stats JSON;
  service_stats JSON;
  warranty_stats JSON;
BEGIN
  -- Get user counts by type and status
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'active_users', (SELECT COUNT(*) FROM public.profiles WHERE status = 'active'),
    'client_count', (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'client'),
    'service_agent_count', (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'service_agent'),
    'admin_count', (SELECT COUNT(*) FROM public.profiles WHERE user_type = 'admin'),
    'new_users_last_30_days', (
      SELECT COUNT(*) FROM public.profiles 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    )
  ) INTO user_counts;
  
  -- Get booking statistics
  SELECT json_build_object(
    'total_bookings', (SELECT COUNT(*) FROM public.bookings),
    'pending_bookings', (SELECT COUNT(*) FROM public.bookings WHERE status = 'pending'),
    'confirmed_bookings', (SELECT COUNT(*) FROM public.bookings WHERE status = 'confirmed'),
    'completed_bookings', (SELECT COUNT(*) FROM public.bookings WHERE status = 'completed'),
    'cancelled_bookings', (SELECT COUNT(*) FROM public.bookings WHERE status = 'cancelled'),
    'bookings_last_30_days', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE created_at >= NOW() - INTERVAL '30 days'
    ),
    'completion_rate', (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
        END
      FROM public.bookings
      WHERE status IN ('completed', 'cancelled')
    )
  ) INTO booking_stats;
  
  -- Get revenue statistics
  SELECT json_build_object(
    'total_revenue', (
      SELECT COALESCE(SUM(price), 0) 
      FROM public.bookings 
      WHERE status = 'completed'
    ),
    'revenue_last_30_days', (
      SELECT COALESCE(SUM(price), 0) 
      FROM public.bookings 
      WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '30 days'
    ),
    'average_booking_value', (
      SELECT COALESCE(AVG(price), 0) 
      FROM public.bookings 
      WHERE status = 'completed'
    ),
    'subscription_revenue', (
      SELECT COALESCE(SUM(amount), 0) 
      FROM public.subscriptions 
      WHERE status = 'active'
    ),
    'revenue_by_month', (
      SELECT json_agg(monthly_revenue)
      FROM (
        SELECT 
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
          COALESCE(SUM(price), 0) AS revenue
        FROM public.bookings
        WHERE status = 'completed' AND created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      ) AS monthly_revenue
    )
  ) INTO revenue_stats;
  
  -- Get service statistics
  SELECT json_build_object(
    'total_services', (SELECT COUNT(*) FROM public.services),
    'active_services', (SELECT COUNT(*) FROM public.services WHERE status = 'active'),
    'services_by_category', (
      SELECT json_agg(category_counts)
      FROM (
        SELECT 
          category,
          COUNT(*) AS count
        FROM public.services
        WHERE status = 'active'
        GROUP BY category
        ORDER BY COUNT(*) DESC
      ) AS category_counts
    ),
    'top_booked_services', (
      SELECT json_agg(top_services)
      FROM (
        SELECT 
          s.id,
          s.name,
          COUNT(b.id) AS booking_count
        FROM public.services s
        JOIN public.bookings b ON s.id = b.service_id
        WHERE b.status IN ('confirmed', 'completed')
        GROUP BY s.id, s.name
        ORDER BY COUNT(b.id) DESC
        LIMIT 10
      ) AS top_services
    ),
    'average_service_rating', (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.service_reviews
    )
  ) INTO service_stats;
  
  -- Get warranty statistics
  SELECT json_build_object(
    'total_warranties', (SELECT COUNT(*) FROM public.warranties),
    'active_warranties', (SELECT COUNT(*) FROM public.warranties WHERE status = 'active' AND end_date >= CURRENT_DATE),
    'expired_warranties', (SELECT COUNT(*) FROM public.warranties WHERE status = 'active' AND end_date < CURRENT_DATE),
    'total_claims', (SELECT COUNT(*) FROM public.warranty_claims),
    'pending_claims', (SELECT COUNT(*) FROM public.warranty_claims WHERE status = 'pending'),
    'resolved_claims', (SELECT COUNT(*) FROM public.warranty_claims WHERE status = 'resolved'),
    'rejected_claims', (SELECT COUNT(*) FROM public.warranty_claims WHERE status = 'rejected'),
    'claim_resolution_rate', (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE status = 'resolved')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
        END
      FROM public.warranty_claims
      WHERE status IN ('resolved', 'rejected')
    )
  ) INTO warranty_stats;
  
  -- Combine all statistics
  SELECT json_build_object(
    'user_stats', user_counts,
    'booking_stats', booking_stats,
    'revenue_stats', revenue_stats,
    'service_stats', service_stats,
    'warranty_stats', warranty_stats,
    'generated_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get service agent dashboard statistics
CREATE OR REPLACE FUNCTION public.get_service_agent_dashboard_stats(p_service_agent_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  booking_stats JSON;
  revenue_stats JSON;
  service_stats JSON;
  warranty_stats JSON;
BEGIN
  -- Get booking statistics
  SELECT json_build_object(
    'total_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id
    ),
    'pending_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id AND status = 'pending'
    ),
    'confirmed_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id AND status = 'confirmed'
    ),
    'completed_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id AND status = 'completed'
    ),
    'cancelled_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id AND status = 'cancelled'
    ),
    'bookings_last_30_days', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id AND created_at >= NOW() - INTERVAL '30 days'
    ),
    'completion_rate', (
      SELECT 
        CASE 
          WHEN COUNT(*) = 0 THEN 0
          ELSE ROUND((COUNT(*) FILTER (WHERE status = 'completed')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
        END
      FROM public.bookings
      WHERE service_agent_id = p_service_agent_id AND status IN ('completed', 'cancelled')
    ),
    'upcoming_bookings', (
      SELECT json_agg(upcoming)
      FROM (
        SELECT 
          b.id,
          b.service_date,
          b.start_time,
          b.end_time,
          b.status,
          s.name AS service_name,
          p.first_name || ' ' || p.last_name AS client_name
        FROM public.bookings b
        JOIN public.services s ON b.service_id = s.id
        JOIN public.profiles p ON b.client_id = p.id
        WHERE b.service_agent_id = p_service_agent_id 
          AND b.status IN ('confirmed', 'pending')
          AND b.service_date >= CURRENT_DATE
        ORDER BY b.service_date, b.start_time
        LIMIT 5
      ) AS upcoming
    )
  ) INTO booking_stats;
  
  -- Get revenue statistics
  SELECT json_build_object(
    'total_revenue', (
      SELECT COALESCE(SUM(price), 0) 
      FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id AND status = 'completed'
    ),
    'revenue_last_30_days', (
      SELECT COALESCE(SUM(price), 0) 
      FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id AND status = 'completed' 
        AND created_at >= NOW() - INTERVAL '30 days'
    ),
    'average_booking_value', (
      SELECT COALESCE(AVG(price), 0) 
      FROM public.bookings 
      WHERE service_agent_id = p_service_agent_id AND status = 'completed'
    ),
    'revenue_by_month', (
      SELECT json_agg(monthly_revenue)
      FROM (
        SELECT 
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
          COALESCE(SUM(price), 0) AS revenue
        FROM public.bookings
        WHERE service_agent_id = p_service_agent_id AND status = 'completed' 
          AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      ) AS monthly_revenue
    )
  ) INTO revenue_stats;
  
  -- Get service statistics
  SELECT json_build_object(
    'total_services', (
      SELECT COUNT(*) FROM public.services 
      WHERE service_agent_id = p_service_agent_id
    ),
    'active_services', (
      SELECT COUNT(*) FROM public.services 
      WHERE service_agent_id = p_service_agent_id AND status = 'active'
    ),
    'services_by_category', (
      SELECT json_agg(category_counts)
      FROM (
        SELECT 
          category,
          COUNT(*) AS count
        FROM public.services
        WHERE service_agent_id = p_service_agent_id AND status = 'active'
        GROUP BY category
        ORDER BY COUNT(*) DESC
      ) AS category_counts
    ),
    'top_booked_services', (
      SELECT json_agg(top_services)
      FROM (
        SELECT 
          s.id,
          s.name,
          COUNT(b.id) AS booking_count
        FROM public.services s
        JOIN public.bookings b ON s.id = b.service_id
        WHERE s.service_agent_id = p_service_agent_id AND b.status IN ('confirmed', 'completed')
        GROUP BY s.id, s.name
        ORDER BY COUNT(b.id) DESC
        LIMIT 5
      ) AS top_services
    ),
    'average_service_rating', (
      SELECT COALESCE(AVG(sr.rating), 0)
      FROM public.service_reviews sr
      JOIN public.services s ON sr.service_id = s.id
      WHERE s.service_agent_id = p_service_agent_id
    )
  ) INTO service_stats;
  
  -- Get warranty statistics
  SELECT json_build_object(
    'total_warranties', (
      SELECT COUNT(*) FROM public.warranties 
      WHERE service_agent_id = p_service_agent_id
    ),
    'active_warranties', (
      SELECT COUNT(*) FROM public.warranties 
      WHERE service_agent_id = p_service_agent_id AND status = 'active' AND end_date >= CURRENT_DATE
    ),
    'expired_warranties', (
      SELECT COUNT(*) FROM public.warranties 
      WHERE service_agent_id = p_service_agent_id AND status = 'active' AND end_date < CURRENT_DATE
    ),
    'total_claims', (
      SELECT COUNT(*) FROM public.warranty_claims wc
      JOIN public.warranties w ON wc.warranty_id = w.id
      WHERE w.service_agent_id = p_service_agent_id
    ),
    'pending_claims', (
      SELECT COUNT(*) FROM public.warranty_claims wc
      JOIN public.warranties w ON wc.warranty_id = w.id
      WHERE w.service_agent_id = p_service_agent_id AND wc.status = 'pending'
    ),
    'recent_claims', (
      SELECT json_agg(recent_claims)
      FROM (
        SELECT 
          wc.id,
          wc.created_at,
          wc.status,
          wc.description,
          s.name AS service_name,
          p.first_name || ' ' || p.last_name AS client_name
        FROM public.warranty_claims wc
        JOIN public.warranties w ON wc.warranty_id = w.id
        JOIN public.services s ON w.service_id = s.id
        JOIN public.profiles p ON wc.client_id = p.id
        WHERE w.service_agent_id = p_service_agent_id
        ORDER BY wc.created_at DESC
        LIMIT 5
      ) AS recent_claims
    )
  ) INTO warranty_stats;
  
  -- Combine all statistics
  SELECT json_build_object(
    'booking_stats', booking_stats,
    'revenue_stats', revenue_stats,
    'service_stats', service_stats,
    'warranty_stats', warranty_stats,
    'generated_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get client dashboard statistics
CREATE OR REPLACE FUNCTION public.get_client_dashboard_stats(p_client_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
  booking_stats JSON;
  warranty_stats JSON;
BEGIN
  -- Get booking statistics
  SELECT json_build_object(
    'total_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE client_id = p_client_id
    ),
    'pending_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE client_id = p_client_id AND status = 'pending'
    ),
    'confirmed_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE client_id = p_client_id AND status = 'confirmed'
    ),
    'completed_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE client_id = p_client_id AND status = 'completed'
    ),
    'cancelled_bookings', (
      SELECT COUNT(*) FROM public.bookings 
      WHERE client_id = p_client_id AND status = 'cancelled'
    ),
    'upcoming_bookings', (
      SELECT json_agg(upcoming)
      FROM (
        SELECT 
          b.id,
          b.service_date,
          b.start_time,
          b.end_time,
          b.status,
          s.name AS service_name,
          p.first_name || ' ' || p.last_name AS service_agent_name
        FROM public.bookings b
        JOIN public.services s ON b.service_id = s.id
        JOIN public.profiles p ON b.service_agent_id = p.id
        WHERE b.client_id = p_client_id 
          AND b.status IN ('confirmed', 'pending')
          AND b.service_date >= CURRENT_DATE
        ORDER BY b.service_date, b.start_time
        LIMIT 5
      ) AS upcoming
    ),
    'recent_bookings', (
      SELECT json_agg(recent)
      FROM (
        SELECT 
          b.id,
          b.service_date,
          b.price,
          b.status,
          s.name AS service_name,
          p.first_name || ' ' || p.last_name AS service_agent_name
        FROM public.bookings b
        JOIN public.services s ON b.service_id = s.id
        JOIN public.profiles p ON b.service_agent_id = p.id
        WHERE b.client_id = p_client_id
        ORDER BY b.service_date DESC
        LIMIT 5
      ) AS recent
    ),
    'total_spent', (
      SELECT COALESCE(SUM(price), 0) 
      FROM public.bookings 
      WHERE client_id = p_client_id AND status = 'completed'
    )
  ) INTO booking_stats;
  
  -- Get warranty statistics
  SELECT json_build_object(
    'total_warranties', (
      SELECT COUNT(*) FROM public.warranties 
      WHERE client_id = p_client_id
    ),
    'active_warranties', (
      SELECT COUNT(*) FROM public.warranties 
      WHERE client_id = p_client_id AND status = 'active' AND end_date >= CURRENT_DATE
    ),
    'expired_warranties', (
      SELECT COUNT(*) FROM public.warranties 
      WHERE client_id = p_client_id AND status = 'active' AND end_date < CURRENT_DATE
    ),
    'total_claims', (
      SELECT COUNT(*) FROM public.warranty_claims 
      WHERE client_id = p_client_id
    ),
    'pending_claims', (
      SELECT COUNT(*) FROM public.warranty_claims 
      WHERE client_id = p_client_id AND status = 'pending'
    ),
    'active_warranties_list', (
      SELECT json_agg(active_warranties)
      FROM (
        SELECT 
          w.id,
          w.start_date,
          w.end_date,
          s.name AS service_name,
          p.first_name || ' ' || p.last_name AS service_agent_name,
          wt.name AS warranty_type
        FROM public.warranties w
        JOIN public.services s ON w.service_id = s.id
        JOIN public.profiles p ON w.service_agent_id = p.id
        JOIN public.warranty_types wt ON w.warranty_type_id = wt.id
        WHERE w.client_id = p_client_id AND w.status = 'active' AND w.end_date >= CURRENT_DATE
        ORDER BY w.end_date
        LIMIT 5
      ) AS active_warranties
    )
  ) INTO warranty_stats;
  
  -- Combine all statistics
  SELECT json_build_object(
    'booking_stats', booking_stats,
    'warranty_stats', warranty_stats,
    'subscription_plan', (
      SELECT subscription_plan FROM public.profiles WHERE id = p_client_id
    ),
    'generated_at', NOW()
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
