-- Create a function to handle points transactions
CREATE OR REPLACE FUNCTION create_points_transaction(
  p_user_id uuid,
  p_points_amount integer,
  p_transaction_type text,
  p_description text,
  p_booking_id uuid DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  transaction_id uuid;
  result json;
BEGIN
  -- Verify that the user_id matches the authenticated user
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only create points transactions for yourself';
  END IF;

  -- Insert the points transaction
  INSERT INTO points_transactions (
    user_id,
    points_amount,
    transaction_type,
    description,
    booking_id
  )
  VALUES (
    p_user_id,
    p_points_amount,
    p_transaction_type,
    p_description,
    p_booking_id
  )
  RETURNING id INTO transaction_id;

  -- Get the created transaction
  SELECT row_to_json(pt)
  FROM points_transactions pt
  WHERE pt.id = transaction_id
  INTO result;

  RETURN result;
END;
$$;

-- Enable RLS on points_transactions table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_class
    JOIN pg_namespace ON pg_namespace.oid = pg_class.relnamespace
    WHERE relname = 'points_transactions' AND nspname = 'public' AND relrowsecurity = true
  ) THEN
    ALTER TABLE points_transactions ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create policy for viewing points transactions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'points_transactions' AND cmd = 'SELECT'
  ) THEN
    CREATE POLICY "Users can view their own points transactions"
      ON points_transactions
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Create policy for inserting points transactions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE tablename = 'points_transactions' AND cmd = 'INSERT'
  ) THEN
    CREATE POLICY "Users can insert their own points transactions"
      ON points_transactions
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
