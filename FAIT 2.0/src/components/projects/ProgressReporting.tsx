import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  PieChart, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ArrowUp, 
  ArrowDown,
  Download,
  Filter
} from 'lucide-react';
import { projectService } from '../../services/ProjectService';
import { ProjectProgress, ProjectStats } from '../../types/project';

interface ProgressReportingProps {
  projectId: string;
  startDate?: string;
  endDate?: string;
}

const ProgressReporting: React.FC<ProgressReportingProps> = ({ 
  projectId, 
  startDate, 
  endDate 
}) => {
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>(startDate || '');
  const [customEndDate, setCustomEndDate] = useState<string>(endDate || '');

  useEffect(() => {
    fetchProjectProgress();
    fetchProjectStats();
  }, [projectId, timeRange, customStartDate, customEndDate]);

  const fetchProjectProgress = async () => {
    try {
      setLoading(true);
      
      let dateParams = {};
      if (timeRange === 'custom' && customStartDate) {
        dateParams = { 
          start_date: customStartDate,
          end_date: customEndDate || undefined
        };
      } else if (timeRange !== 'all') {
        dateParams = { time_range: timeRange };
      }
      
      const data = await projectService.getProjectProgress(projectId, dateParams);
      setProgress(data);
      setError(null);
    } catch (err) {
      setError('Failed to load project progress');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectStats = async () => {
    try {
      let dateParams = {};
      if (timeRange === 'custom' && customStartDate) {
        dateParams = { 
          start_date: customStartDate,
          end_date: customEndDate || undefined
        };
      } else if (timeRange !== 'all') {
        dateParams = { time_range: timeRange };
      }
      
      const data = await projectService.getProjectStats(projectId, dateParams);
      setStats(data);
    } catch (err) {
      console.error('Failed to load project stats:', err);
    }
  };

  const handleExportReport = async () => {
    try {
      let dateParams = {};
      if (timeRange === 'custom' && customStartDate) {
        dateParams = { 
          start_date: customStartDate,
          end_date: customEndDate || undefined
        };
      } else if (timeRange !== 'all') {
        dateParams = { time_range: timeRange };
      }
      
      await projectService.exportProjectReport(projectId, dateParams);
    } catch (err) {
      console.error('Failed to export project report:', err);
    }
  };

  const getCompletionPercentage = () => {
    if (!progress) return 0;
    
    const { completed_tasks, total_tasks } = progress;
    if (total_tasks === 0) return 0;
    
    return Math.round((completed_tasks / total_tasks) * 100);
  };

  const getMilestoneCompletionPercentage = () => {
    if (!progress) return 0;
    
    const { completed_milestones, total_milestones } = progress;
    if (total_milestones === 0) return 0;
    
    return Math.round((completed_milestones / total_milestones) * 100);
  };

  const getTimeProgress = () => {
    if (!progress || !progress.start_date || !progress.end_date) return 0;
    
    const startDate = new Date(progress.start_date).getTime();
    const endDate = new Date(progress.end_date).getTime();
    const currentDate = new Date().getTime();
    
    if (startDate >= endDate) return 0;
    
    const totalDuration = endDate - startDate;
    const elapsedDuration = currentDate - startDate;
    
    if (elapsedDuration <= 0) return 0;
    if (elapsedDuration >= totalDuration) return 100;
    
    return Math.round((elapsedDuration / totalDuration) * 100);
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-500';
    if (percentage >= 60) return 'text-blue-500';
    if (percentage >= 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusIndicator = (current: number, previous: number) => {
    if (current === previous) return null;
    
    if (current > previous) {
      return <ArrowUp className="h-3 w-3 text-green-500" />;
    } else {
      return <ArrowDown className="h-3 w-3 text-red-500" />;
    }
  };

  if (loading && !progress) {
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
        <h3 className="text-lg font-medium text-gray-900">Project Progress</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-1" />
            Export Report
          </button>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label htmlFor="time-range" className="block text-sm font-medium text-gray-700 mb-1">
              Time Range
            </label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-10 text-sm"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {timeRange === 'custom' && (
            <>
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start-date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 px-3 text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end-date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 px-3 text-sm"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {progress && (
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Task Completion</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {getCompletionPercentage()}%
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {progress.completed_tasks} of {progress.total_tasks} tasks
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${getStatusColor(getCompletionPercentage())}`}>
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Milestone Progress</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {getMilestoneCompletionPercentage()}%
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {progress.completed_milestones} of {progress.total_milestones} milestones
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${getStatusColor(getMilestoneCompletionPercentage())}`}>
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${getMilestoneCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">Time Progress</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">
                    {getTimeProgress()}%
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {progress.days_elapsed} of {progress.total_days} days
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gray-100 ${getStatusColor(100 - getTimeProgress())}`}>
                  <Clock className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-yellow-600 h-2.5 rounded-full" 
                    style={{ width: `${getTimeProgress()}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Task Status Distribution</h4>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p>Chart would be displayed here</p>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs">To Do: {stats.todo_tasks}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-xs">In Progress: {stats.in_progress_tasks}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs">Completed: {stats.completed_tasks}</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        <span className="text-xs">Blocked: {stats.blocked_tasks}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Task Completion Trend</h4>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <p>Chart would be displayed here</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Key Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500">Avg. Task Completion Time</p>
                <p className="text-lg font-medium text-gray-900">
                  {progress.avg_task_completion_days} days
                </p>
                {stats && (
                  <div className="flex items-center text-xs mt-1">
                    {getStatusIndicator(
                      progress.avg_task_completion_days, 
                      stats.previous_avg_task_completion_days
                    )}
                    <span className="ml-1">
                      vs {stats.previous_avg_task_completion_days} days
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Tasks Completed This Week</p>
                <p className="text-lg font-medium text-gray-900">
                  {progress.tasks_completed_this_week}
                </p>
                {stats && (
                  <div className="flex items-center text-xs mt-1">
                    {getStatusIndicator(
                      progress.tasks_completed_this_week, 
                      stats.tasks_completed_last_week
                    )}
                    <span className="ml-1">
                      vs {stats.tasks_completed_last_week} last week
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Overdue Tasks</p>
                <p className="text-lg font-medium text-gray-900">
                  {progress.overdue_tasks}
                </p>
                {stats && (
                  <div className="flex items-center text-xs mt-1">
                    {getStatusIndicator(
                      stats.previous_overdue_tasks,
                      progress.overdue_tasks
                    )}
                    <span className="ml-1">
                      vs {stats.previous_overdue_tasks} previously
                    </span>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-xs text-gray-500">Team Velocity</p>
                <p className="text-lg font-medium text-gray-900">
                  {progress.team_velocity} tasks/week
                </p>
                {stats && (
                  <div className="flex items-center text-xs mt-1">
                    {getStatusIndicator(
                      progress.team_velocity,
                      stats.previous_team_velocity
                    )}
                    <span className="ml-1">
                      vs {stats.previous_team_velocity} previously
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressReporting;
