import { useState, useEffect, useCallback } from 'react';
import { warrantyService } from '../services/warrantyService';
import { 
  Warranty, 
  WarrantyClaim, 
  WarrantyTemplate, 
  WarrantyClaimStatus,
  WarrantyStatus,
  WarrantyType
} from '../types/warranty';
import { PaginatedResult, QueryParams } from '../../core/types/common';

interface UseWarrantyResult {
  warranties: Warranty[];
  warranty: Warranty | null;
  warrantyClaims: WarrantyClaim[];
  warrantyClaim: WarrantyClaim | null;
  warrantyTemplates: WarrantyTemplate[];
  isLoading: boolean;
  error: string | null;
  totalWarranties: number;
  totalWarrantyClaims: number;
  fetchWarranties: (params?: QueryParams) => Promise<void>;
  fetchWarranty: (id: string) => Promise<void>;
  createWarranty: (warranty: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Warranty>;
  updateWarranty: (id: string, warranty: Partial<Warranty>) => Promise<Warranty>;
  deleteWarranty: (id: string) => Promise<void>;
  fetchWarrantyClaims: (params?: QueryParams) => Promise<void>;
  fetchWarrantyClaim: (id: string) => Promise<void>;
  createWarrantyClaim: (claim: Omit<WarrantyClaim, 'id' | 'createdAt' | 'updatedAt'>) => Promise<WarrantyClaim>;
  updateWarrantyClaim: (id: string, claim: Partial<WarrantyClaim>) => Promise<WarrantyClaim>;
  updateWarrantyClaimStatus: (id: string, status: WarrantyClaimStatus, notes?: string) => Promise<WarrantyClaim>;
  deleteWarrantyClaim: (id: string) => Promise<void>;
  fetchWarrantyTemplates: (params?: QueryParams) => Promise<void>;
  createWarrantyFromTemplate: (
    templateId: string,
    clientId: string,
    projectId?: string,
    serviceAgentId?: string,
    startDate?: string
  ) => Promise<Warranty>;
  generateWarrantyPDF: (warrantyId: string) => Promise<string>;
}

/**
 * Hook for managing warranties
 */
export function useWarranty(): UseWarrantyResult {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>([]);
  const [warrantyClaim, setWarrantyClaim] = useState<WarrantyClaim | null>(null);
  const [warrantyTemplates, setWarrantyTemplates] = useState<WarrantyTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalWarranties, setTotalWarranties] = useState<number>(0);
  const [totalWarrantyClaims, setTotalWarrantyClaims] = useState<number>(0);

  // Fetch warranties
  const fetchWarranties = useCallback(async (params?: QueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await warrantyService.getWarranties(params);
      const result = response.data;
      
      setWarranties(result.data);
      setTotalWarranties(result.total);
    } catch (err) {
      console.error('Error fetching warranties:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warranties');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch warranty by ID
  const fetchWarranty = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await warrantyService.getWarranty(id);
      setWarranty(response.data);
    } catch (err) {
      console.error('Error fetching warranty:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warranty');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create warranty
  const createWarranty = useCallback(
    async (warrantyData: Omit<Warranty, 'id' | 'createdAt' | 'updatedAt'>): Promise<Warranty> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await warrantyService.createWarranty(warrantyData);
        
        // Update warranties list
        setWarranties((prevWarranties) => [response.data, ...prevWarranties]);
        
        return response.data;
      } catch (err) {
        console.error('Error creating warranty:', err);
        setError(err instanceof Error ? err.message : 'Failed to create warranty');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update warranty
  const updateWarranty = useCallback(
    async (id: string, warrantyData: Partial<Warranty>): Promise<Warranty> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await warrantyService.updateWarranty(id, warrantyData);
        
        // Update warranties list
        setWarranties((prevWarranties) =>
          prevWarranties.map((w) => (w.id === id ? response.data : w))
        );
        
        // Update current warranty if it's the one being updated
        if (warranty && warranty.id === id) {
          setWarranty(response.data);
        }
        
        return response.data;
      } catch (err) {
        console.error('Error updating warranty:', err);
        setError(err instanceof Error ? err.message : 'Failed to update warranty');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [warranty]
  );

  // Delete warranty
  const deleteWarranty = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await warrantyService.deleteWarranty(id);
      
      // Update warranties list
      setWarranties((prevWarranties) => prevWarranties.filter((w) => w.id !== id));
      
      // Clear current warranty if it's the one being deleted
      if (warranty && warranty.id === id) {
        setWarranty(null);
      }
    } catch (err) {
      console.error('Error deleting warranty:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete warranty');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [warranty]);

  // Fetch warranty claims
  const fetchWarrantyClaims = useCallback(async (params?: QueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await warrantyService.getWarrantyClaims(params);
      const result = response.data;
      
      setWarrantyClaims(result.data);
      setTotalWarrantyClaims(result.total);
    } catch (err) {
      console.error('Error fetching warranty claims:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warranty claims');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch warranty claim by ID
  const fetchWarrantyClaim = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await warrantyService.getWarrantyClaim(id);
      setWarrantyClaim(response.data);
    } catch (err) {
      console.error('Error fetching warranty claim:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warranty claim');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create warranty claim
  const createWarrantyClaim = useCallback(
    async (claimData: Omit<WarrantyClaim, 'id' | 'createdAt' | 'updatedAt'>): Promise<WarrantyClaim> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await warrantyService.createWarrantyClaim(claimData);
        
        // Update warranty claims list
        setWarrantyClaims((prevClaims) => [response.data, ...prevClaims]);
        
        return response.data;
      } catch (err) {
        console.error('Error creating warranty claim:', err);
        setError(err instanceof Error ? err.message : 'Failed to create warranty claim');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Update warranty claim
  const updateWarrantyClaim = useCallback(
    async (id: string, claimData: Partial<WarrantyClaim>): Promise<WarrantyClaim> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await warrantyService.updateWarrantyClaim(id, claimData);
        
        // Update warranty claims list
        setWarrantyClaims((prevClaims) =>
          prevClaims.map((c) => (c.id === id ? response.data : c))
        );
        
        // Update current warranty claim if it's the one being updated
        if (warrantyClaim && warrantyClaim.id === id) {
          setWarrantyClaim(response.data);
        }
        
        return response.data;
      } catch (err) {
        console.error('Error updating warranty claim:', err);
        setError(err instanceof Error ? err.message : 'Failed to update warranty claim');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [warrantyClaim]
  );

  // Update warranty claim status
  const updateWarrantyClaimStatus = useCallback(
    async (id: string, status: WarrantyClaimStatus, notes?: string): Promise<WarrantyClaim> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await warrantyService.updateWarrantyClaimStatus(id, status, notes);
        
        // Update warranty claims list
        setWarrantyClaims((prevClaims) =>
          prevClaims.map((c) => (c.id === id ? response.data : c))
        );
        
        // Update current warranty claim if it's the one being updated
        if (warrantyClaim && warrantyClaim.id === id) {
          setWarrantyClaim(response.data);
        }
        
        return response.data;
      } catch (err) {
        console.error('Error updating warranty claim status:', err);
        setError(err instanceof Error ? err.message : 'Failed to update warranty claim status');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [warrantyClaim]
  );

  // Delete warranty claim
  const deleteWarrantyClaim = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await warrantyService.deleteWarrantyClaim(id);
      
      // Update warranty claims list
      setWarrantyClaims((prevClaims) => prevClaims.filter((c) => c.id !== id));
      
      // Clear current warranty claim if it's the one being deleted
      if (warrantyClaim && warrantyClaim.id === id) {
        setWarrantyClaim(null);
      }
    } catch (err) {
      console.error('Error deleting warranty claim:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete warranty claim');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [warrantyClaim]);

  // Fetch warranty templates
  const fetchWarrantyTemplates = useCallback(async (params?: QueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await warrantyService.getWarrantyTemplates(params);
      setWarrantyTemplates(response.data.data);
    } catch (err) {
      console.error('Error fetching warranty templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch warranty templates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create warranty from template
  const createWarrantyFromTemplate = useCallback(
    async (
      templateId: string,
      clientId: string,
      projectId?: string,
      serviceAgentId?: string,
      startDate?: string
    ): Promise<Warranty> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await warrantyService.createWarrantyFromTemplate(
          templateId,
          clientId,
          projectId,
          serviceAgentId,
          startDate
        );
        
        // Update warranties list
        setWarranties((prevWarranties) => [response.data, ...prevWarranties]);
        
        return response.data;
      } catch (err) {
        console.error('Error creating warranty from template:', err);
        setError(err instanceof Error ? err.message : 'Failed to create warranty from template');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Generate warranty PDF
  const generateWarrantyPDF = useCallback(async (warrantyId: string): Promise<string> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await warrantyService.generateWarrantyPDF(warrantyId);
      return response.data.url;
    } catch (err) {
      console.error('Error generating warranty PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate warranty PDF');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    warranties,
    warranty,
    warrantyClaims,
    warrantyClaim,
    warrantyTemplates,
    isLoading,
    error,
    totalWarranties,
    totalWarrantyClaims,
    fetchWarranties,
    fetchWarranty,
    createWarranty,
    updateWarranty,
    deleteWarranty,
    fetchWarrantyClaims,
    fetchWarrantyClaim,
    createWarrantyClaim,
    updateWarrantyClaim,
    updateWarrantyClaimStatus,
    deleteWarrantyClaim,
    fetchWarrantyTemplates,
    createWarrantyFromTemplate,
    generateWarrantyPDF,
  };
}
