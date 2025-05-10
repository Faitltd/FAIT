/**
 * FullCalendar Component
 * 
 * This component is lazy-loaded by the OptimizedCalendar component.
 * It imports and renders the FullCalendar library.
 */

import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { CalendarEvent, CalendarOptions } from './OptimizedCalendar';

interface FullCalendarComponentProps {
  events: CalendarEvent[];
  options: CalendarOptions;
}

const FullCalendarComponent = forwardRef<any, FullCalendarComponentProps>(
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
    
    // Default options
    const defaultOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      height: 'auto',
      aspectRatio: 1.35,
      firstDay: 0, // Sunday
      locale: 'en',
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
        startTime: '08:00',
        endTime: '18:00'
      },
      selectable: true,
      editable: true
    };
    
    // Combine default options with provided options
    const fullOptions = { ...defaultOptions, ...options };
    
    return (
      <FullCalendar
        ref={calendarRef}
        events={events}
        {...fullOptions}
      />
    );
  }
);

FullCalendarComponent.displayName = 'FullCalendarComponent';

export default FullCalendarComponent;
