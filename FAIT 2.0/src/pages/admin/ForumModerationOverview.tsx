import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Flag, 
  MessageSquare, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { forumReportService } from '../../services/ForumReportService';
import { forumService } from '../../services/ForumService';
import { formatDistanceToNow } from 'date-fns';

const ForumModerationOverview: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [forumStats, setForumStats] = useState({
    totalThreads: 0,
    totalPosts: 0,
    totalReports: 0,
    pendingReports: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch pending reports
      const reports = await forumReportService.getPendingReports(5);
      setPendingReports(reports);
      
      // Fetch forum stats
      const stats = await forumService.getForumStats();
      
      // Count total reports and pending reports
      const { data: reportCounts, error: reportsError } = await forumService.supabase
        .from('forum_post_reports')
        .select('status', { count: 'exact', head: false })
        .eq('status', 'pending');
        
      if (reportsError) throw reportsError;
      
      setForumStats({
        totalThreads: stats?.thread_count || 0,
        totalPosts: stats?.post_count || 0,
        totalReports: stats?.report_count || 0,
        pendingReports: reportCounts?.length || 0
      });
    } catch (err) {
      console.error('Error fetching forum moderation data:', err);
      setError('Failed to load forum moderation data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Forum Moderation Overview</h1>
          
          <button
            onClick={fetchData}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Threads</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : forumStats.totalThreads}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Posts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : forumStats.totalPosts}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                <Flag className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Reports</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : forumStats.totalReports}
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Reports</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {isLoading ? '...' : forumStats.pendingReports}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Recent Reports</h2>
              <Link
                to="/admin/forum/moderation"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : pendingReports.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No pending reports. All clear!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thread
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reported
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {report.reporter?.avatar_url ? (
                            <img
                              src={report.reporter.avatar_url}
                              alt={report.reporter.full_name}
                              className="h-8 w-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-600 font-medium">
                                {report.reporter?.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {report.reporter?.full_name || 'Unknown user'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{report.reason}</div>
                        {report.details && (
                          <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                            {report.details}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/forum/thread/${report.thread?.slug || '#'}`}
                          className="text-sm text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                        >
                          {report.thread?.title || 'Unknown thread'}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/admin/forum/moderation?report=${report.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Review
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/admin/forum/moderation"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <Flag className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Reports</p>
                <p className="text-sm text-gray-500">Review and handle reported content</p>
              </div>
            </Link>
            
            <Link
              to="/admin/forum/categories"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Manage Categories</p>
                <p className="text-sm text-gray-500">Create and edit forum categories</p>
              </div>
            </Link>
            
            <Link
              to="/admin/forum/users"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Forum Users</p>
                <p className="text-sm text-gray-500">Manage user permissions and activity</p>
              </div>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForumModerationOverview;
