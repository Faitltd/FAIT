-- Points and Achievements System Migration

-- Points System Tables

-- Create points_config table
CREATE TABLE IF NOT EXISTS points_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  points_expiration_days INTEGER NOT NULL DEFAULT 365,
  min_points_for_redemption INTEGER NOT NULL DEFAULT 100,
  welcome_bonus_points INTEGER NOT NULL DEFAULT 100,
  referral_bonus_points INTEGER NOT NULL DEFAULT 100,
  verification_bonus_points INTEGER NOT NULL DEFAULT 200,
  daily_login_points INTEGER NOT NULL DEFAULT 5,
  booking_completion_points INTEGER NOT NULL DEFAULT 50,
  review_submission_points INTEGER NOT NULL DEFAULT 25,
  profile_completion_points INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create points_transactions table
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  points_amount INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- earned, spent, expired, adjusted
  transaction_status VARCHAR(20) NOT NULL DEFAULT 'completed', -- pending, completed, failed, reversed
  description TEXT NOT NULL,
  source VARCHAR(50) NOT NULL,
  reference_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create points_rewards table
CREATE TABLE IF NOT EXISTS points_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  points_cost INTEGER NOT NULL,
  reward_type VARCHAR(50) NOT NULL,
  reward_value NUMERIC NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_points_rewards table
CREATE TABLE IF NOT EXISTS user_points_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reward_id UUID REFERENCES points_rewards(id) NOT NULL,
  points_spent INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, redeemed, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Achievements System Tables

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- onboarding, engagement, bookings, referrals, verification, reviews, community, milestones
  trigger_type VARCHAR(50) NOT NULL, -- signup, profile_completion, verification, booking_count, booking_value, referral_count, review_count, login_streak, points_earned, forum_posts, time_on_platform
  trigger_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL,
  badge_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  points_awarded INTEGER NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Create achievement_progress table
CREATE TABLE IF NOT EXISTS achievement_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  current_value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create function to update timestamp on points_config
CREATE OR REPLACE FUNCTION update_points_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_points_config_timestamp
BEFORE UPDATE ON points_config
FOR EACH ROW
EXECUTE FUNCTION update_points_config_timestamp();

-- Create function to update timestamp on points_rewards
CREATE OR REPLACE FUNCTION update_points_rewards_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_points_rewards_timestamp
BEFORE UPDATE ON points_rewards
FOR EACH ROW
EXECUTE FUNCTION update_points_rewards_timestamp();

-- Create function to update timestamp on achievements
CREATE OR REPLACE FUNCTION update_achievements_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_achievements_timestamp
BEFORE UPDATE ON achievements
FOR EACH ROW
EXECUTE FUNCTION update_achievements_timestamp();

-- Create function to get user points balance
CREATE OR REPLACE FUNCTION get_user_points_balance(p_user_id UUID)
RETURNS TABLE (
  total_earned BIGINT,
  total_spent BIGINT,
  total_expired BIGINT,
  total_adjusted BIGINT,
  current_balance BIGINT,
  pending_points BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH earned AS (
    SELECT COALESCE(SUM(points_amount), 0) AS amount
    FROM points_transactions
    WHERE user_id = p_user_id
    AND transaction_type = 'earned'
    AND transaction_status = 'completed'
  ),
  spent AS (
    SELECT COALESCE(SUM(points_amount), 0) AS amount
    FROM points_transactions
    WHERE user_id = p_user_id
    AND transaction_type = 'spent'
    AND transaction_status = 'completed'
  ),
  expired AS (
    SELECT COALESCE(SUM(points_amount), 0) AS amount
    FROM points_transactions
    WHERE user_id = p_user_id
    AND transaction_type = 'expired'
    AND transaction_status = 'completed'
  ),
  adjusted AS (
    SELECT COALESCE(SUM(points_amount), 0) AS amount
    FROM points_transactions
    WHERE user_id = p_user_id
    AND transaction_type = 'adjusted'
    AND transaction_status = 'completed'
  ),
  pending AS (
    SELECT COALESCE(SUM(points_amount), 0) AS amount
    FROM points_transactions
    WHERE user_id = p_user_id
    AND transaction_status = 'pending'
  )
  SELECT
    e.amount AS total_earned,
    s.amount AS total_spent,
    ex.amount AS total_expired,
    a.amount AS total_adjusted,
    (e.amount + a.amount) - (s.amount + ex.amount) AS current_balance,
    p.amount AS pending_points
  FROM
    earned e,
    spent s,
    expired ex,
    adjusted a,
    pending p;
END;
$$ LANGUAGE plpgsql;

-- Create function to redeem a points reward
CREATE OR REPLACE FUNCTION redeem_points_reward(
  p_user_id UUID,
  p_reward_id UUID,
  p_points_cost INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_balance RECORD;
BEGIN
  -- Get user's points balance
  SELECT * INTO v_balance FROM get_user_points_balance(p_user_id);
  
  -- Check if user has enough points
  IF v_balance.current_balance < p_points_cost THEN
    RAISE EXCEPTION 'Insufficient points balance';
  END IF;
  
  -- Create a points transaction for spending points
  INSERT INTO points_transactions (
    user_id,
    points_amount,
    transaction_type,
    transaction_status,
    description,
    source,
    reference_id,
    processed_at
  ) VALUES (
    p_user_id,
    p_points_cost,
    'spent',
    'completed',
    'Redeemed reward',
    'reward_redemption',
    p_reward_id,
    NOW()
  );
  
  -- Create a user reward record
  INSERT INTO user_points_rewards (
    user_id,
    reward_id,
    points_spent,
    status
  ) VALUES (
    p_user_id,
    p_reward_id,
    p_points_cost,
    'pending'
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to get points leaderboard
CREATE OR REPLACE FUNCTION get_points_leaderboard(p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  full_name TEXT,
  avatar_url TEXT,
  user_type TEXT,
  points BIGINT,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_points AS (
    SELECT
      u.id AS user_id,
      p.first_name || ' ' || p.last_name AS full_name,
      p.avatar_url,
      p.user_type,
      (
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'earned' THEN pt.points_amount ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'adjusted' THEN pt.points_amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'spent' THEN pt.points_amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'expired' THEN pt.points_amount ELSE 0 END), 0)
      ) AS points
    FROM
      auth.users u
      JOIN profiles p ON u.id = p.id
      LEFT JOIN points_transactions pt ON u.id = pt.user_id AND pt.transaction_status = 'completed'
    GROUP BY
      u.id, p.first_name, p.last_name, p.avatar_url, p.user_type
    HAVING
      (
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'earned' THEN pt.points_amount ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'adjusted' THEN pt.points_amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'spent' THEN pt.points_amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'expired' THEN pt.points_amount ELSE 0 END), 0)
      ) > 0
  )
  SELECT
    up.user_id,
    up.full_name,
    up.avatar_url,
    up.user_type,
    up.points,
    RANK() OVER (ORDER BY up.points DESC) AS rank
  FROM
    user_points up
  ORDER BY
    up.points DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user's leaderboard rank
CREATE OR REPLACE FUNCTION get_user_leaderboard_rank(p_user_id UUID)
RETURNS TABLE (
  rank BIGINT,
  points BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_points AS (
    SELECT
      u.id AS user_id,
      (
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'earned' THEN pt.points_amount ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'adjusted' THEN pt.points_amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'spent' THEN pt.points_amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN pt.transaction_type = 'expired' THEN pt.points_amount ELSE 0 END), 0)
      ) AS points
    FROM
      auth.users u
      LEFT JOIN points_transactions pt ON u.id = pt.user_id AND pt.transaction_status = 'completed'
    GROUP BY
      u.id
  ),
  ranked_users AS (
    SELECT
      user_id,
      points,
      RANK() OVER (ORDER BY points DESC) AS rank
    FROM
      user_points
  )
  SELECT
    ru.rank,
    ru.points
  FROM
    ranked_users ru
  WHERE
    ru.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to check and award achievements
CREATE OR REPLACE FUNCTION check_and_award_achievements(
  p_user_id UUID,
  p_trigger_type VARCHAR(50),
  p_trigger_value INTEGER DEFAULT 1
)
RETURNS SETOF achievements AS $$
DECLARE
  v_achievement RECORD;
  v_progress RECORD;
  v_awarded_achievements achievements[];
BEGIN
  -- Get current progress for the trigger type
  SELECT * INTO v_progress
  FROM achievement_progress ap
  JOIN achievements a ON ap.achievement_id = a.id
  WHERE ap.user_id = p_user_id
  AND a.trigger_type = p_trigger_type
  ORDER BY a.trigger_value DESC
  LIMIT 1;
  
  -- If no progress record exists, create one with the current value
  IF NOT FOUND THEN
    -- Find the first achievement for this trigger type
    SELECT * INTO v_achievement
    FROM achievements
    WHERE trigger_type = p_trigger_type
    AND is_active = true
    ORDER BY trigger_value ASC
    LIMIT 1;
    
    IF FOUND THEN
      INSERT INTO achievement_progress (
        user_id,
        achievement_id,
        current_value
      ) VALUES (
        p_user_id,
        v_achievement.id,
        p_trigger_value
      );
    END IF;
  ELSE
    -- Update the progress
    UPDATE achievement_progress
    SET 
      current_value = current_value + p_trigger_value,
      updated_at = NOW()
    WHERE user_id = p_user_id
    AND achievement_id = v_progress.achievement_id;
  END IF;
  
  -- Check for achievements to award
  FOR v_achievement IN
    SELECT a.*
    FROM achievements a
    LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = p_user_id
    WHERE a.trigger_type = p_trigger_type
    AND a.is_active = true
    AND ua.id IS NULL -- Not already awarded
    AND EXISTS (
      SELECT 1
      FROM achievement_progress ap
      WHERE ap.user_id = p_user_id
      AND ap.achievement_id = a.id
      AND ap.current_value >= a.trigger_value
    )
  LOOP
    -- Award the achievement
    INSERT INTO user_achievements (
      user_id,
      achievement_id,
      points_awarded
    ) VALUES (
      p_user_id,
      v_achievement.id,
      v_achievement.points_reward
    );
    
    -- Add to the result set
    v_awarded_achievements := array_append(v_awarded_achievements, v_achievement);
  END LOOP;
  
  -- Return the awarded achievements
  RETURN QUERY
  SELECT * FROM unnest(v_awarded_achievements);
END;
$$ LANGUAGE plpgsql;

-- Create function to get user achievement progress
CREATE OR REPLACE FUNCTION get_user_achievement_progress(p_user_id UUID)
RETURNS TABLE (
  achievement_id UUID,
  current_value INTEGER,
  target_value INTEGER,
  percentage FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ap.achievement_id,
    ap.current_value,
    a.trigger_value AS target_value,
    LEAST(1.0, ap.current_value::FLOAT / a.trigger_value) AS percentage
  FROM
    achievement_progress ap
    JOIN achievements a ON ap.achievement_id = a.id
    LEFT JOIN user_achievements ua ON ap.achievement_id = ua.achievement_id AND ap.user_id = ua.user_id
  WHERE
    ap.user_id = p_user_id
    AND a.is_active = true
    AND ua.id IS NULL -- Not already achieved
  ORDER BY
    percentage DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user achievement stats
CREATE OR REPLACE FUNCTION get_user_achievement_stats(p_user_id UUID)
RETURNS TABLE (
  total_achievements BIGINT,
  achievements_earned BIGINT,
  total_points_earned BIGINT,
  completion_percentage FLOAT
) AS $$
BEGIN
  RETURN QUERY
  WITH total AS (
    SELECT COUNT(*) AS count
    FROM achievements
    WHERE is_active = true
  ),
  earned AS (
    SELECT COUNT(*) AS count, COALESCE(SUM(points_awarded), 0) AS points
    FROM user_achievements
    WHERE user_id = p_user_id
  )
  SELECT
    t.count AS total_achievements,
    e.count AS achievements_earned,
    e.points AS total_points_earned,
    CASE WHEN t.count > 0 THEN e.count::FLOAT / t.count ELSE 0 END AS completion_percentage
  FROM
    total t,
    earned e;
END;
$$ LANGUAGE plpgsql;

-- Insert initial points config
INSERT INTO points_config (
  points_expiration_days,
  min_points_for_redemption,
  welcome_bonus_points,
  referral_bonus_points,
  verification_bonus_points,
  daily_login_points,
  booking_completion_points,
  review_submission_points,
  profile_completion_points
) VALUES (
  365,
  100,
  100,
  100,
  200,
  5,
  50,
  25,
  50
)
ON CONFLICT DO NOTHING;

-- Insert initial points rewards
INSERT INTO points_rewards (
  name,
  description,
  points_cost,
  reward_type,
  reward_value,
  is_active
) VALUES
  (
    'Service Discount',
    'Get a 10% discount on your next service booking',
    500,
    'discount',
    10,
    true
  ),
  (
    'Priority Booking',
    'Get priority booking for high-demand service agents',
    1000,
    'priority',
    1,
    true
  ),
  (
    'Account Credit',
    'Get $25 credit added to your account',
    2500,
    'credit',
    25,
    true
  ),
  (
    'Free Consultation',
    'Get a free 30-minute consultation with a service agent',
    1500,
    'service',
    1,
    true
  ),
  (
    'Premium Membership',
    'Get 1 month of premium membership benefits',
    5000,
    'membership',
    1,
    true
  )
ON CONFLICT DO NOTHING;

-- Insert initial achievements
INSERT INTO achievements (
  name,
  description,
  category,
  trigger_type,
  trigger_value,
  points_reward,
  is_active,
  is_hidden
) VALUES
  -- Onboarding achievements
  (
    'Welcome Aboard',
    'Sign up and join the FAIT Co-op community',
    'onboarding',
    'signup',
    1,
    50,
    true,
    false
  ),
  (
    'Profile Pro',
    'Complete your profile with all details',
    'onboarding',
    'profile_completion',
    1,
    100,
    true,
    false
  ),
  (
    'Verified Member',
    'Complete the verification process',
    'verification',
    'verification',
    1,
    200,
    true,
    false
  ),
  
  -- Engagement achievements
  (
    'Regular Visitor',
    'Log in for 7 consecutive days',
    'engagement',
    'login_streak',
    7,
    50,
    true,
    false
  ),
  (
    'Dedicated Member',
    'Log in for 30 consecutive days',
    'engagement',
    'login_streak',
    30,
    200,
    true,
    false
  ),
  (
    'Community Contributor',
    'Make 10 posts in the community forums',
    'community',
    'forum_posts',
    10,
    100,
    true,
    false
  ),
  
  -- Referral achievements
  (
    'First Referral',
    'Refer your first friend to FAIT Co-op',
    'referrals',
    'referral_count',
    1,
    100,
    true,
    false
  ),
  (
    'Network Builder',
    'Refer 5 friends to FAIT Co-op',
    'referrals',
    'referral_count',
    5,
    300,
    true,
    false
  ),
  (
    'Community Advocate',
    'Refer 10 friends to FAIT Co-op',
    'referrals',
    'referral_count',
    10,
    500,
    true,
    false
  ),
  
  -- Booking achievements
  (
    'First Booking',
    'Complete your first service booking',
    'bookings',
    'booking_count',
    1,
    100,
    true,
    false
  ),
  (
    'Regular Client',
    'Complete 5 service bookings',
    'bookings',
    'booking_count',
    5,
    300,
    true,
    false
  ),
  (
    'Loyal Customer',
    'Complete 10 service bookings',
    'bookings',
    'booking_count',
    10,
    500,
    true,
    false
  ),
  
  -- Review achievements
  (
    'First Review',
    'Submit your first service review',
    'reviews',
    'review_count',
    1,
    50,
    true,
    false
  ),
  (
    'Feedback Provider',
    'Submit 5 service reviews',
    'reviews',
    'review_count',
    5,
    200,
    true,
    false
  ),
  
  -- Milestone achievements
  (
    'Points Collector',
    'Earn 1,000 points',
    'milestones',
    'points_earned',
    1000,
    100,
    true,
    false
  ),
  (
    'Points Enthusiast',
    'Earn 5,000 points',
    'milestones',
    'points_earned',
    5000,
    300,
    true,
    false
  ),
  (
    'Points Master',
    'Earn 10,000 points',
    'milestones',
    'points_earned',
    10000,
    500,
    true,
    false
  ),
  (
    'First Anniversary',
    'Be a member for 1 year',
    'milestones',
    'time_on_platform',
    365,
    500,
    true,
    false
  )
ON CONFLICT DO NOTHING;

-- Set up RLS policies
ALTER TABLE points_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievement_progress ENABLE ROW LEVEL SECURITY;

-- Points config policies
CREATE POLICY "Anyone can view points config"
  ON points_config FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update points config"
  ON points_config FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Points transactions policies
CREATE POLICY "Users can view their own points transactions"
  ON points_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert points transactions"
  ON points_transactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update points transactions"
  ON points_transactions FOR UPDATE
  USING (true);

-- Points rewards policies
CREATE POLICY "Anyone can view active points rewards"
  ON points_rewards FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can view all points rewards"
  ON points_rewards FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert points rewards"
  ON points_rewards FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update points rewards"
  ON points_rewards FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- User points rewards policies
CREATE POLICY "Users can view their own rewards"
  ON user_points_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user rewards"
  ON user_points_rewards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update user rewards"
  ON user_points_rewards FOR UPDATE
  USING (true);

-- Achievements policies
CREATE POLICY "Anyone can view active and non-hidden achievements"
  ON achievements FOR SELECT
  USING (is_active = true AND is_hidden = false);

CREATE POLICY "Admins can view all achievements"
  ON achievements FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can insert achievements"
  ON achievements FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can update achievements"
  ON achievements FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- User achievements policies
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert user achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (true);

-- Achievement progress policies
CREATE POLICY "Users can view their own achievement progress"
  ON achievement_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert achievement progress"
  ON achievement_progress FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update achievement progress"
  ON achievement_progress FOR UPDATE
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_transaction_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_points_transactions_transaction_status ON points_transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_user_points_rewards_user_id ON user_points_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_points_rewards_reward_id ON user_points_rewards(reward_id);
CREATE INDEX IF NOT EXISTS idx_achievements_trigger_type ON achievements(trigger_type);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement_id ON achievement_progress(achievement_id);
