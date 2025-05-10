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
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/ProjectService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

// Inferred types based on usage in TaskAssignment component
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ProjectTask {
  id: string;
  project_id: string;
  milestone_id: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;

  // Joined fields
  assignee?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  project?: {
    id: string;
    title: string;
  };
  milestone?: {
    id: string;
    title: string;
  };
}

interface Project {
  id: string;
  title: string;
}

const TasksPage: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Sort states
  const [sortField, setSortField] = useState<string>('due_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Form state for adding/editing tasks
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    project_id: '',
    milestone_id: '',
    title: '',
    description: '',
    due_date: '',
    status: 'todo' as TaskStatus,
    priority: 'medium' as TaskPriority,
    assignee_id: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);

      // Assuming there's a method to get all tasks for the current user
      // If not, we'll need to fetch tasks for each project
      const allTasks: ProjectTask[] = [];

      // Get all projects for the current user
      const userProjects = await projectService.getProjects(user?.role || 'client');

      // For each project, get its tasks
      for (const project of userProjects) {
        const projectTasks = await projectService.getProjectTasks(project.id);
        // Add project info to each task
        const tasksWithProject = projectTasks.map(task => ({
          ...task,
          project: {
            id: project.id,
            title: project.title
          }
        }));
        allTasks.push(...tasksWithProject);
      }

      setTasks(allTasks);
      setError(null);
    } catch (err) {
      setError('Failed to load tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const data = await projectService.getProjects(user?.role || 'client');
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const newTask = await projectService.createTask({
        project_id: formData.project_id,
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
        resetForm();
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
        resetForm();
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

  const resetForm = () => {
    setFormData({
      project_id: '',
      milestone_id: '',
      title: '',
      description: '',
      due_date: '',
      status: 'todo',
      priority: 'medium',
      assignee_id: ''
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Filter by project
      if (projectFilter !== 'all' && task.project_id !== projectFilter) {
        return false;
      }

      // Filter by status
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }

      // Filter by priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Filter by search term
      if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    });
  };

  const getSortedTasks = () => {
    const filteredTasks = getFilteredTasks();

    return filteredTasks.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'due_date':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder = { todo: 0, in_progress: 1, blocked: 2, completed: 3 };
          comparison = statusOrder[a.status] - statusOrder[b.status];
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'todo':
        return <Circle className="h-5 w-5 text-gray-400" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-primary-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-secondary-500" />;
      case 'blocked':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Low</span>;
      case 'medium':
        return <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800">Medium</span>;
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-secondary-100 text-secondary-800">High</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Low</span>;
    }
  };

  const sortedTasks = getSortedTasks();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Project Tasks</h1>
        <button
          onClick={() => setIsAddingTask(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md flex items-center"
          data-cy="add-task"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-cy="filter-project"
            >
              <option value="all">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-cy="filter-status"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              data-cy="filter-priority"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                data-cy="search-tasks"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center">
                  Task
                  {sortField === 'title' && (
                    sortDirection === 'asc' ?
                    <ChevronUp className="h-4 w-4 ml-1" /> :
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center">
                  Priority
                  {sortField === 'priority' && (
                    sortDirection === 'asc' ?
                    <ChevronUp className="h-4 w-4 ml-1" /> :
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('due_date')}
              >
                <div className="flex items-center">
                  Due Date
                  {sortField === 'due_date' && (
                    sortDirection === 'asc' ?
                    <ChevronUp className="h-4 w-4 ml-1" /> :
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  No tasks found. Try adjusting your filters or create a new task.
                </td>
              </tr>
            ) : (
              sortedTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          const nextStatus = task.status === 'todo'
                            ? 'in_progress'
                            : task.status === 'in_progress'
                              ? 'completed'
                              : task.status === 'completed'
                                ? 'todo'
                                : 'todo';
                          handleUpdateTaskStatus(task.id, nextStatus);
                        }}
                        className="focus:outline-none"
                        data-cy={`task-status-${task.id}`}
                      >
                        {getStatusIcon(task.status)}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Briefcase className="h-4 w-4 text-gray-400 mr-1" />
                      <Link
                        to={`/projects/${task.project_id}`}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {task.project?.title || 'Unknown Project'}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {task.due_date
                          ? formatDistanceToNow(new Date(task.due_date), { addSuffix: true })
                          : 'No due date'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-500">
                        {task.assignee?.full_name || 'Unassigned'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setEditingTaskId(task.id);
                        setFormData({
                          project_id: task.project_id,
                          milestone_id: task.milestone_id || '',
                          title: task.title,
                          description: task.description,
                          due_date: task.due_date || '',
                          status: task.status,
                          priority: task.priority,
                          assignee_id: task.assignee_id || ''
                        });
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      data-cy={`edit-task-${task.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-900"
                      data-cy={`delete-task-${task.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Task Modal */}
      {(isAddingTask || editingTaskId) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {editingTaskId ? 'Edit Task' : 'Add New Task'}
            </h2>
            <form onSubmit={editingTaskId ? handleEditTask : handleAddTask}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <select
                    value={formData.project_id}
                    onChange={(e) => setFormData({...formData, project_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                    data-cy="task-project"
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>{project.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Milestone (Optional)</label>
                  <input
                    type="text"
                    value={formData.milestone_id}
                    onChange={(e) => setFormData({...formData, milestone_id: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Milestone ID"
                    data-cy="task-milestone"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Task title"
                  required
                  data-cy="task-title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Task description"
                  rows={3}
                  data-cy="task-description"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as TaskStatus})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    data-cy="task-status"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as TaskPriority})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    data-cy="task-priority"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    data-cy="task-due-date"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee ID (Optional)</label>
                <input
                  type="text"
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Assignee ID"
                  data-cy="task-assignee"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTask(false);
                    setEditingTaskId(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  data-cy="cancel-task"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  data-cy="save-task"
                >
                  {editingTaskId ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
