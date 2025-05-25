import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, Milestone } from '../../types/project';
import { projectService } from '../../services/projectService';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter,
  Heading, 
  Input,
  ExpandingTextarea,
  Select,
  Button
} from '../ui';

interface EditTaskProps {
  task: Task;
  onTaskUpdated?: (task: Task) => void;
  onCancel?: () => void;
  className?: string;
}

const EditTask: React.FC<EditTaskProps> = ({ 
  task,
  onTaskUpdated,
  onCancel,
  className = '' 
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee_id || '');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(task.milestone_id || '');
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { user, hasPermission } = useAuth();
  
  // Reset form when task changes
  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.due_date || '');
    setStatus(task.status);
    setPriority(task.priority);
    setAssigneeId(task.assignee_id || '');
    setSelectedMilestoneId(task.milestone_id || '');
  }, [task]);
  
  // Fetch milestones for the project
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!task.project_id) return;
      
      try {
        setIsLoadingMilestones(true);
        const projectData = await projectService.getProjectById(task.project_id, ['milestones']);
        if (projectData && projectData.milestones) {
          setMilestones(projectData.milestones);
        }
      } catch (err) {
        console.error('Error fetching milestones:', err);
      } finally {
        setIsLoadingMilestones(false);
      }
    };
    
    fetchMilestones();
  }, [task.project_id]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update a task');
      return;
    }
    
    if (!title) {
      setError('Title is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Create task update object
      const taskUpdates: Partial<Task> = {
        title,
        description,
        due_date: dueDate || undefined,
        status,
        priority,
        assignee_id: assigneeId || undefined,
        milestone_id: selectedMilestoneId || undefined,
        updated_at: new Date().toISOString()
      };
      
      // If status is completed and wasn't before, set completed_at
      if (status === 'completed' && task.status !== 'completed') {
        taskUpdates.completed_at = new Date().toISOString();
      } else if (status !== 'completed' && task.status === 'completed') {
        taskUpdates.completed_at = undefined;
      }
      
      // Call service to update task
      const updatedTask = await projectService.updateTask(task.id, taskUpdates);
      
      if (!updatedTask) {
        throw new Error('Failed to update task');
      }
      
      setSuccessMessage('Task updated successfully!');
      
      // Call the callback if provided
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask);
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    } finally {
      setIsLoading(false);
    }
  };
  
  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' }
  ];
  
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];
  
  const milestoneOptions = [
    { value: '', label: 'No Milestone' },
    ...milestones.map(milestone => ({
      value: milestone.id,
      label: milestone.title
    }))
  ];
  
  // Check if user has permission to edit tasks
  const canEditTask = hasPermission('edit:project');
  
  if (!canEditTask) {
    return (
      <div className={className}>
        <Card>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-red-600">You don't have permission to edit tasks.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <Heading level={3}>Edit Task</Heading>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <Input
                  label="Task Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <ExpandingTextarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minRows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Due Date"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Select
                    label="Milestone"
                    options={milestoneOptions}
                    value={selectedMilestoneId}
                    onChange={(value) => setSelectedMilestoneId(value)}
                    isLoading={isLoadingMilestones}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={status}
                    onChange={(value) => setStatus(value as TaskStatus)}
                  />
                </div>
                
                <div>
                  <Select
                    label="Priority"
                    options={priorityOptions}
                    value={priority}
                    onChange={(value) => setPriority(value as TaskPriority)}
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                >
                  Cancel
                </Button>
              )}
              
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                Update Task
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditTask;
