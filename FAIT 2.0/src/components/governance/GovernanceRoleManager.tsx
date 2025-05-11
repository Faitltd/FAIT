import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield,
  Check,
  X
} from 'lucide-react';
import { GovernanceRole } from '../../types/governance';
import { governanceService } from '../../services/GovernanceService';

interface GovernanceRoleManagerProps {
  isAdmin?: boolean;
}

const GovernanceRoleManager: React.FC<GovernanceRoleManagerProps> = ({ 
  isAdmin = false 
}) => {
  const [roles, setRoles] = useState<GovernanceRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  
  // Form state for adding/editing roles
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: {
      can_vote: false,
      can_approve_dividends: false,
      can_modify_bylaws: false,
      can_create_committees: false
    }
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const data = await governanceService.getGovernanceRoles();
      setRoles(data);
      setError(null);
    } catch (err) {
      setError('Failed to load governance roles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [name]: checked
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin) return;
    
    try {
      const newRole = await governanceService.createGovernanceRole({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions
      });

      if (newRole) {
        setRoles([...roles, newRole]);
        setIsAddingRole(false);
        setFormData({
          name: '',
          description: '',
          permissions: {
            can_vote: false,
            can_approve_dividends: false,
            can_modify_bylaws: false,
            can_create_committees: false
          }
        });
      }
    } catch (err) {
      console.error('Failed to add role:', err);
    }
  };

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAdmin || !editingRoleId) return;
    
    try {
      const updatedRole = await governanceService.updateGovernanceRole(
        editingRoleId,
        {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions
        }
      );

      if (updatedRole) {
        setRoles(roles.map(role => 
          role.id === editingRoleId ? updatedRole : role
        ));
        setEditingRoleId(null);
        setFormData({
          name: '',
          description: '',
          permissions: {
            can_vote: false,
            can_approve_dividends: false,
            can_modify_bylaws: false,
            can_create_committees: false
          }
        });
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!isAdmin) return;
    
    if (!window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }
    
    try {
      const success = await governanceService.deleteGovernanceRole(id);
      
      if (success) {
        setRoles(roles.filter(role => role.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete role:', err);
    }
  };

  const startEditRole = (role: GovernanceRole) => {
    if (!isAdmin) return;
    
    setFormData({
      name: role.name,
      description: role.description,
      permissions: {
        can_vote: role.permissions.can_vote || false,
        can_approve_dividends: role.permissions.can_approve_dividends || false,
        can_modify_bylaws: role.permissions.can_modify_bylaws || false,
        can_create_committees: role.permissions.can_create_committees || false
      }
    });
    setEditingRoleId(role.id);
  };

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Governance Roles</h3>
        {isAdmin && (
          <button
            onClick={() => setIsAddingRole(true)}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Role
          </button>
        )}
      </div>

      {isAddingRole && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAddRole} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Role Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="can_vote"
                    id="can_vote"
                    checked={formData.permissions.can_vote}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_vote" className="ml-2 block text-sm text-gray-700">
                    Can Vote
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="can_approve_dividends"
                    id="can_approve_dividends"
                    checked={formData.permissions.can_approve_dividends}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_approve_dividends" className="ml-2 block text-sm text-gray-700">
                    Can Approve Dividends
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="can_modify_bylaws"
                    id="can_modify_bylaws"
                    checked={formData.permissions.can_modify_bylaws}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_modify_bylaws" className="ml-2 block text-sm text-gray-700">
                    Can Modify Bylaws
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="can_create_committees"
                    id="can_create_committees"
                    checked={formData.permissions.can_create_committees}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_create_committees" className="ml-2 block text-sm text-gray-700">
                    Can Create Committees
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsAddingRole(false)}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Role
              </button>
            </div>
          </form>
        </div>
      )}

      {editingRoleId && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleEditRole} className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">
                Role Name
              </label>
              <input
                type="text"
                name="name"
                id="edit-name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="edit-description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="can_vote"
                    id="edit-can_vote"
                    checked={formData.permissions.can_vote}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-can_vote" className="ml-2 block text-sm text-gray-700">
                    Can Vote
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="can_approve_dividends"
                    id="edit-can_approve_dividends"
                    checked={formData.permissions.can_approve_dividends}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-can_approve_dividends" className="ml-2 block text-sm text-gray-700">
                    Can Approve Dividends
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="can_modify_bylaws"
                    id="edit-can_modify_bylaws"
                    checked={formData.permissions.can_modify_bylaws}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-can_modify_bylaws" className="ml-2 block text-sm text-gray-700">
                    Can Modify Bylaws
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="can_create_committees"
                    id="edit-can_create_committees"
                    checked={formData.permissions.can_create_committees}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="edit-can_create_committees" className="ml-2 block text-sm text-gray-700">
                    Can Create Committees
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => handleDeleteRole(editingRoleId)}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingRoleId(null)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Role
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {roles.length === 0 ? (
        <div className="p-8 text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Governance Roles</h3>
          <p className="text-gray-500 mb-4">
            No governance roles have been defined yet.
          </p>
          {isAdmin && (
            <button
              onClick={() => setIsAddingRole(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add First Role
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {roles.map((role) => (
            <div key={role.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start">
                <div className="mr-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{role.name}</h4>
                    {isAdmin && (
                      <button
                        onClick={() => startEditRole(role)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {role.description && (
                    <p className="mt-1 text-sm text-gray-500">{role.description}</p>
                  )}
                  
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="flex items-center text-xs text-gray-500">
                      {role.permissions.can_vote ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span>Can Vote</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      {role.permissions.can_approve_dividends ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span>Can Approve Dividends</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      {role.permissions.can_modify_bylaws ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span>Can Modify Bylaws</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      {role.permissions.can_create_committees ? (
                        <Check className="h-3 w-3 text-green-500 mr-1" />
                      ) : (
                        <X className="h-3 w-3 text-red-500 mr-1" />
                      )}
                      <span>Can Create Committees</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GovernanceRoleManager;
