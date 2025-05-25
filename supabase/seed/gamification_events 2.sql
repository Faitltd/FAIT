-- Initial Events Seed Data

-- Create seasonal and special events
INSERT INTO events (title, description, type, start_date, end_date, is_active)
VALUES
  -- Current/upcoming events
  ('Spring Home Improvement', 'Complete home improvement challenges this spring for special rewards!', 'seasonal', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', true),
  ('New User Welcome', 'Special event for new users to learn about the platform and earn rewards', 'special', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', true),
  ('Community Week', 'Participate in community activities and discussions for bonus points', 'community', CURRENT_DATE + INTERVAL '15 days', CURRENT_DATE + INTERVAL '22 days', true),
  ('Service Provider Spotlight', 'Highlight your services and expertise during this special promotional event', 'promotional', CURRENT_DATE + INTERVAL '30 days', CURRENT_DATE + INTERVAL '44 days', true),
  
  -- Future events
  ('Summer Projects', 'Complete summer project challenges for special rewards!', 'seasonal', CURRENT_DATE + INTERVAL '60 days', CURRENT_DATE + INTERVAL '90 days', false),
  ('Contractor Appreciation', 'Special event celebrating our service providers with bonuses and rewards', 'special', CURRENT_DATE + INTERVAL '45 days', CURRENT_DATE + INTERVAL '52 days', false),
  ('Referral Drive', 'Earn extra rewards for referring friends and colleagues to the platform', 'promotional', CURRENT_DATE + INTERVAL '20 days', CURRENT_DATE + INTERVAL '50 days', false);

-- Create challenges for the Spring Home Improvement event
INSERT INTO challenges (title, description, category, difficulty, points, start_date, end_date, is_active, is_repeatable, cooldown_days)
VALUES
  ('Spring Cleaning', 'Book a cleaning service through the platform', 'service', 'easy', 50, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', true, false, NULL),
  ('Garden Refresh', 'Book a landscaping or gardening service', 'service', 'medium', 75, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', true, false, NULL),
  ('Home Maintenance', 'Book any home maintenance service', 'service', 'easy', 50, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', true, false, NULL),
  ('Spring Renovation', 'Start a renovation project through the platform', 'service', 'hard', 150, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days', true, false, NULL);

-- Add requirements for Spring Home Improvement challenges
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Spring Cleaning'), 'booking', 'service_book', 1, 'cleaning'),
  ((SELECT id FROM challenges WHERE title = 'Garden Refresh'), 'booking', 'service_book', 1, 'landscaping'),
  ((SELECT id FROM challenges WHERE title = 'Home Maintenance'), 'booking', 'service_book', 1, 'maintenance'),
  ((SELECT id FROM challenges WHERE title = 'Spring Renovation'), 'booking', 'service_book', 1, 'renovation');

-- Add rewards for Spring Home Improvement challenges
INSERT INTO challenge_rewards (challenge_id, type, value, metadata)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Spring Cleaning'), 'badge', 'spring_cleaner', '{"name": "Spring Cleaner", "description": "Booked a cleaning service during Spring Home Improvement event"}'),
  ((SELECT id FROM challenges WHERE title = 'Garden Refresh'), 'badge', 'garden_enthusiast', '{"name": "Garden Enthusiast", "description": "Booked a landscaping service during Spring Home Improvement event"}'),
  ((SELECT id FROM challenges WHERE title = 'Home Maintenance'), 'badge', 'home_maintainer', '{"name": "Home Maintainer", "description": "Booked a maintenance service during Spring Home Improvement event"}'),
  ((SELECT id FROM challenges WHERE title = 'Spring Renovation'), 'badge', 'renovator', '{"name": "Renovator", "description": "Started a renovation project during Spring Home Improvement event"}');

-- Link challenges to the Spring Home Improvement event
INSERT INTO event_challenges (event_id, challenge_id)
VALUES
  ((SELECT id FROM events WHERE title = 'Spring Home Improvement'), (SELECT id FROM challenges WHERE title = 'Spring Cleaning')),
  ((SELECT id FROM events WHERE title = 'Spring Home Improvement'), (SELECT id FROM challenges WHERE title = 'Garden Refresh')),
  ((SELECT id FROM events WHERE title = 'Spring Home Improvement'), (SELECT id FROM challenges WHERE title = 'Home Maintenance')),
  ((SELECT id FROM events WHERE title = 'Spring Home Improvement'), (SELECT id FROM challenges WHERE title = 'Spring Renovation'));

-- Create challenges for the New User Welcome event
INSERT INTO challenges (title, description, category, difficulty, points, start_date, end_date, is_active, is_repeatable, cooldown_days)
VALUES
  ('Platform Tour', 'Visit 5 different sections of the platform', 'activity', 'easy', 30, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', true, false, NULL),
  ('First Connection', 'Send a message to a service provider', 'activity', 'easy', 40, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', true, false, NULL),
  ('Community Introduction', 'Introduce yourself in the community forum', 'community', 'easy', 40, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', true, false, NULL),
  ('First Booking', 'Make your first service booking', 'service', 'medium', 75, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days', true, false, NULL);

-- Add requirements for New User Welcome challenges
INSERT INTO challenge_requirements (challenge_id, type, action, count, target_id)
VALUES
  ((SELECT id FROM challenges WHERE title = 'Platform Tour'), 'activity', 'section_visit', 5, NULL),
  ((SELECT id FROM challenges WHERE title = 'First Connection'), 'message', 'message_send', 1, NULL),
  ((SELECT id FROM challenges WHERE title = 'Community Introduction'), 'forum', 'forum_introduction', 1, NULL),
  ((SELECT id FROM challenges WHERE title = 'First Booking'), 'booking', 'service_book', 1, NULL);

-- Link challenges to the New User Welcome event
INSERT INTO event_challenges (event_id, challenge_id)
VALUES
  ((SELECT id FROM events WHERE title = 'New User Welcome'), (SELECT id FROM challenges WHERE title = 'Platform Tour')),
  ((SELECT id FROM events WHERE title = 'New User Welcome'), (SELECT id FROM challenges WHERE title = 'First Connection')),
  ((SELECT id FROM events WHERE title = 'New User Welcome'), (SELECT id FROM challenges WHERE title = 'Community Introduction')),
  ((SELECT id FROM events WHERE title = 'New User Welcome'), (SELECT id FROM challenges WHERE title = 'First Booking'));

-- Add event rewards
INSERT INTO event_rewards (event_id, type, value, metadata)
VALUES
  -- Spring Home Improvement event rewards
  ((SELECT id FROM events WHERE title = 'Spring Home Improvement'), 'badge', 'spring_improver', '{"name": "Spring Improver", "description": "Completed the Spring Home Improvement event"}'),
  ((SELECT id FROM events WHERE title = 'Spring Home Improvement'), 'title', 'Home Improvement Enthusiast', NULL),
  ((SELECT id FROM events WHERE title = 'Spring Home Improvement'), 'points', '200', NULL),
  
  -- New User Welcome event rewards
  ((SELECT id FROM events WHERE title = 'New User Welcome'), 'badge', 'platform_explorer', '{"name": "Platform Explorer", "description": "Completed the New User Welcome event"}'),
  ((SELECT id FROM events WHERE title = 'New User Welcome'), 'points', '150', NULL),
  ((SELECT id FROM events WHERE title = 'New User Welcome'), 'discount', '15', '{"description": "15% discount on your next service booking", "service_type": "any"}'),
  
  -- Community Week event rewards
  ((SELECT id FROM events WHERE title = 'Community Week'), 'badge', 'community_participant', '{"name": "Community Participant", "description": "Participated in Community Week"}'),
  ((SELECT id FROM events WHERE title = 'Community Week'), 'title', 'Community Enthusiast', NULL),
  ((SELECT id FROM events WHERE title = 'Community Week'), 'points', '150', NULL),
  
  -- Service Provider Spotlight event rewards
  ((SELECT id FROM events WHERE title = 'Service Provider Spotlight'), 'badge', 'service_spotlight', '{"name": "Service Spotlight", "description": "Participated in the Service Provider Spotlight event"}'),
  ((SELECT id FROM events WHERE title = 'Service Provider Spotlight'), 'feature_unlock', 'featured_profile', '{"description": "Your profile will be featured for 2 weeks after the event"}'),
  ((SELECT id FROM events WHERE title = 'Service Provider Spotlight'), 'points', '200', NULL);
