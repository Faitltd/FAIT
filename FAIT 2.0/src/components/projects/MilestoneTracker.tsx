import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  PauseCircle,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  MoreVertical
} from 'lucide-react';
import { ProjectMilestone, MilestoneStatus } from '../../types/project';
import { projectService } from '../../services/ProjectService';

interface MilestoneTrackerProps {
  projectId: string;
  isEditable?: boolean;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ 
  projectId, 
  isEditable = false 
}) => {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  
  // Form state for adding/editing milestones
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'pending' as MilestoneStatus
  });

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  const fetchMilestones = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectMilestones(projectId);
      setMilestones(data);
      setError(null);
    } catch (err) {
      setError('Failed to load milestones');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !isEditable) return;

    const items = Array.from(milestones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    setMilestones(items);

    // Update order in the database
    try {
      const success = await projectService.reorderMilestones(
        projectId, 
        items.map(item => item.id)
      );
      
      if (!success) {
        // If the update fails, revert to the original order
        fetchMilestones();
      }
    } catch (err) {
      console.error('Failed to update milestone order:', err);
      fetchMilestones();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newMilestone = await projectService.createMilestone({
        project_id: projectId,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        status: formData.status,
        progress: formData.status === 'completed' ? 100 : 0
      });

      if (newMilestone) {
        setMilestones([...milestones, newMilestone]);
        setIsAddingMilestone(false);
        setFormData({
          title: '',
          description: '',
          due_date: '',
          status: 'pending'
        });
      }
    } catch (err) {
      console.error('Failed to add milestone:', err);
    }
  };

  const handleEditMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingMilestoneId) return;
    
    try {
      const updatedMilestone = await projectService.updateMilestone(
        editingMilestoneId,
        {
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          status: formData.status,
          progress: formData.status === 'completed' ? 100 : 
                   formData.status === 'in_progress' ? 50 : 0,
          completed_date: formData.status === 'completed' ? new Date().toISOString().split('T')[0] : null
        }
      );

      if (updatedMilestone) {
        setMilestones(milestones.map(m => 
          m.id === editingMilestoneId ? updatedMilestone : m
        ));
        setEditingMilestoneId(null);
        setFormData({
          title: '',
          description: '',
          due_date: '',
          status: 'pending'
        });
      }
    } catch (err) {
      console.error('Failed to update milestone:', err);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    
    try {
      const success = await projectService.deleteMilestone(id);
      
      if (success) {
        setMilestones(milestones.filter(m => m.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete milestone:', err);
    }
  };

  const handleUpdateProgress = async (id: string, progress: number) => {
    try {
      const updatedMilestone = await projectService.updateMilestoneProgress(id, progress);
      
      if (updatedMilestone) {
        setMilestones(milestones.map(m => 
          m.id === id ? updatedMilestone : m
        ));
      }
    } catch (err) {
      console.error('Failed to update milestone progress:', err);
    }
  };

  const startEditMilestone = (milestone: ProjectMilestone) => {
    setFormData({
      title: milestone.title,
      description: milestone.description,
      due_date: milestone.due_date,
      status: milestone.status
    });
    setEditingMilestoneId(milestone.id);
  };

  const getStatusIcon = (status: MilestoneStatus, progress: number) => {
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
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
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
        <h3 className="text-lg font-medium text-gray-900">Project Milestones</h3>
        {isEditable && (
          <button
            onClick={() => setIsAddingMilestone(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Milestone
          </button>
        )}
      </div>

      {isAddingMilestone && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAddMilestone} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                id="due_date"
                required
                value={formData.due_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="status"
                required
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingMilestone(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Milestone
              </button>
            </div>
          </form>
        </div>
      )}

      {editingMilestoneId && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleEditMilestone} className="space-y-4">
            <div>
              <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="edit-title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="edit-due_date" className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                id="edit-due_date"
                required
                value={formData.due_date}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                name="status"
                id="edit-status"
                required
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingMilestoneId(null)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Milestone
              </button>
            </div>
          </form>
        </div>
      )}

      {milestones.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No milestones have been added yet.</p>
          {isEditable && (
            <button
              onClick={() => setIsAddingMilestone(true)}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Milestone
            </button>
          )}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="milestones">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="divide-y divide-gray-200"
              >
                {milestones.map((milestone, index) => (
                  <Draggable 
                    key={milestone.id} 
                    draggableId={milestone.id} 
                    index={index}
                    isDragDisabled={!isEditable}
                  >
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="p-4 hover:bg-gray-50"
                      >
                        <div className="flex items-start">
                          {isEditable && (
                            <div 
                              {...provided.dragHandleProps}
                              className="mr-3 flex flex-col items-center justify-center cursor-move"
                            >
                              <ChevronUp className="h-4 w-4 text-gray-400" />
                              <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                          
                          <div className="mr-3">
                            {getStatusIcon(milestone.status, milestone.progress)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                              {isEditable && (
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => startEditMilestone(milestone)}
                                    className="text-gray-400 hover:text-gray-500"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMilestone(milestone.id)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {milestone.description && (
                              <p className="mt-1 text-sm text-gray-500">{milestone.description}</p>
                            )}
                            
                            <div className="mt-2 flex items-center text-xs text-gray-500">
                              <span>Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                              {milestone.completed_date && (
                                <span className="ml-4">
                                  Completed: {new Date(milestone.completed_date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            
                            {isEditable && milestone.status === 'in_progress' && (
                              <div className="mt-2">
                                <div className="flex items-center">
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                      className="bg-blue-600 h-2.5 rounded-full" 
                                      style={{ width: `${milestone.progress}%` }}
                                    ></div>
                                  </div>
                                  <span className="ml-2 text-xs text-gray-500">{milestone.progress}%</span>
                                </div>
                                
                                <div className="mt-2 flex space-x-2">
                                  <button
                                    onClick={() => handleUpdateProgress(milestone.id, 25)}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                                  >
                                    25%
                                  </button>
                                  <button
                                    onClick={() => handleUpdateProgress(milestone.id, 50)}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                                  >
                                    50%
                                  </button>
                                  <button
                                    onClick={() => handleUpdateProgress(milestone.id, 75)}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                                  >
                                    75%
                                  </button>
                                  <button
                                    onClick={() => handleUpdateProgress(milestone.id, 100)}
                                    className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                                  >
                                    Complete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default MilestoneTracker;
