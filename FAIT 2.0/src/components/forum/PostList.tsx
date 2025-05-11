import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  ThumbsUp,
  MessageSquare,
  Award,
  Flag,
  MoreHorizontal,
  Check,
  Edit,
  Trash,
  AlertTriangle
} from 'lucide-react';
import { ForumPost, ForumThread } from '../../types/forum';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { forumService } from '../../services/ForumService';
import NestedReplies from './NestedReplies';
import ReportPostModal from './ReportPostModal';
import Pagination from '../common/Pagination';
import { forumReportService } from '../../services/ForumReportService';

interface PostListProps {
  posts: ForumPost[];
  thread: ForumThread;
  isLoading: boolean;
  totalPosts: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onReplyToPost: (post: ForumPost) => void;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  thread,
  isLoading,
  totalPosts,
  currentPage,
  onPageChange,
  pageSize,
  onReplyToPost
}) => {
  const { user, isAdmin } = useAuth();
  const [reactionLoading, setReactionLoading] = useState<Record<string, boolean>>({});
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportingPostId, setReportingPostId] = useState<string | null>(null);
  const [menuOpenForPost, setMenuOpenForPost] = useState<string | null>(null);
  const totalPages = Math.ceil(totalPosts / pageSize);

  const handleReaction = async (postId: string, reactionType: string) => {
    if (!user) return;

    setReactionLoading({ ...reactionLoading, [postId]: true });
    try {
      await forumService.addReaction(user.id, postId, reactionType);
      // The UI will be updated when the post list is refreshed
    } catch (error) {
      console.error('Error adding reaction:', error);
    } finally {
      setReactionLoading({ ...reactionLoading, [postId]: false });
    }
  };

  const handleMarkAsSolution = async (postId: string) => {
    if (!user || !thread) return;

    try {
      await forumService.markAsSolution(postId, thread.id);
      // The UI will be updated when the post list is refreshed
    } catch (error) {
      console.error('Error marking as solution:', error);
    }
  };

  const handleReportPost = (postId: string) => {
    setReportingPostId(postId);
    setReportModalOpen(true);
  };

  const handleSubmitReport = async (reason: string, details: string) => {
    if (!user || !reportingPostId) return;

    try {
      await forumReportService.reportPost(
        user.id,
        reportingPostId,
        reason,
        details
      );

      // Close modal and reset state
      setReportModalOpen(false);
      setReportingPostId(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  };

  const togglePostMenu = (postId: string) => {
    if (menuOpenForPost === postId) {
      setMenuOpenForPost(null);
    } else {
      setMenuOpenForPost(postId);
    }
  };

  const handleReply = async (content: string, parentId: string) => {
    if (!user || !thread) return;

    try {
      await forumService.createPost(user.id, thread.id, content, parentId);
      // The UI will be updated when the post list is refreshed
    } catch (error) {
      console.error('Error replying to post:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6">
            <div className="flex">
              <div className="mr-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
        <div className="mt-1 text-sm text-gray-500">
          Started by {thread.author?.full_name || 'Unknown'} • {formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}
        </div>
      </div>

      <div className="space-y-6">
        {posts.filter(post => !post.parent_id).map((post) => {
          const isOriginalPost = post.id === posts[0]?.id;
          const userHasReacted = post.reactions?.some(r => r.user_id === user?.id);
          const reactionCount = post.reactions?.length || 0;

          return (
            <motion.div
              key={post.id}
              id={`post-${post.id}`}
              className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                post.is_solution ? 'border-2 border-green-500' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <div className="flex">
                  <div className="mr-4">
                    {post.author?.avatar_url ? (
                      <img
                        src={post.author.avatar_url}
                        alt={post.author.full_name}
                        className="h-10 w-10 rounded-full"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {post.author?.full_name || 'Unknown'}
                          {post.author?.id === thread.user_id && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Author
                            </span>
                          )}
                          {post.is_solution && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Solution
                            </span>
                          )}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => togglePostMenu(post.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="More options"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>

                        {menuOpenForPost === post.id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu" aria-orientation="vertical">
                              {user?.id === post.author?.id && (
                                <>
                                  <button
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                    role="menuitem"
                                  >
                                    <Edit className="mr-3 h-4 w-4 text-gray-500" />
                                    Edit Post
                                  </button>
                                  <button
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-gray-100 w-full text-left"
                                    role="menuitem"
                                  >
                                    <Trash className="mr-3 h-4 w-4 text-red-500" />
                                    Delete Post
                                  </button>
                                </>
                              )}

                              {(user?.id === thread.user_id || isAdmin) && !post.is_solution && !isOriginalPost && (
                                <button
                                  onClick={() => {
                                    setMenuOpenForPost(null);
                                    handleMarkAsSolution(post.id);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Award className="mr-3 h-4 w-4 text-green-500" />
                                  Mark as Solution
                                </button>
                              )}

                              {user && user.id !== post.author?.id && (
                                <button
                                  onClick={() => {
                                    setMenuOpenForPost(null);
                                    handleReportPost(post.id);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <Flag className="mr-3 h-4 w-4 text-gray-500" />
                                  Report Post
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div
                      className="mt-2 prose prose-sm max-w-none text-gray-900"
                      dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
                    />

                    <div className="mt-4 flex items-center space-x-4">
                      <button
                        onClick={() => handleReaction(post.id, 'like')}
                        disabled={reactionLoading[post.id]}
                        className={`flex items-center text-sm ${
                          userHasReacted
                            ? 'text-blue-600 font-medium'
                            : 'text-gray-500 hover:text-blue-600'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span>{reactionCount > 0 ? reactionCount : ''} Like</span>
                      </button>

                      <button
                        onClick={() => onReplyToPost(post)}
                        className="flex items-center text-sm text-gray-500 hover:text-blue-600"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>Reply</span>
                      </button>

                      {user && user.id !== post.author?.id && (
                        <button
                          onClick={() => handleReportPost(post.id)}
                          className="flex items-center text-sm text-gray-500 hover:text-red-600"
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          <span>Report</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Nested replies */}
              <NestedReplies
                posts={posts}
                parentId={post.id}
                onReply={handleReply}
                onReaction={handleReaction}
                onReport={handleReportPost}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalPosts}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      )}

      {/* Report Modal */}
      <ReportPostModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleSubmitReport}
        postId={reportingPostId || ''}
      />
    </div>
  );
};

export default PostList;
