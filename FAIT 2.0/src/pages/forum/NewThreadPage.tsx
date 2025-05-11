import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ForumCategory } from '../../types/forum';
import { forumService } from '../../services/ForumService';
import PostEditor from '../../components/forum/PostEditor';
import { useAuth } from '../../contexts/AuthContext';

const NewThreadPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      navigate('/login', { state: { from: `/forum/category/${slug}/new-thread` } });
    }
  }, [user, isLoading, navigate, slug]);

  const fetchCategory = async () => {
    if (!slug) return;
    
    setIsLoading(true);
    try {
      const data = await forumService.getCategoryBySlug(slug);
      if (data) {
        setCategory(data);
        setError(null);
      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load category');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (content: string) => {
    if (!user || !category || !title.trim()) {
      setError('Please provide a title for your thread');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const thread = await forumService.createThread(
        user.id,
        category.id,
        title,
        content
      );
      
      if (thread) {
        // Navigate to the new thread
        navigate(`/forum/thread/${thread.slug}`);
      } else {
        setError('Failed to create thread');
      }
    } catch (err) {
      console.error('Error creating thread:', err);
      setError('Failed to create thread');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
        <Link
          to="/forum"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Forum
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        {category && (
          <Link
            to={`/forum/category/${category.slug}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Back to {category.name}
          </Link>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Thread</h1>
          
          <div className="mb-6">
            <label htmlFor="thread-title" className="block text-sm font-medium text-gray-700 mb-1">
              Thread Title
            </label>
            <input
              type="text"
              id="thread-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for your thread"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Thread Content
            </label>
            <PostEditor
              onSubmit={handleSubmit}
              submitLabel="Create Thread"
              placeholder="Write your thread content here..."
            />
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="text-md font-medium text-blue-800 mb-2">Posting Guidelines</h3>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Be respectful and constructive in your posts</li>
          <li>Provide as much relevant information as possible</li>
          <li>Use clear and descriptive titles</li>
          <li>Check if your question has already been answered before posting</li>
          <li>Format your post for readability</li>
        </ul>
      </div>
    </div>
  );
};

export default NewThreadPage;
