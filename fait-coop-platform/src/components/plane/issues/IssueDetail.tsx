import React, { useState, useEffect } from 'react';
import { ProjectIssue, ProjectIssueComment, IssueState, IssuePriority } from '../../../types/plane-integration';
import { projectIssueService } from '../../../services/ProjectIssueService';
import { useAuth } from '../../../contexts/AuthContext';

interface IssueDetailProps {
  issue: ProjectIssue;
  onClose?: () => void;
  onUpdate?: (updatedIssue: ProjectIssue) => void;
  onDelete?: () => void;
}

const IssueDetail: React.FC<IssueDetailProps> = ({ 
  issue, 
  onClose,
  onUpdate,
  onDelete
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<ProjectIssueComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedIssue, setEditedIssue] = useState<ProjectIssue>(issue);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      if (!issue.id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const commentsData = await projectIssueService.getIssueComments(issue.id);
        setComments(commentsData);
      } catch (err: any) {
        console.error('Error fetching comments:', err);
        setError(err.message || 'Failed to load comments');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [issue.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !newComment.trim()) return;
    
    setIsSubmittingComment(true);
    
    try {
      const comment = await projectIssueService.addComment({
        issue_id: issue.id,
        user_id: user.id,
        comment: newComment
      });
      
      setComments([...comments, comment]);
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
      setError('Failed to submit comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveIssue = async () => {
    if (!onUpdate) return;
    
    setIsSaving(true);
    
    try {
      const updatedIssue = await projectIssueService.updateIssue(issue.id, editedIssue);
      onUpdate(updatedIssue);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating issue:', err);
      setError('Failed to update issue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!onDelete) return;
    
    if (!window.confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await projectIssueService.deleteIssue(issue.id);
      onDelete();
    } catch (err) {
      console.error('Error deleting issue:', err);
      setError('Failed to delete issue');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
        <div>
          {isEditing ? (
            <input
              type="text"
              value={editedIssue.title}
              onChange={(e) => setEditedIssue({ ...editedIssue, title: e.target.value })}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-lg border-gray-300 rounded-md"
              placeholder="Issue title"
            />
          ) : (
            <h3 className="text-lg leading-6 font-medium text-gray-900">{issue.title}</h3>
          )}
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Issue #{issue.id.substring(0, 8)}
          </p>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveIssue}
                disabled={isSaving}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              {onUpdate && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={handleDeleteIssue}
                  disabled={isDeleting}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-300"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">State</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <select
                  value={editedIssue.state}
                  onChange={(e) => setEditedIssue({ ...editedIssue, state: e.target.value as IssueState })}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="in_review">In Review</option>
                  <option value="done">Done</option>
                  <option value="canceled">Canceled</option>
                </select>
              ) : (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStateBadgeClass(issue.state)}`}>
                  {issue.state === 'backlog' ? 'Backlog' :
                   issue.state === 'todo' ? 'To Do' :
                   issue.state === 'in_progress' ? 'In Progress' :
                   issue.state === 'in_review' ? 'In Review' :
                   issue.state === 'done' ? 'Done' :
                   issue.state === 'canceled' ? 'Canceled' : issue.state}
                </span>
              )}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Priority</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <select
                  value={editedIssue.priority}
                  onChange={(e) => setEditedIssue({ ...editedIssue, priority: e.target.value as IssuePriority })}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                  <option value="none">None</option>
                </select>
              ) : (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeClass(issue.priority)}`}>
                  {issue.priority === 'urgent' ? 'Urgent' :
                   issue.priority === 'high' ? 'High' :
                   issue.priority === 'medium' ? 'Medium' :
                   issue.priority === 'low' ? 'Low' :
                   issue.priority === 'none' ? 'None' : issue.priority}
                </span>
              )}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Description</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <textarea
                  value={editedIssue.description || ''}
                  onChange={(e) => setEditedIssue({ ...editedIssue, description: e.target.value })}
                  rows={4}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Issue description"
                />
              ) : (
                issue.description || 'No description provided'
              )}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Due Date</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <input
                  type="date"
                  value={editedIssue.due_date ? new Date(editedIssue.due_date).toISOString().split('T')[0] : ''}
                  onChange={(e) => setEditedIssue({ ...editedIssue, due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              ) : (
                formatDate(issue.due_date)
              )}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Labels</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {isEditing ? (
                <input
                  type="text"
                  value={editedIssue.labels ? editedIssue.labels.join(', ') : ''}
                  onChange={(e) => setEditedIssue({ 
                    ...editedIssue, 
                    labels: e.target.value.split(',').map(label => label.trim()).filter(Boolean)
                  })}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Comma-separated labels"
                />
              ) : (
                <div className="flex flex-wrap gap-1">
                  {issue.labels && issue.labels.length > 0 ? (
                    issue.labels.map((label, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {label}
                      </span>
                    ))
                  ) : (
                    'No labels'
                  )}
                </div>
              )}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDateTime(issue.created_at)}
            </dd>
          </div>
          
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formatDateTime(issue.updated_at)}
            </dd>
          </div>
        </dl>
      </div>
      
      <div className="px-4 py-5 sm:px-6 border-t border-gray-200">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Comments</h4>
        
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading comments...</p>
          </div>
        ) : error ? (
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
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <div className="font-medium text-gray-900">
                    {comment.user_id === user?.id ? 'You' : comment.user_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDateTime(comment.created_at)}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.comment}
                </div>
              </li>
            ))}
          </ul>
        )}
        
        <form onSubmit={handleSubmitComment} className="mt-6">
          <div>
            <label htmlFor="comment" className="sr-only">Add a comment</label>
            <textarea
              id="comment"
              name="comment"
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmittingComment || !newComment.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isSubmittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueDetail;
