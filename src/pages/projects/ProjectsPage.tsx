import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Button,
  Card,
  CardContent,
  Text
} from '../../components/ui';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
import { Project } from '../../types/project';

// Import synchronous components
import ProjectStats from '../../components/projects/ProjectStats';
import ProjectFilters from '../../components/projects/ProjectFilters';
import ProjectViewToggle from '../../components/projects/ProjectViewToggle';

// Lazy load the ProjectList component
const ProjectList = lazy(() => import('../../components/projects/ProjectList'));

// Loading fallback
const ListLoadingFallback = () => (
  <div className="flex justify-center items-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
  </div>
);

const ProjectsPage: React.FC = () => {
  const { user, userType } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'calendar'>('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [projectStats, setProjectStats] = useState({
    total: 0,
    inProgress: 0,
    dueThisWeek: 0
  });

  // Fetch project statistics
  useEffect(() => {
    const fetchProjectStats = async () => {
      if (!user) return;

      try {
        let projects;

        // Admin users see all projects, others only see their own
        if (userType === 'admin') {
          projects = await projectService.getAllProjects();
        } else {
          projects = await projectService.getProjects(user.id, userType as 'client' | 'service_agent');
        }

        // Calculate statistics
        const total = projects.length;
        const inProgress = projects.filter(p => p.status === 'in_progress').length;

        // Calculate projects due this week
        const today = new Date();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(today.getDate() + 7);

        const dueThisWeek = projects.filter(p => {
          if (!p.end_date) return false;
          const dueDate = new Date(p.end_date);
          return dueDate >= today && dueDate <= oneWeekFromNow;
        }).length;

        setProjectStats({
          total,
          inProgress,
          dueThisWeek
        });

      } catch (err) {
        console.error('Error fetching project statistics:', err);
      }
    };

    fetchProjectStats();
  }, [user, userType]);

  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-end mb-8">
        <Link to="/projects/create">
          <Button variant="primary" leftIcon={<PlusCircle size={18} />}>
            Create Project
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div className="w-full">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="flex items-center justify-between mb-4">
                    <TabsList className="mb-4 md:mb-0">
                      <TabsTrigger value="all">All Projects</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                    </TabsList>

                    {/* View mode toggle */}
                    <ProjectViewToggle
                      viewMode={viewMode}
                      setViewMode={setViewMode}
                    />
                  </div>

                  {/* Project filters */}
                  <ProjectFilters
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    statusFilter={activeTab as any}
                    setStatusFilter={setActiveTab as any}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    sortDirection={sortDirection}
                    setSortDirection={setSortDirection}
                  />

                  {/* Project statistics */}
                  <ProjectStats
                    total={projectStats.total}
                    inProgress={projectStats.inProgress}
                    dueThisWeek={projectStats.dueThisWeek}
                  />

                  {/* Project list tabs */}
                  <TabsContent value="all">
                    <Suspense fallback={<ListLoadingFallback />}>
                      <ProjectList
                        viewMode={viewMode}
                        statusFilter={undefined}
                        searchQuery={searchQuery}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                      />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="active">
                    <Suspense fallback={<ListLoadingFallback />}>
                      <ProjectList
                        viewMode={viewMode}
                        statusFilter="active"
                        searchQuery={searchQuery}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                      />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="completed">
                    <Suspense fallback={<ListLoadingFallback />}>
                      <ProjectList
                        viewMode={viewMode}
                        statusFilter="completed"
                        searchQuery={searchQuery}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                      />
                    </Suspense>
                  </TabsContent>
                  <TabsContent value="pending">
                    <Suspense fallback={<ListLoadingFallback />}>
                      <ProjectList
                        viewMode={viewMode}
                        statusFilter="pending"
                        searchQuery={searchQuery}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                      />
                    </Suspense>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsPage;
