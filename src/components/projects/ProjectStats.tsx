/**
 * Project Statistics Component
 * 
 * This component displays project statistics in a grid of cards.
 */

import React from 'react';
import { Card, CardContent, Heading, Text } from '../ui';
import { BarChart3, Clock, Calendar } from 'lucide-react';

interface ProjectStatsProps {
  total: number;
  inProgress: number;
  dueThisWeek: number;
}

const ProjectStats: React.FC<ProjectStatsProps> = ({
  total,
  inProgress,
  dueThisWeek
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <BarChart3 size={24} className="text-blue-600" />
            </div>
            <div>
              <Text className="text-gray-500 text-sm">Total Projects</Text>
              <Heading level={3}>{total}</Heading>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Clock size={24} className="text-green-600" />
            </div>
            <div>
              <Text className="text-gray-500 text-sm">In Progress</Text>
              <Heading level={3}>{inProgress}</Heading>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Calendar size={24} className="text-purple-600" />
            </div>
            <div>
              <Text className="text-gray-500 text-sm">Due This Week</Text>
              <Heading level={3}>{dueThisWeek}</Heading>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectStats;
