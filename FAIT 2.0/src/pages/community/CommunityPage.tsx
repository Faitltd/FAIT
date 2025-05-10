import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  Users, 
  Award, 
  Bell, 
  Search,
  ThumbsUp,
  MessageCircle,
  Share2,
  User,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  comments: number;
  user: {
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

const CommunityPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discussions');
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (activeTab === 'discussions') {
      fetchPosts();
    }
  }, [activeTab]);
  
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch posts from Supabase
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          user:user_id(first_name, last_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setPosts(data as Post[]);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setError(err.message || 'Failed to load community posts');
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredPosts = posts.filter(post => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      post.title.toLowerCase().includes(searchLower) ||
      post.content.toLowerCase().includes(searchLower) ||
      `${post.user.first_name} ${post.user.last_name}`.toLowerCase().includes(searchLower)
    );
  });
  
  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      // Check if user already liked the post
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (existingLike) {
        // Unlike the post
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
          
        // Decrement likes count
        await supabase
          .from('community_posts')
          .update({ likes: posts.find(p => p.id === postId)?.likes - 1 || 0 })
          .eq('id', postId);
      } else {
        // Like the post
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });
          
        // Increment likes count
        await supabase
          .from('community_posts')
          .update({ likes: posts.find(p => p.id === postId)?.likes + 1 || 1 })
          .eq('id', postId);
      }
      
      // Refresh posts
      fetchPosts();
    } catch (err: any) {
      console.error('Error liking post:', err);
    }
  };
  
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-semibold text-gray-900">Community</h1>
        <p className="mt-1 text-sm text-gray-600">
          Connect with other members, share ideas, and stay updated.
        </p>
      </motion.div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'discussions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Discussions
            </button>
            
            <button
              onClick={() => setActiveTab('members')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'members'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Members
            </button>
            
            <button
              onClick={() => setActiveTab('badges')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'badges'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Award className="h-4 w-4 inline mr-1" />
              Badges & Rewards
            </button>
            
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'notifications'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-4 w-4 inline mr-1" />
              Notifications
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'discussions' && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search discussions..."
                  />
                </div>
                
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <MessageSquare className="h-5 w-5 mr-1" />
                  New Discussion
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions found</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {searchQuery
                      ? 'No discussions match your search criteria. Try a different search term.'
                      : 'Be the first to start a discussion in the community!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center mb-4">
                          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {post.user.avatar_url ? (
                              <img src={post.user.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                              <User className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {post.user.first_name} {post.user.last_name}
                            </p>
                            <div className="flex items-center text-xs text-gray-500">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>
                                {new Date(post.created_at).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-700 mb-4">{post.content}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className="flex items-center hover:text-blue-600"
                          >
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            <span>{post.likes}</span>
                          </button>
                          
                          <button className="flex items-center hover:text-blue-600">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            <span>{post.comments}</span>
                          </button>
                          
                          <button className="flex items-center hover:text-blue-600">
                            <Share2 className="h-4 w-4 mr-1" />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'members' && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Community Members</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This feature is coming soon. You'll be able to connect with other members of the FAIT platform.
              </p>
            </div>
          )}
          
          {activeTab === 'badges' && (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Badges & Rewards</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This feature is coming soon. Earn badges and rewards for your contributions to the community.
              </p>
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This feature is coming soon. Stay updated with notifications about community activity.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
