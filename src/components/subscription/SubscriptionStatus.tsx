import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface SubscriptionStatusProps {
  showUpgradeButton?: boolean;
}

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({ showUpgradeButton = true }) => {
  const { subscription, loading, error } = useSubscription();
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get plan details
  const getPlanDetails = (planName: string) => {
    const plans = {
      'Free Tier': {
        name: 'Free Tier',
        description: 'Basic access with limited features',
        color: 'gray'
      },
      'Pro Contractor': {
        name: 'Pro Contractor',
        description: 'Enhanced features for professional contractors',
        color: 'blue'
      },
      'Business Contractor': {
        name: 'Business Contractor',
        description: 'Full-featured plan for contractor businesses',
        color: 'indigo'
      },
      'Free Homeowner': {
        name: 'Free Homeowner',
        description: 'Basic access for homeowners',
        color: 'gray'
      },
      'FAIT Plus': {
        name: 'FAIT Plus',
        description: 'Premium features for homeowners',
        color: 'green'
      },
      'Annual Membership Fee': {
        name: 'Co-op Membership',
        description: 'Annual cooperative membership',
        color: 'purple'
      }
    };

    return plans[planName as keyof typeof plans] || {
      name: planName,
      description: 'Subscription plan',
      color: 'gray'
    };
  };

  // Handle upgrade button click
  const handleUpgrade = () => {
    navigate('/subscription');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        Error loading subscription: {error.message}
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <CreditCard className="h-6 w-6 text-gray-400 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">No Active Subscription</h2>
        </div>
        <p className="text-gray-600 mb-4">
          You don't have an active subscription. Upgrade to access premium features.
        </p>
        {showUpgradeButton && (
          <button
            onClick={handleUpgrade}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            View Subscription Options
          </button>
        )}
      </div>
    );
  }

  const planDetails = getPlanDetails(subscription.plan_name);
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-company-lightblue text-gray-800',
    indigo: 'bg-company-lighterpink text-gray-800',
    green: 'bg-company-lightorange text-gray-800',
    purple: 'bg-company-lightpink text-gray-800'
  };
  const badgeClass = colorClasses[planDetails.color as keyof typeof colorClasses] || colorClasses.gray;

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <CreditCard className="h-6 w-6 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Current Subscription</h2>
      </div>

      <div className="mb-4">
        <div className="flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClass} mr-2`}>
            {planDetails.name}
          </span>
          {subscription.active ? (
            <span className="flex items-center text-sm text-green-600">
              <CheckCircle className="h-4 w-4 mr-1" />
              Active
            </span>
          ) : (
            <span className="flex items-center text-sm text-red-600">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Inactive
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">{planDetails.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-sm text-gray-500">Billing Cycle</div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-900">{subscription.billing_cycle === 'annual' ? 'Annual' : 'Monthly'}</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Price</div>
          <div className="text-gray-900">
            ${subscription.plan_price}/{subscription.billing_cycle === 'annual' ? 'year' : 'month'}
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Start Date</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-900">{formatDate(subscription.start_date)}</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-gray-500">Renewal Date</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-1" />
            <span className="text-gray-900">{formatDate(subscription.end_date)}</span>
          </div>
        </div>
      </div>

      {showUpgradeButton && (
        <button
          onClick={handleUpgrade}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Manage Subscription
        </button>
      )}
    </div>
  );
};

export default SubscriptionStatus;
