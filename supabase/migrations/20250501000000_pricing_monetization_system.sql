/*
  # Pricing and Monetization Subsystem for FAIT Co-Op

  This migration:
  1. Creates tables for subscription management
     - users (modified to include subscription fields)
     - subscriptions
     - supplier_orders
     - warranties
     - commission_transactions
  2. Sets up RLS policies for these tables
  3. Creates functions for subscription management
  4. Adds triggers for subscription-related events
*/

-- Create users table if it doesn't exist or modify existing profiles table
DO $$
BEGIN
  -- Check if we need to modify the profiles table
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'profiles'
  ) THEN
    -- Add subscription fields to profiles table if they don't exist
    ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS subscription_id text,
    ADD COLUMN IF NOT EXISTS membership_status boolean DEFAULT false;
    
    -- Update user_type check constraint to include all roles
    ALTER TABLE profiles
    DROP CONSTRAINT IF EXISTS profiles_user_type_check,
    ADD CONSTRAINT profiles_user_type_check
    CHECK (user_type IN ('client', 'service_agent', 'admin', 'homeowner', 'contractor'));
  ELSE
    -- Create users table if profiles doesn't exist
    CREATE TABLE IF NOT EXISTS users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL UNIQUE,
      role text CHECK (role IN ('homeowner', 'contractor', 'admin')) NOT NULL,
      subscription_id text,
      membership_status boolean DEFAULT false,
      created_at timestamptz DEFAULT timezone('utc'::text, now())
    );
    
    -- Enable RLS
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Users can view own user data"
      ON users FOR SELECT
      USING (auth.uid() = id);
      
    CREATE POLICY "Users can update own user data"
      ON users FOR UPDATE
      USING (auth.uid() = id);
      
    CREATE POLICY "Admins can view all users"
      ON users FOR SELECT
      USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
      ));
      
    CREATE POLICY "Admins can update all users"
      ON users FOR UPDATE
      USING (auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
      ));
  END IF;
END
$$;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL,
  plan_price numeric NOT NULL,
  billing_cycle text CHECK (billing_cycle IN ('monthly', 'annual')) NOT NULL,
  stripe_subscription_id text NOT NULL,
  active boolean DEFAULT true,
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Admins can view all subscriptions"
  ON subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));
  
CREATE POLICY "Admins can update all subscriptions"
  ON subscriptions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Create supplier_orders table
CREATE TABLE IF NOT EXISTS supplier_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_name text NOT NULL,
  order_total numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_earned numeric NOT NULL,
  created_at timestamptz DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own supplier orders"
  ON supplier_orders FOR SELECT
  USING (auth.uid() = user_id);
  
CREATE POLICY "Admins can view all supplier orders"
  ON supplier_orders FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Create warranties table
CREATE TABLE IF NOT EXISTS warranties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL, -- Assume project table elsewhere
  homeowner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  contractor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  warranty_type text CHECK (warranty_type IN ('1yr', '2yr', '3yr-extended')) NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view warranties they're involved in"
  ON warranties FOR SELECT
  USING (auth.uid() = homeowner_id OR auth.uid() = contractor_id);
  
CREATE POLICY "Admins can view all warranties"
  ON warranties FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));
  
CREATE POLICY "Admins can update all warranties"
  ON warranties FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Create commission_transactions table
CREATE TABLE IF NOT EXISTS commission_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_order_id uuid REFERENCES supplier_orders(id) ON DELETE CASCADE,
  contractor_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_amount numeric NOT NULL,
  paid_out boolean DEFAULT false,
  payout_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own commission transactions"
  ON commission_transactions FOR SELECT
  USING (auth.uid() = contractor_id);
  
CREATE POLICY "Admins can view all commission transactions"
  ON commission_transactions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));
  
CREATE POLICY "Admins can update all commission transactions"
  ON commission_transactions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Create subscription_features table to store feature flags
CREATE TABLE IF NOT EXISTS subscription_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name text NOT NULL,
  user_type text NOT NULL,
  feature_key text NOT NULL,
  feature_value jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(plan_name, user_type, feature_key)
);

-- Enable RLS
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view subscription features"
  ON subscription_features FOR SELECT
  USING (true);
  
CREATE POLICY "Admins can manage subscription features"
  ON subscription_features FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  ));

-- Create function to check if a user has access to a feature
CREATE OR REPLACE FUNCTION has_feature(
  user_id uuid,
  feature_key text
)
RETURNS boolean AS $$
DECLARE
  has_access boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM subscriptions s
    JOIN subscription_features sf ON s.plan_name = sf.plan_name
    JOIN profiles p ON s.user_id = p.id
    WHERE s.user_id = user_id
    AND sf.user_type = p.user_type
    AND sf.feature_key = feature_key
    AND s.active = true
    AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
  ) INTO has_access;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to extend warranty based on subscription
CREATE OR REPLACE FUNCTION extend_warranty_if_eligible()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if homeowner has FAIT Plus subscription
  IF EXISTS (
    SELECT 1 FROM subscriptions s
    WHERE s.user_id = NEW.homeowner_id
    AND s.plan_name = 'FAIT Plus'
    AND s.active = true
    AND (s.end_date IS NULL OR s.end_date >= CURRENT_DATE)
  ) THEN
    -- Extend warranty by 1 year for FAIT Plus subscribers
    IF NEW.warranty_type = '1yr' THEN
      NEW.warranty_type = '2yr';
      NEW.end_date = NEW.start_date + INTERVAL '2 years';
    ELSIF NEW.warranty_type = '2yr' THEN
      NEW.warranty_type = '3yr-extended';
      NEW.end_date = NEW.start_date + INTERVAL '3 years';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for warranty extension
CREATE TRIGGER extend_warranty_for_premium_users
  BEFORE INSERT ON warranties
  FOR EACH ROW
  EXECUTE FUNCTION extend_warranty_if_eligible();

-- Create trigger for updating updated_at columns
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_supplier_orders_updated_at
  BEFORE UPDATE ON supplier_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_warranties_updated_at
  BEFORE UPDATE ON warranties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_commission_transactions_updated_at
  BEFORE UPDATE ON commission_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_subscription_features_updated_at
  BEFORE UPDATE ON subscription_features
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to populate initial subscription features
CREATE OR REPLACE FUNCTION populate_initial_subscription_features()
RETURNS void AS $$
BEGIN
  -- Contractor Free Tier
  INSERT INTO subscription_features (plan_name, user_type, feature_key, feature_value)
  VALUES
    ('Free Tier', 'contractor', 'lead_limit', '{"limit": 5}'),
    ('Free Tier', 'contractor', 'discount_access', '{"enabled": false}'),
    ('Free Tier', 'contractor', 'basic_profile', '{"enabled": true}');
    
  -- Contractor Pro Tier
  INSERT INTO subscription_features (plan_name, user_type, feature_key, feature_value)
  VALUES
    ('Pro Contractor', 'contractor', 'lead_limit', '{"limit": 50}'),
    ('Pro Contractor', 'contractor', 'material_sourcing', '{"enabled": true}'),
    ('Pro Contractor', 'contractor', 'roi_data', '{"enabled": true}'),
    ('Pro Contractor', 'contractor', 'pricing_templates', '{"enabled": true}'),
    ('Pro Contractor', 'contractor', 'discount_access', '{"enabled": true, "level": "standard"}');
    
  -- Contractor Business Tier
  INSERT INTO subscription_features (plan_name, user_type, feature_key, feature_value)
  VALUES
    ('Business Contractor', 'contractor', 'lead_limit', '{"limit": 200}'),
    ('Business Contractor', 'contractor', 'material_sourcing', '{"enabled": true}'),
    ('Business Contractor', 'contractor', 'roi_data', '{"enabled": true}'),
    ('Business Contractor', 'contractor', 'pricing_templates', '{"enabled": true}'),
    ('Business Contractor', 'contractor', 'multi_user', '{"enabled": true, "limit": 5}'),
    ('Business Contractor', 'contractor', 'priority_leads', '{"enabled": true}'),
    ('Business Contractor', 'contractor', 'discount_access', '{"enabled": true, "level": "premium"}');
    
  -- Homeowner Free Tier
  INSERT INTO subscription_features (plan_name, user_type, feature_key, feature_value)
  VALUES
    ('Free Homeowner', 'homeowner', 'project_posting', '{"enabled": true}'),
    ('Free Homeowner', 'homeowner', 'basic_warranty', '{"enabled": true}');
    
  -- Homeowner FAIT Plus Tier
  INSERT INTO subscription_features (plan_name, user_type, feature_key, feature_value)
  VALUES
    ('FAIT Plus', 'homeowner', 'project_posting', '{"enabled": true}'),
    ('FAIT Plus', 'homeowner', 'roi_reports', '{"enabled": true}'),
    ('FAIT Plus', 'homeowner', 'extended_warranty', '{"enabled": true}'),
    ('FAIT Plus', 'homeowner', 'discounts', '{"enabled": true}'),
    ('FAIT Plus', 'homeowner', 'priority_support', '{"enabled": true}');
    
  -- Also add for service_agent and client types to maintain compatibility
  INSERT INTO subscription_features (plan_name, user_type, feature_key, feature_value)
  VALUES
    ('Free Tier', 'service_agent', 'lead_limit', '{"limit": 5}'),
    ('Free Tier', 'service_agent', 'discount_access', '{"enabled": false}'),
    ('Free Tier', 'service_agent', 'basic_profile', '{"enabled": true}'),
    
    ('Pro Contractor', 'service_agent', 'lead_limit', '{"limit": 50}'),
    ('Pro Contractor', 'service_agent', 'material_sourcing', '{"enabled": true}'),
    ('Pro Contractor', 'service_agent', 'roi_data', '{"enabled": true}'),
    ('Pro Contractor', 'service_agent', 'pricing_templates', '{"enabled": true}'),
    ('Pro Contractor', 'service_agent', 'discount_access', '{"enabled": true, "level": "standard"}'),
    
    ('Business Contractor', 'service_agent', 'lead_limit', '{"limit": 200}'),
    ('Business Contractor', 'service_agent', 'material_sourcing', '{"enabled": true}'),
    ('Business Contractor', 'service_agent', 'roi_data', '{"enabled": true}'),
    ('Business Contractor', 'service_agent', 'pricing_templates', '{"enabled": true}'),
    ('Business Contractor', 'service_agent', 'multi_user', '{"enabled": true, "limit": 5}'),
    ('Business Contractor', 'service_agent', 'priority_leads', '{"enabled": true}'),
    ('Business Contractor', 'service_agent', 'discount_access', '{"enabled": true, "level": "premium"}'),
    
    ('Free Homeowner', 'client', 'project_posting', '{"enabled": true}'),
    ('Free Homeowner', 'client', 'basic_warranty', '{"enabled": true}'),
    
    ('FAIT Plus', 'client', 'project_posting', '{"enabled": true}'),
    ('FAIT Plus', 'client', 'roi_reports', '{"enabled": true}'),
    ('FAIT Plus', 'client', 'extended_warranty', '{"enabled": true}'),
    ('FAIT Plus', 'client', 'discounts', '{"enabled": true}'),
    ('FAIT Plus', 'client', 'priority_support', '{"enabled": true}');
END;
$$ LANGUAGE plpgsql;

-- Execute the function to populate initial features
SELECT populate_initial_subscription_features();
