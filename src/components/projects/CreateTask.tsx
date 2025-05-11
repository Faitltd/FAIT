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

interface CreateTaskProps {
  projectId: string;
  milestoneId?: string;
  task?: Task | null;
  onTaskCreated?: (task: Task) => void;
  onCancel?: () => void;
  className?: string;
}

const CreateTask: React.FC<CreateTaskProps> = ({
  projectId,
  milestoneId,
  task,
  onTaskCreated,
  onCancel,
  className = ''
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.due_date?.split('T')[0] || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || '');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(task?.milestone_id || milestoneId || '');

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { user, hasPermission } = useAuth();

  // Fetch milestones for the project
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!projectId) return;

      try {
        setIsLoadingMilestones(true);
        const projectData = await projectService.getProjectById(projectId, ['milestones']);
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
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to create a task');
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

      // Create task object
      const taskData: Partial<Task> = {
        project_id: projectId,
        milestone_id: selectedMilestoneId || undefined,
        title,
        description,
        due_date: dueDate || undefined,
        status,
        priority,
        assignee_id: assigneeId || undefined,
        updated_at: new Date().toISOString()
      };

      let resultTask: Task;

      if (task?.id) {
        // Update existing task
        resultTask = await projectService.updateTask(task.id, taskData);
        setSuccessMessage('Task updated successfully!');
      } else {
        // Create new task
        taskData.created_at = new Date().toISOString();
        resultTask = await projectService.createTask(taskData);
        setSuccessMessage('Task created successfully!');

        // Reset form for new task creation
        setTitle('');
        setDescription('');
        setDueDate('');
        setStatus('todo');
        setPriority('medium');
        setAssigneeId('');
      }

      // Call the callback if provided
      if (onTaskCreated) {
        onTaskCreated(resultTask);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err instanceof Error ? err.message : 'Failed to save task');
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

  // Check if user has permission to create tasks
  const canCreateTask = hasPermission('create:project');

  if (!canCreateTask) {
    return (
      <div className={className}>
        <Card>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-red-600">You don't have permission to create tasks.</p>
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
            <Heading level={3}>{task ? 'Edit Task' : 'Create New Task'}</Heading>
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
                {task ? 'Update Task' : 'Create Task'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateTask;
