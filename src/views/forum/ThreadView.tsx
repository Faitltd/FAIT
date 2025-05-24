import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForum } from '../../modules/forum/hooks/useForum';
import PostList from '../../modules/forum/components/PostList';
import ReplyForm from '../../modules/forum/components/ReplyForm';
import { useAuth } from '../../contexts/AuthContext';

/**
 * View for a forum thread
 */
const ThreadView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getThreadBySlug, getPostsByThread, createPost } = useForum();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [thread, setThread] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const limit = 50;

  // Fetch thread and posts
  const fetchData = async () => {
    if (!slug) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get thread
      const threadData = await getThreadBySlug(slug);
      if (!threadData) {
        setError('Thread not found');
        setIsLoading(false);
        return;
      }
      
      setThread(threadData);
      
      // Get posts
      const postsData = await getPostsByThread(threadData.id, page, limit);
      setPosts(postsData);
      setHasMore(postsData.length === limit);
    } catch (err: any) {
      console.error('Error fetching thread data:', err);
      setError(err.message || 'Failed to load thread data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [slug, page]);

  // Load more posts
  const handleLoadMore = () => {
    setPage(page + 1);
  };

  // Go back to category
  const handleGoBack = () => {
    if (thread?.category) {
      navigate(`/forum/category/${thread.category.slug}`);
    } else {
      navigate('/forum');
    }
  };

  // Handle reply submission
  const handleSubmitReply = async (content: string) => {
    if (!user || !thread) return;
    
    setIsSubmitting(true);
    
    try {
      await createPost(thread.id, content);
      // Refresh posts
      fetchData();
    } catch (err: any) {
      console.error('Error creating reply:', err);
      setError(err.message || 'Failed to create reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-4 inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
              <div>
                <h1 className="text-3xl font-bold leading-tight text-gray-900">
                  {isLoading ? 'Loading...' : thread?.title || 'Thread'}
                </h1>
                {thread?.category && (
                  <p className="mt-1 text-sm text-gray-500">
                    in {thread.category.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error loading thread</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="space-y-6 py-6">
                {/* Posts */}
                {thread && (
                  <PostList 
                    thread={thread} 
                    posts={posts} 
                    onPostCreated={fetchData}
                  />
                )}
                
                {/* Pagination */}
                {hasMore && (
                  <div className="flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Load More
                    </button>
                  </div>
                )}
                
                {/* Reply form */}
                {thread && !thread.is_locked && (
                  <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Post a Reply</h3>
                      <div className="mt-5">
                        <ReplyForm 
                          onSubmit={handleSubmitReply}
                          placeholder="Write your reply..."
                          buttonText={isSubmitting ? 'Posting...' : 'Post Reply'}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Thread locked message */}
                {thread && thread.is_locked && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          This thread is locked. No new replies can be posted.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ThreadView;
