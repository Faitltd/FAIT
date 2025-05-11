import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type VerificationStatus = 'not_started' | 'in_progress' | 'pending_review' | 'approved' | 'rejected' | 'expired';

interface VerificationStatusBadgeProps {
  userId?: string; // Optional - if not provided, will use the current user
  showLink?: boolean;
  className?: string;
}

const VerificationStatusBadge: React.FC<VerificationStatusBadgeProps> = ({ 
  userId, 
  showLink = true,
  className = ''
}) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<VerificationStatus>('not_started');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVerificationStatus = async () => {
      try {
        const targetUserId = userId || user?.id;
        
        if (!targetUserId) {
          setLoading(false);
          return;
        }
        
        const { data, error } = await supabase
          .from('client_verifications')
          .select('status')
          .eq('user_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
          throw error;
        }
        
        if (data) {
          setStatus(data.status as VerificationStatus);
        }
      } catch (err) {
        console.error('Error fetching verification status:', err);
        setError('Failed to load verification status');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVerificationStatus();
  }, [user, userId]);
  
  if (loading) {
    return <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`}>
      Loading...
    </div>;
  }
  
  if (error) {
    return <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ${className}`}>
      Error
    </div>;
  }
  
  const getBadgeContent = () => {
    switch (status) {
      case 'approved':
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 ${className}`} data-cy="profile-verification-badge">
            <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-green-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Verified
          </div>
        );
      case 'pending_review':
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ${className}`} data-cy="verification-status">
            <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-yellow-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Pending Review
          </div>
        );
      case 'in_progress':
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`} data-cy="verification-status">
            <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-blue-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            In Progress
          </div>
        );
      case 'rejected':
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 ${className}`} data-cy="verification-status">
            <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-red-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Verification Failed
          </div>
        );
      case 'expired':
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`} data-cy="verification-expiry-notice">
            <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Verification Expired
          </div>
        );
      default:
        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 ${className}`} data-cy="verification-status">
            <svg className="-ml-0.5 mr-1.5 h-3 w-3 text-gray-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Not Verified
          </div>
        );
    }
  };
  
  if (!showLink || userId !== user?.id) {
    return getBadgeContent();
  }
  
  return (
    <Link to="/verification" className="hover:opacity-80 transition-opacity">
      {getBadgeContent()}
    </Link>
  );
};

export default VerificationStatusBadge;
