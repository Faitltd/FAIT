import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ForumCategory, ForumThread } from '../../types/forum';
import { forumService } from '../../services/ForumService';
import ThreadList from '../../components/forum/ThreadList';

const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [totalThreads, setTotalThreads] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  useEffect(() => {
    if (slug) {
      fetchCategory();
    }
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchThreads();
    }
  }, [category, currentPage]);

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
    }
  };

  const fetchThreads = async () => {
    if (!category) return;
    
    setIsLoading(true);
    try {
      const { threads, total } = await forumService.getThreadsByCategory(
        category.id,
        currentPage,
        pageSize
      );
      setThreads(threads);
      setTotalThreads(total);
      setError(null);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to load threads');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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
        <Link
          to="/forum"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Forum
        </Link>
      </div>
      
      {category && (
        <ThreadList
          threads={threads}
          category={category}
          isLoading={isLoading}
          totalThreads={totalThreads}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          pageSize={pageSize}
        />
      )}
    </div>
  );
};

export default CategoryPage;
