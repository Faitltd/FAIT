/*
  Token & Reward Engine Migration
  
  This migration adds tables and functions needed for the Token & Reward Engine module:
  
  1. Adds tokens table for tracking token balances
  2. Adds token_transactions table for tracking token history
  3. Adds rewards table for defining available rewards
  4. Adds user_rewards table for tracking redeemed rewards
  5. Adds functions for token operations
*/

-- Start transaction
BEGIN;

-- Create tokens table
CREATE TABLE IF NOT EXISTS public.tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create token_transactions table
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rewards table
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  token_cost INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  quantity_available INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_rewards table
CREATE TABLE IF NOT EXISTS public.user_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(50) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'expert')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create achievement_rules table
CREATE TABLE IF NOT EXISTS public.achievement_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL,
  rule_value JSONB NOT NULL,
  token_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to award tokens to a user
CREATE OR REPLACE FUNCTION award_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_token_record public.tokens%ROWTYPE;
BEGIN
  -- Check if user has a token record
  SELECT * INTO v_token_record
  FROM public.tokens
  WHERE user_id = p_user_id;
  
  -- Create token record if it doesn't exist
  IF v_token_record IS NULL THEN
    INSERT INTO public.tokens (user_id, balance, lifetime_earned, lifetime_spent)
    VALUES (p_user_id, p_amount, p_amount, 0);
  ELSE
    -- Update existing token record
    UPDATE public.tokens
    SET 
      balance = balance + p_amount,
      lifetime_earned = lifetime_earned + p_amount,
      last_updated = NOW()
    WHERE user_id = p_user_id;
  END IF;
  
  -- Create transaction record
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    reference_id,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    p_transaction_type,
    p_reference_id,
    p_description
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to spend tokens
CREATE OR REPLACE FUNCTION spend_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type VARCHAR,
  p_reference_id UUID DEFAULT NULL,
  p_description TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_token_record public.tokens%ROWTYPE;
BEGIN
  -- Check if user has a token record
  SELECT * INTO v_token_record
  FROM public.tokens
  WHERE user_id = p_user_id;
  
  -- Check if user exists and has enough tokens
  IF v_token_record IS NULL OR v_token_record.balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update token record
  UPDATE public.tokens
  SET 
    balance = balance - p_amount,
    lifetime_spent = lifetime_spent + p_amount,
    last_updated = NOW()
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    reference_id,
    description
  ) VALUES (
    p_user_id,
    -p_amount,
    p_transaction_type,
    p_reference_id,
    p_description
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to redeem a reward
CREATE OR REPLACE FUNCTION redeem_reward(
  p_user_id UUID,
  p_reward_id UUID
) RETURNS UUID AS $$
DECLARE
  v_reward_record public.rewards%ROWTYPE;
  v_user_reward_id UUID;
  v_success BOOLEAN;
BEGIN
  -- Check if reward exists and is active
  SELECT * INTO v_reward_record
  FROM public.rewards
  WHERE id = p_reward_id AND is_active = TRUE;
  
  -- Check if reward exists
  IF v_reward_record IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if reward is available (quantity)
  IF v_reward_record.quantity_available IS NOT NULL AND v_reward_record.quantity_available <= 0 THEN
    RETURN NULL;
  END IF;
  
  -- Check if reward is within date range
  IF (v_reward_record.start_date IS NOT NULL AND v_reward_record.start_date > NOW()) OR
     (v_reward_record.end_date IS NOT NULL AND v_reward_record.end_date < NOW()) THEN
    RETURN NULL;
  END IF;
  
  -- Spend tokens
  v_success := spend_tokens(
    p_user_id,
    v_reward_record.token_cost,
    'reward_redemption',
    p_reward_id,
    'Redeemed reward: ' || v_reward_record.name
  );
  
  -- If token spending failed, return null
  IF NOT v_success THEN
    RETURN NULL;
  END IF;
  
  -- Create user reward record
  INSERT INTO public.user_rewards (
    user_id,
    reward_id,
    status
  ) VALUES (
    p_user_id,
    p_reward_id,
    'pending'
  ) RETURNING id INTO v_user_reward_id;
  
  -- Update reward quantity if applicable
  IF v_reward_record.quantity_available IS NOT NULL THEN
    UPDATE public.rewards
    SET quantity_available = quantity_available - 1
    WHERE id = p_reward_id;
  END IF;
  
  RETURN v_user_reward_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to check achievement rules and award badges
CREATE OR REPLACE FUNCTION check_achievement_rule(
  p_user_id UUID,
  p_rule_type VARCHAR,
  p_rule_value JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  v_meets_criteria BOOLEAN := FALSE;
  v_count INTEGER;
BEGIN
  -- Different rule types have different criteria
  CASE p_rule_type
    WHEN 'completed_projects' THEN
      -- Check if user has completed the required number of projects
      SELECT COUNT(*) INTO v_count
      FROM public.projects
      WHERE contractor_id = p_user_id AND status = 'completed';
      
      v_meets_criteria := v_count >= (p_rule_value->>'count')::INTEGER;
      
    WHEN 'token_balance' THEN
      -- Check if user has the required token balance
      SELECT COUNT(*) INTO v_count
      FROM public.tokens
      WHERE user_id = p_user_id AND balance >= (p_rule_value->>'amount')::INTEGER;
      
      v_meets_criteria := v_count > 0;
      
    WHEN 'membership_duration' THEN
      -- Check if user has been a member for the required duration (in days)
      SELECT COUNT(*) INTO v_count
      FROM public.profiles
      WHERE id = p_user_id AND 
            created_at <= (NOW() - ((p_rule_value->>'days')::INTEGER * INTERVAL '1 day'));
      
      v_meets_criteria := v_count > 0;
      
    WHEN 'received_reviews' THEN
      -- Check if user has received the required number of reviews with minimum rating
      SELECT COUNT(*) INTO v_count
      FROM public.reviews
      WHERE reviewee_id = p_user_id AND rating >= (p_rule_value->>'min_rating')::INTEGER;
      
      v_meets_criteria := v_count >= (p_rule_value->>'count')::INTEGER;
      
    ELSE
      -- Unknown rule type
      v_meets_criteria := FALSE;
  END CASE;
  
  RETURN v_meets_criteria;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badges(p_user_id UUID) RETURNS INTEGER AS $$
DECLARE
  v_rule RECORD;
  v_badge_id UUID;
  v_awarded_count INTEGER := 0;
  v_already_has_badge BOOLEAN;
BEGIN
  -- Loop through all achievement rules
  FOR v_rule IN (
    SELECT ar.id, ar.badge_id, ar.rule_type, ar.rule_value, ar.token_reward
    FROM public.achievement_rules ar
    JOIN public.badges b ON ar.badge_id = b.id
    WHERE b.is_active = TRUE
  ) LOOP
    -- Check if user already has this badge
    SELECT EXISTS (
      SELECT 1 FROM public.user_badges
      WHERE user_id = p_user_id AND badge_id = v_rule.badge_id
    ) INTO v_already_has_badge;
    
    -- If user doesn't have the badge and meets the criteria, award it
    IF NOT v_already_has_badge AND check_achievement_rule(p_user_id, v_rule.rule_type, v_rule.rule_value) THEN
      -- Award the badge
      INSERT INTO public.user_badges (user_id, badge_id)
      VALUES (p_user_id, v_rule.badge_id);
      
      -- Award tokens if applicable
      IF v_rule.token_reward > 0 THEN
        PERFORM award_tokens(
          p_user_id,
          v_rule.token_reward,
          'badge_reward',
          v_rule.badge_id,
          'Awarded for earning a badge'
        );
      END IF;
      
      v_awarded_count := v_awarded_count + 1;
    END IF;
  END LOOP;
  
  RETURN v_awarded_count;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 0;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_rules ENABLE ROW LEVEL SECURITY;

-- Tokens policies
CREATE POLICY "Users can view their own tokens"
ON public.tokens FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Token transactions policies
CREATE POLICY "Users can view their own token transactions"
ON public.token_transactions FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Rewards policies
CREATE POLICY "Everyone can view active rewards"
ON public.rewards FOR SELECT
USING (
  is_active = TRUE OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Admins can manage rewards"
ON public.rewards
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- User rewards policies
CREATE POLICY "Users can view their own redeemed rewards"
ON public.user_rewards FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Users can redeem rewards"
ON public.user_rewards FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Admins can update user rewards"
ON public.user_rewards FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Badges policies
CREATE POLICY "Everyone can view badges"
ON public.badges FOR SELECT
USING (true);

CREATE POLICY "Admins can manage badges"
ON public.badges
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- User badges policies
CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Users can update their own badges"
ON public.user_badges FOR UPDATE
USING (
  user_id = auth.uid()
);

-- Achievement rules policies
CREATE POLICY "Admins can manage achievement rules"
ON public.achievement_rules
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Everyone can view achievement rules"
ON public.achievement_rules FOR SELECT
USING (true);

-- Insert default badges
INSERT INTO public.badges (name, description, image_url, category, difficulty, is_active)
VALUES 
  ('Early Adopter', 'Joined during the platform''s first month', '/badges/early_adopter.png', 'membership', 'beginner', true),
  ('Project Master', 'Completed 10 projects successfully', '/badges/project_master.png', 'projects', 'intermediate', true),
  ('Top Rated', 'Maintained a 4.8+ rating for 3 months', '/badges/top_rated.png', 'reputation', 'advanced', true),
  ('Community Builder', 'Referred 5 new members to the platform', '/badges/community_builder.png', 'community', 'intermediate', true),
  ('Token Collector', 'Earned 1000+ tokens', '/badges/token_collector.png', 'rewards', 'intermediate', true)
ON CONFLICT DO NOTHING;

-- Insert achievement rules for the default badges
INSERT INTO public.achievement_rules (badge_id, rule_type, rule_value, token_reward)
VALUES 
  ((SELECT id FROM public.badges WHERE name = 'Early Adopter'), 
   'membership_duration', 
   '{"days": 30}', 
   50),
   
  ((SELECT id FROM public.badges WHERE name = 'Project Master'), 
   'completed_projects', 
   '{"count": 10}', 
   100),
   
  ((SELECT id FROM public.badges WHERE name = 'Top Rated'), 
   'received_reviews', 
   '{"min_rating": 4.8, "count": 5}', 
   150),
   
  ((SELECT id FROM public.badges WHERE name = 'Community Builder'), 
   'token_balance', 
   '{"amount": 500}', 
   75)
ON CONFLICT DO NOTHING;

-- Insert default rewards
INSERT INTO public.rewards (name, description, image_url, token_cost, is_active, quantity_available)
VALUES 
  ('Featured Profile', 'Get your profile featured on the homepage for 1 week', '/rewards/featured_profile.png', 500, true, null),
  ('Premium Support', '1 month of priority customer support', '/rewards/premium_support.png', 300, true, null),
  ('Custom Badge', 'Design your own custom badge', '/rewards/custom_badge.png', 1000, true, 10),
  ('Platform Fee Discount', '10% off platform fees for your next project', '/rewards/fee_discount.png', 750, true, 50),
  ('Charity Donation', 'We donate $25 to a charity of your choice', '/rewards/charity.png', 250, true, null)
ON CONFLICT DO NOTHING;

-- Commit transaction
COMMIT;
