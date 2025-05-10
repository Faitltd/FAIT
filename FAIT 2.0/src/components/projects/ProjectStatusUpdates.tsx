import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  PauseCircle,
  Plus,
  RefreshCw
} from 'lucide-react';
import { ProjectStatusUpdate, ProjectStatus } from '../../types/project';
import { projectService } from '../../services/ProjectService';

interface ProjectStatusUpdatesProps {
  projectId: string;
  currentStatus: ProjectStatus;
  onStatusChange?: (newStatus: ProjectStatus) => void;
  isEditable?: boolean;
}

const ProjectStatusUpdates: React.FC<ProjectStatusUpdatesProps> = ({ 
  projectId, 
  currentStatus,
  onStatusChange,
  isEditable = false 
}) => {
  const [statusUpdates, setStatusUpdates] = useState<ProjectStatusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<ProjectStatus>(currentStatus);
  const [updateReason, setUpdateReason] = useState('');

  useEffect(() => {
    fetchStatusUpdates();
  }, [projectId]);

  const fetchStatusUpdates = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectStatusUpdates(projectId);
      setStatusUpdates(data);
      setError(null);
    } catch (err) {
      setError('Failed to load status updates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newStatus === currentStatus) {
      setIsUpdatingStatus(false);
      return;
    }
    
    try {
      const success = await projectService.updateProjectStatus(
        projectId,
        newStatus,
        updateReason
      );
      
      if (success) {
        // Refresh status updates
        fetchStatusUpdates();
        
        // Notify parent component
        if (onStatusChange) {
          onStatusChange(newStatus);
        }
        
        // Reset form
        setIsUpdatingStatus(false);
        setUpdateReason('');
      }
    } catch (err) {
      console.error('Failed to update project status:', err);
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'on_hold':
        return <PauseCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Project Status</h3>
        {isEditable && (
          <button
            onClick={() => setIsUpdatingStatus(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Update Status
          </button>
        )}
      </div>

      <div className="p-4 flex items-center">
        <div className="mr-3">
          {getStatusIcon(currentStatus)}
        </div>
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)}`}>
            {currentStatus.replace('_', ' ').charAt(0).toUpperCase() + currentStatus.replace('_', ' ').slice(1)}
          </span>
          <p className="mt-1 text-sm text-gray-500">
            {statusUpdates.length > 0 
              ? `Last updated ${formatDate(statusUpdates[0].created_at)}`
              : 'No status updates yet'}
          </p>
        </div>
      </div>

      {isUpdatingStatus && (
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <form onSubmit={handleStatusChange} className="space-y-4">
            <div>
              <label htmlFor="new_status" className="block text-sm font-medium text-gray-700">
                New Status
              </label>
              <select
                name="new_status"
                id="new_status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ProjectStatus)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="update_reason" className="block text-sm font-medium text-gray-700">
                Reason for Update
              </label>
              <textarea
                name="update_reason"
                id="update_reason"
                rows={3}
                value={updateReason}
                onChange={(e) => setUpdateReason(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Explain why you're changing the status..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsUpdatingStatus(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Status
              </button>
            </div>
          </form>
        </div>
      )}

      {statusUpdates.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Status History</h4>
          
          <ul className="space-y-4">
            {statusUpdates.map(update => (
              <li key={update.id} className="border-l-2 border-gray-200 pl-4 py-1">
                <div className="flex items-start">
                  <div className="mr-3">
                    {getStatusIcon(update.new_status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(update.new_status)}`}>
                        {update.new_status.replace('_', ' ').charAt(0).toUpperCase() + update.new_status.replace('_', ' ').slice(1)}
                      </span>
                      
                      {update.previous_status && (
                        <span className="ml-2 text-xs text-gray-500">
                          from {update.previous_status.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    
                    {update.update_reason && (
                      <p className="mt-1 text-sm text-gray-700">{update.update_reason}</p>
                    )}
                    
                    <div className="mt-1 flex items-center text-xs text-gray-500">
                      <span>{formatDate(update.created_at)}</span>
                      {update.updater && (
                        <span className="ml-2">by {update.updater.full_name}</span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProjectStatusUpdates;
