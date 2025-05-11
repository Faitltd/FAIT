# Growth Strategy Database Schema

This document outlines the database schema changes needed to support the FAIT Co-op growth strategy implementation.

## Overview

The following database tables will be added or modified to support our growth strategy features:

1. Verification System
2. Referral Program
3. Points and Achievements System
4. Member Forums
5. Growth Analytics

## Schema Details

### 1. Verification System

```sql
-- Service agent verification requests
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  review_date TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification documents
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_request_id UUID REFERENCES verification_requests(id) NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- license, insurance, certification, etc.
  document_url TEXT NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add verification status to profiles
ALTER TABLE profiles ADD COLUMN verification_status VARCHAR(20) DEFAULT 'unverified';
ALTER TABLE profiles ADD COLUMN verification_date TIMESTAMP WITH TIME ZONE;
```

### 2. Referral Program

```sql
-- Referral codes
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Referral relationships
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) NOT NULL,
  referred_id UUID REFERENCES auth.users(id) NOT NULL,
  referral_code VARCHAR(20) REFERENCES referral_codes(code),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, converted, rewarded
  referred_user_type VARCHAR(20) NOT NULL, -- client, service_agent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  converted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(referred_id)
);

-- Referral rewards
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referrals(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reward_type VARCHAR(20) NOT NULL, -- points, credit, etc.
  reward_amount NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processed, failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Referral conversion events
CREATE TABLE referral_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID REFERENCES referrals(id) NOT NULL,
  conversion_type VARCHAR(50) NOT NULL, -- verification, first_transaction, etc.
  conversion_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Points and Achievements System

```sql
-- Points configuration
CREATE TABLE point_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_key VARCHAR(50) UNIQUE NOT NULL, -- profile_complete, first_booking, etc.
  description TEXT NOT NULL,
  points_value INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL, -- client, service_agent, both
  is_repeatable BOOLEAN NOT NULL DEFAULT false,
  cooldown_period INTEGER, -- in hours, NULL if not repeatable
  max_times INTEGER, -- NULL for unlimited
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User points balance
CREATE TABLE user_points (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  total_points INTEGER NOT NULL DEFAULT 0,
  available_points INTEGER NOT NULL DEFAULT 0,
  lifetime_points INTEGER NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Points transactions
CREATE TABLE point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_key VARCHAR(50) REFERENCES point_actions(action_key),
  points_amount INTEGER NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- earn, spend, expire, adjust
  reference_type VARCHAR(50), -- referral, booking, forum_post, etc.
  reference_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  user_type VARCHAR(20) NOT NULL, -- client, service_agent, both
  category VARCHAR(50) NOT NULL, -- onboarding, engagement, expertise, etc.
  difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard
  points_reward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement criteria
CREATE TABLE achievement_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  criteria_type VARCHAR(50) NOT NULL, -- action_count, points_earned, etc.
  criteria_key VARCHAR(50), -- specific action key if applicable
  threshold_value INTEGER NOT NULL, -- count, points, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  achievement_id UUID REFERENCES achievements(id) NOT NULL,
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER, -- NULL if completed, otherwise percentage or count
  UNIQUE(user_id, achievement_id)
);
```

### 4. Member Forums

```sql
-- Forum categories
CREATE TABLE forum_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon_url TEXT,
  parent_id UUID REFERENCES forum_categories(id),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Forum threads
CREATE TABLE forum_threads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES forum_categories(id) NOT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  is_sticky BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_post_id UUID,
  last_post_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- Forum posts
CREATE TABLE forum_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id UUID REFERENCES forum_threads(id) NOT NULL,
  author_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update last_post_id foreign key
ALTER TABLE forum_threads ADD CONSTRAINT fk_last_post_id FOREIGN KEY (last_post_id) REFERENCES forum_posts(id);

-- Forum subscriptions
CREATE TABLE forum_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  thread_id UUID REFERENCES forum_threads(id),
  category_id UUID REFERENCES forum_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, category_id),
  CHECK ((thread_id IS NULL AND category_id IS NOT NULL) OR (thread_id IS NOT NULL AND category_id IS NULL))
);

-- Forum moderation
CREATE TABLE forum_moderators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category_id UUID REFERENCES forum_categories(id),
  is_global BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id),
  CHECK ((category_id IS NULL AND is_global = true) OR (category_id IS NOT NULL))
);

-- Forum reports
CREATE TABLE forum_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id) NOT NULL,
  post_id UUID REFERENCES forum_posts(id),
  thread_id UUID REFERENCES forum_threads(id),
  reason VARCHAR(50) NOT NULL,
  details TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, resolved, dismissed
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK ((post_id IS NULL AND thread_id IS NOT NULL) OR (post_id IS NOT NULL AND thread_id IS NULL))
);
```

### 5. Growth Analytics

```sql
-- User activity log
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  activity_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth metrics
CREATE TABLE growth_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- acquisition, activation, retention, etc.
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  segment VARCHAR(50), -- user type, plan, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric_date, metric_type, metric_name, segment)
);

-- Cohort definitions
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cohort members
CREATE TABLE cohort_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cohort_id, user_id)
);

-- A/B test definitions
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, active, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B test variants
CREATE TABLE ab_test_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES ab_tests(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  allocation_percentage INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, name)
);

-- A/B test assignments
CREATE TABLE ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_id UUID REFERENCES ab_tests(id) NOT NULL,
  variant_id UUID REFERENCES ab_test_variants(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(test_id, user_id)
);

-- A/B test conversions
CREATE TABLE ab_test_conversions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES ab_test_assignments(id) NOT NULL,
  conversion_type VARCHAR(50) NOT NULL,
  conversion_value NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row-Level Security Policies

```sql
-- Verification requests
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own verification requests"
  ON verification_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification requests"
  ON verification_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update verification requests"
  ON verification_requests FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view referrals they've made"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

-- Points and achievements
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own points"
  ON user_points FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only system can modify points"
  ON user_points FOR ALL
  USING (false);

ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only system can modify achievements"
  ON user_achievements FOR ALL
  USING (false);

-- Forums
ALTER TABLE forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active forum threads"
  ON forum_threads FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create forum threads"
  ON forum_threads FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors and moderators can update forum threads"
  ON forum_threads FOR UPDATE
  USING (
    auth.uid() = author_id OR
    auth.uid() IN (
      SELECT user_id FROM forum_moderators
      WHERE is_global = true OR category_id = forum_threads.category_id
    )
  );

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum posts"
  ON forum_posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create forum posts"
  ON forum_posts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authors can update their own forum posts"
  ON forum_posts FOR UPDATE
  USING (auth.uid() = author_id);
```

## Triggers and Functions

```sql
-- Auto-generate referral code on user creation
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  code TEXT;
  code_exists BOOLEAN;
BEGIN
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

CREATE TRIGGER create_referral_code_on_user_creation
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION generate_referral_code();

-- Update forum thread last post information
CREATE OR REPLACE FUNCTION update_thread_last_post()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE forum_threads
  SET 
    last_post_id = NEW.id,
    last_post_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.thread_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_thread_after_post
AFTER INSERT ON forum_posts
FOR EACH ROW
EXECUTE FUNCTION update_thread_last_post();

-- Award points for actions
CREATE OR REPLACE FUNCTION award_points_for_action()
RETURNS TRIGGER AS $$
DECLARE
  action_record RECORD;
  can_award BOOLEAN := true;
  cooldown_passed BOOLEAN := true;
  times_performed INTEGER;
BEGIN
  -- Get the action details
  SELECT * INTO action_record FROM point_actions WHERE action_key = NEW.action_key;
  
  -- Check if action exists
  IF NOT FOUND THEN
    RETURN NEW;
  END IF;
  
  -- Check if action is repeatable
  IF NOT action_record.is_repeatable THEN
    -- Check if user has already performed this action
    SELECT COUNT(*) > 0 INTO can_award
    FROM point_transactions
    WHERE user_id = NEW.user_id AND action_key = NEW.action_key AND transaction_type = 'earn';
    
    IF NOT can_award THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Check cooldown period if applicable
  IF action_record.cooldown_period IS NOT NULL THEN
    SELECT NOT EXISTS (
      SELECT 1 FROM point_transactions
      WHERE user_id = NEW.user_id 
        AND action_key = NEW.action_key 
        AND transaction_type = 'earn'
        AND created_at > (NOW() - (action_record.cooldown_period || ' hours')::INTERVAL)
    ) INTO cooldown_passed;
    
    IF NOT cooldown_passed THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Check max times if applicable
  IF action_record.max_times IS NOT NULL THEN
    SELECT COUNT(*) INTO times_performed
    FROM point_transactions
    WHERE user_id = NEW.user_id AND action_key = NEW.action_key AND transaction_type = 'earn';
    
    IF times_performed >= action_record.max_times THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- Award points
  INSERT INTO point_transactions (
    user_id, 
    action_key, 
    points_amount, 
    transaction_type,
    reference_type,
    reference_id,
    description
  ) VALUES (
    NEW.user_id,
    NEW.action_key,
    action_record.points_value,
    'earn',
    NEW.reference_type,
    NEW.reference_id,
    'Points earned for ' || action_record.description
  );
  
  -- Update user points balance
  INSERT INTO user_points (user_id, total_points, available_points, lifetime_points)
  VALUES (NEW.user_id, action_record.points_value, action_record.points_value, action_record.points_value)
  ON CONFLICT (user_id) DO UPDATE
  SET 
    total_points = user_points.total_points + action_record.points_value,
    available_points = user_points.available_points + action_record.points_value,
    lifetime_points = user_points.lifetime_points + action_record.points_value,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER award_points_on_activity
AFTER INSERT ON user_activity_log
FOR EACH ROW
WHEN (NEW.activity_type = 'point_action')
EXECUTE FUNCTION award_points_for_action();
```

## Initial Data

```sql
-- Initial point actions
INSERT INTO point_actions (action_key, description, points_value, user_type, is_repeatable, cooldown_period, max_times) VALUES
('profile_complete', 'Completing your profile', 50, 'both', false, NULL, NULL),
('verification_complete', 'Completing service agent verification', 100, 'service_agent', false, NULL, NULL),
('refer_service_agent', 'Referring a service agent who completes verification', 200, 'both', true, NULL, NULL),
('refer_client', 'Referring a client who completes first transaction', 100, 'both', true, NULL, NULL),
('first_transaction', 'Completing your first transaction', 50, 'both', false, NULL, NULL),
('create_forum_thread', 'Creating a forum thread', 10, 'both', true, 24, 3),
('create_forum_post', 'Posting in the forum', 5, 'both', true, 1, 10),
('receive_review', 'Receiving a review', 20, 'service_agent', true, NULL, NULL),
('leave_review', 'Leaving a review', 10, 'client', true, NULL, NULL),
('daily_login', 'Logging in daily', 5, 'both', true, 24, NULL);

-- Initial achievements
INSERT INTO achievements (key, name, description, icon_url, user_type, category, difficulty, points_reward) VALUES
('welcome', 'Welcome Aboard', 'Join the FAIT Co-op platform', '/icons/achievements/welcome.png', 'both', 'onboarding', 'easy', 10),
('profile_hero', 'Profile Hero', 'Complete your profile with all information', '/icons/achievements/profile.png', 'both', 'onboarding', 'easy', 25),
('verified_pro', 'Verified Professional', 'Complete the service agent verification process', '/icons/achievements/verified.png', 'service_agent', 'verification', 'medium', 50),
('referral_starter', 'Referral Starter', 'Refer your first member to the platform', '/icons/achievements/referral.png', 'both', 'growth', 'easy', 25),
('referral_pro', 'Referral Pro', 'Refer 5 members who join the platform', '/icons/achievements/referral_pro.png', 'both', 'growth', 'medium', 100),
('forum_contributor', 'Forum Contributor', 'Make 10 posts in the community forums', '/icons/achievements/forum.png', 'both', 'community', 'easy', 50),
('forum_leader', 'Forum Leader', 'Start 5 discussion threads in the forums', '/icons/achievements/forum_leader.png', 'both', 'community', 'medium', 75),
('transaction_first', 'First Transaction', 'Complete your first transaction on the platform', '/icons/achievements/transaction.png', 'both', 'business', 'easy', 25),
('transaction_regular', 'Regular Customer', 'Complete 5 transactions on the platform', '/icons/achievements/transaction_regular.png', 'both', 'business', 'medium', 100);

-- Achievement criteria
INSERT INTO achievement_criteria (achievement_id, criteria_type, criteria_key, threshold_value) VALUES
((SELECT id FROM achievements WHERE key = 'profile_hero'), 'profile_completion', NULL, 100),
((SELECT id FROM achievements WHERE key = 'verified_pro'), 'verification_status', NULL, 1),
((SELECT id FROM achievements WHERE key = 'referral_starter'), 'referral_count', NULL, 1),
((SELECT id FROM achievements WHERE key = 'referral_pro'), 'referral_count', NULL, 5),
((SELECT id FROM achievements WHERE key = 'forum_contributor'), 'forum_post_count', NULL, 10),
((SELECT id FROM achievements WHERE key = 'forum_leader'), 'forum_thread_count', NULL, 5),
((SELECT id FROM achievements WHERE key = 'transaction_first'), 'transaction_count', NULL, 1),
((SELECT id FROM achievements WHERE key = 'transaction_regular'), 'transaction_count', NULL, 5);

-- Initial forum categories
INSERT INTO forum_categories (name, description, slug, icon_url, display_order) VALUES
('General Discussion', 'General discussion about the FAIT Co-op platform', 'general-discussion', '/icons/forum/general.png', 1),
('Service Agent Corner', 'Discussion for service agents', 'service-agent-corner', '/icons/forum/service-agent.png', 2),
('Client Lounge', 'Discussion for clients', 'client-lounge', '/icons/forum/client.png', 3),
('Project Showcase', 'Share and discuss completed projects', 'project-showcase', '/icons/forum/showcase.png', 4),
('Help & Support', 'Get help with using the platform', 'help-support', '/icons/forum/help.png', 5);

-- Service agent subcategories
INSERT INTO forum_categories (name, description, slug, icon_url, parent_id, display_order) VALUES
('Licensing & Certification', 'Discussions about licensing and certification', 'licensing-certification', '/icons/forum/license.png', (SELECT id FROM forum_categories WHERE slug = 'service-agent-corner'), 1),
('Business Growth', 'Tips and strategies for growing your business', 'business-growth', '/icons/forum/growth.png', (SELECT id FROM forum_categories WHERE slug = 'service-agent-corner'), 2),
('Tools & Equipment', 'Discussions about tools and equipment', 'tools-equipment', '/icons/forum/tools.png', (SELECT id FROM forum_categories WHERE slug = 'service-agent-corner'), 3);

-- Client subcategories
INSERT INTO forum_categories (name, description, slug, icon_url, parent_id, display_order) VALUES
('Project Planning', 'Planning your construction or renovation project', 'project-planning', '/icons/forum/planning.png', (SELECT id FROM forum_categories WHERE slug = 'client-lounge'), 1),
('Finding the Right Pro', 'Tips for finding the right service agent', 'finding-pros', '/icons/forum/find.png', (SELECT id FROM forum_categories WHERE slug = 'client-lounge'), 2),
('DIY Corner', 'Discussion about DIY projects and tips', 'diy-corner', '/icons/forum/diy.png', (SELECT id FROM forum_categories WHERE slug = 'client-lounge'), 3);
```

## Migration Strategy

1. Create a migration file with the above schema changes
2. Apply the migration in a staging environment first
3. Test all functionality thoroughly
4. Schedule a maintenance window for production deployment
5. Apply the migration to production
6. Verify all tables and relationships are correctly created
7. Seed initial data
8. Test functionality in production

## Indexes and Performance Considerations

```sql
-- Verification system indexes
CREATE INDEX idx_verification_requests_user_id ON verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON verification_requests(status);
CREATE INDEX idx_verification_documents_request_id ON verification_documents(verification_request_id);

-- Referral program indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_status ON referrals(status);
CREATE INDEX idx_referral_rewards_referral_id ON referral_rewards(referral_id);
CREATE INDEX idx_referral_rewards_user_id ON referral_rewards(user_id);

-- Points and achievements indexes
CREATE INDEX idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX idx_point_transactions_action_key ON point_transactions(action_key);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_achievement_id ON user_achievements(achievement_id);

-- Forum indexes
CREATE INDEX idx_forum_threads_category_id ON forum_threads(category_id);
CREATE INDEX idx_forum_threads_author_id ON forum_threads(author_id);
CREATE INDEX idx_forum_posts_thread_id ON forum_posts(thread_id);
CREATE INDEX idx_forum_posts_author_id ON forum_posts(author_id);
CREATE INDEX idx_forum_subscriptions_user_id ON forum_subscriptions(user_id);
CREATE INDEX idx_forum_moderators_user_id ON forum_moderators(user_id);
CREATE INDEX idx_forum_moderators_category_id ON forum_moderators(category_id);

-- Analytics indexes
CREATE INDEX idx_user_activity_log_user_id ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_activity_type ON user_activity_log(activity_type);
CREATE INDEX idx_growth_metrics_metric_date ON growth_metrics(metric_date);
CREATE INDEX idx_growth_metrics_metric_type ON growth_metrics(metric_type);
CREATE INDEX idx_cohort_members_cohort_id ON cohort_members(cohort_id);
CREATE INDEX idx_cohort_members_user_id ON cohort_members(user_id);
CREATE INDEX idx_ab_test_assignments_user_id ON ab_test_assignments(user_id);
CREATE INDEX idx_ab_test_assignments_test_id ON ab_test_assignments(test_id);
```

This schema provides the foundation for implementing our growth strategy features. It's designed to be scalable, performant, and secure with appropriate row-level security policies.
