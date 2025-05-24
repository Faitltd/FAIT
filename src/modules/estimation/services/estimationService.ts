import { apiService } from '../../core/services/apiService';
import { 
  RemodelingEstimate, 
  HandymanTaskEstimate, 
  DetailedEstimate,
  Proposal,
  ScopeOfWork,
  RoomType,
  QualityLevel,
  TaskType
} from '../types/estimation';
import { ApiResponse, PaginatedResult, QueryParams } from '../../core/types/common';

/**
 * Estimation service for managing estimates
 */
class EstimationService {
  private baseEndpoint = '/estimates';

  /**
   * Calculate remodeling estimate
   */
  async calculateRemodelingEstimate(
    roomType: RoomType,
    squareFootage: number,
    quality: QualityLevel,
    includeDemolition: boolean,
    includePermits: boolean
  ): Promise<RemodelingEstimate> {
    // Base costs per square foot by room type and quality
    const baseCosts: Record<RoomType, Record<QualityLevel, number>> = {
      [RoomType.KITCHEN]: {
        [QualityLevel.BASIC]: 75,
        [QualityLevel.STANDARD]: 150,
        [QualityLevel.PREMIUM]: 300,
      },
      [RoomType.BATHROOM]: {
        [QualityLevel.BASIC]: 100,
        [QualityLevel.STANDARD]: 200,
        [QualityLevel.PREMIUM]: 350,
      },
      [RoomType.BEDROOM]: {
        [QualityLevel.BASIC]: 30,
        [QualityLevel.STANDARD]: 60,
        [QualityLevel.PREMIUM]: 120,
      },
      [RoomType.LIVING_ROOM]: {
        [QualityLevel.BASIC]: 40,
        [QualityLevel.STANDARD]: 80,
        [QualityLevel.PREMIUM]: 150,
      },
      [RoomType.DINING_ROOM]: {
        [QualityLevel.BASIC]: 35,
        [QualityLevel.STANDARD]: 70,
        [QualityLevel.PREMIUM]: 140,
      },
      [RoomType.BASEMENT]: {
        [QualityLevel.BASIC]: 50,
        [QualityLevel.STANDARD]: 100,
        [QualityLevel.PREMIUM]: 200,
      },
      [RoomType.GARAGE]: {
        [QualityLevel.BASIC]: 40,
        [QualityLevel.STANDARD]: 80,
        [QualityLevel.PREMIUM]: 160,
      },
      [RoomType.OUTDOOR]: {
        [QualityLevel.BASIC]: 20,
        [QualityLevel.STANDARD]: 40,
        [QualityLevel.PREMIUM]: 80,
      },
      [RoomType.OTHER]: {
        [QualityLevel.BASIC]: 45,
        [QualityLevel.STANDARD]: 90,
        [QualityLevel.PREMIUM]: 180,
      },
    };

    // Additional costs
    const demolitionCostPerSqFt = 10;
    const permitCost = 500;

    // Get base cost per square foot
    const baseCostPerSqFt = baseCosts[roomType][quality];
    
    // Calculate material and labor costs
    const materialCost = baseCostPerSqFt * squareFootage * 0.6; // 60% of base cost
    const laborCost = baseCostPerSqFt * squareFootage * 0.4; // 40% of base cost
    
    // Calculate additional costs
    const demolitionCost = includeDemolition ? demolitionCostPerSqFt * squareFootage : 0;
    const permitsCost = includePermits ? permitCost : 0;
    
    // Calculate total cost
    const totalCost = materialCost + laborCost + demolitionCost + permitsCost;
    
    // Create estimate object
    const estimate: RemodelingEstimate = {
      roomType,
      squareFootage,
      quality,
      includeDemolition,
      includePermits,
      totalCost,
      breakdown: {
        materials: materialCost,
        labor: laborCost,
        ...(includeDemolition && { demolition: demolitionCost }),
        ...(includePermits && { permits: permitsCost }),
      },
    };
    
    return estimate;
  }

  /**
   * Save remodeling estimate
   */
  async saveRemodelingEstimate(estimate: RemodelingEstimate): Promise<ApiResponse<RemodelingEstimate>> {
    return apiService.post<RemodelingEstimate>(`${this.baseEndpoint}/remodeling`, estimate);
  }

  /**
   * Calculate handyman task estimate
   */
  async calculateHandymanTaskEstimate(
    taskType: TaskType,
    description: string,
    quantity: number,
    estimatedHours: number
  ): Promise<HandymanTaskEstimate> {
    // Base hourly rates by task type
    const hourlyRates: Record<TaskType, number> = {
      [TaskType.PLUMBING]: 85,
      [TaskType.ELECTRICAL]: 90,
      [TaskType.CARPENTRY]: 75,
      [TaskType.PAINTING]: 65,
      [TaskType.FLOORING]: 70,
      [TaskType.DRYWALL]: 65,
      [TaskType.APPLIANCE]: 80,
      [TaskType.FURNITURE]: 60,
      [TaskType.CLEANING]: 50,
      [TaskType.OTHER]: 70,
    };

    // Base materials cost by task type
    const baseMaterialsCost: Record<TaskType, number> = {
      [TaskType.PLUMBING]: 50,
      [TaskType.ELECTRICAL]: 40,
      [TaskType.CARPENTRY]: 60,
      [TaskType.PAINTING]: 30,
      [TaskType.FLOORING]: 100,
      [TaskType.DRYWALL]: 25,
      [TaskType.APPLIANCE]: 20,
      [TaskType.FURNITURE]: 15,
      [TaskType.CLEANING]: 10,
      [TaskType.OTHER]: 30,
    };

    // Get hourly rate for task type
    const hourlyRate = hourlyRates[taskType];
    
    // Calculate labor cost
    const laborCost = hourlyRate * estimatedHours;
    
    // Calculate materials cost
    const materialsCost = baseMaterialsCost[taskType] * quantity;
    
    // Calculate total cost
    const totalCost = laborCost + materialsCost;
    
    // Create estimate object
    const estimate: HandymanTaskEstimate = {
      taskType,
      description,
      quantity,
      hourlyRate,
      estimatedHours,
      materialsCost,
      totalCost,
    };
    
    return estimate;
  }

  /**
   * Save handyman task estimate
   */
  async saveHandymanTaskEstimate(estimate: HandymanTaskEstimate): Promise<ApiResponse<HandymanTaskEstimate>> {
    return apiService.post<HandymanTaskEstimate>(`${this.baseEndpoint}/handyman`, estimate);
  }

  /**
   * Get all estimates
   */
  async getEstimates(params?: QueryParams): Promise<ApiResponse<PaginatedResult<DetailedEstimate>>> {
    return apiService.get<PaginatedResult<DetailedEstimate>>(this.baseEndpoint, params);
  }

  /**
   * Get an estimate by ID
   */
  async getEstimate(id: string): Promise<ApiResponse<DetailedEstimate>> {
    return apiService.get<DetailedEstimate>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create a detailed estimate
   */
  async createEstimate(estimate: Partial<DetailedEstimate>): Promise<ApiResponse<DetailedEstimate>> {
    return apiService.post<DetailedEstimate>(this.baseEndpoint, estimate);
  }

  /**
   * Update an estimate
   */
  async updateEstimate(id: string, estimate: Partial<DetailedEstimate>): Promise<ApiResponse<DetailedEstimate>> {
    return apiService.put<DetailedEstimate>(`${this.baseEndpoint}/${id}`, estimate);
  }

  /**
   * Delete an estimate
   */
  async deleteEstimate(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Generate a proposal from an estimate
   */
  async generateProposal(estimateId: string): Promise<ApiResponse<Proposal>> {
    return apiService.post<Proposal>(`${this.baseEndpoint}/${estimateId}/proposal`, {});
  }

  /**
   * Generate a scope of work from a proposal
   */
  async generateScopeOfWork(proposalId: string): Promise<ApiResponse<ScopeOfWork>> {
    return apiService.post<ScopeOfWork>(`/proposals/${proposalId}/scope-of-work`, {});
  }

  /**
   * Get client estimates
   */
  async getClientEstimates(
    clientId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<DetailedEstimate>>> {
    return apiService.get<PaginatedResult<DetailedEstimate>>(`/clients/${clientId}/estimates`, params);
  }
}

// Create and export a singleton instance
export const estimationService = new EstimationService();
