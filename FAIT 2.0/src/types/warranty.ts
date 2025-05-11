import { Profile } from './user';
import { Project } from './project';

export type WarrantyStatus = 
  | 'active' 
  | 'expired' 
  | 'void';

export type WarrantyClaimStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'in_progress' 
  | 'completed' 
  | 'cancelled';

export interface WarrantyType {
  id: string;
  name: string;
  description: string;
  duration_days: number;
  premium_duration_days: number;
  created_at: string;
  updated_at: string;
}

export interface Warranty {
  id: string;
  project_id: string;
  client_id: string;
  contractor_id: string;
  warranty_type_id: string;
  start_date: string;
  end_date: string;
  status: WarrantyStatus;
  is_premium: boolean;
  auto_renewal: boolean;
  terms_document_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  client?: Profile;
  contractor?: Profile;
  project?: Project;
  warranty_type?: WarrantyType;
}

export interface WarrantyClaim {
  id: string;
  warranty_id: string;
  client_id: string;
  contractor_id: string;
  description: string;
  status: WarrantyClaimStatus;
  resolution_notes: string | null;
  photo_urls: string[] | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  
  // Joined fields
  client?: Profile;
  contractor?: Profile;
  warranty?: Warranty;
  resolver?: Profile;
}

export interface WarrantyClaimUpdate {
  id: string;
  warranty_claim_id: string;
  previous_status: WarrantyClaimStatus | null;
  new_status: WarrantyClaimStatus;
  update_notes: string | null;
  updated_by: string | null;
  created_at: string;
  
  // Joined fields
  updater?: Profile;
}
