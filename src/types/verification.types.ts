/**
 * Types for the contractor verification and onboarding system
 */

/**
 * Verification level
 */
export enum VerificationLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium'
}

/**
 * Verification status
 */
export enum VerificationStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Document type
 */
export enum DocumentType {
  IDENTITY = 'identity',
  BUSINESS_LICENSE = 'business_license',
  INSURANCE = 'insurance',
  CERTIFICATION = 'certification',
  TAX_DOCUMENT = 'tax_document',
  REFERENCE = 'reference',
  PORTFOLIO = 'portfolio',
  BACKGROUND_CHECK = 'background_check'
}

/**
 * Document status
 */
export enum DocumentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired'
}

/**
 * Service agent verification
 */
export interface ServiceAgentVerification {
  id: string;
  service_agent_id: string;
  verification_level: VerificationLevel;
  verification_status: VerificationStatus;
  is_verified: boolean;
  verification_date: string | null;
  expiration_date: string | null;
  rejection_reason: string | null;
  background_check_status: string | null;
  background_check_id: string | null;
  verified_by: string | null;
  created_at: string;
  updated_at: string;

  // Joined fields
  profiles?: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    business_name: string | null;
  };
  verification_documents?: VerificationDocument[];
}

/**
 * Verification document
 */
export interface VerificationDocument {
  id: string;
  verification_id: string;
  document_type: DocumentType;
  document_status: DocumentStatus;
  document_url: string;
  document_name: string;
  document_number: string | null;
  issuing_authority: string | null;
  expiration_date: string | null;
  rejection_reason: string | null;
  verified_by: string | null;
  uploaded_at: string;
  verified_at: string | null;
}

/**
 * Verification history entry
 */
export interface VerificationHistoryEntry {
  id: string;
  verification_id: string;
  action: string;
  previous_status: VerificationStatus | null;
  new_status: VerificationStatus | null;
  notes: string | null;
  performed_by: string | null;
  created_at: string;

  // Joined fields
  admin?: {
    id: string;
    full_name: string;
  };
}

/**
 * Onboarding step
 */
export enum OnboardingStep {
  WELCOME = 'welcome',
  PROFILE = 'profile',
  BUSINESS = 'business',
  SERVICES = 'services',
  VERIFICATION = 'verification',
  BACKGROUND_CHECK = 'background_check',
  COMPLETION = 'completion'
}

/**
 * Onboarding progress
 */
export interface OnboardingProgress {
  id: string;
  service_agent_id: string;
  current_step: OnboardingStep;
  completed_steps: OnboardingStep[];
  is_completed: boolean;
  started_at: string;
  completed_at: string | null;
  last_updated_at: string;
}

/**
 * Verification requirements by level
 */
export const VERIFICATION_REQUIREMENTS: Record<VerificationLevel, DocumentType[]> = {
  [VerificationLevel.BASIC]: [
    DocumentType.IDENTITY
  ],
  [VerificationLevel.STANDARD]: [
    DocumentType.IDENTITY,
    DocumentType.BUSINESS_LICENSE,
    DocumentType.INSURANCE
  ],
  [VerificationLevel.PREMIUM]: [
    DocumentType.IDENTITY,
    DocumentType.BUSINESS_LICENSE,
    DocumentType.INSURANCE,
    DocumentType.CERTIFICATION,
    DocumentType.BACKGROUND_CHECK
  ]
};

/**
 * Document type information
 */
export interface DocumentTypeInfo {
  type: DocumentType;
  label: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  examples: string[];
}

/**
 * Document type information map
 */
export const DOCUMENT_TYPE_INFO: Record<DocumentType, DocumentTypeInfo> = {
  [DocumentType.IDENTITY]: {
    type: DocumentType.IDENTITY,
    label: 'Identity Document',
    description: 'Government-issued photo ID such as a driver\'s license or passport',
    required: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    examples: ['Driver\'s License', 'Passport', 'State ID']
  },
  [DocumentType.BUSINESS_LICENSE]: {
    type: DocumentType.BUSINESS_LICENSE,
    label: 'Business License',
    description: 'Your current business license or registration',
    required: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    examples: ['Business License', 'LLC Registration', 'DBA Certificate']
  },
  [DocumentType.INSURANCE]: {
    type: DocumentType.INSURANCE,
    label: 'Insurance Certificate',
    description: 'Proof of liability insurance coverage',
    required: true,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    examples: ['Liability Insurance', 'Workers\' Compensation', 'Professional Insurance']
  },
  [DocumentType.CERTIFICATION]: {
    type: DocumentType.CERTIFICATION,
    label: 'Professional Certification',
    description: 'Relevant professional certifications or qualifications',
    required: false,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    examples: ['Trade Certification', 'Professional License', 'Training Certificate']
  },
  [DocumentType.TAX_DOCUMENT]: {
    type: DocumentType.TAX_DOCUMENT,
    label: 'Tax Document',
    description: 'Business tax registration or EIN documentation',
    required: false,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    examples: ['EIN Letter', 'Tax Registration', 'W-9 Form']
  },
  [DocumentType.REFERENCE]: {
    type: DocumentType.REFERENCE,
    label: 'Professional Reference',
    description: 'Letters of recommendation or professional references',
    required: false,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    examples: ['Reference Letter', 'Testimonial', 'Recommendation']
  },
  [DocumentType.PORTFOLIO]: {
    type: DocumentType.PORTFOLIO,
    label: 'Work Portfolio',
    description: 'Examples of previous work or projects',
    required: false,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    examples: ['Project Photos', 'Before/After Images', 'Project Documentation']
  },
  [DocumentType.BACKGROUND_CHECK]: {
    type: DocumentType.BACKGROUND_CHECK,
    label: 'Background Check',
    description: 'Background check authorization or results',
    required: false,
    acceptedFormats: ['.jpg', '.jpeg', '.png', '.pdf'],
    examples: ['Background Check Results', 'Authorization Form']
  }
};

/**
 * Legacy types for backward compatibility
 */
export interface VerificationRequest {
  id: string;
  user_id: string;
  status: string;
  request_date: string;
  review_date?: string;
  reviewed_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  documents?: VerificationDocument[];
}

export interface VerificationStats {
  total_requests: number;
  approved_requests: number;
  pending_requests: number;
  rejected_requests: number;
  average_approval_time: number; // in hours
}
