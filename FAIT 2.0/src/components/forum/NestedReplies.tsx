import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, ThumbsUp, Flag, CornerDownRight } from 'lucide-react';
import { ForumPost } from '../../types/forum';
import { useAuth } from '../../contexts/AuthContext';
import PostEditor from './PostEditor';
import { formatDistanceToNow } from 'date-fns';

interface NestedRepliesProps {
  posts: ForumPost[];
  parentId: string;
  onReply: (content: string, parentId: string) => Promise<void>;
  onReaction: (postId: string, reactionType: string) => Promise<void>;
  onReport?: (postId: string) => void;
  level?: number;
  maxLevel?: number;
}

const NestedReplies: React.FC<NestedRepliesProps> = ({
  posts,
  parentId,
  onReply,
  onReaction,
  onReport,
  level = 0,
  maxLevel = 3
}) => {
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  // Filter posts that are direct replies to the parent
  const replies = posts.filter(post => post.parent_id === parentId);
  
  if (replies.length === 0) {
    return null;
  }
  
  const handleReply = async (content: string) => {
    if (!replyingTo) return;
    
    try {
      await onReply(content, replyingTo);
      setReplyingTo(null);
    } catch (error) {
      console.error('Error replying to post:', error);
    }
  };
  
  const handleCancelReply = () => {
    setReplyingTo(null);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <div className={`pl-${level > 0 ? 6 : 0}`}>
      {replies.map((reply) => (
        <motion.div 
          key={reply.id}
          className={`mt-4 ${level > 0 ? 'border-l-2 border-gray-200 pl-4' : ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {reply.author?.avatar_url ? (
                  <img 
                    src={reply.author.avatar_url} 
                    alt={reply.author.full_name || 'User'} 
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-800 font-medium">
                      {reply.author?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {reply.author?.full_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(reply.created_at)}
                  </p>
                </div>
                
                <div 
                  className="mt-1 text-sm text-gray-700 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: reply.content.replace(/\n/g, '<br />') }}
                />
                
                <div className="mt-2 flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => onReaction(reply.id, 'like')}
                    className="flex items-center text-xs text-gray-500 hover:text-blue-600"
                  >
                    <ThumbsUp size={14} className="mr-1" />
                    {reply.reactions?.filter(r => r.reaction_type === 'like').length || 0}
                  </button>
                  
                  {user && (
                    <button
                      type="button"
                      onClick={() => setReplyingTo(reply.id)}
                      className="flex items-center text-xs text-gray-500 hover:text-blue-600"
                    >
                      <MessageCircle size={14} className="mr-1" />
                      Reply
                    </button>
                  )}
                  
                  {user && onReport && (
                    <button
                      type="button"
                      onClick={() => onReport(reply.id)}
                      className="flex items-center text-xs text-gray-500 hover:text-red-600"
                    >
                      <Flag size={14} className="mr-1" />
                      Report
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {replyingTo === reply.id && (
              <div className="mt-3 pl-12">
                <PostEditor
                  onSubmit={handleReply}
                  submitLabel="Reply"
                  isReply={true}
                  replyingTo={reply.author?.full_name || 'this post'}
                  onCancelReply={handleCancelReply}
                  minHeight={100}
                />
              </div>
            )}
            
            {/* Render nested replies if we haven't reached max level */}
            {level < maxLevel && (
              <NestedReplies
                posts={posts}
                parentId={reply.id}
                onReply={onReply}
                onReaction={onReaction}
                onReport={onReport}
                level={level + 1}
                maxLevel={maxLevel}
              />
            )}
            
            {/* Show "View more replies" button if we've reached max level and there are replies */}
            {level === maxLevel && posts.some(post => post.parent_id === reply.id) && (
              <div className="mt-2 pl-6">
                <button
                  type="button"
                  className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                >
                  <CornerDownRight size={14} className="mr-1" />
                  View more replies
                </button>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default NestedReplies;
