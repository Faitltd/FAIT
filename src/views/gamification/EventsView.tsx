import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGamification } from '../../modules/gamification/hooks/useGamification';
import EventCard from '../../modules/gamification/components/EventCard';

/**
 * Events View
 */
const EventsView: React.FC = () => {
  const {
    isLoading,
    error,
    activeEvents,
    upcomingEvents,
    userEventParticipations,
    joinEvent,
    trackActivity
  } = useGamification();

  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'participating'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Track page view
  useEffect(() => {
    trackActivity('view_events_page');
  }, []);

  // Get user participation for an event
  const getUserEventParticipation = (eventId: string) => {
    return userEventParticipations.find(uep => uep.event_id === eventId);
  };

  // Handle event join
  const handleJoinEvent = async (eventId: string) => {
    await joinEvent(eventId);
    trackActivity('join_event', eventId);
  };

  // Get unique event types
  const getEventTypes = () => {
    const types = new Set<string>();
    [...activeEvents, ...upcomingEvents].forEach(event => {
      types.add(event.type);
    });
    return Array.from(types);
  };

  // Filter events
  const getFilteredEvents = () => {
    let filtered: any[] = [];

    // Filter by status
    if (filter === 'all') {
      filtered = [...activeEvents, ...upcomingEvents];
    } else if (filter === 'active') {
      filtered = [...activeEvents];
    } else if (filter === 'upcoming') {
      filtered = [...upcomingEvents];
    } else if (filter === 'participating') {
      filtered = [...activeEvents, ...upcomingEvents].filter(event => 
        userEventParticipations.some(uep => uep.event_id === event.id)
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === typeFilter);
    }

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Events</h1>
              <Link
                to="/gamification"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading events</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white shadow rounded-lg my-6">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center">
                  <div className="sm:flex-auto">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Filter Events</h3>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {/* Status filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          filter === 'all' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setFilter('all')}
                      >
                        All
                      </button>
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          filter === 'active' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setFilter('active')}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          filter === 'upcoming' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setFilter('upcoming')}
                      >
                        Upcoming
                      </button>
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          filter === 'participating' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setFilter('participating')}
                      >
                        Participating
                      </button>
                    </div>
                  </div>

                  {/* Type filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700">Event Type</label>
                    <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-5">
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center px-4 py-2 border ${
                          typeFilter === 'all' 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : 'border-gray-300 bg-white text-gray-700'
                        } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        onClick={() => setTypeFilter('all')}
                      >
                        All Types
                      </button>
                      {getEventTypes().map(type => (
                        <button
                          key={type}
                          type="button"
                          className={`inline-flex items-center justify-center px-4 py-2 border ${
                            typeFilter === type 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-300 bg-white text-gray-700'
                          } text-sm font-medium rounded-md hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                          onClick={() => setTypeFilter(type)}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-6 py-6">
                {/* Events grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {getFilteredEvents().map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      userParticipation={getUserEventParticipation(event.id)}
                      onJoin={handleJoinEvent}
                    />
                  ))}
                </div>

                {/* Empty state */}
                {getFilteredEvents().length === 0 && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No events found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Try adjusting your filters to find events.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EventsView;
