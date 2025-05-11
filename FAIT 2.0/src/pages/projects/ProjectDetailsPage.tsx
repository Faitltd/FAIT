import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronLeft,
  Edit,
  Share,
  Download,
  MessageSquare,
  FileText,
  Layers
} from 'lucide-react';
import { Project } from '../../types/project';
import { projectService } from '../../services/ProjectService';
import { useAuth } from '../../contexts/AuthContext';
import MilestoneTracker from '../../components/projects/MilestoneTracker';
import TaskAssignment from '../../components/projects/TaskAssignment';
import ProgressReporting from '../../components/projects/ProgressReporting';

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const data = await projectService.getProject(projectId);
      setProject(data);
      setError(null);
    } catch (err) {
      setError('Failed to load project details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isProjectMember = () => {
    if (!user || !project) return false;
    
    return project.members.some(member => member.id === user.id);
  };

  const isProjectOwner = () => {
    if (!user || !project) return false;
    
    return project.owner_id === user.id;
  };

  const canEditProject = () => {
    return isProjectOwner() || (isProjectMember() && project?.role === 'admin');
  };

  const handleEditProject = () => {
    if (!projectId) return;
    navigate(`/projects/${projectId}/edit`);
  };

  const handleExportProject = async () => {
    if (!projectId) return;
    
    try {
      await projectService.exportProject(projectId);
    } catch (err) {
      console.error('Failed to export project:', err);
    }
  };

  const handleShareProject = () => {
    if (!projectId) return;
    // Implement project sharing functionality
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Completed</span>;
      case 'on_hold':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">On Hold</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error || 'Project not found'}</span>
        </div>
        <div className="mt-4">
          <Link to="/projects" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Projects
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
            <div>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <div className="ml-3">{getStatusBadge(project.status)}</div>
              </div>
              <p className="mt-2 text-gray-600">{project.description}</p>
              
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                </div>
                
                {project.end_date && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{project.members.length} Members</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>{project.completed_tasks} / {project.total_tasks} Tasks</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {canEditProject() && (
                <button
                  onClick={handleEditProject}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit Project
                </button>
              )}
              
              <button
                onClick={handleShareProject}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Share className="h-4 w-4 mr-1" />
                Share
              </button>
              
              <button
                onClick={handleExportProject}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-1" />
              Overview
            </button>
            
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'milestones'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Layers className="h-4 w-4 inline mr-1" />
              Milestones
            </button>
            
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'tasks'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CheckCircle className="h-4 w-4 inline mr-1" />
              Tasks
            </button>
            
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'progress'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-1" />
              Progress
            </button>
            
            <button
              onClick={() => setActiveTab('team')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'team'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4 inline mr-1" />
              Team
            </button>
            
            <button
              onClick={() => setActiveTab('discussions')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'discussions'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="h-4 w-4 inline mr-1" />
              Discussions
            </button>
          </nav>
        </div>
        
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Description</h4>
                        <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Goals</h4>
                        <p className="mt-1 text-sm text-gray-600">{project.goals || 'No goals specified'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Timeline</h4>
                        <div className="mt-1 text-sm text-gray-600">
                          <p>Start Date: {new Date(project.start_date).toLocaleDateString()}</p>
                          {project.end_date && (
                            <p>End Date: {new Date(project.end_date).toLocaleDateString()}</p>
                          )}
                          <p>Duration: {project.duration_days} days</p>
                        </div>
                      </div>
                      
                      {project.budget && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Budget</h4>
                          <p className="mt-1 text-sm text-gray-600">${project.budget.toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Project Stats</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Progress</p>
                        <div className="flex items-center mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm font-medium text-gray-700">{project.progress}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Tasks</p>
                        <p className="text-lg font-medium text-gray-900">
                          {project.completed_tasks} / {project.total_tasks}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Milestones</p>
                        <p className="text-lg font-medium text-gray-900">
                          {project.completed_milestones} / {project.total_milestones}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Team Members</p>
                        <p className="text-lg font-medium text-gray-900">
                          {project.members.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {project.recent_activity && project.recent_activity.length > 0 ? (
                    <div className="space-y-4">
                      {project.recent_activity.map((activity, index) => (
                        <div key={index} className="flex items-start">
                          <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(activity.timestamp).toLocaleString()} by {activity.user.full_name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent activity</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'milestones' && (
            <MilestoneTracker 
              projectId={projectId || ''} 
              isEditable={canEditProject()} 
            />
          )}
          
          {activeTab === 'tasks' && (
            <TaskAssignment 
              projectId={projectId || ''} 
              isEditable={canEditProject()} 
            />
          )}
          
          {activeTab === 'progress' && (
            <ProgressReporting 
              projectId={projectId || ''} 
              startDate={project.start_date}
              endDate={project.end_date}
            />
          )}
          
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Project Team</h3>
                {canEditProject() && (
                  <button
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Manage Team
                  </button>
                )}
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {project.members.map((member) => (
                    <li key={member.id}>
                      <div className="px-4 py-4 flex items-center sm:px-6">
                        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden">
                              {member.avatar_url ? (
                                <img src={member.avatar_url} alt={member.full_name} className="h-full w-full object-cover" />
                              ) : (
                                member.full_name?.charAt(0).toUpperCase() || 'U'
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.full_name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                          <div className="mt-4 flex-shrink-0 sm:mt-0">
                            <div className="flex items-center">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {member.role || 'Member'}
                              </span>
                              {member.id === project.owner_id && (
                                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                                  Owner
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'discussions' && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Project Discussions</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This feature is coming soon. Project discussions will allow team members to communicate and collaborate on project-related topics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;
