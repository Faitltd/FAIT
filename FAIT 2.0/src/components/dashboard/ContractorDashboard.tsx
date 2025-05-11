import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useFAIT } from '../../contexts/FAITContext';
import { 
  Calendar, 
  FileText, 
  MessageSquare, 
  CheckSquare, 
  Clock, 
  DollarSign, 
  Award,
  Briefcase,
  FileCheck,
  Users
} from 'lucide-react';

// Dashboard components
import DashboardStats from './DashboardStats';
import ProjectsList from '../projects/ProjectsList';
import MessagePreview from '../messaging/MessagePreview';
import RFPList from '../rfp/RFPList';
import EstimatesList from '../estimates/EstimatesList';
import MasteryScoreCard from '../incentives/MasteryScoreCard';
import TradePartnersList from '../partners/TradePartnersList';

interface ContractorDashboardProps {
  // Add any props if needed
}

const ContractorDashboard: React.FC<ContractorDashboardProps> = () => {
  const { user } = useAuth();
  const { mastery, tokens, badges } = useFAIT();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>({
    projects: { total: 0, active: 0, completed: 0 },
    rfps: { total: 0, pending: 0 },
    estimates: { total: 0, pending: 0, approved: 0 },
    messages: { unread: 0 },
    earnings: { total: 0, pending: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch project stats
        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('id, status')
          .eq('contractor_id', user.id);
          
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
        
        // Fetch RFP stats
        const { data: rfpData, error: rfpError } = await supabase
          .from('rfp_recipients')
          .select('id, status, rfps!inner(id, status)')
          .eq('profile_id', user.id);
          
        if (!rfpError && rfpData) {
          const pending = rfpData.filter(r => r.status === 'pending').length;
          
          setStats(prev => ({
            ...prev,
            rfps: {
              total: rfpData.length,
              pending
            }
          }));
        }
        
        // Fetch estimate stats
        const { data: estimatesData, error: estimatesError } = await supabase
          .from('estimates')
          .select('id, status')
          .eq('created_by', user.id);
          
        if (!estimatesError && estimatesData) {
          const pending = estimatesData.filter(e => e.status === 'sent').length;
          const approved = estimatesData.filter(e => e.status === 'approved').length;
          
          setStats(prev => ({
            ...prev,
            estimates: {
              total: estimatesData.length,
              pending,
              approved
            }
          }));
        }
        
        // Fetch unread messages count
        const { count: unreadCount, error: messagesError } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('recipient_id', user.id)
          .eq('read', false);
          
        if (!messagesError) {
          setStats(prev => ({
            ...prev,
            messages: {
              unread: unreadCount || 0
            }
          }));
        }
        
        // Calculate earnings (simplified for demo)
        const totalEarnings = estimatesData
          ?.filter(e => e.status === 'approved')
          .reduce((sum, estimate) => {
            // In a real app, you would fetch the actual payment data
            return sum + 1000; // Placeholder value
          }, 0) || 0;
          
        const pendingEarnings = estimatesData
          ?.filter(e => e.status === 'sent')
          .reduce((sum, estimate) => {
            // In a real app, you would fetch the actual estimate amounts
            return sum + 1000; // Placeholder value
          }, 0) || 0;
          
        setStats(prev => ({
          ...prev,
          earnings: {
            total: totalEarnings,
            pending: pendingEarnings
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
        <h1 className="text-2xl font-bold">Contractor Dashboard</h1>
        <div className="flex space-x-2">
          <Link 
            to="/estimates/new" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            New Estimate
          </Link>
          <Link 
            to="/rfps/browse" 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            Browse RFPs
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats 
          title="Active Projects" 
          value={stats.projects.active} 
          icon={<Briefcase className="h-6 w-6 text-blue-500" />}
          detail={`${stats.projects.total} total projects`}
        />
        <DashboardStats 
          title="Pending RFPs" 
          value={stats.rfps.pending} 
          icon={<FileText className="h-6 w-6 text-orange-500" />}
          detail={`${stats.rfps.total} total RFPs`}
        />
        <DashboardStats 
          title="Pending Estimates" 
          value={stats.estimates.pending} 
          icon={<FileCheck className="h-6 w-6 text-purple-500" />}
          detail={`${stats.estimates.approved} approved`}
        />
        <DashboardStats 
          title="Earnings" 
          value={`$${stats.earnings.total.toLocaleString()}`} 
          icon={<DollarSign className="h-6 w-6 text-green-500" />}
          detail={`$${stats.earnings.pending.toLocaleString()} pending`}
        />
      </div>
      
      {/* Projects and RFPs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <Link to="/projects" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <ProjectsList limit={3} status="in_progress" isContractor={true} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pending RFPs</h2>
            <Link to="/rfps" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <RFPList limit={3} status="pending" />
        </div>
      </div>
      
      {/* Estimates and Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Estimates</h2>
            <Link to="/estimates" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <EstimatesList limit={3} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            <Link to="/messages" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <MessagePreview limit={3} />
        </div>
      </div>
      
      {/* Trade Partners and Mastery Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Trade Partners</h2>
            <Link to="/partners" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <TradePartnersList limit={3} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Mastery Score</h2>
            <Link to="/mastery" className="text-blue-600 hover:text-blue-800 text-sm">
              View Details
            </Link>
          </div>
          <MasteryScoreCard />
        </div>
      </div>
      
      {/* FAIT Tokens */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">FAIT Tokens</h2>
          <Link to="/tokens" className="text-blue-600 hover:text-blue-800 text-sm">
            View History
          </Link>
        </div>
        <div className="flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{tokens}</div>
            <div className="text-gray-500 mt-2">Available Tokens</div>
            <div className="mt-4 flex space-x-4 justify-center">
              <Link 
                to="/marketplace" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Visit Marketplace
              </Link>
              <Link 
                to="/training" 
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
              >
                Training Modules
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractorDashboard;
