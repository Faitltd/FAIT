import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { analyticsService } from '../../../services/AnalyticsService';
import { 
  TimeRange,
  UserSegment,
  GrowthMetrics,
  Dashboard,
  UserMetrics,
  UserActivity,
  ABTest,
  AnalyticsFilter
} from '../../../types/analytics.types';

/**
 * Hook for accessing analytics functionality
 */
export const useAnalytics = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('last_30_days');
  const [customStartDate, setCustomStartDate] = useState<string | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<string | undefined>(undefined);
  const [userSegment, setUserSegment] = useState<UserSegment>('all');
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetrics | null>(null);
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [abTests, setAbTests] = useState<ABTest[]>([]);

  // Track an event
  const trackEvent = async (
    eventType: string,
    resourceType?: string,
    resourceId?: string,
    metadata?: any
  ) => {
    if (!user) return null;
    
    try {
      return await analyticsService.trackEvent(
        eventType,
        user.id,
        resourceType,
        resourceId,
        metadata
      );
    } catch (err) {
      console.error('Error tracking event:', err);
      return null;
    }
  };

  // Handle time range change
  const handleTimeRangeChange = (
    newTimeRange: TimeRange,
    newStartDate?: string,
    newEndDate?: string
  ) => {
    setTimeRange(newTimeRange);
    setCustomStartDate(newStartDate);
    setCustomEndDate(newEndDate);
  };

  // Handle user segment change
  const handleUserSegmentChange = (newUserSegment: UserSegment) => {
    setUserSegment(newUserSegment);
  };

  // Get current filter
  const getCurrentFilter = (): AnalyticsFilter => {
    return {
      time_range: timeRange,
      custom_start_date: customStartDate,
      custom_end_date: customEndDate,
      user_segment: userSegment
    };
  };

  // Fetch growth metrics
  const fetchGrowthMetrics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filter = getCurrentFilter();
      const metrics = await analyticsService.getGrowthMetrics(filter);
      setGrowthMetrics(metrics);
    } catch (err: any) {
      console.error('Error fetching growth metrics:', err);
      setError(err.message || 'Failed to load growth metrics');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboards
  const fetchDashboards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const dashboardsData = await analyticsService.getAllDashboards();
      setDashboards(dashboardsData);
    } catch (err: any) {
      console.error('Error fetching dashboards:', err);
      setError(err.message || 'Failed to load dashboards');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch dashboard by ID
  const fetchDashboard = async (dashboardId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filter = getCurrentFilter();
      const dashboard = await analyticsService.getDashboard(dashboardId, filter);
      setCurrentDashboard(dashboard);
    } catch (err: any) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user metrics
  const fetchUserMetrics = async (userId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const metrics = await analyticsService.getUserMetrics(userId);
      setUserMetrics(metrics);
    } catch (err: any) {
      console.error('Error fetching user metrics:', err);
      setError(err.message || 'Failed to load user metrics');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user activity
  const fetchUserActivity = async (userId: string, limit: number = 20, offset: number = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const activity = await analyticsService.getUserActivity(userId, limit, offset);
      setUserActivity(activity);
    } catch (err: any) {
      console.error('Error fetching user activity:', err);
      setError(err.message || 'Failed to load user activity');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch A/B tests
  const fetchABTests = async (status?: 'draft' | 'running' | 'completed' | 'cancelled') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tests = await analyticsService.getABTests(status);
      setAbTests(tests);
    } catch (err: any) {
      console.error('Error fetching A/B tests:', err);
      setError(err.message || 'Failed to load A/B tests');
    } finally {
      setIsLoading(false);
    }
  };

  // Get A/B test by ID
  const getABTestById = async (testId: string) => {
    try {
      return await analyticsService.getABTestById(testId);
    } catch (err) {
      console.error('Error getting A/B test by ID:', err);
      return null;
    }
  };

  // Get user A/B test variant
  const getUserABTestVariant = async (testId: string) => {
    if (!user) return null;
    
    try {
      return await analyticsService.getUserABTestVariant(user.id, testId);
    } catch (err) {
      console.error('Error getting user A/B test variant:', err);
      return null;
    }
  };

  // Track A/B test conversion
  const trackABTestConversion = async (
    testId: string,
    variantId: string,
    conversionType: string,
    metadata?: any
  ) => {
    if (!user) return false;
    
    try {
      return await analyticsService.trackABTestConversion(
        user.id,
        testId,
        variantId,
        conversionType,
        metadata
      );
    } catch (err) {
      console.error('Error tracking A/B test conversion:', err);
      return false;
    }
  };

  // Refresh data when filter changes
  useEffect(() => {
    if (currentDashboard) {
      fetchDashboard(currentDashboard.id);
    } else {
      fetchGrowthMetrics();
    }
  }, [timeRange, customStartDate, customEndDate, userSegment]);

  return {
    isLoading,
    error,
    timeRange,
    customStartDate,
    customEndDate,
    userSegment,
    growthMetrics,
    dashboards,
    currentDashboard,
    userMetrics,
    userActivity,
    abTests,
    trackEvent,
    handleTimeRangeChange,
    handleUserSegmentChange,
    fetchGrowthMetrics,
    fetchDashboards,
    fetchDashboard,
    fetchUserMetrics,
    fetchUserActivity,
    fetchABTests,
    getABTestById,
    getUserABTestVariant,
    trackABTestConversion
  };
};
