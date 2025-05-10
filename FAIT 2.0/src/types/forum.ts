import { Profile } from './user';

export type ForumCategoryType =
  | 'general'       // General discussion
  | 'projects'      // Project-related discussions
  | 'services'      // Service-related discussions
  | 'questions'     // Questions and answers
  | 'announcements' // Platform announcements
  | 'feedback'      // Feedback and suggestions
  | 'marketplace';  // Marketplace discussions

export type ForumPostStatus =
  | 'published'     // Post is published and visible
  | 'draft'         // Post is a draft and only visible to the author
  | 'hidden'        // Post is hidden by moderators
  | 'reported'      // Post has been reported
  | 'deleted';      // Post has been deleted

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: ForumCategoryType;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Computed fields
  thread_count?: number;
  post_count?: number;
  latest_thread?: ForumThread;
}

export interface ForumThread {
  id: string;
  category_id: string;
  user_id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;

  // Joined fields
  author?: Profile;
  category?: ForumCategory;
  post_count?: number;
  latest_post?: ForumPost;
}

export interface ForumPost {
  id: string;
  thread_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  status: ForumPostStatus;
  is_solution: boolean;
  created_at: string;
  updated_at: string;

  // Joined fields
  author?: Profile;
  thread?: ForumThread;
  parent?: ForumPost;
  reactions?: ForumReaction[];
}

export interface ForumReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;

  // Joined fields
  user?: Profile;
}

export interface ForumStats {
  total_categories: number;
  total_threads: number;
  total_posts: number;
  total_users: number;
}

export interface ForumUserStats {
  user_id: string;
  thread_count: number;
  post_count: number;
  reaction_count: number;
  solution_count: number;
}

export type ForumReportStatus =
  | 'pending'      // Report is pending review
  | 'resolved'     // Report has been resolved
  | 'dismissed';   // Report has been dismissed

export interface ForumPostReport {
  id: string;
  post_id: string;
  user_id: string;
  reason: string;
  details?: string;
  status: ForumReportStatus;
  moderator_id?: string;
  resolution?: string;
  resolved_at?: string;
  created_at: string;

  // Joined fields
  post?: ForumPost;
  reporter?: Profile;
  moderator?: Profile;
}
