import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Shield,
  Wrench,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  MessageCircle,
  CreditCard,
  DollarSign,
  Settings,
  Database
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Database } from '../../lib/database.types';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];
type ServiceAgentVerification = Database['public']['Tables']['service_agent_verifications']['Row'] & {
  service_agent: Database['public']['Tables']['profiles']['Row'];
};
type WarrantyClaim = Database['public']['Tables']['warranty_claims']['Row'] & {
  client: Database['public']['Tables']['profiles']['Row'];
  booking: Database['public']['Tables']['bookings']['Row'];
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    activeServiceAgents: 0,
    openWarrantyClaims: 0,
    completedClaims: 0
  });
  const [recentVerifications, setRecentVerifications] = useState<ServiceAgentVerification[]>([]);
  const [recentClaims, setRecentClaims] = useState<WarrantyClaim[]>([]);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single();

        if (adminError || !adminData) {
          throw new Error('Unauthorized access');
        }

        setAdminUser(adminData);

        // Fetch dashboard statistics directly from tables
        try {
          // Count pending verifications
          const { count: pendingVerifications, error: pendingError } = await supabase
            .from('contractor_verifications')
            .select('*', { count: 'exact', head: true })
            .eq('is_verified', false);

          if (pendingError) throw pendingError;

          // Count active service agents
          const { count: activeServiceAgents, error: serviceAgentsError } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('user_type', 'service_agent');

          if (serviceAgentsError) throw serviceAgentsError;

          // Count open warranty claims
          const { count: openWarrantyClaims, error: openClaimsError } = await supabase
            .from('warranty_claims')
            .select('*', { count: 'exact', head: true })
            .neq('status', 'resolved');

          if (openClaimsError) throw openClaimsError;

          // Count completed claims
          const { count: completedClaims, error: completedClaimsError } = await supabase
            .from('warranty_claims')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'resolved');

          if (completedClaimsError) throw completedClaimsError;

          // Set stats
          setStats({
            pendingVerifications: pendingVerifications || 0,
            activeServiceAgents: activeServiceAgents || 0,
            openWarrantyClaims: openWarrantyClaims || 0,
            completedClaims: completedClaims || 0
          });
        } catch (statsError) {
          console.error('Error fetching dashboard statistics:', statsError);
          // Continue with other data fetching even if stats fail
        }

        // Fetch recent verifications
        const { data: verifications, error: verificationError } = await supabase
          .from('service_agent_verifications')
          .select(`
            *,
            service_agent:profiles(*)
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (verificationError) throw verificationError;
        setRecentVerifications(verifications as ServiceAgentVerification[]);

        // Fetch recent warranty claims
        try {
          const { data: claims, error: claimsError } = await supabase
            .from('warranty_claims')
            .select(`
              *,
              client:profiles(*),
              booking:bookings(*)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

          if (claimsError) throw claimsError;
          setRecentClaims(claims as WarrantyClaim[]);
        } catch (claimsError) {
          console.error('Error fetching warranty claims:', claimsError);
          // Continue even if warranty claims fail to load
          setRecentClaims([]);
        }

      } catch (err) {
        console.error('Error loading admin dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load admin dashboard');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {adminUser?.role.replace('_', ' ')}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/dashboard/admin/verifications"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Verification Management</h3>
              <p className="text-sm text-gray-500">Review and process contractor verifications</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/admin/warranty"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Warranty Claims</h3>
              <p className="text-sm text-gray-500">Manage warranty claims and resolutions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/admin/messages"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Messages</h3>
              <p className="text-sm text-gray-500">View all client and service agent conversations</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/admin/subscriptions"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <CreditCard className="h-8 w-8 text-indigo-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Subscriptions & Billing</h3>
              <p className="text-sm text-gray-500">Manage user subscriptions and billing</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/admin/commissions"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Supplier Commissions</h3>
              <p className="text-sm text-gray-500">Track supplier orders and commissions</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/admin/pricing"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Settings className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pricing Controls</h3>
              <p className="text-sm text-gray-500">Configure subscription tiers and pricing</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/admin/data-import-export"
          className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <Database className="h-8 w-8 text-teal-600" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Data Import/Export</h3>
              <p className="text-sm text-gray-500">Import and export service agent and service data</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingVerifications}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Service Agents</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeServiceAgents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Warranty Claims</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.openWarrantyClaims}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Claims</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completedClaims}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Verifications */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Verifications</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentVerifications.map((verification) => (
              <div key={verification.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {verification.service_agent.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {verification.service_agent.email}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      verification.is_verified
                        ? 'bg-green-100 text-green-800'
                        : verification.background_check_status === 'in_progress'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {verification.is_verified
                      ? 'Verified'
                      : verification.background_check_status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Warranty Claims */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Warranty Claims</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {claim.client.full_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      Booking #{claim.booking_id}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      claim.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : claim.status === 'reviewing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{claim.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
