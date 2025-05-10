import { User } from '../../core/types/common';

/**
 * Estimation quality level
 */
export enum QualityLevel {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium'
}

/**
 * Room type for remodeling
 */
export enum RoomType {
  KITCHEN = 'kitchen',
  BATHROOM = 'bathroom',
  BEDROOM = 'bedroom',
  LIVING_ROOM = 'livingRoom',
  DINING_ROOM = 'diningRoom',
  BASEMENT = 'basement',
  GARAGE = 'garage',
  OUTDOOR = 'outdoor',
  OTHER = 'other'
}

/**
 * Handyman task type
 */
export enum TaskType {
  PLUMBING = 'plumbing',
  ELECTRICAL = 'electrical',
  CARPENTRY = 'carpentry',
  PAINTING = 'painting',
  FLOORING = 'flooring',
  DRYWALL = 'drywall',
  APPLIANCE = 'appliance',
  FURNITURE = 'furniture',
  CLEANING = 'cleaning',
  OTHER = 'other'
}

/**
 * Remodeling estimate interface
 */
export interface RemodelingEstimate {
  id?: string;
  clientId?: string;
  client?: User;
  roomType: RoomType;
  squareFootage: number;
  quality: QualityLevel;
  includeDemolition: boolean;
  includePermits: boolean;
  totalCost: number;
  breakdown: {
    materials: number;
    labor: number;
    demolition?: number;
    permits?: number;
  };
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Handyman task estimate interface
 */
export interface HandymanTaskEstimate {
  id?: string;
  clientId?: string;
  client?: User;
  taskType: TaskType;
  description: string;
  quantity: number;
  hourlyRate: number;
  estimatedHours: number;
  materialsCost: number;
  totalCost: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Estimate item interface
 */
export interface EstimateItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category: string;
  notes?: string;
}

/**
 * Detailed estimate interface
 */
export interface DetailedEstimate {
  id?: string;
  clientId?: string;
  client?: User;
  projectId?: string;
  title: string;
  description?: string;
  items: EstimateItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  totalCost: number;
  notes?: string;
  validUntil?: string;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Proposal interface
 */
export interface Proposal {
  id?: string;
  estimateId: string;
  clientId?: string;
  client?: User;
  title: string;
  introduction: string;
  scope: string;
  timeline: {
    startDate?: string;
    endDate?: string;
    milestones?: {
      title: string;
      description?: string;
      date?: string;
    }[];
  };
  terms: string[];
  paymentSchedule: {
    deposit: number;
    progress: {
      percentage: number;
      description: string;
    }[];
    final: number;
  };
  totalCost: number;
  status?: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  signatureClient?: {
    name: string;
    date: string;
  };
  signatureContractor?: {
    name: string;
    date: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Scope of work interface
 */
export interface ScopeOfWork {
  id?: string;
  proposalId?: string;
  projectId?: string;
  title: string;
  description: string;
  sections: {
    title: string;
    description: string;
    tasks: {
      description: string;
      details?: string;
      materials?: string;
      specifications?: string;
    }[];
  }[];
  exclusions?: string[];
  assumptions?: string[];
  clientResponsibilities?: string[];
  createdAt?: string;
  updatedAt?: string;
}
