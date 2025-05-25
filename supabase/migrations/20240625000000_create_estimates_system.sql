-- Create estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    original_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'expired', 'converted')),
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    expiration_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create estimate items table
CREATE TABLE IF NOT EXISTS public.estimate_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create estimate photos table
CREATE TABLE IF NOT EXISTS public.estimate_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
    file_path TEXT,
    file_name TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    public_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create estimate activities table for tracking history
CREATE TABLE IF NOT EXISTS public.estimate_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create function to update estimate total amount
CREATE OR REPLACE FUNCTION public.update_estimate_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.estimates
    SET total_amount = (
        SELECT COALESCE(SUM(total_price), 0)
        FROM public.estimate_items
        WHERE estimate_id = NEW.estimate_id
    ),
    updated_at = now()
    WHERE id = NEW.estimate_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update estimate total amount when items change
DROP TRIGGER IF EXISTS update_estimate_total_trigger ON public.estimate_items;
CREATE TRIGGER update_estimate_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.estimate_items
FOR EACH ROW EXECUTE FUNCTION public.update_estimate_total();

-- Create function to track estimate status changes
CREATE OR REPLACE FUNCTION public.track_estimate_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.status <> NEW.status) THEN
        INSERT INTO public.estimate_activities (
            estimate_id,
            user_id,
            action,
            details
        ) VALUES (
            NEW.id,
            auth.uid(),
            'status_changed',
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track estimate status changes
DROP TRIGGER IF EXISTS track_estimate_status_change_trigger ON public.estimates;
CREATE TRIGGER track_estimate_status_change_trigger
AFTER UPDATE ON public.estimates
FOR EACH ROW EXECUTE FUNCTION public.track_estimate_status_change();

-- Create function to track estimate creation
CREATE OR REPLACE FUNCTION public.track_estimate_creation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.estimate_activities (
        estimate_id,
        user_id,
        action,
        details
    ) VALUES (
        NEW.id,
        auth.uid(),
        'created',
        jsonb_build_object(
            'title', NEW.title,
            'client_id', NEW.client_id,
            'original_booking_id', NEW.original_booking_id
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track estimate creation
DROP TRIGGER IF EXISTS track_estimate_creation_trigger ON public.estimates;
CREATE TRIGGER track_estimate_creation_trigger
AFTER INSERT ON public.estimates
FOR EACH ROW EXECUTE FUNCTION public.track_estimate_creation();

-- Create function to convert approved estimate to booking
CREATE OR REPLACE FUNCTION public.create_booking_from_estimate(estimate_id UUID)
RETURNS UUID AS $$
DECLARE
    new_booking_id UUID;
    estimate_record RECORD;
BEGIN
    -- Get the estimate details
    SELECT * INTO estimate_record FROM public.estimates WHERE id = estimate_id;
    
    -- Check if estimate exists and is approved
    IF estimate_record IS NULL THEN
        RAISE EXCEPTION 'Estimate not found';
    END IF;
    
    IF estimate_record.status <> 'approved' THEN
        RAISE EXCEPTION 'Only approved estimates can be converted to bookings';
    END IF;
    
    -- Create a new booking
    INSERT INTO public.bookings (
        client_id,
        service_agent_id,
        service_name,
        service_description,
        price,
        status,
        notes,
        payment_status
    ) VALUES (
        estimate_record.client_id,
        estimate_record.service_agent_id,
        estimate_record.title,
        estimate_record.description,
        estimate_record.total_amount,
        'pending',
        estimate_record.notes,
        'unpaid'
    )
    RETURNING id INTO new_booking_id;
    
    -- Update the estimate status to converted
    UPDATE public.estimates
    SET status = 'converted',
        updated_at = now()
    WHERE id = estimate_id;
    
    -- Create a notification for the client
    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        type,
        is_read
    ) VALUES (
        estimate_record.client_id,
        'Estimate Converted to Booking',
        'Your approved estimate has been converted to a booking.',
        'booking',
        false
    );
    
    RETURN new_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up RLS policies for estimates
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

-- Policy for service agents to manage their own estimates
CREATE POLICY service_agent_estimates_policy ON public.estimates
    FOR ALL
    TO authenticated
    USING (service_agent_id = auth.uid());

-- Policy for clients to view their own estimates
CREATE POLICY client_estimates_policy ON public.estimates
    FOR SELECT
    TO authenticated
    USING (client_id = auth.uid());

-- Set up RLS policies for estimate items
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;

-- Policy for service agents to manage their estimate items
CREATE POLICY service_agent_estimate_items_policy ON public.estimate_items
    FOR ALL
    TO authenticated
    USING (
        estimate_id IN (
            SELECT id FROM public.estimates WHERE service_agent_id = auth.uid()
        )
    );

-- Policy for clients to view estimate items
CREATE POLICY client_estimate_items_policy ON public.estimate_items
    FOR SELECT
    TO authenticated
    USING (
        estimate_id IN (
            SELECT id FROM public.estimates WHERE client_id = auth.uid()
        )
    );

-- Set up RLS policies for estimate photos
ALTER TABLE public.estimate_photos ENABLE ROW LEVEL SECURITY;

-- Policy for service agents to manage their estimate photos
CREATE POLICY service_agent_estimate_photos_policy ON public.estimate_photos
    FOR ALL
    TO authenticated
    USING (
        estimate_id IN (
            SELECT id FROM public.estimates WHERE service_agent_id = auth.uid()
        )
    );

-- Policy for clients to view estimate photos
CREATE POLICY client_estimate_photos_policy ON public.estimate_photos
    FOR SELECT
    TO authenticated
    USING (
        estimate_id IN (
            SELECT id FROM public.estimates WHERE client_id = auth.uid()
        )
    );

-- Set up RLS policies for estimate activities
ALTER TABLE public.estimate_activities ENABLE ROW LEVEL SECURITY;

-- Policy for service agents to view activities for their estimates
CREATE POLICY service_agent_estimate_activities_policy ON public.estimate_activities
    FOR SELECT
    TO authenticated
    USING (
        estimate_id IN (
            SELECT id FROM public.estimates WHERE service_agent_id = auth.uid()
        )
    );

-- Policy for clients to view activities for their estimates
CREATE POLICY client_estimate_activities_policy ON public.estimate_activities
    FOR SELECT
    TO authenticated
    USING (
        estimate_id IN (
            SELECT id FROM public.estimates WHERE client_id = auth.uid()
        )
    );

-- Create storage bucket for estimate photos
INSERT INTO storage.buckets (id, name, public) VALUES ('estimate-photos', 'estimate-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for estimate photos
CREATE POLICY "Estimate photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'estimate-photos');

CREATE POLICY "Service agents can upload estimate photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'estimate-photos' AND
    (
        -- Extract estimate ID from the file path (format: {estimate_id}/{filename})
        SPLIT_PART(name, '/', 1) IN (
            SELECT id::text FROM public.estimates WHERE service_agent_id = auth.uid()
        )
    )
);

CREATE POLICY "Service agents can update their estimate photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'estimate-photos' AND
    (
        -- Extract estimate ID from the file path (format: {estimate_id}/{filename})
        SPLIT_PART(name, '/', 1) IN (
            SELECT id::text FROM public.estimates WHERE service_agent_id = auth.uid()
        )
    )
);

CREATE POLICY "Service agents can delete their estimate photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'estimate-photos' AND
    (
        -- Extract estimate ID from the file path (format: {estimate_id}/{filename})
        SPLIT_PART(name, '/', 1) IN (
            SELECT id::text FROM public.estimates WHERE service_agent_id = auth.uid()
        )
    )
);
