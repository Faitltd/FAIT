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

-- Create a function to create a user with an API key
CREATE OR REPLACE FUNCTION create_user_with_api_key(
  p_email TEXT,
  p_initial_credits INTEGER DEFAULT 0,
  p_role TEXT DEFAULT 'user'
) RETURNS TABLE (
  id UUID,
  email TEXT,
  api_key TEXT,
  credits INTEGER
) AS $$
DECLARE
  v_api_key TEXT;
  v_user_id UUID;
BEGIN
  -- Generate a random API key with a prefix
  v_api_key := 'fait_' || encode(gen_random_bytes(16), 'hex');
  
  -- Insert the user
  INSERT INTO users (
    email,
    api_key,
    credits,
    role,
    status,
    created_at,
    updated_at
  ) VALUES (
    p_email,
    v_api_key,
    p_initial_credits,
    p_role,
    'active',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_user_id;
  
  -- Return the user details
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.api_key,
    u.credits
  FROM
    users u
  WHERE
    u.id = v_user_id;
END;
$$ LANGUAGE plpgsql;
