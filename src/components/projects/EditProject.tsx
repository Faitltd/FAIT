import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectStatus } from '../../types/project';
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

interface EditProjectProps {
  project: Project;
  onProjectUpdate?: (updatedProject: Project) => void;
  className?: string;
}

const EditProject: React.FC<EditProjectProps> = ({ 
  project,
  onProjectUpdate,
  className = '' 
}) => {
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const [budget, setBudget] = useState(project.budget ? project.budget.toString() : '');
  const [startDate, setStartDate] = useState(project.start_date || '');
  const [endDate, setEndDate] = useState(project.end_date || '');
  const [address, setAddress] = useState(project.address || '');
  const [city, setCity] = useState(project.city || '');
  const [state, setState] = useState(project.state || '');
  const [zip, setZip] = useState(project.zip || '');
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  
  // Reset form when project changes
  useEffect(() => {
    setTitle(project.title);
    setDescription(project.description);
    setBudget(project.budget ? project.budget.toString() : '');
    setStartDate(project.start_date || '');
    setEndDate(project.end_date || '');
    setAddress(project.address || '');
    setCity(project.city || '');
    setState(project.state || '');
    setZip(project.zip || '');
    setStatus(project.status);
  }, [project]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to update a project');
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
      
      // Create project object with updates
      const projectUpdates: Partial<Project> = {
        title,
        description,
        status,
        budget: budget ? parseFloat(budget) : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        address: address ? `${address}, ${city}, ${state} ${zip}` : undefined,
        city,
        state,
        zip,
        updated_at: new Date().toISOString()
      };
      
      // Call service to update project
      const updatedProject = await projectService.updateProject(project.id, projectUpdates);
      
      if (!updatedProject) {
        throw new Error('Failed to update project');
      }
      
      setSuccessMessage('Project updated successfully!');
      
      // Call the callback if provided
      if (onProjectUpdate) {
        onProjectUpdate(updatedProject);
      }
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
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
  
  // Check if user has permission to edit projects
  const canEditProject = hasPermission('edit:project');
  
  if (!canEditProject) {
    return (
      <div className={className}>
        <Card>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-red-600">You don't have permission to edit projects.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <Heading level={2} className="mb-6">Edit Project</Heading>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <Heading level={3}>Project Details</Heading>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <Heading level={4} className="mb-4">Basic Information</Heading>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Input
                      label="Project Title"
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
                        label="Budget"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Enter budget amount"
                        min="0"
                        step="0.01"
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
                </div>
              </div>
              
              {/* Timeline */}
              <div>
                <Heading level={4} className="mb-4">Timeline</Heading>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate}
                    />
                  </div>
                </div>
              </div>
              
              {/* Location */}
              <div>
                <Heading level={4} className="mb-4">Location</Heading>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Input
                      label="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street address"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Input
                        label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="ZIP Code"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                      />
                    </div>
                  </div>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                Cancel
              </Button>
              
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
              >
                Update Project
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default EditProject;
