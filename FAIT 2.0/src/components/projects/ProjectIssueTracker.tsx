import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Plus,
  Check,
  X,
  Clock,
  ChevronDown,
  ChevronUp,
  Flag
} from 'lucide-react';
import { ProjectIssue, ProjectIssueComment } from '../../types/project';
import { projectService } from '../../services/ProjectService';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface ProjectIssueTrackerProps {
  projectId: string;
  isEditable?: boolean;
}

const ProjectIssueTracker: React.FC<ProjectIssueTrackerProps> = ({
  projectId,
  isEditable = false
}) => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<ProjectIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingIssue, setIsAddingIssue] = useState(false);
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(null);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assigned_to: ''
  });
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchIssues();
  }, [projectId]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjectIssues(projectId);
      setIssues(data);
      setError(null);
    } catch (err) {
      setError('Failed to load project issues');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      const issueId = await projectService.createProjectIssue({
        project_id: projectId,
        reported_by: user.id,
        title: newIssue.title,
        description: newIssue.description,
        priority: newIssue.priority,
        assigned_to: newIssue.assigned_to || null
      });

      if (issueId) {
        // Refresh issues
        fetchIssues();

        // Reset form
        setNewIssue({
          title: '',
          description: '',
          priority: 'medium',
          assigned_to: ''
        });
        setIsAddingIssue(false);
      }
    } catch (err) {
      console.error('Failed to create issue:', err);
    }
  };

  const handleAddComment = async (issueId: string) => {
    if (!newComment.trim() || !user) return;

    try {
      const success = await projectService.addIssueComment(
        issueId,
        user.id,
        newComment
      );

      if (success) {
        // Refresh issues
        fetchIssues();

        // Reset form
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    try {
      const success = await projectService.updateIssueStatus(issueId, newStatus);

      if (success) {
        // Refresh issues
        fetchIssues();
      }
    } catch (err) {
      console.error('Failed to update issue status:', err);
    }
  };

  const toggleIssueExpand = (issueId: string) => {
    if (expandedIssueId === issueId) {
      setExpandedIssueId(null);
    } else {
      setExpandedIssueId(issueId);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-primary-100 text-primary-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Project Issues</h3>
        {isEditable && (
          <button
            onClick={() => setIsAddingIssue(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            New Issue
          </button>
        )}
      </div>

      {/* Add Issue Form */}
      {isAddingIssue && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Report New Issue</h4>
          <form onSubmit={handleAddIssue} className="space-y-3">
            <div>
              <label htmlFor="issue-title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="issue-title"
                value={newIssue.title}
                onChange={(e) => setNewIssue({...newIssue, title: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="issue-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="issue-description"
                value={newIssue.description}
                onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="issue-priority" className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                id="issue-priority"
                value={newIssue.priority}
                onChange={(e) => setNewIssue({...newIssue, priority: e.target.value as 'low' | 'medium' | 'high'})}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingIssue(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create Issue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Issues List */}
      {issues.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-md">
          <p className="text-gray-500">No issues reported for this project.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <div key={issue.id} className="bg-white border border-gray-200 rounded-md overflow-hidden">
              {/* Issue Header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => toggleIssueExpand(issue.id)}
              >
                <div className="flex items-center space-x-3">
                  <Flag className={`h-5 w-5 ${getPriorityColor(issue.priority)}`} />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{issue.title}</h4>
                    <p className="text-xs text-gray-500">
                      Reported {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  {expandedIssueId === issue.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Issue Details */}
              {expandedIssueId === issue.id && (
                <div className="border-t border-gray-200 p-4">
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{issue.description}</p>
                  </div>

                  {/* Status Actions */}
                  {isEditable && (
                    <div className="flex space-x-2 mb-4">
                      {issue.status === 'open' && (
                        <button
                          onClick={() => handleStatusChange(issue.id, 'in_progress')}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Start Working
                        </button>
                      )}

                      {issue.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusChange(issue.id, 'resolved')}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark Resolved
                        </button>
                      )}

                      {(issue.status === 'open' || issue.status === 'in_progress') && (
                        <button
                          onClick={() => handleStatusChange(issue.id, 'closed')}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <X className="h-3 w-3 mr-1" />
                          Close Issue
                        </button>
                      )}

                      {issue.status === 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(issue.id, 'closed')}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Close Issue
                        </button>
                      )}

                      {issue.status === 'resolved' && (
                        <button
                          onClick={() => handleStatusChange(issue.id, 'open')}
                          className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Reopen Issue
                        </button>
                      )}
                    </div>
                  )}

                  {/* Comments */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Comments</h5>

                    {issue.comments && issue.comments.length > 0 ? (
                      <div className="space-y-3">
                        {issue.comments.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-md">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-medium text-gray-900">
                                {comment.user?.full_name || 'Unknown User'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No comments yet.</p>
                    )}

                    {/* Add Comment */}
                    {isEditable && (
                      <div className="mt-3">
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <button
                            onClick={() => handleAddComment(issue.id)}
                            disabled={!newComment.trim()}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectIssueTracker;
