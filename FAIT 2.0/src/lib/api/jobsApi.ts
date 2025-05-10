import { supabase } from '../supabase';

interface JobPosting {
  id: string;
  client_id: string;
  category_id: string | null;
  title: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  location: string | null;
  zip_code: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'open' | 'in_progress' | 'completed' | 'canceled' | 'expired';
  is_remote: boolean | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  category?: any;
  client?: any;
  applications?: JobApplication[];
}

interface JobApplication {
  id: string;
  job_id: string;
  service_agent_id: string;
  cover_letter: string | null;
  price_quote: number | null;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  created_at: string;
  updated_at: string;
  service_agent?: any;
}

/**
 * Get job postings with optional filtering
 */
export const getJobPostings = async (options?: {
  clientId?: string;
  categoryId?: string;
  status?: string;
  searchTerm?: string;
  limit?: number;
  offset?: number;
}): Promise<{ jobs: JobPosting[]; total: number }> => {
  try {
    let query = supabase
      .from('job_postings')
      .select(`
        *,
        category:category_id(*),
        client:client_id(id, full_name, avatar_url),
        applications:job_applications(*)
      `, { count: 'exact' });
      
    // Apply filters
    if (options?.clientId) {
      query = query.eq('client_id', options.clientId);
    }
    
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    
    if (options?.status) {
      query = query.eq('status', options.status);
    } else {
      // Default to showing only open jobs if status not specified
      query = query.eq('status', 'open');
    }
    
    if (options?.searchTerm) {
      query = query.or(`title.ilike.%${options.searchTerm}%,description.ilike.%${options.searchTerm}%`);
    }
    
    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }
    
    // Execute query
    const { data, error, count } = await query.order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return {
      jobs: data,
      total: count || 0,
    };
  } catch (error) {
    console.error('Error fetching job postings:', error);
    throw new Error('Failed to fetch job postings');
  }
};

/**
 * Get a single job posting by ID
 */
export const getJobPostingById = async (id: string): Promise<JobPosting> => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select(`
        *,
        category:category_id(*),
        client:client_id(id, full_name, avatar_url),
        applications:job_applications(
          *,
          service_agent:service_agent_id(id, full_name, avatar_url)
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching job posting:', error);
    throw new Error('Failed to fetch job posting');
  }
};

/**
 * Create a new job posting
 */
export const createJobPosting = async (
  clientId: string,
  jobData: Omit<JobPosting, 'id' | 'client_id' | 'created_at' | 'updated_at' | 'status'>
): Promise<JobPosting> => {
  try {
    // Calculate expiration date (default to 30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Insert the job posting
    const { data, error } = await supabase
      .from('job_postings')
      .insert({
        ...jobData,
        client_id: clientId,
        status: 'open',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating job posting:', error);
    throw new Error('Failed to create job posting');
  }
};

/**
 * Update an existing job posting
 */
export const updateJobPosting = async (
  id: string,
  clientId: string,
  jobData: Partial<Omit<JobPosting, 'id' | 'client_id' | 'created_at' | 'updated_at'>>
): Promise<JobPosting> => {
  try {
    // Update the job posting
    const { data, error } = await supabase
      .from('job_postings')
      .update({
        ...jobData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('client_id', clientId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating job posting:', error);
    throw new Error('Failed to update job posting');
  }
};

/**
 * Delete a job posting
 */
export const deleteJobPosting = async (id: string, clientId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', id)
      .eq('client_id', clientId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting job posting:', error);
    throw new Error('Failed to delete job posting');
  }
};

/**
 * Apply to a job posting
 */
export const applyToJob = async (
  jobId: string,
  serviceAgentId: string,
  applicationData: {
    cover_letter?: string;
    price_quote?: number;
  }
): Promise<JobApplication> => {
  try {
    // Check if already applied
    const { data: existingApplication, error: checkError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('service_agent_id', serviceAgentId)
      .maybeSingle();
      
    if (checkError) {
      throw checkError;
    }
    
    if (existingApplication) {
      throw new Error('You have already applied to this job');
    }
    
    // Insert the application
    const { data, error } = await supabase
      .from('job_applications')
      .insert({
        job_id: jobId,
        service_agent_id: serviceAgentId,
        cover_letter: applicationData.cover_letter,
        price_quote: applicationData.price_quote,
        status: 'pending',
      })
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error applying to job:', error);
    throw error;
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string,
  clientId: string,
  status: 'accepted' | 'rejected'
): Promise<JobApplication> => {
  try {
    // Verify the client owns the job
    const { data: application, error: fetchError } = await supabase
      .from('job_applications')
      .select('job_id')
      .eq('id', applicationId)
      .single();
      
    if (fetchError) {
      throw fetchError;
    }
    
    const { data: job, error: jobError } = await supabase
      .from('job_postings')
      .select('id')
      .eq('id', application.job_id)
      .eq('client_id', clientId)
      .single();
      
    if (jobError) {
      throw jobError;
    }
    
    // Update the application status
    const { data, error } = await supabase
      .from('job_applications')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    // If accepting, update job status and reject other applications
    if (status === 'accepted') {
      // Update job status to in_progress
      await supabase
        .from('job_postings')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString(),
        })
        .eq('id', application.job_id);
        
      // Reject other applications
      await supabase
        .from('job_applications')
        .update({
          status: 'rejected',
          updated_at: new Date().toISOString(),
        })
        .eq('job_id', application.job_id)
        .neq('id', applicationId);
    }
    
    return data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw new Error('Failed to update application status');
  }
};

/**
 * Withdraw a job application
 */
export const withdrawApplication = async (
  applicationId: string,
  serviceAgentId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('job_applications')
      .update({
        status: 'withdrawn',
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .eq('service_agent_id', serviceAgentId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error withdrawing application:', error);
    throw new Error('Failed to withdraw application');
  }
};

/**
 * Get applications for a service agent
 */
export const getServiceAgentApplications = async (
  serviceAgentId: string
): Promise<JobApplication[]> => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job:job_id(*)
      `)
      .eq('service_agent_id', serviceAgentId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching service agent applications:', error);
    throw new Error('Failed to fetch applications');
  }
};
