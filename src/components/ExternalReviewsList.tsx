import React from 'react';
import { Star, ExternalLink, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ExternalReview = Database['public']['Tables']['external_reviews']['Row'];

interface ExternalReviewsListProps {
  reviews: ExternalReview[];
  isOwner?: boolean;
  onDelete?: (id: string) => void;
}

const ExternalReviewsList: React.FC<ExternalReviewsListProps> = ({ reviews, isOwner, onDelete }) => {
  const handleDelete = async (id: string) => {
    if (!onDelete) return;
    
    try {
      const { error } = await supabase
        .from('external_reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
      onDelete(id);
    } catch (error) {
      console.error('Error deleting external review:', error);
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={`/${review.platform}-logo.svg`}
                alt={`${review.platform} logo`}
                className="h-8 w-8"
              />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-medium text-gray-900 capitalize">
                  {review.platform}
                </span>
                {review.rating && (
                  <div className="ml-2 flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="ml-1 text-sm font-medium text-gray-900">
                      {review.rating}
                    </span>
                  </div>
                )}
                {review.review_count && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({review.review_count} reviews)
                  </span>
                )}
              </div>
              <a
                href={review.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-500 flex items-center mt-1"
              >
                View Reviews
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
          {isOwner && (
            <button
              onClick={() => handleDelete(review.id)}
              className="text-gray-400 hover:text-red-500"
              title="Delete external review link"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default ExternalReviewsList;