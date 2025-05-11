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
