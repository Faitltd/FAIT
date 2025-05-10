import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, Shield, Package, MessageSquare, Calendar, DollarSign, AlertTriangle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    users: { total: 0, clients: 0, serviceAgents: 0 },
    verifications: { pending: 0 },
    services: { total: 0, active: 0 },
    bookings: { total: 0, today: 0 },
    revenue: { total: 0, thisMonth: 0 },
  });
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  
  useEffect(() => {
    // Redirect if not admin
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
    
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch user stats
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, user_type, created_at')
          .order('created_at', { ascending: false });
          
        if (usersError) {
          console.error('Error fetching users:', usersError);
        } else {
          const clients = usersData.filter(user => user.user_type === 'client');
          const serviceAgents = usersData.filter(user => user.user_type === 'service_agent');
          
          setStats((prev: any) => ({
            ...prev,
            users: {
              total: usersData.length,
              clients: clients.length,
              serviceAgents: serviceAgents.length,
            },
          }));
          
          setRecentUsers(usersData.slice(0, 5));
        }
        
        // Fetch verification stats
        const { data: verificationsData, error: verificationsError } = await supabase
          .from('service_agent_verification')
          .select('id, service_agent_id, verification_status, created_at, service_agents:service_agent_id(full_name)')
          .eq('verification_status', 'pending')
          .order('created_at', { ascending: true });
          
        if (verificationsError) {
          console.error('Error fetching verifications:', verificationsError);
        } else {
          setStats((prev: any) => ({
            ...prev,
            verifications: {
              pending: verificationsData.length,
            },
          }));
          
          setPendingVerifications(verificationsData.slice(0, 5));
        }
        
        // Fetch service stats
        const { data: servicesData, error: servicesError } = await supabase
          .from('service_packages')
          .select('id, is_active');
          
        if (servicesError) {
          console.error('Error fetching services:', servicesError);
        } else {
          const activeServices = servicesData.filter(service => service.is_active);
          
          setStats((prev: any) => ({
            ...prev,
            services: {
              total: servicesData.length,
              active: activeServices.length,
            },
          }));
        }
        
        // Fetch booking stats
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, booking_date, total_amount, payment_status');
          
        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError);
        } else {
          const today = new Date().toISOString().split('T')[0];
          const todayBookings = bookingsData.filter(booking => booking.booking_date === today);
          
          // Calculate revenue
          const totalRevenue = bookingsData
            .filter(booking => booking.payment_status === 'paid')
            .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
            
          const thisMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
          const thisMonthRevenue = bookingsData
            .filter(booking => 
              booking.payment_status === 'paid' && 
              booking.booking_date.startsWith(thisMonth)
            )
            .reduce((sum, booking) => sum + (booking.total_amount || 0), 0);
          
          setStats((prev: any) => ({
            ...prev,
            bookings: {
              total: bookingsData.length,
              today: todayBookings.length,
            },
            revenue: {
              total: totalRevenue,
              thisMonth: thisMonthRevenue,
            },
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, isAdmin, navigate]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage the FAIT Co-op platform and monitor key metrics.
        </p>
      </div>
      
      {/* Stats section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.users.total}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Clients: {stats.users.clients}</span>
            <span>Service Agents: {stats.users.serviceAgents}</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <Shield className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.verifications.pending}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link
              to="/dashboard/admin/verifications"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Review verifications
            </Link>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Services</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.services.active}</p>
            </div>
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-500">
            <span>Total: {stats.services.total}</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue (Month)</p>
              <p className="text-2xl font-semibold text-gray-900">${stats.revenue.thisMonth.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <span>Total: ${stats.revenue.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Pending verifications section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Pending Verifications</h2>
          <Link
            to="/dashboard/admin/verifications"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        {pendingVerifications.length === 0 ? (
          <p className="text-gray-500">There are no pending verifications.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Agent
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pendingVerifications.map((verification) => (
                  <tr key={verification.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {verification.service_agents?.full_name || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {verification.verification_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(verification.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/dashboard/admin/verifications/${verification.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Recent users section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Users</h2>
          <Link
            to="/dashboard/admin/users"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View all users
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.user_type === 'service_agent' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.user_type === 'service_agent' ? 'Service Agent' : 'Client'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      to={`/dashboard/admin/users/${user.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Quick actions section */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/dashboard/admin/verifications"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Shield className="h-5 w-5 mr-2" />
            Review Verifications
          </Link>
          
          <Link
            to="/dashboard/admin/reports"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            Generate Reports
          </Link>
          
          <Link
            to="/dashboard/admin/settings"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <AlertTriangle className="h-5 w-5 mr-2" />
            System Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
