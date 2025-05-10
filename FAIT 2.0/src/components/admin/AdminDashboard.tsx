import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Clock, 
  Activity,
  BarChart,
  PieChart,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { adminService } from '../../services/AdminService';
import { PlatformStats } from '../../types/admin';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats>({
    total_users: 0,
    active_users: 0,
    total_projects: 0,
    active_projects: 0,
    total_disputes: 0,
    open_disputes: 0,
    total_verifications: 0,
    pending_verifications: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getPlatformStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    color, 
    secondaryValue, 
    secondaryLabel,
    linkTo
  }: { 
    title: string; 
    value: number; 
    icon: React.ReactNode; 
    color: string;
    secondaryValue?: number;
    secondaryLabel?: string;
    linkTo?: string;
  }) => {
    const content = (
      <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${color}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value.toLocaleString()}</p>
            {secondaryValue !== undefined && secondaryLabel && (
              <p className="mt-1 text-sm text-gray-500">
                {secondaryLabel}: <span className="font-medium">{secondaryValue.toLocaleString()}</span>
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-500', '-100')}`}>
            {icon}
          </div>
        </div>
      </div>
    );

    if (linkTo) {
      return <Link to={linkTo} className="block">{content}</Link>;
    }

    return content;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Platform Overview</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="p-3 rounded-full bg-gray-100">
                    <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={stats.total_users}
              icon={<Users className="h-6 w-6 text-blue-500" />}
              color="border-blue-500"
              secondaryValue={stats.active_users}
              secondaryLabel="Active in last 30 days"
              linkTo="/admin/users"
            />
            
            <StatCard
              title="Projects"
              value={stats.total_projects}
              icon={<FileText className="h-6 w-6 text-green-500" />}
              color="border-green-500"
              secondaryValue={stats.active_projects}
              secondaryLabel="Active projects"
              linkTo="/admin/projects"
            />
            
            <StatCard
              title="Verifications"
              value={stats.total_verifications}
              icon={<CheckCircle className="h-6 w-6 text-purple-500" />}
              color="border-purple-500"
              secondaryValue={stats.pending_verifications}
              secondaryLabel="Pending review"
              linkTo="/admin/verifications"
            />
            
            <StatCard
              title="Disputes"
              value={stats.total_disputes}
              icon={<AlertTriangle className="h-6 w-6 text-red-500" />}
              color="border-red-500"
              secondaryValue={stats.open_disputes}
              secondaryLabel="Open disputes"
              linkTo="/admin/disputes"
            />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            <Link to="/admin/audit-logs" className="text-sm text-blue-600 hover:text-blue-800">
              View all
            </Link>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-start">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex-shrink-0"></div>
                  <div className="ml-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-blue-100 flex-shrink-0">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">5 minutes ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-green-100 flex-shrink-0">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">New project created</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-purple-100 flex-shrink-0">
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">Verification request approved</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-red-100 flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">New dispute opened</p>
                  <p className="text-xs text-gray-500">3 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="p-2 rounded-full bg-yellow-100 flex-shrink-0">
                  <Activity className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">System settings updated</p>
                  <p className="text-xs text-gray-500">5 hours ago</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/users"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Users className="h-8 w-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Users</span>
            </Link>
            
            <Link
              to="/admin/verifications"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <CheckCircle className="h-8 w-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Review Verifications</span>
            </Link>
            
            <Link
              to="/admin/disputes"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">Handle Disputes</span>
            </Link>
            
            <Link
              to="/admin/settings"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Activity className="h-8 w-8 text-yellow-500 mb-2" />
              <span className="text-sm font-medium text-gray-900">System Settings</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">User Growth</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800">
                Weekly
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:bg-gray-100">
                Monthly
              </button>
              <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 hover:bg-gray-100">
                Yearly
              </button>
            </div>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Chart data would be displayed here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900">User Distribution</h3>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Chart data would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
