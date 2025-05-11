-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create credit_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create webhook_errors table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.webhook_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create api_usage_logs table for tracking API usage
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_params JSONB,
  response_status INTEGER,
  processing_time_ms INTEGER,
  credits_used INTEGER NOT NULL DEFAULT 1,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create RLS policies for users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY users_select_own ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data (except role and api_key)
CREATE POLICY users_update_own ON public.users
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role IS NOT DISTINCT FROM OLD.role AND api_key IS NOT DISTINCT FROM OLD.api_key);

-- Create RLS policies for credit_transactions table
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own transactions
CREATE POLICY credit_transactions_select_own ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Create RLS policies for api_usage_logs table
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own usage logs
CREATE POLICY api_usage_logs_select_own ON public.api_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Create admin role function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$;

-- Create admin policies for all tables
CREATE POLICY admin_users_all ON public.users
  FOR ALL USING (is_admin());

CREATE POLICY admin_credit_transactions_all ON public.credit_transactions
  FOR ALL USING (is_admin());

CREATE POLICY admin_webhook_errors_all ON public.webhook_errors
  FOR ALL USING (is_admin());

CREATE POLICY admin_api_usage_logs_all ON public.api_usage_logs
  FOR ALL USING (is_admin());

-- Create function to generate API keys
CREATE OR REPLACE FUNCTION public.generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  key TEXT;
  key_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random API key with prefix
    key := 'fait_' || encode(gen_random_bytes(24), 'hex');
    
    -- Check if this key already exists
    SELECT EXISTS (
      SELECT 1 FROM public.users WHERE api_key = key
    ) INTO key_exists;
    
    -- If key doesn't exist, return it
    IF NOT key_exists THEN
      RETURN key;
    END IF;
  END LOOP;
END;
$$;

-- Create function to create a new user with API key
CREATE OR REPLACE FUNCTION public.create_user_with_api_key(
  p_email TEXT,
  p_initial_credits INTEGER DEFAULT 0,
  p_role TEXT DEFAULT 'user'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_api_key TEXT;
  new_user_id UUID;
BEGIN
  -- Generate API key
  new_api_key := public.generate_api_key();
  
  -- Insert new user
  INSERT INTO public.users (
    email,
    api_key,
    credits,
    role
  ) VALUES (
    p_email,
    new_api_key,
    p_initial_credits,
    p_role
  ) RETURNING id INTO new_user_id;
  
  -- Return user info
  RETURN jsonb_build_object(
    'id', new_user_id,
    'email', p_email,
    'api_key', new_api_key,
    'credits', p_initial_credits,
    'role', p_role
  );
END;
$$;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
