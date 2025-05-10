import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import JobPostingForm from '../components/Jobs/JobPostingForm';
import { createJobPosting } from '../lib/api/jobsApi';

const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    if (!user) {
      navigate('/login', { state: { from: '/jobs/create' } });
      return;
    }

    if (userRole !== 'client') {
      setError('Only clients can post jobs');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create the job posting
      const createdJob = await createJobPosting(user.id, formData);

      // Redirect to the new job posting page
      navigate(`/jobs/${createdJob.id}`);
    } catch (err) {
      console.error('Error creating job posting:', err);
      setError('Failed to create job posting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not a client
  if (userRole !== 'client') {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-yellow-100 p-6 rounded-md text-yellow-700">
          <h2 className="text-lg font-medium mb-2">Access Denied</h2>
          <p>Only clients can post jobs.</p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Job</h1>
      
      {error && (
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
          {error}
        </div>
      )}
      
      <JobPostingForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default CreateJobPage;
