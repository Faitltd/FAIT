/**
 * LazyFullCalendar Component
 * 
 * This component is lazy-loaded by the FullCalendarBooking component.
 * It imports and renders the FullCalendar library with optimized loading.
 */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface CalendarEvent {
  title: string;
  start: string;
  end?: string;
  color?: string;
  extendedProps?: Record<string, any>;
}

interface CalendarOptions {
  initialView?: string;
  headerToolbar?: {
    left?: string;
    center?: string;
    right?: string;
  };
  eventClick?: (info: any) => void;
  datesSet?: (info: any) => void;
  initialDate?: Date;
  slotDuration?: string;
  slotLabelInterval?: string;
  allDaySlot?: boolean;
  height?: string | number;
  validRange?: {
    start?: Date;
    end?: Date;
  };
  businessHours?: {
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
  };
  eventContent?: (info: any) => React.ReactNode;
}

interface LazyFullCalendarProps {
  events: CalendarEvent[];
  options: CalendarOptions;
}

const LazyFullCalendar = forwardRef<any, LazyFullCalendarProps>(
  ({ events, options }, ref) => {
    const calendarRef = useRef<any>(null);
    
    // Expose calendar API to parent component
    useImperativeHandle(ref, () => ({
      getApi: () => calendarRef.current?.getApi(),
      prev: () => calendarRef.current?.getApi().prev(),
      next: () => calendarRef.current?.getApi().next(),
      today: () => calendarRef.current?.getApi().today(),
      changeView: (viewName: string) => calendarRef.current?.getApi().changeView(viewName),
      gotoDate: (date: Date) => calendarRef.current?.getApi().gotoDate(date)
    }));
    
    // Combine options with plugins
    const fullOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      ...options
    };
    
    return (
      <FullCalendar
        ref={calendarRef}
        events={events}
        {...fullOptions}
      />
    );
  }
);

LazyFullCalendar.displayName = 'LazyFullCalendar';

export default LazyFullCalendar;
