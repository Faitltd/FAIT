import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flag, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { forumReportService } from '../../services/ForumReportService';
import { formatDistanceToNow } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';

interface Report {
  id: string;
  post_id: string;
  user_id: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved' | 'dismissed';
  moderator_id: string | null;
  resolution: string | null;
  resolved_at: string | null;
  created_at: string;
  reporter: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  post: {
    id: string;
    content: string;
    thread_id: string;
  };
  thread: {
    id: string;
    title: string;
    slug: string;
  };
}

const ForumModerationPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'resolved' | 'dismissed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    // Redirect if not admin
    if (user && !isAdmin) {
      navigate('/dashboard');
      return;
    }
    
    fetchReports();
  }, [user, isAdmin, navigate, filter]);
  
  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedReports: Report[];
      
      if (filter === 'pending') {
        fetchedReports = await forumReportService.getPendingReports();
      } else {
        // This would need to be implemented in the service
        fetchedReports = await forumReportService.getPendingReports();
      }
      
      setReports(fetchedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load reports. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      await forumReportService.updateReportStatus(
        reportId,
        status,
        user.id,
        resolution
      );
      
      // Refresh reports
      fetchReports();
      
      // Reset state
      setSelectedReport(null);
      setResolution('');
    } catch (err) {
      console.error('Error resolving report:', err);
      setError('Failed to update report status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return dateString;
    }
  };
  
  const filteredReports = reports.filter(report => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        report.reporter.full_name.toLowerCase().includes(query) ||
        report.reason.toLowerCase().includes(query) ||
        (report.details && report.details.toLowerCase().includes(query)) ||
        (report.thread.title && report.thread.title.toLowerCase().includes(query))
      );
    }
    return true;
  });
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Forum Moderation</h1>
          
          <button
            onClick={fetchReports}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setFilter('resolved')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'resolved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Resolved
                </button>
                <button
                  onClick={() => setFilter('dismissed')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'dismissed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Dismissed
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    filter === 'all'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search reports..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
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
                onClick={fetchReports}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-500">No reports found.</p>
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
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {report.reporter.avatar_url ? (
                            <img
                              src={report.reporter.avatar_url}
                              alt={report.reporter.full_name}
                              className="h-8 w-8 rounded-full mr-3"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-600 font-medium">
                                {report.reporter.full_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="text-sm font-medium text-gray-900">
                            {report.reporter.full_name}
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
                          to={`/forum/thread/${report.thread.slug}`}
                          className="text-sm text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                        >
                          {report.thread.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(report.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setSelectedReport(report)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {report.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setResolution('Report resolved. Post violates community guidelines.');
                                }}
                                className="text-green-600 hover:text-green-800"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedReport(report);
                                  setResolution('Report dismissed. Post does not violate community guidelines.');
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={() => setSelectedReport(null)}
            />
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Flag className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Report Details
                    </h3>
                    
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Reporter</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedReport.reporter.full_name}</p>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Reason</h4>
                        <p className="mt-1 text-sm text-gray-900">{selectedReport.reason}</p>
                      </div>
                      
                      {selectedReport.details && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500">Details</h4>
                          <p className="mt-1 text-sm text-gray-900">{selectedReport.details}</p>
                        </div>
                      )}
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Reported Content</h4>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm text-gray-900">
                          {selectedReport.post.content}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500">Thread</h4>
                        <Link
                          to={`/forum/thread/${selectedReport.thread.slug}`}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {selectedReport.thread.title}
                        </Link>
                      </div>
                      
                      {selectedReport.status === 'pending' && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-500">Resolution</h4>
                          <textarea
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter resolution notes..."
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedReport.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleResolveReport(selectedReport.id, 'resolved')}
                      disabled={isSubmitting}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Resolve Report'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveReport(selectedReport.id, 'dismissed')}
                      disabled={isSubmitting}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Processing...' : 'Dismiss Report'}
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumModerationPage;
