-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  stripe_subscription_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create supplier_orders table
CREATE TABLE IF NOT EXISTS supplier_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier_name TEXT NOT NULL,
  order_total DECIMAL(10, 2) NOT NULL,
  commission_rate DECIMAL(5, 4) NOT NULL,
  commission_earned DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create commission_transactions table
CREATE TABLE IF NOT EXISTS commission_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_order_id UUID NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  commission_amount DECIMAL(10, 2) NOT NULL,
  paid_out BOOLEAN NOT NULL DEFAULT false,
  payout_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create warranties table
CREATE TABLE IF NOT EXISTS warranties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL,
  homeowner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  warranty_type TEXT NOT NULL CHECK (warranty_type IN ('1yr', '2yr', '3yr-extended')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscription_features table
CREATE TABLE IF NOT EXISTS subscription_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_name TEXT NOT NULL,
  feature_key TEXT NOT NULL,
  user_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (plan_name, feature_key, user_type)
);

-- Add subscription_id to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_status BOOLEAN DEFAULT false;

-- Create RLS policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_features ENABLE ROW LEVEL SECURITY;

-- Create policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" 
  ON subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
  ON subscriptions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Create policies for supplier_orders
CREATE POLICY "Users can view their own supplier orders" 
  ON supplier_orders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all supplier orders" 
  ON supplier_orders FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Create policies for commission_transactions
CREATE POLICY "Contractors can view their own commission transactions" 
  ON commission_transactions FOR SELECT 
  USING (auth.uid() = contractor_id);

CREATE POLICY "Admins can view all commission transactions" 
  ON commission_transactions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Create policies for warranties
CREATE POLICY "Homeowners can view their own warranties" 
  ON warranties FOR SELECT 
  USING (auth.uid() = homeowner_id);

CREATE POLICY "Contractors can view warranties they provide" 
  ON warranties FOR SELECT 
  USING (auth.uid() = contractor_id);

CREATE POLICY "Admins can view all warranties" 
  ON warranties FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Create policies for subscription_features
CREATE POLICY "Anyone can view subscription features" 
  ON subscription_features FOR SELECT 
  USING (true);

-- Create function to check if a user has a feature
CREATE OR REPLACE FUNCTION has_feature(user_id UUID, feature_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_type TEXT;
  subscription_plan TEXT;
  has_access BOOLEAN;
BEGIN
  -- Get user type and subscription plan
  SELECT 
    p.user_type, 
    s.plan_name INTO user_type, subscription_plan
  FROM 
    profiles p
    LEFT JOIN subscriptions s ON s.user_id = p.id AND s.active = true
  WHERE 
    p.id = user_id;
  
  -- Check if the feature exists for this user's plan and type
  SELECT EXISTS (
    SELECT 1 
    FROM subscription_features 
    WHERE 
      plan_name = subscription_plan AND
      feature_key = feature_key AND
      user_type = user_type
  ) INTO has_access;
  
  RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to extend warranty based on subscription
CREATE OR REPLACE FUNCTION extend_warranty_if_eligible()
RETURNS TRIGGER AS $$
DECLARE
  subscription_plan TEXT;
BEGIN
  -- Get the homeowner's subscription plan
  SELECT plan_name INTO subscription_plan
  FROM subscriptions
  WHERE user_id = NEW.homeowner_id AND active = true;
  
  -- If the homeowner has FAIT Plus, extend the warranty
  IF subscription_plan = 'FAIT Plus' THEN
    IF NEW.warranty_type = '1yr' THEN
      NEW.warranty_type := '2yr';
      NEW.end_date := NEW.start_date + INTERVAL '2 years';
    ELSIF NEW.warranty_type = '2yr' THEN
      NEW.warranty_type := '3yr-extended';
      NEW.end_date := NEW.start_date + INTERVAL '3 years';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER extend_warranty_trigger
BEFORE INSERT ON warranties
FOR EACH ROW
EXECUTE FUNCTION extend_warranty_if_eligible();
