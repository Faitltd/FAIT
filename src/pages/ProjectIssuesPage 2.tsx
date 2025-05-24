import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import IssueList from '../components/plane/issues/IssueList';
import IssueDetail from '../components/plane/issues/IssueDetail';
import IssueCreate from '../components/plane/issues/IssueCreate';
import { ProjectIssue } from '../types/plane-integration';
import { Project } from '../types/project';

const ProjectIssuesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<ProjectIssue | null>(null);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        
        if (error) throw error;
        
        setProject(data as Project);
      } catch (err: any) {
        console.error('Error fetching project:', err);
        setError(err.message || 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);

  const handleIssueSelect = (issue: ProjectIssue) => {
    setSelectedIssue(issue);
    setIsCreatingIssue(false);
  };

  const handleIssueUpdate = (updatedIssue: ProjectIssue) => {
    setSelectedIssue(updatedIssue);
    // Force refresh of issue list
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleIssueDelete = () => {
    setSelectedIssue(null);
    // Force refresh of issue list
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100);
  };

  const handleCreateIssue = () => {
    setIsCreatingIssue(true);
    setSelectedIssue(null);
  };

  const handleIssueCreated = (issue: ProjectIssue) => {
    setIsCreatingIssue(false);
    setSelectedIssue(issue);
    // Force refresh of issue list
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 100);
  };

  if (isLoading && !project) {
    return (
      <ResponsiveLayout title="Project Issues">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </ResponsiveLayout>
    );
  }

  if (error || !project) {
    return (
      <ResponsiveLayout title="Project Issues">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'Project not found'}
              </p>
              <div className="mt-2">
                <button
                  onClick={() => navigate('/projects')}
                  className="text-sm text-red-700 underline"
                >
                  Go back to projects
                </button>
              </div>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title={`${project.name} - Issues`}>
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
          </div>
          <div>
            <button
              onClick={() => navigate(`/projects/${projectId}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Project
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`md:col-span-${selectedIssue || isCreatingIssue ? '1' : '3'}`}>
          <IssueList 
            projectId={projectId || ''} 
            onIssueSelect={handleIssueSelect}
            onCreateIssue={handleCreateIssue}
          />
        </div>
        
        {(selectedIssue || isCreatingIssue) && (
          <div className="md:col-span-2">
            {selectedIssue && (
              <IssueDetail 
                issue={selectedIssue} 
                onClose={() => setSelectedIssue(null)}
                onUpdate={handleIssueUpdate}
                onDelete={handleIssueDelete}
              />
            )}
            
            {isCreatingIssue && (
              <IssueCreate 
                projectId={projectId || ''} 
                onClose={() => setIsCreatingIssue(false)}
                onIssueCreated={handleIssueCreated}
              />
            )}
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default ProjectIssuesPage;
