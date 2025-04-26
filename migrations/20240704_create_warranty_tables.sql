-- Create warranty_types table
CREATE TABLE IF NOT EXISTS public.warranty_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warranties table
CREATE TABLE IF NOT EXISTS public.warranties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  warranty_type_id UUID NOT NULL REFERENCES public.warranty_types(id) ON DELETE RESTRICT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warranty_claims table
CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_id UUID NOT NULL REFERENCES public.warranties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  resolution TEXT,
  resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create warranty_claim_attachments table
CREATE TABLE IF NOT EXISTS public.warranty_claim_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_claim_id UUID NOT NULL REFERENCES public.warranty_claims(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for warranty_types
ALTER TABLE public.warranty_types ENABLE ROW LEVEL SECURITY;

-- Everyone can view warranty types
CREATE POLICY "Everyone can view warranty types" 
ON public.warranty_types FOR SELECT 
USING (true);

-- Only admins can modify warranty types
CREATE POLICY "Only admins can modify warranty types" 
ON public.warranty_types FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "Only admins can update warranty types" 
ON public.warranty_types FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

CREATE POLICY "Only admins can delete warranty types" 
ON public.warranty_types FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Create RLS policies for warranties
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;

-- Clients can view their own warranties
CREATE POLICY "Clients can view their own warranties" 
ON public.warranties FOR SELECT 
USING (auth.uid() = client_id);

-- Service agents can view warranties for their services
CREATE POLICY "Service agents can view their warranties" 
ON public.warranties FOR SELECT 
USING (auth.uid() = service_agent_id);

-- Admins can view all warranties
CREATE POLICY "Admins can view all warranties" 
ON public.warranties FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Create RLS policies for warranty_claims
ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;

-- Clients can view their own warranty claims
CREATE POLICY "Clients can view their own warranty claims" 
ON public.warranty_claims FOR SELECT 
USING (auth.uid() = client_id);

-- Clients can create warranty claims
CREATE POLICY "Clients can create warranty claims" 
ON public.warranty_claims FOR INSERT 
WITH CHECK (auth.uid() = client_id);

-- Service agents can view warranty claims for their services
CREATE POLICY "Service agents can view their warranty claims" 
ON public.warranty_claims FOR SELECT 
USING (auth.uid() = service_agent_id);

-- Admins can view all warranty claims
CREATE POLICY "Admins can view all warranty claims" 
ON public.warranty_claims FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Admins can update warranty claims
CREATE POLICY "Admins can update warranty claims" 
ON public.warranty_claims FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Create RLS policies for warranty_claim_attachments
ALTER TABLE public.warranty_claim_attachments ENABLE ROW LEVEL SECURITY;

-- Users can view attachments for claims they can see
CREATE POLICY "Users can view attachments for claims they can see" 
ON public.warranty_claim_attachments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.warranty_claims c
    WHERE c.id = warranty_claim_id
    AND (
      c.client_id = auth.uid() OR 
      c.service_agent_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_type = 'admin'
      )
    )
  )
);

-- Clients can insert attachments for their claims
CREATE POLICY "Clients can insert attachments for their claims" 
ON public.warranty_claim_attachments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.warranty_claims
    WHERE id = warranty_claim_id
    AND client_id = auth.uid()
  )
);

-- Admins can insert attachments for any claim
CREATE POLICY "Admins can insert attachments for any claim" 
ON public.warranty_claim_attachments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Create function to automatically create warranty when booking is completed
CREATE OR REPLACE FUNCTION public.create_warranty_for_completed_booking()
RETURNS TRIGGER AS $$
DECLARE
  warranty_type_id UUID;
  duration_days INTEGER;
  client_subscription TEXT;
BEGIN
  -- Only create warranty if booking status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    -- Get client's subscription plan
    SELECT subscription_plan INTO client_subscription
    FROM public.profiles
    WHERE id = NEW.client_id;
    
    -- Determine warranty type based on client subscription
    IF client_subscription = 'family' OR client_subscription = 'plus' THEN
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

-- Create trigger to create warranty when booking is completed
CREATE TRIGGER create_warranty_after_booking_completion
AFTER UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_warranty_for_completed_booking();

-- Insert default warranty types
INSERT INTO public.warranty_types (name, description, duration_days, is_default)
VALUES 
  ('Standard', 'Standard 30-day warranty for all services', 30, TRUE),
  ('Extended', 'Extended 90-day warranty for premium clients', 90, FALSE),
  ('Premium', 'Premium 1-year warranty for select services', 365, FALSE)
ON CONFLICT DO NOTHING;
