-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add subscription-related columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS service_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS featured_listing BOOLEAN DEFAULT FALSE;

-- Create RLS policies for subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

-- Only authenticated users can insert their own subscriptions
CREATE POLICY "Users can insert their own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only authenticated users can update their own subscriptions
CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to check subscription limits
CREATE OR REPLACE FUNCTION public.check_service_limit()
RETURNS TRIGGER AS $$
DECLARE
  service_count INTEGER;
  user_limit INTEGER;
BEGIN
  -- Get count of user's active services
  SELECT COUNT(*) INTO service_count
  FROM public.services
  WHERE service_agent_id = NEW.service_agent_id AND status = 'active';
  
  -- Get user's service limit
  SELECT service_limit INTO user_limit
  FROM public.profiles
  WHERE id = NEW.service_agent_id;
  
  -- Check if adding this service would exceed the limit
  IF service_count >= user_limit THEN
    RAISE EXCEPTION 'Service limit exceeded. Please upgrade your subscription.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce service limits
CREATE TRIGGER enforce_service_limit
BEFORE INSERT ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.check_service_limit();

-- Create function to update user permissions when subscription changes
CREATE OR REPLACE FUNCTION public.update_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user's permissions based on subscription plan
  IF NEW.status = 'active' THEN
    UPDATE public.profiles
    SET 
      subscription_plan = NEW.plan_id,
      service_limit = CASE 
        WHEN NEW.plan_id = 'basic' THEN 1
        WHEN NEW.plan_id = 'plus' THEN 5
        WHEN NEW.plan_id = 'family' THEN 10
        WHEN NEW.plan_id = 'pro' THEN 20
        WHEN NEW.plan_id = 'business' THEN 50
        ELSE 1
      END,
      featured_listing = CASE
        WHEN NEW.plan_id IN ('family', 'pro', 'business') THEN TRUE
        ELSE FALSE
      END
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update permissions when subscription changes
CREATE TRIGGER update_permissions_on_subscription_change
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_permissions();
