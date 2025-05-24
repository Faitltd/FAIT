/**
 * Project View Toggle Component
 * 
 * This component provides buttons to toggle between different view modes.
 */

import React from 'react';
import { Button } from '../ui';
import { Grid3X3, List, Calendar } from 'lucide-react';

interface ProjectViewToggleProps {
  viewMode: 'grid' | 'list' | 'calendar';
  setViewMode: (mode: 'grid' | 'list' | 'calendar') => void;
}

const ProjectViewToggle: React.FC<ProjectViewToggleProps> = ({
  viewMode,
  setViewMode
}) => {
  return (
    <div className="flex space-x-2">
      <Button
        variant={viewMode === 'grid' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setViewMode('grid')}
      >
        <Grid3X3 size={18} />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setViewMode('list')}
      >
        <List size={18} />
      </Button>
      <Button
        variant={viewMode === 'calendar' ? 'primary' : 'outline'}
        size="sm"
        onClick={() => setViewMode('calendar')}
      >
        <Calendar size={18} />
      </Button>
    </div>
  );
};

export default ProjectViewToggle;
