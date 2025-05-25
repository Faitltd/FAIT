import React from 'react';
import Navbar from '../../components/Navbar';
import AuditLogViewer from '../../components/admin/AuditLogViewer';

const AuditLogPage = () => {
  return (
    <>
      <Navbar />
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Audit Logs</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
              <AuditLogViewer />
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default AuditLogPage;
