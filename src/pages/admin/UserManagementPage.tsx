import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/UnifiedAuthContext';

interface User {
  id: string;
  email: string;
  user_type: string;
  full_name?: string;
  created_at: string;
  last_sign_in_at?: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLocalAuth } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // For local auth, use mock data
        if (isLocalAuth) {
          // Mock users data
          const mockUsers: User[] = [
            {
              id: 'admin-uuid',
              email: 'admin@itsfait.com',
              user_type: 'admin',
              full_name: 'Admin User',
              created_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString()
            },
            {
              id: 'client-uuid',
              email: 'client@itsfait.com',
              user_type: 'client',
              full_name: 'Client User',
              created_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString()
            },
            {
              id: 'service-uuid',
              email: 'service@itsfait.com',
              user_type: 'service_agent',
              full_name: 'Service Agent',
              created_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString()
            },
            {
              id: 'test-client-1',
              email: 'test.client1@itsfait.com',
              user_type: 'client',
              full_name: 'Test Client 1',
              created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              last_sign_in_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: 'test-service-1',
              email: 'test.service1@itsfait.com',
              user_type: 'service_agent',
              full_name: 'Test Service Agent 1',
              created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              last_sign_in_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
            }
          ];
          
          setUsers(mockUsers);
        } else {
          // In a real implementation, you would fetch users from Supabase
          // For now, we'll use the same mock data
          const mockUsers: User[] = [
            {
              id: 'admin-uuid',
              email: 'admin@itsfait.com',
              user_type: 'admin',
              full_name: 'Admin User',
              created_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString()
            },
            {
              id: 'client-uuid',
              email: 'client@itsfait.com',
              user_type: 'client',
              full_name: 'Client User',
              created_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString()
            },
            {
              id: 'service-uuid',
              email: 'service@itsfait.com',
              user_type: 'service_agent',
              full_name: 'Service Agent',
              created_at: new Date().toISOString(),
              last_sign_in_at: new Date().toISOString()
            }
          ];
          
          setUsers(mockUsers);
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [isLocalAuth]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Link
          to="/dashboard/admin"
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Back to Dashboard
        </Link>
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.full_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.user_type === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.user_type === 'service_agent' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.user_type === 'admin' 
                        ? 'Admin' 
                        : user.user_type === 'service_agent' 
                          ? 'Service Agent' 
                          : 'Client'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.last_sign_in_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
