import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Image, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';
import LoadingSpinner from '../LoadingSpinner';

interface ReviewPhoto {
  id: string;
  review_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  public_url: string;
}

interface Review {
  id: string;
  booking_id: string;
  service_package_id: string;
  client_id: string;
  service_agent_id: string;
  rating: number;
  content: string;
  created_at: string;
  updated_at?: string;
  helpful_count: number;
  unhelpful_count: number;
  client?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  photos?: ReviewPhoto[];
  replies?: ReviewReply[];
}

interface ReviewReply {
  id: string;
  review_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string;
    user_type: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  onReply?: (reviewId: string) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onMarkUnhelpful?: (reviewId: string) => void;
  serviceAgentId?: string;
  currentUserId?: string;
  showPhotoModal?: (photos: ReviewPhoto[], initialIndex: number) => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  loading,
  error,
  onReply,
  onMarkHelpful,
  onMarkUnhelpful,
  serviceAgentId,
  currentUserId,
  showPhotoModal
}) => {
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterPhotos, setFilterPhotos] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'highest' | 'lowest' | 'helpful'>('recent');

  const toggleExpanded = (reviewId: string) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const handleFilterRating = (rating: number | null) => {
    setFilterRating(rating === filterRating ? null : rating);
  };

  const handleFilterPhotos = () => {
    setFilterPhotos(!filterPhotos);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as 'recent' | 'highest' | 'lowest' | 'helpful');
  };

  const filteredReviews = reviews.filter(review => {
    if (filterRating !== null && review.rating !== filterRating) {
      return false;
    }
    if (filterPhotos && (!review.photos || review.photos.length === 0)) {
      return false;
    }
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpful_count - a.helpful_count;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  const getRatingCounts = () => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      counts[review.rating - 1]++;
    });
    return counts.reverse(); // 5-star first
  };

  const getRatingPercentage = (count: number) => {
    if (reviews.length === 0) return 0;
    return (count / reviews.length) * 100;
  };

  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No reviews yet. Be the first to leave a review!</p>
      </div>
    );
  }

  const averageRating = calculateAverageRating();
  const ratingCounts = getRatingCounts();

  return (
    <div>
      {/* Summary section */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average rating */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-sm text-gray-500">
              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
            </p>
          </div>

          {/* Rating distribution */}
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Rating Distribution</h3>
            <div className="space-y-2">
              {ratingCounts.map((count, index) => {
                const stars = 5 - index;
                return (
                  <div key={stars} className="flex items-center">
                    <div className="w-24 flex items-center">
                      <span className="text-sm text-gray-600 mr-2">{stars} stars</span>
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${getRatingPercentage(count)}%` }}
                      ></div>
                    </div>
                    <div className="w-16 text-right">
                      <span className="text-sm text-gray-500">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Filters and sorting */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter:</span>
          {[5, 4, 3, 2, 1].map(rating => (
            <button
              key={rating}
              onClick={() => handleFilterRating(rating)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                filterRating === rating
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rating} <Star className="h-3 w-3 ml-1" />
            </button>
          ))}
          <button
            onClick={handleFilterPhotos}
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              filterPhotos
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Image className="h-3 w-3 mr-1" /> With Photos
          </button>
          {(filterRating !== null || filterPhotos) && (
            <button
              onClick={() => {
                setFilterRating(null);
                setFilterPhotos(false);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="flex items-center">
          <label htmlFor="sort-reviews" className="text-sm font-medium text-gray-700 mr-2">
            Sort by:
          </label>
          <select
            id="sort-reviews"
            value={sortBy}
            onChange={handleSortChange}
            className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="recent">Most Recent</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
            <option value="helpful">Most Helpful</option>
          </select>
        </div>
      </div>

      {/* Reviews list */}
      {sortedReviews.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-gray-500">No reviews match your filters. Try adjusting your criteria.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedReviews.map(review => {
            const isExpanded = expandedReviews.has(review.id);
            const isServiceAgentReply = review.replies?.some(
              reply => reply.user?.id === serviceAgentId
            );

            return (
              <div key={review.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 bg-white">
                  {/* Review header */}
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <img
                        src={review.client?.avatar_url || '/default-avatar.png'}
                        alt={review.client?.full_name || 'User'}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {review.client?.full_name || 'Anonymous User'}
                        </h3>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(review.created_at)}
                        {review.updated_at && review.updated_at !== review.created_at && (
                          <span className="ml-2">(edited)</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Review content */}
                  <div className="mt-4">
                    <p className={`text-gray-700 ${!isExpanded && review.content.length > 300 ? 'line-clamp-3' : ''}`}>
                      {review.content}
                    </p>
                    {review.content.length > 300 && (
                      <button
                        onClick={() => toggleExpanded(review.id)}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" /> Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" /> Read more
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Review photos */}
                  {review.photos && review.photos.length > 0 && (
                    <div className="mt-4">
                      <div className="flex flex-wrap gap-2">
                        {review.photos.map((photo, index) => (
                          <div
                            key={photo.id}
                            className="relative cursor-pointer"
                            onClick={() => showPhotoModal && showPhotoModal(review.photos || [], index)}
                          >
                            <img
                              src={photo.public_url}
                              alt={`Review photo ${index + 1}`}
                              className="h-20 w-20 object-cover rounded-md border border-gray-300 hover:border-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review actions */}
                  <div className="mt-4 flex items-center space-x-4">
                    {onMarkHelpful && (
                      <button
                        onClick={() => onMarkHelpful(review.id)}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpful_count})
                      </button>
                    )}
                    {onMarkUnhelpful && (
                      <button
                        onClick={() => onMarkUnhelpful(review.id)}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        Not Helpful ({review.unhelpful_count})
                      </button>
                    )}
                    {onReply && serviceAgentId === currentUserId && !isServiceAgentReply && (
                      <button
                        onClick={() => onReply(review.id)}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </button>
                    )}
                  </div>
                </div>

                {/* Review replies */}
                {review.replies && review.replies.length > 0 && (
                  <div className="bg-gray-50 p-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      {review.replies.length} {review.replies.length === 1 ? 'Reply' : 'Replies'}
                    </h4>
                    <div className="space-y-4">
                      {review.replies.map(reply => (
                        <div key={reply.id} className="flex items-start">
                          <div className="flex-shrink-0 mr-3">
                            <img
                              src={reply.user?.avatar_url || '/default-avatar.png'}
                              alt={reply.user?.full_name || 'User'}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          </div>
                          <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                              <h5 className="text-sm font-medium text-gray-900">
                                {reply.user?.full_name || 'Anonymous User'}
                                {reply.user?.id === serviceAgentId && (
                                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                    Service Agent
                                  </span>
                                )}
                              </h5>
                              <p className="text-xs text-gray-500">
                                {formatDateTime(reply.created_at)}
                              </p>
                            </div>
                            <p className="mt-1 text-sm text-gray-700">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
