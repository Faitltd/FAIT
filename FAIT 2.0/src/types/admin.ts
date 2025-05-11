import { Profile } from './user';

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support';

export type VerificationStatus = 
  | 'pending'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'expired';

export type DisputeStatus = 
  | 'open'
  | 'in_review'
  | 'resolved'
  | 'closed'
  | 'escalated';

export type AuditAction = 
  | 'create'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'verify'
  | 'approve'
  | 'reject'
  | 'suspend'
  | 'restore';

export interface AdminUser extends Profile {
  admin_role: AdminRole;
  permissions: string[];
  last_login: string | null;
  is_active: boolean;
}

export interface VerificationRequest {
  id: string;
  user_id: string;
  verification_type: string;
  status: VerificationStatus;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  expiration_date: string | null;
  rejection_reason: string | null;
  documents: VerificationDocument[];
  
  // Joined fields
  user?: Profile;
  reviewer?: Profile;
}

export interface VerificationDocument {
  id: string;
  verification_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
}

export interface Dispute {
  id: string;
  title: string;
  description: string;
  status: DisputeStatus;
  priority: 'low' | 'medium' | 'high';
  created_by: string;
  assigned_to: string | null;
  related_entity_id: string | null;
  related_entity_type: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution: string | null;
  
  // Joined fields
  creator?: Profile;
  assignee?: Profile;
  messages?: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  
  // Joined fields
  user?: Profile;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
  
  // Joined fields
  user?: Profile;
}

export interface SystemSettings {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  is_public: boolean;
  updated_at: string;
  updated_by: string | null;
  
  // Joined fields
  updater?: Profile;
}

export interface PlatformStats {
  total_users: number;
  active_users: number;
  total_projects: number;
  active_projects: number;
  total_disputes: number;
  open_disputes: number;
  total_verifications: number;
  pending_verifications: number;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  ip_address: string;
  created_at: string;
  
  // Joined fields
  user?: Profile;
}
