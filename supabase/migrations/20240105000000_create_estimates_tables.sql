-- Create estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) GENERATED ALWAYS AS (subtotal * tax_rate / 100) STORED,
    total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (subtotal + (subtotal * tax_rate / 100)) STORED,
    notes TEXT,
    valid_until DATE,
    status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'accepted', 'rejected', 'expired')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create estimate_items table
CREATE TABLE IF NOT EXISTS public.estimate_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up RLS policies for estimates
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

-- Policy for clients to view their own estimates
CREATE POLICY client_view_estimates_policy ON public.estimates
    FOR SELECT
    TO authenticated
    USING (client_id = auth.uid());

-- Policy for service agents to manage their own estimates
CREATE POLICY service_agent_manage_estimates_policy ON public.estimates
    FOR ALL
    TO authenticated
    USING (service_agent_id = auth.uid());

-- Policy for admins to manage all estimates
CREATE POLICY admin_manage_estimates_policy ON public.estimates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Set up RLS policies for estimate_items
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;

-- Policy for clients to view items for their estimates
CREATE POLICY client_view_estimate_items_policy ON public.estimate_items
    FOR SELECT
    TO authenticated
    USING (
        estimate_id IN (
            SELECT id FROM public.estimates
            WHERE client_id = auth.uid()
        )
    );

-- Policy for service agents to manage items for their estimates
CREATE POLICY service_agent_manage_estimate_items_policy ON public.estimate_items
    FOR ALL
    TO authenticated
    USING (
        estimate_id IN (
            SELECT id FROM public.estimates
            WHERE service_agent_id = auth.uid()
        )
    );

-- Policy for admins to manage all estimate items
CREATE POLICY admin_manage_estimate_items_policy ON public.estimate_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Create function to update estimate updated_at timestamp
CREATE OR REPLACE FUNCTION update_estimate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update estimate updated_at timestamp
DROP TRIGGER IF EXISTS update_estimate_updated_at_trigger ON public.estimates;
CREATE TRIGGER update_estimate_updated_at_trigger
BEFORE UPDATE ON public.estimates
FOR EACH ROW EXECUTE FUNCTION update_estimate_updated_at();

-- Create function to check and update estimate status based on valid_until date
CREATE OR REPLACE FUNCTION check_estimate_expiry()
RETURNS TRIGGER AS $$
BEGIN
    -- If the estimate is pending and has expired, update status to expired
    IF NEW.status = 'pending' AND NEW.valid_until < CURRENT_DATE THEN
        NEW.status := 'expired';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to check estimate expiry on update
DROP TRIGGER IF EXISTS check_estimate_expiry_trigger ON public.estimates;
CREATE TRIGGER check_estimate_expiry_trigger
BEFORE UPDATE ON public.estimates
FOR EACH ROW EXECUTE FUNCTION check_estimate_expiry();

-- Create function to check estimate expiry daily
CREATE OR REPLACE FUNCTION expire_pending_estimates()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE public.estimates
    SET status = 'expired'
    WHERE status = 'pending'
    AND valid_until < CURRENT_DATE;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
