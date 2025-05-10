import { supabase } from '../lib/supabase';
import {
  Project,
  ProjectMilestone,
  ProjectTimeline,
  ProjectStatusUpdate,
  ProjectIssue,
  ProjectIssueComment
} from '../types/project';

/**
 * Service for handling project-related functionality
 */
export class ProjectService {
  /**
   * Get a project by ID
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
   * Get all projects for the current user
   * @param userRole - The role of the current user ('client', 'contractor', 'admin')
   * @param status - Optional status filter
   * @returns List of projects
   */
  async getProjects(userRole: string, status?: string): Promise<Project[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('projects')
        .select(`
          *,
          client:client_id(*),
          contractor:contractor_id(*)
        `);

      // Filter by user role
      if (userRole === 'client') {
        query = query.eq('client_id', user.id);
      } else if (userRole === 'contractor') {
        query = query.eq('contractor_id', user.id);
      }

      // Filter by status if provided
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return [];
      }

      return data as Project[];
    } catch (error) {
      console.error('Error in getProjects:', error);
      return [];
    }
  }

  /**
   * Create a new project
   * @param project - The project data to create
   * @returns The created project
   */
  async createProject(project: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        return null;
      }

      return data as Project;
    } catch (error) {
      console.error('Error in createProject:', error);
      return null;
    }
  }

  /**
   * Update a project
   * @param projectId - The ID of the project to update
   * @param updates - The project data to update
   * @returns The updated project
   */
  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        return null;
      }

      return data as Project;
    } catch (error) {
      console.error('Error in updateProject:', error);
      return null;
    }
  }

  /**
   * Update a project's status
   * @param projectId - The ID of the project to update
   * @param newStatus - The new status
   * @param updateReason - The reason for the status update
   * @returns True if successful, false otherwise
   */
  async updateProjectStatus(
    projectId: string,
    newStatus: string,
    updateReason?: string
  ): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current project status
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('status')
        .eq('id', projectId)
        .single();

      if (projectError) {
        console.error('Error fetching project status:', projectError);
        return false;
      }

      // Update project status
      const { error: updateError } = await supabase
        .from('projects')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', projectId);

      if (updateError) {
        console.error('Error updating project status:', updateError);
        return false;
      }

      // Record status update
      const { error: statusUpdateError } = await supabase
        .from('project_status_updates')
        .insert({
          project_id: projectId,
          previous_status: project.status,
          new_status: newStatus,
          update_reason: updateReason || '',
          updated_by: user.id
        });

      if (statusUpdateError) {
        console.error('Error recording status update:', statusUpdateError);
        // Continue anyway since the status was updated
      }

      return true;
    } catch (error) {
      console.error('Error in updateProjectStatus:', error);
      return false;
    }
  }

  /**
   * Get status updates for a project
   * @param projectId - The ID of the project
   * @returns List of status updates
   */
  async getProjectStatusUpdates(projectId: string): Promise<ProjectStatusUpdate[]> {
    try {
      const { data, error } = await supabase
        .from('project_status_updates')
        .select(`
          *,
          updater:updated_by(*)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

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
   * Get milestones for a project
   * @param projectId - The ID of the project
   * @returns List of milestones
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
   * Create a new milestone
   * @param milestone - The milestone data to create
   * @returns The created milestone
   */
  async createMilestone(milestone: Partial<ProjectMilestone>): Promise<ProjectMilestone | null> {
    try {
      // Get the highest order_index for the project
      const { data: milestones, error: milestonesError } = await supabase
        .from('project_milestones')
        .select('order_index')
        .eq('project_id', milestone.project_id)
        .order('order_index', { ascending: false })
        .limit(1);

      if (milestonesError) {
        console.error('Error fetching milestones:', milestonesError);
        return null;
      }

      // Set the order_index to be one higher than the highest existing index
      const nextOrderIndex = milestones.length > 0 ? milestones[0].order_index + 1 : 0;
      milestone.order_index = nextOrderIndex;

      const { data, error } = await supabase
        .from('project_milestones')
        .insert(milestone)
        .select()
        .single();

      if (error) {
        console.error('Error creating milestone:', error);
        return null;
      }

      return data as ProjectMilestone;
    } catch (error) {
      console.error('Error in createMilestone:', error);
      return null;
    }
  }

  /**
   * Update a milestone
   * @param milestoneId - The ID of the milestone to update
   * @param updates - The milestone data to update
   * @returns The updated milestone
   */
  async updateMilestone(
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
        console.error('Error updating milestone:', error);
        return null;
      }

      return data as ProjectMilestone;
    } catch (error) {
      console.error('Error in updateMilestone:', error);
      return null;
    }
  }

  /**
   * Delete a milestone
   * @param milestoneId - The ID of the milestone to delete
   * @returns True if successful, false otherwise
   */
  async deleteMilestone(milestoneId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) {
        console.error('Error deleting milestone:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteMilestone:', error);
      return false;
    }
  }

  /**
   * Update milestone progress
   * @param milestoneId - The ID of the milestone to update
   * @param progress - The progress percentage (0-100)
   * @returns The updated milestone
   */
  async updateMilestoneProgress(
    milestoneId: string,
    progress: number
  ): Promise<ProjectMilestone | null> {
    try {
      // Ensure progress is between 0 and 100
      const validProgress = Math.max(0, Math.min(100, progress));

      // If progress is 100, also update status to completed
      const updates: Partial<ProjectMilestone> = {
        progress: validProgress,
        updated_at: new Date().toISOString()
      };

      if (validProgress === 100) {
        updates.status = 'completed';
        updates.completed_date = new Date().toISOString().split('T')[0];
      } else if (validProgress > 0) {
        updates.status = 'in_progress';
      }

      const { data, error } = await supabase
        .from('project_milestones')
        .update(updates)
        .eq('id', milestoneId)
        .select()
        .single();

      if (error) {
        console.error('Error updating milestone progress:', error);
        return null;
      }

      return data as ProjectMilestone;
    } catch (error) {
      console.error('Error in updateMilestoneProgress:', error);
      return null;
    }
  }

  /**
   * Reorder milestones
   * @param projectId - The ID of the project
   * @param milestoneIds - Array of milestone IDs in the new order
   * @returns True if successful, false otherwise
   */
  async reorderMilestones(projectId: string, milestoneIds: string[]): Promise<boolean> {
    try {
      // Update each milestone with its new order_index
      for (let i = 0; i < milestoneIds.length; i++) {
        const { error } = await supabase
          .from('project_milestones')
          .update({ order_index: i })
          .eq('id', milestoneIds[i])
          .eq('project_id', projectId);

        if (error) {
          console.error(`Error updating milestone order for ${milestoneIds[i]}:`, error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in reorderMilestones:', error);
      return false;
    }
  }

  /**
   * Get timeline events for a project
   * @param projectId - The ID of the project
   * @returns List of timeline events
   */
  async getProjectTimeline(projectId: string): Promise<ProjectTimeline[]> {
    try {
      const { data, error } = await supabase
        .from('project_timeline')
        .select('*')
        .eq('project_id', projectId)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error fetching project timeline:', error);
        return [];
      }

      return data as ProjectTimeline[];
    } catch (error) {
      console.error('Error in getProjectTimeline:', error);
      return [];
    }
  }

  /**
   * Create a new timeline event
   * @param timeline - The timeline event data to create
   * @returns The created timeline event
   */
  async createTimelineEvent(timeline: Partial<ProjectTimeline>): Promise<ProjectTimeline | null> {
    try {
      const { data, error } = await supabase
        .from('project_timeline')
        .insert(timeline)
        .select()
        .single();

      if (error) {
        console.error('Error creating timeline event:', error);
        return null;
      }

      return data as ProjectTimeline;
    } catch (error) {
      console.error('Error in createTimelineEvent:', error);
      return null;
    }
  }

  /**
   * Update a timeline event
   * @param timelineId - The ID of the timeline event to update
   * @param updates - The timeline event data to update
   * @returns The updated timeline event
   */
  async updateTimelineEvent(
    timelineId: string,
    updates: Partial<ProjectTimeline>
  ): Promise<ProjectTimeline | null> {
    try {
      const { data, error } = await supabase
        .from('project_timeline')
        .update(updates)
        .eq('id', timelineId)
        .select()
        .single();

      if (error) {
        console.error('Error updating timeline event:', error);
        return null;
      }

      return data as ProjectTimeline;
    } catch (error) {
      console.error('Error in updateTimelineEvent:', error);
      return null;
    }
  }

  /**
   * Delete a timeline event
   * @param timelineId - The ID of the timeline event to delete
   * @returns True if successful, false otherwise
   */
  async deleteTimelineEvent(timelineId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_timeline')
        .delete()
        .eq('id', timelineId);

      if (error) {
        console.error('Error deleting timeline event:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTimelineEvent:', error);
      return false;
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
          assignee:assigned_to(*),
          comments:project_issue_comments(
            *,
            user:user_id(*)
          )
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
      const { data, error } = await supabase
        .from('project_issues')
        .insert({
          project_id: issue.project_id,
          reported_by: issue.reported_by,
          title: issue.title,
          description: issue.description || '',
          priority: issue.priority || 'medium',
          status: 'open',
          assigned_to: issue.assigned_to || null,
          due_date: issue.due_date || null
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating project issue:', error);
        return null;
      }

      return data.id;
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
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
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
}

export const projectService = new ProjectService();
