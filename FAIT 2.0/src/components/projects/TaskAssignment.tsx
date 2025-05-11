import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  User,
  Calendar,
  Tag,
  Filter
} from 'lucide-react';
import { ProjectTask, TaskStatus, TaskPriority } from '../../types/project';
import { Profile } from '../../types/user';
import { projectService } from '../../services/ProjectService';
import { userService } from '../../services/UserService';
import { formatDistanceToNow } from 'date-fns';

interface TaskAssignmentProps {
  projectId: string;
  milestoneId?: string;
  isEditable?: boolean;
}

const TaskAssignment: React.FC<TaskAssignmentProps> = ({ 
  projectId, 
  milestoneId,
  isEditable = false 
}) => {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [projectMembers, setProjectMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [priorityFilter, setFilterPriority] = useState<string>('all');
  
  // Form state for adding/editing tasks
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee_id: '',
    milestone_id: milestoneId || ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjectMembers();
  }, [projectId, milestoneId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectTasks(projectId, milestoneId);
      setTasks(data);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async () => {
    try {
      const members = await projectService.getProjectMembers(projectId);
      setProjectMembers(members);
    } catch (err) {
      console.error('Failed to load project members:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newTask = await projectService.createTask({
        project_id: projectId,
        milestone_id: formData.milestone_id || null,
        title: formData.title,
        description: formData.description,
        due_date: formData.due_date,
        status: formData.status,
        priority: formData.priority,
        assignee_id: formData.assignee_id || null
      });

      if (newTask) {
        setTasks([...tasks, newTask]);
        setIsAddingTask(false);
        setFormData({
          title: '',
          description: '',
          due_date: '',
          status: 'todo',
          priority: 'medium',
          assignee_id: '',
          milestone_id: milestoneId || ''
        });
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const handleEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTaskId) return;
    
    try {
      const updatedTask = await projectService.updateTask(
        editingTaskId,
        {
          title: formData.title,
          description: formData.description,
          due_date: formData.due_date,
          status: formData.status,
          priority: formData.priority,
          assignee_id: formData.assignee_id || null,
          milestone_id: formData.milestone_id || null
        }
      );

      if (updatedTask) {
        setTasks(tasks.map(t => 
          t.id === editingTaskId ? updatedTask : t
        ));
        setEditingTaskId(null);
        setFormData({
          title: '',
          description: '',
          due_date: '',
          status: 'todo',
          priority: 'medium',
          assignee_id: '',
          milestone_id: milestoneId || ''
        });
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const success = await projectService.deleteTask(id);
      
      if (success) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleUpdateTaskStatus = async (id: string, status: TaskStatus) => {
    try {
      const updatedTask = await projectService.updateTaskStatus(id, status);
      
      if (updatedTask) {
        setTasks(tasks.map(t => 
          t.id === id ? updatedTask : t
        ));
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const startEditTask = (task: ProjectTask) => {
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date,
      status: task.status,
      priority: task.priority,
      assignee_id: task.assignee_id || '',
      milestone_id: task.milestone_id || ''
    });
    setEditingTaskId(task.id);
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">High</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Medium</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Low</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Normal</span>;
    }
  };

  // Filter tasks based on selected filters
  const filteredTasks = tasks.filter(task => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const assigneeMatch = assigneeFilter === 'all' || task.assignee_id === assigneeFilter || (assigneeFilter === 'unassigned' && !task.assignee_id);
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return statusMatch && assigneeMatch && priorityMatch;
  });

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
        <h3 className="text-lg font-medium text-gray-900">
          {milestoneId ? 'Milestone Tasks' : 'Project Tasks'}
        </h3>
        {isEditable && (
          <button
            onClick={() => setIsAddingTask(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </button>
        )}
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-10 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <User className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-10 text-sm"
            >
              <option value="all">All Assignees</option>
              <option value="unassigned">Unassigned</option>
              {projectMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.full_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <Tag className="h-4 w-4 text-gray-400 mr-2" />
            <select
              value={priorityFilter}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-10 text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {isAddingTask && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAddTask} className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label htmlFor="assignee_id" className="block text-sm font-medium text-gray-700">
                  Assignee
                </label>
                <select
                  name="assignee_id"
                  id="assignee_id"
                  value={formData.assignee_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  name="priority"
                  id="priority"
                  required
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            {!milestoneId && (
              <div>
                <label htmlFor="milestone_id" className="block text-sm font-medium text-gray-700">
                  Milestone (Optional)
                </label>
                <select
                  name="milestone_id"
                  id="milestone_id"
                  value={formData.milestone_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">No Milestone</option>
                  {/* Milestone options would be populated here */}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Task
              </button>
            </div>
          </form>
        </div>
      )}

      {editingTaskId && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleEditTask} className="space-y-4">
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label htmlFor="edit-assignee_id" className="block text-sm font-medium text-gray-700">
                  Assignee
                </label>
                <select
                  name="assignee_id"
                  id="edit-assignee_id"
                  value={formData.assignee_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Unassigned</option>
                  {projectMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  name="priority"
                  id="edit-priority"
                  required
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            {!milestoneId && (
              <div>
                <label htmlFor="edit-milestone_id" className="block text-sm font-medium text-gray-700">
                  Milestone (Optional)
                </label>
                <select
                  name="milestone_id"
                  id="edit-milestone_id"
                  value={formData.milestone_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">No Milestone</option>
                  {/* Milestone options would be populated here */}
                </select>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditingTaskId(null)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Update Task
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">
            {tasks.length === 0 
              ? "No tasks have been added yet." 
              : "No tasks match the selected filters."}
          </p>
          {isEditable && tasks.length === 0 && (
            <button
              onClick={() => setIsAddingTask(true)}
              className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Task
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <li key={task.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="mr-3">
                  {getStatusIcon(task.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    {isEditable && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEditTask(task)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="mt-1 text-sm text-gray-500">{task.description}</p>
                  )}
                  
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {getPriorityBadge(task.priority)}
                    </div>
                    
                    {task.assignee && (
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>{task.assignee.full_name}</span>
                      </div>
                    )}
                    
                    {task.created_at && (
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</span>
                      </div>
                    )}
                  </div>
                  
                  {isEditable && (
                    <div className="mt-2 flex space-x-2">
                      {task.status !== 'todo' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'todo')}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                        >
                          To Do
                        </button>
                      )}
                      
                      {task.status !== 'in_progress' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'in_progress')}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                        >
                          In Progress
                        </button>
                      )}
                      
                      {task.status !== 'completed' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200"
                        >
                          Complete
                        </button>
                      )}
                      
                      {task.status !== 'blocked' && (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'blocked')}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
                        >
                          Blocked
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskAssignment;
