-- Create project_estimates table
CREATE TABLE IF NOT EXISTS public.project_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    total_cost DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimate_categories table
CREATE TABLE IF NOT EXISTS public.estimate_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID REFERENCES public.project_estimates(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimate_items table
CREATE TABLE IF NOT EXISTS public.estimate_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.estimate_categories(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(12, 2) NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimate_assumptions table
CREATE TABLE IF NOT EXISTS public.estimate_assumptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estimate_id UUID REFERENCES public.project_estimates(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    impact VARCHAR(50) NOT NULL DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimate_calculations table to store calculation details
CREATE TABLE IF NOT EXISTS public.estimate_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES public.estimate_items(id) ON DELETE CASCADE,
    calculation_type VARCHAR(50) NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create estimate_templates table
CREATE TABLE IF NOT EXISTS public.estimate_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN NOT NULL DEFAULT false,
    template_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.project_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_assumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_templates ENABLE ROW LEVEL SECURITY;

-- Project estimates policies
CREATE POLICY "Project estimates are viewable by authenticated users with project access"
ON public.project_estimates FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_estimates.project_id
        AND (
            client_id = auth.uid() OR
            service_agent_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND user_type = 'admin'
            )
        )
    )
);

CREATE POLICY "Project estimates are insertable by authenticated users with project access"
ON public.project_estimates FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_estimates.project_id
        AND (
            client_id = auth.uid() OR
            service_agent_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND user_type = 'admin'
            )
        )
    )
);

CREATE POLICY "Project estimates are updatable by authenticated users with project access"
ON public.project_estimates FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_estimates.project_id
        AND (
            client_id = auth.uid() OR
            service_agent_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND user_type = 'admin'
            )
        )
    )
);

CREATE POLICY "Project estimates are deletable by authenticated users with project access"
ON public.project_estimates FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_estimates.project_id
        AND (
            client_id = auth.uid() OR
            service_agent_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND user_type = 'admin'
            )
        )
    )
);

-- Estimate categories policies (inherit from project_estimates)
CREATE POLICY "Estimate categories are viewable by authenticated users with estimate access"
ON public.estimate_categories FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_estimates
        JOIN public.projects ON project_estimates.project_id = projects.id
        WHERE project_estimates.id = estimate_categories.estimate_id
        AND (
            projects.client_id = auth.uid() OR
            projects.service_agent_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND user_type = 'admin'
            )
        )
    )
);

-- Similar policies for other tables...

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_project_estimates_updated_at
BEFORE UPDATE ON public.project_estimates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_categories_updated_at
BEFORE UPDATE ON public.estimate_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_items_updated_at
BEFORE UPDATE ON public.estimate_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_assumptions_updated_at
BEFORE UPDATE ON public.estimate_assumptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_calculations_updated_at
BEFORE UPDATE ON public.estimate_calculations
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimate_templates_updated_at
BEFORE UPDATE ON public.estimate_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS project_estimates_project_id_idx ON public.project_estimates (project_id);
CREATE INDEX IF NOT EXISTS estimate_categories_estimate_id_idx ON public.estimate_categories (estimate_id);
CREATE INDEX IF NOT EXISTS estimate_items_category_id_idx ON public.estimate_items (category_id);
CREATE INDEX IF NOT EXISTS estimate_assumptions_estimate_id_idx ON public.estimate_assumptions (estimate_id);
CREATE INDEX IF NOT EXISTS estimate_calculations_item_id_idx ON public.estimate_calculations (item_id);
