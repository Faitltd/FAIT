import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';

interface ReviewReplyFormProps {
  reviewId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const ReviewReplyForm: React.FC<ReviewReplyFormProps> = ({
  reviewId,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to reply to a review');
      return;
    }
    
    if (!content.trim()) {
      setError('Please provide a reply');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create the reply
      const { error: replyError } = await supabase
        .from('review_replies')
        .insert({
          review_id: reviewId,
          user_id: user.id,
          content: content.trim()
        });
      
      if (replyError) throw replyError;
      
      // Get the review to find the client ID
      const { data: review, error: reviewError } = await supabase
        .from('reviews')
        .select('client_id')
        .eq('id', reviewId)
        .single();
      
      if (reviewError) throw reviewError;
      
      // Create notification for the client
      await supabase
        .from('notifications')
        .insert({
          user_id: review.client_id,
          title: 'New Reply to Your Review',
          message: 'Someone has replied to your review.',
          type: 'review',
          is_read: false
        });
      
      setSuccess(true);
      
      // Clear form
      setContent('');
      
      // Call the success callback after a short delay to show the success message
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting reply:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit reply');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center py-6">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reply Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your reply has been posted successfully.
          </p>
          <button
            onClick={onSuccess}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Reply to Review</h2>
      
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Your Reply
          </label>
          <textarea
            id="content"
            value={content}
            onChange={handleContentChange}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="Write your response to this review..."
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Your reply will be visible to everyone who can see this review.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Submit Reply'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewReplyForm;
