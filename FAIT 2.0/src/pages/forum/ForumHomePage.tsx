import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MessageSquare } from 'lucide-react';
import { ForumCategory, ForumStats, ForumUserStats } from '../../types/forum';
import { forumService } from '../../services/ForumService';
import ForumCategoryList from '../../components/forum/ForumCategoryList';
import ForumStatsComponent from '../../components/forum/ForumStats';
import { useAuth } from '../../contexts/AuthContext';

const ForumHomePage: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [forumStats, setForumStats] = useState<ForumStats>({
    total_categories: 0,
    total_threads: 0,
    total_posts: 0,
    total_users: 0
  });
  const [userStats, setUserStats] = useState<ForumUserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchForumStats();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await forumService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load forum categories');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchForumStats = async () => {
    try {
      const stats = await forumService.getForumStats();
      setForumStats(stats);
    } catch (err) {
      console.error('Error fetching forum stats:', err);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      const stats = await forumService.getUserForumStats(user.id);
      setUserStats(stats);
    } catch (err) {
      console.error('Error fetching user stats:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to search results page
    window.location.href = `/forum/search?q=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Forum</h1>
        <form onSubmit={handleSearch} className="relative w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search the forum..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </form>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Welcome to the FAIT Community Forum</h2>
            <p className="text-blue-700 mb-4">
              Connect with other contractors, clients, and service providers. Share knowledge, ask questions, and build relationships.
            </p>
            <div className="flex space-x-4">
              <Link
                to="/forum/guidelines"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Forum Guidelines
              </Link>
              <Link
                to="/forum/faq"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                FAQ
              </Link>
            </div>
          </div>
          
          <ForumCategoryList categories={categories} isLoading={isLoading} />
        </div>
        
        <div className="space-y-6">
          <ForumStatsComponent
            stats={forumStats}
            userStats={userStats}
            isLoading={isLoading}
          />
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link
                to="/forum/recent"
                className="flex items-center text-blue-600 hover:text-blue-800 py-2"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Recent Discussions
              </Link>
              <Link
                to="/forum/popular"
                className="flex items-center text-blue-600 hover:text-blue-800 py-2"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Popular Threads
              </Link>
              <Link
                to="/forum/unanswered"
                className="flex items-center text-blue-600 hover:text-blue-800 py-2"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Unanswered Questions
              </Link>
              {user && (
                <Link
                  to={`/forum/user/${user.id}`}
                  className="flex items-center text-blue-600 hover:text-blue-800 py-2"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  My Contributions
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumHomePage;
