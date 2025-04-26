/**
 * Forum system types
 */

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

export type ForumPostType =
  | 'discussion'    // Regular discussion post
  | 'question'      // Question post
  | 'announcement'  // Announcement post
  | 'poll'          // Poll post
  | 'event';        // Event post

export interface ForumCategory {
  id: string;
  name: string;
  description: string;
  slug: string;
  type: ForumCategoryType;
  icon_name?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  post_count?: number;
  thread_count?: number;
}

export interface ForumThread {
  id: string;
  title: string;
  slug: string;
  category_id: string;
  user_id: string;
  is_pinned: boolean;
  is_locked: boolean;
  post_count: number;
  view_count: number;
  last_post_at: string;
  created_at: string;
  updated_at: string;
  category?: ForumCategory;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    user_type: string;
  };
  last_post?: {
    id: string;
    user_id: string;
    created_at: string;
    author?: {
      id: string;
      first_name: string;
      last_name: string;
      avatar_url?: string;
    };
  };
}

export interface ForumPost {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  status: ForumPostStatus;
  is_solution: boolean;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    user_type: string;
  };
  reactions?: ForumReaction[];
  reply_count?: number;
}

export interface ForumReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: string;
  created_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

export interface ForumPoll {
  id: string;
  post_id: string;
  question: string;
  options: ForumPollOption[];
  is_multiple_choice: boolean;
  ends_at?: string;
  created_at: string;
}

export interface ForumPollOption {
  id: string;
  poll_id: string;
  text: string;
  vote_count: number;
  created_at: string;
}

export interface ForumPollVote {
  id: string;
  poll_id: string;
  option_id: string;
  user_id: string;
  created_at: string;
}

export interface ForumStats {
  total_categories: number;
  total_threads: number;
  total_posts: number;
  total_users: number;
  latest_user?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    created_at: string;
  };
  most_active_category?: {
    id: string;
    name: string;
    post_count: number;
  };
}

export interface ForumUserStats {
  post_count: number;
  thread_count: number;
  reaction_count: number;
  solution_count: number;
  last_post_at?: string;
  join_date: string;
  reputation: number;
}
