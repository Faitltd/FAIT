import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface MFAVerificationProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const MFAVerification: React.FC<MFAVerificationProps> = ({ onComplete, onCancel }) => {
  const { verifyMFA } = useAuth();
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error('Please enter a valid 6-digit verification code');
      }
      
      const { data, error } = await verifyMFA(verificationCode);
      
      if (error) {
        throw error;
      }
      
      // MFA verification complete
      onComplete?.();
    } catch (err) {
      console.error('Error verifying MFA code:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Two-Factor Authentication</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <p className="mb-6 text-gray-600">
        Please enter the verification code from your authenticator app to complete the login process.
      </p>
      
      <form onSubmit={handleVerify}>
        <div className="mb-6">
          <label htmlFor="verificationCode" className="block text-gray-700 font-medium mb-2">
            Verification Code
          </label>
          <input
            type="text"
            id="verificationCode"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            maxLength={6}
            required
            autoFocus
          />
        </div>
        
        <div className="flex justify-between">
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
          )}
          
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading || verificationCode.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
      
      <div className="mt-6">
        <p className="text-sm text-gray-500">
          Having trouble? Contact support at support@itsfait.com
        </p>
      </div>
    </div>
  );
};

export default MFAVerification;
