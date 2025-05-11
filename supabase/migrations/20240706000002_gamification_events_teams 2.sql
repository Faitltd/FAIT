-- Gamification Events and Teams Migration

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event challenges table
CREATE TABLE IF NOT EXISTS event_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, challenge_id)
);

-- Create event rewards table
CREATE TABLE IF NOT EXISTS event_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL,
  value VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user event participations table
CREATE TABLE IF NOT EXISTS user_event_participations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  points_earned INTEGER NOT NULL DEFAULT 0,
  challenges_completed INTEGER NOT NULL DEFAULT 0,
  rewards_claimed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  logo_url VARCHAR(255),
  leader_id UUID REFERENCES auth.users(id) NOT NULL,
  member_count INTEGER NOT NULL DEFAULT 1,
  total_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) NOT NULL,
  points_contributed INTEGER NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Create team challenges table
CREATE TABLE IF NOT EXISTS team_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, challenge_id)
);

-- Create function to update timestamp on events
CREATE OR REPLACE FUNCTION update_events_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_events_timestamp
BEFORE UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION update_events_timestamp();

-- Create function to update timestamp on teams
CREATE OR REPLACE FUNCTION update_teams_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_teams_timestamp
BEFORE UPDATE ON teams
FOR EACH ROW
EXECUTE FUNCTION update_teams_timestamp();

-- Create function to update timestamp on team_challenges
CREATE OR REPLACE FUNCTION update_team_challenges_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_team_challenges_timestamp
BEFORE UPDATE ON team_challenges
FOR EACH ROW
EXECUTE FUNCTION update_team_challenges_timestamp();

-- Set up RLS policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_event_participations ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_challenges ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view active events"
  ON events FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all events"
  ON events FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert events"
  ON events FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update events"
  ON events FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Event challenges policies
CREATE POLICY "Anyone can view event challenges"
  ON event_challenges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert event challenges"
  ON event_challenges FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Event rewards policies
CREATE POLICY "Anyone can view event rewards"
  ON event_rewards FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert event rewards"
  ON event_rewards FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- User event participations policies
CREATE POLICY "Users can view their own event participations"
  ON user_event_participations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user event participations"
  ON user_event_participations FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Users can insert their own event participations"
  ON user_event_participations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update user event participations"
  ON user_event_participations FOR UPDATE
  USING (true);

-- Teams policies
CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  USING (true);

CREATE POLICY "Users can insert teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Team leaders can update their teams"
  ON teams FOR UPDATE
  USING (auth.uid() = leader_id);

-- Team members policies
CREATE POLICY "Anyone can view team members"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own team membership"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Team leaders can update team members"
  ON team_members FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT t.leader_id FROM teams t JOIN team_members tm ON t.id = tm.team_id WHERE tm.id = id
    )
  );

CREATE POLICY "Users can delete their own team membership"
  ON team_members FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Team leaders can delete team members"
  ON team_members FOR DELETE
  USING (
    auth.uid() IN (
      SELECT t.leader_id FROM teams t JOIN team_members tm ON t.id = tm.team_id WHERE tm.id = id
    )
  );

-- Team challenges policies
CREATE POLICY "Anyone can view team challenges"
  ON team_challenges FOR SELECT
  USING (true);

CREATE POLICY "Team members can insert team challenges"
  ON team_challenges FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM team_members WHERE team_id = team_id
    )
  );

CREATE POLICY "System can update team challenges"
  ON team_challenges FOR UPDATE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_is_active ON events(is_active);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);
CREATE INDEX IF NOT EXISTS idx_event_challenges_event_id ON event_challenges(event_id);
CREATE INDEX IF NOT EXISTS idx_event_challenges_challenge_id ON event_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_event_rewards_event_id ON event_rewards(event_id);
CREATE INDEX IF NOT EXISTS idx_user_event_participations_user_id ON user_event_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_event_participations_event_id ON user_event_participations(event_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader_id ON teams(leader_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_role ON team_members(role);
CREATE INDEX IF NOT EXISTS idx_team_challenges_team_id ON team_challenges(team_id);
CREATE INDEX IF NOT EXISTS idx_team_challenges_challenge_id ON team_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_team_challenges_is_completed ON team_challenges(is_completed);
