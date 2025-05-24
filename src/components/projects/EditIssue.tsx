import React, { useState, useEffect } from 'react';
import { ProjectIssue, TaskPriority } from '../../types/project';
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

interface EditIssueProps {
  issue: ProjectIssue;
  onIssueUpdated?: (issue: ProjectIssue) => void;
  onCancel?: () => void;
  className?: string;
}

const EditIssue: React.FC<EditIssueProps> = ({ 
  issue,
  onIssueUpdated,
  onCancel,
  className = '' 
}) => {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);
  const [status, setStatus] = useState(issue.status);
  const [priority, setPriority] = useState<TaskPriority>(issue.priority);
  const [assigneeId, setAssigneeId] = useState(issue.assignee_id || '');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { user, hasPermission } = useAuth();
  
  // Reset form when issue changes
  useEffect(() => {
    setTitle(issue.title);
    setDescription(issue.description);
    setStatus(issue.status);
    setPriority(issue.priority);
    setAssigneeId(issue.assignee_id || '');
  }, [issue]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update an issue');
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
      
      // Create issue update object
      const issueUpdates: Partial<ProjectIssue> = {
        title,
        description,
        status,
        priority,
        assignee_id: assigneeId || undefined,
        updated_at: new Date().toISOString()
      };
      
      // If status is resolved and wasn't before, set resolved_at
      if ((status === 'resolved' || status === 'closed') && 
          (issue.status !== 'resolved' && issue.status !== 'closed')) {
        issueUpdates.resolved_at = new Date().toISOString();
      } else if ((status !== 'resolved' && status !== 'closed') && 
                (issue.status === 'resolved' || issue.status === 'closed')) {
        issueUpdates.resolved_at = undefined;
      }
      
      // Call service to update issue
      const updatedIssue = await projectService.updateIssue(issue.id, issueUpdates);
      
      if (!updatedIssue) {
        throw new Error('Failed to update issue');
      }
      
      setSuccessMessage('Issue updated successfully!');
      
      // Call the callback if provided
      if (onIssueUpdated) {
        onIssueUpdated(updatedIssue);
      }
    } catch (err) {
      console.error('Error updating issue:', err);
      setError(err instanceof Error ? err.message : 'Failed to update issue');
    } finally {
      setIsLoading(false);
    }
  };
  
  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' }
  ];
  
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];
  
  // Check if user has permission to edit issues
  const canEditIssue = hasPermission('edit:project');
  
  if (!canEditIssue) {
    return (
      <div className={className}>
        <Card>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-red-600">You don't have permission to edit issues.</p>
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
            <Heading level={3}>Edit Issue</Heading>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <Input
                  label="Issue Title"
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
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={status}
                    onChange={(value) => setStatus(value)}
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
                Update Issue
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditIssue;
