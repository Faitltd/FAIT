-- Initial Challenges Seed Data

-- Client Challenges
INSERT INTO challenges (title, description, category, difficulty, points, start_date, end_date, is_active, is_repeatable, cooldown_days)
VALUES
  -- Easy Challenges
  ('Profile Perfectionist', 'Complete your profile with all information including profile picture', 'profile', 'easy', 50, '2024-01-01', NULL, true, false, NULL),
  ('Service Explorer', 'View at least 10 different service listings', 'service', 'easy', 30, '2024-01-01', NULL, true, true, 7),
  ('Feedback Provider', 'Leave a review for a service you''ve used', 'community', 'easy', 40, '2024-01-01', NULL, true, true, 14),
  ('Forum Newcomer', 'Create your first post in the community forum', 'community', 'easy', 30, '2024-01-01', NULL, true, false, NULL),
  ('Estimate Requester', 'Request your first service estimate', 'service', 'easy', 40, '2024-01-01', NULL, true, false, NULL),
  
  -- Medium Challenges
  ('Service Connoisseur', 'Book services from 3 different service providers', 'service', 'medium', 75, '2024-01-01', NULL, true, true, 30),
  ('Community Contributor', 'Create 5 posts or replies in the community forum', 'community', 'medium', 60, '2024-01-01', NULL, true, true, 14),
  ('Referral Champion', 'Refer a friend who joins the platform', 'referral', 'medium', 100, '2024-01-01', NULL, true, true, 30),
  ('Warranty Wizard', 'Register a warranty for a completed service', 'service', 'medium', 70, '2024-01-01', NULL, true, true, 60),
  
  -- Hard Challenges
  ('Platform Advocate', 'Refer 5 friends who join the platform', 'referral', 'hard', 200, '2024-01-01', NULL, true, false, NULL),
  ('Service Aficionado', 'Book services from 10 different service providers', 'service', 'hard', 150, '2024-01-01', NULL, true, false, NULL),
  ('Community Pillar', 'Create 20 helpful posts or replies in the community forum', 'community', 'hard', 180, '2024-01-01', NULL, true, false, NULL),
  
  -- Expert Challenges
  ('Platform Ambassador', 'Complete all client challenges', 'special', 'expert', 500, '2024-01-01', NULL, true, false, NULL);

-- Service Agent Challenges
INSERT INTO challenges (title, description, category, difficulty, points, start_date, end_date, is_active, is_repeatable, cooldown_days)
VALUES
  -- Easy Challenges
  ('Service Lister', 'Create your first service listing', 'service', 'easy', 50, '2024-01-01', NULL, true, false, NULL),
  ('Verification Seeker', 'Complete your verification process', 'verification', 'easy', 100, '2024-01-01', NULL, true, false, NULL),
  ('Quick Responder', 'Respond to a client inquiry within 2 hours', 'service', 'easy', 30, '2024-01-01', NULL, true, true, 1),
  ('Forum Participant', 'Answer a question in the community forum', 'community', 'easy', 40, '2024-01-01', NULL, true, true, 3),
  ('Estimate Provider', 'Create your first service estimate', 'service', 'easy', 40, '2024-01-01', NULL, true, false, NULL),
  
  -- Medium Challenges
  ('Service Portfolio', 'Create 5 different service listings', 'service', 'medium', 80, '2024-01-01', NULL, true, false, NULL),
  ('Booking Ace', 'Complete 5 service bookings', 'service', 'medium', 100, '2024-01-01', NULL, true, true, 30),
  ('Knowledge Sharer', 'Create a helpful guide in the community forum', 'community', 'medium', 75, '2024-01-01', NULL, true, true, 14),
  ('Warranty Provider', 'Offer warranties on all your services', 'service', 'medium', 70, '2024-01-01', NULL, true, false, NULL),
  
  -- Hard Challenges
  ('Service Expert', 'Complete 20 service bookings with 4+ star ratings', 'service', 'hard', 200, '2024-01-01', NULL, true, false, NULL),
  ('Community Expert', 'Answer 20 questions in the community forum', 'community', 'hard', 150, '2024-01-01', NULL, true, false, NULL),
  ('Referral Network', 'Refer 3 other service providers who join the platform', 'referral', 'hard', 180, '2024-01-01', NULL, true, false, NULL),
  
  -- Expert Challenges
  ('Service Master', 'Complete all service agent challenges', 'special', 'expert', 500, '2024-01-01', NULL, true, false, NULL);

-- Common Challenges for All Users
INSERT INTO challenges (title, description, category, difficulty, points, start_date, end_date, is_active, is_repeatable, cooldown_days)
VALUES
  -- Daily/Weekly Challenges
  ('Daily Login', 'Log in to the platform', 'activity', 'easy', 10, '2024-01-01', NULL, true, true, 1),
  ('Weekly Explorer', 'Use the platform on 5 different days in a week', 'activity', 'medium', 50, '2024-01-01', NULL, true, true, 7),
  ('Feature Explorer', 'Try a new platform feature you haven''t used before', 'activity', 'easy', 20, '2024-01-01', NULL, true, true, 14),
  
  -- Special Challenges
  ('Early Adopter', 'Join the platform during its first year', 'special', 'easy', 100, '2024-01-01', '2025-01-01', true, false, NULL),
  ('Feedback Provider', 'Provide feedback on the platform through the feedback form', 'special', 'easy', 50, '2024-01-01', NULL, true, true, 30),
  ('Bug Hunter', 'Report a bug or issue with the platform', 'special', 'medium', 75, '2024-01-01', NULL, true, true, 30);

-- Now add requirements for each challenge
-- Profile Perfectionist requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Profile Perfectionist'), 'profile', 'profile_update', 1, NULL);

-- Service Explorer requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Service Explorer'), 'service', 'service_view', 10, NULL);

-- Feedback Provider requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Feedback Provider'), 'review', 'review_create', 1, NULL);

-- Forum Newcomer requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Forum Newcomer'), 'forum', 'forum_post_create', 1, NULL);

-- Estimate Requester requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Estimate Requester'), 'estimate', 'estimate_request', 1, NULL);

-- Service Connoisseur requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Service Connoisseur'), 'booking', 'service_book', 3, NULL);

-- Community Contributor requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Community Contributor'), 'forum', 'forum_post_create', 5, NULL);

-- Referral Champion requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Referral Champion'), 'referral', 'referral_signup', 1, NULL);

-- Warranty Wizard requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Warranty Wizard'), 'warranty', 'warranty_register', 1, NULL);

-- Platform Advocate requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Platform Advocate'), 'referral', 'referral_signup', 5, NULL);

-- Service Aficionado requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Service Aficionado'), 'booking', 'service_book', 10, NULL);

-- Community Pillar requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Community Pillar'), 'forum', 'forum_post_create', 20, NULL);

-- Service Lister requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Service Lister'), 'service', 'service_create', 1, NULL);

-- Verification Seeker requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Verification Seeker'), 'verification', 'verification_complete', 1, NULL);

-- Quick Responder requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Quick Responder'), 'message', 'message_quick_reply', 1, NULL);

-- Forum Participant requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Forum Participant'), 'forum', 'forum_question_answer', 1, NULL);

-- Estimate Provider requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Estimate Provider'), 'estimate', 'estimate_create', 1, NULL);

-- Service Portfolio requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Service Portfolio'), 'service', 'service_create', 5, NULL);

-- Booking Ace requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Booking Ace'), 'booking', 'booking_complete', 5, NULL);

-- Knowledge Sharer requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Knowledge Sharer'), 'forum', 'forum_guide_create', 1, NULL);

-- Warranty Provider requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Warranty Provider'), 'warranty', 'warranty_offer_all', 1, NULL);

-- Service Expert requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Service Expert'), 'booking', 'booking_complete_rated', 20, NULL);

-- Community Expert requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Community Expert'), 'forum', 'forum_question_answer', 20, NULL);

-- Referral Network requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Referral Network'), 'referral', 'service_agent_referral', 3, NULL);

-- Daily Login requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Daily Login'), 'activity', 'login', 1, NULL);

-- Weekly Explorer requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Weekly Explorer'), 'activity', 'daily_login', 5, NULL);

-- Feature Explorer requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Feature Explorer'), 'activity', 'new_feature_use', 1, NULL);

-- Early Adopter requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Early Adopter'), 'special', 'signup', 1, NULL);

-- Feedback Provider requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Feedback Provider'), 'special', 'feedback_submit', 1, NULL);

-- Bug Hunter requirements
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Bug Hunter'), 'special', 'bug_report', 1, NULL);

-- Add rewards for challenges
-- Points rewards are already in the challenges table, but let's add badges, titles, and other rewards

-- Badge rewards
INSERT INTO challenge_rewards (challenge_id, type, value, metadata)
VALUES
  -- Client badges
  ((SELECT id FROM challenges WHERE title = 'Profile Perfectionist'), 'badge', 'profile_perfectionist', '{"name": "Profile Perfectionist", "description": "Completed your profile with all information"}'),
  ((SELECT id FROM challenges WHERE title = 'Service Explorer'), 'badge', 'service_explorer', '{"name": "Service Explorer", "description": "Viewed 10 different service listings"}'),
  ((SELECT id FROM challenges WHERE title = 'Platform Advocate'), 'badge', 'platform_advocate', '{"name": "Platform Advocate", "description": "Referred 5 friends to the platform"}'),
  ((SELECT id FROM challenges WHERE title = 'Platform Ambassador'), 'badge', 'platform_ambassador', '{"name": "Platform Ambassador", "description": "Completed all client challenges"}'),
  
  -- Service agent badges
  ((SELECT id FROM challenges WHERE title = 'Verification Seeker'), 'badge', 'verified_agent', '{"name": "Verified Agent", "description": "Completed the verification process"}'),
  ((SELECT id FROM challenges WHERE title = 'Service Expert'), 'badge', 'service_expert', '{"name": "Service Expert", "description": "Completed 20 service bookings with 4+ star ratings"}'),
  ((SELECT id FROM challenges WHERE title = 'Service Master'), 'badge', 'service_master', '{"name": "Service Master", "description": "Completed all service agent challenges"}'),
  
  -- Common badges
  ((SELECT id FROM challenges WHERE title = 'Early Adopter'), 'badge', 'early_adopter', '{"name": "Early Adopter", "description": "Joined the platform during its first year"}'),
  ((SELECT id FROM challenges WHERE title = 'Bug Hunter'), 'badge', 'bug_hunter', '{"name": "Bug Hunter", "description": "Reported a bug or issue with the platform"}');

-- Title rewards
INSERT INTO challenge_rewards (challenge_id, type, value, metadata)
VALUES
  -- Client titles
  ((SELECT id FROM challenges WHERE title = 'Community Pillar'), 'title', 'Community Pillar', NULL),
  ((SELECT id FROM challenges WHERE title = 'Platform Ambassador'), 'title', 'Platform Ambassador', NULL),
  
  -- Service agent titles
  ((SELECT id FROM challenges WHERE title = 'Service Expert'), 'title', 'Service Expert', NULL),
  ((SELECT id FROM challenges WHERE title = 'Community Expert'), 'title', 'Community Expert', NULL),
  ((SELECT id FROM challenges WHERE title = 'Service Master'), 'title', 'Service Master', NULL);

-- Feature unlock rewards
INSERT INTO challenge_rewards (challenge_id, type, value, metadata)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Verification Seeker'), 'feature_unlock', 'verified_badge', '{"description": "Display a verified badge on your profile and listings"}'),
  ((SELECT id FROM challenges WHERE title = 'Service Expert'), 'feature_unlock', 'featured_listing', '{"description": "Your listings can be featured in search results"}');

-- Discount rewards
INSERT INTO challenge_rewards (challenge_id, type, value, metadata)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Referral Champion'), 'discount', '10', '{"description": "10% discount on your next service booking", "service_type": "any"}'),
  ((SELECT id FROM challenges WHERE title = 'Platform Advocate'), 'discount', '20', '{"description": "20% discount on your next service booking", "service_type": "any"}');
