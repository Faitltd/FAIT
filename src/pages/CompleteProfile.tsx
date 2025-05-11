import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type UserType = Database['public']['Tables']['profiles']['Row']['user_type'];

const CompleteProfile = () => {
  const [userType, setUserType] = useState<UserType>('client');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      setUser(session.user);

      // Pre-fill name if available from OAuth
      if (session.user.user_metadata?.full_name) {
        setFullName(session.user.user_metadata.full_name);
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) return;

    if (fullName.trim().length < 2) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      // 1. Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          user_type: userType,
          full_name: fullName,
          email: user.email,
          phone: phone || null,
        });

      if (profileError) {
        throw profileError;
      }

      // 2. If service agent, create verification record
      if (userType === 'service_agent') {
        const { error: verificationError } = await supabase
          .from('service_agent_verifications')
          .insert({
            service_agent_id: user.id,
          });

        if (verificationError) {
          throw verificationError;
        }
      }

      // 3. Create initial points transaction for signup
      const { error: pointsError } = await supabase
        .from('points_transactions')
        .insert({
          user_id: user.id,
          points_amount: 100,
          transaction_type: 'earned',
          description: 'Welcome bonus for joining FAIT Co-Op',
        });

      if (pointsError) {
        console.error('Error creating welcome points:', pointsError);
        // Non-critical error, don't throw
      }

      // Navigate based on user type
      navigate(userType === 'service_agent' ? '/dashboard/service-agent' : '/dashboard/client');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while completing your profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We need a few more details to set up your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">I am a:</label>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={`${
                    userType === 'client'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={() => setUserType('client')}
                >
                  Client
                </button>
                <button
                  type="button"
                  className={`${
                    userType === 'service_agent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } px-4 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  onClick={() => setUserType('service_agent')}
                >
                  Service Agent
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number (optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;