import React, { useState } from 'react';
import { ForumPost } from '../../../types/forum.types';
import { useAuth } from '../../../contexts/AuthContext';
import { forumService } from '../../../services/ForumService';

interface PostItemProps {
  post: ForumPost;
  isThreadAuthor?: boolean;
  onReply?: () => void;
  onToggleReplies?: () => void;
  onMarkSolution?: () => void;
  showReplies?: boolean;
  isReplying?: boolean;
  className?: string;
}

/**
 * Component to display a forum post
 */
const PostItem: React.FC<PostItemProps> = ({ 
  post,
  isThreadAuthor = false,
  onReply,
  onToggleReplies,
  onMarkSolution,
  showReplies = false,
  isReplying = false,
  className = ''
}) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState(post.reactions || []);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle reaction
  const handleReaction = async (reactionType: string) => {
    if (!user) return;
    
    try {
      // Check if user already reacted with this type
      const existingReaction = reactions.find(
        r => r.user_id === user.id && r.reaction_type === reactionType
      );
      
      if (existingReaction) {
        // Remove reaction
        await forumService.removeReaction(user.id, post.id, reactionType);
        setReactions(reactions.filter(r => r.id !== existingReaction.id));
      } else {
        // Add reaction
        const newReaction = await forumService.addReaction(user.id, post.id, reactionType);
        if (newReaction) {
          setReactions([...reactions.filter(r => !(r.user_id === user.id && r.reaction_type === reactionType)), newReaction]);
        }
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  // Count reactions by type
  const getReactionCount = (type: string) => {
    return reactions.filter(r => r.reaction_type === type).length;
  };

  // Check if user reacted with a specific type
  const hasUserReacted = (type: string) => {
    return reactions.some(r => r.user_id === user?.id && r.reaction_type === type);
  };

  return (
    <div className={`px-4 py-4 sm:px-6 ${post.is_solution ? 'bg-green-50' : ''} ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0 mr-4">
          {post.author?.avatar_url ? (
            <img
              className="h-10 w-10 rounded-full"
              src={post.author.avatar_url}
              alt={`${post.author.first_name} ${post.author.last_name}`}
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-500">
                {post.author?.first_name?.[0] || ''}
                {post.author?.last_name?.[0] || ''}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                {post.author?.first_name} {post.author?.last_name}
                {post.author?.user_type === 'service_agent' && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Service Agent
                  </span>
                )}
                {post.is_solution && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Solution
                  </span>
                )}
              </h4>
              <p className="text-xs text-gray-500">
                {formatDate(post.created_at)}
                {post.created_at !== post.updated_at && ' (edited)'}
              </p>
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-700 whitespace-pre-line">
            {post.content}
          </div>
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleReaction('like')}
                className={`inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 ${
                  hasUserReacted('like') ? 'bg-blue-50' : 'bg-white'
                } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <svg className="-ml-0.5 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                </svg>
                {getReactionCount('like') > 0 && getReactionCount('like')}
              </button>
              
              <button
                type="button"
                onClick={() => handleReaction('thanks')}
                className={`inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 ${
                  hasUserReacted('thanks') ? 'bg-yellow-50' : 'bg-white'
                } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <svg className="-ml-0.5 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
                </svg>
                {getReactionCount('thanks') > 0 && getReactionCount('thanks')}
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {onReply && (
                <button
                  type="button"
                  onClick={onReply}
                  className={`inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 ${
                    isReplying ? 'bg-gray-100' : 'bg-white'
                  } hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                  <svg className="-ml-0.5 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Reply
                </button>
              )}
              
              {post.reply_count && post.reply_count > 0 && onToggleReplies && (
                <button
                  type="button"
                  onClick={onToggleReplies}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {showReplies ? (
                    <svg className="-ml-0.5 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="-ml-0.5 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  {post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}
                </button>
              )}
              
              {isThreadAuthor && !post.is_solution && onMarkSolution && (
                <button
                  type="button"
                  onClick={onMarkSolution}
                  className="inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="-ml-0.5 mr-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Mark as Solution
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostItem;
