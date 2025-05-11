import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type ExternalReview = Database['public']['Tables']['external_reviews']['Insert'];

interface ExternalReviewsFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ExternalReviewsForm: React.FC<ExternalReviewsFormProps> = ({ onSuccess, onCancel }) => {
  const [platform, setPlatform] = useState<'google' | 'yelp' | 'nextdoor'>('google');
  const [url, setUrl] = useState('');
  const [rating, setRating] = useState<number | ''>('');
  const [reviewCount, setReviewCount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const externalReview: ExternalReview = {
        service_agent_id: user.id,
        platform,
        url,
        rating: rating || null,
        review_count: reviewCount || null,
      };

      const { error: reviewError } = await supabase
        .from('external_reviews')
        .upsert(externalReview);

      if (reviewError) throw reviewError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save external review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Link External Reviews</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['google', 'yelp', 'nextdoor'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlatform(p)}
                className={`px-4 py-2 border rounded-md text-sm font-medium ${
                  platform === p
                    ? 'bg-blue-600 text-white border-transparent'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            Review URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder={`Your ${platform} reviews page URL`}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
              Overall Rating
            </label>
            <input
              type="number"
              id="rating"
              min="0"
              max="5"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(e.target.value ? parseFloat(e.target.value) : '')}
              placeholder="e.g., 4.5"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="reviewCount" className="block text-sm font-medium text-gray-700">
              Number of Reviews
            </label>
            <input
              type="number"
              id="reviewCount"
              min="0"
              value={reviewCount}
              onChange={(e) => setReviewCount(e.target.value ? parseInt(e.target.value) : '')}
              placeholder="e.g., 42"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save External Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExternalReviewsForm;