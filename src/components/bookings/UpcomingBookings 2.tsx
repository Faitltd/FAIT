import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

interface Booking {
  id: string;
  provider_id: string;
  provider_name: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  address: string;
  notes?: string;
}

interface UpcomingBookingsProps {
  limit?: number;
}

const UpcomingBookings: React.FC<UpcomingBookingsProps> = ({ limit = 3 }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      
      try {
        // In a real implementation, you would fetch from your bookings table
        // For now, we'll simulate with some mock data
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const mockBookings: Booking[] = [
          {
            id: '1',
            provider_id: 'provider1',
            provider_name: 'Denver Plumbing Pros',
            service_name: 'Plumbing Inspection',
            booking_date: tomorrow.toISOString(),
            booking_time: '10:00 AM',
            status: 'confirmed',
            address: '123 Main St, Denver, CO 80202',
            notes: 'Please bring information about fixtures and pricing.'
          },
          {
            id: '2',
            provider_id: 'provider2',
            provider_name: 'Tile Masters',
            service_name: 'Tile Installation Consultation',
            booking_date: nextWeek.toISOString(),
            booking_time: '2:00 PM',
            status: 'confirmed',
            address: '123 Main St, Denver, CO 80202'
          },
          {
            id: '3',
            provider_id: 'provider3',
            provider_name: 'Elite Electricians',
            service_name: 'Electrical System Inspection',
            booking_date: new Date(nextWeek.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(),
            booking_time: '9:30 AM',
            status: 'pending',
            address: '123 Main St, Denver, CO 80202',
            notes: 'Need to discuss kitchen renovation electrical requirements.'
          }
        ];
        
        setBookings(mockBookings.slice(0, limit));
      } catch (err) {
        console.error('Error fetching bookings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [user, limit]);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex justify-between mb-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
              <div className="h-5 bg-gray-200 rounded w-1/4"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (bookings.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500">No upcoming bookings</p>
        <Link
          to="/service-providers"
          className="mt-2 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          Find service providers to book
        </Link>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Link
          key={booking.id}
          to={`/bookings/${booking.id}`}
          className="block border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{booking.service_name}</h3>
              <p className="text-sm text-gray-600">{booking.provider_name}</p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-center text-sm text-gray-500">
              <svg
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                {format(new Date(booking.booking_date), 'EEEE, MMMM d, yyyy')} at {booking.booking_time}
              </span>
            </div>
            <div className="flex items-center mt-1 text-sm text-gray-500">
              <svg
                className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{booking.address}</span>
            </div>
          </div>
        </Link>
      ))}
      
      {bookings.length > 0 && (
        <div className="pt-2 text-center">
          <Link to="/bookings" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All Bookings
          </Link>
        </div>
      )}
    </div>
  );
};

export default UpcomingBookings;
