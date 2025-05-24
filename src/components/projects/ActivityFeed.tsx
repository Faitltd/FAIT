import React from 'react';
import { ProjectActivity, User } from '../../types/project';
import {
  Card,
  CardContent,
  Heading,
  Text
} from '../ui';
import {
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  MessageSquare,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface ActivityFeedProps {
  activities: ProjectActivity[];
  users?: Record<string, User>;
  className?: string;
  limit?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  users = {},
  className = '',
  limit
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const getActivityIcon = (activity: ProjectActivity) => {
    const { activity_type, entity_type } = activity;
    
    if (activity_type === 'create') {
      return <Plus className="h-5 w-5 text-green-500" />;
    } else if (activity_type === 'update') {
      return <Edit className="h-5 w-5 text-blue-500" />;
    } else if (activity_type === 'delete' || activity_type === 'remove') {
      return <Trash2 className="h-5 w-5 text-red-500" />;
    } else if (activity_type === 'comment') {
      return <MessageSquare className="h-5 w-5 text-purple-500" />;
    } else if (activity_type === 'upload') {
      return <FileText className="h-5 w-5 text-indigo-500" />;
    } else if (activity_type === 'status_change') {
      if (entity_type === 'task' && activity.description.includes('completed')) {
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      } else if (entity_type === 'task' && activity.description.includes('blocked')) {
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      } else {
        return <Clock className="h-5 w-5 text-yellow-500" />;
      }
    }
    
    return <Clock className="h-5 w-5 text-gray-500" />;
  };

  const getUserName = (userId: string) => {
    if (users[userId]) {
      return users[userId].full_name || users[userId].email;
    }
    return 'Unknown User';
  };

  const displayedActivities = limit ? activities.slice(0, limit) : activities;

  return (
    <div className={className}>
      {displayedActivities.length === 0 ? (
        <div className="text-center py-8">
          <Text variant="muted">No activities yet.</Text>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedActivities.map(activity => (
            <div key={activity.id} className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <div className="p-2 rounded-full bg-gray-100">
                  {getActivityIcon(activity)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {getUserName(activity.user_id)}
                  </span>{' '}
                  <span className="text-gray-700">
                    {activity.description}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {formatDate(activity.created_at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
