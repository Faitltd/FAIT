import { writable } from 'svelte/store';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  duration: number; // in minutes
  providerId: string;
  providerName: string;
  providerRating: number;
  providerReviews: number;
  images: string[];
  tags: string[];
  availability: {
    days: string[];
    timeSlots: string[];
  };
  location: {
    city: string;
    state: string;
    zipCode: string;
    serviceRadius: number; // in miles
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  serviceCount: number;
}

interface ServicesState {
  services: Service[];
  categories: ServiceCategory[];
  currentService: Service | null;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedCategory: string;
  filters: {
    priceRange: [number, number];
    location: string;
    rating: number;
    availability: string;
  };
}

const initialState: ServicesState = {
  services: [],
  categories: [],
  currentService: null,
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedCategory: '',
  filters: {
    priceRange: [0, 1000],
    location: '',
    rating: 0,
    availability: ''
  }
};

function createServicesStore() {
  const { subscribe, set, update } = writable<ServicesState>(initialState);

  return {
    subscribe,

    // Load all services
    async loadServices() {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        // Mock data for demo
        const mockServices: Service[] = [
          {
            id: '1',
            title: 'Kitchen Sink Repair',
            description: 'Professional plumbing service for kitchen sink repairs, including leak fixes, faucet replacement, and pipe maintenance.',
            category: 'Plumbing',
            price: 150,
            duration: 120,
            providerId: 'provider-1',
            providerName: 'John Smith',
            providerRating: 4.8,
            providerReviews: 127,
            images: ['/images/services/plumbing-1.jpg'],
            tags: ['plumbing', 'kitchen', 'repair', 'sink'],
            availability: {
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
              timeSlots: ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']
            },
            location: {
              city: 'Austin',
              state: 'TX',
              zipCode: '78701',
              serviceRadius: 25
            },
            isActive: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: '2',
            title: 'Picture Hanging & Wall Mounting',
            description: 'Expert picture hanging and wall mounting services. Perfect placement and secure mounting for artwork, TVs, and decorative items.',
            category: 'Handyman',
            price: 75,
            duration: 60,
            providerId: 'provider-2',
            providerName: 'Sarah Johnson',
            providerRating: 4.9,
            providerReviews: 89,
            images: ['/images/services/handyman-1.jpg'],
            tags: ['handyman', 'hanging', 'mounting', 'wall'],
            availability: {
              days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              timeSlots: ['10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM']
            },
            location: {
              city: 'Austin',
              state: 'TX',
              zipCode: '78702',
              serviceRadius: 20
            },
            isActive: true,
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 172800000).toISOString()
          },
          {
            id: '3',
            title: 'Bathroom Deep Cleaning',
            description: 'Thorough bathroom cleaning service including tile scrubbing, grout cleaning, fixture polishing, and sanitization.',
            category: 'Cleaning',
            price: 120,
            duration: 90,
            providerId: 'provider-3',
            providerName: 'Maria Garcia',
            providerRating: 4.7,
            providerReviews: 156,
            images: ['/images/services/cleaning-1.jpg'],
            tags: ['cleaning', 'bathroom', 'deep clean', 'sanitization'],
            availability: {
              days: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              timeSlots: ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']
            },
            location: {
              city: 'Austin',
              state: 'TX',
              zipCode: '78703',
              serviceRadius: 15
            },
            isActive: true,
            createdAt: new Date(Date.now() - 259200000).toISOString(),
            updatedAt: new Date(Date.now() - 259200000).toISOString()
          }
        ];

        update(state => ({
          ...state,
          services: mockServices,
          isLoading: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load services';
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Load service categories
    async loadCategories() {
      try {
        const mockCategories: ServiceCategory[] = [
          {
            id: 'plumbing',
            name: 'Plumbing',
            description: 'Professional plumbing services',
            icon: '🔧',
            serviceCount: 45
          },
          {
            id: 'handyman',
            name: 'Handyman',
            description: 'General handyman and repair services',
            icon: '🔨',
            serviceCount: 78
          },
          {
            id: 'cleaning',
            name: 'Cleaning',
            description: 'Professional cleaning services',
            icon: '🧽',
            serviceCount: 62
          },
          {
            id: 'electrical',
            name: 'Electrical',
            description: 'Licensed electrical services',
            icon: '⚡',
            serviceCount: 34
          },
          {
            id: 'landscaping',
            name: 'Landscaping',
            description: 'Lawn care and landscaping',
            icon: '🌱',
            serviceCount: 56
          }
        ];

        update(state => ({
          ...state,
          categories: mockCategories
        }));

        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load categories';
        update(state => ({
          ...state,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Get service by ID
    async getService(id: string) {
      update(state => ({ ...state, isLoading: true, error: null }));

      try {
        // In a real app, this would make an API call
        // For now, find from existing services or create mock data
        const existingService = initialState.services.find(s => s.id === id);

        const service = existingService || {
          id,
          title: 'Service Details',
          description: 'Detailed service information would be loaded here.',
          category: 'General',
          price: 100,
          duration: 60,
          providerId: 'provider-1',
          providerName: 'Service Provider',
          providerRating: 4.5,
          providerReviews: 50,
          images: ['/images/services/default.jpg'],
          tags: ['service'],
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            timeSlots: ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM']
          },
          location: {
            city: 'Austin',
            state: 'TX',
            zipCode: '78701',
            serviceRadius: 25
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        update(state => ({
          ...state,
          currentService: service,
          isLoading: false
        }));

        return { success: true, service };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load service';
        update(state => ({
          ...state,
          isLoading: false,
          error: errorMessage
        }));

        return { success: false, error: errorMessage };
      }
    },

    // Search services
    setSearchQuery(query: string) {
      update(state => ({
        ...state,
        searchQuery: query
      }));
    },

    // Set category filter
    setCategory(category: string) {
      update(state => ({
        ...state,
        selectedCategory: category
      }));
    },

    // Set filters
    setFilters(filters: Partial<ServicesState['filters']>) {
      update(state => ({
        ...state,
        filters: { ...state.filters, ...filters }
      }));
    },

    // Reset store
    reset() {
      set(initialState);
    }
  };
}

export const services = createServicesStore();
