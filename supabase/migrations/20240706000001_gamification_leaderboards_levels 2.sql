-- Gamification Leaderboards and Levels Migration

-- Create leaderboards table
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  period VARCHAR(20) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  category VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create level definitions table
CREATE TABLE IF NOT EXISTS level_definitions (
  level INTEGER PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  points_required INTEGER NOT NULL,
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create level rewards table
CREATE TABLE IF NOT EXISTS level_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level INTEGER REFERENCES level_definitions(level) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  value VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user levels table
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  points_required INTEGER NOT NULL,
  current_points INTEGER NOT NULL DEFAULT 0,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user titles table
CREATE TABLE IF NOT EXISTS user_titles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  source VARCHAR(20) NOT NULL,
  source_id VARCHAR(100),
  is_active BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update timestamp on leaderboards
CREATE OR REPLACE FUNCTION update_leaderboards_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_leaderboards_timestamp
BEFORE UPDATE ON leaderboards
FOR EACH ROW
EXECUTE FUNCTION update_leaderboards_timestamp();

-- Create function to update timestamp on level_definitions
CREATE OR REPLACE FUNCTION update_level_definitions_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_level_definitions_timestamp
BEFORE UPDATE ON level_definitions
FOR EACH ROW
EXECUTE FUNCTION update_level_definitions_timestamp();

-- Create function to update timestamp on user_levels
CREATE OR REPLACE FUNCTION update_user_levels_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_user_levels_timestamp
BEFORE UPDATE ON user_levels
FOR EACH ROW
EXECUTE FUNCTION update_user_levels_timestamp();

-- Set up RLS policies
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_titles ENABLE ROW LEVEL SECURITY;

-- Leaderboards policies
CREATE POLICY "Anyone can view active leaderboards"
  ON leaderboards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all leaderboards"
  ON leaderboards FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert leaderboards"
  ON leaderboards FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update leaderboards"
  ON leaderboards FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Level definitions policies
CREATE POLICY "Anyone can view level definitions"
  ON level_definitions FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert level definitions"
  ON level_definitions FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update level definitions"
  ON level_definitions FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Level rewards policies
CREATE POLICY "Anyone can view level rewards"
  ON level_rewards FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert level rewards"
  ON level_rewards FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update level rewards"
  ON level_rewards FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- User levels policies
CREATE POLICY "Users can view their own levels"
  ON user_levels FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user levels"
  ON user_levels FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "System can insert user levels"
  ON user_levels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update user levels"
  ON user_levels FOR UPDATE
  USING (true);

-- User titles policies
CREATE POLICY "Anyone can view user titles"
  ON user_titles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own titles"
  ON user_titles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user titles"
  ON user_titles FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leaderboards_is_active ON leaderboards(is_active);
CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON leaderboards(type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_period ON leaderboards(period);
CREATE INDEX IF NOT EXISTS idx_level_rewards_level ON level_rewards(level);
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_level ON user_levels(level);
CREATE INDEX IF NOT EXISTS idx_user_titles_user_id ON user_titles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_titles_is_active ON user_titles(is_active);

-- Insert initial level definitions
INSERT INTO level_definitions (level, name, points_required, icon)
VALUES
  (1, 'Novice', 0, 'level-1'),
  (2, 'Apprentice', 100, 'level-2'),
  (3, 'Journeyman', 300, 'level-3'),
  (4, 'Expert', 600, 'level-4'),
  (5, 'Master', 1000, 'level-5'),
  (6, 'Grandmaster', 1500, 'level-6'),
  (7, 'Legend', 2500, 'level-7'),
  (8, 'Champion', 4000, 'level-8'),
  (9, 'Hero', 6000, 'level-9'),
  (10, 'Paragon', 10000, 'level-10')
ON CONFLICT (level) DO NOTHING;

-- Insert level rewards
INSERT INTO level_rewards (level, type, value, metadata)
VALUES
  (2, 'title', 'Apprentice', NULL),
  (3, 'title', 'Journeyman', NULL),
  (4, 'title', 'Expert', NULL),
  (5, 'title', 'Master', NULL),
  (6, 'title', 'Grandmaster', NULL),
  (7, 'title', 'Legend', NULL),
  (8, 'title', 'Champion', NULL),
  (9, 'title', 'Hero', NULL),
  (10, 'title', 'Paragon', NULL),
  (5, 'feature_unlock', 'team_creation', '{"description": "Ability to create teams"}'),
  (7, 'feature_unlock', 'custom_profile', '{"description": "Ability to customize profile appearance"}'),
  (10, 'feature_unlock', 'premium_features', '{"description": "Access to premium features"}')
ON CONFLICT DO NOTHING;

-- Insert initial leaderboards
INSERT INTO leaderboards (name, description, type, period, is_active)
VALUES
  ('Weekly Points', 'Top point earners this week', 'points', 'weekly', true),
  ('Monthly Points', 'Top point earners this month', 'points', 'monthly', true),
  ('All-Time Points', 'Top point earners of all time', 'points', 'all_time', true),
  ('Achievement Masters', 'Users with the most achievements', 'achievements', 'all_time', true),
  ('Challenge Champions', 'Users who completed the most challenges', 'challenges', 'monthly', true)
ON CONFLICT DO NOTHING;
