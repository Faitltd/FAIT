import React, { useState } from 'react';
import { FeedbackService } from '../../services/feedback/FeedbackService';
import { motion, AnimatePresence } from 'framer-motion';

export function FeedbackCollector({ sessionId }: { sessionId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState<FeedbackCategory>('usability');
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const feedbackService = FeedbackService.getInstance();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === null) return;

    try {
      await feedbackService.submitFeedback({
        rating,
        comment,
        category,
        tags,
        sessionId,
      });
      setSubmitted(true);
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 right-4 bg-white rounded-lg shadow-xl p-6 w-96"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you rate your experience?
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`w-10 h-10 rounded-full ${
                        rating === value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Any additional comments?
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="usability">Usability</option>
                  <option value="performance">Performance</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white rounded-md py-2 hover:bg-blue-700"
              >
                Submit Feedback
              </button>
            </form>
          ) : (
            <div className="text-center">
              <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium">Thank you for your feedback!</p>
            </div>
          )}
        </motion.div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-20 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700"
      >
        <FeedbackIcon className="w-6 h-6" />
        <span className="sr-only">Give Feedback</span>
      </button>
    </AnimatePresence>
  );
}