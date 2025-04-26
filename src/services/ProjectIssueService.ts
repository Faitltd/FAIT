import { supabase } from '../lib/supabase';
import { 
  ProjectIssue, 
  ProjectIssueComment,
  ProjectCycle,
  ProjectModule,
  ProjectView
} from '../types/plane-integration';

class ProjectIssueService {
  /**
   * Get all issues for a project
   * @param projectId The project ID
   * @returns Array of project issues
   */
  async getProjectIssues(projectId: string): Promise<ProjectIssue[]> {
    try {
      const { data, error } = await supabase
        .from('project_issues')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project issues:', error);
        throw error;
      }

      // Parse labels from JSONB to array
      return data.map(issue => ({
        ...issue,
        labels: issue.labels || []
      })) as ProjectIssue[];
    } catch (error) {
      console.error('Error in getProjectIssues:', error);
      throw error;
    }
  }

  /**
   * Get a specific issue by ID
   * @param issueId The issue ID
   * @returns The issue data
   */
  async getIssueById(issueId: string): Promise<ProjectIssue | null> {
    try {
      const { data, error } = await supabase
        .from('project_issues')
        .select('*')
        .eq('id', issueId)
        .single();

      if (error) {
        console.error('Error fetching issue:', error);
        throw error;
      }

      return {
        ...data,
        labels: data.labels || []
      } as ProjectIssue;
    } catch (error) {
      console.error('Error in getIssueById:', error);
      throw error;
    }
  }

  /**
   * Create a new issue
   * @param issue The issue data
   * @returns The created issue
   */
  async createIssue(issue: Omit<ProjectIssue, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectIssue> {
    try {
      const { data, error } = await supabase
        .from('project_issues')
        .insert({
          ...issue,
          labels: issue.labels || []
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating issue:', error);
        throw error;
      }

      return data as ProjectIssue;
    } catch (error) {
      console.error('Error in createIssue:', error);
      throw error;
    }
  }

  /**
   * Update an existing issue
   * @param issueId The issue ID
   * @param issueData The updated issue data
   * @returns The updated issue
   */
  async updateIssue(issueId: string, issueData: Partial<ProjectIssue>): Promise<ProjectIssue> {
    try {
      const { data, error } = await supabase
        .from('project_issues')
        .update(issueData)
        .eq('id', issueId)
        .select()
        .single();

      if (error) {
        console.error('Error updating issue:', error);
        throw error;
      }

      return {
        ...data,
        labels: data.labels || []
      } as ProjectIssue;
    } catch (error) {
      console.error('Error in updateIssue:', error);
      throw error;
    }
  }

  /**
   * Delete an issue
   * @param issueId The issue ID
   * @returns True if successful
   */
  async deleteIssue(issueId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('project_issues')
        .delete()
        .eq('id', issueId);

      if (error) {
        console.error('Error deleting issue:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteIssue:', error);
      throw error;
    }
  }

  /**
   * Get comments for an issue
   * @param issueId The issue ID
   * @returns Array of comments
   */
  async getIssueComments(issueId: string): Promise<ProjectIssueComment[]> {
    try {
      const { data, error } = await supabase
        .from('project_issue_comments')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .eq('issue_id', issueId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching issue comments:', error);
        throw error;
      }

      return data as unknown as ProjectIssueComment[];
    } catch (error) {
      console.error('Error in getIssueComments:', error);
      throw error;
    }
  }

  /**
   * Add a comment to an issue
   * @param comment The comment data
   * @returns The created comment
   */
  async addComment(comment: Omit<ProjectIssueComment, 'id' | 'created_at' | 'updated_at'>): Promise<ProjectIssueComment> {
    try {
      const { data, error } = await supabase
        .from('project_issue_comments')
        .insert(comment)
        .select()
        .single();

      if (error) {
        console.error('Error adding comment:', error);
        throw error;
      }

      return data as ProjectIssueComment;
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  }

  /**
   * Get cycles for a project
   * @param projectId The project ID
   * @returns Array of cycles
   */
  async getProjectCycles(projectId: string): Promise<ProjectCycle[]> {
    try {
      const { data, error } = await supabase
        .from('project_cycles')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project cycles:', error);
        throw error;
      }

      return data as ProjectCycle[];
    } catch (error) {
      console.error('Error in getProjectCycles:', error);
      throw error;
    }
  }

  /**
   * Get modules for a project
   * @param projectId The project ID
   * @returns Array of modules
   */
  async getProjectModules(projectId: string): Promise<ProjectModule[]> {
    try {
      const { data, error } = await supabase
        .from('project_modules')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project modules:', error);
        throw error;
      }

      return data as ProjectModule[];
    } catch (error) {
      console.error('Error in getProjectModules:', error);
      throw error;
    }
  }

  /**
   * Get views for a project
   * @param projectId The project ID
   * @returns Array of views
   */
  async getProjectViews(projectId: string): Promise<ProjectView[]> {
    try {
      const { data, error } = await supabase
        .from('project_views')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching project views:', error);
        throw error;
      }

      return data as ProjectView[];
    } catch (error) {
      console.error('Error in getProjectViews:', error);
      throw error;
    }
  }
}

export const projectIssueService = new ProjectIssueService();
export default projectIssueService;
