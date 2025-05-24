import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Lock, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';

interface AccountDeactivationProps {
  onCancel?: () => void;
}

/**
 * Component for account deactivation
 */
const AccountDeactivation: React.FC<AccountDeactivationProps> = ({ onCancel }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [keepData, setKeepData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reasons for deactivation
  const deactivationReasons = [
    'I no longer need this service',
    'I found a better alternative',
    'I\'m not satisfied with the service',
    'I\'m concerned about my privacy',
    'I\'m taking a break',
    'Other'
  ];
  
  // Handle deactivation request
  const handleDeactivationRequest = () => {
    // Validate reason
    if (!reason) {
      setError('Please select a reason for deactivation');
      return;
    }
    
    setShowConfirmation(true);
  };
  
  // Handle account deactivation
  const handleDeactivate = async () => {
    if (!user || !password) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Verify password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password
      });
      
      if (signInError) {
        setError('Incorrect password. Please try again.');
        setLoading(false);
        return;
      }
      
      // Create deactivation record
      const { error: deactivationError } = await supabase
        .from('account_deactivations')
        .insert({
          user_id: user.id,
          reason,
          keep_data: keepData,
          deactivated_at: new Date().toISOString()
        });
      
      if (deactivationError) throw deactivationError;
      
      // Update user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          active: false,
          deactivated_at: new Date().toISOString(),
          deactivation_reason: reason
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      // If user chose to delete data and not keep it
      if (!keepData) {
        // Anonymize personal data
        const { error: anonymizeError } = await supabase
          .from('profiles')
          .update({
            full_name: 'Deactivated User',
            email: `deactivated_${user.id}@example.com`,
            phone: null,
            address: null,
            city: null,
            state: null,
            zip_code: null,
            bio: null,
            avatar_url: null,
            business_name: null,
            website: null,
            license_number: null,
            license_type: null,
            insurance_provider: null,
            insurance_policy_number: null,
            tax_id: null
          })
          .eq('id', user.id);
        
        if (anonymizeError) throw anonymizeError;
      }
      
      // Sign out the user
      await signOut();
      
      // Redirect to deactivation confirmation page
      navigate('/account-deactivated');
    } catch (err) {
      console.error('Error deactivating account:', err);
      setError('Failed to deactivate account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Account Deactivation</h2>
      </div>
      
      <div className="p-6">
        {!showConfirmation ? (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">Important Information</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      Deactivating your account will:
                    </p>
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Remove your profile from public view</li>
                      <li>Cancel any active subscriptions</li>
                      <li>Prevent you from logging in</li>
                      {user?.user_metadata?.user_type === 'service_agent' && (
                        <>
                          <li>Remove your services from search results</li>
                          <li>Cancel any pending bookings</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="deactivation-reason" className="block text-sm font-medium text-gray-700">
                Why are you deactivating your account?
              </label>
              <select
                id="deactivation-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
              >
                <option value="">Select a reason</option>
                {deactivationReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            
            {reason === 'Other' && (
              <div>
                <label htmlFor="other-reason" className="block text-sm font-medium text-gray-700">
                  Please specify
                </label>
                <textarea
                  id="other-reason"
                  rows={3}
                  value={reason === 'Other' ? '' : reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Please tell us why you're leaving..."
                />
              </div>
            )}
            
            <div className="flex items-center">
              <input
                id="keep-data"
                name="keep-data"
                type="checkbox"
                checked={keepData}
                onChange={(e) => setKeepData(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="keep-data" className="ml-2 block text-sm text-gray-900">
                Keep my data for 30 days in case I want to reactivate my account
              </label>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="button"
                onClick={handleDeactivationRequest}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Deactivate Account
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Confirm Account Deactivation</h3>
                  <p className="mt-2 text-sm text-red-700">
                    This action cannot be undone. Please enter your password to confirm.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Go Back
              </button>
              
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={loading || !password}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4 mr-2" />
                    Confirm Deactivation
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountDeactivation;
