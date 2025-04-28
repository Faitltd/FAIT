-- Create warranties table if it doesn't exist
CREATE TABLE IF NOT EXISTS warranties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  warranty_type_id UUID REFERENCES warranty_types(id) ON DELETE SET NULL,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'void')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create warranty_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS warranty_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create warranty_claims table if it doesn't exist
CREATE TABLE IF NOT EXISTS warranty_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_id UUID REFERENCES warranties(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_agent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  photo_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'resolved')),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create warranty_claim_attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS warranty_claim_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_claim_id UUID NOT NULL REFERENCES warranty_claims(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_warranties_client_id ON warranties(client_id);
CREATE INDEX IF NOT EXISTS idx_warranties_service_agent_id ON warranties(service_agent_id);
CREATE INDEX IF NOT EXISTS idx_warranties_booking_id ON warranties(booking_id);
CREATE INDEX IF NOT EXISTS idx_warranties_service_id ON warranties(service_id);
CREATE INDEX IF NOT EXISTS idx_warranties_status ON warranties(status);
CREATE INDEX IF NOT EXISTS idx_warranties_end_date ON warranties(end_date);

CREATE INDEX IF NOT EXISTS idx_warranty_claims_client_id ON warranty_claims(client_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_service_agent_id ON warranty_claims(service_agent_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_warranty_id ON warranty_claims(warranty_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_booking_id ON warranty_claims(booking_id);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_status ON warranty_claims(status);
CREATE INDEX IF NOT EXISTS idx_warranty_claims_created_at ON warranty_claims(created_at);

CREATE INDEX IF NOT EXISTS idx_warranty_claim_attachments_warranty_claim_id ON warranty_claim_attachments(warranty_claim_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
DROP TRIGGER IF EXISTS update_warranties_timestamp ON warranties;
CREATE TRIGGER update_warranties_timestamp
BEFORE UPDATE ON warranties
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_warranty_claims_timestamp ON warranty_claims;
CREATE TRIGGER update_warranty_claims_timestamp
BEFORE UPDATE ON warranty_claims
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Create function to create a warranty for a completed booking
CREATE OR REPLACE FUNCTION create_warranty_for_completed_booking()
RETURNS TRIGGER AS $$
DECLARE
  warranty_type_id UUID;
  duration_days INTEGER;
BEGIN
  -- Only proceed if status changed to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get default warranty type
    SELECT wt.id, wt.duration_days INTO warranty_type_id, duration_days
    FROM warranty_types wt
    WHERE wt.is_default = TRUE
    LIMIT 1;
    
    -- If no default warranty type, use 30 days
    IF warranty_type_id IS NULL THEN
      duration_days := 30;
    END IF;
    
    -- Create warranty
    INSERT INTO warranties (
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
$$ LANGUAGE plpgsql;

-- Create trigger for creating warranties
DROP TRIGGER IF EXISTS create_warranty_for_completed_booking_trigger ON bookings;
CREATE TRIGGER create_warranty_for_completed_booking_trigger
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION create_warranty_for_completed_booking();

-- Create function to expire warranties
CREATE OR REPLACE FUNCTION expire_warranties()
RETURNS VOID AS $$
BEGIN
  UPDATE warranties
  SET status = 'expired'
  WHERE status = 'active' AND end_date < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to notify service agent of new warranty claim
CREATE OR REPLACE FUNCTION notify_new_warranty_claim()
RETURNS TRIGGER AS $$
DECLARE
  service_name TEXT;
  client_name TEXT;
BEGIN
  -- Get service name
  SELECT s.name INTO service_name
  FROM services s
  JOIN warranties w ON s.id = w.service_id
  WHERE w.id = NEW.warranty_id;
  
  -- Get client name
  SELECT first_name || ' ' || last_name INTO client_name
  FROM profiles
  WHERE id = NEW.client_id;
  
  -- Create notification for service agent
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    is_read
  ) VALUES (
    NEW.service_agent_id,
    'warranty_claim_created',
    'New Warranty Claim',
    'You have a new warranty claim from ' || client_name || ' for ' || service_name,
    jsonb_build_object(
      'warranty_claim_id', NEW.id,
      'warranty_id', NEW.warranty_id,
      'client_id', NEW.client_id,
      'client_name', client_name,
      'service_name', service_name
    ),
    FALSE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifying service agent of new warranty claim
DROP TRIGGER IF EXISTS notify_new_warranty_claim_trigger ON warranty_claims;
CREATE TRIGGER notify_new_warranty_claim_trigger
AFTER INSERT ON warranty_claims
FOR EACH ROW
EXECUTE FUNCTION notify_new_warranty_claim();

-- Create function to notify client of warranty claim status change
CREATE OR REPLACE FUNCTION notify_warranty_claim_status_change()
RETURNS TRIGGER AS $$
DECLARE
  service_name TEXT;
  service_agent_name TEXT;
BEGIN
  -- Only proceed if status has changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;
  
  -- Get service name
  SELECT s.name INTO service_name
  FROM services s
  JOIN warranties w ON s.id = w.service_id
  WHERE w.id = NEW.warranty_id;
  
  -- Get service agent name
  SELECT first_name || ' ' || last_name INTO service_agent_name
  FROM profiles
  WHERE id = NEW.service_agent_id;
  
  -- Create notification for client
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    is_read
  ) VALUES (
    NEW.client_id,
    'warranty_claim_status_changed',
    'Warranty Claim Status Updated',
    'Your warranty claim for ' || service_name || ' has been ' || NEW.status,
    jsonb_build_object(
      'warranty_claim_id', NEW.id,
      'warranty_id', NEW.warranty_id,
      'service_agent_id', NEW.service_agent_id,
      'service_agent_name', service_agent_name,
      'service_name', service_name,
      'old_status', OLD.status,
      'new_status', NEW.status
    ),
    FALSE
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifying client of warranty claim status change
DROP TRIGGER IF EXISTS notify_warranty_claim_status_change_trigger ON warranty_claims;
CREATE TRIGGER notify_warranty_claim_status_change_trigger
AFTER UPDATE ON warranty_claims
FOR EACH ROW
EXECUTE FUNCTION notify_warranty_claim_status_change();

-- Add RLS policies
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claim_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_types ENABLE ROW LEVEL SECURITY;

-- Warranties policies
CREATE POLICY "Users can view their own warranties"
  ON warranties
  FOR SELECT
  USING (client_id = auth.uid() OR service_agent_id = auth.uid());

CREATE POLICY "Service agents can create warranties"
  ON warranties
  FOR INSERT
  WITH CHECK (service_agent_id = auth.uid());

CREATE POLICY "Service agents can update their own warranties"
  ON warranties
  FOR UPDATE
  USING (service_agent_id = auth.uid());

-- Warranty claims policies
CREATE POLICY "Users can view their own warranty claims"
  ON warranty_claims
  FOR SELECT
  USING (client_id = auth.uid() OR service_agent_id = auth.uid());

CREATE POLICY "Clients can create warranty claims"
  ON warranty_claims
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Service agents can update warranty claims for their services"
  ON warranty_claims
  FOR UPDATE
  USING (service_agent_id = auth.uid());

-- Warranty claim attachments policies
CREATE POLICY "Users can view attachments for their warranty claims"
  ON warranty_claim_attachments
  FOR SELECT
  USING (
    warranty_claim_id IN (
      SELECT id FROM warranty_claims
      WHERE client_id = auth.uid() OR service_agent_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments for their warranty claims"
  ON warranty_claim_attachments
  FOR INSERT
  WITH CHECK (
    warranty_claim_id IN (
      SELECT id FROM warranty_claims
      WHERE client_id = auth.uid()
    )
  );

-- Warranty types policies
CREATE POLICY "Anyone can view warranty types"
  ON warranty_types
  FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can manage warranty types"
  ON warranty_types
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles
      WHERE user_type = 'admin'
    )
  );

-- Create storage bucket for warranty photos if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('warranty_photos', 'warranty_photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for warranty photos
CREATE POLICY "Users can upload warranty photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'warranty_photos' AND
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can view warranty photos for their claims"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'warranty_photos' AND
    (storage.foldername(name))[1] = auth.uid()
  );

-- Insert default warranty types if they don't exist
INSERT INTO warranty_types (name, description, duration_days, is_default)
VALUES 
  ('Standard', 'Standard 30-day warranty for all services', 30, TRUE),
  ('Extended', 'Extended 90-day warranty for premium services', 90, FALSE),
  ('Premium', 'Premium 1-year warranty for major renovations', 365, FALSE)
ON CONFLICT DO NOTHING;
