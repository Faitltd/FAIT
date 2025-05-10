import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ForumThread, ForumPost } from '../../types/forum';
import { forumService } from '../../services/ForumService';
import PostList from '../../components/forum/PostList';
import PostEditor from '../../components/forum/PostEditor';
import { useAuth } from '../../contexts/AuthContext';

const ThreadPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const replyEditorRef = useRef<HTMLDivElement>(null);
  
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingToPost, setReplyingToPost] = useState<ForumPost | null>(null);
  const pageSize = 10;

  useEffect(() => {
    if (slug) {
      fetchThread();
    }
  }, [slug]);

  useEffect(() => {
    if (thread) {
      fetchPosts();
    }
  }, [thread, currentPage]);

  const fetchThread = async () => {
    if (!slug) return;
    
    setIsLoading(true);
    try {
      const data = await forumService.getThreadBySlug(slug);
      if (data) {
        setThread(data);
        setError(null);
      } else {
        setError('Thread not found');
      }
    } catch (err) {
      console.error('Error fetching thread:', err);
      setError('Failed to load thread');
    }
  };

  const fetchPosts = async () => {
    if (!thread) return;
    
    setIsLoading(true);
    try {
      const { posts, total } = await forumService.getPostsByThread(
        thread.id,
        currentPage,
        pageSize
      );
      setPosts(posts);
      setTotalPosts(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const handleReplyToPost = (post: ForumPost) => {
    setReplyingToPost(post);
    
    // Scroll to reply editor
    setTimeout(() => {
      replyEditorRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleCancelReply = () => {
    setReplyingToPost(null);
  };

  const handleSubmitReply = async (content: string) => {
    if (!user || !thread) return;
    
    try {
      const parentId = replyingToPost ? replyingToPost.id : undefined;
      const post = await forumService.createPost(user.id, thread.id, content, parentId);
      
      if (post) {
        // Refresh posts
        fetchPosts();
        
        // Clear reply state
        setReplyingToPost(null);
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      throw err;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link
          to="/forum"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        {thread?.category && (
          <Link
            to={`/forum/category/${thread.category.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to {thread.category.name}
          </Link>
        )}
      </div>
      
      {thread && (
        <>
          <PostList
            posts={posts}
            thread={thread}
            isLoading={isLoading}
            totalPosts={totalPosts}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onReplyToPost={handleReplyToPost}
          />
          
          {!thread.is_locked && user && (
            <div ref={replyEditorRef} className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {replyingToPost ? `Reply to ${replyingToPost.author?.full_name || 'post'}` : 'Post a Reply'}
              </h3>
              <PostEditor
                onSubmit={handleSubmitReply}
                submitLabel="Post Reply"
                isReply={!!replyingToPost}
                replyingTo={replyingToPost?.author?.full_name}
                onCancelReply={replyingToPost ? handleCancelReply : undefined}
              />
            </div>
          )}
          
          {thread.is_locked && (
            <div className="mt-8 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
              This thread is locked. New replies are not allowed.
            </div>
          )}
          
          {!user && (
            <div className="mt-8 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
              Please <Link to="/login" className="font-medium underline">log in</Link> to post a reply.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ThreadPage;
