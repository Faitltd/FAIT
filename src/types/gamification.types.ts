/**
 * Gamification system types
 */

// Existing types from points.types.ts and achievements.types.ts
export interface UserPoints {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  source_type: string;
  source_id?: string;
  created_at: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  requirements: {
    type: string;
    count: number;
  };
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement: Achievement;
  unlocked_at: string;
}

// New gamification types
export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  points: number;
  badge_url?: string;
  start_date: string;
  end_date?: string;
  is_active: boolean;
  is_repeatable: boolean;
  cooldown_days?: number;
  requirements: ChallengeRequirement[];
  rewards: ChallengeReward[];
  created_at: string;
  updated_at: string;
}

export interface ChallengeRequirement {
  type: string;
  action: string;
  count: number;
  target_id?: string;
  metadata?: any;
}

export interface ChallengeReward {
  type: 'points' | 'badge' | 'title' | 'feature_unlock' | 'discount';
  value: number | string;
  metadata?: any;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge: Challenge;
  progress: number;
  is_completed: boolean;
  completed_at?: string;
  last_progress_date: string;
  created_at: string;
}

export interface UserChallengeActivity {
  id: string;
  user_id: string;
  challenge_id: string;
  requirement_type: string;
  action: string;
  progress: number;
  created_at: string;
}

export interface Leaderboard {
  id: string;
  name: string;
  description: string;
  type: 'points' | 'achievements' | 'challenges' | 'custom';
  period: 'daily' | 'weekly' | 'monthly' | 'all_time' | 'custom';
  start_date?: string;
  end_date?: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  user: {
    first_name: string;
    last_name: string;
    avatar_url?: string;
    user_type: string;
  };
  score: number;
  metadata?: any;
}

export interface UserTitle {
  id: string;
  user_id: string;
  title: string;
  source: 'achievement' | 'challenge' | 'level' | 'admin';
  source_id?: string;
  is_active: boolean;
  unlocked_at: string;
}

export interface UserLevel {
  id: string;
  user_id: string;
  level: number;
  points_required: number;
  current_points: number;
  progress_percentage: number;
  unlocked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LevelDefinition {
  level: number;
  name: string;
  points_required: number;
  icon?: string;
  rewards: ChallengeReward[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'seasonal' | 'special' | 'community' | 'promotional';
  start_date: string;
  end_date: string;
  is_active: boolean;
  challenges: Challenge[];
  rewards: ChallengeReward[];
  created_at: string;
  updated_at: string;
}

export interface UserEventParticipation {
  id: string;
  user_id: string;
  event_id: string;
  points_earned: number;
  challenges_completed: number;
  rewards_claimed: boolean;
  joined_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  logo_url?: string;
  leader_id: string;
  member_count: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'leader' | 'co-leader' | 'member';
  points_contributed: number;
  joined_at: string;
}

export interface TeamChallenge {
  id: string;
  team_id: string;
  challenge_id: string;
  progress: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  type: 'login' | 'activity' | 'forum' | 'custom';
  current_count: number;
  longest_count: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  points: number;
  action: string;
  target_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserDailyTask {
  id: string;
  user_id: string;
  task_id: string;
  task: DailyTask;
  progress: number;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface GamificationSettings {
  user_id: string;
  notifications_enabled: boolean;
  leaderboard_visibility: 'public' | 'friends' | 'private';
  achievement_sharing: boolean;
  challenge_reminders: boolean;
  daily_task_reminders: boolean;
  updated_at: string;
}
