import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProjectWithRelations, ProjectStatus, Task, Milestone, ProjectIssue, ProjectDocument } from '../../types/project';
import { projectService } from '../../services/projectService';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Heading,
  Subheading,
  Text,
  Button,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '../ui';
import TaskList from './TaskList';
import MilestoneList from './MilestoneList';
import ProjectProgress from './ProjectProgress';
import CreateTask from './CreateTask';
import EditTask from './EditTask';
import CreateMilestone from './CreateMilestone';
import EditMilestone from './EditMilestone';
import CreateIssue from './CreateIssue';
import EditIssue from './EditIssue';
import ProjectDocumentUpload from './ProjectDocumentUpload';
import { InvoiceForm, InvoiceList, InvoiceDetails } from '../invoices';
import { ProjectPaymentForm, InvoicePaymentForm, PaymentHistory } from '../payment';

interface ProjectDetailsProps {
  className?: string;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ className = '' }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<ProjectWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'milestones' | 'issues' | 'documents' | 'billing' | 'payments'>('overview');

  // Task state
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Milestone state
  const [showCreateMilestone, setShowCreateMilestone] = useState(false);
  const [showEditMilestone, setShowEditMilestone] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Issue state
  const [showCreateIssue, setShowCreateIssue] = useState(false);
  const [showEditIssue, setShowEditIssue] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<ProjectIssue | null>(null);

  // Document state
  const [showUploadDocument, setShowUploadDocument] = useState(false);

  // Billing state
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showInvoicePayment, setShowInvoicePayment] = useState(false);

  // Payment state
  const [showProjectPayment, setShowProjectPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProject = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const data = await projectService.getProjectById(
        projectId,
        ['milestones', 'tasks', 'issues', 'documents', 'activities']
      );
      setProject(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching project:', err);
      setError('Failed to load project details. Please try again later.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!project || !user) return;

    try {
      setStatusUpdating(true);
      const updatedProject = await projectService.updateProjectStatus(
        project.id,
        newStatus as ProjectStatus,
        user.id
      );
      setProject({ ...project, ...updatedProject });
      setStatusUpdating(false);
    } catch (err) {
      console.error('Error updating project status:', err);
      setError('Failed to update project status. Please try again later.');
      setStatusUpdating(false);
    }
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    if (!project) return;

    // Update the task in the project's tasks array
    const updatedTasks = project.tasks?.map(task =>
      task.id === updatedTask.id ? updatedTask : task
    ) || [];

    setProject({
      ...project,
      tasks: updatedTasks,
      overall_progress: project.overall_progress // This will be updated by the backend
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
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

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md">
        Project not found.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <div className="flex items-center">
            <Heading level={2} className="mr-3">{project.title}</Heading>
            <span className={`text-sm px-2 py-1 rounded-full ${getStatusBadgeClass(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
          <Text variant="muted" className="mt-1">
            Created on {formatDate(project.created_at)}
          </Text>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <Select
            options={statusOptions}
            value={project.status}
            onChange={handleStatusChange}
            disabled={statusUpdating}
            className="w-full sm:w-48"
          />

          <Link to={`/projects/${project.id}/edit`}>
            <Button variant="outline">Edit Project</Button>
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tasks'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('tasks')}
            >
              Tasks
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'milestones'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('milestones')}
            >
              Milestones
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'issues'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('issues')}
            >
              Issues
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('documents')}
            >
              Documents
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'billing'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('billing')}
            >
              Billing
            </button>
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'payments'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
          </nav>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <Heading level={3}>Project Details</Heading>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Text weight="medium">Description</Text>
                    <Text>{project.description}</Text>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Text weight="medium">Budget</Text>
                      <Text>{project.budget ? `$${project.budget.toLocaleString()}` : 'Not set'}</Text>
                    </div>

                    <div>
                      <Text weight="medium">Location</Text>
                      <Text>
                        {project.address ? (
                          <>
                            {project.address}
                            {project.city && project.state && `, ${project.city}, ${project.state}`}
                            {project.zip && ` ${project.zip}`}
                          </>
                        ) : (
                          'Not set'
                        )}
                      </Text>
                    </div>

                    <div>
                      <Text weight="medium">Start Date</Text>
                      <Text>{formatDate(project.start_date)}</Text>
                    </div>

                    <div>
                      <Text weight="medium">End Date</Text>
                      <Text>{formatDate(project.end_date)}</Text>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Heading level={3}>Recent Tasks</Heading>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('tasks')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {project.tasks && project.tasks.length > 0 ? (
                  <TaskList
                    tasks={project.tasks.slice(0, 5)}
                    onTaskUpdate={handleTaskUpdate}
                    minimal
                  />
                ) : (
                  <div className="text-center py-4">
                    <Text variant="muted">No tasks yet.</Text>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2"
                      onClick={() => setActiveTab('tasks')}
                    >
                      Add Task
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <Heading level={3}>Progress</Heading>
              </CardHeader>
              <CardContent>
                <ProjectProgress progress={project.overall_progress} />

                <div className="mt-6">
                  <Subheading level={3} className="mb-2">Task Summary</Subheading>
                  <div className="space-y-2">
                    {project.tasks ? (
                      <>
                        <div className="flex justify-between">
                          <Text>Total Tasks</Text>
                          <Text weight="medium">{project.tasks.length}</Text>
                        </div>
                        <div className="flex justify-between">
                          <Text>Completed</Text>
                          <Text weight="medium">
                            {project.tasks.filter(task => task.status === 'completed').length}
                          </Text>
                        </div>
                        <div className="flex justify-between">
                          <Text>In Progress</Text>
                          <Text weight="medium">
                            {project.tasks.filter(task => task.status === 'in_progress').length}
                          </Text>
                        </div>
                        <div className="flex justify-between">
                          <Text>To Do</Text>
                          <Text weight="medium">
                            {project.tasks.filter(task => task.status === 'todo').length}
                          </Text>
                        </div>
                        <div className="flex justify-between">
                          <Text>Blocked</Text>
                          <Text weight="medium">
                            {project.tasks.filter(task => task.status === 'blocked').length}
                          </Text>
                        </div>
                      </>
                    ) : (
                      <Text variant="muted">No tasks available</Text>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <Heading level={3}>Milestones</Heading>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('milestones')}
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {project.milestones && project.milestones.length > 0 ? (
                  <MilestoneList
                    milestones={project.milestones.slice(0, 3)}
                    minimal
                  />
                ) : (
                  <div className="text-center py-4">
                    <Text variant="muted">No milestones yet.</Text>
                    <Button
                      variant="primary"
                      size="sm"
                      className="mt-2"
                      onClick={() => setActiveTab('milestones')}
                    >
                      Add Milestone
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Heading level={3}>Tasks</Heading>
            <Button
              variant="primary"
              onClick={() => setShowCreateTask(true)}
            >
              Add Task
            </Button>
          </div>

          {showCreateTask && (
            <div className="mb-6">
              <CreateTask
                projectId={project.id}
                onTaskCreated={(task) => {
                  setProject(prev => ({
                    ...prev,
                    tasks: [...(prev.tasks || []), task]
                  }));
                  setShowCreateTask(false);
                }}
                onCancel={() => setShowCreateTask(false)}
              />
            </div>
          )}

          {showEditTask && selectedTask && (
            <div className="mb-6">
              <EditTask
                task={selectedTask}
                onTaskUpdated={(task) => {
                  setProject(prev => ({
                    ...prev,
                    tasks: prev.tasks?.map(t => t.id === task.id ? task : t) || []
                  }));
                  setShowEditTask(false);
                  setSelectedTask(null);
                }}
                onCancel={() => {
                  setShowEditTask(false);
                  setSelectedTask(null);
                }}
              />
            </div>
          )}

          <Card>
            <CardContent>
              {project.tasks && project.tasks.length > 0 ? (
                <TaskList
                  tasks={project.tasks}
                  onTaskUpdate={handleTaskUpdate}
                  onEditTask={(task) => {
                    setSelectedTask(task);
                    setShowEditTask(true);
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <Text variant="muted">No tasks yet.</Text>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setShowCreateTask(true)}
                  >
                    Add Your First Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Heading level={3}>Milestones</Heading>
            <Button
              variant="primary"
              onClick={() => setShowCreateMilestone(true)}
            >
              Add Milestone
            </Button>
          </div>

          {showCreateMilestone && (
            <div className="mb-6">
              <CreateMilestone
                projectId={project.id}
                onMilestoneCreated={(milestone) => {
                  setProject(prev => ({
                    ...prev,
                    milestones: [...(prev.milestones || []), milestone]
                  }));
                  setShowCreateMilestone(false);
                }}
                onCancel={() => setShowCreateMilestone(false)}
              />
            </div>
          )}

          {showEditMilestone && selectedMilestone && (
            <div className="mb-6">
              <EditMilestone
                milestone={selectedMilestone}
                onMilestoneUpdated={(milestone) => {
                  setProject(prev => ({
                    ...prev,
                    milestones: prev.milestones?.map(m => m.id === milestone.id ? milestone : m) || []
                  }));
                  setShowEditMilestone(false);
                  setSelectedMilestone(null);
                }}
                onCancel={() => {
                  setShowEditMilestone(false);
                  setSelectedMilestone(null);
                }}
              />
            </div>
          )}

          <Card>
            <CardContent>
              {project.milestones && project.milestones.length > 0 ? (
                <MilestoneList
                  milestones={project.milestones}
                  onEditMilestone={(milestone) => {
                    setSelectedMilestone(milestone);
                    setShowEditMilestone(true);
                  }}
                />
              ) : (
                <div className="text-center py-8">
                  <Text variant="muted">No milestones yet.</Text>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setShowCreateMilestone(true)}
                  >
                    Add Your First Milestone
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'issues' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Heading level={3}>Issues</Heading>
            <Button
              variant="primary"
              onClick={() => setShowCreateIssue(true)}
            >
              Report Issue
            </Button>
          </div>

          {showCreateIssue && (
            <div className="mb-6">
              <CreateIssue
                projectId={project.id}
                onIssueCreated={(issue) => {
                  setProject(prev => ({
                    ...prev,
                    issues: [...(prev.issues || []), issue]
                  }));
                  setShowCreateIssue(false);
                }}
                onCancel={() => setShowCreateIssue(false)}
              />
            </div>
          )}

          {showEditIssue && selectedIssue && (
            <div className="mb-6">
              <EditIssue
                issue={selectedIssue}
                onIssueUpdated={(issue) => {
                  setProject(prev => ({
                    ...prev,
                    issues: prev.issues?.map(i => i.id === issue.id ? issue : i) || []
                  }));
                  setShowEditIssue(false);
                  setSelectedIssue(null);
                }}
                onCancel={() => {
                  setShowEditIssue(false);
                  setSelectedIssue(null);
                }}
              />
            </div>
          )}

          <Card>
            <CardContent>
              {project.issues && project.issues.length > 0 ? (
                <div className="space-y-4">
                  {project.issues.map(issue => (
                    <div
                      key={issue.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="flex items-center">
                            <Text weight="medium" className="mr-2">{issue.title}</Text>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              issue.status === 'open' ? 'bg-red-100 text-red-800' :
                              issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {issue.status.replace('_', ' ')}
                            </span>
                            <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              issue.priority === 'low' ? 'bg-gray-100 text-gray-800' :
                              issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {issue.priority}
                            </span>
                          </div>
                          <Text variant="muted" className="mt-1">{issue.description}</Text>
                        </div>
                        <div className="flex flex-col items-end">
                          <Text size="sm">Reported on {formatDate(issue.created_at)}</Text>
                          {issue.resolved_at && (
                            <Text size="sm">Resolved on {formatDate(issue.resolved_at)}</Text>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setSelectedIssue(issue);
                              setShowEditIssue(true);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Text variant="muted">No issues reported yet.</Text>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setShowCreateIssue(true)}
                  >
                    Report Your First Issue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'documents' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Heading level={3}>Documents</Heading>
            <Button
              variant="primary"
              onClick={() => setShowUploadDocument(true)}
            >
              Upload Document
            </Button>
          </div>

          {showUploadDocument && (
            <div className="mb-6">
              <ProjectDocumentUpload
                projectId={project.id}
                onDocumentUploaded={(document) => {
                  setProject(prev => ({
                    ...prev,
                    documents: [...(prev.documents || []), document]
                  }));
                  setShowUploadDocument(false);
                }}
                onCancel={() => setShowUploadDocument(false)}
              />
            </div>
          )}

          <Card>
            <CardContent>
              {project.documents && project.documents.length > 0 ? (
                <div className="space-y-4">
                  {project.documents.map(document => (
                    <div
                      key={document.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <Text weight="medium">{document.name}</Text>
                        <Text variant="muted" size="sm">
                          {document.file_type.toUpperCase()} • {(document.file_size / 1024 / 1024).toFixed(2)} MB
                        </Text>
                      </div>
                      <div className="flex space-x-2">
                        <a
                          href={document.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Text variant="muted">No documents uploaded yet.</Text>
                  <Button
                    variant="primary"
                    className="mt-4"
                    onClick={() => setShowUploadDocument(true)}
                  >
                    Upload Your First Document
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'billing' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Heading level={3}>Billing</Heading>
            <Button
              variant="primary"
              onClick={() => setShowCreateInvoice(true)}
            >
              Create Invoice
            </Button>
          </div>

          {showCreateInvoice && (
            <div className="mb-6">
              <InvoiceForm
                projectId={project.id}
                clientId={project.client_id}
                serviceAgentId={project.service_agent_id}
                onInvoiceCreated={(invoiceId) => {
                  setSelectedInvoiceId(invoiceId);
                  setShowInvoiceDetails(true);
                  setShowCreateInvoice(false);
                }}
                onCancel={() => setShowCreateInvoice(false)}
              />
            </div>
          )}

          {showInvoiceDetails && selectedInvoiceId ? (
            <div className="mb-6">
              <InvoiceDetails
                invoiceId={selectedInvoiceId}
                onPayInvoice={() => {
                  setShowInvoicePayment(true);
                }}
                onBack={() => {
                  setShowInvoiceDetails(false);
                  setSelectedInvoiceId(null);
                }}
              />
            </div>
          ) : showInvoicePayment && selectedInvoiceId ? (
            <div className="mb-6">
              <InvoicePaymentForm
                invoiceId={selectedInvoiceId}
                onSuccess={(paymentId) => {
                  setShowInvoicePayment(false);
                  setShowInvoiceDetails(true);
                }}
                onCancel={() => {
                  setShowInvoicePayment(false);
                  setShowInvoiceDetails(true);
                }}
              />
            </div>
          ) : (
            <InvoiceList
              projectId={project.id}
              onViewInvoice={(invoiceId) => {
                setSelectedInvoiceId(invoiceId);
                setShowInvoiceDetails(true);
              }}
              onPayInvoice={(invoiceId) => {
                setSelectedInvoiceId(invoiceId);
                setShowInvoicePayment(true);
              }}
              onCreateInvoice={() => setShowCreateInvoice(true)}
            />
          )}
        </div>
      )}

      {activeTab === 'payments' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <Heading level={3}>Payments</Heading>
            <Button
              variant="primary"
              onClick={() => {
                setPaymentAmount(project.budget || 1000); // Default to budget or 1000
                setShowProjectPayment(true);
              }}
            >
              Make Payment
            </Button>
          </div>

          {showProjectPayment && (
            <div className="mb-6">
              <ProjectPaymentForm
                projectId={project.id}
                amount={paymentAmount}
                onSuccess={(paymentId) => {
                  setShowProjectPayment(false);
                  // Refresh project data to show updated payment status
                  fetchProject();
                }}
                onCancel={() => setShowProjectPayment(false)}
              />
            </div>
          )}

          <PaymentHistory
            projectId={project.id}
            onViewPayment={(paymentId) => {
              // View payment receipt
              window.open(`/payments/${paymentId}/receipt`, '_blank');
            }}
            onRequestRefund={(paymentId) => {
              // Request refund
              if (confirm('Are you sure you want to request a refund for this payment?')) {
                paymentService.simulateRefund(paymentId)
                  .then(() => {
                    alert('Refund processed successfully');
                    // Refresh payment history
                    setActiveTab('payments');
                  })
                  .catch(err => {
                    alert(`Error processing refund: ${err.message}`);
                  });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
