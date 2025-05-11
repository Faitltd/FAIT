import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { UserRole, UserPermissions, DEFAULT_PERMISSIONS, hasPermission } from '../types/UserRoles';

interface MasteryScore {
  skillScore: number;
  communicationScore: number;
  reliabilityScore: number;
  overallScore: number;
}

interface Badge {
  id: string;
  badges: {
    id: string;
    name: string;
    description: string | null;
    icon_url: string | null;
    badge_type: string;
  };
  awarded_at: string;
}

interface FAITContextType {
  userRole: UserRole | null;
  permissions: UserPermissions | null;
  mastery: MasteryScore | null;
  tokens: number;
  badges: Badge[];
  isLoading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
  awardTokens: (amount: number, description: string) => Promise<boolean>;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  getMasteryLevel: () => string;
  getNextLevelThreshold: () => number;
  getProgressToNextLevel: () => number;
}

const FAITContext = createContext<FAITContextType>({
  userRole: null,
  permissions: null,
  mastery: null,
  tokens: 0,
  badges: [],
  isLoading: true,
  error: null,
  refreshUserData: async () => {},
  awardTokens: async () => false,
  hasPermission: () => false,
  getMasteryLevel: () => 'Apprentice',
  getNextLevelThreshold: () => 100,
  getProgressToNextLevel: () => 0
});

export const useFAIT = () => useContext(FAITContext);

export const FAITProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [mastery, setMastery] = useState<FAITContextType['mastery']>(null);
  const [tokens, setTokens] = useState<number>(0);
  const [badges, setBadges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate user ID format (should be UUID for Supabase)
      if (!user.id || typeof user.id !== 'string' || !user.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error('Invalid user ID format:', user.id);
        setError('Invalid user ID format. Please sign out and sign in again.');
        setIsLoading(false);
        return;
      }

      console.log('Fetching user data for ID:', user.id);

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // If profile not found and we're in development mode, create one
      if (profileError && profileError.code === 'PGRST116' && import.meta.env.MODE === 'development') {
        console.log('Profile not found for development user. Creating one...');

        // Determine role from localStorage if available
        const devUserStr = localStorage.getItem('devUser');
        let userRole = UserRole.CLIENT; // Default

        if (devUserStr) {
          try {
            const devUserData = JSON.parse(devUserStr);
            userRole = devUserData.user_role as UserRole;
          } catch (e) {
            console.error('Error parsing dev user data:', e);
          }
        }

        // Create profile
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: 'Dev',
            last_name: 'User',
            user_role: userRole,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile for dev user:', createError);
          throw createError;
        }

        console.log('Created new profile for development user:', newProfile);
        return fetchUserData(); // Retry fetching with the new profile
      }

      if (profileError) throw profileError;

      // Set user role and permissions
      const role = profile.user_role as UserRole;
      setUserRole(role);
      setPermissions(DEFAULT_PERMISSIONS[role]);

      // Fetch mastery scores
      const { data: masteryData, error: masteryError } = await supabase
        .from('mastery_scores')
        .select('*')
        .eq('profile_id', user.id)
        .single();

      if (!masteryError && masteryData) {
        setMastery({
          skillScore: masteryData.skill_score,
          communicationScore: masteryData.communication_score,
          reliabilityScore: masteryData.reliability_score,
          overallScore: masteryData.overall_score
        });
      } else {
        // Create default mastery scores if none exist
        const { data: newMastery, error: newMasteryError } = await supabase
          .from('mastery_scores')
          .insert({
            profile_id: user.id,
            skill_score: 0,
            communication_score: 0,
            reliability_score: 0,
            overall_score: 0
          })
          .select()
          .single();

        if (!newMasteryError && newMastery) {
          setMastery({
            skillScore: newMastery.skill_score,
            communicationScore: newMastery.communication_score,
            reliabilityScore: newMastery.reliability_score,
            overallScore: newMastery.overall_score
          });
        }
      }

      // Fetch token balance
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('get_token_balance', { user_id: user.id });

      if (!tokenError) {
        setTokens(tokenData || 0);
      }

      // Fetch user badges
      const { data: badgeData, error: badgeError } = await supabase
        .from('user_badges')
        .select(`
          id,
          awarded_at,
          badges (
            id,
            name,
            description,
            icon_url,
            badge_type
          )
        `)
        .eq('profile_id', user.id);

      if (!badgeError && badgeData) {
        setBadges(badgeData);
      }

    } catch (err: any) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const refreshUserData = async () => {
    await fetchUserData();
  };

  // Award tokens to the user
  const awardTokens = async (amount: number, description: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('tokens')
        .insert({
          profile_id: user.id,
          amount,
          transaction_type: 'award',
          description,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error awarding tokens:', error);
        return false;
      }

      // Update local state
      setTokens(prev => prev + amount);
      return true;
    } catch (err) {
      console.error('Error in awardTokens:', err);
      return false;
    }
  };

  // Check if user has a specific permission
  const checkPermission = (permission: keyof UserPermissions): boolean => {
    if (!userRole || !permissions) return false;
    return permissions[permission];
  };

  // Calculate mastery level based on overall score
  const getMasteryLevel = (): string => {
    if (!mastery) return 'Apprentice';

    const score = mastery.overallScore;
    if (score < 100) return 'Apprentice';
    if (score < 300) return 'Journeyman';
    if (score < 600) return 'Craftsman';
    if (score < 1000) return 'Master';
    return 'Grandmaster';
  };

  // Get threshold for next level
  const getNextLevelThreshold = (): number => {
    if (!mastery) return 100;

    const level = getMasteryLevel();
    switch (level) {
      case 'Apprentice': return 100;
      case 'Journeyman': return 300;
      case 'Craftsman': return 600;
      case 'Master': return 1000;
      default: return mastery.overallScore + 500; // For Grandmaster, just show progress to next 500
    }
  };

  // Calculate progress percentage to next level
  const getProgressToNextLevel = (): number => {
    if (!mastery) return 0;

    const level = getMasteryLevel();
    const nextThreshold = getNextLevelThreshold();
    const previousThreshold = level === 'Apprentice' ? 0 :
      level === 'Journeyman' ? 100 :
      level === 'Craftsman' ? 300 :
      level === 'Master' ? 600 :
      mastery.overallScore - (mastery.overallScore % 500);

    return Math.min(
      100,
      ((mastery.overallScore - previousThreshold) / (nextThreshold - previousThreshold)) * 100
    );
  };

  return (
    <FAITContext.Provider
      value={{
        userRole,
        permissions,
        mastery,
        tokens,
        badges,
        isLoading,
        error,
        refreshUserData,
        awardTokens,
        hasPermission: checkPermission,
        getMasteryLevel,
        getNextLevelThreshold,
        getProgressToNextLevel
      }}
    >
      {children}
    </FAITContext.Provider>
  );
};
