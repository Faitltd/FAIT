import React, { useState } from 'react';
import { ForumPost, ForumThread } from '../../../types/forum.types';
import { useAuth } from '../../../contexts/AuthContext';
import { forumService } from '../../../services/ForumService';
import PostItem from './PostItem';
import ReplyForm from './ReplyForm';

interface PostListProps {
  thread: ForumThread;
  posts: ForumPost[];
  onPostCreated?: () => void;
  className?: string;
}

/**
 * Component to display a list of forum posts
 */
const PostList: React.FC<PostListProps> = ({ 
  thread,
  posts,
  onPostCreated,
  className = ''
}) => {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  const handleReply = (postId: string) => {
    if (!user) return;
    setReplyingTo(postId === replyingTo ? null : postId);
  };

  const handleToggleReplies = (postId: string) => {
    setShowReplies(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCreateReply = async (content: string, parentId: string) => {
    if (!user) return;
    
    try {
      await forumService.createPost(
        user.id,
        thread.id,
        content,
        parentId
      );
      
      setReplyingTo(null);
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  const handleMarkSolution = async (postId: string) => {
    if (!user) return;
    
    try {
      await forumService.markAsSolution(
        thread.id,
        postId,
        user.id
      );
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error marking solution:', error);
    }
  };

  if (posts.length === 0) {
    return (
      <div className={`bg-white shadow overflow-hidden sm:rounded-md ${className}`}>
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Be the first to reply to this thread.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{thread.title}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {posts.length} {posts.length === 1 ? 'post' : 'posts'} in this thread
        </p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {posts.map((post) => (
            <li key={post.id}>
              <PostItem 
                post={post} 
                isThreadAuthor={thread.user_id === user?.id}
                onReply={() => handleReply(post.id)}
                onToggleReplies={() => handleToggleReplies(post.id)}
                onMarkSolution={() => handleMarkSolution(post.id)}
                showReplies={!!showReplies[post.id]}
                isReplying={replyingTo === post.id}
              />
              
              {replyingTo === post.id && (
                <div className="px-4 py-4 sm:px-6 pl-16">
                  <ReplyForm 
                    onSubmit={(content) => handleCreateReply(content, post.id)}
                    onCancel={() => setReplyingTo(null)}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PostList;
