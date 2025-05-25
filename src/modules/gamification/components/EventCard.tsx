import React from 'react';
import { Event, UserEventParticipation } from '../../../types/gamification.types';

interface EventCardProps {
  event: Event;
  userParticipation?: UserEventParticipation;
  onJoin?: (eventId: string) => void;
  className?: string;
}

/**
 * Component to display an event card
 */
const EventCard: React.FC<EventCardProps> = ({
  event,
  userParticipation,
  onJoin,
  className = ''
}) => {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get event type badge
  const getEventTypeBadge = () => {
    switch (event.type) {
      case 'seasonal':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Seasonal
          </span>
        );
      case 'special':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Special
          </span>
        );
      case 'community':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Community
          </span>
        );
      case 'promotional':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Promotional
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </span>
        );
    }
  };

  // Check if event is active
  const isActive = () => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);
    return now >= startDate && now <= endDate;
  };

  // Check if event is upcoming
  const isUpcoming = () => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    return now < startDate;
  };

  // Check if event has ended
  const hasEnded = () => {
    const now = new Date();
    const endDate = new Date(event.end_date);
    return now > endDate;
  };

  // Get event status badge
  const getEventStatusBadge = () => {
    if (isActive()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else if (isUpcoming()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Upcoming
        </span>
      );
    } else if (hasEnded()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Ended
        </span>
      );
    }
    return null;
  };

  // Calculate days remaining
  const getDaysRemaining = () => {
    const now = new Date();
    const endDate = new Date(event.end_date);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calculate days until start
  const getDaysUntilStart = () => {
    const now = new Date();
    const startDate = new Date(event.start_date);
    const diffTime = startDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
              <div className="ml-2">
                {getEventTypeBadge()}
              </div>
              <div className="ml-2">
                {getEventStatusBadge()}
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">{event.description}</p>
          </div>
        </div>

        {/* Event dates */}
        <div className="mb-4 text-sm text-gray-700">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-gray-400 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>
              {formatDate(event.start_date)} - {formatDate(event.end_date)}
            </span>
          </div>
          {isActive() && (
            <div className="mt-1 text-sm text-green-600">
              {getDaysRemaining()} days remaining
            </div>
          )}
          {isUpcoming() && (
            <div className="mt-1 text-sm text-blue-600">
              Starts in {getDaysUntilStart()} days
            </div>
          )}
        </div>

        {/* Challenges */}
        {event.challenges && event.challenges.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Challenges:</h4>
            <ul className="space-y-1">
              {event.challenges.map((challenge) => (
                <li key={challenge.id} className="text-sm text-gray-600 flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {challenge.title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rewards */}
        {event.rewards && event.rewards.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Event Completion Rewards:</h4>
            <ul className="space-y-1">
              {event.rewards.map((reward, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <svg className="h-4 w-4 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {reward.type === 'points' && `${reward.value} bonus points`}
                  {reward.type === 'badge' && `Badge: ${reward.metadata?.name || 'Special Badge'}`}
                  {reward.type === 'title' && `Title: ${reward.value}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Participation status */}
        {userParticipation ? (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-700 mb-1">
              <span>Challenges completed</span>
              <span>{userParticipation.challenges_completed}/{event.challenges?.length || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-blue-600"
                style={{ width: `${(userParticipation.challenges_completed / (event.challenges?.length || 1)) * 100}%` }}
              ></div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Points earned: {userParticipation.points_earned}
            </div>
            {userParticipation.rewards_claimed && (
              <div className="mt-2 text-sm text-green-600 flex items-center">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                All rewards claimed
              </div>
            )}
          </div>
        ) : (
          isActive() && onJoin && (
            <button
              onClick={() => onJoin(event.id)}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Join Event
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default EventCard;
