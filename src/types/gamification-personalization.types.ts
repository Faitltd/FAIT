/**
 * Types for gamification personalization
 */

import { UserEngagementLevel } from './gamification-analytics.types';

/**
 * User preference categories
 */
export enum PreferenceCategory {
  CHALLENGE_DIFFICULTY = 'challenge_difficulty',
  CHALLENGE_CATEGORY = 'challenge_category',
  REWARD_TYPE = 'reward_type',
  ACTIVITY_TIME = 'activity_time',
  SOCIAL_PREFERENCE = 'social_preference'
}

/**
 * User preference value
 */
export interface UserPreference {
  category: PreferenceCategory;
  value: string;
  strength: number; // 0-1 indicating how strong the preference is
}

/**
 * User behavior pattern
 */
export interface UserBehaviorPattern {
  patternType: string;
  description: string;
  confidence: number; // 0-1 indicating confidence in this pattern
  metadata: Record<string, any>;
}

/**
 * User personalization profile
 */
export interface UserPersonalizationProfile {
  userId: string;
  engagementLevel: UserEngagementLevel;
  preferences: UserPreference[];
  behaviorPatterns: UserBehaviorPattern[];
  recommendedChallengeIds: string[];
  recommendedEventIds: string[];
  lastUpdated: string;
}

/**
 * Challenge recommendation criteria
 */
export interface ChallengeRecommendationCriteria {
  userId?: string;
  userType?: string;
  engagementLevel?: UserEngagementLevel;
  preferredCategories?: string[];
  preferredDifficulty?: string;
  excludeCompletedChallenges?: boolean;
  excludeChallengeIds?: string[];
  limit?: number;
}

/**
 * Event recommendation criteria
 */
export interface EventRecommendationCriteria {
  userId?: string;
  userType?: string;
  engagementLevel?: UserEngagementLevel;
  preferredTypes?: string[];
  excludeJoinedEvents?: boolean;
  excludeEventIds?: string[];
  limit?: number;
}

/**
 * Personalized notification
 */
export interface PersonalizedNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'challenge' | 'event' | 'achievement' | 'level' | 'streak' | 'team' | 'system';
  referenceId?: string;
  priority: 'low' | 'medium' | 'high';
  isRead: boolean;
  createdAt: string;
}

/**
 * Personalization action
 */
export interface PersonalizationAction {
  type: 'recommend_challenge' | 'recommend_event' | 'send_notification' | 'adjust_difficulty' | 'highlight_feature';
  userId: string;
  metadata: Record<string, any>;
  reason: string;
  confidence: number;
}

/**
 * Personalization rule
 */
export interface PersonalizationRule {
  id: string;
  name: string;
  description: string;
  conditions: {
    engagementLevel?: UserEngagementLevel[];
    userType?: string[];
    activityPattern?: string;
    completedChallenges?: string[];
    preferences?: Partial<Record<PreferenceCategory, string[]>>;
    customCondition?: string;
  };
  actions: {
    type: PersonalizationAction['type'];
    parameters: Record<string, any>;
  }[];
  isActive: boolean;
  priority: number; // Higher number = higher priority
}

/**
 * Personalization engine configuration
 */
export interface PersonalizationConfig {
  enablePersonalization: boolean;
  enableAutomaticPreferenceDetection: boolean;
  enableBehaviorPatternDetection: boolean;
  enableDynamicDifficulty: boolean;
  enablePersonalizedNotifications: boolean;
  enableRecommendations: boolean;
  maxRecommendationsPerUser: number;
  minConfidenceThreshold: number;
  updateFrequencyHours: number;
  rules: PersonalizationRule[];
}
