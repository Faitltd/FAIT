import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  Award,
  Star,
  RefreshCw,
  Info,
  Filter
} from 'lucide-react';
import { UserBadge, Badge } from '../../types/token';
import { tokenService } from '../../services/TokenService';

interface BadgesDisplayProps {
  userId: string;
  editable?: boolean;
  className?: string;
}

const BadgesDisplay: React.FC<BadgesDisplayProps> = ({
  userId,
  editable = false,
  className = ''
}) => {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [allBadges, setAllBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const [userBadgesData, allBadgesData] = await Promise.all([
        tokenService.getUserBadges(userId),
        tokenService.getBadges()
      ]);

      setUserBadges(userBadgesData);
      setAllBadges(allBadgesData);

      // Extract unique categories
      const uniqueCategories = Array.from(new Set(allBadgesData.map(badge => badge.category)));
      setCategories(uniqueCategories);

      setError(null);
    } catch (err) {
      setError('Failed to load badges');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      // Check for new badges
      const newBadgesCount = await tokenService.checkAndAwardBadges(userId);

      if (newBadgesCount > 0) {
        // Refresh the badges list
        await fetchBadges();
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleSetFeatured = async (userBadgeId: string, isFeatured: boolean) => {
    if (!editable) return;

    try {
      const success = await tokenService.setFeaturedBadge(userBadgeId, isFeatured);

      if (success) {
        // Update local state
        setUserBadges(userBadges.map(badge => ({
          ...badge,
          is_featured: badge.id === userBadgeId ? isFeatured : false
        })));
      }
    } catch (err) {
      console.error('Failed to update featured badge:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-primary-100 text-primary-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBadges = filterCategory === 'all'
    ? userBadges
    : userBadges.filter(badge => badge.badge?.category === filterCategory);

  if (loading) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-white rounded-lg shadow ${className}`}>
        <div className="text-red-500 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Your Badges</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`text-gray-400 hover:text-gray-500 ${refreshing ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="h-4 w-4 text-gray-400 mr-2" />
            <label htmlFor="filter-category" className="text-sm text-gray-700 mr-2">Filter by:</label>
            <select
              id="filter-category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-500">
            {userBadges.length} badge{userBadges.length !== 1 ? 's' : ''} earned
          </div>
        </div>
      </div>

      {userBadges.length === 0 ? (
        <div className="p-8 text-center">
          <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Badges Yet</h3>
          <p className="text-gray-500 mb-4">
            Complete activities on the platform to earn badges.
          </p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Check for Badges
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          {filteredBadges.map((userBadge) => (
            <div
              key={userBadge.id}
              className={`border rounded-lg overflow-hidden hover:shadow-md transition-shadow ${
                userBadge.is_featured ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="p-4 flex flex-col items-center text-center">
                {userBadge.badge?.image_url ? (
                  <div className="h-16 w-16 mb-2 relative">
                    <img
                      src={userBadge.badge.image_url}
                      alt={userBadge.badge.name}
                      className="w-full h-full object-contain"
                    />
                    {userBadge.is_featured && (
                      <div className="absolute -top-1 -right-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-16 w-16 mb-2 flex items-center justify-center relative">
                    <Award className="h-12 w-12 text-gray-400" />
                    {userBadge.is_featured && (
                      <div className="absolute -top-1 -right-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      </div>
                    )}
                  </div>
                )}

                <h4 className="text-sm font-medium text-gray-900 mb-1">{userBadge.badge?.name}</h4>

                <div className="flex flex-wrap justify-center gap-1 mb-2">
                  {userBadge.badge?.category && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {userBadge.badge.category}
                    </span>
                  )}

                  {userBadge.badge?.difficulty && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(userBadge.badge.difficulty)}`}>
                      {userBadge.badge.difficulty}
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  Earned on {formatDate(userBadge.awarded_at)}
                </div>

                <div className="flex items-center mt-1">
                  <button
                    onClick={() => setShowInfo(showInfo === userBadge.id ? null : userBadge.id)}
                    className="text-gray-400 hover:text-gray-500 mr-2"
                  >
                    <Info className="h-4 w-4" />
                  </button>

                  {editable && (
                    <button
                      onClick={() => handleSetFeatured(userBadge.id, !userBadge.is_featured)}
                      className={`text-gray-400 hover:text-yellow-500 ${userBadge.is_featured ? 'text-yellow-500' : ''}`}
                    >
                      <Star className={`h-4 w-4 ${userBadge.is_featured ? 'fill-current' : ''}`} />
                    </button>
                  )}
                </div>

                {showInfo === userBadge.id && userBadge.badge?.description && (
                  <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    {userBadge.badge.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BadgesDisplay;
