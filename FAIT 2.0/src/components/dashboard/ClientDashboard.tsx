import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useFAIT } from '../../contexts/FAITContext';
import {
  Briefcase,
  FileText,
  MessageSquare,
  CheckSquare,
  Clock,
  DollarSign,
  Award,
  Search,
  PlusCircle,
  FileCheck,
  Users
} from 'lucide-react';

// Dashboard components
import DashboardStats from './DashboardStats';
import ProjectsList from '../projects/ProjectsList';
import MessagePreview from '../messaging/MessagePreview';
import DocumentsList from '../documents/DocumentsList';
import PunchlistItems from '../projects/PunchlistItems';
import MasteryScoreCard from '../incentives/MasteryScoreCard';

interface ClientDashboardProps {
  // Add any props if needed
}

const ClientDashboard: React.FC<ClientDashboardProps> = () => {
  const { user } = useAuth();
  const { mastery, tokens, badges } = useFAIT();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>({
    projects: { total: 0, active: 0, completed: 0 },
    messages: { unread: 0 },
    documents: { total: 0, recent: 0 },
    punchlist: { total: 0, completed: 0, pending: 0 }
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
          .eq('client_id', user.id);

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

        // Fetch document stats
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('id, created_at')
          .eq('project_id', 'in', (projectsData || []).map(p => p.id));

        if (!documentsError && documentsData) {
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

          const recent = documentsData.filter(
            d => new Date(d.created_at) >= oneWeekAgo
          ).length;

          setStats(prev => ({
            ...prev,
            documents: {
              total: documentsData.length,
              recent
            }
          }));
        }

        // Fetch punchlist stats
        const { data: punchlistData, error: punchlistError } = await supabase
          .from('punchlist_items')
          .select('id, status')
          .eq('project_id', 'in', (projectsData || []).map(p => p.id));

        if (!punchlistError && punchlistData) {
          const completed = punchlistData.filter(p => p.status === 'completed').length;
          const pending = punchlistData.filter(p => p.status !== 'completed').length;

          setStats(prev => ({
            ...prev,
            punchlist: {
              total: punchlistData.length,
              completed,
              pending
            }
          }));
        }

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
        <h1 className="text-2xl font-bold">Client Dashboard</h1>
        <div className="flex space-x-2">
          <Link
            to="/dashboard/projects/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Project
          </Link>
          <Link
            to="/dashboard/contractors/search"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center"
          >
            <Search className="h-4 w-4 mr-2" />
            Find Contractors
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardStats
          title="Projects"
          value={stats.projects.total}
          icon={<FileText className="h-6 w-6 text-blue-500" />}
          detail={`${stats.projects.active} active`}
        />
        <DashboardStats
          title="Messages"
          value={stats.messages.unread}
          icon={<MessageSquare className="h-6 w-6 text-green-500" />}
          detail="unread messages"
        />
        <DashboardStats
          title="Documents"
          value={stats.documents.total}
          icon={<FileCheck className="h-6 w-6 text-purple-500" />}
          detail={`${stats.documents.recent} new this week`}
        />
        <DashboardStats
          title="Punchlist Items"
          value={stats.punchlist.pending}
          icon={<CheckSquare className="h-6 w-6 text-orange-500" />}
          detail={`${stats.punchlist.completed} completed`}
        />
      </div>

      {/* Projects and Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <Link to="/dashboard/projects" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <ProjectsList limit={3} status="in_progress" />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Messages</h2>
            <Link to="/dashboard/messages" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <MessagePreview limit={3} />
        </div>
      </div>

      {/* Documents and Punchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Documents</h2>
            <Link to="/dashboard/documents" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <DocumentsList limit={3} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Punchlist Items</h2>
            <Link to="/dashboard/punchlist" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <PunchlistItems limit={3} />
        </div>
      </div>

      {/* Mastery Score and Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Mastery Score</h2>
            <Link to="/dashboard/mastery" className="text-blue-600 hover:text-blue-800 text-sm">
              View Details
            </Link>
          </div>
          <MasteryScoreCard />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">FAIT Tokens</h2>
            <Link to="/dashboard/tokens" className="text-blue-600 hover:text-blue-800 text-sm">
              View History
            </Link>
          </div>
          <div className="flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">{tokens}</div>
              <div className="text-gray-500 mt-2">Available Tokens</div>
              <Link
                to="/dashboard/marketplace"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Visit Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
