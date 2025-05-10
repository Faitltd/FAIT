import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Layers, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PauseCircle,
  Calendar,
  Plus,
  Download,
  Filter
} from 'lucide-react';
import { Project, ProjectMilestone, MilestoneStatus } from '../../types/project';
import { projectService } from '../../services/ProjectService';
import { useAuth } from '../../contexts/AuthContext';
import TaskAssignment from '../../components/projects/TaskAssignment';

const MilestonesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (projectId) {
      fetchProject();
      fetchMilestones();
    }
  }, [projectId]);

  const fetchProject = async () => {
    if (!projectId) return;
    
    try {
      const data = await projectService.getProject(projectId);
      setProject(data);
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  };

  const fetchMilestones = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const data = await projectService.getProjectMilestones(projectId);
      setMilestones(data);
      
      // Select the first milestone by default if available
      if (data.length > 0 && !selectedMilestone) {
        setSelectedMilestone(data[0]);
      }
      
      setError(null);
    } catch (err) {
      setError('Failed to load milestones');
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

  const handleExportMilestones = async () => {
    if (!projectId) return;
    
    try {
      await projectService.exportMilestones(projectId);
    } catch (err) {
      console.error('Failed to export milestones:', err);
    }
  };

  const handleAddMilestone = () => {
    if (!projectId) return;
    navigate(`/projects/${projectId}/milestones/new`);
  };

  const getStatusIcon = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'on_hold':
        return <PauseCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Layers className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadgeColor = (status: MilestoneStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter milestones based on selected status filter
  const filteredMilestones = milestones.filter(milestone => 
    statusFilter === 'all' || milestone.status === statusFilter
  );

  if (loading && milestones.length === 0) {
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

  if (error && milestones.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
        <div className="mt-4">
          <Link to={`/projects/${projectId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to Project
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to={`/projects/${projectId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Project
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Project Milestones</h1>
        <div className="flex space-x-2">
          {canEditProject() && (
            <button
              onClick={handleAddMilestone}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Milestone
            </button>
          )}
          
          <button
            onClick={handleExportMilestones}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-1" />
            Export
          </button>
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Milestone List</h3>
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-400 mr-2" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1 pl-2 pr-8 text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            {filteredMilestones.length === 0 ? (
              <div className="p-6 text-center">
                <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No milestones found</h3>
                <p className="text-gray-500">
                  {milestones.length === 0 
                    ? "This project doesn't have any milestones yet." 
                    : "No milestones match the selected filter."}
                </p>
                {canEditProject() && milestones.length === 0 && (
                  <button
                    onClick={handleAddMilestone}
                    className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add First Milestone
                  </button>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {filteredMilestones.map((milestone) => (
                  <li 
                    key={milestone.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      selectedMilestone?.id === milestone.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedMilestone(milestone)}
                  >
                    <div className="flex items-start">
                      <div className="mr-3">
                        {getStatusIcon(milestone.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(milestone.status)}`}>
                            {milestone.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="mt-2 flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                        </div>
                        
                        {milestone.status === 'in_progress' && (
                          <div className="mt-2">
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-blue-600 h-1.5 rounded-full" 
                                  style={{ width: `${milestone.progress}%` }}
                                ></div>
                              </div>
                              <span className="ml-2 text-xs text-gray-500">{milestone.progress}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        <div className="lg:w-2/3">
          {selectedMilestone ? (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h2 className="text-xl font-bold text-gray-900">{selectedMilestone.title}</h2>
                        <span className={`ml-3 px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(selectedMilestone.status)}`}>
                          {selectedMilestone.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      {selectedMilestone.description && (
                        <p className="mt-2 text-gray-600">{selectedMilestone.description}</p>
                      )}
                      
                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Due: {new Date(selectedMilestone.due_date).toLocaleDateString()}</span>
                        </div>
                        
                        {selectedMilestone.completed_date && (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                            <span>Completed: {new Date(selectedMilestone.completed_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {canEditProject() && (
                      <div className="flex space-x-2">
                        <Link
                          to={`/projects/${projectId}/milestones/${selectedMilestone.id}/edit`}
                          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Edit Milestone
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
                
                {selectedMilestone.status === 'in_progress' && (
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-medium text-gray-700">Progress</h3>
                      <span className="text-sm font-medium text-gray-900">{selectedMilestone.progress}%</span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${selectedMilestone.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <TaskAssignment 
                projectId={projectId || ''} 
                milestoneId={selectedMilestone.id}
                isEditable={canEditProject()} 
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No milestone selected</h3>
              <p className="text-gray-500">
                Select a milestone from the list to view its details and tasks.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MilestonesPage;
