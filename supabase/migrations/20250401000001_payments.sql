-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  contractor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  fee numeric NOT NULL,
  net_amount numeric NOT NULL,
  payment_method text,
  payment_processor text NOT NULL,
  processor_payment_id text,
  status text NOT NULL CHECK (status = ANY (ARRAY['pending', 'completed', 'failed', 'refunded'])),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = contractor_id);

-- Update trigger
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();