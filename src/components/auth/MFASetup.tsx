import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
  const { setupMFA, verifyMFA } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    // Start MFA setup when component mounts
    const initMFA = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await setupMFA();
        
        if (error) {
          throw error;
        }
        
        if (data) {
          setQrCode(data.qr_code);
          setSecret(data.secret);
        }
      } catch (err) {
        console.error('Error setting up MFA:', err);
        setError(err instanceof Error ? err.message : 'Failed to set up MFA');
      } finally {
        setLoading(false);
      }
    };
    
    initMFA();
  }, [setupMFA]);

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
      
      // MFA setup complete
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
      <h2 className="text-2xl font-bold mb-6 text-center">Set Up Two-Factor Authentication</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {step === 'setup' && (
        <div>
          <p className="mb-4">
            Enhance your account security by setting up two-factor authentication. Follow these steps:
          </p>
          
          <ol className="list-decimal pl-5 mb-6 space-y-2">
            <li>Download an authenticator app like Google Authenticator or Authy on your mobile device</li>
            <li>Scan the QR code below with your authenticator app</li>
            <li>Enter the 6-digit verification code from your app</li>
          </ol>
          
          {loading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : qrCode ? (
            <div className="flex flex-col items-center mb-6">
              <img src={qrCode} alt="QR Code for MFA setup" className="mb-4 border p-2 rounded" />
              
              {secret && (
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 mb-1">If you can't scan the QR code, enter this code manually:</p>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{secret}</code>
                </div>
              )}
              
              <button
                type="button"
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setStep('verify')}
              >
                Continue
              </button>
            </div>
          ) : (
            <p className="text-center text-gray-600">Failed to generate QR code. Please try again.</p>
          )}
        </div>
      )}
      
      {step === 'verify' && (
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
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={() => setStep('setup')}
              disabled={loading}
            >
              Back
            </button>
            
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
          </div>
        </form>
      )}
      
      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={onCancel}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
};

export default MFASetup;
