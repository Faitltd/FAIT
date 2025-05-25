-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    status TEXT NOT NULL CHECK (status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'bank_transfer', 'square')),
    payment_intent_id TEXT,
    payment_method_id TEXT,
    receipt_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add payment_status column to bookings table if it doesn't exist
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid' 
CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'failed', 'refunded'));

-- Create function to update booking payment status when payment status changes
CREATE OR REPLACE FUNCTION update_booking_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if the payment status has changed to paid or refunded
    IF (TG_OP = 'UPDATE' AND (NEW.status = 'paid' OR NEW.status = 'refunded') AND OLD.status != NEW.status) THEN
        UPDATE public.bookings
        SET payment_status = NEW.status,
            updated_at = now()
        WHERE id = NEW.booking_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update booking payment status
DROP TRIGGER IF EXISTS update_booking_payment_status_trigger ON public.payments;
CREATE TRIGGER update_booking_payment_status_trigger
AFTER UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION update_booking_payment_status();

-- Set up RLS policies for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policy for clients to view their own payments
CREATE POLICY client_view_payments_policy ON public.payments
    FOR SELECT
    TO authenticated
    USING (
        booking_id IN (
            SELECT id FROM public.bookings
            WHERE client_id = auth.uid()
        )
    );

-- Policy for service agents to view payments for their bookings
CREATE POLICY service_agent_view_payments_policy ON public.payments
    FOR SELECT
    TO authenticated
    USING (
        booking_id IN (
            SELECT id FROM public.bookings
            WHERE service_agent_id = auth.uid()
        )
    );

-- Policy for admins to manage all payments
CREATE POLICY admin_manage_payments_policy ON public.payments
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );
