export type ProjectStatus = 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Project {
  id: string;
  title: string;
  description: string;
  client_id: string;
  service_agent_id?: string;
  status: ProjectStatus;
  budget?: number;
  start_date?: string;
  end_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  overall_progress: number;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: ProjectStatus;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  milestone_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ProjectIssue {
  id: string;
  project_id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: TaskPriority;
  reporter_id: string;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectPermit {
  id: string;
  project_id: string;
  permit_type: string;
  permit_number: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  issue_date?: string;
  expiry_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectActivity {
  id: string;
  project_id: string;
  user_id: string;
  activity_type: 'create' | 'update' | 'delete' | 'comment' | 'upload' | 'status_change' | 'remove';
  description: string;
  entity_type: 'project' | 'milestone' | 'task' | 'issue' | 'document' | 'permit' | 'member';
  entity_id: string;
  created_at: string;
}

export interface ProjectComment {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  entity_type: 'project' | 'milestone' | 'task' | 'issue';
  entity_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
  updated_at: string;
  user: User;
}

export interface ProjectWithRelations extends Project {
  milestones?: Milestone[];
  tasks?: Task[];
  issues?: ProjectIssue[];
  documents?: ProjectDocument[];
  permits?: ProjectPermit[];
  activities?: ProjectActivity[];
  members?: ProjectMember[];
}
