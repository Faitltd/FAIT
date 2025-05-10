import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuditLogs from '../../components/admin/AuditLogs';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/UserRoles';

const AuditLogsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== UserRole.ADMIN) {
      navigate('/');
    }
  }, [user]);

  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Logs</h1>
      <AuditLogs />
    </div>
  );
};

export default AuditLogsPage;
