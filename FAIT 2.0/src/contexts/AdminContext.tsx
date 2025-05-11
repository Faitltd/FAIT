import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { adminService } from '../services/AdminService';
import { PlatformStats, SystemSettings, AuditLog } from '../types/admin';
import { Profile } from '../types/user';
import { VerificationRequest } from '../types/verification';
import { Dispute } from '../types/dispute';
import { useAuth } from './AuthContext';

interface AdminContextType {
  platformStats: PlatformStats;
  systemSettings: SystemSettings[];
  users: Profile[];
  verificationRequests: VerificationRequest[];
  disputes: Dispute[];
  auditLogs: AuditLog[];
  totalUsers: number;
  totalVerificationRequests: number;
  totalDisputes: number;
  totalAuditLogs: number;
  isLoadingStats: boolean;
  isLoadingSettings: boolean;
  isLoadingUsers: boolean;
  isLoadingVerifications: boolean;
  isLoadingDisputes: boolean;
  isLoadingAuditLogs: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  refreshUsers: (page: number, pageSize: number, searchQuery?: string) => Promise<void>;
  refreshVerifications: (page: number, pageSize: number, status?: string) => Promise<void>;
  refreshDisputes: (page: number, pageSize: number, status?: string) => Promise<void>;
  refreshAuditLogs: (page: number, pageSize: number, action?: string) => Promise<void>;
  updateSystemSetting: (key: string, value: string) => Promise<boolean>;
  approveVerification: (requestId: string) => Promise<boolean>;
  rejectVerification: (requestId: string, reason: string) => Promise<boolean>;
  resolveDispute: (disputeId: string, resolution: string) => Promise<boolean>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    total_users: 0,
    active_users: 0,
    total_projects: 0,
    active_projects: 0,
    total_disputes: 0,
    open_disputes: 0,
    total_verifications: 0,
    pending_verifications: 0
  });
  const [systemSettings, setSystemSettings] = useState<SystemSettings[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVerificationRequests, setTotalVerificationRequests] = useState(0);
  const [totalDisputes, setTotalDisputes] = useState(0);
  const [totalAuditLogs, setTotalAuditLogs] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingVerifications, setIsLoadingVerifications] = useState(false);
  const [isLoadingDisputes, setIsLoadingDisputes] = useState(false);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      refreshStats();
      refreshSettings();
    }
  }, [user]);

  const refreshStats = async () => {
    if (!user) return;
    
    setIsLoadingStats(true);
    try {
      const data = await adminService.getPlatformStats();
      setPlatformStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      setError('Failed to load platform stats');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const refreshSettings = async () => {
    if (!user) return;
    
    setIsLoadingSettings(true);
    try {
      const data = await adminService.getSystemSettings();
      setSystemSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError('Failed to load system settings');
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const refreshUsers = async (page: number, pageSize: number, searchQuery?: string) => {
    if (!user) return;
    
    setIsLoadingUsers(true);
    try {
      const { users, total } = await adminService.getUsers(page, pageSize, searchQuery);
      setUsers(users);
      setTotalUsers(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const refreshVerifications = async (page: number, pageSize: number, status?: string) => {
    if (!user) return;
    
    setIsLoadingVerifications(true);
    try {
      const { verifications, total } = await adminService.getVerificationRequests(page, pageSize, status);
      setVerificationRequests(verifications);
      setTotalVerificationRequests(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching verification requests:', err);
      setError('Failed to load verification requests');
    } finally {
      setIsLoadingVerifications(false);
    }
  };

  const refreshDisputes = async (page: number, pageSize: number, status?: string) => {
    if (!user) return;
    
    setIsLoadingDisputes(true);
    try {
      const { disputes, total } = await adminService.getDisputes(page, pageSize, status);
      setDisputes(disputes);
      setTotalDisputes(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching disputes:', err);
      setError('Failed to load disputes');
    } finally {
      setIsLoadingDisputes(false);
    }
  };

  const refreshAuditLogs = async (page: number, pageSize: number, action?: string) => {
    if (!user) return;
    
    setIsLoadingAuditLogs(true);
    try {
      const { logs, total } = await adminService.getAuditLogs(page, pageSize, action);
      setAuditLogs(logs);
      setTotalAuditLogs(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError('Failed to load audit logs');
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  const updateSystemSetting = async (key: string, value: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await adminService.updateSystemSetting(key, value, user.id);
      if (success) {
        // Update the setting in the local state
        setSystemSettings(prevSettings => 
          prevSettings.map(setting => 
            setting.setting_key === key 
              ? { ...setting, setting_value: value } 
              : setting
          )
        );
      }
      return success;
    } catch (err) {
      console.error('Error updating system setting:', err);
      setError('Failed to update system setting');
      return false;
    }
  };

  const approveVerification = async (requestId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await adminService.approveVerificationRequest(requestId, user.id);
      if (success) {
        // Update the verification request in the local state
        setVerificationRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId 
              ? { ...request, status: 'approved', updated_at: new Date().toISOString() } 
              : request
          )
        );
        
        // Update the platform stats
        setPlatformStats(prevStats => ({
          ...prevStats,
          pending_verifications: Math.max(0, prevStats.pending_verifications - 1)
        }));
      }
      return success;
    } catch (err) {
      console.error('Error approving verification request:', err);
      setError('Failed to approve verification request');
      return false;
    }
  };

  const rejectVerification = async (requestId: string, reason: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await adminService.rejectVerificationRequest(requestId, reason, user.id);
      if (success) {
        // Update the verification request in the local state
        setVerificationRequests(prevRequests => 
          prevRequests.map(request => 
            request.id === requestId 
              ? { 
                  ...request, 
                  status: 'rejected', 
                  rejection_reason: reason,
                  updated_at: new Date().toISOString() 
                } 
              : request
          )
        );
        
        // Update the platform stats
        setPlatformStats(prevStats => ({
          ...prevStats,
          pending_verifications: Math.max(0, prevStats.pending_verifications - 1)
        }));
      }
      return success;
    } catch (err) {
      console.error('Error rejecting verification request:', err);
      setError('Failed to reject verification request');
      return false;
    }
  };

  const resolveDispute = async (disputeId: string, resolution: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const success = await adminService.resolveDispute(disputeId, resolution, user.id);
      if (success) {
        // Update the dispute in the local state
        setDisputes(prevDisputes => 
          prevDisputes.map(dispute => 
            dispute.id === disputeId 
              ? { 
                  ...dispute, 
                  status: 'resolved', 
                  resolution: resolution,
                  resolved_at: new Date().toISOString(),
                  resolved_by: user
                } 
              : dispute
          )
        );
        
        // Update the platform stats
        setPlatformStats(prevStats => ({
          ...prevStats,
          open_disputes: Math.max(0, prevStats.open_disputes - 1)
        }));
      }
      return success;
    } catch (err) {
      console.error('Error resolving dispute:', err);
      setError('Failed to resolve dispute');
      return false;
    }
  };

  const value = {
    platformStats,
    systemSettings,
    users,
    verificationRequests,
    disputes,
    auditLogs,
    totalUsers,
    totalVerificationRequests,
    totalDisputes,
    totalAuditLogs,
    isLoadingStats,
    isLoadingSettings,
    isLoadingUsers,
    isLoadingVerifications,
    isLoadingDisputes,
    isLoadingAuditLogs,
    error,
    refreshStats,
    refreshSettings,
    refreshUsers,
    refreshVerifications,
    refreshDisputes,
    refreshAuditLogs,
    updateSystemSetting,
    approveVerification,
    rejectVerification,
    resolveDispute
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export default AdminContext;
