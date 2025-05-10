import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useAvailability } from '../../hooks/useAvailability';
import { format, parseISO, addMinutes } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';
import AlertCircle from 'lucide-react/dist/esm/icons/alert-circle';
import Info from 'lucide-react/dist/esm/icons/info';

// Lazy load FullCalendar and its plugins
const FullCalendarComponent = lazy(() => import('./LazyFullCalendar'));

interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

interface FullCalendarBookingProps {
  serviceAgentId: string;
  serviceId?: string;
  duration?: number;
  onSelectTimeSlot: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
  minDate?: Date;
  maxDate?: Date;
}

const FullCalendarBooking: React.FC<FullCalendarBookingProps> = ({
  serviceAgentId,
  serviceId,
  duration = 60,
  onSelectTimeSlot,
  selectedDate,
  selectedTime,
  minDate = new Date(),
  maxDate
}) => {
  const calendarRef = useRef<any>(null);
  const [selectedInfo, setSelectedInfo] = useState<{date: string, time: string} | null>(null);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState<Date>(selectedDate ? parseISO(selectedDate) : new Date());

  // Use the availability hook
  const {
    loading,
    error,
    unavailableDates,
    getAvailableTimeSlots
  } = useAvailability({ serviceAgentId });

  // When the calendar date changes, fetch available slots
  const handleDatesSet = async (dateInfo: any) => {
    const startDate = format(dateInfo.start, 'yyyy-MM-dd');
    const endDate = format(dateInfo.end, 'yyyy-MM-dd');
    await fetchAvailability(startDate, endDate);
  };

  // Fetch availability for a date range
  const fetchAvailability = async (startDate: string, endDate: string) => {
    try {
      // For each day in the range, get available slots
      const start = parseISO(startDate);
      const end = parseISO(endDate);

      // Create an array of dates between start and end
      const dates: string[] = [];
      let currentDate = start;
      while (currentDate < end) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }

      // Clear previous slots
      setAvailableSlots([]);
      setBookedSlots([]);

      // For each date, get available slots
      const allAvailableSlots: any[] = [];
      const allBookedSlots: any[] = [];

      for (const date of dates) {
        const slots = await getAvailableTimeSlots(date);

        // Process slots into calendar events
        slots.forEach((slot: TimeSlot) => {
          if (slot.available) {
            allAvailableSlots.push({
              title: 'Available',
              start: slot.start,
              end: slot.end,
              color: '#10b981', // green
              extendedProps: {
                isAvailable: true,
                date: format(parseISO(slot.start), 'yyyy-MM-dd'),
                time: format(parseISO(slot.start), 'HH:mm')
              }
            });
          } else {
            allBookedSlots.push({
              title: 'Booked',
              start: slot.start,
              end: slot.end,
              color: '#ef4444', // red
              extendedProps: {
                isAvailable: false
              }
            });
          }
        });
      }

      setAvailableSlots(allAvailableSlots);
      setBookedSlots(allBookedSlots);
    } catch (err) {
      console.error('Error fetching availability:', err);
    }
  };

  // Handle slot selection
  const handleEventClick = (info: any) => {
    const event = info.event;

    // Only allow selection of available slots
    if (event.extendedProps.isAvailable) {
      const date = event.extendedProps.date;
      const time = event.extendedProps.time;

      setSelectedInfo({ date, time });
      onSelectTimeSlot(date, time);
    }
  };

  // Initialize with selected date/time if provided
  useEffect(() => {
    if (selectedDate && selectedTime) {
      setSelectedInfo({ date: selectedDate, time: selectedTime });

      // Go to the selected date in the calendar
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        calendarApi.gotoDate(selectedDate);
      }
    }
  }, [selectedDate, selectedTime]);

  return (
    <div className="full-calendar-booking">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            Error loading availability. Please try again.
          </p>
        </div>
      ) : (
        <div>
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              Click on an available time slot to select it for your booking.
            </p>
          </div>

          <Suspense fallback={<div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>}>
            <FullCalendarComponent
              ref={calendarRef}
              events={[...availableSlots, ...bookedSlots]}
              options={{
                initialView: "timeGridWeek",
                headerToolbar: {
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay'
                },
                eventClick: handleEventClick,
                datesSet: handleDatesSet,
                initialDate: viewDate,
                slotDuration: "00:30:00",
                slotLabelInterval: "01:00",
                allDaySlot: false,
                height: "auto",
                validRange: {
                  start: minDate,
                  end: maxDate
                },
                businessHours: {
                  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // 0=Sunday, 1=Monday, etc.
                  startTime: '08:00',
                  endTime: '18:00'
                },
                eventContent: (eventInfo) => {
                  return (
                    <div className={`p-1 text-xs ${eventInfo.event.extendedProps.isAvailable ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                      {eventInfo.timeText}
                      <div>{eventInfo.event.title}</div>
                    </div>
                  );
                }
              }}
            />
          </Suspense>

          {selectedInfo && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-800">
                Selected: {format(parseISO(`${selectedInfo.date}T${selectedInfo.time}`), 'EEEE, MMMM d, yyyy h:mm a')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FullCalendarBooking;
