import { Profile } from './user';

export type ProjectStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export type MilestoneStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export interface Project {
  id: string;
  title: string;
  description: string;
  client_id: string;
  contractor_id: string;
  status: ProjectStatus;
  budget: number;
  start_date: string;
  end_date: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  overall_progress: number;
  created_at: string;
  updated_at: string;

  // Joined fields
  client?: Profile;
  contractor?: Profile;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string;
  due_date: string;
  completed_date: string | null;
  status: MilestoneStatus;
  progress: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTimeline {
  id: string;
  project_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectStatusUpdate {
  id: string;
  project_id: string;
  previous_status: ProjectStatus | null;
  new_status: ProjectStatus;
  update_reason: string;
  updated_by: string;
  created_at: string;

  // Joined fields
  updater?: Profile;
}

export type ProjectIssuePriority = 'low' | 'medium' | 'high';

export type ProjectIssueStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface ProjectIssue {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: ProjectIssueStatus;
  priority: ProjectIssuePriority;
  reported_by: string;
  assigned_to: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;

  // Joined fields
  reporter?: Profile;
  assignee?: Profile;
  comments?: ProjectIssueComment[];
}

export interface ProjectIssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;

  // Joined fields
  user?: Profile;
}
