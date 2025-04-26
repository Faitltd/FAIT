-- Create fake users first
DO $$
DECLARE
  user_id1 UUID;
  user_id2 UUID;
  user_id3 UUID;
  user_id4 UUID;
  user_id5 UUID;
BEGIN
  -- Create contractor users
  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'john@builders.com')
  RETURNING id INTO user_id1;

  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'elite@remodels.com')
  RETURNING id INTO user_id2;

  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'apex@homes.com')
  RETURNING id INTO user_id3;

  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'skyline@reno.com')
  RETURNING id INTO user_id4;

  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'keystone@renovate.com')
  RETURNING id INTO user_id5;

  -- Create contractor profiles
  INSERT INTO profiles (id, email, user_type, full_name)
  VALUES
    (user_id1, 'john@builders.com', 'service_agent', 'John Builders'),
    (user_id2, 'elite@remodels.com', 'service_agent', 'Elite Remodels'),
    (user_id3, 'apex@homes.com', 'service_agent', 'Apex Homes'),
    (user_id4, 'skyline@reno.com', 'service_agent', 'Skyline Renovators'),
    (user_id5, 'keystone@renovate.com', 'service_agent', 'Keystone Renovation')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    full_name = EXCLUDED.full_name;

  -- Create homeowner users
  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'mary@johnsonhome.com');

  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'lisa@chenhome.com');

  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'karen@davishome.com');

  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'natalie@kimresidence.com');

  INSERT INTO auth.users (id, email) VALUES
    (gen_random_uuid(), 'alan@brookshouse.com');

  -- Create homeowner profiles
  INSERT INTO profiles (id, email, user_type, full_name)
  SELECT id, email, 'client',
    CASE
      WHEN email = 'mary@johnsonhome.com' THEN 'Mary Johnson'
      WHEN email = 'lisa@chenhome.com' THEN 'Lisa Chen'
      WHEN email = 'karen@davishome.com' THEN 'Karen Davis'
      WHEN email = 'natalie@kimresidence.com' THEN 'Natalie Kim'
      WHEN email = 'alan@brookshouse.com' THEN 'Alan Brooks'
    END
  FROM auth.users
  WHERE email IN (
    'mary@johnsonhome.com',
    'lisa@chenhome.com',
    'karen@davishome.com',
    'natalie@kimresidence.com',
    'alan@brookshouse.com'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    user_type = EXCLUDED.user_type,
    full_name = EXCLUDED.full_name;
END;
$$;

-- Insert fake subscriptions
INSERT INTO subscriptions (id, user_id, plan_name, plan_price, billing_cycle, stripe_subscription_id, active, start_date, end_date)
SELECT
  gen_random_uuid(),
  id,
  CASE
    WHEN email = 'elite@remodels.com' THEN 'Pro Contractor'
    WHEN email = 'apex@homes.com' THEN 'Business Contractor'
    WHEN email = 'skyline@reno.com' THEN 'Business Contractor'
    WHEN email = 'keystone@renovate.com' THEN 'Pro Contractor'
    WHEN email = 'lisa@chenhome.com' THEN 'FAIT Plus'
    WHEN email = 'karen@davishome.com' THEN 'FAIT Plus'
    WHEN email = 'natalie@kimresidence.com' THEN 'FAIT Plus'
    WHEN email = 'alan@brookshouse.com' THEN 'FAIT Plus'
    ELSE 'Free Tier'
  END,
  CASE
    WHEN email = 'elite@remodels.com' THEN 75
    WHEN email = 'apex@homes.com' THEN 200
    WHEN email = 'skyline@reno.com' THEN 200
    WHEN email = 'keystone@renovate.com' THEN 75
    WHEN email = 'lisa@chenhome.com' THEN 4.99
    WHEN email = 'karen@davishome.com' THEN 4.99
    WHEN email = 'natalie@kimresidence.com' THEN 4.99
    WHEN email = 'alan@brookshouse.com' THEN 4.99
    ELSE 0
  END,
  'monthly',
  'sub_' || SUBSTRING(MD5(email) FROM 1 FOR 8),
  true,
  '2024-01-01',
  '2024-12-31'
FROM auth.users
WHERE email IN (
  'elite@remodels.com',
  'apex@homes.com',
  'skyline@reno.com',
  'keystone@renovate.com',
  'lisa@chenhome.com',
  'karen@davishome.com',
  'natalie@kimresidence.com',
  'alan@brookshouse.com',
  'mary@johnsonhome.com',
  'john@builders.com'
);

-- Insert fake supplier orders
INSERT INTO supplier_orders (id, user_id, supplier_name, order_total, commission_rate, commission_earned, created_at)
SELECT
  gen_random_uuid(),
  id,
  CASE
    WHEN email = 'elite@remodels.com' THEN 'Home Depot'
    WHEN email = 'skyline@reno.com' THEN 'Lowe''s'
    WHEN email = 'keystone@renovate.com' THEN 'ProBuild Supply'
    ELSE 'ABC Supply Co'
  END,
  CASE
    WHEN email = 'elite@remodels.com' THEN 5000
    WHEN email = 'skyline@reno.com' THEN 7800
    WHEN email = 'keystone@renovate.com' THEN 2300
    ELSE 1500
  END,
  CASE
    WHEN email = 'elite@remodels.com' THEN 0.03
    WHEN email = 'skyline@reno.com' THEN 0.025
    WHEN email = 'keystone@renovate.com' THEN 0.04
    ELSE 0.05
  END,
  CASE
    WHEN email = 'elite@remodels.com' THEN 150
    WHEN email = 'skyline@reno.com' THEN 195
    WHEN email = 'keystone@renovate.com' THEN 92
    ELSE 75
  END,
  '2024-05-01'
FROM auth.users
WHERE email IN (
  'elite@remodels.com',
  'skyline@reno.com',
  'keystone@renovate.com'
);

-- Insert fake commission transactions
INSERT INTO commission_transactions (id, supplier_order_id, contractor_id, commission_amount, paid_out, payout_date)
SELECT
  gen_random_uuid(),
  so.id,
  so.user_id,
  so.commission_earned,
  false,
  NULL
FROM supplier_orders so;

-- Insert fake warranty records
INSERT INTO warranties (id, project_id, homeowner_id, contractor_id, warranty_type, start_date, end_date)
SELECT
  gen_random_uuid(),
  'p' || SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8),
  h.id,
  c.id,
  CASE
    WHEN h.email = 'mary@johnsonhome.com' THEN '1yr'
    WHEN h.email = 'lisa@chenhome.com' THEN '2yr'
    WHEN h.email = 'natalie@kimresidence.com' THEN '3yr-extended'
    ELSE '1yr'
  END,
  '2024-06-01',
  CASE
    WHEN h.email = 'mary@johnsonhome.com' THEN '2025-06-01'::timestamp with time zone
    WHEN h.email = 'lisa@chenhome.com' THEN '2026-06-01'::timestamp with time zone
    WHEN h.email = 'natalie@kimresidence.com' THEN '2027-06-01'::timestamp with time zone
    ELSE '2025-06-01'::timestamp with time zone
  END
FROM
  auth.users h
CROSS JOIN (
  SELECT id FROM auth.users WHERE email = 'elite@remodels.com' LIMIT 1
) c
WHERE h.email IN (
  'mary@johnsonhome.com',
  'lisa@chenhome.com',
  'natalie@kimresidence.com'
);

-- Insert subscription features
INSERT INTO subscription_features (plan_name, feature_key, user_type)
VALUES
  ('Free Tier', 'basic_profile', 'service_agent'),
  ('Free Tier', 'limited_leads', 'service_agent'),
  ('Pro Contractor', 'basic_profile', 'service_agent'),
  ('Pro Contractor', 'unlimited_leads', 'service_agent'),
  ('Pro Contractor', 'material_sourcing', 'service_agent'),
  ('Pro Contractor', 'roi_data', 'service_agent'),
  ('Pro Contractor', 'pricing_templates', 'service_agent'),
  ('Business Contractor', 'basic_profile', 'service_agent'),
  ('Business Contractor', 'unlimited_leads', 'service_agent'),
  ('Business Contractor', 'material_sourcing', 'service_agent'),
  ('Business Contractor', 'roi_data', 'service_agent'),
  ('Business Contractor', 'pricing_templates', 'service_agent'),
  ('Business Contractor', 'multi_user', 'service_agent'),
  ('Business Contractor', 'priority_leads', 'service_agent'),
  ('Business Contractor', 'premium_discounts', 'service_agent'),
  ('Free Homeowner', 'project_posting', 'client'),
  ('Free Homeowner', 'basic_warranty', 'client'),
  ('FAIT Plus', 'project_posting', 'client'),
  ('FAIT Plus', 'extended_warranty', 'client'),
  ('FAIT Plus', 'roi_reports', 'client'),
  ('FAIT Plus', 'discounts', 'client'),
  ('FAIT Plus', 'priority_support', 'client');
