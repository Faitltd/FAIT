import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getJobPostingById, applyToJob, updateApplicationStatus, withdrawApplication } from '../lib/api/jobsApi';
import JobApplicationForm from '../components/Jobs/JobApplicationForm';
import { Calendar, DollarSign, MapPin, Clock, Users, CheckCircle, XCircle } from 'lucide-react';

interface JobDetailParams {
  id: string;
}

const JobDetailPage: React.FC = () => {
  const { id } = useParams<keyof JobDetailParams>() as JobDetailParams;
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState<boolean>(false);
  const [showApplicationForm, setShowApplicationForm] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch job posting details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const jobData = await getJobPostingById(id);
        setJob(jobData);
      } catch (err) {
        console.error('Error fetching job posting:', err);
        setError('Failed to load job posting. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format budget
  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Budget not specified';
    
    if (min && max) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `From $${min.toLocaleString()}`;
    } else if (max) {
      return `Up to $${max.toLocaleString()}`;
    }
    
    return 'Budget not specified';
  };

  // Check if the current user has already applied
  const hasApplied = () => {
    if (!user || !job || !job.applications) return false;
    
    return job.applications.some((app: any) => app.service_agent_id === user.id);
  };

  // Get the current user's application
  const getUserApplication = () => {
    if (!user || !job || !job.applications) return null;
    
    return job.applications.find((app: any) => app.service_agent_id === user.id);
  };

  // Handle apply to job
  const handleApply = async (formData: { cover_letter: string; price_quote: number | null }) => {
    if (!user) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }

    if (userRole !== 'contractor') {
      setError('Only contractors can apply to jobs');
      return;
    }

    try {
      setApplying(true);
      setError(null);

      await applyToJob(id, user.id, formData);
      
      // Refresh job data
      const updatedJob = await getJobPostingById(id);
      setJob(updatedJob);
      
      setShowApplicationForm(false);
      setSuccessMessage('Your application has been submitted successfully!');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error('Error applying to job:', err);
      setError(err.message || 'Failed to apply to job. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  // Handle update application status
  const handleUpdateStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    if (!user || !job) return;

    try {
      setActionLoading(true);
      setError(null);

      await updateApplicationStatus(applicationId, user.id, status);
      
      // Refresh job data
      const updatedJob = await getJobPostingById(id);
      setJob(updatedJob);
      
      setSuccessMessage(`Application ${status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle withdraw application
  const handleWithdraw = async (applicationId: string) => {
    if (!user) return;

    try {
      setActionLoading(true);
      setError(null);

      await withdrawApplication(applicationId, user.id);
      
      // Refresh job data
      const updatedJob = await getJobPostingById(id);
      setJob(updatedJob);
      
      setSuccessMessage('Your application has been withdrawn successfully!');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error withdrawing application:', err);
      setError('Failed to withdraw application. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 p-6 rounded-md text-red-700">
          <h2 className="text-lg font-medium mb-2">Error</h2>
          <p>{error || 'Job posting not found'}</p>
          <button
            onClick={() => navigate('/jobs')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  // Check if the current user is the job poster
  const isJobPoster = user && job.client_id === user.id;
  
  // Get user's application if they've applied
  const userApplication = getUserApplication();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Success message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* Job header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>Posted on {formatDate(job.created_at)}</span>
                
                {job.category && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{job.category.name}</span>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                job.status === 'open' ? 'bg-green-100 text-green-800' :
                job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                job.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                job.status === 'canceled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1)}
              </span>
            </div>
          </div>
          
          {/* Client info */}
          {job.client && (
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                {job.client.avatar_url ? (
                  <img
                    src={job.client.avatar_url}
                    alt={job.client.full_name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm font-medium">
                      {job.client.full_name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {job.client.full_name}
                </p>
                <Link
                  to={`/profile/${job.client.id}`}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  View Profile
                </Link>
              </div>
            </div>
          )}
          
          {/* Job details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
              <span className="font-medium">Budget:</span>
              <span className="ml-1">{formatBudget(job.budget_min, job.budget_max)}</span>
            </div>
            
            {job.is_remote ? (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium">Location:</span>
                <span className="ml-1">Remote</span>
              </div>
            ) : (
              job.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium">Location:</span>
                  <span className="ml-1">{job.location}{job.zip_code ? `, ${job.zip_code}` : ''}</span>
                </div>
              )
            )}
            
            {job.start_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium">Start Date:</span>
                <span className="ml-1">{formatDate(job.start_date)}</span>
              </div>
            )}
            
            {job.end_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium">End Date:</span>
                <span className="ml-1">{formatDate(job.end_date)}</span>
              </div>
            )}
            
            {job.applications && (
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="font-medium">Applications:</span>
                <span className="ml-1">{job.applications.length}</span>
              </div>
            )}
          </div>
          
          {/* Job description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
            <div className="prose prose-blue max-w-none">
              <p className="whitespace-pre-line">{job.description}</p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-4">
            {userRole === 'contractor' && job.status === 'open' && !isJobPoster && (
              <>
                {!hasApplied() ? (
                  <button
                    onClick={() => setShowApplicationForm(!showApplicationForm)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Apply for this Job
                  </button>
                ) : userApplication && userApplication.status === 'pending' && (
                  <button
                    onClick={() => handleWithdraw(userApplication.id)}
                    disabled={actionLoading}
                    className={`px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      actionLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    }`}
                  >
                    {actionLoading ? 'Processing...' : 'Withdraw Application'}
                  </button>
                )}
              </>
            )}
            
            <Link
              to="/jobs"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
      
      {/* Application form */}
      {showApplicationForm && (
        <div className="mb-8">
          <JobApplicationForm
            jobId={job.id}
            onSubmit={handleApply}
            isLoading={applying}
          />
        </div>
      )}
      
      {/* User's application status */}
      {userApplication && (
        <div className={`mb-8 p-6 rounded-lg shadow-md ${
          userApplication.status === 'accepted' ? 'bg-green-50 border border-green-200' :
          userApplication.status === 'rejected' ? 'bg-red-50 border border-red-200' :
          userApplication.status === 'withdrawn' ? 'bg-gray-50 border border-gray-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          <h2 className="text-lg font-semibold mb-3">
            Your Application Status: 
            <span className={`ml-2 ${
              userApplication.status === 'accepted' ? 'text-green-700' :
              userApplication.status === 'rejected' ? 'text-red-700' :
              userApplication.status === 'withdrawn' ? 'text-gray-700' :
              'text-blue-700'
            }`}>
              {userApplication.status.charAt(0).toUpperCase() + userApplication.status.slice(1)}
            </span>
          </h2>
          
          {userApplication.cover_letter && (
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Your Cover Letter:</h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">{userApplication.cover_letter}</p>
            </div>
          )}
          
          {userApplication.price_quote && (
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-700 mb-1">Your Price Quote:</h3>
              <p className="text-sm text-gray-600">${userApplication.price_quote.toLocaleString()}</p>
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            Applied on {formatDate(userApplication.created_at)}
          </div>
        </div>
      )}
      
      {/* Applications list (for job poster) */}
      {isJobPoster && job.applications && job.applications.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Applications ({job.applications.length})
            </h2>
            
            <div className="space-y-6">
              {job.applications.map((application: any) => (
                <div key={application.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {application.service_agent.avatar_url ? (
                          <img
                            src={application.service_agent.avatar_url}
                            alt={application.service_agent.full_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-sm font-medium">
                              {application.service_agent.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {application.service_agent.full_name}
                        </p>
                        <Link
                          to={`/profile/${application.service_agent.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                    
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'withdrawn' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  {application.cover_letter && (
                    <div className="mb-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</h3>
                      <p className="text-sm text-gray-600 whitespace-pre-line">{application.cover_letter}</p>
                    </div>
                  )}
                  
                  {application.price_quote && (
                    <div className="mb-3">
                      <h3 className="text-sm font-medium text-gray-700 mb-1">Price Quote:</h3>
                      <p className="text-sm text-gray-600">${application.price_quote.toLocaleString()}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Applied on {formatDate(application.created_at)}
                    </div>
                    
                    {application.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'accepted')}
                          disabled={actionLoading}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                            actionLoading
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-green-100 text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </button>
                        
                        <button
                          onClick={() => handleUpdateStatus(application.id, 'rejected')}
                          disabled={actionLoading}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                            actionLoading
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : 'bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                          }`}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;
