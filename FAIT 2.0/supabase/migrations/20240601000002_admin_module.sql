-- Admin Module Migration

-- Admin Users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_role TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  last_login TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Verification Requests Table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expiration_date TIMESTAMPTZ,
  rejection_reason TEXT
);

-- Verification Documents Table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id UUID NOT NULL REFERENCES verification_requests(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_entity_id UUID,
  related_entity_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  resolution TEXT
);

-- Dispute Messages Table
CREATE TABLE IF NOT EXISTS dispute_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB NOT NULL DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- User Activity Logs Table
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_requests_status ON verification_requests(status);
CREATE INDEX IF NOT EXISTS idx_verification_documents_verification_id ON verification_documents(verification_id);
CREATE INDEX IF NOT EXISTS idx_disputes_created_by ON disputes(created_by);
CREATE INDEX IF NOT EXISTS idx_disputes_assigned_to ON disputes(assigned_to);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute_id ON dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON user_activity_logs(user_id);

-- Create RLS policies
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin users policies
CREATE POLICY "Only admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only super admins can manage admin users"
  ON admin_users FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.admin_role = 'super_admin'
    )
  );

-- Verification requests policies
CREATE POLICY "Users can view their own verification requests"
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all verification requests"
  ON verification_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update verification requests"
  ON verification_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Verification documents policies
CREATE POLICY "Users can view their own verification documents"
  ON verification_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM verification_requests
      WHERE verification_requests.id = verification_id
      AND verification_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload their own verification documents"
  ON verification_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM verification_requests
      WHERE verification_requests.id = verification_id
      AND verification_requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all verification documents"
  ON verification_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Disputes policies
CREATE POLICY "Users can view disputes they created or are assigned to"
  ON disputes FOR SELECT
  USING (
    auth.uid() = created_by OR
    auth.uid() = assigned_to
  );

CREATE POLICY "Users can create disputes"
  ON disputes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update disputes they created"
  ON disputes FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Admins can view all disputes"
  ON disputes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update all disputes"
  ON disputes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Dispute messages policies
CREATE POLICY "Users can view messages in disputes they're involved in"
  ON dispute_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_id
      AND (
        disputes.created_by = auth.uid() OR
        disputes.assigned_to = auth.uid()
      )
    ) AND (
      is_internal = FALSE OR
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can add messages to disputes they're involved in"
  ON dispute_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM disputes
      WHERE disputes.id = dispute_id
      AND (
        disputes.created_by = auth.uid() OR
        disputes.assigned_to = auth.uid()
      )
    ) AND (
      is_internal = FALSE OR
      EXISTS (
        SELECT 1 FROM admin_users
        WHERE admin_users.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins can view all dispute messages"
  ON dispute_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Audit logs policies
CREATE POLICY "Only admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- System settings policies
CREATE POLICY "Anyone can view public system settings"
  ON system_settings FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Only admins can view all system settings"
  ON system_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Only admins can update system settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- User activity logs policies
CREATE POLICY "Users can view their own activity logs"
  ON user_activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user activity logs"
  ON user_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Create function to get platform stats
CREATE OR REPLACE FUNCTION get_platform_stats()
RETURNS JSON AS $$
DECLARE
  _total_users INTEGER;
  _active_users INTEGER;
  _total_projects INTEGER;
  _active_projects INTEGER;
  _total_disputes INTEGER;
  _open_disputes INTEGER;
  _total_verifications INTEGER;
  _pending_verifications INTEGER;
  _result JSON;
BEGIN
  -- Get user counts
  SELECT COUNT(*) INTO _total_users FROM profiles;
  SELECT COUNT(*) INTO _active_users FROM profiles WHERE last_sign_in > NOW() - INTERVAL '30 days';
  
  -- Get project counts
  SELECT COUNT(*) INTO _total_projects FROM projects;
  SELECT COUNT(*) INTO _active_projects FROM projects WHERE status NOT IN ('completed', 'cancelled');
  
  -- Get dispute counts
  SELECT COUNT(*) INTO _total_disputes FROM disputes;
  SELECT COUNT(*) INTO _open_disputes FROM disputes WHERE status IN ('open', 'in_review');
  
  -- Get verification counts
  SELECT COUNT(*) INTO _total_verifications FROM verification_requests;
  SELECT COUNT(*) INTO _pending_verifications FROM verification_requests WHERE status = 'pending';
  
  -- Construct result JSON
  _result := json_build_object(
    'total_users', _total_users,
    'active_users', _active_users,
    'total_projects', _total_projects,
    'active_projects', _active_projects,
    'total_disputes', _total_disputes,
    'open_disputes', _open_disputes,
    'total_verifications', _total_verifications,
    'pending_verifications', _pending_verifications
  );
  
  RETURN _result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  _user_id UUID,
  _activity_type TEXT,
  _description TEXT,
  _ip_address TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_activity_logs (
    user_id,
    activity_type,
    description,
    ip_address
  ) VALUES (
    _user_id,
    _activity_type,
    _description,
    _ip_address
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log audit event
CREATE OR REPLACE FUNCTION log_audit_event(
  _user_id UUID,
  _action TEXT,
  _entity_type TEXT,
  _entity_id UUID,
  _details JSONB,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    entity_type,
    entity_id,
    details,
    ip_address,
    user_agent
  ) VALUES (
    _user_id,
    _action,
    _entity_type,
    _entity_id,
    _details,
    _ip_address,
    _user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES
  ('platform_name', 'FAIT Platform', 'string', 'Name of the platform', TRUE),
  ('platform_description', 'A cooperative marketplace connecting clients with service agents', 'string', 'Description of the platform', TRUE),
  ('maintenance_mode', 'false', 'boolean', 'Whether the platform is in maintenance mode', TRUE),
  ('registration_enabled', 'true', 'boolean', 'Whether new user registration is enabled', TRUE),
  ('default_token_reward', '10', 'number', 'Default number of tokens to reward for actions', FALSE),
  ('minimum_withdrawal_amount', '50', 'number', 'Minimum amount of tokens that can be withdrawn', TRUE),
  ('contact_email', 'support@fait.co', 'string', 'Contact email for support', TRUE),
  ('terms_version', '1.0', 'string', 'Current version of Terms of Service', TRUE),
  ('privacy_version', '1.0', 'string', 'Current version of Privacy Policy', TRUE),
  ('max_file_size_mb', '10', 'number', 'Maximum file size for uploads in MB', TRUE),
  ('allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx,xls,xlsx', 'string', 'Comma-separated list of allowed file extensions', TRUE);
