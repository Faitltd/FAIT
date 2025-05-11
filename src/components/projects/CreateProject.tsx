import React, { useState } from 'react';
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

interface CreateProjectProps {
  className?: string;
}

const CreateProject: React.FC<CreateProjectProps> = ({ className = '' }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('pending');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a project');
      return;
    }
    
    if (!title.trim()) {
      setError('Project title is required');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);
      
      // Create project object
      const newProject: Partial<Project> = {
        title,
        description,
        client_id: user.id,
        status: 'pending' as ProjectStatus,
        budget: budget ? parseFloat(budget) : undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        address: address ? `${address}, ${city}, ${state} ${zip}` : undefined,
        city,
        state,
        zip,
        overall_progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Call service to create project
      const createdProject = await projectService.createProject(newProject);
      
      if (!createdProject) {
        throw new Error('Failed to create project');
      }
      
      setSuccessMessage('Project created successfully!');
      
      // Navigate to the project details page
      setTimeout(() => {
        navigate(`/projects/${createdProject.id}`);
      }, 1500);
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' }
  ];
  
  return (
    <div className={className}>
      <Heading level={2} className="mb-6">Create New Project</Heading>
      
      <Card>
        <CardHeader>
          <Heading level={3}>Project Details</Heading>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <Input
                  label="Project Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter project title"
                  required
                />
                
                <ExpandingTextarea
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter project description"
                  minRows={3}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Budget"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter budget amount"
                    leftIcon={
                      <span className="text-gray-500">$</span>
                    }
                  />
                  
                  <Select
                    label="Status"
                    options={statusOptions}
                    value={status}
                    onChange={(value) => setStatus(value as ProjectStatus)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  
                  <Input
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                
                <Heading level={4} className="mt-2">Location (Optional)</Heading>
                
                <Input
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter street address"
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                  />
                  
                  <Input
                    label="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Enter state"
                  />
                  
                  <Input
                    label="ZIP Code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="Enter ZIP code"
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}
              
              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                  {successMessage}
                </div>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/projects')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            Create Project
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CreateProject;
