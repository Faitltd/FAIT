import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Project, ProjectStatus } from '../../types/project';
import { projectService } from '../../services/ProjectService';
import MilestoneTracker from './MilestoneTracker';
import ProjectTimeline from './ProjectTimeline';
import ProjectStatusUpdates from './ProjectStatusUpdates';
import ProjectIssueTracker from './ProjectIssueTracker';

interface ProjectStatusTrackerProps {
  projectId: string;
  isEditable?: boolean;
}

const ProjectStatusTracker: React.FC<ProjectStatusTrackerProps> = ({
  projectId,
  isEditable = false
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'milestones' | 'timeline' | 'status' | 'issues'>('milestones');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProject(projectId);
      setProject(data);
      setError(null);
    } catch (err) {
      setError('Failed to load project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;

    // Update local state immediately for better UX
    setProject({ ...project, status: newStatus });
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error || 'Project not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project progress overview */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Progress</h3>

        <div className="flex items-center mb-2">
          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${project.overall_progress}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-500">{project.overall_progress}%</span>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
          <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('milestones')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'milestones'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Milestones
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'timeline'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'status'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Status Updates
            </button>
            <button
              onClick={() => setActiveTab('issues')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'issues'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Issues
            </button>
          </nav>
        </div>

        <div className="p-4">
          {activeTab === 'milestones' && (
            <MilestoneTracker projectId={projectId} isEditable={isEditable} />
          )}

          {activeTab === 'timeline' && (
            <ProjectTimeline projectId={projectId} isEditable={isEditable} />
          )}

          {activeTab === 'status' && (
            <ProjectStatusUpdates
              projectId={projectId}
              currentStatus={project.status}
              onStatusChange={handleStatusChange}
              isEditable={isEditable}
            />
          )}

          {activeTab === 'issues' && (
            <ProjectIssueTracker
              projectId={projectId}
              isEditable={isEditable}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectStatusTracker;
