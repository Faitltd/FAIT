import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types/project';
import { projectService } from '../../services/projectService';
import {
  Card,
  CardContent,
  Heading,
  Text,
  Button
} from '../ui';
import {
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';

interface KanbanBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate?: (task: Task) => void;
  onAddTask?: () => void;
  onEditTask?: (task: Task) => void;
  className?: string;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  projectId,
  tasks,
  onTaskUpdate,
  onAddTask,
  onEditTask,
  className = ''
}) => {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in_progress', title: 'In Progress' },
    { id: 'completed', title: 'Completed' },
    { id: 'blocked', title: 'Blocked' }
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    
    if (!draggingTaskId) return;
    
    const task = tasks.find(t => t.id === draggingTaskId);
    if (!task || task.status === newStatus) {
      setDraggingTaskId(null);
      return;
    }
    
    try {
      setUpdatingTaskId(draggingTaskId);
      const updatedTask = await projectService.updateTaskStatus(draggingTaskId, newStatus);
      
      if (onTaskUpdate) {
        onTaskUpdate(updatedTask);
      }
      
      setUpdatingTaskId(null);
    } catch (err) {
      console.error('Error updating task status:', err);
      setUpdatingTaskId(null);
    }
    
    setDraggingTaskId(null);
  };

  const getPriorityBadgeClass = (priority: TaskPriority) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`kanban-board ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="bg-gray-100 rounded-t-lg p-3">
              <div className="flex justify-between items-center">
                <Heading level={4}>{column.title}</Heading>
                <div className="bg-gray-200 rounded-full px-2 py-1 text-xs font-medium">
                  {getTasksByStatus(column.id).length}
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-b-lg p-2 min-h-[300px]">
              {getTasksByStatus(column.id).map(task => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(task.id)}
                  className={`mb-2 cursor-move ${updatingTaskId === task.id ? 'opacity-50' : ''}`}
                  onClick={() => onEditTask && onEditTask(task)}
                >
                  <Card hover className="transition-all duration-200">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-start">
                        <Text weight="medium" className="mb-2">{task.title}</Text>
                        <div className={`text-xs px-2 py-1 rounded-full ${getPriorityBadgeClass(task.priority)}`}>
                          {task.priority}
                        </div>
                      </div>
                      
                      {task.description && (
                        <Text variant="muted" size="sm" className="mb-2 line-clamp-2">
                          {task.description}
                        </Text>
                      )}
                      
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                        {task.due_date && (
                          <div className="flex items-center">
                            <Calendar size={12} className="mr-1" />
                            {formatDate(task.due_date)}
                          </div>
                        )}
                        
                        {task.assignee_id && (
                          <div className="flex items-center">
                            <User size={12} className="mr-1" />
                            Assigned
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
              
              {column.id === 'todo' && onAddTask && (
                <Button 
                  variant="ghost" 
                  className="w-full mt-2 border border-dashed border-gray-300"
                  onClick={onAddTask}
                >
                  <Plus size={16} className="mr-1" />
                  Add Task
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;
