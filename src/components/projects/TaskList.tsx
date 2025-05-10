import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types/project';
import { projectService } from '../../services/projectService';
import {
  Text,
  Select,
  Button,
  Card,
  CardContent,
  Heading
} from '../ui';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit as EditIcon,
  Trash2,
  User
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  minimal?: boolean;
  className?: string;
  projectId?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate,
  onEditTask,
  onDeleteTask,
  minimal = false,
  className = '',
  projectId
}) => {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setUpdatingTaskId(taskId);
      const updatedTask = await projectService.updateTaskStatus(
        taskId,
        newStatus as TaskStatus
      );

      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }

      setUpdatingTaskId(null);
    } catch (err) {
      console.error('Error updating task status:', err);
      setUpdatingTaskId(null);
    }
  };

  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <Clock className="h-4 w-4 text-gray-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <Clock className="h-4 w-4 text-gray-600" />;
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

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' }
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {tasks.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-gray-400" />
              </div>
              <Heading level={4} className="mb-2">No tasks yet</Heading>
              <Text variant="muted" className="mb-6">
                Add your first task to get started
              </Text>
              {onEditTask && (
                <Button
                  variant="primary"
                  onClick={() => onEditTask({
                    id: '',
                    project_id: projectId || '',
                    title: '',
                    status: 'todo',
                    priority: 'medium',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  })}
                >
                  Add Your First Task
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        tasks.map(task => (
          <Card
            key={task.id}
            className={`transition-all duration-200 hover:shadow-sm ${
              task.status === 'completed' ? 'bg-gray-50' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex flex-col">
                {/* Task header - always visible */}
                <div className="flex flex-col sm:flex-row justify-between">
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-2">
                      <button
                        onClick={() => toggleTaskExpansion(task.id)}
                        className="flex items-center text-left focus:outline-none"
                      >
                        {expandedTaskId === task.id ? (
                          <ChevronUp className="h-4 w-4 text-gray-500 mr-2" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-gray-500 mr-2" />
                        )}
                        <Text
                          weight="medium"
                          className={task.status === 'completed' ? 'line-through text-gray-500' : ''}
                        >
                          {task.title}
                        </Text>
                      </button>

                      <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(task.status)}`}>
                        {getStatusIcon(task.status)}
                        <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                      </div>

                      {!minimal && (
                        <div className={`flex items-center px-2 py-1 rounded-full text-xs ${getPriorityBadgeClass(task.priority)}`}>
                          {getPriorityIcon(task.priority)}
                          <span className="ml-1 capitalize">{task.priority}</span>
                        </div>
                      )}
                    </div>

                    {/* Simple view - just show due date if available */}
                    {!expandedTaskId && task.due_date && (
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Due: {formatDate(task.due_date)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 sm:mt-0 sm:ml-4 flex items-center space-x-2">
                    <Select
                      options={statusOptions}
                      value={task.status}
                      onChange={(value) => handleStatusChange(task.id, value)}
                      disabled={updatingTaskId === task.id}
                      className="w-32"
                      selectClassName={minimal ? 'py-1 text-sm' : ''}
                    />

                    {onEditTask && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTask(task)}
                        title="Edit task"
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                    )}

                    {onDeleteTask && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTask(task.id)}
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded view - show full details */}
                {expandedTaskId === task.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {task.description ? (
                      <div className="mb-4">
                        <Text weight="medium" className="text-sm text-gray-700 mb-1">Description</Text>
                        <Text variant="muted" className="whitespace-pre-line">
                          {task.description}
                        </Text>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <Text variant="muted" className="text-sm italic">No description provided</Text>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Text weight="medium" className="text-sm text-gray-700 mb-1">Due Date</Text>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <Text>{formatDate(task.due_date)}</Text>
                        </div>
                      </div>

                      {task.assignee_id && (
                        <div>
                          <Text weight="medium" className="text-sm text-gray-700 mb-1">Assigned To</Text>
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-500 mr-2" />
                            <Text>{task.assignee_id}</Text>
                          </div>
                        </div>
                      )}

                      {task.completed_at && (
                        <div>
                          <Text weight="medium" className="text-sm text-gray-700 mb-1">Completed</Text>
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <Text>{formatDate(task.completed_at)}</Text>
                          </div>
                        </div>
                      )}

                      <div>
                        <Text weight="medium" className="text-sm text-gray-700 mb-1">Created</Text>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                          <Text>{formatDate(task.created_at)}</Text>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default TaskList;
