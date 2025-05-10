import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SimpleCreditsForm: React.FC = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [credits, setCredits] = useState(100);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:8081/test-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email || user?.email || 'test@example.com',
          credits,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to add credits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Credits Form</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={user?.email || 'test@example.com'}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-1">
            Credits
          </label>
          <input
            type="number"
            id="credits"
            value={credits}
            onChange={(e) => setCredits(parseInt(e.target.value) || 0)}
            min="1"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading ? 'bg-gray-400' : 'bg-primary-600 hover:bg-primary-700'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
        >
          {loading ? 'Processing...' : 'Add Credits'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          <p className="text-sm font-medium">{result.message}</p>
          <p className="text-xs mt-1">Timestamp: {result.timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default SimpleCreditsForm;
