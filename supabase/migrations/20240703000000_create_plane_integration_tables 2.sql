-- Create project_issues table to extend our existing projects table
CREATE TABLE IF NOT EXISTS public.project_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    state VARCHAR(50) NOT NULL DEFAULT 'backlog',
    priority VARCHAR(50) NOT NULL DEFAULT 'medium',
    assignee_id UUID REFERENCES auth.users(id),
    reporter_id UUID REFERENCES auth.users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    labels JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_issue_comments table
CREATE TABLE IF NOT EXISTS public.project_issue_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID REFERENCES public.project_issues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_cycles table (sprints)
CREATE TABLE IF NOT EXISTS public.project_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_cycle_issues table (linking issues to cycles)
CREATE TABLE IF NOT EXISTS public.project_cycle_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID REFERENCES public.project_cycles(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES public.project_issues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cycle_id, issue_id)
);

-- Create project_modules table
CREATE TABLE IF NOT EXISTS public.project_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'planned',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_module_issues table (linking issues to modules)
CREATE TABLE IF NOT EXISTS public.project_module_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES public.project_modules(id) ON DELETE CASCADE,
    issue_id UUID REFERENCES public.project_issues(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module_id, issue_id)
);

-- Create project_views table (custom views)
CREATE TABLE IF NOT EXISTS public.project_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    filters JSONB DEFAULT '{}'::jsonb,
    display_properties JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_issue_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_cycle_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_module_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_views ENABLE ROW LEVEL SECURITY;

-- Project issues policies
CREATE POLICY "Project issues are viewable by authenticated users with project access"
ON public.project_issues FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_issues.project_id
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

CREATE POLICY "Project issues are insertable by authenticated users with project access"
ON public.project_issues FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_issues.project_id
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

CREATE POLICY "Project issues are updatable by authenticated users with project access"
ON public.project_issues FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_issues.project_id
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

CREATE POLICY "Project issues are deletable by authenticated users with project access"
ON public.project_issues FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.projects
        WHERE id = project_issues.project_id
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

-- Project issue comments policies
CREATE POLICY "Project issue comments are viewable by authenticated users with project access"
ON public.project_issue_comments FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.project_issues
        JOIN public.projects ON project_issues.project_id = projects.id
        WHERE project_issues.id = project_issue_comments.issue_id
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

CREATE POLICY "Project issue comments are insertable by authenticated users with project access"
ON public.project_issue_comments FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.project_issues
        JOIN public.projects ON project_issues.project_id = projects.id
        WHERE project_issues.id = project_issue_comments.issue_id
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at timestamp
CREATE TRIGGER update_project_issues_updated_at
BEFORE UPDATE ON public.project_issues
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_issue_comments_updated_at
BEFORE UPDATE ON public.project_issue_comments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_cycles_updated_at
BEFORE UPDATE ON public.project_cycles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_modules_updated_at
BEFORE UPDATE ON public.project_modules
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_views_updated_at
BEFORE UPDATE ON public.project_views
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS project_issues_project_id_idx ON public.project_issues (project_id);
CREATE INDEX IF NOT EXISTS project_issues_assignee_id_idx ON public.project_issues (assignee_id);
CREATE INDEX IF NOT EXISTS project_issues_state_idx ON public.project_issues (state);
CREATE INDEX IF NOT EXISTS project_issues_priority_idx ON public.project_issues (priority);
CREATE INDEX IF NOT EXISTS project_issue_comments_issue_id_idx ON public.project_issue_comments (issue_id);
CREATE INDEX IF NOT EXISTS project_cycles_project_id_idx ON public.project_cycles (project_id);
CREATE INDEX IF NOT EXISTS project_cycle_issues_cycle_id_idx ON public.project_cycle_issues (cycle_id);
CREATE INDEX IF NOT EXISTS project_cycle_issues_issue_id_idx ON public.project_cycle_issues (issue_id);
CREATE INDEX IF NOT EXISTS project_modules_project_id_idx ON public.project_modules (project_id);
CREATE INDEX IF NOT EXISTS project_module_issues_module_id_idx ON public.project_module_issues (module_id);
CREATE INDEX IF NOT EXISTS project_module_issues_issue_id_idx ON public.project_module_issues (issue_id);
CREATE INDEX IF NOT EXISTS project_views_project_id_idx ON public.project_views (project_id);
