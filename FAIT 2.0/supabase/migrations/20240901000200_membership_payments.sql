-- Add membership payment functionality

-- Start transaction
BEGIN;

-- Create membership plans table
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly' 
    CHECK (billing_frequency IN ('monthly', 'quarterly', 'annual')),
  features JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  user_role VARCHAR(50) NOT NULL DEFAULT 'all' 
    CHECK (user_role IN ('all', 'client', 'contractor', 'admin', 'ally')),
  stripe_price_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id) ON DELETE RESTRICT,
  status VARCHAR(50) NOT NULL DEFAULT 'active' 
    CHECK (status IN ('active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'trialing', 'unpaid')),
  stripe_subscription_id VARCHAR(100),
  stripe_customer_id VARCHAR(100),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(100) NOT NULL,
  card_brand VARCHAR(50),
  card_last4 VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL 
    CHECK (status IN ('succeeded', 'pending', 'failed')),
  stripe_payment_intent_id VARCHAR(100),
  stripe_invoice_id VARCHAR(100),
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add membership fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS membership_status VARCHAR(50) DEFAULT 'pending' 
  CHECK (membership_status IN ('pending', 'active', 'inactive', 'suspended')),
ADD COLUMN IF NOT EXISTS membership_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS membership_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(100);

-- Add RLS policies
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy for viewing membership plans
CREATE POLICY "Anyone can view active membership plans"
ON public.membership_plans FOR SELECT
TO authenticated
USING (is_active = true);

-- Policy for viewing user subscriptions
CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions FOR SELECT
USING (user_id = auth.uid());

-- Policy for viewing payment methods
CREATE POLICY "Users can view their own payment methods"
ON public.payment_methods FOR SELECT
USING (user_id = auth.uid());

-- Policy for inserting payment methods
CREATE POLICY "Users can insert their own payment methods"
ON public.payment_methods FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Policy for updating payment methods
CREATE POLICY "Users can update their own payment methods"
ON public.payment_methods FOR UPDATE
USING (user_id = auth.uid());

-- Policy for deleting payment methods
CREATE POLICY "Users can delete their own payment methods"
ON public.payment_methods FOR DELETE
USING (user_id = auth.uid());

-- Policy for viewing payment transactions
CREATE POLICY "Users can view their own payment transactions"
ON public.payment_transactions FOR SELECT
USING (user_id = auth.uid());

-- Insert default membership plans
INSERT INTO public.membership_plans (name, description, price, billing_frequency, features, user_role, stripe_price_id)
VALUES
  ('Basic Client', 'Basic membership for clients', 9.99, 'monthly', 
   '{"project_limit": 3, "support": "email", "featured_projects": false}', 
   'client', 'price_basic_client_monthly'),
   
  ('Pro Client', 'Professional membership for clients', 19.99, 'monthly', 
   '{"project_limit": 10, "support": "priority", "featured_projects": true}', 
   'client', 'price_pro_client_monthly'),
   
  ('Basic Contractor', 'Basic membership for contractors', 29.99, 'monthly', 
   '{"job_limit": 5, "support": "email", "featured_profile": false, "commission_rate": 10}', 
   'contractor', 'price_basic_contractor_monthly'),
   
  ('Pro Contractor', 'Professional membership for contractors', 49.99, 'monthly', 
   '{"job_limit": 20, "support": "priority", "featured_profile": true, "commission_rate": 7}', 
   'contractor', 'price_pro_contractor_monthly'),
   
  ('Ally Membership', 'Membership for allied service providers', 39.99, 'monthly', 
   '{"referral_limit": 10, "support": "priority", "featured_profile": true}', 
   'ally', 'price_ally_monthly')
ON CONFLICT DO NOTHING;

-- Commit transaction
COMMIT;
