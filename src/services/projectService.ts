import { supabase } from '../lib/supabase';
import {
  Project,
  ProjectStatus,
  Milestone,
  Task,
  TaskStatus,
  TaskPriority,
  ProjectIssue,
  ProjectDocument,
  ProjectPermit,
  ProjectWithRelations
} from '../types/project';

/**
 * Service for managing projects and related entities
 */
class ProjectService {
  /**
   * Get all projects
   * @returns Array of all projects
   */
  async getAllProjects(): Promise<Project[]> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Project[];
    } catch (error) {
      console.error('Error getting all projects:', error);
      throw error;
    }
  }

  /**
   * Get all projects for a user
   * @param userId User ID
   * @param role Optional role filter ('client' or 'service_agent')
   * @returns Array of projects
   */
  async getProjects(userId: string, role?: 'client' | 'service_agent'): Promise<Project[]> {
    try {
      let query = supabase
        .from('projects')
        .select('*');

      if (role === 'client') {
        query = query.eq('client_id', userId);
      } else if (role === 'service_agent') {
        query = query.eq('service_agent_id', userId);
      } else {
        // If no role specified, get projects where user is either client or service agent
        query = query.or(`client_id.eq.${userId},service_agent_id.eq.${userId}`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data as Project[];
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }

  /**
   * Get a project by ID
   * @param projectId Project ID
   * @returns Project or null if not found
   */
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          return null;
        }
        throw error;
      }

      return data as Project;
    } catch (error) {
      console.error('Error getting project:', error);
      throw error;
    }
  }

  /**
   * Get tasks for a project
   * @param projectId Project ID
   * @returns Array of tasks
   */
  async getProjectTasks(projectId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as Task[];
    } catch (error) {
      console.error('Error getting project tasks:', error);
      throw error;
    }
  }

  /**
   * Get a project by ID with optional relations
   * @param projectId Project ID
   * @param relations Optional relations to include
   * @returns Project with relations
   */
  async getProjectById(
    projectId: string,
    relations: ('milestones' | 'tasks' | 'issues' | 'documents' | 'permits' | 'activities' | 'members')[] = []
  ): Promise<ProjectWithRelations> {
    try {
      // Get the project
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) throw error;

      // Initialize the result with the project data
      const result: ProjectWithRelations = project as Project;

      // Fetch requested relations
      if (relations.includes('milestones')) {
        const { data: milestones, error: milestonesError } = await supabase
          .from('milestones')
          .select('*')
          .eq('project_id', projectId)
          .order('order', { ascending: true });

        if (milestonesError) throw milestonesError;
        result.milestones = milestones as Milestone[];
      }

      if (relations.includes('tasks')) {
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (tasksError) throw tasksError;
        result.tasks = tasks as Task[];
      }

      if (relations.includes('issues')) {
        const { data: issues, error: issuesError } = await supabase
          .from('project_issues')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (issuesError) throw issuesError;
        result.issues = issues as ProjectIssue[];
      }

      if (relations.includes('documents')) {
        const { data: documents, error: documentsError } = await supabase
          .from('project_documents')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (documentsError) throw documentsError;
        result.documents = documents as ProjectDocument[];
      }

      if (relations.includes('permits')) {
        const { data: permits, error: permitsError } = await supabase
          .from('project_permits')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (permitsError) throw permitsError;
        result.permits = permits as ProjectPermit[];
      }

      if (relations.includes('activities')) {
        const { data: activities, error: activitiesError } = await supabase
          .from('project_activities')
          .select('*')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false });

        if (activitiesError) throw activitiesError;
        result.activities = activities;
      }

      if (relations.includes('members')) {
        const { data: members, error: membersError } = await supabase
          .from('project_members')
          .select('*')
          .eq('project_id', projectId);

        if (membersError) throw membersError;
        result.members = members;
      }

      return result;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   * @param project Project data
   * @returns Created project
   */
  async createProject(project: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for project creation
      await this.createActivity({
        project_id: data.id,
        user_id: project.client_id!,
        activity_type: 'create',
        description: 'Project created',
        entity_type: 'project',
        entity_id: data.id,
      });

      return data as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update a project
   * @param projectId Project ID
   * @param updates Project updates
   * @returns Updated project
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for project update
      await this.createActivity({
        project_id: projectId,
        user_id: updates.client_id || data.client_id,
        activity_type: 'update',
        description: 'Project updated',
        entity_type: 'project',
        entity_id: projectId,
      });

      return data as Project;
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   * @param projectId Project ID
   * @returns Success status
   */
  async deleteProject(projectId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Update project status
   * @param projectId Project ID
   * @param status New status
   * @param userId User ID making the change
   * @returns Updated project
   */
  async updateProjectStatus(projectId: string, status: ProjectStatus, userId: string): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for status change
      await this.createActivity({
        project_id: projectId,
        user_id: userId,
        activity_type: 'status_change',
        description: `Project status changed to ${status}`,
        entity_type: 'project',
        entity_id: projectId,
      });

      return data as Project;
    } catch (error) {
      console.error('Error updating project status:', error);
      throw error;
    }
  }

  /**
   * Create a milestone for a project
   * @param milestone Milestone data
   * @returns Created milestone
   */
  async createMilestone(milestone: Partial<Milestone>): Promise<Milestone> {
    try {
      // Get the highest order value for existing milestones
      const { data: existingMilestones, error: orderError } = await supabase
        .from('milestones')
        .select('order')
        .eq('project_id', milestone.project_id!)
        .order('order', { ascending: false })
        .limit(1);

      if (orderError) throw orderError;

      // Set the order to be one more than the highest existing order, or 0 if no milestones exist
      const order = existingMilestones.length > 0 ? existingMilestones[0].order + 1 : 0;

      const { data, error } = await supabase
        .from('milestones')
        .insert({ ...milestone, order })
        .select()
        .single();

      if (error) throw error;

      // Create activity record for milestone creation
      await this.createActivity({
        project_id: milestone.project_id!,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'create',
        description: 'Milestone created',
        entity_type: 'milestone',
        entity_id: data.id,
      });

      return data as Milestone;
    } catch (error) {
      console.error('Error creating milestone:', error);
      throw error;
    }
  }

  /**
   * Update a milestone
   * @param milestoneId Milestone ID
   * @param updates Milestone updates
   * @returns Updated milestone
   */
  async updateMilestone(milestoneId: string, updates: Partial<Milestone>): Promise<Milestone> {
    try {
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for milestone update
      await this.createActivity({
        project_id: data.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'update',
        description: 'Milestone updated',
        entity_type: 'milestone',
        entity_id: milestoneId,
      });

      return data as Milestone;
    } catch (error) {
      console.error('Error updating milestone:', error);
      throw error;
    }
  }

  /**
   * Delete a milestone
   * @param milestoneId Milestone ID
   * @returns Success status
   */
  async deleteMilestone(milestoneId: string): Promise<boolean> {
    try {
      // Get the milestone to get the project_id
      const { data: milestone, error: getMilestoneError } = await supabase
        .from('milestones')
        .select('project_id')
        .eq('id', milestoneId)
        .single();

      if (getMilestoneError) throw getMilestoneError;

      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;

      // Create activity record for milestone deletion
      await this.createActivity({
        project_id: milestone.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'delete',
        description: 'Milestone deleted',
        entity_type: 'milestone',
        entity_id: milestoneId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting milestone:', error);
      throw error;
    }
  }

  /**
   * Create a task for a project
   * @param task Task data
   * @returns Created task
   */
  async createTask(task: Partial<Task>): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for task creation
      await this.createActivity({
        project_id: task.project_id!,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'create',
        description: 'Task created',
        entity_type: 'task',
        entity_id: data.id,
      });

      // Update project progress
      await this.updateProjectProgress(task.project_id!);

      return data as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Update a task
   * @param taskId Task ID
   * @param updates Task updates
   * @returns Updated task
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    try {
      // If status is being updated to 'completed', set completed_at
      if (updates.status === 'completed' && !updates.completed_at) {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for task update
      await this.createActivity({
        project_id: data.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'update',
        description: 'Task updated',
        entity_type: 'task',
        entity_id: taskId,
      });

      // Update project progress
      await this.updateProjectProgress(data.project_id);

      return data as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param taskId Task ID
   * @returns Success status
   */
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      // Get the task to get the project_id
      const { data: task, error: getTaskError } = await supabase
        .from('tasks')
        .select('project_id')
        .eq('id', taskId)
        .single();

      if (getTaskError) throw getTaskError;

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Create activity record for task deletion
      await this.createActivity({
        project_id: task.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'delete',
        description: 'Task deleted',
        entity_type: 'task',
        entity_id: taskId,
      });

      // Update project progress
      await this.updateProjectProgress(task.project_id);

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Update task status
   * @param taskId Task ID
   * @param status New status
   * @returns Updated task
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    try {
      // If status is being updated to 'completed', set completed_at
      const updates: Partial<Task> = {
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for status change
      await this.createActivity({
        project_id: data.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'status_change',
        description: `Task status changed to ${status}`,
        entity_type: 'task',
        entity_id: taskId,
      });

      // Update project progress
      await this.updateProjectProgress(data.project_id);

      return data as Task;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  /**
   * Create a project issue
   * @param issue Issue data
   * @returns Created issue
   */
  async createIssue(issue: Partial<ProjectIssue>): Promise<ProjectIssue> {
    try {
      const { data, error } = await supabase
        .from('project_issues')
        .insert(issue)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for issue creation
      await this.createActivity({
        project_id: issue.project_id!,
        user_id: issue.reporter_id!,
        activity_type: 'create',
        description: 'Issue created',
        entity_type: 'issue',
        entity_id: data.id,
      });

      return data as ProjectIssue;
    } catch (error) {
      console.error('Error creating issue:', error);
      throw error;
    }
  }

  /**
   * Update a project issue
   * @param issueId Issue ID
   * @param updates Issue updates
   * @returns Updated issue
   */
  async updateIssue(issueId: string, updates: Partial<ProjectIssue>): Promise<ProjectIssue> {
    try {
      // If status is being updated to 'resolved', set resolved_at
      if (updates.status === 'resolved' && !updates.resolved_at) {
        updates.resolved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('project_issues')
        .update(updates)
        .eq('id', issueId)
        .select()
        .single();

      if (error) throw error;

      // Create activity record for issue update
      await this.createActivity({
        project_id: data.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'update',
        description: 'Issue updated',
        entity_type: 'issue',
        entity_id: issueId,
      });

      return data as ProjectIssue;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }

  /**
   * Create a project activity record
   * @param activity Activity data
   * @returns Created activity
   */
  async createActivity(activity: Partial<ProjectActivity>): Promise<ProjectActivity> {
    try {
      const { data, error } = await supabase
        .from('project_activities')
        .insert({
          ...activity,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return data as ProjectActivity;
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  /**
   * Update project progress based on task completion
   * @param projectId Project ID
   * @returns Updated project
   */
  async updateProjectProgress(projectId: string): Promise<Project> {
    try {
      // Get all tasks for the project
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Calculate progress percentage
      let progress = 0;
      if (tasks.length > 0) {
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        progress = Math.round((completedTasks / tasks.length) * 100);
      }

      // Update project with new progress
      const { data, error } = await supabase
        .from('projects')
        .update({
          overall_progress: progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) throw error;

      return data as Project;
    } catch (error) {
      console.error('Error updating project progress:', error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param documentId Document ID
   * @returns Success status
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      // Get the document to get the project_id
      const { data: document, error: getDocError } = await supabase
        .from('project_documents')
        .select('project_id')
        .eq('id', documentId)
        .single();

      if (getDocError) throw getDocError;

      const { error } = await supabase
        .from('project_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      // Create activity record for document deletion
      await this.createActivity({
        project_id: document.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'delete',
        description: 'Document deleted',
        entity_type: 'document',
        entity_id: documentId,
      });

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Remove a project member
   * @param memberId Member ID
   * @returns Success status
   */
  async removeProjectMember(memberId: string): Promise<boolean> {
    try {
      // Get the member to get the project_id
      const { data: member, error: getMemberError } = await supabase
        .from('project_members')
        .select('project_id, user_id')
        .eq('id', memberId)
        .single();

      if (getMemberError) throw getMemberError;

      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      // Create activity record for member removal
      await this.createActivity({
        project_id: member.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'remove',
        description: 'Team member removed',
        entity_type: 'member',
        entity_id: memberId,
      });

      return true;
    } catch (error) {
      console.error('Error removing project member:', error);
      throw error;
    }
  }

  /**
   * Update a project member's role
   * @param memberId Member ID
   * @param role New role
   * @returns Updated member
   */
  async updateProjectMemberRole(memberId: string, role: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('project_members')
        .update({
          role,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .select('*, user:users(*)')
        .single();

      if (error) throw error;

      // Create activity record for role update
      await this.createActivity({
        project_id: data.project_id,
        user_id: (await this.getCurrentUserId())!,
        activity_type: 'update',
        description: `Member role updated to ${role}`,
        entity_type: 'member',
        entity_id: memberId,
      });

      return data;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  /**
   * Get the current user ID from the session
   * @returns User ID or null
   */
  private async getCurrentUserId(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.user?.id || null;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }
}

export const projectService = new ProjectService();
