import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGamification } from '../../modules/gamification/hooks/useGamification';
import LevelProgress from '../../modules/gamification/components/LevelProgress';
import DailyTasks from '../../modules/gamification/components/DailyTasks';
import StreakDisplay from '../../modules/gamification/components/StreakDisplay';
import ChallengeCard from '../../modules/gamification/components/ChallengeCard';
import EventCard from '../../modules/gamification/components/EventCard';
import Leaderboard from '../../modules/gamification/components/Leaderboard';

/**
 * Gamification Dashboard View
 */
const GamificationDashboard: React.FC = () => {
  const {
    isLoading,
    error,
    userLevel,
    userDailyTasks,
    userStreaks,
    activeChallenges,
    userChallenges,
    activeEvents,
    userEventParticipations,
    leaderboardEntries,
    activeLeaderboards,
    fetchLeaderboardEntries,
    joinChallenge,
    joinEvent,
    trackActivity
  } = useGamification();

  // Track dashboard view
  useEffect(() => {
    trackActivity('view_gamification_dashboard');
  }, []);

  // Fetch leaderboard entries for the first active leaderboard
  useEffect(() => {
    if (activeLeaderboards.length > 0) {
      fetchLeaderboardEntries(activeLeaderboards[0].id);
    }
  }, [activeLeaderboards]);

  // Handle challenge join
  const handleJoinChallenge = async (challengeId: string) => {
    await joinChallenge(challengeId);
    trackActivity('join_challenge', challengeId);
  };

  // Handle event join
  const handleJoinEvent = async (eventId: string) => {
    await joinEvent(eventId);
    trackActivity('join_event', eventId);
  };

  // Get user challenge for a challenge
  const getUserChallenge = (challengeId: string) => {
    return userChallenges.find(uc => uc.challenge_id === challengeId);
  };

  // Get user participation for an event
  const getUserEventParticipation = (eventId: string) => {
    return userEventParticipations.find(uep => uep.event_id === eventId);
  };

  // Get recommended challenges (not yet joined or not completed)
  const getRecommendedChallenges = () => {
    return activeChallenges.filter(challenge =>
      !userChallenges.some(uc =>
        uc.challenge_id === challenge.id && uc.is_completed
      )
    ).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Gamification Dashboard</h1>
              {user?.user_metadata?.role === 'admin' && (
                <Link
                  to="/gamification/analytics"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Analytics Dashboard
                </Link>
              )}
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
                    <h3 className="text-sm font-medium text-red-800">Error loading gamification data</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading && !userLevel ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-6 py-6">
                {/* Top row: Level and Streaks */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Level Progress */}
                  <div>
                    {userLevel && (
                      <div className="relative">
                        <LevelProgress
                          userLevel={userLevel}
                          nextLevelInfo={{
                            next_level: userLevel.level + 1,
                            next_level_name: `Level ${userLevel.level + 1}`,
                            points_needed: userLevel.points_required - userLevel.current_points,
                            rewards: []
                          }}
                        />
                        <div className="absolute top-4 right-4">
                          <Link
                            to={`/gamification/user/${user?.id}`}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            View Profile
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Streaks */}
                  <StreakDisplay
                    streaks={userStreaks}
                    isLoading={isLoading}
                  />
                </div>

                {/* Daily Tasks */}
                <DailyTasks
                  tasks={userDailyTasks}
                  isLoading={isLoading}
                />

                {/* Recommended Challenges */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Recommended Challenges</h2>
                    <Link
                      to="/gamification/challenges"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View all challenges
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {getRecommendedChallenges().map(challenge => (
                      <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        userChallenge={getUserChallenge(challenge.id)}
                        onJoin={handleJoinChallenge}
                      />
                    ))}
                  </div>
                </div>

                {/* Active Events */}
                {activeEvents.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Active Events</h2>
                      <Link
                        to="/gamification/events"
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      >
                        View all events
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {activeEvents.slice(0, 2).map(event => (
                        <EventCard
                          key={event.id}
                          event={event}
                          userParticipation={getUserEventParticipation(event.id)}
                          onJoin={handleJoinEvent}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Leaderboard */}
                {activeLeaderboards.length > 0 && leaderboardEntries[activeLeaderboards[0].id] && (
                  <Leaderboard
                    title={activeLeaderboards[0].name}
                    description={activeLeaderboards[0].description}
                    entries={leaderboardEntries[activeLeaderboards[0].id]}
                    highlightCurrentUser={true}
                    isLoading={isLoading}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default GamificationDashboard;
