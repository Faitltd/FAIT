import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { gamificationService } from '../../../services/gamification/GamificationService';
import { 
  Challenge,
  UserChallenge,
  Leaderboard,
  LeaderboardEntry,
  UserLevel,
  Event,
  UserEventParticipation,
  Team,
  TeamMember,
  DailyTask,
  UserDailyTask,
  Streak,
  UserTitle,
  GamificationSettings
} from '../../../types/gamification.types';

/**
 * Hook for accessing gamification functionality
 */
export const useGamification = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Challenges
  const [activeChallenges, setActiveChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  
  // Leaderboards
  const [activeLeaderboards, setActiveLeaderboards] = useState<Leaderboard[]>([]);
  const [leaderboardEntries, setLeaderboardEntries] = useState<{ [key: string]: LeaderboardEntry[] }>({});
  
  // Levels
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  
  // Events
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [userEventParticipations, setUserEventParticipations] = useState<UserEventParticipation[]>([]);
  
  // Teams
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Daily Tasks
  const [userDailyTasks, setUserDailyTasks] = useState<UserDailyTask[]>([]);
  
  // Streaks
  const [userStreaks, setUserStreaks] = useState<Streak[]>([]);
  
  // Titles
  const [userTitles, setUserTitles] = useState<UserTitle[]>([]);
  
  // Settings
  const [gamificationSettings, setGamificationSettings] = useState<GamificationSettings | null>(null);

  // Track user activity
  const trackActivity = async (
    action: string,
    targetId?: string,
    metadata?: any
  ) => {
    if (!user) return false;
    
    try {
      return await gamificationService.trackActivity(
        user.id,
        action,
        targetId,
        metadata
      );
    } catch (err) {
      console.error('Error tracking activity:', err);
      return false;
    }
  };

  // Fetch active challenges
  const fetchActiveChallenges = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const challenges = await gamificationService.challenges.getActiveChallenges();
      setActiveChallenges(challenges);
    } catch (err: any) {
      console.error('Error fetching active challenges:', err);
      setError(err.message || 'Failed to load challenges');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user challenges
  const fetchUserChallenges = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const challenges = await gamificationService.challenges.getUserChallenges(user.id);
      setUserChallenges(challenges);
    } catch (err: any) {
      console.error('Error fetching user challenges:', err);
      setError(err.message || 'Failed to load user challenges');
    } finally {
      setIsLoading(false);
    }
  };

  // Join a challenge
  const joinChallenge = async (challengeId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await gamificationService.challenges.joinChallenge(user.id, challengeId);
      if (result) {
        // Refresh user challenges
        await fetchUserChallenges();
      }
      return result;
    } catch (err: any) {
      console.error('Error joining challenge:', err);
      setError(err.message || 'Failed to join challenge');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active leaderboards
  const fetchActiveLeaderboards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const leaderboards = await gamificationService.leaderboards.getActiveLeaderboards();
      setActiveLeaderboards(leaderboards);
    } catch (err: any) {
      console.error('Error fetching active leaderboards:', err);
      setError(err.message || 'Failed to load leaderboards');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch leaderboard entries
  const fetchLeaderboardEntries = async (leaderboardId: string, limit: number = 10) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const entries = await gamificationService.leaderboards.getLeaderboardEntries(leaderboardId, limit);
      setLeaderboardEntries(prev => ({
        ...prev,
        [leaderboardId]: entries
      }));
    } catch (err: any) {
      console.error('Error fetching leaderboard entries:', err);
      setError(err.message || 'Failed to load leaderboard entries');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user level
  const fetchUserLevel = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const level = await gamificationService.levels.getUserLevel(user.id);
      setUserLevel(level);
    } catch (err: any) {
      console.error('Error fetching user level:', err);
      setError(err.message || 'Failed to load user level');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch active events
  const fetchActiveEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const events = await gamificationService.events.getActiveEvents();
      setActiveEvents(events);
    } catch (err: any) {
      console.error('Error fetching active events:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch upcoming events
  const fetchUpcomingEvents = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const events = await gamificationService.events.getUpcomingEvents();
      setUpcomingEvents(events);
    } catch (err: any) {
      console.error('Error fetching upcoming events:', err);
      setError(err.message || 'Failed to load upcoming events');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user event participations
  const fetchUserEventParticipations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const participations = await gamificationService.events.getUserEventParticipations(user.id);
      setUserEventParticipations(participations);
    } catch (err: any) {
      console.error('Error fetching user event participations:', err);
      setError(err.message || 'Failed to load event participations');
    } finally {
      setIsLoading(false);
    }
  };

  // Join an event
  const joinEvent = async (eventId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await gamificationService.events.joinEvent(user.id, eventId);
      if (result) {
        // Refresh user event participations
        await fetchUserEventParticipations();
        // Refresh user challenges
        await fetchUserChallenges();
      }
      return result;
    } catch (err: any) {
      console.error('Error joining event:', err);
      setError(err.message || 'Failed to join event');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user team
  const fetchUserTeam = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const team = await gamificationService.teams.getUserTeam(user.id);
      setUserTeam(team);
      
      if (team) {
        // Fetch team members
        const members = await gamificationService.teams.getTeamMembers(team.id);
        setTeamMembers(members);
      }
    } catch (err: any) {
      console.error('Error fetching user team:', err);
      setError(err.message || 'Failed to load team');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a team
  const createTeam = async (name: string, description: string, logoUrl?: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await gamificationService.teams.createTeam(
        user.id,
        name,
        description,
        logoUrl
      );
      if (result) {
        // Refresh user team
        await fetchUserTeam();
      }
      return result;
    } catch (err: any) {
      console.error('Error creating team:', err);
      setError(err.message || 'Failed to create team');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Join a team
  const joinTeam = async (teamId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await gamificationService.teams.joinTeam(user.id, teamId);
      if (result) {
        // Refresh user team
        await fetchUserTeam();
      }
      return result;
    } catch (err: any) {
      console.error('Error joining team:', err);
      setError(err.message || 'Failed to join team');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Leave a team
  const leaveTeam = async () => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await gamificationService.teams.leaveTeam(user.id);
      if (result) {
        // Refresh user team
        setUserTeam(null);
        setTeamMembers([]);
      }
      return result;
    } catch (err: any) {
      console.error('Error leaving team:', err);
      setError(err.message || 'Failed to leave team');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user daily tasks
  const fetchUserDailyTasks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const tasks = await gamificationService.dailyTasks.getUserDailyTasks(user.id);
      setUserDailyTasks(tasks);
    } catch (err: any) {
      console.error('Error fetching user daily tasks:', err);
      setError(err.message || 'Failed to load daily tasks');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user streaks
  const fetchUserStreaks = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const streaks = await gamificationService.streaks.getUserStreaks(user.id);
      setUserStreaks(streaks);
    } catch (err: any) {
      console.error('Error fetching user streaks:', err);
      setError(err.message || 'Failed to load streaks');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user titles
  const fetchUserTitles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const titles = await gamificationService.getUserTitles(user.id);
      setUserTitles(titles);
    } catch (err: any) {
      console.error('Error fetching user titles:', err);
      setError(err.message || 'Failed to load titles');
    } finally {
      setIsLoading(false);
    }
  };

  // Set active title
  const setActiveTitle = async (titleId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await gamificationService.setActiveTitle(user.id, titleId);
      if (result) {
        // Refresh user titles
        await fetchUserTitles();
      }
      return result;
    } catch (err: any) {
      console.error('Error setting active title:', err);
      setError(err.message || 'Failed to set active title');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch gamification settings
  const fetchGamificationSettings = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const settings = await gamificationService.getGamificationSettings(user.id);
      setGamificationSettings(settings);
    } catch (err: any) {
      console.error('Error fetching gamification settings:', err);
      setError(err.message || 'Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  // Update gamification settings
  const updateGamificationSettings = async (settings: Partial<GamificationSettings>) => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await gamificationService.updateGamificationSettings(user.id, settings);
      if (result) {
        setGamificationSettings(result);
      }
      return result;
    } catch (err: any) {
      console.error('Error updating gamification settings:', err);
      setError(err.message || 'Failed to update settings');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    if (user) {
      // Load user-specific data
      fetchUserChallenges();
      fetchUserLevel();
      fetchUserEventParticipations();
      fetchUserTeam();
      fetchUserDailyTasks();
      fetchUserStreaks();
      fetchUserTitles();
      fetchGamificationSettings();
    }
    
    // Load general data
    fetchActiveChallenges();
    fetchActiveLeaderboards();
    fetchActiveEvents();
    fetchUpcomingEvents();
  }, [user]);

  return {
    isLoading,
    error,
    
    // Challenges
    activeChallenges,
    userChallenges,
    fetchActiveChallenges,
    fetchUserChallenges,
    joinChallenge,
    
    // Leaderboards
    activeLeaderboards,
    leaderboardEntries,
    fetchActiveLeaderboards,
    fetchLeaderboardEntries,
    
    // Levels
    userLevel,
    fetchUserLevel,
    
    // Events
    activeEvents,
    upcomingEvents,
    userEventParticipations,
    fetchActiveEvents,
    fetchUpcomingEvents,
    fetchUserEventParticipations,
    joinEvent,
    
    // Teams
    userTeam,
    teamMembers,
    fetchUserTeam,
    createTeam,
    joinTeam,
    leaveTeam,
    
    // Daily Tasks
    userDailyTasks,
    fetchUserDailyTasks,
    
    // Streaks
    userStreaks,
    fetchUserStreaks,
    
    // Titles
    userTitles,
    fetchUserTitles,
    setActiveTitle,
    
    // Settings
    gamificationSettings,
    fetchGamificationSettings,
    updateGamificationSettings,
    
    // Activity tracking
    trackActivity
  };
};
