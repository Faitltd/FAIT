import React from 'react';
import SystemSettings from '../../components/admin/SystemSettings';

const SystemSettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Settings</h1>
      <SystemSettings />
    </div>
  );
};

export default SystemSettingsPage;
