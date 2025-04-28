-- Referral System Migration

-- Create referral_program table
CREATE TABLE IF NOT EXISTS referral_program (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_reward_amount INTEGER NOT NULL DEFAULT 100,
  service_agent_reward_amount INTEGER NOT NULL DEFAULT 200,
  referred_client_reward_amount INTEGER NOT NULL DEFAULT 50,
  referred_service_agent_reward_amount INTEGER NOT NULL DEFAULT 50,
  reward_type VARCHAR(20) NOT NULL DEFAULT 'points',
  expiration_days INTEGER NOT NULL DEFAULT 30,
  terms_and_conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create referral_codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  code VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id),
  UNIQUE(code)
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  referred_id UUID REFERENCES auth.users(id) NOT NULL,
  referral_code VARCHAR(20) REFERENCES referral_codes(code),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, converted, rewarded, expired
  referred_user_type VARCHAR(20) NOT NULL, -- client, service_agent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_id)
);

-- Create referral_rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referrals(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reward_type VARCHAR(20) NOT NULL, -- points, credit, discount
  reward_amount NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create referral_conversions table
CREATE TABLE IF NOT EXISTS referral_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referrals(id) NOT NULL,
  conversion_type VARCHAR(50) NOT NULL, -- verification, first_transaction, etc.
  conversion_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update timestamp on referral_program
CREATE OR REPLACE FUNCTION update_referral_program_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating timestamp
CREATE TRIGGER update_referral_program_timestamp
BEFORE UPDATE ON referral_program
FOR EACH ROW
EXECUTE FUNCTION update_referral_program_timestamp();

-- Create function to generate referral code on user creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Check if user already has a referral code
  SELECT EXISTS(SELECT 1 FROM referral_codes WHERE user_id = NEW.id) INTO code_exists;
  
  -- If user already has a code, exit
  IF code_exists THEN
    RETURN NEW;
  END IF;
  
  -- Generate a unique referral code
  LOOP
    -- Generate a random 8-character code
    code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Insert the new referral code
  INSERT INTO referral_codes (user_id, code) VALUES (NEW.id, code);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for generating referral code on user creation
CREATE TRIGGER create_referral_code_on_user_creation
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION generate_referral_code();

-- Create function to convert a referral
CREATE OR REPLACE FUNCTION convert_referral(
  p_referral_id UUID,
  p_conversion_type VARCHAR(50),
  p_conversion_value NUMERIC DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_referral RECORD;
  v_program RECORD;
  v_referrer_reward_amount NUMERIC;
  v_referred_reward_amount NUMERIC;
BEGIN
  -- Get the referral
  SELECT * INTO v_referral FROM referrals WHERE id = p_referral_id;
  
  -- If referral not found or already converted, exit
  IF NOT FOUND OR v_referral.status != 'pending' THEN
    RETURN;
  END IF;
  
  -- Get the referral program
  SELECT * INTO v_program FROM referral_program LIMIT 1;
  
  -- Determine reward amounts based on user type
  IF v_referral.referred_user_type = 'service_agent' THEN
    v_referrer_reward_amount := v_program.service_agent_reward_amount;
    v_referred_reward_amount := v_program.referred_service_agent_reward_amount;
  ELSE
    v_referrer_reward_amount := v_program.client_reward_amount;
    v_referred_reward_amount := v_program.referred_client_reward_amount;
  END IF;
  
  -- Update the referral status
  UPDATE referrals
  SET 
    status = 'converted',
    converted_at = NOW()
  WHERE id = p_referral_id;
  
  -- Create the conversion record
  INSERT INTO referral_conversions (
    referral_id,
    conversion_type,
    conversion_value
  ) VALUES (
    p_referral_id,
    p_conversion_type,
    p_conversion_value
  );
  
  -- Create rewards
  -- Reward for referrer
  INSERT INTO referral_rewards (
    referral_id,
    user_id,
    reward_type,
    reward_amount,
    status
  ) VALUES (
    p_referral_id,
    v_referral.referrer_id,
    v_program.reward_type,
    v_referrer_reward_amount,
    'pending'
  );
  
  -- Reward for referred user
  INSERT INTO referral_rewards (
    referral_id,
    user_id,
    reward_type,
    reward_amount,
    status
  ) VALUES (
    p_referral_id,
    v_referral.referred_id,
    v_program.reward_type,
    v_referred_reward_amount,
    'pending'
  );
  
  -- Update the referral status to rewarded
  UPDATE referrals
  SET status = 'rewarded'
  WHERE id = p_referral_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user referral stats
CREATE OR REPLACE FUNCTION get_user_referral_stats(
  p_user_id UUID
)
RETURNS TABLE (
  total_referrals BIGINT,
  pending_referrals BIGINT,
  converted_referrals BIGINT,
  conversion_rate FLOAT,
  total_rewards BIGINT,
  total_reward_value NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH referral_counts AS (
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE status IN ('converted', 'rewarded')) AS converted
    FROM referrals
    WHERE referrer_id = p_user_id
  ),
  reward_stats AS (
    SELECT
      COUNT(*) AS total,
      SUM(reward_amount) AS total_value
    FROM referral_rewards
    WHERE user_id = p_user_id
  )
  SELECT
    rc.total,
    rc.pending,
    rc.converted,
    CASE WHEN rc.total > 0 THEN rc.converted::FLOAT / rc.total ELSE 0 END,
    rs.total,
    rs.total_value
  FROM
    referral_counts rc,
    reward_stats rs;
END;
$$ LANGUAGE plpgsql;

-- Insert initial referral program
INSERT INTO referral_program (
  client_reward_amount,
  service_agent_reward_amount,
  referred_client_reward_amount,
  referred_service_agent_reward_amount,
  reward_type,
  expiration_days,
  terms_and_conditions
) VALUES (
  100,
  200,
  50,
  50,
  'points',
  30,
  'Standard terms and conditions apply. FAIT Co-op reserves the right to modify or terminate the referral program at any time.'
)
ON CONFLICT DO NOTHING;

-- Set up RLS policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referral codes"
  ON referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert referral codes"
  ON referral_codes FOR INSERT
  WITH CHECK (true);

-- Referrals policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they've made"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view referrals they've received"
  ON referrals FOR SELECT
  USING (auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update referrals"
  ON referrals FOR UPDATE
  USING (true);

-- Rewards policies
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards"
  ON referral_rewards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update rewards"
  ON referral_rewards FOR UPDATE
  USING (true);

-- Conversions policies
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view conversions for their referrals"
  ON referral_conversions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM referrals
      WHERE referrals.id = referral_id
      AND (referrals.referrer_id = auth.uid() OR referrals.referred_id = auth.uid())
    )
  );

CREATE POLICY "System can insert conversions"
  ON referral_conversions FOR INSERT
  WITH CHECK (true);

-- Program policies
ALTER TABLE referral_program ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view referral program"
  ON referral_program FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update referral program"
  ON referral_program FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_referral_id ON referral_rewards(referral_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referral_id ON referral_conversions(referral_id);
