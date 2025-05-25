-- Create service_agent_verifications table
CREATE TABLE IF NOT EXISTS service_agent_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id UUID NOT NULL REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  documents JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewer_id UUID REFERENCES profiles(id),
  rejection_reason TEXT,
  
  CONSTRAINT service_agent_verifications_service_agent_id_key UNIQUE (service_agent_id)
);

-- Create user_activities table
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create account_deactivations table
CREATE TABLE IF NOT EXISTS account_deactivations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  reason TEXT,
  keep_data BOOLEAN NOT NULL DEFAULT TRUE,
  deactivated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reactivated_at TIMESTAMPTZ,
  
  CONSTRAINT account_deactivations_user_id_key UNIQUE (user_id)
);

-- Add columns to profiles table for verification and deactivation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_documents JSONB;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS verification_submitted BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS agreed_to_verification_terms BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deactivation_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMPTZ;

-- Create indexes
CREATE INDEX IF NOT EXISTS service_agent_verifications_service_agent_id_idx ON service_agent_verifications (service_agent_id);
CREATE INDEX IF NOT EXISTS service_agent_verifications_status_idx ON service_agent_verifications (status);
CREATE INDEX IF NOT EXISTS service_agent_verifications_submitted_at_idx ON service_agent_verifications (submitted_at);

CREATE INDEX IF NOT EXISTS user_activities_user_id_idx ON user_activities (user_id);
CREATE INDEX IF NOT EXISTS user_activities_activity_type_idx ON user_activities (activity_type);
CREATE INDEX IF NOT EXISTS user_activities_created_at_idx ON user_activities (created_at);

CREATE INDEX IF NOT EXISTS account_deactivations_user_id_idx ON account_deactivations (user_id);
CREATE INDEX IF NOT EXISTS account_deactivations_deactivated_at_idx ON account_deactivations (deactivated_at);

CREATE INDEX IF NOT EXISTS profiles_verified_idx ON profiles (verified);
CREATE INDEX IF NOT EXISTS profiles_active_idx ON profiles (active);
CREATE INDEX IF NOT EXISTS profiles_profile_completed_idx ON profiles (profile_completed);

-- Create function to get activity statistics
CREATE OR REPLACE FUNCTION get_activity_stats(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  WITH activity_counts AS (
    SELECT
      activity_type,
      COUNT(*) as count
    FROM
      user_activities
    WHERE
      created_at BETWEEN p_start_date AND p_end_date
      AND (p_user_id IS NULL OR user_id = p_user_id)
    GROUP BY
      activity_type
  ),
  daily_counts AS (
    SELECT
      DATE_TRUNC('day', created_at) as day,
      COUNT(*) as count
    FROM
      user_activities
    WHERE
      created_at BETWEEN p_start_date AND p_end_date
      AND (p_user_id IS NULL OR user_id = p_user_id)
    GROUP BY
      DATE_TRUNC('day', created_at)
    ORDER BY
      day
  )
  SELECT
    jsonb_build_object(
      'total_activities', (SELECT COUNT(*) FROM user_activities WHERE created_at BETWEEN p_start_date AND p_end_date AND (p_user_id IS NULL OR user_id = p_user_id)),
      'activity_types', (SELECT jsonb_object_agg(activity_type, count) FROM activity_counts),
      'daily_counts', (SELECT jsonb_agg(jsonb_build_object('date', day, 'count', count)) FROM daily_counts)
    ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE service_agent_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deactivations ENABLE ROW LEVEL SECURITY;

-- Service agent verification policies
CREATE POLICY service_agent_view_own_verification ON service_agent_verifications
  FOR SELECT
  TO authenticated
  USING (service_agent_id = auth.uid());

CREATE POLICY admin_manage_verifications ON service_agent_verifications
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- User activities policies
CREATE POLICY user_view_own_activities ON user_activities
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY admin_view_all_activities ON user_activities
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY insert_activities ON user_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- Account deactivation policies
CREATE POLICY user_view_own_deactivation ON account_deactivations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY admin_view_all_deactivations ON account_deactivations
  FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

CREATE POLICY user_insert_own_deactivation ON account_deactivations
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY admin_manage_deactivations ON account_deactivations
  FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));
