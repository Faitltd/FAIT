import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import JobPostingList from '../components/Jobs/JobPostingList';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';

const JobsPage: React.FC = () => {
  const { userRole } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get category and status from URL params
  const categoryId = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Postings</h1>
        
        {userRole === 'client' && (
          <Link
            to="/jobs/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-1" />
            Post a Job
          </Link>
        )}
      </div>
      
      {/* Job postings */}
      <JobPostingList
        categoryId={categoryId}
        status={status}
      />
    </div>
  );
};

export default JobsPage;
