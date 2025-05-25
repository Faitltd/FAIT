import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { forumService } from '../../../services/ForumService';
import { 
  ForumCategory, 
  ForumThread, 
  ForumPost, 
  ForumStats,
  ForumUserStats
} from '../../../types/forum.types';

/**
 * Hook for accessing forum functionality
 */
export const useForum = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [stats, setStats] = useState<ForumStats>({
    total_categories: 0,
    total_threads: 0,
    total_posts: 0,
    total_users: 0
  });
  const [userStats, setUserStats] = useState<ForumUserStats | null>(null);

  // Fetch forum data
  const fetchForumData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get categories
      const categoriesData = await forumService.getCategories();
      setCategories(categoriesData);
      
      // Get forum stats
      const statsData = await forumService.getForumStats();
      setStats(statsData);
      
      // Get user stats if logged in
      if (user) {
        const userStatsData = await forumService.getUserForumStats(user.id);
        setUserStats(userStatsData);
      }
    } catch (err: any) {
      console.error('Error fetching forum data:', err);
      setError(err.message || 'Failed to load forum data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch forum data on mount
  useEffect(() => {
    fetchForumData();
  }, [user]);

  // Get a category by slug
  const getCategoryBySlug = async (slug: string) => {
    try {
      return await forumService.getCategoryBySlug(slug);
    } catch (err) {
      console.error('Error getting category by slug:', err);
      return null;
    }
  };

  // Get threads in a category
  const getThreadsByCategory = async (categoryId: string, page: number = 1, limit: number = 20) => {
    try {
      return await forumService.getThreadsByCategory(categoryId, page, limit);
    } catch (err) {
      console.error('Error getting threads by category:', err);
      return [];
    }
  };

  // Get a thread by slug
  const getThreadBySlug = async (slug: string) => {
    try {
      return await forumService.getThreadBySlug(slug);
    } catch (err) {
      console.error('Error getting thread by slug:', err);
      return null;
    }
  };

  // Get posts in a thread
  const getPostsByThread = async (threadId: string, page: number = 1, limit: number = 20) => {
    try {
      return await forumService.getPostsByThread(threadId, page, limit);
    } catch (err) {
      console.error('Error getting posts by thread:', err);
      return [];
    }
  };

  // Create a new thread
  const createThread = async (categoryId: string, title: string, content: string) => {
    if (!user) {
      throw new Error('You must be logged in to create a thread');
    }
    
    try {
      return await forumService.createThread(user.id, categoryId, title, content);
    } catch (err) {
      console.error('Error creating thread:', err);
      throw err;
    }
  };

  // Create a new post
  const createPost = async (threadId: string, content: string, parentId?: string) => {
    if (!user) {
      throw new Error('You must be logged in to create a post');
    }
    
    try {
      return await forumService.createPost(user.id, threadId, content, parentId);
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  };

  // Add a reaction to a post
  const addReaction = async (postId: string, reactionType: string) => {
    if (!user) {
      throw new Error('You must be logged in to react to a post');
    }
    
    try {
      return await forumService.addReaction(user.id, postId, reactionType);
    } catch (err) {
      console.error('Error adding reaction:', err);
      throw err;
    }
  };

  // Mark a post as a solution
  const markAsSolution = async (threadId: string, postId: string) => {
    if (!user) {
      throw new Error('You must be logged in to mark a solution');
    }
    
    try {
      return await forumService.markAsSolution(threadId, postId, user.id);
    } catch (err) {
      console.error('Error marking solution:', err);
      throw err;
    }
  };

  // Search forum
  const searchForum = async (query: string, page: number = 1, limit: number = 20) => {
    try {
      return await forumService.searchForum(query, page, limit);
    } catch (err) {
      console.error('Error searching forum:', err);
      return { threads: [], posts: [] };
    }
  };

  // Refresh forum data
  const refreshForum = () => {
    fetchForumData();
  };

  return {
    isLoading,
    error,
    categories,
    stats,
    userStats,
    getCategoryBySlug,
    getThreadsByCategory,
    getThreadBySlug,
    getPostsByThread,
    createThread,
    createPost,
    addReaction,
    markAsSolution,
    searchForum,
    refreshForum
  };
};
