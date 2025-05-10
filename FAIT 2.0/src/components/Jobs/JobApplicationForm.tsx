import React, { useState } from 'react';
import { DollarSign } from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  onSubmit: (formData: { cover_letter: string; price_quote: number | null }) => void;
  isLoading?: boolean;
}

const JobApplicationForm: React.FC<JobApplicationFormProps> = ({
  jobId,
  onSubmit,
  isLoading = false,
}) => {
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [priceQuote, setPriceQuote] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!coverLetter.trim()) {
      setError('Please provide a cover letter explaining why you are a good fit for this job.');
      return;
    }
    
    // Submit form
    onSubmit({
      cover_letter: coverLetter,
      price_quote: priceQuote ? parseFloat(priceQuote) : null,
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Apply for this Job</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="cover_letter" className="block text-sm font-medium text-gray-700 mb-1">
            Cover Letter*
          </label>
          <textarea
            id="cover_letter"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            rows={6}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Introduce yourself and explain why you're a good fit for this job. Highlight your relevant experience and skills."
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="price_quote" className="block text-sm font-medium text-gray-700 mb-1">
            Price Quote
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="price_quote"
              value={priceQuote}
              onChange={(e) => setPriceQuote(e.target.value)}
              min="0"
              step="0.01"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your price quote for this job"
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Leave blank if you prefer to discuss pricing after initial contact.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobApplicationForm;
