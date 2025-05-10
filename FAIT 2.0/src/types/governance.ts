import { Profile } from './user';

export type EligibilityStatus = 'eligible' | 'ineligible' | 'pending';
export type DistributionStatus = 'pending' | 'approved' | 'distributed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface GovernanceRole {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface MemberRole {
  id: string;
  member_id: string;
  role_id: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  role?: GovernanceRole;
  member?: Profile;
}

export interface DividendEligibility {
  id: string;
  member_id: string;
  eligibility_date: string;
  eligibility_status: EligibilityStatus;
  shares: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  member?: Profile;
}

export interface DividendDistribution {
  id: string;
  distribution_date: string;
  total_amount: number;
  distribution_status: DistributionStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DividendPayment {
  id: string;
  distribution_id: string;
  member_id: string;
  amount: number;
  payment_status: PaymentStatus;
  payment_date: string | null;
  payment_method: string | null;
  transaction_reference: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  member?: Profile;
  distribution?: DividendDistribution;
}

export interface BylawsVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  is_active: boolean;
  effective_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  creator?: Profile;
}

export interface BylawsAcknowledgment {
  id: string;
  bylaws_version_id: string;
  member_id: string;
  acknowledged_at: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  
  // Joined fields
  member?: Profile;
  bylaws_version?: BylawsVersion;
}
