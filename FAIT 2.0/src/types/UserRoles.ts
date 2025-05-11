/**
 * User role definitions for the FAIT Platform
 */

export enum UserRole {
  CLIENT = 'client',
  CONTRACTOR = 'contractor',
  ADMIN = 'admin',
  ALLY = 'ally'
}

/**
 * Role display names for UI presentation
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.CLIENT]: 'Client',
  [UserRole.CONTRACTOR]: 'Contractor',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.ALLY]: 'Ally'
};

/**
 * Role descriptions for UI presentation
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  [UserRole.CLIENT]: 'Property owners who need construction or renovation services',
  [UserRole.CONTRACTOR]: 'Construction professionals who provide services to clients',
  [UserRole.ADMIN]: 'FAIT platform administrators with full system access',
  [UserRole.ALLY]: 'Architects, designers, and other professionals who support projects'
};

export interface UserPermissions {
  canViewProjects: boolean;
  canCreateProjects: boolean;
  canEditProjects: boolean;
  canDeleteProjects: boolean;
  canViewEstimates: boolean;
  canCreateEstimates: boolean;
  canEditEstimates: boolean;
  canDeleteEstimates: boolean;
  canViewClients: boolean;
  canViewContractors: boolean;
  canViewAdmins: boolean;
  canViewAllies: boolean;
  canManageUsers: boolean;
  canManageRoles: boolean;
  canManageSettings: boolean;
  canManagePayments: boolean;
  canManageDisputes: boolean;
  canManageReviews: boolean;
  canManageMarketplace: boolean;
  canManageTraining: boolean;
  canManageGrants: boolean;
  canManageIncentives: boolean;
}

/**
 * Helper function to check if a user has a specific permission
 * @param userRole The user's role
 * @param permission The permission to check
 * @returns boolean indicating if the user has the permission
 */
export function hasPermission(userRole: UserRole | null, permission: keyof UserPermissions): boolean {
  if (!userRole) return false;
  return DEFAULT_PERMISSIONS[userRole][permission];
}

/**
 * Default permissions for each user role
 */
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [UserRole.CLIENT]: {
    canViewProjects: true,
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewEstimates: true,
    canCreateEstimates: false,
    canEditEstimates: false,
    canDeleteEstimates: false,
    canViewClients: false,
    canViewContractors: true,
    canViewAdmins: false,
    canViewAllies: true,
    canManageUsers: false,
    canManageRoles: false,
    canManageSettings: false,
    canManagePayments: true,
    canManageDisputes: true,
    canManageReviews: true,
    canManageMarketplace: false,
    canManageTraining: false,
    canManageGrants: false,
    canManageIncentives: false
  },
  [UserRole.CONTRACTOR]: {
    canViewProjects: true,
    canCreateProjects: false,
    canEditProjects: true,
    canDeleteProjects: false,
    canViewEstimates: true,
    canCreateEstimates: true,
    canEditEstimates: true,
    canDeleteEstimates: false,
    canViewClients: true,
    canViewContractors: false,
    canViewAdmins: false,
    canViewAllies: true,
    canManageUsers: false,
    canManageRoles: false,
    canManageSettings: false,
    canManagePayments: true,
    canManageDisputes: true,
    canManageReviews: true,
    canManageMarketplace: false,
    canManageTraining: false,
    canManageGrants: false,
    canManageIncentives: false
  },
  [UserRole.ADMIN]: {
    canViewProjects: true,
    canCreateProjects: true,
    canEditProjects: true,
    canDeleteProjects: true,
    canViewEstimates: true,
    canCreateEstimates: true,
    canEditEstimates: true,
    canDeleteEstimates: true,
    canViewClients: true,
    canViewContractors: true,
    canViewAdmins: true,
    canViewAllies: true,
    canManageUsers: true,
    canManageRoles: true,
    canManageSettings: true,
    canManagePayments: true,
    canManageDisputes: true,
    canManageReviews: true,
    canManageMarketplace: true,
    canManageTraining: true,
    canManageGrants: true,
    canManageIncentives: true
  },
  [UserRole.ALLY]: {
    canViewProjects: true,
    canCreateProjects: false,
    canEditProjects: false,
    canDeleteProjects: false,
    canViewEstimates: true,
    canCreateEstimates: false,
    canEditEstimates: false,
    canDeleteEstimates: false,
    canViewClients: true,
    canViewContractors: true,
    canViewAdmins: false,
    canViewAllies: false,
    canManageUsers: false,
    canManageRoles: false,
    canManageSettings: false,
    canManagePayments: false,
    canManageDisputes: false,
    canManageReviews: false,
    canManageMarketplace: false,
    canManageTraining: false,
    canManageGrants: false,
    canManageIncentives: false
  }
};
