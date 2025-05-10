import { supabase } from '../lib/supabase';
import {
  Project,
  ProjectMilestone,
  ProjectStatusUpdate,
  ProjectIssue,
  ProjectIssueComment
} from '../types/project';

/**
 * Service for handling project status tracking functionality
 */
export class ProjectStatusService {
  /**
   * Get a project by ID with status tracking information
   * @param projectId - The ID of the project to retrieve
   * @returns The project data
   */
  async getProject(projectId: string): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          client:client_id(*),
          contractor:contractor_id(*)
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        return null;
      }

      return data as Project;
    } catch (error) {
      console.error('Error in getProject:', error);
      return null;
    }
  }

  /**
   * Update a project's status
   * @param projectId - The ID of the project
   * @param newStatus - The new status
   * @param userId - The ID of the user making the update
   * @param updateText - Optional text describing the update
   * @param completionPercentage - Optional completion percentage
   * @returns True if successful, false otherwise
   */
  async updateProjectStatus(
    projectId: string,
    newStatus: string,
    userId: string,
    updateText?: string,
    completionPercentage?: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_project_status', {
        p_project_id: projectId,
        p_new_status: newStatus,
        p_user_id: userId,
        p_update_text: updateText || null,
        p_completion_percentage: completionPercentage || null
      });

      if (error) {
        console.error('Error updating project status:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProjectStatus:', error);
      return false;
    }
  }

  /**
   * Get project milestones
   * @param projectId - The ID of the project
   * @returns List of project milestones
   */
  async getProjectMilestones(projectId: string): Promise<ProjectMilestone[]> {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching project milestones:', error);
        return [];
      }

      return data as ProjectMilestone[];
    } catch (error) {
      console.error('Error in getProjectMilestones:', error);
      return [];
    }
  }

  /**
   * Create a project milestone
   * @param milestone - The milestone data to create
   * @returns The ID of the created milestone if successful, null otherwise
   */
  async createProjectMilestone(milestone: Partial<ProjectMilestone>): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_project_milestone', {
        p_project_id: milestone.project_id,
        p_title: milestone.title,
        p_description: milestone.description || null,
        p_due_date: milestone.due_date || null,
        p_order_index: milestone.order_index || null,
        p_is_payment_milestone: milestone.is_payment_milestone || false,
        p_payment_amount: milestone.payment_amount || null
      });

      if (error) {
        console.error('Error creating project milestone:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createProjectMilestone:', error);
      return null;
    }
  }

  /**
   * Update a project milestone
   * @param milestoneId - The ID of the milestone to update
   * @param updates - The milestone data to update
   * @returns The updated milestone
   */
  async updateProjectMilestone(
    milestoneId: string,
    updates: Partial<ProjectMilestone>
  ): Promise<ProjectMilestone | null> {
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .update(updates)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project milestone:', error);
        return null;
      }

      return data as ProjectMilestone;
    } catch (error) {
      console.error('Error in updateProjectMilestone:', error);
      return null;
    }
  }

  /**
   * Complete a project milestone
   * @param milestoneId - The ID of the milestone to complete
   * @param completionDate - Optional completion date
   * @returns True if successful, false otherwise
   */
  async completeProjectMilestone(
    milestoneId: string,
    completionDate?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('complete_project_milestone', {
        p_milestone_id: milestoneId,
        p_completion_date: completionDate || null
      });

      if (error) {
        console.error('Error completing project milestone:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in completeProjectMilestone:', error);
      return false;
    }
  }

  /**
   * Get project status updates
   * @param projectId - The ID of the project
   * @param limit - Optional limit on number of updates to return
   * @returns List of project status updates
   */
  async getProjectStatusUpdates(
    projectId: string,
    limit?: number
  ): Promise<ProjectStatusUpdate[]> {
    try {
      let query = supabase
        .from('project_status_updates')
        .select(`
          *,
          user:user_id(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching project status updates:', error);
        return [];
      }

      return data as ProjectStatusUpdate[];
    } catch (error) {
      console.error('Error in getProjectStatusUpdates:', error);
      return [];
    }
  }

  /**
   * Create a project status update
   * @param update - The status update data to create
   * @returns The created status update
   */
  async createProjectStatusUpdate(
    update: Partial<ProjectStatusUpdate>
  ): Promise<ProjectStatusUpdate | null> {
    try {
      const { data, error } = await supabase
        .from('project_status_updates')
        .insert(update)
        .select()
        .single();

      if (error) {
        console.error('Error creating project status update:', error);
        return null;
      }

      return data as ProjectStatusUpdate;
    } catch (error) {
      console.error('Error in createProjectStatusUpdate:', error);
      return null;
    }
  }

  /**
   * Get project issues
   * @param projectId - The ID of the project
   * @param status - Optional status filter
   * @returns List of project issues
   */
  async getProjectIssues(
    projectId: string,
    status?: string
  ): Promise<ProjectIssue[]> {
    try {
      let query = supabase
        .from('project_issues')
        .select(`
          *,
          reporter:reported_by(*),
          assignee:assigned_to(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching project issues:', error);
        return [];
      }

      return data as ProjectIssue[];
    } catch (error) {
      console.error('Error in getProjectIssues:', error);
      return [];
    }
  }

  /**
   * Create a project issue
   * @param issue - The issue data to create
   * @returns The ID of the created issue if successful, null otherwise
   */
  async createProjectIssue(issue: Partial<ProjectIssue>): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_project_issue', {
        p_project_id: issue.project_id,
        p_reported_by: issue.reported_by,
        p_title: issue.title,
        p_description: issue.description || null,
        p_priority: issue.priority || 'medium',
        p_assigned_to: issue.assigned_to || null,
        p_due_date: issue.due_date || null
      });

      if (error) {
        console.error('Error creating project issue:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in createProjectIssue:', error);
      return null;
    }
  }

  /**
   * Update a project issue
   * @param issueId - The ID of the issue to update
   * @param updates - The issue data to update
   * @returns The updated issue
   */
  async updateProjectIssue(
    issueId: string,
    updates: Partial<ProjectIssue>
  ): Promise<ProjectIssue | null> {
    try {
      const { data, error } = await supabase
        .from('project_issues')
        .update(updates)
        .eq('id', issueId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project issue:', error);
        return null;
      }

      return data as ProjectIssue;
    } catch (error) {
      console.error('Error in updateProjectIssue:', error);
      return null;
    }
  }

  /**
   * Resolve a project issue
   * @param issueId - The ID of the issue to resolve
   * @param resolvedBy - The ID of the user resolving the issue
   * @param resolutionNotes - Optional resolution notes
   * @returns True if successful, false otherwise
   */
  async resolveProjectIssue(
    issueId: string,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('resolve_project_issue', {
        p_issue_id: issueId,
        p_resolved_by: resolvedBy,
        p_resolution_notes: resolutionNotes || null
      });

      if (error) {
        console.error('Error resolving project issue:', error);
        return false;
      }

      return data;
    } catch (error) {
      console.error('Error in resolveProjectIssue:', error);
      return false;
    }
  }

  /**
   * Get issue comments
   * @param issueId - The ID of the issue
   * @returns List of issue comments
   */
  async getIssueComments(issueId: string): Promise<ProjectIssueComment[]> {
    try {
      const { data, error } = await supabase
        .from('project_issue_comments')
        .select(`
          *,
          user:user_id(*)
        `)
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching issue comments:', error);
        return [];
      }

      return data as ProjectIssueComment[];
    } catch (error) {
      console.error('Error in getIssueComments:', error);
      return [];
    }
  }

  /**
   * Create an issue comment
   * @param comment - The comment data to create
   * @returns The created comment
   */
  async createIssueComment(
    comment: Partial<ProjectIssueComment>
  ): Promise<ProjectIssueComment | null> {
    try {
      const { data, error } = await supabase
        .from('project_issue_comments')
        .insert(comment)
        .select()
        .single();

      if (error) {
        console.error('Error creating issue comment:', error);
        return null;
      }

      return data as ProjectIssueComment;
    } catch (error) {
      console.error('Error in createIssueComment:', error);
      return null;
    }
  }

  /**
   * Add a comment to an issue
   * @param issueId - The ID of the issue
   * @param userId - The ID of the user adding the comment
   * @param content - The comment content
   * @returns True if successful, false otherwise
   */
  async addIssueComment(
    issueId: string,
    userId: string,
    content: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_issue_comments')
        .insert({
          issue_id: issueId,
          user_id: userId,
          content
        });

      if (error) {
        console.error('Error adding issue comment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in addIssueComment:', error);
      return false;
    }
  }

  /**
   * Update an issue's status
   * @param issueId - The ID of the issue
   * @param newStatus - The new status
   * @returns True if successful, false otherwise
   */
  async updateIssueStatus(
    issueId: string,
    newStatus: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_issues')
        .update({ status: newStatus })
        .eq('id', issueId);

      if (error) {
        console.error('Error updating issue status:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateIssueStatus:', error);
      return false;
    }
  }
}

export const projectStatusService = new ProjectStatusService();
