import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useFAIT } from '../../contexts/FAITContext';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Clock, 
  DollarSign, 
  Award,
  Briefcase,
  FileCheck,
  Shield,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

// Dashboard components
import DashboardStats from './DashboardStats';
import UsersList from '../users/UsersList';
import ProjectsList from '../projects/ProjectsList';
import DisputesList from '../disputes/DisputesList';
import VerificationsList from '../verifications/VerificationsList';

interface AdminDashboardProps {
  // Add any props if needed
}

const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>({
    users: { total: 0, clients: 0, contractors: 0, allies: 0 },
    projects: { total: 0, active: 0, completed: 0 },
    verifications: { pending: 0 },
    disputes: { open: 0 },
    revenue: { total: 0, monthly: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user stats
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, user_role');
          
        if (!usersError && usersData) {
          const clients = usersData.filter(u => u.user_role === 'client').length;
          const contractors = usersData.filter(u => u.user_role === 'contractor').length;
          const allies = usersData.filter(u => u.user_role === 'ally').length;
          
          setStats(prev => ({
            ...prev,
            users: {
              total: usersData.length,
              clients,
              contractors,
              allies
            }
          }));
        }
        
        // Fetch project stats
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, status');
          
        if (!projectsError && projectsData) {
          const active = projectsData.filter(p => p.status === 'in_progress').length;
          const completed = projectsData.filter(p => p.status === 'completed').length;
          
          setStats(prev => ({
            ...prev,
            projects: {
              total: projectsData.length,
              active,
              completed
            }
          }));
        }
        
        // Fetch verification stats
        const { count: pendingVerifications, error: verificationsError } = await supabase
          .from('trade_partners')
          .select('id', { count: 'exact' })
          .eq('status', 'invited');
          
        if (!verificationsError) {
          setStats(prev => ({
            ...prev,
            verifications: {
              pending: pendingVerifications || 0
            }
          }));
        }
        
        // Fetch dispute stats
        // In a real app, you would have a disputes table
        // This is a placeholder
        setStats(prev => ({
          ...prev,
          disputes: {
            open: 5 // Placeholder value
          }
        }));
        
        // Calculate revenue (simplified for demo)
        // In a real app, you would fetch actual payment data
        setStats(prev => ({
          ...prev,
          revenue: {
            total: 50000, // Placeholder value
            monthly: 5000  // Placeholder value
          }
        }));
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Link 
            to="/admin/users/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Add User
          </Link>
          <Link 
            to="/admin/reports" 
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
          >
            Reports
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats 
          title="Total Users" 
          value={stats.users.total} 
          icon={<Users className="h-6 w-6 text-blue-500" />}
          detail={`${stats.users.clients} clients, ${stats.users.contractors} contractors`}
        />
        <DashboardStats 
          title="Active Projects" 
          value={stats.projects.active} 
          icon={<Briefcase className="h-6 w-6 text-green-500" />}
          detail={`${stats.projects.total} total projects`}
        />
        <DashboardStats 
          title="Pending Verifications" 
          value={stats.verifications.pending} 
          icon={<Shield className="h-6 w-6 text-orange-500" />}
          detail="awaiting review"
        />
        <DashboardStats 
          title="Revenue" 
          value={`$${stats.revenue.total.toLocaleString()}`} 
          icon={<DollarSign className="h-6 w-6 text-purple-500" />}
          detail={`$${stats.revenue.monthly.toLocaleString()} this month`}
        />
      </div>
      
      {/* Users and Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Users</h2>
            <Link to="/admin/users" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <UsersList limit={5} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <Link to="/admin/projects" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <ProjectsList limit={5} status="in_progress" isAdmin={true} />
        </div>
      </div>
      
      {/* Verifications and Disputes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending Verifications</h2>
            <Link to="/admin/verifications" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <VerificationsList limit={5} status="pending" />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Open Disputes</h2>
            <Link to="/admin/disputes" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <DisputesList limit={5} status="open" />
        </div>
      </div>
      
      {/* Platform Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Platform Analytics</h2>
          <Link to="/admin/analytics" className="text-blue-600 hover:text-blue-800 text-sm">
            View Detailed Analytics
          </Link>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p>Analytics dashboard would be displayed here</p>
            <p className="text-sm">Showing user growth, project completion rates, and revenue metrics</p>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/admin/users/invite" 
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex flex-col items-center text-center"
          >
            <Users className="h-8 w-8 text-blue-500 mb-2" />
            <span className="font-medium">Invite Users</span>
            <span className="text-sm text-gray-500">Send invitations to new users</span>
          </Link>
          
          <Link 
            to="/admin/marketplace/manage" 
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition flex flex-col items-center text-center"
          >
            <DollarSign className="h-8 w-8 text-green-500 mb-2" />
            <span className="font-medium">Manage Marketplace</span>
            <span className="text-sm text-gray-500">Update offerings and pricing</span>
          </Link>
          
          <Link 
            to="/admin/training/manage" 
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition flex flex-col items-center text-center"
          >
            <Award className="h-8 w-8 text-purple-500 mb-2" />
            <span className="font-medium">Training Modules</span>
            <span className="text-sm text-gray-500">Create and edit training content</span>
          </Link>
          
          <Link 
            to="/admin/settings" 
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition flex flex-col items-center text-center"
          >
            <Shield className="h-8 w-8 text-gray-500 mb-2" />
            <span className="font-medium">Platform Settings</span>
            <span className="text-sm text-gray-500">Configure system parameters</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
