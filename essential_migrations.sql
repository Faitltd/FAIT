/*
  # Essential Platform Updates for FAIT Co-Op
  
  Consolidated migrations file containing all essential database changes
  in the correct order of execution.
*/

-- Base Tables and Initial Setup
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on messages table
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Messages Policies
CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can insert their own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR recipient_id = auth.uid());

-- Subscription System
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

-- Profile Enhancements
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS service_limit INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS featured_listing BOOLEAN DEFAULT FALSE;

-- Subscription RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" 
ON public.subscriptions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.subscriptions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.subscriptions FOR UPDATE 
USING (auth.uid() = user_id);

-- Service Agent Portfolio
CREATE TABLE IF NOT EXISTS service_agent_portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text NOT NULL,
  tags text[] DEFAULT '{}',
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Portfolio RLS
ALTER TABLE service_agent_portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view portfolio items"
  ON service_agent_portfolio_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service agents can insert their own portfolio items"
  ON service_agent_portfolio_items FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own portfolio items"
  ON service_agent_portfolio_items FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own portfolio items"
  ON service_agent_portfolio_items FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Warranty Claims Enhancement
ALTER TABLE warranty_claims
ADD COLUMN IF NOT EXISTS photo_urls text[] DEFAULT '{}';

-- Storage Setup for Warranty Photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('warranty_photos', 'warranty_photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload warranty photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'warranty_photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view warranty photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'warranty_photos');

-- Service Agent Work History
CREATE TABLE IF NOT EXISTS service_agent_work_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  position text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_agent_work_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view work history"
  ON service_agent_work_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service agents can insert their own work history"
  ON service_agent_work_history FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own work history"
  ON service_agent_work_history FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own work history"
  ON service_agent_work_history FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Service Agent References
CREATE TABLE IF NOT EXISTS service_agent_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_agent_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  email text,
  phone text,
  relationship text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE service_agent_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service agents can view their own references"
  ON service_agent_references FOR SELECT
  TO authenticated
  USING (service_agent_id = auth.uid());

CREATE POLICY "Service agents can insert their own references"
  ON service_agent_references FOR INSERT
  TO authenticated
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own references"
  ON service_agent_references FOR UPDATE
  TO authenticated
  USING (service_agent_id = auth.uid())
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can delete their own references"
  ON service_agent_references FOR DELETE
  TO authenticated
  USING (service_agent_id = auth.uid());

-- Subscription Management Functions
CREATE OR REPLACE FUNCTION public.check_service_limit()
RETURNS TRIGGER AS $$
DECLARE
  service_count INTEGER;
  user_limit INTEGER;
BEGIN
  SELECT COUNT(*) INTO service_count
  FROM public.services
  WHERE service_agent_id = NEW.service_agent_id AND status = 'active';
  
  SELECT service_limit INTO user_limit
  FROM public.profiles
  WHERE id = NEW.service_agent_id;
  
  IF service_count >= user_limit THEN
    RAISE EXCEPTION 'Service limit exceeded. Please upgrade your subscription.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_service_limit
BEFORE INSERT ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.check_service_limit();

CREATE OR REPLACE FUNCTION public.update_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
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

CREATE TRIGGER update_permissions_on_subscription_change
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_permissions();

-- Legacy Data Updates
UPDATE profiles 
SET user_type = 'service_agent' 
WHERE user_type = 'contractor';

-- Legacy Table Updates
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'external_reviews'
  ) AND EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'external_reviews' 
    AND column_name = 'contractor_id'
  ) THEN
    ALTER TABLE external_reviews RENAME COLUMN contractor_id TO service_agent_id;
  END IF;
END $$;
