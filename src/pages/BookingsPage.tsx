import React, { useState } from 'react';
import { PageLayout } from '../modules/core/components/layout/PageLayout';
import { BookingCalendar } from '../modules/booking/components/calendar/BookingCalendar';
import { BookingWizard } from '../modules/booking/components/wizard/BookingWizard';
import { Booking, BookingFormData } from '../modules/booking/types/booking';
import { useAuth } from '../modules/core/contexts/AuthContext';
import { Button } from '../modules/core/components/ui/Button';

/**
 * BookingsPage component for displaying and managing bookings
 */
const BookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState<boolean>(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('service-123'); // Mock service ID

  // Handle booking selection
  const handleSelectBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    // In a real app, you would show booking details
    console.log('Selected booking:', booking);
  };

  // Handle booking creation
  const handleCreateBooking = () => {
    setIsCreatingBooking(true);
  };

  // Handle booking creation submission
  const handleBookingComplete = (data: BookingFormData) => {
    console.log('Booking data submitted:', data);
    setIsCreatingBooking(false);
    // In a real app, you would create the booking and refresh the calendar
  };

  // Handle booking creation cancellation
  const handleBookingCancel = () => {
    setIsCreatingBooking(false);
  };

  // Handle booking details close
  const handleCloseBookingDetails = () => {
    setSelectedBooking(null);
  };

  return (
    <PageLayout
      title="Bookings"
      description="Manage your bookings"
    >
      {isCreatingBooking ? (
        <BookingWizard
          serviceId={selectedServiceId}
          onComplete={handleBookingComplete}
          onCancel={handleBookingCancel}
        />
      ) : selectedBooking ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Booking Details</h2>
            <Button variant="outline" onClick={handleCloseBookingDetails}>
              Close
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Booking Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-600">Date:</div>
                  <div>{selectedBooking.date}</div>
                  <div className="text-gray-600">Time:</div>
                  <div>{selectedBooking.startTime} - {selectedBooking.endTime}</div>
                  <div className="text-gray-600">Status:</div>
                  <div className="capitalize">{selectedBooking.status}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="grid grid-cols-1 gap-1">
                  <div>{selectedBooking.location.address?.street}</div>
                  <div>
                    {selectedBooking.location.address?.city}, {selectedBooking.location.address?.state} {selectedBooking.location.address?.zipCode}
                  </div>
                </div>
              </div>
            </div>
            
            {selectedBooking.notes && (
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {selectedBooking.notes}
                </div>
              </div>
            )}
            
            {selectedBooking.specialInstructions && (
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Special Instructions</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  {selectedBooking.specialInstructions}
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex space-x-3">
            <Button variant="outline" className="flex-1">
              Reschedule
            </Button>
            <Button variant="outline" className="flex-1">
              Cancel Booking
            </Button>
          </div>
        </div>
      ) : (
        <BookingCalendar
          onSelectBooking={handleSelectBooking}
          onCreateBooking={handleCreateBooking}
        />
      )}
    </PageLayout>
  );
};

export default BookingsPage;
