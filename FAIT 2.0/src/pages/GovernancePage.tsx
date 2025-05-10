import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import GovernanceRoleManager from '../components/governance/GovernanceRoleManager';
import DividendEligibilityTracker from '../components/governance/DividendEligibilityTracker';
import BylawsAcknowledgment from '../components/governance/BylawsAcknowledgment';

const GovernancePage: React.FC = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'roles' | 'dividends' | 'bylaws'>('roles');

  useEffect(() => {
    // Check if user is an admin
    if (user && user.user_role === 'admin') {
      setIsAdmin(true);
    }
  }, [user]);

  if (!user) {
    return (
      <ResponsiveLayout title="Governance">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please log in to access governance features.
              </p>
            </div>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout title="Governance">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cooperative Governance</h1>
        <p className="text-gray-500">Manage governance roles, dividend eligibility, and bylaws.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('roles')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'roles'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Governance Roles
            </button>
            <button
              onClick={() => setActiveTab('dividends')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'dividends'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dividend Eligibility
            </button>
            <button
              onClick={() => setActiveTab('bylaws')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'bylaws'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bylaws
            </button>
          </nav>
        </div>
        
        <div className="p-4">
          {activeTab === 'roles' && (
            <GovernanceRoleManager isAdmin={isAdmin} />
          )}
          
          {activeTab === 'dividends' && (
            <DividendEligibilityTracker 
              memberId={user.id} 
              isAdmin={isAdmin} 
            />
          )}
          
          {activeTab === 'bylaws' && (
            <BylawsAcknowledgment 
              memberId={user.id} 
              isAdmin={isAdmin} 
            />
          )}
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Admin Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Manage Member Roles</h3>
              <p className="text-xs text-gray-500 mb-3">
                Assign governance roles to members and manage their permissions.
              </p>
              <button
                onClick={() => window.location.href = '/admin/member-roles'}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Member Roles
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Dividend Distributions</h3>
              <p className="text-xs text-gray-500 mb-3">
                Create and manage dividend distributions to eligible members.
              </p>
              <button
                onClick={() => window.location.href = '/admin/dividend-distributions'}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Distributions
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Bylaws Management</h3>
              <p className="text-xs text-gray-500 mb-3">
                Create new bylaws versions and track member acknowledgments.
              </p>
              <button
                onClick={() => window.location.href = '/admin/bylaws-management'}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Manage Bylaws
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Governance Reports</h3>
              <p className="text-xs text-gray-500 mb-3">
                Generate reports on governance activities and member participation.
              </p>
              <button
                onClick={() => window.location.href = '/admin/governance-reports'}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Reports
              </button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
};

export default GovernancePage;
