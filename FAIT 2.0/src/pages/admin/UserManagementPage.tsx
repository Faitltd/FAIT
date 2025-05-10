import React from 'react';
import UserManagement from '../../components/admin/UserManagement';

const UserManagementPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">User Management</h1>
      <UserManagement />
    </div>
  );
};

export default UserManagementPage;
