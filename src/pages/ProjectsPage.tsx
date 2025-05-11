import React, { useState } from 'react';
import { PageLayout } from '../modules/core/components/layout/PageLayout';
import { ProjectList } from '../modules/project/components/ProjectList';
import { CreateProject } from '../modules/project/components/creation/CreateProject';
import { Project } from '../modules/project/types/project';
import { useAuth } from '../modules/core/contexts/AuthContext';
import { UserRole } from '../modules/core/types/common';

/**
 * ProjectsPage component for displaying and managing projects
 */
const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);

  // Handle project selection
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    // In a real app, you would navigate to the project details page
    console.log('Selected project:', project);
  };

  // Handle project creation
  const handleCreateProject = () => {
    setIsCreatingProject(true);
  };

  // Handle project creation submission
  const handleProjectSubmit = (data: any) => {
    console.log('Project data submitted:', data);
    setIsCreatingProject(false);
    // In a real app, you would create the project and refresh the list
  };

  // Handle project creation cancellation
  const handleProjectCancel = () => {
    setIsCreatingProject(false);
  };

  // Get filter based on user role
  const getFilterParams = () => {
    if (!user) return {};
    
    switch (user.role) {
      case UserRole.CLIENT:
        return { filter: { clientId: user.id } };
      case UserRole.SERVICE_AGENT:
        return { filter: { serviceAgentId: user.id } };
      case UserRole.ADMIN:
        return {}; // Admins can see all projects
      default:
        return {};
    }
  };

  return (
    <PageLayout
      title="Projects"
      description="Manage your projects"
    >
      {isCreatingProject ? (
        <CreateProject
          onSubmit={handleProjectSubmit}
          onCancel={handleProjectCancel}
        />
      ) : (
        <ProjectList
          initialParams={getFilterParams()}
          onSelectProject={handleSelectProject}
          onCreateProject={handleCreateProject}
        />
      )}
    </PageLayout>
  );
};

export default ProjectsPage;
