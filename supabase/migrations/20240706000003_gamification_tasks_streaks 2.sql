-- Gamification Tasks, Streaks, and Settings Migration

-- Create daily tasks table
CREATE TABLE IF NOT EXISTS daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 5,
  action VARCHAR(50) NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user daily tasks table
CREATE TABLE IF NOT EXISTS user_daily_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES daily_tasks(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(20) NOT NULL,
  current_count INTEGER NOT NULL DEFAULT 0,
  longest_count INTEGER NOT NULL DEFAULT 0,
  last_activity_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, type)
);

-- Create gamification activities table
CREATE TABLE IF NOT EXISTS gamification_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action VARCHAR(50) NOT NULL,
  target_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user features table
CREATE TABLE IF NOT EXISTS user_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_key VARCHAR(50) NOT NULL,
  metadata JSONB,
  source VARCHAR(20) NOT NULL,
  source_id VARCHAR(100),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, feature_key)
);

-- Create user discounts table
CREATE TABLE IF NOT EXISTS user_discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  discount_percentage INTEGER NOT NULL,
  code VARCHAR(20) NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  source VARCHAR(20) NOT NULL,
  source_id VARCHAR(100),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gamification settings table
CREATE TABLE IF NOT EXISTS gamification_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  notifications_enabled BOOLEAN NOT NULL DEFAULT true,
  leaderboard_visibility VARCHAR(20) NOT NULL DEFAULT 'public',
  achievement_sharing BOOLEAN NOT NULL DEFAULT true,
  challenge_reminders BOOLEAN NOT NULL DEFAULT true,
  daily_task_reminders BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update timestamp on daily_tasks
CREATE OR REPLACE FUNCTION update_daily_tasks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_daily_tasks_timestamp
BEFORE UPDATE ON daily_tasks
FOR EACH ROW
EXECUTE FUNCTION update_daily_tasks_timestamp();

-- Create function to update timestamp on streaks
CREATE OR REPLACE FUNCTION update_streaks_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_streaks_timestamp
BEFORE UPDATE ON streaks
FOR EACH ROW
EXECUTE FUNCTION update_streaks_timestamp();

-- Set up RLS policies
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_settings ENABLE ROW LEVEL SECURITY;

-- Daily tasks policies
CREATE POLICY "Anyone can view active daily tasks"
  ON daily_tasks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all daily tasks"
  ON daily_tasks FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert daily tasks"
  ON daily_tasks FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update daily tasks"
  ON daily_tasks FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- User daily tasks policies
CREATE POLICY "Users can view their own daily tasks"
  ON user_daily_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user daily tasks"
  ON user_daily_tasks FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "System can insert user daily tasks"
  ON user_daily_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update user daily tasks"
  ON user_daily_tasks FOR UPDATE
  USING (true);

-- Streaks policies
CREATE POLICY "Users can view their own streaks"
  ON streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all streaks"
  ON streaks FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "System can insert streaks"
  ON streaks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update streaks"
  ON streaks FOR UPDATE
  USING (true);

-- Gamification activities policies
CREATE POLICY "Users can view their own activities"
  ON gamification_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activities"
  ON gamification_activities FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "System can insert activities"
  ON gamification_activities FOR INSERT
  WITH CHECK (true);

-- User features policies
CREATE POLICY "Users can view their own features"
  ON user_features FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user features"
  ON user_features FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "System can insert user features"
  ON user_features FOR INSERT
  WITH CHECK (true);

-- User discounts policies
CREATE POLICY "Users can view their own discounts"
  ON user_discounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user discounts"
  ON user_discounts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "System can insert user discounts"
  ON user_discounts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update user discounts"
  ON user_discounts FOR UPDATE
  USING (true);

-- Gamification settings policies
CREATE POLICY "Users can view their own settings"
  ON gamification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all settings"
  ON gamification_settings FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own settings"
  ON gamification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON gamification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_tasks_is_active ON daily_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_daily_tasks_action ON daily_tasks(action);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_user_id ON user_daily_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_task_id ON user_daily_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_tasks_is_completed ON user_daily_tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_streaks_user_id ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_type ON streaks(type);
CREATE INDEX IF NOT EXISTS idx_gamification_activities_user_id ON gamification_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_gamification_activities_action ON gamification_activities(action);
CREATE INDEX IF NOT EXISTS idx_gamification_activities_created_at ON gamification_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_user_features_user_id ON user_features(user_id);
CREATE INDEX IF NOT EXISTS idx_user_features_feature_key ON user_features(feature_key);
CREATE INDEX IF NOT EXISTS idx_user_discounts_user_id ON user_discounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_discounts_code ON user_discounts(code);
CREATE INDEX IF NOT EXISTS idx_user_discounts_expires_at ON user_discounts(expires_at);

-- Insert initial daily tasks
INSERT INTO daily_tasks (title, description, points, action, target_count, is_active)
VALUES
  ('Login Streak', 'Log in to the platform', 5, 'login', 1, true),
  ('Visit Forum', 'Visit the community forum', 5, 'forum_view', 1, true),
  ('Create a Post', 'Create a post in the forum', 10, 'forum_post_create', 1, true),
  ('Reply to a Thread', 'Reply to a thread in the forum', 5, 'forum_post_reply', 1, true),
  ('Update Profile', 'Update your profile information', 5, 'profile_update', 1, true),
  ('View a Service', 'View a service listing', 5, 'service_view', 3, true),
  ('Contact a Service Agent', 'Contact a service agent', 10, 'service_contact', 1, true)
ON CONFLICT DO NOTHING;
