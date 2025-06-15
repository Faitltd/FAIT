import { writable } from 'svelte/store';

export interface Booking {
  id: string;
  service: string;
  provider: string;
  client: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: string;
  address: string;
  notes?: string;
  created_at: string;
}

export interface BookingsState {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  isLoading: false,
  error: null
};

export const bookingsStore = writable<BookingsState>(initialState);

// Mock data for demonstration
const mockBookings: Booking[] = [
  {
    id: '1',
    service: 'Home Cleaning',
    provider: 'Service Provider',
    client: 'John Smith',
    date: '2023-06-15',
    time: 'morning',
    status: 'confirmed',
    price: '$75',
    address: '123 Main St, Anytown, USA',
    notes: 'Please bring eco-friendly cleaning products',
    created_at: '2023-06-10'
  },
  {
    id: '2',
    service: 'Furniture Assembly',
    provider: 'Assembly Experts',
    client: 'Jane Doe',
    date: '2023-06-20',
    time: 'afternoon',
    status: 'pending',
    price: '$105',
    address: '456 Oak St, Anytown, USA',
    notes: 'IKEA bookshelf and desk',
    created_at: '2023-06-15'
  },
  {
    id: '3',
    service: 'Lawn Mowing',
    provider: 'Green Gardens Co-op',
    client: 'Bob Johnson',
    date: '2023-06-25',
    time: 'morning',
    status: 'completed',
    price: '$60',
    address: '789 Pine St, Anytown, USA',
    notes: '',
    created_at: '2023-06-20'
  },
  {
    id: '4',
    service: 'Plumbing Repair',
    provider: 'Fix It Fast',
    client: 'Sarah Wilson',
    date: '2023-06-22',
    time: 'afternoon',
    status: 'confirmed',
    price: '$150',
    address: '321 Elm St, Anytown, USA',
    notes: 'Kitchen sink leak repair',
    created_at: '2023-06-18'
  },
  {
    id: '5',
    service: 'Garden Maintenance',
    provider: 'Green Thumb Services',
    client: 'Mike Chen',
    date: '2023-06-28',
    time: 'morning',
    status: 'pending',
    price: '$200',
    address: '654 Maple Ave, Anytown, USA',
    notes: 'Hedge trimming and lawn care',
    created_at: '2023-06-22'
  }
];

// Bookings actions
export const bookings = {
  // Load all bookings (for admin) or user-specific bookings
  loadBookings: async (userId?: string, userRole?: string) => {
    bookingsStore.update(state => ({ ...state, isLoading: true, error: null }));

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let filteredBookings = mockBookings;

      // Filter bookings based on user role
      if (userRole === 'provider' && userId) {
        // For providers, show bookings where they are the provider
        filteredBookings = mockBookings.filter(booking =>
          booking.provider === 'Service Provider' ||
          booking.provider === 'Assembly Experts' ||
          booking.provider === 'Green Gardens Co-op'
        );
      } else if (userRole === 'client' && userId) {
        // For clients, show their own bookings
        filteredBookings = mockBookings.filter(booking =>
          booking.client === 'John Smith' ||
          booking.client === 'Jane Doe'
        );
      } else if (userRole === 'admin') {
        // For admin, show all bookings (no filtering)
        filteredBookings = mockBookings;
      }

      bookingsStore.update(state => ({
        ...state,
        bookings: filteredBookings,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      bookingsStore.update(state => ({
        ...state,
        isLoading: false,
        error: 'Failed to load bookings'
      }));
      return { success: false, error: 'Failed to load bookings' };
    }
  },

  // Get a specific booking by ID
  getBooking: async (bookingId: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      const booking = mockBookings.find(b => b.id === bookingId);

      if (booking) {
        return { success: true, booking };
      } else {
        return { success: false, error: 'Booking not found' };
      }
    } catch (error) {
      return { success: false, error: 'Failed to fetch booking' };
    }
  },

  // Update booking status
  updateBookingStatus: async (bookingId: string, status: Booking['status']) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      bookingsStore.update(state => ({
        ...state,
        bookings: state.bookings.map(booking =>
          booking.id === bookingId ? { ...booking, status } : booking
        )
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to update booking status' };
    }
  },

  // Cancel a booking
  cancelBooking: async (bookingId: string) => {
    return bookings.updateBookingStatus(bookingId, 'cancelled');
  },

  // Create a new booking
  createBooking: async (bookingData: Omit<Booking, 'id' | 'created_at'>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newBooking: Booking = {
        ...bookingData,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      };

      bookingsStore.update(state => ({
        ...state,
        bookings: [newBooking, ...state.bookings]
      }));

      return { success: true, booking: newBooking };
    } catch (error) {
      return { success: false, error: 'Failed to create booking' };
    }
  }
};
