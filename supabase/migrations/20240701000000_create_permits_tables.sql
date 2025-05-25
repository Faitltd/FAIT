-- Create permits table
CREATE TABLE IF NOT EXISTS public.permits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_number VARCHAR(50) NOT NULL,
    permit_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    issue_date TIMESTAMP WITH TIME ZONE,
    expiration_date TIMESTAMP WITH TIME ZONE,
    valuation DECIMAL(12, 2),
    square_footage INTEGER,
    parcel_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    external_id VARCHAR(100),
    external_source VARCHAR(50) DEFAULT 'denver_epermits',
    UNIQUE(permit_number, external_source)
);

-- Create permit_inspections table
CREATE TABLE IF NOT EXISTS public.permit_inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_id UUID REFERENCES public.permits(id) ON DELETE CASCADE,
    inspection_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    completed_date TIMESTAMP WITH TIME ZONE,
    inspector_name VARCHAR(255),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    external_id VARCHAR(100),
    external_source VARCHAR(50) DEFAULT 'denver_epermits'
);

-- Create project_permits table to link permits to projects
CREATE TABLE IF NOT EXISTS public.project_permits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    permit_id UUID REFERENCES public.permits(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, permit_id)
);

-- Create permit_notifications table
CREATE TABLE IF NOT EXISTS public.permit_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    permit_id UUID REFERENCES public.permits(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permit_notifications ENABLE ROW LEVEL SECURITY;

-- Permits policies
CREATE POLICY "Permits are viewable by authenticated users" 
ON public.permits FOR SELECT 
TO authenticated 
USING (true);

-- Permit inspections policies
CREATE POLICY "Permit inspections are viewable by authenticated users" 
ON public.permit_inspections FOR SELECT 
TO authenticated 
USING (true);

-- Project permits policies
CREATE POLICY "Project permits are viewable by authenticated users" 
ON public.project_permits FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Project permits are insertable by service agents and admins" 
ON public.project_permits FOR INSERT 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (user_type = 'service_agent' OR user_type = 'admin')
    )
);

CREATE POLICY "Project permits are deletable by service agents and admins" 
ON public.project_permits FOR DELETE 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (user_type = 'service_agent' OR user_type = 'admin')
    )
);

-- Permit notifications policies
CREATE POLICY "Permit notifications are viewable by the user they belong to" 
ON public.permit_notifications FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Permit notifications are updatable by the user they belong to" 
ON public.permit_notifications FOR UPDATE 
TO authenticated 
USING (user_id = auth.uid());

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_permits_updated_at
BEFORE UPDATE ON public.permits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permit_inspections_updated_at
BEFORE UPDATE ON public.permit_inspections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_permits_updated_at
BEFORE UPDATE ON public.project_permits
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permit_notifications_updated_at
BEFORE UPDATE ON public.permit_notifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS permits_address_idx ON public.permits (address);
CREATE INDEX IF NOT EXISTS permits_permit_number_idx ON public.permits (permit_number);
CREATE INDEX IF NOT EXISTS permits_status_idx ON public.permits (status);
CREATE INDEX IF NOT EXISTS permit_inspections_permit_id_idx ON public.permit_inspections (permit_id);
CREATE INDEX IF NOT EXISTS permit_inspections_status_idx ON public.permit_inspections (status);
CREATE INDEX IF NOT EXISTS project_permits_project_id_idx ON public.project_permits (project_id);
CREATE INDEX IF NOT EXISTS project_permits_permit_id_idx ON public.project_permits (permit_id);
CREATE INDEX IF NOT EXISTS permit_notifications_user_id_idx ON public.permit_notifications (user_id);
CREATE INDEX IF NOT EXISTS permit_notifications_permit_id_idx ON public.permit_notifications (permit_id);
