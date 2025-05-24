import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForum } from '../../modules/forum/hooks/useForum';
import ThreadForm from '../../modules/forum/components/ThreadForm';
import { useAuth } from '../../contexts/AuthContext';

/**
 * View for creating a new thread
 */
const NewThreadView: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { categories, getCategoryBySlug, createThread } = useForum();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<any>(null);

  // Fetch category if slug is provided
  useEffect(() => {
    const fetchCategory = async () => {
      if (!categorySlug) {
        setIsLoading(false);
        return;
      }
      
      try {
        const categoryData = await getCategoryBySlug(categorySlug);
        if (!categoryData) {
          setError('Category not found');
        } else {
          setCategory(categoryData);
        }
      } catch (err: any) {
        console.error('Error fetching category:', err);
        setError(err.message || 'Failed to load category');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCategory();
  }, [categorySlug]);

  // Handle form submission
  const handleSubmit = async (title: string, content: string, categoryId: string) => {
    if (!user) return;
    
    try {
      const thread = await createThread(categoryId, title, content);
      if (thread) {
        navigate(`/forum/thread/${thread.slug}`);
      }
    } catch (err: any) {
      console.error('Error creating thread:', err);
      setError(err.message || 'Failed to create thread');
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (category) {
      navigate(`/forum/category/${category.slug}`);
    } else {
      navigate('/forum');
    }
  };

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Create New Thread
            </h1>
            {category && (
              <p className="mt-1 text-sm text-gray-500">
                in {category.name}
              </p>
            )}
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Error message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4 my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg my-6">
                <div className="px-4 py-5 sm:p-6">
                  <ThreadForm 
                    categories={categories}
                    selectedCategoryId={category?.id}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewThreadView;
