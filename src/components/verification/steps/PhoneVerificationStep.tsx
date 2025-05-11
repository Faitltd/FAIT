import React, { useState } from 'react';

interface PhoneVerificationStepProps {
  onVerify: (phoneNumber: string, verificationCode: string) => void;
  loading: boolean;
}

const PhoneVerificationStep: React.FC<PhoneVerificationStepProps> = ({ onVerify, loading }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sendingCode, setSendingCode] = useState(false);
  
  const handleSendCode = async () => {
    // Validate phone number
    if (!phoneNumber || phoneNumber.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }
    
    try {
      setSendingCode(true);
      
      // In a real implementation, you would call an API to send a verification code
      // For now, we'll simulate sending a code
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCodeSent(true);
      setError(null);
    } catch (err) {
      console.error('Error sending verification code:', err);
      setError('Failed to send verification code. Please try again.');
    } finally {
      setSendingCode(false);
    }
  };
  
  const handleVerify = () => {
    // Validate verification code
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }
    
    // In a real implementation, you would verify the code with your backend
    // For now, we'll accept any 6-digit code
    onVerify(phoneNumber, verificationCode);
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Phone Verification</h2>
      <p className="text-gray-600 mb-6">
        Please verify your phone number. We'll send you a verification code via SMS.
      </p>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <div className="flex">
            <input
              type="tel"
              id="phone"
              name="phone"
              data-cy="verify-phone"
              className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="(555) 123-4567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={codeSent}
              required
            />
            {!codeSent && (
              <button
                type="button"
                onClick={handleSendCode}
                disabled={sendingCode || !phoneNumber}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {sendingCode ? 'Sending...' : 'Send Code'}
              </button>
            )}
          </div>
        </div>
        
        {codeSent && (
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <div className="flex">
              <input
                type="text"
                id="code"
                name="code"
                data-cy="verification-code"
                className="flex-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                required
              />
              <button
                type="button"
                onClick={handleVerify}
                disabled={loading || !verificationCode}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enter the 6-digit code sent to your phone.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <h3 className="text-sm font-medium text-blue-800">Why We Need Your Phone Number</h3>
        <p className="mt-2 text-sm text-blue-700">
          Your phone number helps us verify your identity and secure your account. We may also use it to send you important notifications about your projects and bookings.
        </p>
      </div>
    </div>
  );
};

export default PhoneVerificationStep;
