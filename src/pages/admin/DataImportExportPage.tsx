import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DataImportExport from '../../components/admin/DataImportExport';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Database, Upload, Download, AlertTriangle } from 'lucide-react';

/**
 * Admin page for data import and export
 */
const DataImportExportPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // Redirect if not admin
  if (!user || !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">
            You don't have permission to access this page. Please contact an administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Database className="h-6 w-6 mr-2 text-blue-600" />
              Data Import & Export
            </h1>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Download className="h-5 w-5 mr-2 text-blue-600" />
                    Export Data
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Export service agents, services, bookings, and reviews data to CSV format.
                    You can filter the data by status, ZIP code, and other criteria.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-green-600" />
                    Import Data
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Import service agents and services data from CSV files.
                    The system will automatically update existing records or create new ones.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <DataImportExport />
            </div>
          </div>
          
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Important Notes</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      Large exports may take some time to process. Please be patient.
                    </li>
                    <li>
                      When importing data, make sure your CSV file follows the correct format.
                      You can export data first to see the expected format.
                    </li>
                    <li>
                      Importing data will update existing records if they have the same ID or email.
                    </li>
                    <li>
                      Some fields like ratings and review counts cannot be directly imported as they are calculated.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DataImportExportPage;
