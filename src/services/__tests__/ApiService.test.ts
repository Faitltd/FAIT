import { ApiService, ProfileService, ServicePackageService, BookingService } from '../ApiService';
import { supabase } from '../../lib/supabase';
import { apiCache } from '../../lib/cacheUtils';

// Mock the supabase client
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
    }),
  },
}));

// Mock the apiCache
jest.mock('../../lib/cacheUtils', () => ({
  apiCache: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
    getStats: jest.fn().mockReturnValue({ size: 0, keys: [] }),
  },
}));

describe('ApiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ProfileService', () => {
    let profileService: ProfileService;

    beforeEach(() => {
      profileService = new ProfileService();
      
      // Mock supabase auth.getUser
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });
      
      // Mock supabase query response
      (supabase.from('').single as jest.Mock).mockResolvedValue({
        data: { id: 'user-123', first_name: 'John', last_name: 'Doe' },
        error: null,
      });
    });

    it('gets current user profile from cache if available', async () => {
      // Mock cache hit
      (apiCache.get as jest.Mock).mockReturnValue({
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
      });

      const profile = await profileService.getCurrentUserProfile();

      expect(apiCache.get).toHaveBeenCalledWith('profile:user-123');
      expect(supabase.from).not.toHaveBeenCalled();
      expect(profile).toEqual({
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
      });
    });

    it('fetches current user profile from API if not in cache', async () => {
      // Mock cache miss
      (apiCache.get as jest.Mock).mockReturnValue(null);

      const profile = await profileService.getCurrentUserProfile();

      expect(apiCache.get).toHaveBeenCalledWith('profile:user-123');
      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(apiCache.set).toHaveBeenCalled();
      expect(profile).toEqual({
        id: 'user-123',
        first_name: 'John',
        last_name: 'Doe',
      });
    });

    it('handles errors when fetching profile', async () => {
      // Mock auth error
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      await expect(profileService.getCurrentUserProfile()).rejects.toThrow('No authenticated user found');
    });

    it('updates user profile and clears cache', async () => {
      const profileData = { first_name: 'Jane', last_name: 'Smith' };
      
      await profileService.updateUserProfile('user-123', profileData);

      expect(supabase.from).toHaveBeenCalledWith('profiles');
      expect(supabase.from('').update).toHaveBeenCalledWith(profileData);
      expect(apiCache.remove).toHaveBeenCalledWith('profile:user-123');
    });
  });

  describe('ServicePackageService', () => {
    let servicePackageService: ServicePackageService;

    beforeEach(() => {
      servicePackageService = new ServicePackageService();
      
      // Mock supabase query response
      (supabase.from('').select as jest.Mock).mockReturnValue({
        data: [
          { id: 'service-1', title: 'Service 1', price: 100 },
          { id: 'service-2', title: 'Service 2', price: 200 },
        ],
        error: null,
      });
    });

    it('gets active service packages from cache if available', async () => {
      // Mock cache hit
      (apiCache.get as jest.Mock).mockReturnValue([
        { id: 'service-1', title: 'Service 1', price: 100 },
        { id: 'service-2', title: 'Service 2', price: 200 },
      ]);

      const services = await servicePackageService.getActiveServicePackages();

      expect(apiCache.get).toHaveBeenCalledWith('service_packages:active');
      expect(supabase.from).not.toHaveBeenCalled();
      expect(services).toHaveLength(2);
    });

    it('fetches active service packages from API if not in cache', async () => {
      // Mock cache miss
      (apiCache.get as jest.Mock).mockReturnValue(null);

      const services = await servicePackageService.getActiveServicePackages();

      expect(apiCache.get).toHaveBeenCalledWith('service_packages:active');
      expect(supabase.from).toHaveBeenCalledWith('service_packages');
      expect(apiCache.set).toHaveBeenCalled();
      expect(services).toHaveLength(2);
    });

    it('creates a service package and clears relevant caches', async () => {
      const serviceData = { 
        service_agent_id: 'agent-123',
        title: 'New Service',
        price: 150
      };
      
      // Mock insert response
      (supabase.from('').insert as jest.Mock).mockReturnValue({
        data: { id: 'new-service', ...serviceData },
        error: null,
      });

      await servicePackageService.createServicePackage(serviceData);

      expect(supabase.from).toHaveBeenCalledWith('service_packages');
      expect(supabase.from('').insert).toHaveBeenCalledWith(serviceData);
      expect(apiCache.remove).toHaveBeenCalled();
    });
  });

  describe('BookingService', () => {
    let bookingService: BookingService;

    beforeEach(() => {
      bookingService = new BookingService();
      
      // Mock supabase query response
      (supabase.from('').select as jest.Mock).mockReturnValue({
        data: [
          { id: 'booking-1', client_id: 'client-123', service_agent_id: 'agent-123' },
          { id: 'booking-2', client_id: 'client-123', service_agent_id: 'agent-456' },
        ],
        error: null,
      });
    });

    it('gets client bookings from cache if available', async () => {
      // Mock cache hit
      (apiCache.get as jest.Mock).mockReturnValue([
        { id: 'booking-1', client_id: 'client-123', service_agent_id: 'agent-123' },
        { id: 'booking-2', client_id: 'client-123', service_agent_id: 'agent-456' },
      ]);

      const bookings = await bookingService.getClientBookings('client-123');

      expect(apiCache.get).toHaveBeenCalledWith('bookings:client:client-123');
      expect(supabase.from).not.toHaveBeenCalled();
      expect(bookings).toHaveLength(2);
    });

    it('fetches client bookings from API if not in cache', async () => {
      // Mock cache miss
      (apiCache.get as jest.Mock).mockReturnValue(null);

      const bookings = await bookingService.getClientBookings('client-123');

      expect(apiCache.get).toHaveBeenCalledWith('bookings:client:client-123');
      expect(supabase.from).toHaveBeenCalledWith('bookings');
      expect(apiCache.set).toHaveBeenCalled();
      expect(bookings).toHaveLength(2);
    });

    it('creates a booking and clears relevant caches', async () => {
      const bookingData = { 
        client_id: 'client-123',
        service_agent_id: 'agent-123',
        service_package_id: 'service-1',
        booking_date: '2023-06-01'
      };
      
      // Mock insert response
      (supabase.from('').insert as jest.Mock).mockReturnValue({
        data: { id: 'new-booking', ...bookingData },
        error: null,
      });

      await bookingService.createBooking(bookingData);

      expect(supabase.from).toHaveBeenCalledWith('bookings');
      expect(supabase.from('').insert).toHaveBeenCalledWith(bookingData);
      expect(apiCache.remove).toHaveBeenCalled();
    });
  });
});
