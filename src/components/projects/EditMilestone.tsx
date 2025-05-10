import React, { useState, useEffect } from 'react';
import { Milestone, ProjectStatus } from '../../types/project';
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

interface EditMilestoneProps {
  milestone: Milestone;
  onMilestoneUpdated?: (milestone: Milestone) => void;
  onCancel?: () => void;
  className?: string;
}

const EditMilestone: React.FC<EditMilestoneProps> = ({ 
  milestone,
  onMilestoneUpdated,
  onCancel,
  className = '' 
}) => {
  const [title, setTitle] = useState(milestone.title);
  const [description, setDescription] = useState(milestone.description || '');
  const [dueDate, setDueDate] = useState(milestone.due_date || '');
  const [status, setStatus] = useState<ProjectStatus>(milestone.status);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { user, hasPermission } = useAuth();
  
  // Reset form when milestone changes
  useEffect(() => {
    setTitle(milestone.title);
    setDescription(milestone.description || '');
    setDueDate(milestone.due_date || '');
    setStatus(milestone.status);
  }, [milestone]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update a milestone');
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
      
      // Create milestone update object
      const milestoneUpdates: Partial<Milestone> = {
        title,
        description,
        due_date: dueDate || undefined,
        status,
        updated_at: new Date().toISOString()
      };
      
      // Call service to update milestone
      const updatedMilestone = await projectService.updateMilestone(milestone.id, milestoneUpdates);
      
      if (!updatedMilestone) {
        throw new Error('Failed to update milestone');
      }
      
      setSuccessMessage('Milestone updated successfully!');
      
      // Call the callback if provided
      if (onMilestoneUpdated) {
        onMilestoneUpdated(updatedMilestone);
      }
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError(err instanceof Error ? err.message : 'Failed to update milestone');
    } finally {
      setIsLoading(false);
    }
  };
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];
  
  // Check if user has permission to edit milestones
  const canEditMilestone = hasPermission('edit:project');
  
  if (!canEditMilestone) {
    return (
      <div className={className}>
        <Card>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-red-600">You don't have permission to edit milestones.</p>
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
            <Heading level={3}>Edit Milestone</Heading>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              <div>
                <Input
                  label="Milestone Title"
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
                    label="Status"
                    options={statusOptions}
                    value={status}
                    onChange={(value) => setStatus(value as ProjectStatus)}
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
                Update Milestone
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditMilestone;
