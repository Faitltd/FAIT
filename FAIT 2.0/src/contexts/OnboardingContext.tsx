import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getOnboardingSteps,
  getUserOnboardingProgress,
  getOnboardingCompletionStatus,
  completeOnboardingStep,
  resetOnboardingStep,
} from '../lib/api/onboardingApi';

interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  order_index: number;
  required: boolean;
  user_role: string;
}

interface UserProgress {
  id: string;
  step_id: string;
  completed: boolean;
  completed_at: string | null;
}

interface OnboardingStatus {
  completed: boolean;
  completedAt: string | null;
  completedSteps: number;
  totalSteps: number;
  requiredSteps: number;
  completedRequiredSteps: number;
  percentComplete: number;
}

interface OnboardingContextType {
  steps: OnboardingStep[];
  userProgress: UserProgress[];
  status: OnboardingStatus | null;
  loading: boolean;
  error: string | null;
  completeStep: (stepId: string) => Promise<void>;
  resetStep: (stepId: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
  isStepCompleted: (stepId: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userRole } = useAuth();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch onboarding data when user or userRole changes
  useEffect(() => {
    if (user && userRole) {
      fetchOnboardingData();
    }
  }, [user, userRole]);

  // Fetch all onboarding data
  const fetchOnboardingData = async () => {
    if (!user || !userRole) return;

    setLoading(true);
    setError(null);

    try {
      // Get steps for user role
      const stepsData = await getOnboardingSteps(userRole);
      setSteps(stepsData);

      // Get user progress
      const progressData = await getUserOnboardingProgress(user.id);
      setUserProgress(progressData.map(p => ({
        id: p.id,
        step_id: p.step_id,
        completed: p.completed,
        completed_at: p.completed_at,
      })));

      // Get completion status
      const statusData = await getOnboardingCompletionStatus(user.id);
      setStatus({
        ...statusData,
        percentComplete: Math.round((statusData.completedSteps / statusData.totalSteps) * 100),
      });
    } catch (err) {
      console.error('Error fetching onboarding data:', err);
      setError('Failed to load onboarding data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Complete an onboarding step
  const completeStep = async (stepId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await completeOnboardingStep(user.id, stepId);
      await fetchOnboardingData(); // Refresh data
    } catch (err) {
      console.error('Error completing step:', err);
      setError('Failed to complete step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset an onboarding step
  const resetStep = async (stepId: string) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      await resetOnboardingStep(user.id, stepId);
      await fetchOnboardingData(); // Refresh data
    } catch (err) {
      console.error('Error resetting step:', err);
      setError('Failed to reset step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Refresh progress data
  const refreshProgress = async () => {
    await fetchOnboardingData();
  };

  // Check if a step is completed
  const isStepCompleted = (stepId: string): boolean => {
    return userProgress.some(p => p.step_id === stepId && p.completed);
  };

  const value = {
    steps,
    userProgress,
    status,
    loading,
    error,
    completeStep,
    resetStep,
    refreshProgress,
    isStepCompleted,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
