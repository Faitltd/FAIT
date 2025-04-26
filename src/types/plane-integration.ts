// Project Issue Types
export interface ProjectIssue {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  state: IssueState;
  priority: IssuePriority;
  assignee_id?: string;
  reporter_id?: string;
  due_date?: string;
  labels: string[];
  created_at: string;
  updated_at: string;
}

export type IssueState = 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'done' | 'canceled';

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

// Project Issue Comment Types
export interface ProjectIssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
}

// Project Cycle Types (Sprints)
export interface ProjectCycle {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status: CycleStatus;
  created_at: string;
  updated_at: string;
}

export type CycleStatus = 'draft' | 'started' | 'completed' | 'canceled';

export interface ProjectCycleIssue {
  id: string;
  cycle_id: string;
  issue_id: string;
  created_at: string;
}

// Project Module Types
export interface ProjectModule {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  status: ModuleStatus;
  created_at: string;
  updated_at: string;
}

export type ModuleStatus = 'planned' | 'in_progress' | 'completed' | 'canceled';

export interface ProjectModuleIssue {
  id: string;
  module_id: string;
  issue_id: string;
  created_at: string;
}

// Project View Types
export interface ProjectView {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  filters: Record<string, any>;
  display_properties: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Extended Project Type (including our existing Project type)
export interface ProjectWithIssues extends Project {
  issues?: ProjectIssue[];
  cycles?: ProjectCycle[];
  modules?: ProjectModule[];
  views?: ProjectView[];
}

// Extend existing Project type
import { Project } from './project';
