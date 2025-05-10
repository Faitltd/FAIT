import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMembershipPlans, getUserSubscription } from '../../lib/api/paymentsApi';
import { Check, AlertCircle } from 'lucide-react';

interface MembershipDuesProps {
  onSelectPlan?: (planId: string) => void;
  showSubscribeButton?: boolean;
}

const MembershipDues: React.FC<MembershipDuesProps> = ({
  onSelectPlan,
  showSubscribeButton = true,
}) => {
  const { user, userRole } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [userSubscription, setUserSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !userRole) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch membership plans for the user's role
        const plansData = await getMembershipPlans(userRole);
        setPlans(plansData);

        // Fetch user's current subscription
        const subscriptionData = await getUserSubscription(user.id);
        setUserSubscription(subscriptionData);
      } catch (err) {
        console.error('Error fetching membership data:', err);
        setError('Failed to load membership information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userRole]);

  const handleSelectPlan = (planId: string) => {
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  const formatPrice = (price: number, frequency: string) => {
    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);

    let interval = '';
    switch (frequency) {
      case 'monthly':
        interval = '/month';
        break;
      case 'quarterly':
        interval = '/quarter';
        break;
      case 'annual':
        interval = '/year';
        break;
      default:
        interval = '';
    }

    return `${formattedPrice}${interval}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Current subscription */}
      {userSubscription && (
        <div className="mb-8 p-6 bg-primary-50 rounded-lg border border-primary-100">
          <h2 className="text-xl font-semibold text-primary-800 mb-2">Your Current Membership</h2>
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <Check className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="font-medium text-primary-700">
                {userSubscription.plan?.name || 'Active Membership'}
              </p>
              <p className="text-primary-600">
                {formatPrice(userSubscription.plan?.price || 0, userSubscription.plan?.billing_frequency || 'monthly')}
              </p>
              {userSubscription.current_period_end && (
                <p className="text-sm text-primary-600 mt-1">
                  Next billing date: {new Date(userSubscription.current_period_end).toLocaleDateString()}
                </p>
              )}
              {userSubscription.cancel_at_period_end && (
                <div className="mt-2 flex items-start">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="ml-2 text-sm text-amber-600">
                    Your membership will end on {new Date(userSubscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Membership plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = userSubscription?.plan?.id === plan.id;
          const features = plan.features ? (typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features) : {};

          return (
            <div
              key={plan.id}
              className={`border rounded-lg overflow-hidden ${
                isCurrentPlan ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
              }`}
            >
              {isCurrentPlan && (
                <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium">
                  Current Plan
                </div>
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    ${plan.price.toFixed(2)}
                  </span>
                  <span className="ml-1 text-gray-500">
                    /{plan.billing_frequency.replace('ly', '')}
                  </span>
                </div>
                <p className="mt-3 text-gray-600">{plan.description}</p>

                {/* Features list */}
                <ul className="mt-4 space-y-2">
                  {Object.entries(features).map(([key, value]) => (
                    <li key={key} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="ml-2 text-gray-600">
                        {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}: {value}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Action button */}
                {showSubscribeButton && (
                  <div className="mt-6">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={isCurrentPlan}
                      className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isCurrentPlan
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MembershipDues;
