-- Create enhanced estimates system tables

-- Create estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'expired', 'converted')),
  expiration_date TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create estimate_items table
CREATE TABLE IF NOT EXISTS public.estimate_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create estimate_photos table
CREATE TABLE IF NOT EXISTS public.estimate_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  public_url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create estimate_activities table for tracking history
CREATE TABLE IF NOT EXISTS public.estimate_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_estimates_service_agent_id ON public.estimates(service_agent_id);
CREATE INDEX IF NOT EXISTS idx_estimates_client_id ON public.estimates(client_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON public.estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimate_items_estimate_id ON public.estimate_items(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_photos_estimate_id ON public.estimate_photos(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_activities_estimate_id ON public.estimate_activities(estimate_id);

-- Add trigger to update estimates.updated_at
CREATE OR REPLACE FUNCTION public.update_estimate_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_estimate_timestamp ON public.estimates;
CREATE TRIGGER update_estimate_timestamp
BEFORE UPDATE ON public.estimates
FOR EACH ROW
EXECUTE FUNCTION public.update_estimate_timestamp();

-- Add trigger to update total_amount when items change
CREATE OR REPLACE FUNCTION public.update_estimate_total()
RETURNS TRIGGER AS $$
DECLARE
  new_total DECIMAL(10, 2);
BEGIN
  -- Calculate new total from all items
  SELECT COALESCE(SUM(total_price), 0) INTO new_total
  FROM public.estimate_items
  WHERE estimate_id = COALESCE(NEW.estimate_id, OLD.estimate_id);
  
  -- Update the estimate total
  UPDATE public.estimates
  SET total_amount = new_total,
      updated_at = NOW()
  WHERE id = COALESCE(NEW.estimate_id, OLD.estimate_id);
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_estimate_total_trigger ON public.estimate_items;
CREATE TRIGGER update_estimate_total_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.estimate_items
FOR EACH ROW
EXECUTE FUNCTION public.update_estimate_total();

-- Add trigger to log estimate activities
CREATE OR REPLACE FUNCTION public.log_estimate_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.estimate_activities (estimate_id, user_id, action, details)
    VALUES (NEW.id, NEW.service_agent_id, 'created', jsonb_build_object('status', NEW.status));
  ELSIF TG_OP = 'UPDATE' THEN
    -- Only log status changes
    IF OLD.status <> NEW.status THEN
      INSERT INTO public.estimate_activities (estimate_id, user_id, action, details)
      VALUES (
        NEW.id, 
        CASE 
          WHEN NEW.status = 'approved' OR NEW.status = 'rejected' THEN NEW.client_id
          ELSE NEW.service_agent_id
        END,
        'status_changed',
        jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
      );
    END IF;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS log_estimate_activity_trigger ON public.estimates;
CREATE TRIGGER log_estimate_activity_trigger
AFTER INSERT OR UPDATE ON public.estimates
FOR EACH ROW
EXECUTE FUNCTION public.log_estimate_activity();

-- Create function to create a booking from an approved estimate
CREATE OR REPLACE FUNCTION public.create_booking_from_estimate(
  estimate_id UUID
)
RETURNS UUID AS $$
DECLARE
  new_booking_id UUID;
  estimate_record public.estimates;
BEGIN
  -- Get the estimate
  SELECT * INTO estimate_record
  FROM public.estimates
  WHERE id = estimate_id;
  
  -- Check if estimate exists and is approved
  IF estimate_record IS NULL THEN
    RAISE EXCEPTION 'Estimate not found';
  END IF;
  
  IF estimate_record.status <> 'approved' THEN
    RAISE EXCEPTION 'Cannot create booking from unapproved estimate';
  END IF;
  
  -- Create the booking
  INSERT INTO public.bookings (
    client_id,
    service_agent_id,
    service_id,
    scheduled_date,
    total_amount,
    notes,
    status,
    estimate_id
  ) VALUES (
    estimate_record.client_id,
    estimate_record.service_agent_id,
    NULL, -- No specific service, this is a custom job
    NOW() + INTERVAL '3 days', -- Default to 3 days from now, can be updated later
    estimate_record.total_amount,
    estimate_record.notes,
    'pending',
    estimate_record.id
  )
  RETURNING id INTO new_booking_id;
  
  -- Update the estimate status to converted
  UPDATE public.estimates
  SET status = 'converted'
  WHERE id = estimate_id;
  
  -- Create notification for the client
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    is_read
  ) VALUES (
    estimate_record.client_id,
    'Booking Created from Estimate',
    'A booking has been created from your approved estimate.',
    'booking',
    FALSE
  );
  
  RETURN new_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_activities ENABLE ROW LEVEL SECURITY;

-- Estimates policies
CREATE POLICY "Service agents can view their own estimates" ON public.estimates
  FOR SELECT
  USING (service_agent_id = auth.uid());

CREATE POLICY "Clients can view estimates for them" ON public.estimates
  FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Service agents can create estimates" ON public.estimates
  FOR INSERT
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own estimates" ON public.estimates
  FOR UPDATE
  USING (service_agent_id = auth.uid() AND status NOT IN ('approved', 'rejected', 'converted'));

CREATE POLICY "Clients can update estimate status" ON public.estimates
  FOR UPDATE
  USING (
    client_id = auth.uid() AND 
    status = 'pending' AND
    (NEW.status = 'approved' OR NEW.status = 'rejected')
  );

-- Estimate items policies
CREATE POLICY "Users can view estimate items for their estimates" ON public.estimate_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND (service_agent_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Service agents can manage estimate items" ON public.estimate_items
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND service_agent_id = auth.uid() AND status NOT IN ('approved', 'rejected', 'converted')
    )
  );

-- Estimate photos policies
CREATE POLICY "Users can view estimate photos" ON public.estimate_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND (service_agent_id = auth.uid() OR client_id = auth.uid())
    )
  );

CREATE POLICY "Service agents can manage estimate photos" ON public.estimate_photos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND service_agent_id = auth.uid() AND status NOT IN ('approved', 'rejected', 'converted')
    )
  );

-- Estimate activities policies
CREATE POLICY "Users can view estimate activities for their estimates" ON public.estimate_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND (service_agent_id = auth.uid() OR client_id = auth.uid())
    )
  );

-- Create storage bucket for estimate photos
INSERT INTO storage.buckets (id, name, public) VALUES ('estimate-photos', 'estimate-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for estimate photos
CREATE POLICY "Anyone can view estimate photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'estimate-photos');

CREATE POLICY "Service agents can upload estimate photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'estimate-photos' AND
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM public.estimates e
      WHERE e.service_agent_id = auth.uid() AND
            e.status NOT IN ('approved', 'rejected', 'converted') AND
            (storage.foldername(name))[1] = e.id::text
    )
  );
