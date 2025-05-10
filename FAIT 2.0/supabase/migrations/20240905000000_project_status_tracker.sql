/*
  Project Status Tracker Migration
  
  This migration adds tables and functions needed for the Project Status Tracker module:
  
  1. Enhances the projects table with status tracking fields
  2. Adds project_milestones table for tracking project milestones
  3. Adds project_status_updates table for tracking status updates
  4. Adds functions for status transitions and notifications
*/

-- Start transaction
BEGIN;

-- Add status_history JSONB column to projects table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'status_history'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN status_history JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add estimated_completion_date column to projects table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'estimated_completion_date'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN estimated_completion_date DATE;
  END IF;
END $$;

-- Add actual_completion_date column to projects table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'actual_completion_date'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN actual_completion_date DATE;
  END IF;
END $$;

-- Add completion_percentage column to projects table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'projects' AND column_name = 'completion_percentage'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN completion_percentage INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completion_date DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'delayed', 'cancelled')),
  order_index INTEGER NOT NULL DEFAULT 0,
  is_payment_milestone BOOLEAN DEFAULT FALSE,
  payment_amount DECIMAL(12, 2),
  payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_status_updates table
CREATE TABLE IF NOT EXISTS public.project_status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  completion_percentage INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_issues table
CREATE TABLE IF NOT EXISTS public.project_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed', 'reopened')),
  resolution_notes TEXT,
  due_date DATE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_issue_comments table
CREATE TABLE IF NOT EXISTS public.project_issue_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  issue_id UUID NOT NULL REFERENCES public.project_issues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to update project status and record history
CREATE OR REPLACE FUNCTION update_project_status(
  p_project_id UUID,
  p_new_status VARCHAR,
  p_user_id UUID,
  p_update_text TEXT DEFAULT NULL,
  p_completion_percentage INTEGER DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_project_record public.projects%ROWTYPE;
  v_previous_status VARCHAR;
  v_status_change JSONB;
BEGIN
  -- Get current project data
  SELECT * INTO v_project_record
  FROM public.projects
  WHERE id = p_project_id;
  
  -- Check if project exists
  IF v_project_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Store previous status
  v_previous_status := v_project_record.status;
  
  -- Only proceed if status is actually changing
  IF v_previous_status = p_new_status AND p_completion_percentage IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Create status change record
  v_status_change := jsonb_build_object(
    'previous_status', v_previous_status,
    'new_status', p_new_status,
    'changed_by', p_user_id,
    'changed_at', NOW(),
    'reason', COALESCE(p_update_text, 'Status updated')
  );
  
  -- Update project status and history
  UPDATE public.projects
  SET 
    status = p_new_status,
    status_history = status_history || v_status_change,
    completion_percentage = COALESCE(p_completion_percentage, completion_percentage),
    updated_at = NOW(),
    actual_completion_date = CASE 
      WHEN p_new_status = 'completed' AND actual_completion_date IS NULL 
      THEN CURRENT_DATE 
      ELSE actual_completion_date 
    END
  WHERE id = p_project_id;
  
  -- Create status update record
  INSERT INTO public.project_status_updates (
    project_id,
    user_id,
    update_text,
    previous_status,
    new_status,
    completion_percentage
  ) VALUES (
    p_project_id,
    p_user_id,
    COALESCE(p_update_text, 'Status updated from ' || v_previous_status || ' to ' || p_new_status),
    v_previous_status,
    p_new_status,
    p_completion_percentage
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to create a project milestone
CREATE OR REPLACE FUNCTION create_project_milestone(
  p_project_id UUID,
  p_title VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_due_date DATE DEFAULT NULL,
  p_order_index INTEGER DEFAULT NULL,
  p_is_payment_milestone BOOLEAN DEFAULT FALSE,
  p_payment_amount DECIMAL DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_milestone_id UUID;
  v_max_order INTEGER;
BEGIN
  -- Get the maximum order index if not provided
  IF p_order_index IS NULL THEN
    SELECT COALESCE(MAX(order_index), 0) + 1 INTO v_max_order
    FROM public.project_milestones
    WHERE project_id = p_project_id;
  ELSE
    v_max_order := p_order_index;
  END IF;
  
  -- Create the milestone
  INSERT INTO public.project_milestones (
    project_id,
    title,
    description,
    due_date,
    order_index,
    is_payment_milestone,
    payment_amount,
    payment_status
  ) VALUES (
    p_project_id,
    p_title,
    p_description,
    p_due_date,
    v_max_order,
    p_is_payment_milestone,
    p_payment_amount,
    CASE WHEN p_is_payment_milestone THEN 'pending' ELSE NULL END
  ) RETURNING id INTO v_milestone_id;
  
  RETURN v_milestone_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to complete a project milestone
CREATE OR REPLACE FUNCTION complete_project_milestone(
  p_milestone_id UUID,
  p_completion_date DATE DEFAULT CURRENT_DATE
) RETURNS BOOLEAN AS $$
DECLARE
  v_project_id UUID;
  v_total_milestones INTEGER;
  v_completed_milestones INTEGER;
  v_completion_percentage INTEGER;
BEGIN
  -- Update the milestone
  UPDATE public.project_milestones
  SET 
    status = 'completed',
    completion_date = p_completion_date,
    updated_at = NOW()
  WHERE id = p_milestone_id
  RETURNING project_id INTO v_project_id;
  
  -- If no rows were updated, return false
  IF v_project_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate new completion percentage for the project
  SELECT 
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed
  INTO 
    v_total_milestones,
    v_completed_milestones
  FROM public.project_milestones
  WHERE project_id = v_project_id;
  
  -- Calculate percentage
  IF v_total_milestones > 0 THEN
    v_completion_percentage := (v_completed_milestones * 100) / v_total_milestones;
  ELSE
    v_completion_percentage := 0;
  END IF;
  
  -- Update project completion percentage
  UPDATE public.projects
  SET 
    completion_percentage = v_completion_percentage,
    updated_at = NOW()
  WHERE id = v_project_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to create a project issue
CREATE OR REPLACE FUNCTION create_project_issue(
  p_project_id UUID,
  p_reported_by UUID,
  p_title VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'medium',
  p_assigned_to UUID DEFAULT NULL,
  p_due_date DATE DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_issue_id UUID;
BEGIN
  -- Create the issue
  INSERT INTO public.project_issues (
    project_id,
    reported_by,
    assigned_to,
    title,
    description,
    priority,
    due_date
  ) VALUES (
    p_project_id,
    p_reported_by,
    p_assigned_to,
    p_title,
    p_description,
    p_priority,
    p_due_date
  ) RETURNING id INTO v_issue_id;
  
  RETURN v_issue_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to resolve a project issue
CREATE OR REPLACE FUNCTION resolve_project_issue(
  p_issue_id UUID,
  p_resolved_by UUID,
  p_resolution_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update the issue
  UPDATE public.project_issues
  SET 
    status = 'resolved',
    resolution_notes = p_resolution_notes,
    resolved_at = NOW(),
    updated_at = NOW()
  WHERE id = p_issue_id;
  
  -- Add a comment about the resolution
  INSERT INTO public.project_issue_comments (
    issue_id,
    user_id,
    comment
  ) VALUES (
    p_issue_id,
    p_resolved_by,
    COALESCE(p_resolution_notes, 'Issue resolved')
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_issue_comments ENABLE ROW LEVEL SECURITY;

-- Project milestones policies
CREATE POLICY "Users can view project milestones they're involved with"
ON public.project_milestones FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_milestones.project_id
    AND (client_id = auth.uid() OR contractor_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Contractors can create and update project milestones"
ON public.project_milestones FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id
    AND contractor_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Contractors can update project milestones"
ON public.project_milestones FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_milestones.project_id
    AND contractor_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Project status updates policies
CREATE POLICY "Users can view project status updates they're involved with"
ON public.project_status_updates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_status_updates.project_id
    AND (client_id = auth.uid() OR contractor_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Users can create project status updates they're involved with"
ON public.project_status_updates FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id
    AND (client_id = auth.uid() OR contractor_id = auth.uid())
  )
);

-- Project issues policies
CREATE POLICY "Users can view project issues they're involved with"
ON public.project_issues FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_issues.project_id
    AND (client_id = auth.uid() OR contractor_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Users can create project issues they're involved with"
ON public.project_issues FOR INSERT
WITH CHECK (
  reported_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_id
    AND (client_id = auth.uid() OR contractor_id = auth.uid())
  )
);

CREATE POLICY "Users can update project issues they're involved with"
ON public.project_issues FOR UPDATE
USING (
  (reported_by = auth.uid() OR assigned_to = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_issues.project_id
    AND contractor_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

-- Project issue comments policies
CREATE POLICY "Users can view project issue comments they're involved with"
ON public.project_issue_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_issues
    WHERE id = project_issue_comments.issue_id
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_issues.project_id
      AND (client_id = auth.uid() OR contractor_id = auth.uid())
    )
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Users can create project issue comments they're involved with"
ON public.project_issue_comments FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.project_issues
    WHERE id = issue_id
    AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE id = project_issues.project_id
      AND (client_id = auth.uid() OR contractor_id = auth.uid())
    )
  )
);

-- Commit transaction
COMMIT;
