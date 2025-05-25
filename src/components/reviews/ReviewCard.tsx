import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Star, ThumbsUp, ThumbsDown, Flag, MessageSquare, X, Image } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../LoadingSpinner';

interface ReviewPhoto {
  id: string;
  file_name: string;
  public_url: string;
}

interface ReviewVote {
  id: string;
  is_helpful: boolean;
}

interface ReviewProps {
  id: string;
  client: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  service_agent?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  rating: number;
  title: string;
  content: string;
  response?: string;
  response_date?: string;
  created_at: string;
  photos: ReviewPhoto[];
  votes: ReviewVote[];
  onReport?: (reviewId: string) => void;
  onRespond?: (reviewId: string) => void;
}

const ReviewCard: React.FC<ReviewProps> = ({
  id,
  client,
  service_agent,
  rating,
  title,
  content,
  response,
  response_date,
  created_at,
  photos,
  votes,
  onReport,
  onRespond
}) => {
  const { user } = useAuth();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [userVote, setUserVote] = useState<boolean | null>(() => {
    if (!user) return null;
    const vote = votes.find(v => v.id === user.id);
    return vote ? vote.is_helpful : null;
  });
  const [isVoting, setIsVoting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const helpfulVotes = votes.filter(v => v.is_helpful).length;
  const unhelpfulVotes = votes.filter(v => !v.is_helpful).length;
  
  const isCurrentUserReview = user && client.id === user.id;
  const isServiceAgentReview = user && service_agent && service_agent.id === user.id;
  
  const handleVote = async (isHelpful: boolean) => {
    if (!user) return;
    
    setIsVoting(true);
    setError(null);
    
    try {
      // If user already voted the same way, remove the vote
      if (userVote === isHelpful) {
        const { error: deleteError } = await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', id)
          .eq('user_id', user.id);
        
        if (deleteError) throw deleteError;
        
        setUserVote(null);
      } else {
        // If user already voted differently, update the vote
        if (userVote !== null) {
          const { error: updateError } = await supabase
            .from('review_votes')
            .update({ is_helpful: isHelpful })
            .eq('review_id', id)
            .eq('user_id', user.id);
          
          if (updateError) throw updateError;
        } else {
          // Otherwise, insert a new vote
          const { error: insertError } = await supabase
            .from('review_votes')
            .insert({
              review_id: id,
              user_id: user.id,
              is_helpful: isHelpful
            });
          
          if (insertError) throw insertError;
        }
        
        setUserVote(isHelpful);
      }
    } catch (err) {
      console.error('Error voting on review:', err);
      setError('Failed to record your vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };
  
  const handleReport = async () => {
    if (!user) return;
    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting this review');
      return;
    }
    
    setIsReporting(true);
    setError(null);
    
    try {
      const { error: reportError } = await supabase
        .from('review_reports')
        .insert({
          review_id: id,
          user_id: user.id,
          reason: reportReason
        });
      
      if (reportError) throw reportError;
      
      setShowReportModal(false);
      setReportReason('');
      
      if (onReport) {
        onReport(id);
      }
    } catch (err) {
      console.error('Error reporting review:', err);
      setError('Failed to report review. Please try again.');
    } finally {
      setIsReporting(false);
    }
  };
  
  const openPhotoModal = (index: number) => {
    setSelectedPhotoIndex(index);
    setShowPhotoModal(true);
  };
  
  const closePhotoModal = () => {
    setShowPhotoModal(false);
  };
  
  const nextPhoto = () => {
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % photos.length);
  };
  
  const prevPhoto = () => {
    setSelectedPhotoIndex((selectedPhotoIndex - 1 + photos.length) % photos.length);
  };
  
  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((value) => (
          <Star
            key={value}
            className={`h-4 w-4 ${
              value <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Photo Modal */}
      {showPhotoModal && photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-4xl max-h-screen p-4">
            <button
              onClick={closePhotoModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
            >
              <X className="h-6 w-6" />
            </button>
            
            <img
              src={photos[selectedPhotoIndex].public_url}
              alt={photos[selectedPhotoIndex].file_name}
              className="max-h-[80vh] max-w-full object-contain"
            />
            
            {photos.length > 1 && (
              <div className="absolute inset-x-0 bottom-4 flex justify-center space-x-4">
                <button
                  onClick={prevPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
                  {selectedPhotoIndex + 1} / {photos.length}
                </div>
                <button
                  onClick={nextPhoto}
                  className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Report Review</h3>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
                {error}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="report-reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for reporting
              </label>
              <textarea
                id="report-reason"
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                rows={3}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Please explain why you're reporting this review..."
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                disabled={isReporting}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReport}
                disabled={isReporting || !reportReason.trim()}
                className="px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isReporting ? (
                  <>
                    <LoadingSpinner size="small" />
                    <span className="ml-2">Submitting...</span>
                  </>
                ) : (
                  'Submit Report'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-6">
        {/* Review Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <img
              src={client.avatar_url || '/default-avatar.png'}
              alt={client.full_name}
              className="h-10 w-10 rounded-full object-cover mr-3"
            />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{client.full_name}</h3>
              <p className="text-xs text-gray-500">{formatDate(created_at)}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            {renderStars(rating)}
            <p className="text-xs text-gray-500 mt-1">{rating} out of 5</p>
          </div>
        </div>
        
        {/* Review Content */}
        <div className="mb-4">
          <h4 className="text-base font-medium text-gray-900 mb-2">{title}</h4>
          <p className="text-sm text-gray-700 whitespace-pre-line">{content}</p>
        </div>
        
        {/* Review Photos */}
        {photos.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative cursor-pointer"
                  onClick={() => openPhotoModal(index)}
                >
                  <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={photo.public_url}
                      alt={photo.file_name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-opacity flex items-center justify-center">
                      <Image className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Service Agent Response */}
        {response && (
          <div className="bg-gray-50 rounded-md p-4 mb-4">
            <div className="flex items-center mb-2">
              {service_agent && (
                <>
                  <img
                    src={service_agent.avatar_url || '/default-avatar.png'}
                    alt={service_agent.full_name}
                    className="h-8 w-8 rounded-full object-cover mr-2"
                  />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{service_agent.full_name}</h4>
                    <p className="text-xs text-gray-500">
                      {response_date ? formatDate(response_date) : 'Response from service agent'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">{response}</p>
          </div>
        )}
        
        {/* Review Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Helpful/Unhelpful Buttons */}
            {!isCurrentUserReview && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote(true)}
                  disabled={isVoting}
                  className={`flex items-center text-xs px-2 py-1 rounded-md ${
                    userVote === true
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  <span>{helpfulVotes}</span>
                </button>
                <button
                  onClick={() => handleVote(false)}
                  disabled={isVoting}
                  className={`flex items-center text-xs px-2 py-1 rounded-md ${
                    userVote === false
                      ? 'bg-red-50 text-red-700'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <ThumbsDown className="h-3 w-3 mr-1" />
                  <span>{unhelpfulVotes}</span>
                </button>
              </div>
            )}
            
            {/* Report Button */}
            {!isCurrentUserReview && !isServiceAgentReview && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center text-xs text-gray-500 hover:text-gray-700"
              >
                <Flag className="h-3 w-3 mr-1" />
                Report
              </button>
            )}
          </div>
          
          {/* Respond Button (for service agents) */}
          {isServiceAgentReview && !response && onRespond && (
            <button
              onClick={() => onRespond(id)}
              className="flex items-center text-xs text-blue-600 hover:text-blue-800"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Respond
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
