import { supabase } from '../lib/supabase';
import { OnboardingProgress, OnboardingStep } from '../types/verification.types';

/**
 * Service for handling service agent onboarding
 */
class OnboardingService {
  /**
   * Get onboarding progress for a service agent
   * @param serviceAgentId Service agent ID
   * @returns Onboarding progress
   */
  async getOnboardingProgress(serviceAgentId: string): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .select('*')
        .eq('service_agent_id', serviceAgentId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No record found, create a new one
          return this.createOnboardingProgress(serviceAgentId);
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return null;
    }
  }
  
  /**
   * Create onboarding progress for a service agent
   * @param serviceAgentId Service agent ID
   * @returns Created onboarding progress
   */
  async createOnboardingProgress(serviceAgentId: string): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .insert({
          service_agent_id: serviceAgentId,
          current_step: OnboardingStep.WELCOME,
          completed_steps: [],
          is_completed: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error creating onboarding progress:', error);
      return null;
    }
  }
  
  /**
   * Update current step
   * @param serviceAgentId Service agent ID
   * @param step Current step
   * @returns Updated onboarding progress
   */
  async updateCurrentStep(
    serviceAgentId: string,
    step: OnboardingStep
  ): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({
          current_step: step,
          last_updated_at: new Date().toISOString()
        })
        .eq('service_agent_id', serviceAgentId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating current step:', error);
      return null;
    }
  }
  
  /**
   * Mark step as completed
   * @param serviceAgentId Service agent ID
   * @param step Completed step
   * @returns Updated onboarding progress
   */
  async completeStep(
    serviceAgentId: string,
    step: OnboardingStep
  ): Promise<OnboardingProgress | null> {
    try {
      // Get current progress
      const { data: currentProgress, error: progressError } = await supabase
        .from('onboarding_progress')
        .select('completed_steps')
        .eq('service_agent_id', serviceAgentId)
        .single();
      
      if (progressError) throw progressError;
      
      // Add step to completed steps if not already there
      const completedSteps = currentProgress.completed_steps || [];
      if (!completedSteps.includes(step)) {
        completedSteps.push(step);
      }
      
      // Update progress
      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({
          completed_steps: completedSteps,
          last_updated_at: new Date().toISOString()
        })
        .eq('service_agent_id', serviceAgentId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error completing step:', error);
      return null;
    }
  }
  
  /**
   * Complete onboarding
   * @param serviceAgentId Service agent ID
   * @returns Updated onboarding progress
   */
  async completeOnboarding(serviceAgentId: string): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('onboarding_progress')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
          last_updated_at: new Date().toISOString()
        })
        .eq('service_agent_id', serviceAgentId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return null;
    }
  }
  
  /**
   * Get next step
   * @param serviceAgentId Service agent ID
   * @returns Next step
   */
  async getNextStep(serviceAgentId: string): Promise<OnboardingStep | null> {
    try {
      const progress = await this.getOnboardingProgress(serviceAgentId);
      if (!progress) return null;
      
      const allSteps = Object.values(OnboardingStep);
      const currentStepIndex = allSteps.indexOf(progress.current_step as OnboardingStep);
      
      if (currentStepIndex < allSteps.length - 1) {
        return allSteps[currentStepIndex + 1];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting next step:', error);
      return null;
    }
  }
  
  /**
   * Check if step is completed
   * @param serviceAgentId Service agent ID
   * @param step Step to check
   * @returns Whether step is completed
   */
  async isStepCompleted(
    serviceAgentId: string,
    step: OnboardingStep
  ): Promise<boolean> {
    try {
      const progress = await this.getOnboardingProgress(serviceAgentId);
      if (!progress) return false;
      
      return progress.completed_steps.includes(step);
    } catch (error) {
      console.error('Error checking if step is completed:', error);
      return false;
    }
  }
  
  /**
   * Get onboarding completion percentage
   * @param serviceAgentId Service agent ID
   * @returns Completion percentage (0-100)
   */
  async getCompletionPercentage(serviceAgentId: string): Promise<number> {
    try {
      const progress = await this.getOnboardingProgress(serviceAgentId);
      if (!progress) return 0;
      
      const allSteps = Object.values(OnboardingStep);
      const completedSteps = progress.completed_steps.length;
      
      return Math.round((completedSteps / allSteps.length) * 100);
    } catch (error) {
      console.error('Error getting completion percentage:', error);
      return 0;
    }
  }
}

export const onboardingService = new OnboardingService();
