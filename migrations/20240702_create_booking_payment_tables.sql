-- Add payment-related columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT,
ADD COLUMN IF NOT EXISTS paypal_payer_id TEXT,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_agent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_intent_id TEXT,
  paypal_order_id TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for transactions table
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Clients can view their own transactions
CREATE POLICY "Clients can view their own transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = client_id);

-- Service agents can view transactions for their services
CREATE POLICY "Service agents can view their transactions" 
ON public.transactions FOR SELECT 
USING (auth.uid() = service_agent_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" 
ON public.transactions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Create function to update booking status when payment is made
CREATE OR REPLACE FUNCTION public.update_booking_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- If transaction is completed, update booking status to confirmed
  IF NEW.status = 'completed' THEN
    UPDATE public.bookings
    SET 
      status = 'confirmed',
      payment_status = 'paid',
      paid_at = NOW()
    WHERE id = NEW.booking_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update booking status when payment is made
CREATE TRIGGER update_booking_status_on_payment
AFTER INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_booking_on_payment();
