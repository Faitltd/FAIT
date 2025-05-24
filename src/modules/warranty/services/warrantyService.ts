import { apiService } from '../../core/services/apiService';
import { 
  Warranty, 
  WarrantyClaim, 
  WarrantyTemplate, 
  WarrantyNotification,
  WarrantyClaimStatus,
  WarrantyStatus,
  WarrantyType
} from '../types/warranty';
import { ApiResponse, PaginatedResult, QueryParams } from '../../core/types/common';

/**
 * Warranty service for managing warranties and warranty claims
 */
class WarrantyService {
  private baseEndpoint = '/warranties';

  /**
   * Get all warranties
   */
  async getWarranties(params?: QueryParams): Promise<ApiResponse<PaginatedResult<Warranty>>> {
    return apiService.get<PaginatedResult<Warranty>>(this.baseEndpoint, params);
  }

  /**
   * Get a warranty by ID
   */
  async getWarranty(id: string): Promise<ApiResponse<Warranty>> {
    return apiService.get<Warranty>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Create a warranty
   */
  async createWarranty(warranty: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Warranty>> {
    return apiService.post<Warranty>(this.baseEndpoint, warranty);
  }

  /**
   * Update a warranty
   */
  async updateWarranty(id: string, warranty: Partial<Warranty>): Promise<ApiResponse<Warranty>> {
    return apiService.put<Warranty>(`${this.baseEndpoint}/${id}`, warranty);
  }

  /**
   * Delete a warranty
   */
  async deleteWarranty(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseEndpoint}/${id}`);
  }

  /**
   * Get client warranties
   */
  async getClientWarranties(
    clientId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<Warranty>>> {
    return apiService.get<PaginatedResult<Warranty>>(`/clients/${clientId}/warranties`, params);
  }

  /**
   * Get service agent warranties
   */
  async getServiceAgentWarranties(
    serviceAgentId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<Warranty>>> {
    return apiService.get<PaginatedResult<Warranty>>(
      `/service-agents/${serviceAgentId}/warranties`,
      params
    );
  }

  /**
   * Get project warranties
   */
  async getProjectWarranties(
    projectId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<Warranty>>> {
    return apiService.get<PaginatedResult<Warranty>>(`/projects/${projectId}/warranties`, params);
  }

  /**
   * Create a warranty from template
   */
  async createWarrantyFromTemplate(
    templateId: string,
    clientId: string,
    projectId?: string,
    serviceAgentId?: string,
    startDate?: string
  ): Promise<ApiResponse<Warranty>> {
    return apiService.post<Warranty>(`${this.baseEndpoint}/from-template`, {
      templateId,
      clientId,
      projectId,
      serviceAgentId,
      startDate,
    });
  }

  /**
   * Get all warranty claims
   */
  async getWarrantyClaims(params?: QueryParams): Promise<ApiResponse<PaginatedResult<WarrantyClaim>>> {
    return apiService.get<PaginatedResult<WarrantyClaim>>('/warranty-claims', params);
  }

  /**
   * Get a warranty claim by ID
   */
  async getWarrantyClaim(id: string): Promise<ApiResponse<WarrantyClaim>> {
    return apiService.get<WarrantyClaim>(`/warranty-claims/${id}`);
  }

  /**
   * Create a warranty claim
   */
  async createWarrantyClaim(
    claim: Omit<WarrantyClaim, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<WarrantyClaim>> {
    return apiService.post<WarrantyClaim>('/warranty-claims', claim);
  }

  /**
   * Update a warranty claim
   */
  async updateWarrantyClaim(
    id: string,
    claim: Partial<WarrantyClaim>
  ): Promise<ApiResponse<WarrantyClaim>> {
    return apiService.put<WarrantyClaim>(`/warranty-claims/${id}`, claim);
  }

  /**
   * Delete a warranty claim
   */
  async deleteWarrantyClaim(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/warranty-claims/${id}`);
  }

  /**
   * Get warranty claims for a warranty
   */
  async getWarrantyClaimsForWarranty(
    warrantyId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<WarrantyClaim>>> {
    return apiService.get<PaginatedResult<WarrantyClaim>>(
      `${this.baseEndpoint}/${warrantyId}/claims`,
      params
    );
  }

  /**
   * Get client warranty claims
   */
  async getClientWarrantyClaims(
    clientId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<WarrantyClaim>>> {
    return apiService.get<PaginatedResult<WarrantyClaim>>(
      `/clients/${clientId}/warranty-claims`,
      params
    );
  }

  /**
   * Get service agent warranty claims
   */
  async getServiceAgentWarrantyClaims(
    serviceAgentId: string,
    params?: QueryParams
  ): Promise<ApiResponse<PaginatedResult<WarrantyClaim>>> {
    return apiService.get<PaginatedResult<WarrantyClaim>>(
      `/service-agents/${serviceAgentId}/warranty-claims`,
      params
    );
  }

  /**
   * Update warranty claim status
   */
  async updateWarrantyClaimStatus(
    id: string,
    status: WarrantyClaimStatus,
    notes?: string
  ): Promise<ApiResponse<WarrantyClaim>> {
    return apiService.post<WarrantyClaim>(`/warranty-claims/${id}/status`, {
      status,
      notes,
    });
  }

  /**
   * Add a note to a warranty claim
   */
  async addWarrantyClaimNote(
    claimId: string,
    content: string,
    isInternal: boolean = false
  ): Promise<ApiResponse<WarrantyClaim>> {
    return apiService.post<WarrantyClaim>(`/warranty-claims/${claimId}/notes`, {
      content,
      isInternal,
    });
  }

  /**
   * Upload a photo to a warranty claim
   */
  async uploadWarrantyClaimPhoto(
    claimId: string,
    file: File,
    caption?: string
  ): Promise<ApiResponse<WarrantyClaim>> {
    return apiService.uploadFile<WarrantyClaim>(
      `/warranty-claims/${claimId}/photos`,
      file,
      { caption }
    );
  }

  /**
   * Upload a document to a warranty claim
   */
  async uploadWarrantyClaimDocument(
    claimId: string,
    file: File,
    name: string,
    description?: string
  ): Promise<ApiResponse<WarrantyClaim>> {
    return apiService.uploadFile<WarrantyClaim>(
      `/warranty-claims/${claimId}/documents`,
      file,
      { name, description }
    );
  }

  /**
   * Get all warranty templates
   */
  async getWarrantyTemplates(params?: QueryParams): Promise<ApiResponse<PaginatedResult<WarrantyTemplate>>> {
    return apiService.get<PaginatedResult<WarrantyTemplate>>('/warranty-templates', params);
  }

  /**
   * Get a warranty template by ID
   */
  async getWarrantyTemplate(id: string): Promise<ApiResponse<WarrantyTemplate>> {
    return apiService.get<WarrantyTemplate>(`/warranty-templates/${id}`);
  }

  /**
   * Create a warranty template
   */
  async createWarrantyTemplate(
    template: Omit<WarrantyTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ApiResponse<WarrantyTemplate>> {
    return apiService.post<WarrantyTemplate>('/warranty-templates', template);
  }

  /**
   * Update a warranty template
   */
  async updateWarrantyTemplate(
    id: string,
    template: Partial<WarrantyTemplate>
  ): Promise<ApiResponse<WarrantyTemplate>> {
    return apiService.put<WarrantyTemplate>(`/warranty-templates/${id}`, template);
  }

  /**
   * Delete a warranty template
   */
  async deleteWarrantyTemplate(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/warranty-templates/${id}`);
  }

  /**
   * Get warranty notifications
   */
  async getWarrantyNotifications(params?: QueryParams): Promise<ApiResponse<PaginatedResult<WarrantyNotification>>> {
    return apiService.get<PaginatedResult<WarrantyNotification>>('/warranty-notifications', params);
  }

  /**
   * Mark warranty notification as read
   */
  async markWarrantyNotificationAsRead(id: string): Promise<ApiResponse<WarrantyNotification>> {
    return apiService.post<WarrantyNotification>(`/warranty-notifications/${id}/read`, {});
  }

  /**
   * Generate a warranty PDF
   */
  async generateWarrantyPDF(warrantyId: string): Promise<ApiResponse<{ url: string }>> {
    return apiService.post<{ url: string }>(`${this.baseEndpoint}/${warrantyId}/pdf`, {});
  }
}

// Create and export a singleton instance
export const warrantyService = new WarrantyService();
