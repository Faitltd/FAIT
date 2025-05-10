import React from 'react';
import { Milestone, ProjectStatus } from '../../types/project';
import {
  Text,
  Button
} from '../ui';

interface MilestoneListProps {
  milestones: Milestone[];
  onEditMilestone?: (milestone: Milestone) => void;
  minimal?: boolean;
  className?: string;
}

const MilestoneList: React.FC<MilestoneListProps> = ({
  milestones,
  onEditMilestone,
  minimal = false,
  className = ''
}) => {
  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {milestones.map(milestone => (
        <div
          key={milestone.id}
          className={`p-4 border border-gray-200 rounded-lg hover:bg-gray-50 ${
            milestone.status === 'completed' ? 'bg-gray-50' : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row justify-between">
            <div className="flex-1">
              <div className="flex items-center flex-wrap gap-2">
                <Text
                  weight="medium"
                  className={milestone.status === 'completed' ? 'text-gray-500' : ''}
                >
                  {milestone.title}
                </Text>

                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(milestone.status)}`}>
                  {milestone.status.replace('_', ' ')}
                </span>
              </div>

              {!minimal && milestone.description && (
                <Text
                  variant="muted"
                  className="mt-1"
                >
                  {milestone.description}
                </Text>
              )}

              {milestone.due_date && (
                <div className="mt-2 text-sm text-gray-500">
                  <span className="font-medium">Due:</span> {formatDate(milestone.due_date)}
                </div>
              )}
            </div>

            {!minimal && (
              <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                >
                  View Tasks
                </Button>

                {onEditMilestone && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => onEditMilestone(milestone)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MilestoneList;
