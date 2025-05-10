import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heading,
  Card,
  CardContent,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  Input,
  Select,
  ExpandingTextarea
} from '../../components/ui';
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  FileText,
  Users,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Edit,
  Trash2,
  Plus,
  X,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { projectService } from '../../services/projectService';
import { Project, ProjectStatus, Task, TaskStatus, TaskPriority } from '../../types/project';
import {
  TaskList,
  KanbanBoard,
  CreateTask,
  ProjectTimeline,
  DocumentList,
  DocumentUpload,
  TeamMembers,
  TeamMemberInvite,
  ActivityFeed
} from '../../components/projects';

const ProjectDetailsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showUploadDocument, setShowUploadDocument] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      try {
        setLoading(true);
        const projectData = await projectService.getProject(projectId);

        if (!projectData) {
          setError('Project not found');
          setLoading(false);
          return;
        }

        setProject(projectData);

        // Fetch tasks for the project
        try {
          const tasksData = await projectService.getProjectTasks(projectId);
          setTasks(tasksData);
        } catch (taskErr) {
          console.error('Error fetching tasks:', taskErr);
          // Don't set error for tasks, just log it
        }

        // Fetch milestones for the project
        try {
          const projectWithRelations = await projectService.getProjectById(projectId, ['milestones']);
          if (projectWithRelations.milestones) {
            setMilestones(projectWithRelations.milestones);
          }
        } catch (milestoneErr) {
          console.error('Error fetching milestones:', milestoneErr);
          // Don't set error for milestones, just log it
        }

        // Fetch documents for the project
        try {
          const projectWithDocs = await projectService.getProjectById(projectId, ['documents']);
          if (projectWithDocs.documents) {
            setDocuments(projectWithDocs.documents);
          }
        } catch (docsErr) {
          console.error('Error fetching documents:', docsErr);
          // Don't set error for documents, just log it
        }

        // Fetch team members for the project
        try {
          const projectWithMembers = await projectService.getProjectById(projectId, ['members']);
          if (projectWithMembers.members) {
            setTeamMembers(projectWithMembers.members);
          }
        } catch (membersErr) {
          console.error('Error fetching team members:', membersErr);
          // Don't set error for team members, just log it
        }

        // Fetch activities for the project
        try {
          const projectWithActivities = await projectService.getProjectById(projectId, ['activities']);
          if (projectWithActivities.activities) {
            setActivities(projectWithActivities.activities);
          }
        } catch (activitiesErr) {
          console.error('Error fetching activities:', activitiesErr);
          // Don't set error for activities, just log it
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details');
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
  };

  const handleDocumentUpload = (document: any) => {
    setDocuments(prevDocs => [document, ...prevDocs]);
    setShowUploadDocument(false);
  };

  const handleDocumentDelete = async (documentId: string) => {
    try {
      await projectService.deleteDocument(documentId);
      setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentId));
    } catch (err) {
      console.error('Error deleting document:', err);
    }
  };

  const handleAddMember = (member: any) => {
    setTeamMembers(prevMembers => [member, ...prevMembers]);
    setShowAddMember(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await projectService.removeProjectMember(memberId);
      setTeamMembers(prevMembers => prevMembers.filter(member => member.id !== memberId));
    } catch (err) {
      console.error('Error removing team member:', err);
    }
  };

  const handleUpdateMemberRole = async (memberId: string, role: string) => {
    try {
      const updatedMember = await projectService.updateProjectMemberRole(memberId, role);
      setTeamMembers(prevMembers =>
        prevMembers.map(member =>
          member.id === updatedMember.id ? updatedMember : member
        )
      );
    } catch (err) {
      console.error('Error updating member role:', err);
    }
  };

  const getStatusBadgeClass = (status: ProjectStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-indigo-100 text-indigo-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ProjectStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-indigo-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Project not found'}
        </div>
        <div className="mt-4">
          <Link to="/projects">
            <Button variant="outline" leftIcon={<ArrowLeft size={16} />}>
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Handle task creation
  const handleTaskCreated = (task: Task) => {
    setTasks(prevTasks => [task, ...prevTasks]);
    setShowCreateTask(false);
    setSelectedTask(null);
  };

  // Handle task creation cancellation
  const handleTaskCancel = () => {
    setShowCreateTask(false);
    setSelectedTask(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/projects">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={16} />}>
            Back to Projects
          </Button>
        </Link>
      </div>

      {/* Task Creation Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Heading level={3}>{selectedTask ? 'Edit Task' : 'Create Task'}</Heading>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTaskCancel}
                  className="p-1"
                >
                  <X size={20} />
                </Button>
              </div>

              <CreateTask
                projectId={projectId || ''}
                task={selectedTask}
                onTaskCreated={handleTaskCreated}
                onCancel={handleTaskCancel}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <Heading level={1}>{project.title}</Heading>
          <div className="flex items-center mt-2">
            <div className={`flex items-center px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(project.status)}`}>
              {getStatusIcon(project.status)}
              <span className="ml-1 capitalize">{project.status.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            variant="outline"
            leftIcon={<Edit size={16} />}
            onClick={() => navigate(`/projects/${project.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="destructive"
            leftIcon={<Trash2 size={16} />}
          >
            Delete
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Text className="text-gray-500 text-sm">Progress</Text>
              <div className="mt-2 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${project.overall_progress}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{project.overall_progress}%</span>
              </div>
            </div>

            <div>
              <Text className="text-gray-500 text-sm">Timeline</Text>
              <Text className="font-medium">
                {project.start_date && project.end_date ? (
                  <span>{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                ) : project.start_date ? (
                  <span>From {formatDate(project.start_date)}</span>
                ) : project.end_date ? (
                  <span>Until {formatDate(project.end_date)}</span>
                ) : (
                  <span>Not set</span>
                )}
              </Text>
            </div>

            <div>
              <Text className="text-gray-500 text-sm">Budget</Text>
              <Text className="font-medium">
                {project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}
              </Text>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
      </Tabs>

      <TabsContent value="overview">
        <Card>
          <CardContent className="p-6">
            <Heading level={3} className="mb-4">Project Description</Heading>
            <Text>{project.description || 'No description provided.'}</Text>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div>
                <Heading level={3} className="mb-4">Project Details</Heading>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Text className="text-gray-500 text-sm">Address</Text>
                    <Text>{project.address || 'Not specified'}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 text-sm">City</Text>
                    <Text>{project.city || 'Not specified'}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 text-sm">State</Text>
                    <Text>{project.state || 'Not specified'}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 text-sm">ZIP</Text>
                    <Text>{project.zip || 'Not specified'}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 text-sm">Created</Text>
                    <Text>{formatDate(project.created_at)}</Text>
                  </div>
                  <div>
                    <Text className="text-gray-500 text-sm">Last Updated</Text>
                    <Text>{formatDate(project.updated_at)}</Text>
                  </div>
                </div>
              </div>

              <div>
                <Heading level={3} className="mb-4">Recent Activity</Heading>
                <ActivityFeed
                  activities={activities}
                  limit={5}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="tasks">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Heading level={3}>Tasks</Heading>
              <Button
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setShowCreateTask(true)}
              >
                Add Task
              </Button>
            </div>

            <div className="mb-4">
              <Text variant="muted">
                Manage your project tasks here. Track progress, assign team members, and set priorities.
              </Text>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-8">
                <Text variant="muted">No tasks yet. Create your first task to get started.</Text>
                <Button
                  variant="primary"
                  className="mt-4"
                  onClick={() => setShowCreateTask(true)}
                >
                  Create First Task
                </Button>
              </div>
            ) : (
              <KanbanBoard
                projectId={projectId || ''}
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onAddTask={() => setShowCreateTask(true)}
                onEditTask={(task) => {
                  setSelectedTask(task);
                  setShowCreateTask(true);
                }}
              />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="timeline">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Heading level={3}>Project Timeline</Heading>
              <Button
                variant="outline"
                leftIcon={<Calendar size={16} />}
                onClick={() => setActiveTab('tasks')}
              >
                Manage Tasks
              </Button>
            </div>

            <div className="mb-4">
              <Text variant="muted">
                View your project timeline with key milestones and task deadlines.
              </Text>
            </div>

            <ProjectTimeline
              project={project}
              tasks={tasks}
              milestones={milestones}
              className="mt-6"
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Heading level={3}>Documents</Heading>
              <Button
                variant="primary"
                leftIcon={<FileText size={16} />}
                onClick={() => setShowUploadDocument(true)}
              >
                Upload Document
              </Button>
            </div>

            <div className="mb-4">
              <Text variant="muted">
                Manage project documents, contracts, permits, and other files.
              </Text>
            </div>

            <DocumentList
              projectId={projectId || ''}
              documents={documents}
              onUpload={() => setShowUploadDocument(true)}
              onDelete={handleDocumentDelete}
              className="mt-6"
            />
          </CardContent>
        </Card>

        {/* Document Upload Modal */}
        {showUploadDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Heading level={3}>Upload Document</Heading>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUploadDocument(false)}
                    className="p-1"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <DocumentUpload
                  projectId={projectId || ''}
                  onDocumentUploaded={handleDocumentUpload}
                  onCancel={() => setShowUploadDocument(false)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>

      <TabsContent value="team">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <Heading level={3}>Team Members</Heading>
              <Button
                variant="primary"
                leftIcon={<UserPlus size={16} />}
                onClick={() => setShowAddMember(true)}
              >
                Add Member
              </Button>
            </div>

            <div className="mb-4">
              <Text variant="muted">
                Manage project team members and their roles.
              </Text>
            </div>

            <TeamMembers
              projectId={projectId || ''}
              members={teamMembers}
              onAddMember={() => setShowAddMember(true)}
              onRemoveMember={handleRemoveMember}
              onUpdateRole={handleUpdateMemberRole}
              className="mt-6"
            />
          </CardContent>
        </Card>

        {/* Add Team Member Modal */}
        {showAddMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <Heading level={3}>Add Team Member</Heading>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddMember(false)}
                    className="p-1"
                  >
                    <X size={20} />
                  </Button>
                </div>

                <TeamMemberInvite
                  projectId={projectId || ''}
                  onMemberInvited={handleAddMember}
                  onCancel={() => setShowAddMember(false)}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
    </div>
  );
};

export default ProjectDetailsPage;
