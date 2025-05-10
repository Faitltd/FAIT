import { format, parseISO, addMinutes, eachDayOfInterval, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { DayAvailability, TimeSlot, UnavailableDate } from '../types/booking';

/**
 * Format time slots for FullCalendar
 * @param timeSlots - Array of time slots
 * @param date - Date string in YYYY-MM-DD format
 * @returns Array of FullCalendar events
 */
export function formatTimeSlots(timeSlots: TimeSlot[], date: string) {
  return timeSlots.map(slot => {
    const startDateTime = `${date}T${slot.start_time}`;
    const endDateTime = `${date}T${slot.end_time}`;
    
    return {
      title: slot.is_available ? 'Available' : 'Booked',
      start: startDateTime,
      end: endDateTime,
      color: slot.is_available ? '#10b981' : '#ef4444', // green for available, red for booked
      extendedProps: {
        isAvailable: slot.is_available,
        date,
        time: slot.start_time
      }
    };
  });
}

/**
 * Convert weekly availability to concrete dates
 * @param weeklyAvailability - Array of day availability
 * @param startDate - Start date
 * @param endDate - End date
 * @param unavailableDates - Array of unavailable dates
 * @returns Array of FullCalendar events
 */
export function weeklyToConcreteAvailability(
  weeklyAvailability: DayAvailability[],
  startDate: Date,
  endDate: Date,
  unavailableDates: UnavailableDate[] = []
) {
  // Get all days in the range
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  
  // Convert unavailable dates to Date objects for easier comparison
  const unavailableDateObjects = unavailableDates.map(ud => parseISO(ud.date));
  
  // Create events for each day based on weekly availability
  const events: any[] = [];
  
  days.forEach(day => {
    // Skip if day is in unavailable dates
    if (unavailableDateObjects.some(ud => isSameDay(ud, day))) {
      return;
    }
    
    // Get day of week (0-6, where 0 is Sunday)
    const dayOfWeek = day.getDay();
    
    // Find availability for this day of week
    const dayAvailability = weeklyAvailability.find(da => da.day_of_week === dayOfWeek);
    
    if (dayAvailability && dayAvailability.time_slots.length > 0) {
      // Format date as YYYY-MM-DD
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Add each time slot as an event
      dayAvailability.time_slots.forEach(slot => {
        events.push({
          title: 'Available',
          start: `${dateStr}T${slot.start_time}`,
          end: `${dateStr}T${slot.end_time}`,
          color: '#10b981', // green
          extendedProps: {
            isAvailable: true,
            date: dateStr,
            time: slot.start_time
          }
        });
      });
    }
  });
  
  return events;
}

/**
 * Generate time slots for a day
 * @param startHour - Start hour (0-23)
 * @param endHour - End hour (0-23)
 * @param interval - Interval in minutes
 * @returns Array of time slots
 */
export function generateTimeSlots(startHour = 8, endHour = 18, interval = 30): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const endTime = minute + interval >= 60
        ? `${(hour + 1).toString().padStart(2, '0')}:${(minute + interval - 60).toString().padStart(2, '0')}`
        : `${hour.toString().padStart(2, '0')}:${(minute + interval).toString().padStart(2, '0')}`;
      
      slots.push({
        start_time: startTime,
        end_time: endTime,
        is_available: true
      });
    }
  }
  
  return slots;
}

/**
 * Get the current week's date range
 * @param date - Date to get week for
 * @returns Object with start and end dates
 */
export function getCurrentWeekRange(date = new Date()) {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // 0 = Sunday
  const end = endOfWeek(date, { weekStartsOn: 0 });
  
  return {
    start,
    end,
    startStr: format(start, 'yyyy-MM-dd'),
    endStr: format(end, 'yyyy-MM-dd')
  };
}

/**
 * Format date and time for display
 * @param date - Date string in YYYY-MM-DD format
 * @param time - Time string in HH:MM format
 * @returns Formatted date and time string
 */
export function formatDateTime(date: string, time: string) {
  const dateTime = parseISO(`${date}T${time}`);
  return format(dateTime, 'EEEE, MMMM d, yyyy h:mm a');
}

/**
 * Calculate end time based on start time and duration
 * @param startTime - Start time string in HH:MM format
 * @param durationMinutes - Duration in minutes
 * @returns End time string in HH:MM format
 */
export function calculateEndTime(startTime: string, durationMinutes: number) {
  // Create a date object with the start time
  const [hours, minutes] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  
  // Add the duration
  const endDate = addMinutes(date, durationMinutes);
  
  // Format the end time
  return format(endDate, 'HH:mm');
}
