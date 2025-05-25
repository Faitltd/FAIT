-- Create enhanced warranty system tables

-- Create warranty_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.warranty_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create warranties table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.warranties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  warranty_type_id UUID REFERENCES public.warranty_types(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'void')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create warranty_claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_id UUID NOT NULL REFERENCES public.warranties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'resolved')),
  admin_notes TEXT,
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create warranty_claim_photos table
CREATE TABLE IF NOT EXISTS public.warranty_claim_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  claim_id UUID NOT NULL REFERENCES public.warranty_claims(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  public_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_warranties_client_id ON public.warranties(client_id);
CREATE INDEX IF NOT EXISTS idx_warranties_service_agent_id ON public.warranties(service_agent_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON public.warranties(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_warranty_id ON public.warranty_claims(warranty_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_client_id ON public.warranty_claims(client_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_service_agent_id ON public.warranty_claims(service_agent_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON public.warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claim_photos_claim_id ON public.warranty_claim_photos(claim_id);

-- Add triggers to update timestamps
CREATE OR REPLACE FUNCTION public.update_warranty_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_warranty_timestamp ON public.warranties;
CREATE TRIGGER update_warranty_timestamp
BEFORE UPDATE ON public.warranties
FOR EACH ROW
EXECUTE FUNCTION public.update_warranty_timestamp();

DROP TRIGGER IF EXISTS update_warranty_claim_timestamp ON public.warranty_claims;
CREATE TRIGGER update_warranty_claim_timestamp
BEFORE UPDATE ON public.warranty_claims
FOR EACH ROW
EXECUTE FUNCTION public.update_warranty_timestamp();

-- Create function to automatically create a warranty when a booking is completed
CREATE OR REPLACE FUNCTION public.create_warranty_for_completed_booking()
RETURNS TRIGGER AS $$
DECLARE
  warranty_type_id UUID;
  duration_days INTEGER;
  client_subscription TEXT;
BEGIN
  -- Only create warranty when booking status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get client's subscription level
    SELECT subscription_plan INTO client_subscription
    FROM public.profiles
    WHERE id = NEW.client_id;
    
    -- Determine warranty type based on client subscription
    IF client_subscription = 'plus' OR client_subscription = 'family' THEN
      -- Extended warranty for premium clients
      SELECT id, duration_days INTO warranty_type_id, duration_days
      FROM public.warranty_types
      WHERE name = 'Extended';
    ELSE
      -- Standard warranty for basic clients
      SELECT id, duration_days INTO warranty_type_id, duration_days
      FROM public.warranty_types
      WHERE is_default = TRUE;
    END IF;
    
    -- Create warranty
    INSERT INTO public.warranties (
      booking_id,
      client_id,
      service_agent_id,
      service_id,
      warranty_type_id,
      start_date,
      end_date,
      status
    ) VALUES (
      NEW.id,
      NEW.client_id,
      NEW.service_agent_id,
      NEW.service_id,
      warranty_type_id,
      NOW(),
      NOW() + (duration_days || ' days')::INTERVAL,
      'active'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for creating warranties
DROP TRIGGER IF EXISTS create_warranty_for_completed_booking_trigger ON public.bookings;
CREATE TRIGGER create_warranty_for_completed_booking_trigger
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_warranty_for_completed_booking();

-- Create function to expire warranties
CREATE OR REPLACE FUNCTION public.expire_warranties()
RETURNS VOID AS $$
BEGIN
  UPDATE public.warranties
  SET status = 'expired'
  WHERE status = 'active' AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to notify service agent of new warranty claim
CREATE OR REPLACE FUNCTION public.notify_new_warranty_claim()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for service agent
  INSERT INTO public.notifications (
    user_id,
    title,
    message,
    type,
    is_read
  ) VALUES (
    NEW.service_agent_id,
    'New Warranty Claim',
    'A new warranty claim has been submitted for your service.',
    'warranty',
    FALSE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifying service agent of new warranty claim
DROP TRIGGER IF EXISTS notify_new_warranty_claim_trigger ON public.warranty_claims;
CREATE TRIGGER notify_new_warranty_claim_trigger
AFTER INSERT ON public.warranty_claims
FOR EACH ROW
EXECUTE FUNCTION public.notify_new_warranty_claim();

-- Add RLS policies
ALTER TABLE public.warranty_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranty_claim_photos ENABLE ROW LEVEL SECURITY;

-- Warranty types policies
CREATE POLICY "Anyone can view warranty types" ON public.warranty_types
  FOR SELECT
  USING (TRUE);

-- Warranties policies
CREATE POLICY "Users can view their own warranties" ON public.warranties
  FOR SELECT
  USING (client_id = auth.uid() OR service_agent_id = auth.uid());

-- Admins can view all warranties
CREATE POLICY "Admins can view all warranties" ON public.warranties
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Warranty claims policies
CREATE POLICY "Users can view their own warranty claims" ON public.warranty_claims
  FOR SELECT
  USING (client_id = auth.uid() OR service_agent_id = auth.uid());

CREATE POLICY "Clients can create warranty claims" ON public.warranty_claims
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Service agents can update warranty claims" ON public.warranty_claims
  FOR UPDATE
  USING (service_agent_id = auth.uid());

-- Admins can view and update all warranty claims
CREATE POLICY "Admins can view all warranty claims" ON public.warranty_claims
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all warranty claims" ON public.warranty_claims
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Warranty claim photos policies
CREATE POLICY "Users can view warranty claim photos" ON public.warranty_claim_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.warranty_claims
      WHERE id = claim_id AND (client_id = auth.uid() OR service_agent_id = auth.uid())
    )
  );

CREATE POLICY "Clients can insert warranty claim photos" ON public.warranty_claim_photos
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.warranty_claims
      WHERE id = claim_id AND client_id = auth.uid()
    )
  );

-- Create storage bucket for warranty photos
INSERT INTO storage.buckets (id, name, public) VALUES ('warranty-photos', 'warranty-photos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for warranty photos
CREATE POLICY "Anyone can view warranty photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'warranty-photos');

CREATE POLICY "Authenticated users can upload warranty photos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'warranty-photos' AND
    auth.role() = 'authenticated'
  );

-- Insert default warranty types
INSERT INTO public.warranty_types (name, description, duration_days, is_default)
VALUES 
  ('Standard', 'Standard 30-day warranty for all services', 30, TRUE),
  ('Extended', 'Extended 90-day warranty for premium clients', 90, FALSE),
  ('Premium', 'Premium 1-year warranty for select services', 365, FALSE)
ON CONFLICT DO NOTHING;
