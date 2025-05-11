import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import {
  CreditCard,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Clock,
  Shield
} from 'lucide-react';

const SubscriptionManagement: React.FC = () => {
  const { user } = useAuth();
  const { subscription, loading, error, createSubscription, cancelSubscription } = useSubscription();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [processingAction, setProcessingAction] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

  // Redirect if not logged in
  if (!user && !loading) {
    navigate('/login');
    return null;
  }

  // Handle subscription creation
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setActionError('Please select a plan');
      return;
    }

    setProcessingAction(true);
    setActionError(null);

    try {
      const result = await createSubscription(selectedPlan, billingCycle);
      
      if (!result.success) {
        setActionError(result.message || 'Failed to create subscription');
      }
      // The redirect to Stripe checkout or success page is handled in the createSubscription function
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    setProcessingAction(true);
    setActionError(null);

    try {
      const result = await cancelSubscription();
      
      if (result.success) {
        setShowCancelConfirm(false);
      } else {
        setActionError(result.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setProcessingAction(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get plan details for display
  const getPlanDetails = (planName: string) => {
    const plans = {
      'Free Tier': {
        name: 'Free Tier',
        description: 'Basic access with limited features',
        price: { monthly: 0, annual: 0 },
        features: ['Limited leads', 'Basic profile', 'No discounts']
      },
      'Pro Contractor': {
        name: 'Pro Contractor',
        description: 'Enhanced features for professional contractors',
        price: { monthly: 75, annual: 750 },
        features: ['Material sourcing', 'ROI data', 'Pricing templates', 'Standard discounts']
      },
      'Business Contractor': {
        name: 'Business Contractor',
        description: 'Full-featured plan for contractor businesses',
        price: { monthly: 200, annual: 2000 },
        features: ['All Pro features', 'Multi-user access', 'Priority leads', 'Premium discounts']
      },
      'Free Homeowner': {
        name: 'Free Homeowner',
        description: 'Basic access for homeowners',
        price: { monthly: 0, annual: 0 },
        features: ['Basic project posting', 'Standard warranty']
      },
      'FAIT Plus': {
        name: 'FAIT Plus',
        description: 'Premium features for homeowners',
        price: { monthly: 4.99, annual: 49 },
        features: ['ROI Reports', 'Extended warranty', 'Discounts', 'Priority support']
      },
      'Annual Membership Fee': {
        name: 'Co-op Membership',
        description: 'Annual cooperative membership',
        price: { monthly: null, annual: 100 },
        features: ['Voting rights', 'Community access', 'Member benefits']
      }
    };

    return plans[planName as keyof typeof plans] || {
      name: planName,
      description: 'Subscription plan',
      price: { monthly: 0, annual: 0 },
      features: []
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error.message}
        </div>
      )}

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {actionError}
        </div>
      )}

      {/* Current Subscription */}
      {subscription && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <CreditCard className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Current Subscription</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="text-gray-500 block text-sm">Plan</span>
                <span className="text-lg font-medium">{subscription.plan_name}</span>
              </div>

              <div className="mb-4">
                <span className="text-gray-500 block text-sm">Status</span>
                <div className="flex items-center">
                  {subscription.active ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500 mr-1" />
                      <span className="text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500 mr-1" />
                      <span className="text-red-600">Inactive</span>
                    </>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="text-gray-500 block text-sm">Billing Cycle</span>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-1" />
                  <span>{subscription.billing_cycle === 'annual' ? 'Annual' : 'Monthly'}</span>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <span className="text-gray-500 block text-sm">Price</span>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-500 mr-1" />
                  <span>${subscription.plan_price} / {subscription.billing_cycle === 'annual' ? 'year' : 'month'}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-gray-500 block text-sm">Start Date</span>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-1" />
                  <span>{formatDate(subscription.start_date)}</span>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-gray-500 block text-sm">Renewal Date</span>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-1" />
                  <span>{formatDate(subscription.end_date)}</span>
                </div>
              </div>
            </div>
          </div>

          {!showCancelConfirm ? (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
              disabled={processingAction}
            >
              Cancel Subscription
            </button>
          ) : (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <p className="text-red-600 mb-3">
                <AlertTriangle className="h-5 w-5 inline mr-1" />
                Are you sure you want to cancel your subscription? You'll lose access to premium features.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  disabled={processingAction}
                >
                  {processingAction ? 'Processing...' : 'Yes, Cancel'}
                </button>
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                  disabled={processingAction}
                >
                  No, Keep Subscription
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Available Plans */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-6">
          <Package className="h-6 w-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">
            {subscription ? 'Change Subscription' : 'Choose a Subscription Plan'}
          </h2>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setBillingCycle('annual')}
            >
              Annual <span className="text-xs">(Save 15-20%)</span>
            </button>
          </div>
        </div>

        {/* Plan Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Contractor Plans */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === 'Free Tier'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPlan('Free Tier')}
          >
            <h3 className="text-lg font-semibold mb-2">Free Tier</h3>
            <div className="text-2xl font-bold mb-4">$0</div>
            <ul className="space-y-2 mb-4">
              {getPlanDetails('Free Tier').features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === 'Pro Contractor'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPlan('Pro Contractor')}
          >
            <h3 className="text-lg font-semibold mb-2">Pro Contractor</h3>
            <div className="text-2xl font-bold mb-4">
              ${billingCycle === 'monthly' ? '75' : '750'}
              <span className="text-sm font-normal text-gray-500">
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              {getPlanDetails('Pro Contractor').features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === 'Business Contractor'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPlan('Business Contractor')}
          >
            <h3 className="text-lg font-semibold mb-2">Business Contractor</h3>
            <div className="text-2xl font-bold mb-4">
              ${billingCycle === 'monthly' ? '200' : '2,000'}
              <span className="text-sm font-normal text-gray-500">
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              {getPlanDetails('Business Contractor').features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Homeowner Plans */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === 'Free Homeowner'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPlan('Free Homeowner')}
          >
            <h3 className="text-lg font-semibold mb-2">Free Homeowner</h3>
            <div className="text-2xl font-bold mb-4">$0</div>
            <ul className="space-y-2 mb-4">
              {getPlanDetails('Free Homeowner').features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === 'FAIT Plus'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => setSelectedPlan('FAIT Plus')}
          >
            <h3 className="text-lg font-semibold mb-2">FAIT Plus</h3>
            <div className="text-2xl font-bold mb-4">
              ${billingCycle === 'monthly' ? '4.99' : '49'}
              <span className="text-sm font-normal text-gray-500">
                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
              </span>
            </div>
            <ul className="space-y-2 mb-4">
              {getPlanDetails('FAIT Plus').features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Co-op Membership */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedPlan === 'Annual Membership Fee'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => {
              setSelectedPlan('Annual Membership Fee');
              setBillingCycle('annual'); // Force annual for membership
            }}
          >
            <h3 className="text-lg font-semibold mb-2">Co-op Membership</h3>
            <div className="text-2xl font-bold mb-4">
              $100
              <span className="text-sm font-normal text-gray-500">/yr</span>
            </div>
            <ul className="space-y-2 mb-4">
              {getPlanDetails('Annual Membership Fee').features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <div className="text-sm text-gray-500 mt-2">
              <Shield className="h-4 w-4 inline mr-1" />
              Annual billing only
            </div>
          </div>
        </div>

        <button
          onClick={handleSubscribe}
          className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          disabled={!selectedPlan || processingAction}
        >
          {processingAction ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
          ) : (
            <span>
              {subscription ? 'Change Subscription' : 'Subscribe Now'}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionManagement;
