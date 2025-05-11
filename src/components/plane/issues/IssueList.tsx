import React, { useState, useEffect } from 'react';
import { ProjectIssue, IssueState, IssuePriority } from '../../../types/plane-integration';
import { projectIssueService } from '../../../services/ProjectIssueService';
import { useAuth } from '../../../contexts/AuthContext';

interface IssueListProps {
  projectId: string;
  onIssueSelect?: (issue: ProjectIssue) => void;
  onCreateIssue?: () => void;
}

const IssueList: React.FC<IssueListProps> = ({ 
  projectId, 
  onIssueSelect,
  onCreateIssue
}) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterState, setFilterState] = useState<IssueState | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<IssuePriority | 'all'>('all');

  useEffect(() => {
    const fetchIssues = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const issuesData = await projectIssueService.getProjectIssues(projectId);
        setIssues(issuesData);
      } catch (err: any) {
        console.error('Error fetching issues:', err);
        setError(err.message || 'Failed to load issues');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIssues();
  }, [projectId]);

  const getFilteredIssues = () => {
    return issues.filter(issue => {
      const stateMatch = filterState === 'all' || issue.state === filterState;
      const priorityMatch = filterPriority === 'all' || issue.priority === filterPriority;
      return stateMatch && priorityMatch;
    });
  };

  const getStateBadgeClass = (state: IssueState) => {
    switch (state) {
      case 'backlog':
        return 'bg-gray-100 text-gray-800';
      case 'todo':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_review':
        return 'bg-purple-100 text-purple-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeClass = (priority: IssuePriority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'none':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const getStateLabel = (state: IssueState) => {
    switch (state) {
      case 'backlog':
        return 'Backlog';
      case 'todo':
        return 'To Do';
      case 'in_progress':
        return 'In Progress';
      case 'in_review':
        return 'In Review';
      case 'done':
        return 'Done';
      case 'canceled':
        return 'Canceled';
      default:
        return state;
    }
  };

  const getPriorityLabel = (priority: IssuePriority) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      case 'none':
        return 'None';
      default:
        return priority;
    }
  };

  const filteredIssues = getFilteredIssues();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Project Issues</h3>
        <div className="flex space-x-2">
          <div>
            <label htmlFor="state-filter" className="sr-only">Filter by State</label>
            <select
              id="state-filter"
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as IssueState | 'all')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All States</option>
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
          <div>
            <label htmlFor="priority-filter" className="sr-only">Filter by Priority</label>
            <select
              id="priority-filter"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as IssuePriority | 'all')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="none">None</option>
            </select>
          </div>
          {onCreateIssue && (
            <button
              onClick={onCreateIssue}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Issue
            </button>
          )}
        </div>
      </div>
      
      {filteredIssues.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No issues found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new issue.
          </p>
          {onCreateIssue && (
            <div className="mt-6">
              <button
                onClick={onCreateIssue}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Issue
              </button>
            </div>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredIssues.map((issue) => (
            <li 
              key={issue.id} 
              className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onIssueSelect && onIssueSelect(issue)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center justify-center h-10 w-10 rounded-md ${getPriorityBadgeClass(issue.priority)}`}>
                      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                    <div className="text-sm text-gray-500">
                      {issue.description ? (
                        issue.description.length > 100 
                          ? `${issue.description.substring(0, 100)}...` 
                          : issue.description
                      ) : 'No description'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateBadgeClass(issue.state)}`}>
                    {getStateLabel(issue.state)}
                  </span>
                  {issue.due_date && (
                    <span className="text-xs text-gray-500">
                      Due: {formatDate(issue.due_date)}
                    </span>
                  )}
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              {issue.labels && issue.labels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {issue.labels.map((label, index) => (
                    <span 
                      key={index} 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default IssueList;
