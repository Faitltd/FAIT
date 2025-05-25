import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project, ProjectStatus } from '../../types/project';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardContent,
  Heading,
  Text,
  Button,
  Select,
  Input
} from '../ui';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  User
} from 'lucide-react';

interface ProjectListProps {
  role?: 'client' | 'service_agent';
  limit?: number;
  showCreateButton?: boolean;
  className?: string;
  viewMode?: 'grid' | 'list' | 'calendar';
  statusFilter?: string;
  searchQuery?: string;
  sortBy?: 'date' | 'title' | 'status';
  sortDirection?: 'asc' | 'desc';
}

const ProjectList: React.FC<ProjectListProps> = ({
  role,
  limit,
  showCreateButton = true,
  className = '',
  viewMode = 'grid',
  statusFilter: externalStatusFilter,
  searchQuery = '',
  sortBy = 'date',
  sortDirection = 'desc'
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>(
    externalStatusFilter as ProjectStatus || 'all'
  );

  const { user, userType } = useAuth();

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);
        let data;

        // Admin users see all projects, others only see their own
        if (userType === 'admin') {
          // Admin sees all projects
          data = await projectService.getAllProjects();
          console.log('Admin user - showing all projects');
        } else {
          // Service agents and clients only see their projects
          data = await projectService.getProjects(user.id, userType as 'client' | 'service_agent');
          console.log(`${userType} user - showing only their projects`);
        }

        setProjects(data);
        setFilteredProjects(limit ? data.slice(0, limit) : data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user, userType, limit]);

  // Update internal status filter when external filter changes
  useEffect(() => {
    if (externalStatusFilter) {
      setStatusFilter(externalStatusFilter as ProjectStatus || 'all');
    }
  }, [externalStatusFilter]);

  // Apply filters and sorting when projects or filter parameters change
  useEffect(() => {
    // Use web worker for filtering and sorting if available
    const applyFiltersAndSort = async () => {
      try {
        // Check if web workers are supported
        if ('Worker' in window && projects.length > 100) {
          // Use web worker for large datasets
          const worker = new Worker('/workers/data-processing-worker.js');

          // Create a promise to handle the worker response
          const workerPromise = new Promise<Project[]>((resolve, reject) => {
            worker.onmessage = (e) => {
              if (e.data.success) {
                resolve(e.data.result);
              } else {
                reject(e.data.error);
              }
              worker.terminate();
            };

            worker.onerror = (error) => {
              reject(error);
              worker.terminate();
            };
          });

          // Send the task to the worker
          worker.postMessage({
            id: `filter_${Date.now()}`,
            action: 'filter',
            data: {
              items: projects,
              filters: statusFilter !== 'all' ? { status: statusFilter } : {}
            }
          });

          // Wait for the worker to respond
          let filtered = await workerPromise;

          // Apply search filter
          if (searchQuery.trim() !== '') {
            worker.postMessage({
              id: `search_${Date.now()}`,
              action: 'search',
              data: {
                items: filtered,
                query: searchQuery,
                fields: ['title', 'description']
              }
            });

            filtered = await workerPromise;
          }

          // Apply sorting
          worker.postMessage({
            id: `sort_${Date.now()}`,
            action: 'sort',
            data: {
              items: filtered,
              sortBy,
              sortDirection
            }
          });

          filtered = await workerPromise;

          // Update state
          setFilteredProjects(limit ? filtered.slice(0, limit) : filtered);
        } else {
          // Fallback to main thread processing for smaller datasets
          let filtered = [...projects];

          // Apply status filter
          if (statusFilter !== 'all') {
            filtered = filtered.filter(project => project.status === statusFilter);
          }

          // Apply search filter
          if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(project =>
              project.title.toLowerCase().includes(query) ||
              (project.description && project.description.toLowerCase().includes(query))
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            if (sortBy === 'date') {
              return sortDirection === 'asc'
                ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            } else if (sortBy === 'title') {
              return sortDirection === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
            } else if (sortBy === 'status') {
              return sortDirection === 'asc'
                ? a.status.localeCompare(b.status)
                : b.status.localeCompare(a.status);
            }
            return 0;
          });

          // Update state
          setFilteredProjects(limit ? filtered.slice(0, limit) : filtered);
        }
      } catch (error) {
        console.error('Error applying filters and sorting:', error);

        // Fallback to simple filtering
        let filtered = [...projects];

        if (statusFilter !== 'all') {
          filtered = filtered.filter(project => project.status === statusFilter);
        }

        setFilteredProjects(limit ? filtered.slice(0, limit) : filtered);
      }
    };

    applyFiltersAndSort();
  }, [statusFilter, searchQuery, sortBy, sortDirection, projects, limit]);

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

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-indigo-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Status options and sort options are now handled by the ProjectFilters component

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      {showCreateButton && (
        <div className="flex justify-end mb-6">
          <Link to="/projects/create">
            <Button variant="primary">Create Project</Button>
          </Link>
        </div>
      )}

      {/* Filters are now handled by the ProjectFilters component */}

      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Text variant="muted">No projects found.</Text>
              {showCreateButton && (
                <Link to="/projects/create">
                  <Button variant="primary" className="mt-4">Create Your First Project</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'calendar' ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <Text variant="muted">Calendar view coming soon.</Text>
              <Text variant="muted" className="mt-2">This feature is under development.</Text>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProjects.map(project => (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => window.location.href = `/projects/${project.id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{project.title}</div>
                            {project.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-blue-600 h-2.5 rounded-full"
                              style={{ width: `${project.overall_progress}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{project.overall_progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.start_date && project.end_date ? (
                          <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                        ) : project.start_date ? (
                          <span>From {formatDate(project.start_date)}</span>
                        ) : project.end_date ? (
                          <span>Until {formatDate(project.end_date)}</span>
                        ) : (
                          <span>Not set</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="block h-full"
            >
              <Card hover className="transition-all duration-200 h-full">
                <CardContent>
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <Heading level={4} className="mr-2">{project.title}</Heading>
                        <div className={`flex items-center px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(project.status)}`}>
                          {getStatusIcon(project.status)}
                          <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
                        </div>
                      </div>

                      <Text variant="muted" className="line-clamp-2 mb-4">
                        {project.description}
                      </Text>

                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center">
                          <div className="relative h-12 w-12 flex items-center justify-center">
                            <svg className="h-12 w-12 transform -rotate-90" viewBox="0 0 36 36">
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                              />
                              <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#4f46e5"
                                strokeWidth="2"
                                strokeDasharray={`${project.overall_progress} 100`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Text weight="medium" size="sm">{project.overall_progress}%</Text>
                            </div>
                          </div>
                          <div className="ml-2">
                            <Text size="sm" weight="medium">Progress</Text>
                          </div>
                        </div>

                        {project.budget && (
                          <div className="text-right">
                            <Text size="sm" weight="medium">Budget</Text>
                            <Text size="sm">${project.budget.toLocaleString()}</Text>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between">
                        {project.start_date && (
                          <div>
                            <Text size="sm" weight="medium">Start</Text>
                            <Text size="sm">{formatDate(project.start_date)}</Text>
                          </div>
                        )}

                        {project.end_date && (
                          <div className="text-right">
                            <Text size="sm" weight="medium">End</Text>
                            <Text size="sm">{formatDate(project.end_date)}</Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {limit && projects.length > limit && (
        <div className="mt-4 text-center">
          <Link to="/projects">
            <Button variant="outline">View All Projects</Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
