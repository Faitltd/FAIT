import { User } from '../../core/types/common';

/**
 * Warranty status
 */
export enum WarrantyStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  VOIDED = 'voided',
  PENDING = 'pending'
}

/**
 * Warranty type
 */
export enum WarrantyType {
  STANDARD = 'standard',
  EXTENDED = 'extended',
  LIMITED = 'limited',
  LIFETIME = 'lifetime',
  MANUFACTURER = 'manufacturer'
}

/**
 * Warranty claim status
 */
export enum WarrantyClaimStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Warranty interface
 */
export interface Warranty {
  id: string;
  clientId: string;
  client?: User;
  projectId?: string;
  serviceAgentId?: string;
  serviceAgent?: User;
  type: WarrantyType;
  status: WarrantyStatus;
  title: string;
  description: string;
  coveredItems: string[];
  exclusions?: string[];
  startDate: string;
  endDate?: string;
  duration?: number; // in months
  terms: string;
  documents?: WarrantyDocument[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Warranty document interface
 */
export interface WarrantyDocument {
  id: string;
  warrantyId: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

/**
 * Warranty claim interface
 */
export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  warranty?: Warranty;
  clientId: string;
  client?: User;
  serviceAgentId?: string;
  serviceAgent?: User;
  status: WarrantyClaimStatus;
  title: string;
  description: string;
  issueDate: string;
  resolutionDate?: string;
  resolutionDescription?: string;
  photos?: WarrantyClaimPhoto[];
  documents?: WarrantyClaimDocument[];
  notes?: WarrantyClaimNote[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Warranty claim photo interface
 */
export interface WarrantyClaimPhoto {
  id: string;
  claimId: string;
  url: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: string;
}

/**
 * Warranty claim document interface
 */
export interface WarrantyClaimDocument {
  id: string;
  claimId: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
}

/**
 * Warranty claim note interface
 */
export interface WarrantyClaimNote {
  id: string;
  claimId: string;
  userId: string;
  user?: User;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Warranty template interface
 */
export interface WarrantyTemplate {
  id: string;
  name: string;
  description?: string;
  type: WarrantyType;
  coveredItems: string[];
  exclusions?: string[];
  duration: number; // in months
  terms: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Warranty notification interface
 */
export interface WarrantyNotification {
  id: string;
  warrantyId: string;
  warranty?: Warranty;
  clientId: string;
  client?: User;
  type: 'expiration_reminder' | 'status_change' | 'claim_update';
  title: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
}
