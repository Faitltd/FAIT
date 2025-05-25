/**
 * Optimized Calendar Component
 * 
 * This component provides a performance-optimized wrapper around FullCalendar
 * with lazy loading, dynamic imports, and web worker integration.
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useWebWorker, WorkerType } from '../../utils/webWorkerRegistry';
import { Card, CardContent, Text } from '../ui';

// Define types for calendar events and options
export interface CalendarEvent {
  id: string;
  title: string;
  start: string | Date;
  end?: string | Date;
  allDay?: boolean;
  color?: string;
  textColor?: string;
  url?: string;
  extendedProps?: Record<string, any>;
}

export interface CalendarOptions {
  initialView?: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek';
  headerToolbar?: {
    left?: string;
    center?: string;
    right?: string;
  };
  height?: string | number;
  aspectRatio?: number;
  firstDay?: number;
  locale?: string;
  businessHours?: {
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
  };
  selectable?: boolean;
  editable?: boolean;
  eventClick?: (info: any) => void;
  dateClick?: (info: any) => void;
  eventDrop?: (info: any) => void;
  eventResize?: (info: any) => void;
  datesSet?: (info: any) => void;
}

interface OptimizedCalendarProps {
  events: CalendarEvent[];
  options?: CalendarOptions;
  className?: string;
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onEventDrop?: (event: CalendarEvent, delta: any) => void;
  onEventResize?: (event: CalendarEvent, delta: any) => void;
  onViewChange?: (view: string) => void;
}

// Lazy load FullCalendar components
const FullCalendarComponent = lazy(() => import('./FullCalendarComponent'));

// Loading fallback
const CalendarLoadingFallback = () => (
  <Card className="h-96">
    <CardContent className="h-full flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <Text>Loading calendar...</Text>
      </div>
    </CardContent>
  </Card>
);

const OptimizedCalendar: React.FC<OptimizedCalendarProps> = ({
  events,
  options = {},
  className = '',
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  onViewChange
}) => {
  const [processedEvents, setProcessedEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const calendarRef = useRef<any>(null);
  
  // Get web worker for data processing
  const { runTask, isSupported } = useWebWorker(WorkerType.DATA);
  
  // Process events in web worker if available
  useEffect(() => {
    const processEvents = async () => {
      setIsLoading(true);
      
      try {
        if (isSupported && events.length > 100) {
          // Process events in web worker for large datasets
          const result = await runTask('transform', {
            items: events,
            transformations: {
              // Add any transformations needed
              start: (event: CalendarEvent) => new Date(event.start).toISOString(),
              end: (event: CalendarEvent) => event.end ? new Date(event.end).toISOString() : undefined
            }
          });
          
          setProcessedEvents(result);
        } else {
          // Process events in main thread for smaller datasets
          setProcessedEvents(events.map(event => ({
            ...event,
            start: new Date(event.start).toISOString(),
            end: event.end ? new Date(event.end).toISOString() : undefined
          })));
        }
      } catch (error) {
        console.error('Error processing events:', error);
        setProcessedEvents(events);
      } finally {
        setIsLoading(false);
      }
    };
    
    processEvents();
  }, [events, isSupported, runTask]);
  
  // Handle event click
  const handleEventClick = (info: any) => {
    if (onEventClick) {
      const event = processedEvents.find(e => e.id === info.event.id);
      if (event) {
        onEventClick(event);
      }
    }
  };
  
  // Handle date click
  const handleDateClick = (info: any) => {
    if (onDateClick) {
      onDateClick(info.date);
    }
  };
  
  // Handle event drop
  const handleEventDrop = (info: any) => {
    if (onEventDrop) {
      const event = processedEvents.find(e => e.id === info.event.id);
      if (event) {
        onEventDrop(event, info.delta);
      }
    }
  };
  
  // Handle event resize
  const handleEventResize = (info: any) => {
    if (onEventResize) {
      const event = processedEvents.find(e => e.id === info.event.id);
      if (event) {
        onEventResize(event, info.endDelta);
      }
    }
  };
  
  // Handle view change
  const handleDatesSet = (info: any) => {
    if (onViewChange) {
      onViewChange(info.view.type);
    }
  };
  
  // Combine options with handlers
  const fullCalendarOptions = {
    ...options,
    eventClick: handleEventClick,
    dateClick: handleDateClick,
    eventDrop: handleEventDrop,
    eventResize: handleEventResize,
    datesSet: handleDatesSet
  };
  
  return (
    <div className={className}>
      {isLoading ? (
        <CalendarLoadingFallback />
      ) : (
        <Suspense fallback={<CalendarLoadingFallback />}>
          <FullCalendarComponent
            ref={calendarRef}
            events={processedEvents}
            options={fullCalendarOptions}
          />
        </Suspense>
      )}
    </div>
  );
};

export default OptimizedCalendar;
