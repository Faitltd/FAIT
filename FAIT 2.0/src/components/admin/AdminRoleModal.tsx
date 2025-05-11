import React, { useState, useEffect } from 'react';
import { X, Shield, AlertCircle } from 'lucide-react';
import { adminService } from '../../services/AdminService';
import { Profile } from '../../types/user';
import { AdminRole } from '../../types/admin';

interface AdminRoleModalProps {
  user: Profile;
  onClose: () => void;
  onUserUpdated: () => void;
}

const AdminRoleModal: React.FC<AdminRoleModalProps> = ({ user, onClose, onUserUpdated }) => {
  const [adminRole, setAdminRole] = useState<AdminRole>('admin');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExistingAdmin, setIsExistingAdmin] = useState(false);

  useEffect(() => {
    // Check if user is already an admin
    const checkAdminStatus = async () => {
      try {
        const adminUsers = await adminService.getAdminUsers();
        const existingAdmin = adminUsers.find(admin => admin.id === user.id);
        
        if (existingAdmin) {
          setIsExistingAdmin(true);
          setAdminRole(existingAdmin.admin_role as AdminRole);
          setPermissions(existingAdmin.permissions || []);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };
    
    checkAdminStatus();
  }, [user]);

  const handlePermissionChange = (permission: string) => {
    setPermissions(prev => {
      if (prev.includes(permission)) {
        return prev.filter(p => p !== permission);
      } else {
        return [...prev, permission];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (isExistingAdmin) {
        // Update existing admin
        const updatedAdmin = await adminService.updateAdminUser(user.id, {
          admin_role: adminRole,
          permissions
        });
        
        if (updatedAdmin) {
          onUserUpdated();
        } else {
          setError('Failed to update admin role');
        }
      } else {
        // Create new admin
        const newAdmin = await adminService.createAdminUser(
          user.id,
          adminRole,
          permissions
        );
        
        if (newAdmin) {
          onUserUpdated();
        } else {
          setError('Failed to assign admin role');
        }
      }
    } catch (err) {
      console.error('Error updating admin role:', err);
      setError('An error occurred while updating admin role');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Available permissions
  const availablePermissions = [
    { id: 'users_read', label: 'View Users' },
    { id: 'users_write', label: 'Manage Users' },
    { id: 'verifications_read', label: 'View Verifications' },
    { id: 'verifications_write', label: 'Process Verifications' },
    { id: 'disputes_read', label: 'View Disputes' },
    { id: 'disputes_write', label: 'Manage Disputes' },
    { id: 'settings_read', label: 'View Settings' },
    { id: 'settings_write', label: 'Manage Settings' },
    { id: 'reports_read', label: 'View Reports' },
    { id: 'audit_logs_read', label: 'View Audit Logs' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Shield className="h-5 w-5 text-purple-600 mr-2" />
            {isExistingAdmin ? 'Edit Admin Role' : 'Assign Admin Role'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              You are {isExistingAdmin ? 'editing' : 'assigning'} admin privileges for:
            </p>
            <div className="flex items-center p-4 bg-gray-50 rounded-md">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                ) : (
                  user.full_name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="admin_role" className="block text-sm font-medium text-gray-700 mb-1">
              Admin Role
            </label>
            <select
              id="admin_role"
              value={adminRole}
              onChange={(e) => setAdminRole(e.target.value as AdminRole)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
              <option value="moderator">Moderator</option>
              <option value="support">Support</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissions
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-md">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={permission.id}
                    checked={permissions.includes(permission.id)}
                    onChange={() => handlePermissionChange(permission.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={permission.id} className="ml-2 block text-sm text-gray-700">
                    {permission.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isExistingAdmin ? 'Update Role' : 'Assign Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminRoleModal;
