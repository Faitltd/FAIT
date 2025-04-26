-- Create admin_audit_logs table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  previous_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies for admin_audit_logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.admin_audit_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- Only the system can insert audit logs
CREATE POLICY "Only the system can insert audit logs" 
ON public.admin_audit_logs FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_type = 'admin'
  )
);

-- No one can update or delete audit logs
CREATE POLICY "No one can update audit logs" 
ON public.admin_audit_logs FOR UPDATE 
USING (FALSE);

CREATE POLICY "No one can delete audit logs" 
ON public.admin_audit_logs FOR DELETE 
USING (FALSE);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  admin_id UUID;
  action_type TEXT;
  previous_data JSONB;
  new_data JSONB;
  ip_address TEXT;
  user_agent TEXT;
BEGIN
  -- Get admin ID from auth.uid()
  admin_id := auth.uid();
  
  -- Check if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
    previous_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    previous_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    previous_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;
  
  -- Get IP address and user agent from request headers
  ip_address := current_setting('request.headers', true)::json->>'x-forwarded-for';
  user_agent := current_setting('request.headers', true)::json->>'user-agent';
  
  -- Insert audit log
  INSERT INTO public.admin_audit_logs (
    admin_id,
    action_type,
    table_name,
    record_id,
    previous_data,
    new_data,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    action_type,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    previous_data,
    new_data,
    ip_address,
    user_agent
  );
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for tables that need audit logging

-- Profiles table
CREATE TRIGGER log_admin_action_profiles
AFTER INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

-- Services table
CREATE TRIGGER log_admin_action_services
AFTER INSERT OR UPDATE OR DELETE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

-- Bookings table
CREATE TRIGGER log_admin_action_bookings
AFTER INSERT OR UPDATE OR DELETE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

-- Subscriptions table
CREATE TRIGGER log_admin_action_subscriptions
AFTER INSERT OR UPDATE OR DELETE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

-- Warranty claims table
CREATE TRIGGER log_admin_action_warranty_claims
AFTER INSERT OR UPDATE OR DELETE ON public.warranty_claims
FOR EACH ROW
EXECUTE FUNCTION public.log_admin_action();

-- Create function to manually log admin actions
CREATE OR REPLACE FUNCTION public.create_admin_audit_log(
  p_action_type TEXT,
  p_table_name TEXT,
  p_record_id UUID,
  p_previous_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  admin_id UUID;
  log_id UUID;
  ip_address TEXT;
  user_agent TEXT;
BEGIN
  -- Get admin ID from auth.uid()
  admin_id := auth.uid();
  
  -- Check if user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = admin_id AND user_type = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can create audit logs';
  END IF;
  
  -- Get IP address and user agent from request headers
  ip_address := current_setting('request.headers', true)::json->>'x-forwarded-for';
  user_agent := current_setting('request.headers', true)::json->>'user-agent';
  
  -- Insert audit log
  INSERT INTO public.admin_audit_logs (
    admin_id,
    action_type,
    table_name,
    record_id,
    previous_data,
    new_data,
    ip_address,
    user_agent
  ) VALUES (
    admin_id,
    p_action_type,
    p_table_name,
    p_record_id,
    p_previous_data,
    p_new_data,
    ip_address,
    user_agent
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
