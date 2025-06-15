import { BaseService, apiService } from '../../core/api/services';
import { ApiRequestConfig } from '../../core/api/types';
import { Project, Task, Milestone, ProjectIssue, ProjectPermit } from '../types/project';
import { PaginatedResult, QueryParams } from '../../core/types/common';

/**
 * Project service for managing projects
 */
class ProjectService extends BaseService {
  /**
   * Constructor
   */
  constructor() {
    super(apiService, '/projects');
  }

  /**
   * Get all projects
   */
  async getProjects(params?: QueryParams): Promise<PaginatedResult<Project>> {
    return this.get<PaginatedResult<Project>>('', { params });
  }

  /**
   * Get a project by ID
   */
  async getProject(id: string): Promise<Project> {
    return this.get<Project>(id);
  }

  /**
   * Create a new project
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    return this.post<Project>('', project);
  }

  /**
   * Update a project
   */
  async updateProject(id: string, project: Partial<Project>): Promise<Project> {
    return this.put<Project>(id, project);
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    return this.delete<void>(id);
  }

  /**
   * Get tasks for a project
   */
  async getTasks(projectId: string, params?: QueryParams): Promise<PaginatedResult<Task>> {
    return this.get<PaginatedResult<Task>>(`${projectId}/tasks`, { params });
  }

  /**
   * Get a task by ID
   */
  async getTask(projectId: string, taskId: string): Promise<Task> {
    return this.get<Task>(`${projectId}/tasks/${taskId}`);
  }

  /**
   * Create a new task
   */
  async createTask(projectId: string, task: Partial<Task>): Promise<Task> {
    return this.post<Task>(`${projectId}/tasks`, task);
  }

  /**
   * Update a task
   */
  async updateTask(projectId: string, taskId: string, task: Partial<Task>): Promise<Task> {
    return this.put<Task>(`${projectId}/tasks/${taskId}`, task);
  }

  /**
   * Delete a task
   */
  async deleteTask(projectId: string, taskId: string): Promise<void> {
    return this.delete<void>(`${projectId}/tasks/${taskId}`);
  }

  /**
   * Get milestones for a project
   */
  async getMilestones(projectId: string, params?: QueryParams): Promise<PaginatedResult<Milestone>> {
    return this.get<PaginatedResult<Milestone>>(`${projectId}/milestones`, { params });
  }

  /**
   * Get a milestone by ID
   */
  async getMilestone(projectId: string, milestoneId: string): Promise<Milestone> {
    return this.get<Milestone>(`${projectId}/milestones/${milestoneId}`);
  }

  /**
   * Create a new milestone
   */
  async createMilestone(projectId: string, milestone: Partial<Milestone>): Promise<Milestone> {
    return this.post<Milestone>(`${projectId}/milestones`, milestone);
  }

  /**
   * Update a milestone
   */
  async updateMilestone(projectId: string, milestoneId: string, milestone: Partial<Milestone>): Promise<Milestone> {
    return this.put<Milestone>(`${projectId}/milestones/${milestoneId}`, milestone);
  }

  /**
   * Delete a milestone
   */
  async deleteMilestone(projectId: string, milestoneId: string): Promise<void> {
    return this.delete<void>(`${projectId}/milestones/${milestoneId}`);
  }

  /**
   * Get issues for a project
   */
  async getIssues(projectId: string, params?: QueryParams): Promise<PaginatedResult<ProjectIssue>> {
    return this.get<PaginatedResult<ProjectIssue>>(`${projectId}/issues`, { params });
  }

  /**
   * Get an issue by ID
   */
  async getIssue(projectId: string, issueId: string): Promise<ProjectIssue> {
    return this.get<ProjectIssue>(`${projectId}/issues/${issueId}`);
  }

  /**
   * Create a new issue
   */
  async createIssue(projectId: string, issue: Partial<ProjectIssue>): Promise<ProjectIssue> {
    return this.post<ProjectIssue>(`${projectId}/issues`, issue);
  }

  /**
   * Update an issue
   */
  async updateIssue(projectId: string, issueId: string, issue: Partial<ProjectIssue>): Promise<ProjectIssue> {
    return this.put<ProjectIssue>(`${projectId}/issues/${issueId}`, issue);
  }

  /**
   * Delete an issue
   */
  async deleteIssue(projectId: string, issueId: string): Promise<void> {
    return this.delete<void>(`${projectId}/issues/${issueId}`);
  }

  /**
   * Get permits for a project
   */
  async getPermits(projectId: string, params?: QueryParams): Promise<PaginatedResult<ProjectPermit>> {
    return this.get<PaginatedResult<ProjectPermit>>(`${projectId}/permits`, { params });
  }

  /**
   * Get a permit by ID
   */
  async getPermit(projectId: string, permitId: string): Promise<ProjectPermit> {
    return this.get<ProjectPermit>(`${projectId}/permits/${permitId}`);
  }

  /**
   * Create a new permit
   */
  async createPermit(projectId: string, permit: Partial<ProjectPermit>): Promise<ProjectPermit> {
    return this.post<ProjectPermit>(`${projectId}/permits`, permit);
  }

  /**
   * Update a permit
   */
  async updatePermit(projectId: string, permitId: string, permit: Partial<ProjectPermit>): Promise<ProjectPermit> {
    return this.put<ProjectPermit>(`${projectId}/permits/${permitId}`, permit);
  }

  /**
   * Delete a permit
   */
  async deletePermit(projectId: string, permitId: string): Promise<void> {
    return this.delete<void>(`${projectId}/permits/${permitId}`);
  }

  /**
   * Upload a document to a project
   */
  async uploadDocument(projectId: string, file: File, metadata?: Record<string, any>): Promise<File> {
    // Use FormData for file uploads
    const formData = new FormData();
    formData.append('file', file);

    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return this.post<File>(`${projectId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  /**
   * Delete a document from a project
   */
  async deleteDocument(projectId: string, documentId: string): Promise<void> {
    return this.delete<void>(`${projectId}/documents/${documentId}`);
  }
}

// Create and export a singleton instance
export const projectService = new ProjectService();
