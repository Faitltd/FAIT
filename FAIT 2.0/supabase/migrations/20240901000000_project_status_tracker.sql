/*
  Project Status Tracker Migration
  
  This migration adds tables and functions needed for the Project Status Tracker module:
  
  1. Adds project_timeline table for timeline visualization
  2. Adds project_status_updates table for tracking status changes
  3. Adds functions and triggers for milestone progress calculation
*/

-- Start transaction
BEGIN;

-- Create project_timeline table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  color VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create project_status_updates table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.project_status_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  update_reason TEXT,
  updated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add progress field to project_milestones if it doesn't exist
ALTER TABLE public.project_milestones 
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0;

-- Add overall_progress field to projects if it doesn't exist
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS overall_progress INTEGER DEFAULT 0;

-- Function to calculate project progress based on milestones
CREATE OR REPLACE FUNCTION calculate_project_progress()
RETURNS TRIGGER AS $$
DECLARE
  total_milestones INTEGER;
  completed_milestones INTEGER;
  in_progress_milestones INTEGER;
  weighted_progress INTEGER;
BEGIN
  -- Count total milestones for the project
  SELECT COUNT(*) INTO total_milestones
  FROM public.project_milestones
  WHERE project_id = NEW.project_id;
  
  -- Count completed milestones
  SELECT COUNT(*) INTO completed_milestones
  FROM public.project_milestones
  WHERE project_id = NEW.project_id AND status = 'completed';
  
  -- Count in-progress milestones
  SELECT COUNT(*) INTO in_progress_milestones
  FROM public.project_milestones
  WHERE project_id = NEW.project_id AND status = 'in_progress';
  
  -- Calculate weighted progress
  IF total_milestones > 0 THEN
    weighted_progress := (completed_milestones * 100 + 
                         SUM(COALESCE(progress, 0)) * 
                         in_progress_milestones / 
                         NULLIF(in_progress_milestones, 0)) / total_milestones;
  ELSE
    weighted_progress := 0;
  END IF;
  
  -- Update project progress
  UPDATE public.projects
  SET overall_progress = weighted_progress,
      updated_at = NOW()
  WHERE id = NEW.project_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update project progress when milestone is updated
DROP TRIGGER IF EXISTS update_project_progress_trigger ON public.project_milestones;
CREATE TRIGGER update_project_progress_trigger
AFTER INSERT OR UPDATE ON public.project_milestones
FOR EACH ROW
EXECUTE FUNCTION calculate_project_progress();

-- Add RLS policies
ALTER TABLE public.project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_status_updates ENABLE ROW LEVEL SECURITY;

-- Project timeline policies
CREATE POLICY "Users can view project timeline they're involved with"
ON public.project_timeline FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_timeline.project_id
    AND (client_id = auth.uid() OR contractor_id = auth.uid())
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Contractors can insert project timeline"
ON public.project_timeline FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_timeline.project_id
    AND contractor_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Contractors can update project timeline"
ON public.project_timeline FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_timeline.project_id
    AND contractor_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND user_role = 'admin'
  )
);

CREATE POLICY "Contractors can delete project timeline"
ON public.project_timeline FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.projects
    WHERE id = project_timeline.project_id
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

CREATE POLICY "Users can insert project status updates they're involved with"
ON public.project_status_updates FOR INSERT
WITH CHECK (
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

-- Commit transaction
COMMIT;
