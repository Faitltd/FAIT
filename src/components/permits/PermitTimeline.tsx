import React from 'react';
import type { Permit, PermitInspection } from '../../services/PermitService';

interface TimelineEvent {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'permit_issued' | 'permit_expired' | 'inspection_scheduled' | 'inspection_passed' | 'inspection_failed';
}

interface PermitTimelineProps {
  permits: Permit[];
  inspections: PermitInspection[];
}

const PermitTimeline: React.FC<PermitTimelineProps> = ({ permits, inspections }) => {
  // Create timeline events from permits and inspections
  const createTimelineEvents = (): TimelineEvent[] => {
    const events: TimelineEvent[] = [];
    
    // Add permit events
    permits.forEach(permit => {
      if (permit.issue_date) {
        events.push({
          id: `permit-issued-${permit.permit_number}`,
          date: new Date(permit.issue_date),
          title: `Permit ${permit.permit_number} Issued`,
          description: `${permit.permit_type} permit issued for ${permit.address}`,
          type: 'permit_issued'
        });
      }
      
      if (permit.expiration_date) {
        events.push({
          id: `permit-expired-${permit.permit_number}`,
          date: new Date(permit.expiration_date),
          title: `Permit ${permit.permit_number} Expires`,
          description: `${permit.permit_type} permit expires`,
          type: 'permit_expired'
        });
      }
    });
    
    // Add inspection events
    inspections.forEach(inspection => {
      if (inspection.scheduled_date) {
        events.push({
          id: `inspection-scheduled-${inspection.external_id}`,
          date: new Date(inspection.scheduled_date),
          title: `${inspection.inspection_type} Inspection Scheduled`,
          description: `For permit ${inspection.permit_id}`,
          type: 'inspection_scheduled'
        });
      }
      
      if (inspection.completed_date) {
        events.push({
          id: `inspection-completed-${inspection.external_id}`,
          date: new Date(inspection.completed_date),
          title: `${inspection.inspection_type} Inspection ${inspection.status}`,
          description: inspection.comments || `For permit ${inspection.permit_id}`,
          type: inspection.status === 'Passed' ? 'inspection_passed' : 'inspection_failed'
        });
      }
    });
    
    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const timelineEvents = createTimelineEvents();
  
  // Group events by month and year
  const groupEventsByMonth = (events: TimelineEvent[]) => {
    const grouped: { [key: string]: TimelineEvent[] } = {};
    
    events.forEach(event => {
      const date = event.date;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      
      grouped[key].push(event);
    });
    
    return Object.entries(grouped).map(([key, events]) => {
      const [year, month] = key.split('-').map(Number);
      return {
        month: new Date(year, month, 1),
        events
      };
    }).sort((a, b) => a.month.getTime() - b.month.getTime());
  };

  const groupedEvents = groupEventsByMonth(timelineEvents);
  
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'permit_issued':
        return (
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'permit_expired':
        return (
          <div className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'inspection_scheduled':
        return (
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'inspection_passed':
        return (
          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'inspection_failed':
        return (
          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center">
            <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMonth = (date: Date) => {
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  if (timelineEvents.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow text-center">
        <p className="text-gray-500">No permit events to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Permit Timeline</h3>
      
      <div className="flow-root">
        <ul className="-mb-8">
          {groupedEvents.map((group, groupIdx) => (
            <li key={group.month.getTime()}>
              <div className="relative pb-8">
                <div className="relative flex items-center space-x-3 bg-gray-50 p-2 rounded-lg mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {formatMonth(group.month)}
                    </div>
                  </div>
                </div>
                
                {group.events.map((event, eventIdx) => (
                  <div key={event.id} className="relative pb-8">
                    {eventIdx !== group.events.length - 1 || groupIdx !== groupedEvents.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>{getEventIcon(event.type)}</div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900 font-medium">{event.title}</p>
                          <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {formatDate(event.date)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PermitTimeline;
