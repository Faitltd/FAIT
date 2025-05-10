/**
 * Project Filters Component
 * 
 * This component provides filtering, sorting, and search functionality for projects.
 */

import React from 'react';
import { Input, Select } from '../ui';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { ProjectStatus } from '../../types/project';

interface ProjectFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: ProjectStatus | 'all';
  setStatusFilter: (status: ProjectStatus | 'all') => void;
  sortBy: 'date' | 'title' | 'status';
  setSortBy: (sortBy: 'date' | 'title' | 'status') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (direction: 'asc' | 'desc') => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection
}) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' }
  ];

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <Filter className="h-5 w-5 text-gray-500" />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}
            className="w-full"
            aria-label="Filter by status"
          />
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <ArrowUpDown className="h-5 w-5 text-gray-500" />
          </div>
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(value) => setSortBy(value as 'date' | 'title' | 'status')}
            className="w-full"
            aria-label="Sort by"
          />
          <button
            onClick={toggleSortDirection}
            className="p-2 rounded-md hover:bg-gray-100"
            aria-label={`Sort ${sortDirection === 'asc' ? 'ascending' : 'descending'}`}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;
