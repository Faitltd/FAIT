import { Project } from './project';

// Project Estimate Types
export interface ProjectEstimate {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  created_by: string;
  status: EstimateStatus;
  total_cost: number;
  created_at: string;
  updated_at: string;
  
  // Relations (not in database)
  categories?: EstimateCategory[];
  assumptions?: EstimateAssumption[];
  project?: Project;
}

export type EstimateStatus = 'draft' | 'in_review' | 'approved' | 'rejected' | 'archived';

// Estimate Category Types
export interface EstimateCategory {
  id: string;
  estimate_id: string;
  name: string;
  description?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Relations (not in database)
  items?: EstimateItem[];
}

// Estimate Item Types
export interface EstimateItem {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  total_cost: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  
  // Relations (not in database)
  calculations?: EstimateCalculation[];
}

// Estimate Assumption Types
export interface EstimateAssumption {
  id: string;
  estimate_id: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

// Estimate Calculation Types
export interface EstimateCalculation {
  id: string;
  item_id: string;
  calculation_type: CalculationType;
  parameters: Record<string, any>;
  result: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type CalculationType = 
  | 'foundation' 
  | 'wall' 
  | 'roof' 
  | 'floor' 
  | 'concrete' 
  | 'framing' 
  | 'drywall' 
  | 'paint' 
  | 'custom';

// Foundation Calculation Parameters
export interface FoundationCalculationParams {
  length: number;
  width: number;
  depth: number;
  thickness?: number;
  type: 'slab' | 'crawlspace' | 'basement';
  reinforcement?: boolean;
  wastage?: number; // percentage
}

// Wall Calculation Parameters
export interface WallCalculationParams {
  length: number;
  height: number;
  thickness: number;
  openings?: {
    width: number;
    height: number;
  }[];
  type: 'brick' | 'block' | 'wood' | 'concrete';
  insulation?: boolean;
  wastage?: number; // percentage
}

// Roof Calculation Parameters
export interface RoofCalculationParams {
  length: number;
  width: number;
  pitch: number; // in degrees
  overhang?: number;
  type: 'shingle' | 'metal' | 'tile' | 'flat';
  wastage?: number; // percentage
}

// Floor Calculation Parameters
export interface FloorCalculationParams {
  length: number;
  width: number;
  type: 'tile' | 'wood' | 'carpet' | 'concrete' | 'vinyl';
  wastage?: number; // percentage
}

// Concrete Calculation Parameters
export interface ConcreteCalculationParams {
  length: number;
  width: number;
  depth: number;
  reinforcement?: boolean;
  psi?: number; // strength
  wastage?: number; // percentage
}

// Framing Calculation Parameters
export interface FramingCalculationParams {
  length: number;
  height: number;
  spacing: number; // in inches
  type: '2x4' | '2x6' | '2x8' | '2x10' | '2x12';
  wastage?: number; // percentage
}

// Drywall Calculation Parameters
export interface DrywallCalculationParams {
  length: number;
  height: number;
  openings?: {
    width: number;
    height: number;
  }[];
  thickness: '1/4' | '3/8' | '1/2' | '5/8';
  wastage?: number; // percentage
}

// Paint Calculation Parameters
export interface PaintCalculationParams {
  area: number;
  coats: number;
  type: 'interior' | 'exterior' | 'primer';
  wastage?: number; // percentage
}

// Custom Calculation Parameters
export interface CustomCalculationParams {
  formula: string;
  variables: Record<string, number>;
}

// Estimate Template Types
export interface EstimateTemplate {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  is_public: boolean;
  template_data: {
    categories: {
      name: string;
      description?: string;
      sort_order: number;
      items: {
        name: string;
        description?: string;
        unit: string;
        unit_cost: number;
        sort_order: number;
        calculation_type?: CalculationType;
        default_parameters?: Record<string, any>;
      }[];
    }[];
    assumptions: {
      description: string;
      impact: 'low' | 'medium' | 'high';
    }[];
  };
  created_at: string;
  updated_at: string;
}
