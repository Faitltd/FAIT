import { supabase } from '../lib/supabase';
import { 
  ForumCategory, 
  ForumThread, 
  ForumPost, 
  ForumReaction,
  ForumPoll,
  ForumPollOption,
  ForumPollVote,
  ForumStats,
  ForumUserStats
} from '../types/forum.types';
import { pointsService } from './PointsService';
import { achievementsService } from './AchievementsService';

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
        .select('*, thread_count:forum_threads(count), post_count:forum_posts(count)')
        .eq('is_active', true)
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching forum categories:', error);
        return [];
      }

      // Transform the count aggregates
      return data.map(category => ({
        ...category,
        thread_count: category.thread_count[0]?.count || 0,
        post_count: category.post_count[0]?.count || 0
      })) as ForumCategory[];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  /**
   * Get a forum category by slug
   * @param slug Category slug
   * @returns Forum category if found
   */
  async getCategoryBySlug(slug: string): Promise<ForumCategory | null> {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*, thread_count:forum_threads(count), post_count:forum_posts(count)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching forum category by slug:', error);
        return null;
      }

      // Transform the count aggregates
      return {
        ...data,
        thread_count: data.thread_count[0]?.count || 0,
        post_count: data.post_count[0]?.count || 0
      } as ForumCategory;
    } catch (error) {
      console.error('Error in getCategoryBySlug:', error);
      return null;
    }
  }

  /**
   * Get threads in a category
   * @param categoryId Category ID
   * @param page Page number
   * @param limit Number of threads per page
   * @returns List of threads
   */
  async getThreadsByCategory(
    categoryId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ForumThread[]> {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          category:forum_categories(*),
          author:profiles!forum_threads_user_id_fkey(id, first_name, last_name, avatar_url, user_type),
          last_post:forum_posts(id, user_id, created_at, author:profiles!forum_posts_user_id_fkey(id, first_name, last_name, avatar_url))
        `)
        .eq('category_id', categoryId)
        .order('is_pinned', { ascending: false })
        .order('last_post_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching threads by category:', error);
        return [];
      }

      // Transform the last_post array to a single object
      return data.map(thread => ({
        ...thread,
        last_post: thread.last_post[0] || null
      })) as ForumThread[];
    } catch (error) {
      console.error('Error in getThreadsByCategory:', error);
      return [];
    }
  }

  /**
   * Get a thread by ID
   * @param threadId Thread ID
   * @returns Thread if found
   */
  async getThreadById(threadId: string): Promise<ForumThread | null> {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          category:forum_categories(*),
          author:profiles!forum_threads_user_id_fkey(id, first_name, last_name, avatar_url, user_type),
          last_post:forum_posts(id, user_id, created_at, author:profiles!forum_posts_user_id_fkey(id, first_name, last_name, avatar_url))
        `)
        .eq('id', threadId)
        .single();

      if (error) {
        console.error('Error fetching thread by ID:', error);
        return null;
      }

      // Transform the last_post array to a single object
      return {
        ...data,
        last_post: data.last_post[0] || null
      } as ForumThread;
    } catch (error) {
      console.error('Error in getThreadById:', error);
      return null;
    }
  }

  /**
   * Get a thread by slug
   * @param slug Thread slug
   * @returns Thread if found
   */
  async getThreadBySlug(slug: string): Promise<ForumThread | null> {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select(`
          *,
          category:forum_categories(*),
          author:profiles!forum_threads_user_id_fkey(id, first_name, last_name, avatar_url, user_type),
          last_post:forum_posts(id, user_id, created_at, author:profiles!forum_posts_user_id_fkey(id, first_name, last_name, avatar_url))
        `)
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching thread by slug:', error);
        return null;
      }

      // Transform the last_post array to a single object
      return {
        ...data,
        last_post: data.last_post[0] || null
      } as ForumThread;
    } catch (error) {
      console.error('Error in getThreadBySlug:', error);
      return null;
    }
  }

  /**
   * Create a new thread
   * @param userId User ID
   * @param categoryId Category ID
   * @param title Thread title
   * @param content Initial post content
   * @returns Created thread
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

      // Start a transaction
      const { data, error } = await supabase.rpc('create_forum_thread', {
        p_user_id: userId,
        p_category_id: categoryId,
        p_title: title,
        p_slug: slug,
        p_content: content
      });

      if (error) {
        console.error('Error creating thread:', error);
        return null;
      }

      // Award points for creating a thread
      await pointsService.awardPoints(
        userId,
        10,
        'Created a forum thread',
        'forum_thread_creation',
        data.thread_id
      );

      // Check forum posts achievement
      await achievementsService.checkAndAwardAchievements(
        userId,
        'forum_posts',
        1
      );

      // Get the created thread
      return this.getThreadById(data.thread_id);
    } catch (error) {
      console.error('Error in createThread:', error);
      return null;
    }
  }

  /**
   * Update a thread
   * @param threadId Thread ID
   * @param userId User ID (for permission check)
   * @param title New thread title
   * @returns Updated thread
   */
  async updateThread(
    threadId: string,
    userId: string,
    title: string
  ): Promise<ForumThread | null> {
    try {
      // Check if user is the thread author or an admin
      const thread = await this.getThreadById(threadId);
      if (!thread) {
        throw new Error('Thread not found');
      }

      if (thread.user_id !== userId) {
        // Check if user is an admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError || profile.role !== 'admin') {
          throw new Error('You do not have permission to update this thread');
        }
      }

      // Generate a new slug if the title changed
      let slug = thread.slug;
      if (title !== thread.title) {
        slug = this.generateSlug(title);
      }

      // Update the thread
      const { error } = await supabase
        .from('forum_threads')
        .update({
          title,
          slug,
          updated_at: new Date().toISOString()
        })
        .eq('id', threadId);

      if (error) {
        console.error('Error updating thread:', error);
        return null;
      }

      // Get the updated thread
      return this.getThreadById(threadId);
    } catch (error) {
      console.error('Error in updateThread:', error);
      return null;
    }
  }

  /**
   * Delete a thread
   * @param threadId Thread ID
   * @param userId User ID (for permission check)
   * @returns Success status
   */
  async deleteThread(threadId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is the thread author or an admin
      const thread = await this.getThreadById(threadId);
      if (!thread) {
        throw new Error('Thread not found');
      }

      if (thread.user_id !== userId) {
        // Check if user is an admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError || profile.role !== 'admin') {
          throw new Error('You do not have permission to delete this thread');
        }
      }

      // Delete the thread
      const { error } = await supabase
        .from('forum_threads')
        .delete()
        .eq('id', threadId);

      if (error) {
        console.error('Error deleting thread:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteThread:', error);
      return false;
    }
  }

  /**
   * Get posts in a thread
   * @param threadId Thread ID
   * @param page Page number
   * @param limit Number of posts per page
   * @returns List of posts
   */
  async getPostsByThread(
    threadId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<ForumPost[]> {
    try {
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_user_id_fkey(id, first_name, last_name, avatar_url, user_type),
          reactions:forum_reactions(*),
          reply_count:forum_posts!forum_posts_parent_id_fkey(count)
        `)
        .eq('thread_id', threadId)
        .eq('status', 'published')
        .is('parent_id', null) // Only get top-level posts
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching posts by thread:', error);
        return [];
      }

      // Transform the reply_count
      return data.map(post => ({
        ...post,
        reply_count: post.reply_count[0]?.count || 0
      })) as ForumPost[];
    } catch (error) {
      console.error('Error in getPostsByThread:', error);
      return [];
    }
  }

  /**
   * Get replies to a post
   * @param postId Parent post ID
   * @returns List of reply posts
   */
  async getRepliesByPost(postId: string): Promise<ForumPost[]> {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_user_id_fkey(id, first_name, last_name, avatar_url, user_type),
          reactions:forum_reactions(*)
        `)
        .eq('parent_id', postId)
        .eq('status', 'published')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies by post:', error);
        return [];
      }

      return data as ForumPost[];
    } catch (error) {
      console.error('Error in getRepliesByPost:', error);
      return [];
    }
  }

  /**
   * Create a new post
   * @param userId User ID
   * @param threadId Thread ID
   * @param content Post content
   * @param parentId Parent post ID (for replies)
   * @returns Created post
   */
  async createPost(
    userId: string,
    threadId: string,
    content: string,
    parentId?: string
  ): Promise<ForumPost | null> {
    try {
      // Create the post
      const { data, error } = await supabase
        .from('forum_posts')
        .insert([
          {
            thread_id: threadId,
            user_id: userId,
            content,
            status: 'published',
            parent_id: parentId
          }
        ])
        .select(`
          *,
          author:profiles!forum_posts_user_id_fkey(id, first_name, last_name, avatar_url, user_type)
        `)
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return null;
      }

      // Update the thread's last_post_at
      await supabase
        .from('forum_threads')
        .update({
          last_post_at: new Date().toISOString(),
          post_count: supabase.rpc('increment_counter', { row_id: threadId, table_name: 'forum_threads', counter_name: 'post_count' })
        })
        .eq('id', threadId);

      // Award points for creating a post
      await pointsService.awardPoints(
        userId,
        5,
        'Created a forum post',
        'forum_post_creation',
        data.id
      );

      // Check forum posts achievement
      await achievementsService.checkAndAwardAchievements(
        userId,
        'forum_posts',
        1
      );

      return data as ForumPost;
    } catch (error) {
      console.error('Error in createPost:', error);
      return null;
    }
  }

  /**
   * Update a post
   * @param postId Post ID
   * @param userId User ID (for permission check)
   * @param content New post content
   * @returns Updated post
   */
  async updatePost(
    postId: string,
    userId: string,
    content: string
  ): Promise<ForumPost | null> {
    try {
      // Check if user is the post author or an admin
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        console.error('Error fetching post:', postError);
        return null;
      }

      if (post.user_id !== userId) {
        // Check if user is an admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError || profile.role !== 'admin') {
          throw new Error('You do not have permission to update this post');
        }
      }

      // Update the post
      const { data, error } = await supabase
        .from('forum_posts')
        .update({
          content,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .select(`
          *,
          author:profiles!forum_posts_user_id_fkey(id, first_name, last_name, avatar_url, user_type),
          reactions:forum_reactions(*)
        `)
        .single();

      if (error) {
        console.error('Error updating post:', error);
        return null;
      }

      return data as ForumPost;
    } catch (error) {
      console.error('Error in updatePost:', error);
      return null;
    }
  }

  /**
   * Delete a post
   * @param postId Post ID
   * @param userId User ID (for permission check)
   * @returns Success status
   */
  async deletePost(postId: string, userId: string): Promise<boolean> {
    try {
      // Check if user is the post author or an admin
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError || !post) {
        console.error('Error fetching post:', postError);
        return false;
      }

      if (post.user_id !== userId) {
        // Check if user is an admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError || profile.role !== 'admin') {
          throw new Error('You do not have permission to delete this post');
        }
      }

      // Delete the post
      const { error } = await supabase
        .from('forum_posts')
        .update({
          status: 'deleted',
          content: '[This post has been deleted]',
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deletePost:', error);
      return false;
    }
  }

  /**
   * Add a reaction to a post
   * @param userId User ID
   * @param postId Post ID
   * @param reactionType Reaction type
   * @returns Created reaction
   */
  async addReaction(
    userId: string,
    postId: string,
    reactionType: string
  ): Promise<ForumReaction | null> {
    try {
      // Check if user already reacted with this type
      const { data: existingReaction, error: existingError } = await supabase
        .from('forum_reactions')
        .select('*')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('reaction_type', reactionType)
        .single();

      if (!existingError && existingReaction) {
        // User already reacted with this type, remove the reaction
        await supabase
          .from('forum_reactions')
          .delete()
          .eq('id', existingReaction.id);
        return null;
      }

      // Create the reaction
      const { data, error } = await supabase
        .from('forum_reactions')
        .insert([
          {
            post_id: postId,
            user_id: userId,
            reaction_type: reactionType
          }
        ])
        .select(`
          *,
          user:profiles!forum_reactions_user_id_fkey(id, first_name, last_name, avatar_url)
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
   * Remove a reaction from a post
   * @param userId User ID
   * @param postId Post ID
   * @param reactionType Reaction type
   * @returns Success status
   */
  async removeReaction(
    userId: string,
    postId: string,
    reactionType: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('forum_reactions')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', postId)
        .eq('reaction_type', reactionType);

      if (error) {
        console.error('Error removing reaction:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in removeReaction:', error);
      return false;
    }
  }

  /**
   * Mark a post as a solution
   * @param threadId Thread ID
   * @param postId Post ID
   * @param userId User ID (for permission check)
   * @returns Success status
   */
  async markAsSolution(
    threadId: string,
    postId: string,
    userId: string
  ): Promise<boolean> {
    try {
      // Check if user is the thread author or an admin
      const thread = await this.getThreadById(threadId);
      if (!thread) {
        throw new Error('Thread not found');
      }

      if (thread.user_id !== userId) {
        // Check if user is an admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError || profile.role !== 'admin') {
          throw new Error('You do not have permission to mark a solution');
        }
      }

      // First, unmark any existing solutions
      await supabase
        .from('forum_posts')
        .update({ is_solution: false })
        .eq('thread_id', threadId)
        .eq('is_solution', true);

      // Mark the post as a solution
      const { error } = await supabase
        .from('forum_posts')
        .update({ is_solution: true })
        .eq('id', postId);

      if (error) {
        console.error('Error marking post as solution:', error);
        return false;
      }

      // Get the post author
      const { data: post, error: postError } = await supabase
        .from('forum_posts')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (!postError && post) {
        // Award points to the post author
        await pointsService.awardPoints(
          post.user_id,
          15,
          'Your post was marked as a solution',
          'forum_solution',
          postId
        );

        // Check solution achievements
        await achievementsService.checkAndAwardAchievements(
          post.user_id,
          'forum_solutions',
          1
        );
      }

      return true;
    } catch (error) {
      console.error('Error in markAsSolution:', error);
      return false;
    }
  }

  /**
   * Get forum statistics
   * @returns Forum statistics
   */
  async getForumStats(): Promise<ForumStats> {
    try {
      const { data, error } = await supabase.rpc('get_forum_stats');

      if (error) {
        console.error('Error fetching forum stats:', error);
        return {
          total_categories: 0,
          total_threads: 0,
          total_posts: 0,
          total_users: 0
        };
      }

      return data as ForumStats;
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
   * Get user forum statistics
   * @param userId User ID
   * @returns User forum statistics
   */
  async getUserForumStats(userId: string): Promise<ForumUserStats> {
    try {
      const { data, error } = await supabase.rpc('get_user_forum_stats', {
        p_user_id: userId
      });

      if (error) {
        console.error('Error fetching user forum stats:', error);
        return {
          post_count: 0,
          thread_count: 0,
          reaction_count: 0,
          solution_count: 0,
          join_date: new Date().toISOString(),
          reputation: 0
        };
      }

      return data as ForumUserStats;
    } catch (error) {
      console.error('Error in getUserForumStats:', error);
      return {
        post_count: 0,
        thread_count: 0,
        reaction_count: 0,
        solution_count: 0,
        join_date: new Date().toISOString(),
        reputation: 0
      };
    }
  }

  /**
   * Search forum threads and posts
   * @param query Search query
   * @param page Page number
   * @param limit Number of results per page
   * @returns Search results
   */
  async searchForum(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ threads: ForumThread[]; posts: ForumPost[] }> {
    try {
      const offset = (page - 1) * limit;

      // Search threads
      const { data: threadData, error: threadError } = await supabase
        .from('forum_threads')
        .select(`
          *,
          category:forum_categories(*),
          author:profiles!forum_threads_user_id_fkey(id, first_name, last_name, avatar_url, user_type)
        `)
        .ilike('title', `%${query}%`)
        .range(offset, offset + limit - 1);

      if (threadError) {
        console.error('Error searching threads:', threadError);
        return { threads: [], posts: [] };
      }

      // Search posts
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          author:profiles!forum_posts_user_id_fkey(id, first_name, last_name, avatar_url, user_type),
          thread:forum_threads(id, title, slug)
        `)
        .ilike('content', `%${query}%`)
        .eq('status', 'published')
        .range(offset, offset + limit - 1);

      if (postError) {
        console.error('Error searching posts:', postError);
        return { threads: threadData as ForumThread[], posts: [] };
      }

      return {
        threads: threadData as ForumThread[],
        posts: postData as ForumPost[]
      };
    } catch (error) {
      console.error('Error in searchForum:', error);
      return { threads: [], posts: [] };
    }
  }

  /**
   * Generate a slug from a string
   * @param text Text to slugify
   * @returns Slugified text
   */
  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-')
      .concat('-', Math.floor(Math.random() * 1000).toString());
  }
}

// Create a singleton instance
export const forumService = new ForumService();
