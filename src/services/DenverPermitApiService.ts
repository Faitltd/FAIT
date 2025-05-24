import { Permit, PermitInspection } from './PermitService';

// Configuration for the Denver ePermits API (Accela API)
interface AccelaApiConfig {
  baseUrl: string;
  apiKey: string;
  agency: string;
}

// Mock API configuration - to be replaced with actual Accela API credentials
const API_CONFIG: AccelaApiConfig = {
  baseUrl: 'https://apis.accela.com/v4',
  apiKey: import.meta.env.VITE_ACCELA_API_KEY || '',
  agency: 'DENVER'
};

/**
 * Service for interacting with the Denver ePermits API (Accela API)
 */
class DenverPermitApiService {
  private config: AccelaApiConfig;

  constructor(config: AccelaApiConfig = API_CONFIG) {
    this.config = config;
  }

  /**
   * Get an access token for the Accela API
   * @returns Access token
   */
  private async getAccessToken(): Promise<string> {
    // TODO: Implement actual OAuth flow for Accela API
    // For now, return a mock token
    return 'mock_access_token';
  }

  /**
   * Make a request to the Accela API
   * @param endpoint API endpoint
   * @param method HTTP method
   * @param params Query parameters
   * @param body Request body
   * @returns API response
   */
  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    params: Record<string, string> = {},
    body?: any
  ): Promise<T> {
    try {
      // In a real implementation, we would:
      // 1. Get an access token
      // 2. Build the request URL with query parameters
      // 3. Make the request with the appropriate headers and body
      // 4. Handle the response

      // For now, we'll return mock data
      console.log(`Mock API request: ${method} ${endpoint}`);
      console.log('Params:', params);
      console.log('Body:', body);

      // Simulate API latency
      await new Promise(resolve => setTimeout(resolve, 500));

      // Return mock data based on the endpoint
      if (endpoint.includes('records')) {
        return this.getMockPermits() as unknown as T;
      } else if (endpoint.includes('inspections')) {
        return this.getMockInspections() as unknown as T;
      } else {
        return {} as T;
      }
    } catch (error) {
      console.error('Error making API request:', error);
      throw error;
    }
  }

  /**
   * Search for permits by address
   * @param address The address to search for
   * @returns Array of permits matching the address
   */
  async searchPermitsByAddress(address: string): Promise<Permit[]> {
    try {
      // In a real implementation, we would call the Accela API to search for permits
      // For now, return mock data
      const mockPermits = this.getMockPermits();

      // Filter mock permits by address (case-insensitive partial match)
      return mockPermits.filter(permit =>
        permit.address.toLowerCase().includes(address.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching permits by address:', error);
      throw error;
    }
  }

  /**
   * Get a permit by permit number
   * @param permitNumber The permit number to search for
   * @returns The permit matching the permit number, if found
   */
  async getPermitByNumber(permitNumber: string): Promise<Permit | null> {
    try {
      // In a real implementation, we would call the Accela API to get the permit
      // For now, return mock data
      const mockPermits = this.getMockPermits();

      // Find the permit with the matching permit number
      return mockPermits.find(permit => permit.permit_number === permitNumber) || null;
    } catch (error) {
      console.error('Error getting permit by number:', error);
      throw error;
    }
  }

  /**
   * Get inspections for a permit
   * @param permitNumber The permit number
   * @returns Array of inspections for the permit
   */
  async getInspectionsForPermit(permitNumber: string): Promise<PermitInspection[]> {
    try {
      // In a real implementation, we would call the Accela API to get inspections
      // For now, return mock data
      const mockInspections = this.getMockInspections();

      // Filter mock inspections by permit number
      return mockInspections.filter(inspection =>
        inspection.permit_id.includes(permitNumber)
      );
    } catch (error) {
      console.error('Error getting inspections for permit:', error);
      throw error;
    }
  }

  /**
   * Get mock permit data for testing
   * @returns Array of mock permits
   */
  private getMockPermits(): Permit[] {
    return [
      {
        permit_number: 'DEMO-2024-001',
        permit_type: 'Demolition',
        status: 'Issued',
        address: '123 Main St, Denver, CO 80202',
        description: 'Demolition of existing garage structure',
        issue_date: new Date('2024-06-15'),
        expiration_date: new Date('2024-12-15'),
        valuation: 15000,
        square_footage: 400,
        parcel_id: '0123456789',
        external_id: 'ACC-DEMO-2024-001',
        external_source: 'denver_epermits'
      },
      {
        permit_number: 'BLDG-2024-002',
        permit_type: 'Building',
        status: 'Under Review',
        address: '456 Oak Ave, Denver, CO 80205',
        description: 'New single-family residence',
        issue_date: undefined,
        expiration_date: undefined,
        valuation: 350000,
        square_footage: 2200,
        parcel_id: '9876543210',
        external_id: 'ACC-BLDG-2024-002',
        external_source: 'denver_epermits'
      },
      {
        permit_number: 'ELEC-2024-003',
        permit_type: 'Electrical',
        status: 'Issued',
        address: '789 Pine St, Denver, CO 80210',
        description: 'Electrical service upgrade to 200 amps',
        issue_date: new Date('2024-06-20'),
        expiration_date: new Date('2024-12-20'),
        valuation: 5000,
        square_footage: undefined,
        parcel_id: '5678901234',
        external_id: 'ACC-ELEC-2024-003',
        external_source: 'denver_epermits'
      },
      {
        permit_number: 'PLMB-2024-004',
        permit_type: 'Plumbing',
        status: 'Issued',
        address: '123 Main St, Denver, CO 80202',
        description: 'Replace water heater',
        issue_date: new Date('2024-06-18'),
        expiration_date: new Date('2024-12-18'),
        valuation: 2500,
        square_footage: undefined,
        parcel_id: '0123456789',
        external_id: 'ACC-PLMB-2024-004',
        external_source: 'denver_epermits'
      },
      {
        permit_number: 'MECH-2024-005',
        permit_type: 'Mechanical',
        status: 'Issued',
        address: '456 Oak Ave, Denver, CO 80205',
        description: 'Install new HVAC system',
        issue_date: new Date('2024-06-22'),
        expiration_date: new Date('2024-12-22'),
        valuation: 12000,
        square_footage: undefined,
        parcel_id: '9876543210',
        external_id: 'ACC-MECH-2024-005',
        external_source: 'denver_epermits'
      }
    ];
  }

  /**
   * Get mock inspection data for testing
   * @returns Array of mock inspections
   */
  private getMockInspections(): PermitInspection[] {
    return [
      {
        permit_id: 'DEMO-2024-001',
        inspection_type: 'Pre-demolition',
        status: 'Passed',
        scheduled_date: new Date('2024-06-20'),
        completed_date: new Date('2024-06-20'),
        inspector_name: 'John Smith',
        comments: 'All requirements met',
        external_id: 'ACC-INSP-2024-001',
        external_source: 'denver_epermits'
      },
      {
        permit_id: 'DEMO-2024-001',
        inspection_type: 'Final',
        status: 'Scheduled',
        scheduled_date: new Date('2024-07-15'),
        completed_date: undefined,
        inspector_name: 'John Smith',
        comments: '',
        external_id: 'ACC-INSP-2024-002',
        external_source: 'denver_epermits'
      },
      {
        permit_id: 'ELEC-2024-003',
        inspection_type: 'Rough-in',
        status: 'Failed',
        scheduled_date: new Date('2024-06-25'),
        completed_date: new Date('2024-06-25'),
        inspector_name: 'Jane Doe',
        comments: 'Improper grounding, needs correction',
        external_id: 'ACC-INSP-2024-003',
        external_source: 'denver_epermits'
      },
      {
        permit_id: 'ELEC-2024-003',
        inspection_type: 'Rough-in',
        status: 'Scheduled',
        scheduled_date: new Date('2024-07-02'),
        completed_date: undefined,
        inspector_name: 'Jane Doe',
        comments: 'Re-inspection after corrections',
        external_id: 'ACC-INSP-2024-004',
        external_source: 'denver_epermits'
      },
      {
        permit_id: 'PLMB-2024-004',
        inspection_type: 'Final',
        status: 'Passed',
        scheduled_date: new Date('2024-06-22'),
        completed_date: new Date('2024-06-22'),
        inspector_name: 'Mike Johnson',
        comments: 'Installation meets code requirements',
        external_id: 'ACC-INSP-2024-005',
        external_source: 'denver_epermits'
      }
    ];
  }
}

export const denverPermitApiService = new DenverPermitApiService();
export default denverPermitApiService;
