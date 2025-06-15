import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services/projectService';
import { Project } from '../types/project';
import { PaginatedResult, QueryParams } from '../../core/types/common';

interface UseProjectsResult {
  projects: Project[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  fetchProjects: (params?: QueryParams) => Promise<void>;
  createProject: (project: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, project: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;
}

/**
 * Hook for managing projects
 */
export function useProjects(initialParams?: QueryParams): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(initialParams?.pagination?.page || 1);
  const [limit, setLimit] = useState<number>(initialParams?.pagination?.limit || 10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (params?: QueryParams) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await projectService.getProjects(params);
      const result = response.data;
      
      setProjects(result.data);
      setTotal(result.total);
      setPage(result.page);
      setLimit(result.limit);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (project: Partial<Project>): Promise<Project> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await projectService.createProject(project);
      
      // Refresh projects list
      fetchProjects({ pagination: { page, limit } });
      
      return response.data;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchProjects, page, limit]);

  const updateProject = useCallback(async (id: string, project: Partial<Project>): Promise<Project> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await projectService.updateProject(id, project);
      
      // Update project in list
      setProjects((prevProjects) =>
        prevProjects.map((p) => (p.id === id ? { ...p, ...response.data } : p))
      );
      
      return response.data;
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await projectService.deleteProject(id);
      
      // Remove project from list
      setProjects((prevProjects) => prevProjects.filter((p) => p.id !== id));
      
      // Update total count
      setTotal((prevTotal) => prevTotal - 1);
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects(initialParams);
  }, [fetchProjects, initialParams]);

  return {
    projects,
    total,
    page,
    limit,
    totalPages,
    isLoading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
