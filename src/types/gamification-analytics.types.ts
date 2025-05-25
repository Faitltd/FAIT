/**
 * Types for gamification analytics
 */

/**
 * Gamification engagement metrics
 */
export interface GamificationEngagementMetrics {
  // User counts
  totalUsers: number;
  activeUsers: number;
  engagedUsers: number; // Users who have completed at least one challenge
  
  // Challenge metrics
  totalChallengesCompleted: number;
  challengesCompletedPerUser: number;
  mostPopularChallenges: ChallengeMetric[];
  challengeCompletionRate: number;
  
  // Event metrics
  totalEventParticipants: number;
  eventParticipationRate: number;
  mostPopularEvents: EventMetric[];
  
  // Daily task metrics
  dailyTaskCompletionRate: number;
  averageDailyTasksCompleted: number;
  
  // Streak metrics
  averageLoginStreak: number;
  maxLoginStreak: number;
  usersWithActiveStreaks: number;
  
  // Team metrics
  totalTeams: number;
  averageTeamSize: number;
  teamChallengesCompleted: number;
  
  // Point metrics
  totalPointsAwarded: number;
  averagePointsPerUser: number;
  pointsAwardedBySource: PointSourceMetric[];
}

/**
 * Challenge metric
 */
export interface ChallengeMetric {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  completions: number;
  completionRate: number;
}

/**
 * Event metric
 */
export interface EventMetric {
  id: string;
  title: string;
  type: string;
  participants: number;
  participationRate: number;
  challengesCompletedRate: number;
}

/**
 * Point source metric
 */
export interface PointSourceMetric {
  source: string;
  points: number;
  percentage: number;
}

/**
 * User engagement level
 */
export enum UserEngagementLevel {
  INACTIVE = 'inactive',
  CASUAL = 'casual',
  ENGAGED = 'engaged',
  HIGHLY_ENGAGED = 'highly_engaged',
  POWER_USER = 'power_user'
}

/**
 * User engagement metrics
 */
export interface UserEngagementMetrics {
  userId: string;
  engagementLevel: UserEngagementLevel;
  totalPoints: number;
  challengesCompleted: number;
  eventsParticipated: number;
  dailyTasksCompleted: number;
  currentLoginStreak: number;
  longestLoginStreak: number;
  lastActivityDate: string;
  daysActive: number;
  averageSessionsPerWeek: number;
  teamParticipation: boolean;
}

/**
 * Gamification impact metrics
 */
export interface GamificationImpactMetrics {
  // Retention metrics
  retentionRate: number;
  retentionByEngagementLevel: Record<UserEngagementLevel, number>;
  
  // Activity metrics
  averageSessionDuration: number;
  sessionsPerUser: number;
  activityByEngagementLevel: Record<UserEngagementLevel, number>;
  
  // Business metrics
  bookingsPerUser: number;
  bookingValuePerUser: number;
  referralsPerUser: number;
  
  // Comparison metrics
  engagedVsNonEngagedRetention: {
    engaged: number;
    nonEngaged: number;
    difference: number;
  };
  engagedVsNonEngagedBookings: {
    engaged: number;
    nonEngaged: number;
    difference: number;
  };
}

/**
 * Time period for analytics
 */
export enum AnalyticsTimePeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ALL_TIME = 'all_time',
  CUSTOM = 'custom'
}

/**
 * Analytics filter options
 */
export interface AnalyticsFilterOptions {
  timePeriod: AnalyticsTimePeriod;
  startDate?: string;
  endDate?: string;
  userType?: string;
  challengeCategory?: string;
  eventType?: string;
}

/**
 * Gamification analytics dashboard data
 */
export interface GamificationAnalyticsDashboard {
  engagementMetrics: GamificationEngagementMetrics;
  impactMetrics: GamificationImpactMetrics;
  userEngagementDistribution: Record<UserEngagementLevel, number>;
  topChallenges: ChallengeMetric[];
  topEvents: EventMetric[];
  pointsAwardedOverTime: TimeSeriesData[];
  userEngagementOverTime: TimeSeriesData[];
  retentionOverTime: TimeSeriesData[];
}

/**
 * Time series data point
 */
export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
}
