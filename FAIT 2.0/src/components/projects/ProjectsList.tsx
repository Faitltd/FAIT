import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, DollarSign, MapPin, User, Briefcase } from 'lucide-react';
import { projectService } from '../../services/ProjectService';
import { useAuth } from '../../contexts/AuthContext';
import { Project, ProjectStatus } from '../../types/project';

interface ProjectsListProps {
  limit?: number;
  status?: ProjectStatus | 'all';
  isContractor?: boolean;
  isAdmin?: boolean;
  isAlly?: boolean;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  limit = 5,
  status = 'all',
  isContractor = false,
  isAdmin = false,
  isAlly = false
}) => {
  const { user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user || !userRole) return;

      try {
        setIsLoading(true);
        setError(null);

        // Determine the role for fetching projects
        let role = 'client';
        if (isContractor) {
          role = 'contractor';
        } else if (isAdmin) {
          role = 'admin';
        }

        // Fetch projects from the service
        const fetchedProjects = await projectService.getProjects(role, status !== 'all' ? status : undefined);

        setProjects(fetchedProjects);
      } catch (err: any) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user, userRole, status, isContractor, isAdmin, isAlly]);

  // Calculate project progress based on milestones
  const calculateProgress = (project: Project): number => {
    // If project has a progress field, use it
    if (project.overall_progress !== undefined) {
      return project.overall_progress;
    }

    // Otherwise, return a default based on status
    switch (project.status) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 50;
      case 'on_hold':
        return 25;
      case 'pending':
        return 0;
      case 'cancelled':
        return 0;
      default:
        return 0;
    }
  };

  // Limit the number of projects shown
  const limitedProjects = projects.slice(0, limit);

  const renderNewProjectButton = () => (
    <Link
      to="/dashboard/projects/new"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      data-cy="new-project-button"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      New Project
    </Link>
  );

  if (limitedProjects.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          {renderNewProjectButton()}
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center" data-cy="empty-state">
          <p className="text-gray-500">No projects found with status: {status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {renderNewProjectButton()}
      </div>
      <div className="overflow-hidden" data-cy="project-list">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
        <ul className="divide-y divide-gray-200">
          {limitedProjects.map(project => (
            <li key={project.id} className="py-4" data-cy="project-card">
              <Link to={`/dashboard/projects/${project.id}`} className="block hover:bg-gray-50 transition rounded-lg p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900" data-cy="project-title">{project.title}</h3>
                      <p className="text-sm text-gray-500 mt-1" data-cy="project-description">{project.description}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'on_hold' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`} data-cy="project-status">
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div data-cy="project-progress-container">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-700">Progress</span>
                      <span className="text-xs font-medium text-gray-700" data-cy="project-progress">{calculateProgress(project)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          project.status === 'completed' ? 'bg-green-500' :
                          project.status === 'in_progress' ? 'bg-blue-500' :
                          project.status === 'on_hold' ? 'bg-purple-500' :
                          'bg-yellow-500'
                        }`}
                        style={{ width: `${calculateProgress(project)}%` }}
                        data-cy="project-progress-bar"
                      ></div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600" data-cy="project-dates">
                        {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'TBD'}
                        {' to '}
                        {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600" data-cy="project-budget">${project.budget ? project.budget.toLocaleString() : 'TBD'}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-600 truncate" data-cy="project-location">
                        {project.address || 'No location specified'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {isAdmin && (
                        <>
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-600">
                            {project.client?.first_name ? `${project.client.first_name} ${project.client.last_name || ''}` : 'Client'}
                          </span>
                        </>
                      )}
                      {isContractor && !isAdmin && (
                        <>
                          <User className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-600">
                            {project.client?.first_name ? `${project.client.first_name} ${project.client.last_name || ''}` : 'Client'}
                          </span>
                        </>
                      )}
                      {!isContractor && !isAdmin && (
                        <>
                          <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-gray-600">
                            {project.contractor?.first_name ? `${project.contractor.first_name} ${project.contractor.last_name || ''}` : 'Contractor'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="mt-2" data-cy="milestone-list">
                    <div className="flex space-x-2 flex-wrap">
                      {project.milestones && project.milestones.length > 0 ? (
                        project.milestones.map(milestone => (
                          <div
                            key={milestone.id}
                            className={`px-2 py-1 rounded text-xs mb-1 ${
                              milestone.completed || milestone.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                            title={milestone.title}
                            data-cy="milestone-item"
                          >
                            {milestone.title}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500" data-cy="no-milestones">No milestones defined</div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectsList;
