-- Seed admin user
INSERT INTO public.users (
  email,
  api_key,
  credits,
  role,
  status
) VALUES (
  'admin@fait.coop',
  'fait_admin_' || encode(gen_random_bytes(16), 'hex'),
  1000,
  'admin',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Seed test user
INSERT INTO public.users (
  email,
  api_key,
  credits,
  role,
  status
) VALUES (
  'test@fait.coop',
  'fait_test_' || encode(gen_random_bytes(16), 'hex'),
  100,
  'user',
  'active'
) ON CONFLICT (email) DO NOTHING;

-- Seed demo user
INSERT INTO public.users (
  email,
  api_key,
  credits,
  role,
  status
) VALUES (
  'demo@fait.coop',
  'fait_demo_' || encode(gen_random_bytes(16), 'hex'),
  50,
  'user',
  'active'
) ON CONFLICT (email) DO NOTHING;
