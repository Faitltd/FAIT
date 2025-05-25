import React, { useState, useEffect } from 'react';
import { verificationService } from '../../services/VerificationService';
import { VerificationStats } from '../../types/verification.types';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  BarChart,
  Users,
  Calendar
} from 'lucide-react';

/**
 * Component to display verification analytics
 */
const VerificationAnalytics: React.FC = () => {
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsData = await verificationService.getStats();
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching verification stats:', err);
        setError('Failed to load verification statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  // Calculate total verifications
  const totalVerifications = 
    (stats.pending_count || 0) + 
    (stats.in_review_count || 0) + 
    (stats.approved_count || 0) + 
    (stats.rejected_count || 0) + 
    (stats.expired_count || 0);
  
  // Calculate approval rate
  const approvalRate = totalVerifications > 0
    ? Math.round((stats.approved_count / totalVerifications) * 100)
    : 0;
  
  // Format average time
  const formatAverageTime = (hours: number) => {
    if (isNaN(hours) || hours === 0) return 'N/A';
    
    if (hours < 24) {
      return `${Math.round(hours)} hours`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.round(hours % 24);
      return `${days} day${days !== 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours} hr${remainingHours !== 1 ? 's' : ''}` : ''}`;
    }
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-blue-700">Total Verifications</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-blue-900">{totalVerifications}</span>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-700">Approval Rate</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-green-900">{approvalRate}%</span>
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-yellow-500 mr-2" />
            <span className="text-sm font-medium text-yellow-700">Avg. Processing Time</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-yellow-900">
              {formatAverageTime(stats.average_time_hours || 0)}
            </span>
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-purple-700">Pending Review</span>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-purple-900">
              {(stats.pending_count || 0) + (stats.in_review_count || 0)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Verification Status Breakdown</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <Clock className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-xs font-medium text-gray-700">Pending</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{stats.pending_count || 0}</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-yellow-500 h-2 rounded-full" 
                style={{ width: `${totalVerifications > 0 ? (stats.pending_count / totalVerifications) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <BarChart className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-xs font-medium text-gray-700">In Review</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{stats.in_review_count || 0}</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${totalVerifications > 0 ? (stats.in_review_count / totalVerifications) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-xs font-medium text-gray-700">Approved</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{stats.approved_count || 0}</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${totalVerifications > 0 ? (stats.approved_count / totalVerifications) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <XCircle className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-xs font-medium text-gray-700">Rejected</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{stats.rejected_count || 0}</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${totalVerifications > 0 ? (stats.rejected_count / totalVerifications) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-xs font-medium text-gray-700">Expired</span>
            </div>
            <span className="text-lg font-bold text-gray-900">{stats.expired_count || 0}</span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gray-500 h-2 rounded-full" 
                style={{ width: `${totalVerifications > 0 ? (stats.expired_count / totalVerifications) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationAnalytics;
