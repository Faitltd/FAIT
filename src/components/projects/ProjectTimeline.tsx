import React from 'react';
import { Project, Task, Milestone } from '../../types/project';
import {
  Card,
  CardContent,
  Heading,
  Text
} from '../ui';

interface ProjectTimelineProps {
  project: Project;
  tasks?: Task[];
  milestones?: Milestone[];
  className?: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  project,
  tasks = [],
  milestones = [],
  className = ''
}) => {
  // Combine tasks and milestones into timeline items
  const timelineItems = [
    // Project start
    ...(project.start_date ? [{
      date: new Date(project.start_date),
      title: 'Project Start',
      type: 'project_start',
      id: 'project_start'
    }] : []),
    
    // Project end
    ...(project.end_date ? [{
      date: new Date(project.end_date),
      title: 'Project End',
      type: 'project_end',
      id: 'project_end'
    }] : []),
    
    // Milestones
    ...milestones.map(milestone => ({
      date: new Date(milestone.due_date || milestone.created_at),
      title: milestone.title,
      description: milestone.description,
      type: 'milestone',
      id: milestone.id
    })),
    
    // Tasks with due dates
    ...tasks
      .filter(task => task.due_date)
      .map(task => ({
        date: new Date(task.due_date!),
        title: task.title,
        description: task.description,
        type: 'task',
        id: task.id,
        status: task.status
      }))
  ]
  .sort((a, b) => a.date.getTime() - b.date.getTime());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getTimelineItemColor = (type: string, status?: string) => {
    if (type === 'project_start') return 'bg-green-500';
    if (type === 'project_end') return 'bg-purple-500';
    if (type === 'milestone') return 'bg-blue-500';
    
    // For tasks
    if (status === 'completed') return 'bg-green-500';
    if (status === 'in_progress') return 'bg-yellow-500';
    if (status === 'blocked') return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <div className={className}>
      {timelineItems.length === 0 ? (
        <div className="text-center py-8">
          <Text variant="muted">No timeline items available.</Text>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-9 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          
          {/* Timeline items */}
          <div className="space-y-8">
            {timelineItems.map((item, index) => (
              <div key={`${item.type}-${item.id}`} className="relative flex items-start">
                <div className={`absolute left-9 w-3 h-3 rounded-full ${getTimelineItemColor(item.type, item.status)} -translate-x-1.5 mt-1.5`}></div>
                
                <div className="flex-none w-20 text-right mr-4 text-sm text-gray-500">
                  {formatDate(item.date)}
                </div>
                
                <div className="flex-grow pt-0.5">
                  <div className="font-medium">{item.title}</div>
                  {item.description && (
                    <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1 capitalize">
                    {item.type.replace('_', ' ')}
                    {item.status && ` • ${item.status.replace('_', ' ')}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTimeline;
