import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../contexts/AuthContext';
import { Star, Calendar, MessageSquare } from 'lucide-react';

type Review = {
  id: string;
  booking_id: string;
  client_id: string;
  service_package_id: string;
  rating: number;
  comment: string;
  created_at: string;
  client: {
    full_name: string;
    avatar_url?: string;
  };
  service_package: {
    title: string;
  };
  booking: {
    scheduled_date: string;
  };
};

const ServiceAgentReviews = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,
  });

  useEffect(() => {
    if (user) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          id,
          booking_id,
          client_id,
          service_package_id,
          rating,
          comment,
          created_at,
          updated_at,
          client:profiles!reviews_client_id_fkey(full_name, avatar_url),
          service_package:service_packages!reviews_service_package_id_fkey(title, service_agent_id),
          booking:bookings!reviews_booking_id_fkey(scheduled_date)
        `)
        .eq('service_package.service_agent_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData: Review[]) => {
    if (reviewsData.length === 0) {
      setStats({
        averageRating: 0,
        totalReviews: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0,
      });
      return;
    }

    const totalReviews = reviewsData.length;
    const sumRatings = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = sumRatings / totalReviews;

    const fiveStarCount = reviewsData.filter(review => review.rating === 5).length;
    const fourStarCount = reviewsData.filter(review => review.rating === 4).length;
    const threeStarCount = reviewsData.filter(review => review.rating === 3).length;
    const twoStarCount = reviewsData.filter(review => review.rating === 2).length;
    const oneStarCount = reviewsData.filter(review => review.rating === 1).length;

    setStats({
      averageRating,
      totalReviews,
      fiveStarCount,
      fourStarCount,
      threeStarCount,
      twoStarCount,
      oneStarCount,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`h-5 w-5 ${
          index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const calculatePercentage = (count: number) => {
    return stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Reviews</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No reviews yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Once clients leave reviews for your services, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center mb-6">
                <div className="flex justify-center">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-sm text-gray-500">
                  Based on {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              <div className="space-y-3">
                {/* 5 stars */}
                <div className="flex items-center">
                  <div className="flex items-center w-24">
                    <span className="text-sm font-medium text-gray-700 mr-2">5</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${calculatePercentage(stats.fiveStarCount)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 w-10 text-right">
                    {stats.fiveStarCount}
                  </span>
                </div>

                {/* 4 stars */}
                <div className="flex items-center">
                  <div className="flex items-center w-24">
                    <span className="text-sm font-medium text-gray-700 mr-2">4</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${calculatePercentage(stats.fourStarCount)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 w-10 text-right">
                    {stats.fourStarCount}
                  </span>
                </div>

                {/* 3 stars */}
                <div className="flex items-center">
                  <div className="flex items-center w-24">
                    <span className="text-sm font-medium text-gray-700 mr-2">3</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${calculatePercentage(stats.threeStarCount)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 w-10 text-right">
                    {stats.threeStarCount}
                  </span>
                </div>

                {/* 2 stars */}
                <div className="flex items-center">
                  <div className="flex items-center w-24">
                    <span className="text-sm font-medium text-gray-700 mr-2">2</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${calculatePercentage(stats.twoStarCount)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 w-10 text-right">
                    {stats.twoStarCount}
                  </span>
                </div>

                {/* 1 star */}
                <div className="flex items-center">
                  <div className="flex items-center w-24">
                    <span className="text-sm font-medium text-gray-700 mr-2">1</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${calculatePercentage(stats.oneStarCount)}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm text-gray-500 w-10 text-right">
                    {stats.oneStarCount}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex">
                          {renderStars(review.rating)}
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      <h3 className="mt-2 text-lg font-medium text-gray-900">
                        {review.service_package.title}
                      </h3>

                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Calendar className="mr-1.5 h-4 w-4 text-gray-400" />
                        Service date: {formatDate(review.booking.scheduled_date)}
                      </div>

                      <div className="mt-3">
                        <p className="text-gray-800">{review.comment}</p>
                      </div>

                      <div className="mt-4 flex items-center">
                        {review.client.avatar_url ? (
                          <img
                            src={review.client.avatar_url}
                            alt={review.client.full_name}
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-500">
                              {review.client.full_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {review.client.full_name}
                        </span>
                      </div>
                    </div>
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

export default ServiceAgentReviews;
