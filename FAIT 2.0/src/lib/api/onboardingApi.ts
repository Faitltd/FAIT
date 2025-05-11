import { supabase } from '../supabase';

interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  order_index: number;
  required: boolean;
  user_role: string;
}

interface UserOnboardingProgress {
  id: string;
  user_id: string;
  step_id: string;
  completed: boolean;
  completed_at: string | null;
  step?: OnboardingStep;
}

/**
 * Get all onboarding steps for a user role
 */
export const getOnboardingSteps = async (userRole: string): Promise<OnboardingStep[]> => {
  try {
    const { data, error } = await supabase
      .from('onboarding_steps')
      .select('*')
      .or(`user_role.eq.all,user_role.eq.${userRole}`)
      .order('order_index', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting onboarding steps:', error);
    throw new Error('Failed to get onboarding steps');
  }
};

/**
 * Get onboarding progress for a user
 */
export const getUserOnboardingProgress = async (userId: string): Promise<UserOnboardingProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('user_onboarding_progress')
      .select(`
        *,
        step:step_id(*)
      `)
      .eq('user_id', userId);
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting user onboarding progress:', error);
    throw new Error('Failed to get user onboarding progress');
  }
};

/**
 * Get onboarding completion status for a user
 */
export const getOnboardingCompletionStatus = async (userId: string): Promise<{
  completed: boolean;
  completedAt: string | null;
  completedSteps: number;
  totalSteps: number;
  requiredSteps: number;
  completedRequiredSteps: number;
}> => {
  try {
    // Get user profile to check if onboarding is completed
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('onboarding_completed, onboarding_completed_at, user_role')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      throw profileError;
    }
    
    // Get all steps for the user's role
    const { data: steps, error: stepsError } = await supabase
      .from('onboarding_steps')
      .select('*')
      .or(`user_role.eq.all,user_role.eq.${profile.user_role}`)
      .order('order_index', { ascending: true });
      
    if (stepsError) {
      throw stepsError;
    }
    
    // Get user's progress
    const { data: progress, error: progressError } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('user_id', userId);
      
    if (progressError) {
      throw progressError;
    }
    
    // Calculate completion metrics
    const totalSteps = steps.length;
    const requiredSteps = steps.filter(step => step.required).length;
    const completedSteps = progress.filter(p => p.completed).length;
    const completedRequiredSteps = progress.filter(p => {
      const step = steps.find(s => s.id === p.step_id);
      return p.completed && step && step.required;
    }).length;
    
    return {
      completed: profile.onboarding_completed || false,
      completedAt: profile.onboarding_completed_at,
      completedSteps,
      totalSteps,
      requiredSteps,
      completedRequiredSteps,
    };
  } catch (error) {
    console.error('Error getting onboarding completion status:', error);
    throw new Error('Failed to get onboarding completion status');
  }
};

/**
 * Mark an onboarding step as completed
 */
export const completeOnboardingStep = async (userId: string, stepId: string): Promise<void> => {
  try {
    // Check if progress record exists
    const { data: existingProgress, error: checkError } = await supabase
      .from('user_onboarding_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('step_id', stepId)
      .maybeSingle();
      
    if (checkError) {
      throw checkError;
    }
    
    if (existingProgress) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('user_onboarding_progress')
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id);
        
      if (updateError) {
        throw updateError;
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from('user_onboarding_progress')
        .insert({
          user_id: userId,
          step_id: stepId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
        
      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error completing onboarding step:', error);
    throw new Error('Failed to complete onboarding step');
  }
};

/**
 * Reset an onboarding step (mark as not completed)
 */
export const resetOnboardingStep = async (userId: string, stepId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_onboarding_progress')
      .update({
        completed: false,
        completed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('step_id', stepId);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error resetting onboarding step:', error);
    throw new Error('Failed to reset onboarding step');
  }
};
