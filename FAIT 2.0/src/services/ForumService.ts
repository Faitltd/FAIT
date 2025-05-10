import { supabase } from '../lib/supabase';
// Make supabase accessible for the ForumModerationOverview component
export { supabase };
import {
  ForumCategory,
  ForumThread,
  ForumPost,
  ForumReaction,
  ForumStats,
  ForumUserStats,
  ForumPostReport,
  ForumPostStatus
} from '../types/forum';

/**
 * Service for handling forum functionality
 */
export class ForumService {
  /**
   * Get all forum categories
   * @returns List of forum categories
   */
  async getCategories(): Promise<ForumCategory[]> {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select(`
          *,
          thread_count:forum_threads(count),
          post_count:forum_posts(count),
          latest_thread:forum_threads(
            id, title, slug, created_at,
            author:user_id(id, full_name, avatar_url)
          )
        `)
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching forum categories:', error);
        return [];
      }

      // Process the data to get the latest thread for each category
      const processedData = data.map(category => {
        let latestThread = null;
        if (category.latest_thread && category.latest_thread.length > 0) {
          // Sort threads by created_at to get the latest one
          const sortedThreads = [...category.latest_thread].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          latestThread = sortedThreads[0];
        }

        return {
          ...category,
          thread_count: category.thread_count,
          post_count: category.post_count,
          latest_thread: latestThread
        };
      });

      return processedData as ForumCategory[];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  /**
   * Get a category by slug
   * @param slug - The slug of the category to retrieve
   * @returns The category data
   */
  async getCategoryBySlug(slug: string): Promise<ForumCategory | null> {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select(`
          *,
          thread_count:forum_threads(count),
          post_count:forum_posts(count)
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching category by slug:', error);
        return null;
      }

      return data as ForumCategory;
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error);
      return null;
    }
  }

  /**
   * Get threads for a category
   * @param categoryId - The ID of the category
   * @param page - Page number for pagination
   * @param pageSize - Number of threads per page
   * @returns List of threads
   */
  async getThreadsByCategory(
    categoryId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ threads: ForumThread[]; total: number }> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Get total count
      const { count, error: countError } = await supabase
        .from('forum_threads')
        .select('id', { count: 'exact' })
        .eq('category_id', categoryId);

      if (countError) {
        console.error('Error counting threads:', countError);
        return { threads: [], total: 0 };
      }

      // Get threads with pagination
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:user_id(*),
          category:category_id(*),
          post_count:forum_posts(count),
          latest_post:forum_posts(
            id, created_at,
            author:user_id(id, full_name, avatar_url)
          )
        `)
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching threads by category:', error);
        return { threads: [], total: 0 };
      }

      // Process the data to get the latest post for each thread
      const processedData = data.map(thread => {
        let latestPost = null;
        if (thread.latest_post && thread.latest_post.length > 0) {
          // Sort posts by created_at to get the latest one
          const sortedPosts = [...thread.latest_post].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          latestPost = sortedPosts[0];
        }

        return {
          ...thread,
          post_count: thread.post_count,
          latest_post: latestPost
        };
      });

      return { threads: processedData as ForumThread[], total: count || 0 };
    } catch (error) {
      console.error('Error in getThreadsByCategory:', error);
      return { threads: [], total: 0 };
    }
  }

  /**
   * Get a thread by slug
   * @param slug - The slug of the thread to retrieve
   * @returns The thread data
   */
  async getThreadBySlug(slug: string): Promise<ForumThread | null> {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          author:user_id(*),
          category:category_id(*)
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching thread by slug:', error);
        return null;
      }

      // Increment view count
      await supabase
        .from('forum_threads')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id);

      return data as ForumThread;
    } catch (error) {
      console.error('Error in getThreadBySlug:', error);
      return null;
    }
  }

  /**
   * Get posts for a thread
   * @param threadId - The ID of the thread
   * @param page - Page number for pagination
   * @param pageSize - Number of posts per page
   * @returns List of posts
   */
  async getPostsByThread(
    threadId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ posts: ForumPost[]; total: number }> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Get total count
      const { count, error: countError } = await supabase
        .from('forum_posts')
        .select('id', { count: 'exact' })
        .eq('thread_id', threadId)
        .eq('status', 'published');

      if (countError) {
        console.error('Error counting posts:', countError);
        return { posts: [], total: 0 };
      }

      // Get posts with pagination
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:user_id(*),
          reactions:forum_reactions(
            *,
            user:user_id(id, full_name, avatar_url)
          )
        `)
        .eq('thread_id', threadId)
        .eq('status', 'published')
        .order('created_at', { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching posts by thread:', error);
        return { posts: [], total: 0 };
      }

      return { posts: data as ForumPost[], total: count || 0 };
    } catch (error) {
      console.error('Error in getPostsByThread:', error);
      return { posts: [], total: 0 };
    }
  }

  /**
   * Create a new thread
   * @param userId - The ID of the user creating the thread
   * @param categoryId - The ID of the category
   * @param title - The thread title
   * @param content - The thread content
   * @returns The created thread
   */
  async createThread(
    userId: string,
    categoryId: string,
    title: string,
    content: string
  ): Promise<ForumThread | null> {
    try {
      // Generate a slug from the title
      const slug = this.generateSlug(title);

      // Create the thread
      const { data: threadData, error: threadError } = await supabase
        .from('forum_threads')
        .insert({
          category_id: categoryId,
          user_id: userId,
          title,
          slug,
          content
        })
        .select()
        .single();

      if (threadError) {
        console.error('Error creating thread:', threadError);
        return null;
      }

      // Create the initial post
      const { error: postError } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadData.id,
          user_id: userId,
          content,
          status: 'published'
        });

      if (postError) {
        console.error('Error creating initial post:', postError);
        // Continue anyway since the thread was created
      }

      return threadData as ForumThread;
    } catch (error) {
      console.error('Error in createThread:', error);
      return null;
    }
  }

  /**
   * Create a new post
   * @param userId - The ID of the user creating the post
   * @param threadId - The ID of the thread
   * @param content - The post content
   * @param parentId - Optional ID of the parent post (for replies)
   * @returns The created post
   */
  async createPost(
    userId: string,
    threadId: string,
    content: string,
    parentId?: string
  ): Promise<ForumPost | null> {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          user_id: userId,
          parent_id: parentId || null,
          content,
          status: 'published'
        })
        .select(`
          *,
          author:user_id(*)
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return null;
      }

      // Update thread's updated_at timestamp
      await supabase
        .from('forum_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);

      return data as ForumPost;
    } catch (error) {
      console.error('Error in createPost:', error);
      return null;
    }
  }

  /**
   * Add a reaction to a post
   * @param userId - The ID of the user adding the reaction
   * @param postId - The ID of the post
   * @param reactionType - The type of reaction
   * @returns The created reaction
   */
  async addReaction(
    userId: string,
    postId: string,
    reactionType: string
  ): Promise<ForumReaction | null> {
    try {
      // Check if the user already has a reaction of this type on this post
      const { data: existingReaction, error: checkError } = await supabase
        .from('forum_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing reaction:', checkError);
        return null;
      }

      // If the reaction already exists, remove it (toggle behavior)
      if (existingReaction) {
        const { error: deleteError } = await supabase
          .from('forum_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) {
          console.error('Error removing reaction:', deleteError);
        }
        return null;
      }

      // Create the reaction
      const { data, error } = await supabase
        .from('forum_reactions')
        .insert({
          post_id: postId,
          user_id: userId,
          reaction_type: reactionType
        })
        .select(`
          *,
          user:user_id(*)
        `)
        .single();

      if (error) {
        console.error('Error adding reaction:', error);
        return null;
      }

      return data as ForumReaction;
    } catch (error) {
      console.error('Error in addReaction:', error);
      return null;
    }
  }

  /**
   * Mark a post as the solution to a thread
   * @param postId - The ID of the post
   * @param threadId - The ID of the thread
   * @returns True if successful, false otherwise
   */
  async markAsSolution(postId: string, threadId: string): Promise<boolean> {
    try {
      // First, unmark any existing solution
      const { error: resetError } = await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('thread_id', threadId)
        .eq('is_solution', true);

      if (resetError) {
        console.error('Error resetting solution status:', resetError);
        return false;
      }

      // Mark the new solution
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', postId)
        .eq('thread_id', threadId);

      if (error) {
        console.error('Error marking post as solution:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsSolution:', error);
      return false;
    }
  }

  /**
   * Search forum content
   * @param query - The search query
   * @param categoryId - Optional category ID to limit search
   * @returns Search results
   */
  async searchForum(
    query: string,
    categoryId?: string
  ): Promise<{ threads: ForumThread[]; posts: ForumPost[] }> {
    try {
      // Search threads
      let threadsQuery = supabase
        .from('forum_threads')
        .select(`
          *,
          author:user_id(*),
          category:category_id(*)
        `)
        .or(`title.ilike.%${query}%, content.ilike.%${query}%`);

      if (categoryId) {
        threadsQuery = threadsQuery.eq('category_id', categoryId);
      }

      const { data: threadsData, error: threadsError } = await threadsQuery
        .order('created_at', { ascending: false })
        .limit(10);

      if (threadsError) {
        console.error('Error searching threads:', threadsError);
        return { threads: [], posts: [] };
      }

      // Search posts
      let postsQuery = supabase
        .from('forum_posts')
        .select(`
          *,
          author:user_id(*),
          thread:thread_id(*)
        `)
        .ilike('content', `%${query}%`)
        .eq('status', 'published');

      if (categoryId) {
        postsQuery = postsQuery.eq('thread.category_id', categoryId);
      }

      const { data: postsData, error: postsError } = await postsQuery
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) {
        console.error('Error searching posts:', postsError);
        return { threads: threadsData as ForumThread[], posts: [] };
      }

      return {
        threads: threadsData as ForumThread[],
        posts: postsData as ForumPost[]
      };
    } catch (error) {
      console.error('Error in searchForum:', error);
      return { threads: [], posts: [] };
    }
  }

  /**
   * Get forum statistics
   * @returns Forum statistics
   */
  async getForumStats(): Promise<ForumStats> {
    try {
      // Get category count
      const { count: categoryCount, error: categoryError } = await supabase
        .from('forum_categories')
        .select('id', { count: 'exact' })
        .eq('is_active', true);

      if (categoryError) {
        console.error('Error counting categories:', categoryError);
      }

      // Get thread count
      const { count: threadCount, error: threadError } = await supabase
        .from('forum_threads')
        .select('id', { count: 'exact' });

      if (threadError) {
        console.error('Error counting threads:', threadError);
      }

      // Get post count
      const { count: postCount, error: postError } = await supabase
        .from('forum_posts')
        .select('id', { count: 'exact' })
        .eq('status', 'published');

      if (postError) {
        console.error('Error counting posts:', postError);
      }

      // Get user count (users who have posted)
      const { count: userCount, error: userError } = await supabase
        .from('forum_posts')
        .select('user_id', { count: 'exact', head: true })
        .eq('status', 'published');

      if (userError) {
        console.error('Error counting users:', userError);
      }

      return {
        total_categories: categoryCount || 0,
        total_threads: threadCount || 0,
        total_posts: postCount || 0,
        total_users: userCount || 0
      };
    } catch (error) {
      console.error('Error in getForumStats:', error);
      return {
        total_categories: 0,
        total_threads: 0,
        total_posts: 0,
        total_users: 0
      };
    }
  }

  /**
   * Get forum statistics for a user
   * @param userId - The ID of the user
   * @returns User forum statistics
   */
  async getUserForumStats(userId: string): Promise<ForumUserStats | null> {
    try {
      // Get thread count
      const { count: threadCount, error: threadError } = await supabase
        .from('forum_threads')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      if (threadError) {
        console.error('Error counting user threads:', threadError);
      }

      // Get post count
      const { count: postCount, error: postError } = await supabase
        .from('forum_posts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'published');

      if (postError) {
        console.error('Error counting user posts:', postError);
      }

      // Get reaction count
      const { count: reactionCount, error: reactionError } = await supabase
        .from('forum_reactions')
        .select('id', { count: 'exact' })
        .eq('user_id', userId);

      if (reactionError) {
        console.error('Error counting user reactions:', reactionError);
      }

      // Get solution count
      const { count: solutionCount, error: solutionError } = await supabase
        .from('forum_posts')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('is_solution', true);

      if (solutionError) {
        console.error('Error counting user solutions:', solutionError);
      }

      return {
        user_id: userId,
        thread_count: threadCount || 0,
        post_count: postCount || 0,
        reaction_count: reactionCount || 0,
        solution_count: solutionCount || 0
      };
    } catch (error) {
      console.error('Error in getUserForumStats:', error);
      return null;
    }
  }

  /**
   * Generate a URL-friendly slug from a string
   * @param text - The text to convert to a slug
   * @returns The generated slug
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .concat('-', Math.floor(Math.random() * 1000).toString());
  }

  /**
   * Pin a thread to the top of its category
   * @param threadId - The ID of the thread to pin
   * @returns True if successful, false otherwise
   */
  async pinThread(threadId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_pinned: true })
        .eq('id', threadId);

      if (error) {
        console.error('Error pinning thread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in pinThread:', error);
      return false;
    }
  }

  /**
   * Unpin a thread
   * @param threadId - The ID of the thread to unpin
   * @returns True if successful, false otherwise
   */
  async unpinThread(threadId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_pinned: false })
        .eq('id', threadId);

      if (error) {
        console.error('Error unpinning thread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in unpinThread:', error);
      return false;
    }
  }

  /**
   * Lock a thread to prevent new replies
   * @param threadId - The ID of the thread to lock
   * @returns True if successful, false otherwise
   */
  async lockThread(threadId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_locked: true })
        .eq('id', threadId);

      if (error) {
        console.error('Error locking thread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in lockThread:', error);
      return false;
    }
  }

  /**
   * Unlock a thread to allow new replies
   * @param threadId - The ID of the thread to unlock
   * @returns True if successful, false otherwise
   */
  async unlockThread(threadId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forum_threads')
        .update({ is_locked: false })
        .eq('id', threadId);

      if (error) {
        console.error('Error unlocking thread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in unlockThread:', error);
      return false;
    }
  }

  /**
   * Update a post's status (e.g., hide a post)
   * @param postId - The ID of the post
   * @param status - The new status
   * @returns True if successful, false otherwise
   */
  async updatePostStatus(postId: string, status: ForumPostStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forum_posts')
        .update({ status })
        .eq('id', postId);

      if (error) {
        console.error('Error updating post status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updatePostStatus:', error);
      return false;
    }
  }

  /**
   * Report a post for moderation
   * @param userId - The ID of the user reporting the post
   * @param postId - The ID of the post being reported
   * @param reason - The reason for the report
   * @param details - Additional details about the report
   * @returns The created report
   */
  async reportPost(
    userId: string,
    postId: string,
    reason: string,
    details?: string
  ): Promise<ForumPostReport | null> {
    try {
      const { data, error } = await supabase
        .from('forum_post_reports')
        .insert({
          post_id: postId,
          user_id: userId,
          reason,
          details: details || null,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error reporting post:', error);
        return null;
      }

      // Update post status to reported
      await this.updatePostStatus(postId, 'reported');

      return data as ForumPostReport;
    } catch (error) {
      console.error('Error in reportPost:', error);
      return null;
    }
  }

  /**
   * Get reported posts for moderation
   * @param status - Optional status filter
   * @param page - Page number for pagination
   * @param pageSize - Number of reports per page
   * @returns List of reports
   */
  async getReportedPosts(
    status?: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<{ reports: ForumPostReport[]; total: number }> {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;

      // Build query
      let query = supabase
        .from('forum_post_reports')
        .select(`
          *,
          post:post_id(
            *,
            author:user_id(*),
            thread:thread_id(*)
          ),
          reporter:user_id(*),
          moderator:moderator_id(*)
        `, { count: 'exact' });

      // Add status filter if provided
      if (status) {
        query = query.eq('status', status);
      }

      // Execute query with pagination
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (error) {
        console.error('Error fetching reported posts:', error);
        return { reports: [], total: 0 };
      }

      return { reports: data as ForumPostReport[], total: count || 0 };
    } catch (error) {
      console.error('Error in getReportedPosts:', error);
      return { reports: [], total: 0 };
    }
  }

  /**
   * Resolve a post report
   * @param reportId - The ID of the report
   * @param moderatorId - The ID of the moderator resolving the report
   * @param resolution - The resolution details
   * @param postStatus - Optional new status for the post
   * @returns True if successful, false otherwise
   */
  async resolveReport(
    reportId: string,
    moderatorId: string,
    resolution: string,
    postStatus?: ForumPostStatus
  ): Promise<boolean> {
    try {
      // Get the report to find the post ID
      const { data: report, error: reportError } = await supabase
        .from('forum_post_reports')
        .select('post_id')
        .eq('id', reportId)
        .single();

      if (reportError) {
        console.error('Error fetching report:', reportError);
        return false;
      }

      // Update the report status
      const { error } = await supabase
        .from('forum_post_reports')
        .update({
          status: 'resolved',
          moderator_id: moderatorId,
          resolution,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        console.error('Error resolving report:', error);
        return false;
      }

      // Update the post status if provided
      if (postStatus && report) {
        await this.updatePostStatus(report.post_id, postStatus);
      }

      return true;
    } catch (error) {
      console.error('Error in resolveReport:', error);
      return false;
    }
  }

  /**
   * Dismiss a post report
   * @param reportId - The ID of the report
   * @param moderatorId - The ID of the moderator dismissing the report
   * @param reason - The reason for dismissal
   * @returns True if successful, false otherwise
   */
  async dismissReport(
    reportId: string,
    moderatorId: string,
    reason: string
  ): Promise<boolean> {
    try {
      // Get the report to find the post ID
      const { data: report, error: reportError } = await supabase
        .from('forum_post_reports')
        .select('post_id')
        .eq('id', reportId)
        .single();

      if (reportError) {
        console.error('Error fetching report:', reportError);
        return false;
      }

      // Update the report status
      const { error } = await supabase
        .from('forum_post_reports')
        .update({
          status: 'dismissed',
          moderator_id: moderatorId,
          resolution: reason,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) {
        console.error('Error dismissing report:', error);
        return false;
      }

      // Restore the post status to published if it was reported
      if (report) {
        const { data: post, error: postError } = await supabase
          .from('forum_posts')
          .select('status')
          .eq('id', report.post_id)
          .single();

        if (!postError && post && post.status === 'reported') {
          await this.updatePostStatus(report.post_id, 'published');
        }
      }

      return true;
    } catch (error) {
      console.error('Error in dismissReport:', error);
      return false;
    }
  }
}

export const forumService = new ForumService();
