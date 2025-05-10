-- Users Table
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

-- Credit Transactions Table
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT positive_amount CHECK (amount != 0)
);

-- Webhook Errors Table
CREATE TABLE IF NOT EXISTS webhook_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  event_id TEXT,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  environment TEXT,
  service TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processed Events Table (for preventing duplicate processing)
CREATE TABLE IF NOT EXISTS processed_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index on event_id for faster lookups
CREATE INDEX IF NOT EXISTS processed_events_event_id_idx ON processed_events(event_id);

-- Add TTL function to automatically clean up old processed events
CREATE OR REPLACE FUNCTION cleanup_processed_events() RETURNS void AS $$
BEGIN
  DELETE FROM processed_events
  WHERE processed_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a stored procedure for using credits
CREATE OR REPLACE FUNCTION use_credit(
  user_id UUID,
  credit_amount INTEGER,
  transaction_type TEXT,
  transaction_description TEXT
) RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER
) AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM users
  WHERE id = user_id;
  
  -- Check if user has enough credits
  IF current_credits < credit_amount THEN
    RETURN QUERY SELECT false AS success, current_credits AS new_balance;
    RETURN;
  END IF;
  
  -- Calculate new credits
  new_credits := current_credits - credit_amount;
  
  -- Update user's credits
  UPDATE users
  SET 
    credits = new_credits,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    description
  ) VALUES (
    user_id,
    -credit_amount,
    transaction_type,
    transaction_description
  );
  
  -- Return success and new balance
  RETURN QUERY SELECT true AS success, new_credits AS new_balance;
END;
$$ LANGUAGE plpgsql;

-- Create a stored procedure for adding credits
CREATE OR REPLACE FUNCTION add_credit(
  user_id UUID,
  credit_amount INTEGER,
  transaction_type TEXT,
  transaction_description TEXT,
  stripe_session_id TEXT DEFAULT NULL
) RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER
) AS $$
DECLARE
  current_credits INTEGER;
  new_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM users
  WHERE id = user_id;
  
  -- Calculate new credits
  new_credits := current_credits + credit_amount;
  
  -- Update user's credits
  UPDATE users
  SET 
    credits = new_credits,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    type,
    description,
    stripe_session_id
  ) VALUES (
    user_id,
    credit_amount,
    transaction_type,
    transaction_description,
    stripe_session_id
  );
  
  -- Return success and new balance
  RETURN QUERY SELECT true AS success, new_credits AS new_balance;
END;
$$ LANGUAGE plpgsql;
