import React, { useState } from 'react';
import { useProjects } from '../hooks/useProjects';
import { Project, ProjectStatus, ProjectPriority } from '../types/project';
import { Button } from '../../core/components/ui/Button';
import { LoadingSpinner } from '../../core/components/common/LoadingSpinner';
import { QueryParams } from '../../core/types/common';

export interface ProjectListProps {
  initialParams?: QueryParams;
  onSelectProject?: (project: Project) => void;
  onCreateProject?: () => void;
}

/**
 * ProjectList component for displaying a list of projects
 */
export const ProjectList: React.FC<ProjectListProps> = ({
  initialParams,
  onSelectProject,
  onCreateProject,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(initialParams?.pagination?.page || 1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(initialParams?.pagination?.limit || 10);
  
  const {
    projects,
    total,
    totalPages,
    isLoading,
    error,
    fetchProjects,
  } = useProjects({
    pagination: {
      page: currentPage,
      limit: itemsPerPage,
    },
    ...initialParams,
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProjects({
      pagination: {
        page,
        limit: itemsPerPage,
      },
      ...initialParams,
    });
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const limit = parseInt(e.target.value);
    setItemsPerPage(limit);
    setCurrentPage(1);
    fetchProjects({
      pagination: {
        page: 1,
        limit,
      },
      ...initialParams,
    });
  };

  // Get status badge color
  const getStatusColor = (status: ProjectStatus): string => {
    switch (status) {
      case ProjectStatus.DRAFT:
        return 'bg-gray-200 text-gray-800';
      case ProjectStatus.PENDING:
        return 'bg-yellow-200 text-yellow-800';
      case ProjectStatus.APPROVED:
        return 'bg-green-200 text-green-800';
      case ProjectStatus.IN_PROGRESS:
        return 'bg-blue-200 text-blue-800';
      case ProjectStatus.ON_HOLD:
        return 'bg-orange-200 text-orange-800';
      case ProjectStatus.COMPLETED:
        return 'bg-green-200 text-green-800';
      case ProjectStatus.CANCELLED:
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: ProjectPriority): string => {
    switch (priority) {
      case ProjectPriority.LOW:
        return 'bg-blue-200 text-blue-800';
      case ProjectPriority.MEDIUM:
        return 'bg-green-200 text-green-800';
      case ProjectPriority.HIGH:
        return 'bg-orange-200 text-orange-800';
      case ProjectPriority.URGENT:
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading && projects.length === 0) {
    return <LoadingSpinner size="lg" message="Loading projects..." />;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Projects</h2>
        {onCreateProject && (
          <Button onClick={onCreateProject}>
            Create Project
          </Button>
        )}
      </div>
      
      {projects.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No projects found.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => onSelectProject?.(project)}
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.title}</div>
                      <div className="text-sm text-gray-500">{project.description.substring(0, 50)}...</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(project.startDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(project.endDate)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{project.progress}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-4 py-3 flex items-center justify-between border-t">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, total)}
                </span>{' '}
                of <span className="font-medium">{total}</span> results
              </span>
              
              <select
                className="ml-4 px-2 py-1 border border-gray-300 rounded-md text-sm"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNumber;
                
                if (totalPages <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNumber = totalPages - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
