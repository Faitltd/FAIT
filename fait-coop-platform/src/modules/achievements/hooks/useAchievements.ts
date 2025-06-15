import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { achievementsService } from '../../../services/AchievementsService';
import { 
  Achievement, 
  UserAchievement, 
  AchievementProgress,
  AchievementStats
} from '../../../types/achievements.types';

/**
 * Hook for accessing achievements functionality
 */
export const useAchievements = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [progress, setProgress] = useState<AchievementProgress[]>([]);
  const [stats, setStats] = useState<AchievementStats>({
    total_achievements: 0,
    achievements_earned: 0,
    total_points_earned: 0,
    completion_percentage: 0
  });

  // Fetch achievements data
  const fetchAchievementsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all achievements
      const achievementsData = await achievementsService.getAllAchievements();
      setAchievements(achievementsData);
      
      // Get user achievements
      const userAchievementsData = await achievementsService.getUserAchievements(user.id);
      setUserAchievements(userAchievementsData);
      
      // Get achievement progress
      const progressData = await achievementsService.getUserAchievementProgress(user.id);
      setProgress(progressData);
      
      // Get achievement stats
      const statsData = await achievementsService.getUserAchievementStats(user.id);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error fetching achievements data:', err);
      setError(err.message || 'Failed to load achievements data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch achievements data on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchAchievementsData();
    } else {
      setIsLoading(false);
      setAchievements([]);
      setUserAchievements([]);
      setProgress([]);
      setStats({
        total_achievements: 0,
        achievements_earned: 0,
        total_points_earned: 0,
        completion_percentage: 0
      });
    }
  }, [user]);

  // Get achievements by category
  const getAchievementsByCategory = async (category: string) => {
    try {
      return await achievementsService.getAchievementsByCategory(category);
    } catch (err) {
      console.error('Error getting achievements by category:', err);
      return [];
    }
  };

  // Check and award achievements
  const checkAndAwardAchievements = async (
    triggerType: string,
    triggerValue: number = 1
  ) => {
    if (!user) return [];
    
    try {
      const result = await achievementsService.checkAndAwardAchievements(
        user.id,
        triggerType,
        triggerValue
      );
      
      if (result.length > 0) {
        // Refresh achievements data
        fetchAchievementsData();
      }
      
      return result;
    } catch (err) {
      console.error('Error checking and awarding achievements:', err);
      return [];
    }
  };

  // Check signup achievements
  const checkSignupAchievements = async () => {
    if (!user) return [];
    
    try {
      const result = await achievementsService.checkSignupAchievements(user.id);
      
      if (result.length > 0) {
        // Refresh achievements data
        fetchAchievementsData();
      }
      
      return result;
    } catch (err) {
      console.error('Error checking signup achievements:', err);
      return [];
    }
  };

  // Check profile completion achievements
  const checkProfileCompletionAchievements = async () => {
    if (!user) return [];
    
    try {
      const result = await achievementsService.checkProfileCompletionAchievements(user.id);
      
      if (result.length > 0) {
        // Refresh achievements data
        fetchAchievementsData();
      }
      
      return result;
    } catch (err) {
      console.error('Error checking profile completion achievements:', err);
      return [];
    }
  };

  // Check verification achievements
  const checkVerificationAchievements = async () => {
    if (!user) return [];
    
    try {
      const result = await achievementsService.checkVerificationAchievements(user.id);
      
      if (result.length > 0) {
        // Refresh achievements data
        fetchAchievementsData();
      }
      
      return result;
    } catch (err) {
      console.error('Error checking verification achievements:', err);
      return [];
    }
  };

  // Refresh achievements data
  const refreshAchievements = () => {
    fetchAchievementsData();
  };

  return {
    isLoading,
    error,
    achievements,
    userAchievements,
    progress,
    stats,
    getAchievementsByCategory,
    checkAndAwardAchievements,
    checkSignupAchievements,
    checkProfileCompletionAchievements,
    checkVerificationAchievements,
    refreshAchievements
  };
};
