import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, MapPin, Clock, Users } from 'lucide-react';

interface JobPostingCardProps {
  job: any;
  className?: string;
}

const JobPostingCard: React.FC<JobPostingCardProps> = ({
  job,
  className = '',
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified';
    
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `From $${min.toLocaleString()}`;
    } else if (max) {
      return `Up to $${max.toLocaleString()}`;
    }
    
    return 'Budget not specified';
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${className}`}>
      <Link to={`/jobs/${job.id}`}>
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {job.title}
              </h3>
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{getTimeAgo(job.created_at)}</span>
                
                {job.category && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{job.category.name}</span>
                  </>
                )}
              </div>
            </div>
            
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(job.status)}`}>
              {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1)}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {job.description}
          </p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
              <span>{formatBudget(job.budget_min, job.budget_max)}</span>
            </div>
            
            {job.is_remote ? (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                <span>Remote</span>
              </div>
            ) : (
              job.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="truncate">{job.location}</span>
                </div>
              )
            )}
            
            {job.start_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span>Starts: {formatDate(job.start_date)}</span>
              </div>
            )}
            
            {job.end_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                <span>Ends: {formatDate(job.end_date)}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            {/* Client info */}
            {job.client && (
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {job.client.avatar_url ? (
                    <img
                      src={job.client.avatar_url}
                      alt={job.client.full_name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-sm font-medium">
                        {job.client.full_name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="ml-2 text-sm text-gray-700 truncate">
                  {job.client.full_name}
                </div>
              </div>
            )}
            
            {/* Applications count */}
            {job.applications && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 text-gray-400 mr-1" />
                <span>{job.applications.length} application{job.applications.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default JobPostingCard;
