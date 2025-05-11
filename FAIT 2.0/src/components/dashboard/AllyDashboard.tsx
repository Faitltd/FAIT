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
  PenTool,
  Image,
  Calendar
} from 'lucide-react';

// Dashboard components
import DashboardStats from './DashboardStats';
import ProjectsList from '../projects/ProjectsList';
import MessagePreview from '../messaging/MessagePreview';
import DocumentsList from '../documents/DocumentsList';
import MasteryScoreCard from '../incentives/MasteryScoreCard';

interface AllyDashboardProps {
  // Add any props if needed
}

const AllyDashboard: React.FC<AllyDashboardProps> = () => {
  const { user } = useAuth();
  const { mastery, tokens, badges } = useFAIT();
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>({
    projects: { total: 0, active: 0, completed: 0 },
    messages: { unread: 0 },
    documents: { total: 0, recent: 0 },
    upcoming: { total: 0 }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch projects where ally is involved
        const { data: projectsData, error: projectsError } = await supabase
          .from('trade_partners')
          .select('project_id, projects!inner(id, status)')
          .eq('profile_id', user.id);
          
        if (!projectsError && projectsData) {
          const projectIds = projectsData.map(p => p.project_id);
          const projects = projectsData.map(p => p.projects);
          
          const active = projects.filter(p => p.status === 'in_progress').length;
          const completed = projects.filter(p => p.status === 'completed').length;
          
          setStats(prev => ({
            ...prev,
            projects: {
              total: projectsData.length,
              active,
              completed
            }
          }));
          
          // Fetch document stats for these projects
          if (projectIds.length > 0) {
            const { data: documentsData, error: documentsError } = await supabase
              .from('documents')
              .select('id, created_at')
              .in('project_id', projectIds);
              
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
          }
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
        
        // Fetch upcoming appointments/milestones
        // In a real app, you would have a more sophisticated query
        // This is a placeholder
        setStats(prev => ({
          ...prev,
          upcoming: {
            total: 3 // Placeholder value
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
        <h1 className="text-2xl font-bold">Ally Dashboard</h1>
        <div className="flex space-x-2">
          <Link 
            to="/documents/upload" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Upload Documents
          </Link>
          <Link 
            to="/calendar" 
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            View Calendar
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
          title="Unread Messages" 
          value={stats.messages.unread} 
          icon={<MessageSquare className="h-6 w-6 text-green-500" />}
          detail="awaiting your response"
        />
        <DashboardStats 
          title="Documents" 
          value={stats.documents.total} 
          icon={<FileCheck className="h-6 w-6 text-purple-500" />}
          detail={`${stats.documents.recent} new this week`}
        />
        <DashboardStats 
          title="Upcoming" 
          value={stats.upcoming.total} 
          icon={<Calendar className="h-6 w-6 text-orange-500" />}
          detail="scheduled appointments"
        />
      </div>
      
      {/* Projects and Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Active Projects</h2>
            <Link to="/projects" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <ProjectsList limit={3} status="in_progress" isAlly={true} />
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
      
      {/* Documents and Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Documents</h2>
            <Link to="/documents" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <DocumentsList limit={3} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Upload Center</h2>
            <Link to="/uploads" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <PenTool className="h-8 w-8 text-blue-500 mb-2" />
              <h3 className="font-medium">Upload Drawings</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Share architectural plans and drawings with the team
              </p>
              <Link 
                to="/uploads/drawings" 
                className="mt-3 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
              >
                Upload Drawings
              </Link>
            </div>
            
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <Image className="h-8 w-8 text-green-500 mb-2" />
              <h3 className="font-medium">Upload Photos</h3>
              <p className="text-sm text-gray-500 text-center mt-1">
                Share site photos and progress images
              </p>
              <Link 
                to="/uploads/photos" 
                className="mt-3 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
              >
                Upload Photos
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mastery Score and Tokens */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Mastery Score</h2>
            <Link to="/mastery" className="text-blue-600 hover:text-blue-800 text-sm">
              View Details
            </Link>
          </div>
          <MasteryScoreCard />
        </div>
        
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
              <Link 
                to="/marketplace" 
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

export default AllyDashboard;
