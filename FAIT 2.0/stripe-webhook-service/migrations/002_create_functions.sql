-- Create a function to handle credit usage in a transaction
CREATE OR REPLACE FUNCTION public.use_credit(
  user_id UUID,
  credit_amount INTEGER,
  transaction_type TEXT,
  transaction_description TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- Get current credits in a FOR UPDATE lock to prevent race conditions
  SELECT credits INTO current_credits
  FROM public.users
  WHERE id = user_id
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF current_credits < credit_amount THEN
    RAISE EXCEPTION 'Insufficient credits: % available, % required', current_credits, credit_amount;
  END IF;
  
  -- Calculate new balance
  new_balance := current_credits - credit_amount;
  
  -- Update user's credits
  UPDATE public.users
  SET 
    credits = new_balance,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    created_at
  ) VALUES (
    user_id,
    -credit_amount,
    transaction_type,
    transaction_description,
    NOW()
  ) RETURNING id INTO transaction_id;
  
  -- Return the new balance and transaction ID
  RETURN jsonb_build_object(
    'success', TRUE,
    'new_balance', new_balance,
    'transaction_id', transaction_id
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM
    );
END;
$$;

-- Create a function to add credits (for purchases, rewards, etc.)
CREATE OR REPLACE FUNCTION public.add_credits(
  user_id UUID,
  credit_amount INTEGER,
  transaction_type TEXT,
  transaction_description TEXT,
  reference_id TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_credits INTEGER;
  new_balance INTEGER;
  transaction_id UUID;
BEGIN
  -- Get current credits in a FOR UPDATE lock
  SELECT credits INTO current_credits
  FROM public.users
  WHERE id = user_id
  FOR UPDATE;
  
  -- Calculate new balance
  new_balance := current_credits + credit_amount;
  
  -- Update user's credits
  UPDATE public.users
  SET 
    credits = new_balance,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    type,
    description,
    stripe_session_id,
    created_at
  ) VALUES (
    user_id,
    credit_amount,
    transaction_type,
    transaction_description,
    reference_id,
    NOW()
  ) RETURNING id INTO transaction_id;
  
  -- Return the new balance and transaction ID
  RETURN jsonb_build_object(
    'success', TRUE,
    'new_balance', new_balance,
    'transaction_id', transaction_id
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return error information
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', SQLERRM
    );
END;
$$;

-- Create webhook_errors table for monitoring
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

-- Create index on webhook_errors for faster querying
CREATE INDEX IF NOT EXISTS idx_webhook_errors_timestamp ON public.webhook_errors(timestamp);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_event_type ON public.webhook_errors(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_errors_resolved ON public.webhook_errors(resolved);
