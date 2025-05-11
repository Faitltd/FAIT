-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    client_id UUID REFERENCES auth.users(id),
    service_agent_id UUID REFERENCES auth.users(id),
    address TEXT,
    budget DECIMAL(12, 2),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Clients can view their own projects
CREATE POLICY "Clients can view their own projects"
ON public.projects FOR SELECT
TO authenticated
USING (
    client_id = auth.uid() OR
    service_agent_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);

-- Clients can insert their own projects
CREATE POLICY "Clients can insert their own projects"
ON public.projects FOR INSERT
TO authenticated
USING (
    client_id = auth.uid() OR
    service_agent_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);

-- Clients can update their own projects
CREATE POLICY "Clients can update their own projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
    client_id = auth.uid() OR
    service_agent_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);

-- Clients can delete their own projects
CREATE POLICY "Clients can delete their own projects"
ON public.projects FOR DELETE
TO authenticated
USING (
    client_id = auth.uid() OR
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND user_type = 'admin'
    )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_client_id_idx ON public.projects (client_id);
CREATE INDEX IF NOT EXISTS projects_service_agent_id_idx ON public.projects (service_agent_id);
CREATE INDEX IF NOT EXISTS projects_status_idx ON public.projects (status);
