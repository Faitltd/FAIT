-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert a test user
INSERT INTO users (
  email,
  api_key,
  credits,
  role,
  status
) VALUES (
  'test@example.com',
  'fait_test_123456789',
  100,
  'user',
  'active'
)
ON CONFLICT (email) DO UPDATE
SET credits = users.credits + 100,
    updated_at = NOW()
RETURNING id, email, api_key, credits;
