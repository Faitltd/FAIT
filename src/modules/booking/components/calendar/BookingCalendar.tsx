import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../../types/booking';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../../core/contexts/AuthContext';
import { UserRole } from '../../../core/types/common';
import { LoadingSpinner } from '../../../core/components/common/LoadingSpinner';
import { Button } from '../../../core/components/ui/Button';

export interface BookingCalendarProps {
  onSelectBooking?: (booking: Booking) => void;
  onCreateBooking?: () => void;
}

/**
 * BookingCalendar component for displaying bookings in a calendar view
 */
export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  onSelectBooking,
  onCreateBooking,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month'>('week');

  // Fetch bookings based on user role and date range
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Calculate date range based on current view
        const startDate = new Date(currentDate);
        const endDate = new Date(currentDate);

        if (currentView === 'day') {
          // Just the current date
        } else if (currentView === 'week') {
          // Start of week (Sunday)
          startDate.setDate(currentDate.getDate() - currentDate.getDay());
          // End of week (Saturday)
          endDate.setDate(startDate.getDate() + 6);
        } else if (currentView === 'month') {
          // Start of month
          startDate.setDate(1);
          // End of month
          endDate.setMonth(currentDate.getMonth() + 1);
          endDate.setDate(0);
        }

        // Format dates as ISO strings (YYYY-MM-DD)
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        let response;

        // Fetch bookings based on user role
        if (user.role === UserRole.CLIENT) {
          response = await bookingService.getClientBookings(user.id, {
            filter: {
              startDate: startDateStr,
              endDate: endDateStr,
            },
          });
        } else if (user.role === UserRole.SERVICE_AGENT) {
          response = await bookingService.getServiceAgentBookings(user.id, {
            filter: {
              startDate: startDateStr,
              endDate: endDateStr,
            },
          });
        } else if (user.role === UserRole.ADMIN) {
          response = await bookingService.getBookings({
            filter: {
              startDate: startDateStr,
              endDate: endDateStr,
            },
          });
        } else {
          throw new Error('Unauthorized user role');
        }

        setBookings(response.data.data);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [user, currentDate, currentView]);

  // Get days of the week for the current view
  const getDaysOfWeek = () => {
    const days = [];
    const startDate = new Date(currentDate);
    
    // Set to the beginning of the week (Sunday)
    startDate.setDate(currentDate.getDate() - currentDate.getDay());
    
    // Generate 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }
    
    return days;
  };

  // Get hours of the day
  const getHoursOfDay = () => {
    const hours = [];
    for (let i = 8; i < 18; i++) { // 8 AM to 6 PM
      hours.push(i);
    }
    return hours;
  };

  // Format hour for display
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Check if a booking is on a specific date and hour
  const getBookingsForDateAndHour = (date: Date, hour: number) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter((booking) => {
      const bookingDate = booking.date;
      const bookingHour = parseInt(booking.startTime.split(':')[0]);
      return bookingDate === dateStr && bookingHour === hour;
    });
  };

  // Get color for booking status
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.PENDING:
        return 'bg-yellow-200 text-yellow-800';
      case BookingStatus.CONFIRMED:
        return 'bg-green-200 text-green-800';
      case BookingStatus.IN_PROGRESS:
        return 'bg-blue-200 text-blue-800';
      case BookingStatus.COMPLETED:
        return 'bg-green-200 text-green-800';
      case BookingStatus.CANCELLED:
        return 'bg-red-200 text-red-800';
      case BookingStatus.RESCHEDULED:
        return 'bg-orange-200 text-orange-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else if (currentView === 'month') {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else if (currentView === 'month') {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  if (isLoading) {
    return <LoadingSpinner size="lg" message="Loading bookings..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Bookings Calendar</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={goToPrevious}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToNext}>
            Next
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">
              {currentView === 'day'
                ? currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                : currentView === 'week'
                ? `Week of ${getDaysOfWeek()[0].toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${getDaysOfWeek()[6].toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
                : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={currentView === 'day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('day')}
            >
              Day
            </Button>
            <Button
              variant={currentView === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('week')}
            >
              Week
            </Button>
            <Button
              variant={currentView === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('month')}
            >
              Month
            </Button>
          </div>
        </div>
      </div>
      
      {currentView === 'week' && (
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 border-b">
              <div className="p-2 border-r"></div>
              {getDaysOfWeek().map((day, index) => (
                <div
                  key={index}
                  className={`p-2 text-center font-medium ${
                    day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                  }`}
                >
                  {formatDate(day)}
                </div>
              ))}
            </div>
            
            {getHoursOfDay().map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b">
                <div className="p-2 border-r text-sm text-gray-500">
                  {formatHour(hour)}
                </div>
                
                {getDaysOfWeek().map((day, dayIndex) => {
                  const dayBookings = getBookingsForDateAndHour(day, hour);
                  return (
                    <div
                      key={dayIndex}
                      className={`p-2 border-r min-h-[80px] ${
                        day.toDateString() === new Date().toDateString() ? 'bg-blue-50' : ''
                      }`}
                    >
                      {dayBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className={`mb-1 p-1 rounded text-xs cursor-pointer ${getStatusColor(booking.status)}`}
                          onClick={() => onSelectBooking?.(booking)}
                        >
                          <div className="font-medium truncate">
                            {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
                          </div>
                          <div className="truncate">
                            {booking.client?.firstName} {booking.client?.lastName}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {currentView === 'day' && (
        <div className="p-4">
          <div className="border rounded">
            {getHoursOfDay().map((hour) => {
              const hourBookings = getBookingsForDateAndHour(currentDate, hour);
              return (
                <div key={hour} className="flex border-b last:border-b-0">
                  <div className="p-2 border-r w-20 text-sm text-gray-500">
                    {formatHour(hour)}
                  </div>
                  <div className="flex-1 p-2 min-h-[80px]">
                    {hourBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`mb-1 p-2 rounded cursor-pointer ${getStatusColor(booking.status)}`}
                        onClick={() => onSelectBooking?.(booking)}
                      >
                        <div className="font-medium">
                          {booking.startTime.substring(0, 5)} - {booking.endTime.substring(0, 5)}
                        </div>
                        <div>
                          {booking.client?.firstName} {booking.client?.lastName}
                        </div>
                        <div className="text-sm truncate">{booking.location.address?.street}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {currentView === 'month' && (
        <div className="p-4">
          <div className="text-center mb-4">Month view is not implemented yet</div>
        </div>
      )}
      
      {onCreateBooking && (
        <div className="p-4 border-t">
          <Button onClick={onCreateBooking}>Create Booking</Button>
        </div>
      )}
    </div>
  );
};
