import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserSubscription } from '../lib/api/paymentsApi';
import { CheckCircle } from 'lucide-react';

const MembershipSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Fetch subscription details
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const subscriptionData = await getUserSubscription(user.id);
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();

    // Redirect to dashboard after 10 seconds
    const redirectTimer = setTimeout(() => {
      navigate('/dashboard');
    }, 10000);

    return () => clearTimeout(redirectTimer);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Subscription Successful!
        </h1>
        <p className="mt-4 text-xl text-gray-600">
          Thank you for subscribing to FAIT Co-op.
        </p>
        
        {subscription && (
          <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-100 text-left">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Subscription Details</h2>
            <div className="space-y-2">
              <p className="text-green-700">
                <span className="font-medium">Plan:</span> {subscription.plan?.name}
              </p>
              <p className="text-green-700">
                <span className="font-medium">Price:</span> ${subscription.plan?.price} / {subscription.plan?.billing_frequency.replace('ly', '')}
              </p>
              <p className="text-green-700">
                <span className="font-medium">Status:</span> {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </p>
              <p className="text-green-700">
                <span className="font-medium">Next billing date:</span> {new Date(subscription.current_period_end).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-10">
          <p className="text-gray-500 mb-4">
            You will be redirected to your dashboard in a few seconds...
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/membership"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Membership
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipSuccessPage;
