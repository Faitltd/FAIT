import React from 'react';
import { Star, User } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Review = Database['public']['Tables']['reviews']['Row'] & {
  client: Pick<Database['public']['Tables']['profiles']['Row'], 'full_name'>;
};

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <Star className="h-6 w-6 text-yellow-400 fill-current" />
          <span className="ml-1 text-2xl font-bold text-gray-900">{averageRating}</span>
        </div>
        <span className="text-gray-500">
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="bg-gray-100 rounded-full p-2">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{review.client.full_name}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-gray-600">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;