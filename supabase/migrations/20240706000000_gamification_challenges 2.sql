-- Gamification Challenges Migration

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  badge_url VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_repeatable BOOLEAN NOT NULL DEFAULT false,
  cooldown_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge requirements table
CREATE TABLE IF NOT EXISTS challenge_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  count INTEGER NOT NULL,
  target_id VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenge rewards table
CREATE TABLE IF NOT EXISTS challenge_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  value VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user challenges table
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_progress_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Create user challenge activities table
CREATE TABLE IF NOT EXISTS user_challenge_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  requirement_type VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  progress INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update timestamp on challenges
CREATE OR REPLACE FUNCTION update_challenges_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_challenges_timestamp
BEFORE UPDATE ON challenges
FOR EACH ROW
EXECUTE FUNCTION update_challenges_timestamp();

-- Set up RLS policies
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_activities ENABLE ROW LEVEL SECURITY;

-- Challenges policies
CREATE POLICY "Anyone can view active challenges"
  ON challenges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all challenges"
  ON challenges FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert challenges"
  ON challenges FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update challenges"
  ON challenges FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Challenge requirements policies
CREATE POLICY "Anyone can view challenge requirements"
  ON challenge_requirements FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert challenge requirements"
  ON challenge_requirements FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update challenge requirements"
  ON challenge_requirements FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Challenge rewards policies
CREATE POLICY "Anyone can view challenge rewards"
  ON challenge_rewards FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert challenge rewards"
  ON challenge_rewards FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update challenge rewards"
  ON challenge_rewards FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- User challenges policies
CREATE POLICY "Users can view their own challenges"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user challenges"
  ON user_challenges FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own challenges"
  ON user_challenges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update user challenges"
  ON user_challenges FOR UPDATE
  USING (true);

-- User challenge activities policies
CREATE POLICY "Users can view their own challenge activities"
  ON user_challenge_activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user challenge activities"
  ON user_challenge_activities FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "System can insert user challenge activities"
  ON user_challenge_activities FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_challenges_is_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_category ON challenges(category);
CREATE INDEX IF NOT EXISTS idx_challenges_start_date ON challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_requirements_challenge_id ON challenge_requirements(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_requirements_action ON challenge_requirements(action);
CREATE INDEX IF NOT EXISTS idx_challenge_rewards_challenge_id ON challenge_rewards(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_is_completed ON user_challenges(is_completed);
CREATE INDEX IF NOT EXISTS idx_user_challenge_activities_user_id ON user_challenge_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_activities_challenge_id ON user_challenge_activities(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_activities_action ON user_challenge_activities(action);
