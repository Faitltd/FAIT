-- Seed data for FAIT Platform

-- Insert badges
INSERT INTO badges (id, name, description, icon_url, badge_type, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Quality Craftsman', 'Consistently delivers high-quality work', NULL, 'skill', NOW(), NOW()),
  (uuid_generate_v4(), 'Prompt Responder', 'Responds to messages within 2 hours', NULL, 'communication', NOW(), NOW()),
  (uuid_generate_v4(), 'On-Time Delivery', 'Completed 10 projects on schedule', NULL, 'reliability', NOW(), NOW()),
  (uuid_generate_v4(), 'Budget Master', 'Completed 5 projects within budget', NULL, 'skill', NOW(), NOW()),
  (uuid_generate_v4(), 'Community Contributor', 'Actively participates in the FAIT community', NULL, 'participation', NOW(), NOW()),
  (uuid_generate_v4(), 'Knowledge Seeker', 'Completed 5 training modules', NULL, 'skill', NOW(), NOW()),
  (uuid_generate_v4(), 'Client Favorite', 'Received 10 five-star reviews', NULL, 'reliability', NOW(), NOW()),
  (uuid_generate_v4(), 'Verified Pro', 'Verified professional credentials', NULL, 'skill', NOW(), NOW()),
  (uuid_generate_v4(), 'Mentor', 'Helped 5 other contractors', NULL, 'participation', NOW(), NOW()),
  (uuid_generate_v4(), 'Problem Solver', 'Successfully resolved 5 complex issues', NULL, 'skill', NOW(), NOW());

-- Insert training modules
INSERT INTO training_modules (id, title, description, content_url, duration, difficulty, token_reward, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Estimating Basics', 'Learn the fundamentals of creating accurate estimates', '/training/estimating-basics', 60, 'beginner', 50, NOW(), NOW()),
  (uuid_generate_v4(), 'Client Communication', 'Effective communication strategies for client satisfaction', '/training/client-communication', 45, 'beginner', 50, NOW(), NOW()),
  (uuid_generate_v4(), 'Advanced Estimating', 'Master complex estimating techniques', '/training/advanced-estimating', 90, 'intermediate', 100, NOW(), NOW()),
  (uuid_generate_v4(), 'Project Management', 'Best practices for managing construction projects', '/training/project-management', 120, 'intermediate', 100, NOW(), NOW()),
  (uuid_generate_v4(), 'Sustainable Building', 'Eco-friendly construction techniques', '/training/sustainable-building', 75, 'intermediate', 75, NOW(), NOW()),
  (uuid_generate_v4(), 'Building Codes', 'Understanding and applying building codes', '/training/building-codes', 90, 'advanced', 150, NOW(), NOW()),
  (uuid_generate_v4(), 'Digital Tools', 'Using technology to improve your construction business', '/training/digital-tools', 60, 'beginner', 50, NOW(), NOW()),
  (uuid_generate_v4(), 'Financial Management', 'Managing finances for construction businesses', '/training/financial-management', 120, 'advanced', 150, NOW(), NOW()),
  (uuid_generate_v4(), 'Marketing Your Business', 'Strategies to attract and retain clients', '/training/marketing', 90, 'intermediate', 100, NOW(), NOW()),
  (uuid_generate_v4(), 'Safety Protocols', 'Essential safety practices for construction sites', '/training/safety', 60, 'beginner', 75, NOW(), NOW());

-- Insert marketplace items
INSERT INTO marketplace_items (id, title, description, price, token_price, image_url, item_type, status, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Premium Profile Listing', 'Get featured at the top of search results', 49.99, 500, '/marketplace/premium-listing.jpg', 'service', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'Estimating Software - 1 Month', 'Professional estimating software subscription', 29.99, 300, '/marketplace/estimating-software.jpg', 'subscription', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'Project Management Tool - 1 Month', 'Comprehensive project management platform', 39.99, 400, '/marketplace/project-management.jpg', 'subscription', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'Marketing Consultation', '1-hour consultation with a marketing expert', 99.99, 1000, '/marketplace/marketing-consultation.jpg', 'service', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'FAIT Branded T-Shirt', 'High-quality cotton t-shirt with FAIT logo', 19.99, 200, '/marketplace/tshirt.jpg', 'merchandise', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'Contract Templates Bundle', 'Set of 10 professional contract templates', 49.99, 500, '/marketplace/contract-templates.jpg', 'digital', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'Featured Project', 'Get your project featured on the homepage', 79.99, 800, '/marketplace/featured-project.jpg', 'service', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'Business Card Design', 'Professional design for your business cards', 59.99, 600, '/marketplace/business-card.jpg', 'service', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'Tax Preparation Guide', 'Comprehensive guide for contractors', 29.99, 300, '/marketplace/tax-guide.jpg', 'digital', 'active', NOW(), NOW()),
  (uuid_generate_v4(), 'Client Management Software - 1 Month', 'Software to manage client relationships', 34.99, 350, '/marketplace/client-management.jpg', 'subscription', 'active', NOW(), NOW());

-- Insert grants
INSERT INTO grants (id, title, description, provider, amount, application_url, deadline, eligibility_criteria, created_at, updated_at)
VALUES
  (uuid_generate_v4(), 'Small Business Innovation Grant', 'Funding for innovative construction techniques', 'National Construction Foundation', 10000, 'https://example.com/innovation-grant', '2024-06-30', 'Small businesses with fewer than 50 employees', NOW(), NOW()),
  (uuid_generate_v4(), 'Green Building Initiative', 'Support for sustainable construction projects', 'Environmental Building Association', 15000, 'https://example.com/green-building', '2024-07-15', 'Projects using certified sustainable materials', NOW(), NOW()),
  (uuid_generate_v4(), 'Women in Construction Fund', 'Supporting women-owned construction businesses', 'Women Builders Alliance', 12000, 'https://example.com/women-construction', '2024-08-01', 'Businesses with at least 51% female ownership', NOW(), NOW()),
  (uuid_generate_v4(), 'Veteran Contractor Support', 'Funding for veteran-owned construction businesses', 'Veterans Business Association', 8000, 'https://example.com/veteran-support', '2024-09-15', 'Businesses owned by military veterans', NOW(), NOW()),
  (uuid_generate_v4(), 'Rural Development Grant', 'Support for construction in rural communities', 'Rural Development Agency', 20000, 'https://example.com/rural-grant', '2024-10-01', 'Projects in communities with population under 50,000', NOW(), NOW());
