import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MembershipDues from '../components/Payments/MembershipDues';
import StripeCheckout from '../components/Payments/StripeCheckout';
import { 
  getUserSubscription, 
  getPaymentMethods, 
  createCheckoutSession,
  updateDefaultPaymentMethod,
  deletePaymentMethod
} from '../lib/api/paymentsApi';
import { CreditCard, Trash2, Check } from 'lucide-react';

const MembershipPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [subscription, setSubscription] = useState<any>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user's subscription
        const subscriptionData = await getUserSubscription(user.id);
        setSubscription(subscriptionData);
        
        // Fetch user's payment methods
        const paymentMethodsData = await getPaymentMethods(user.id);
        setPaymentMethods(paymentMethodsData);
      } catch (err) {
        console.error('Error fetching membership data:', err);
        setError('Failed to load membership information. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId);
    
    // If user has no payment methods, show the add payment form
    if (paymentMethods.length === 0) {
      setShowAddPayment(true);
    }
  };

  const handleSubscribe = async () => {
    if (!user || !selectedPlan) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Create checkout session and redirect to Stripe
      const successUrl = `${window.location.origin}/membership/success`;
      const cancelUrl = `${window.location.origin}/membership`;
      
      await createCheckoutSession(user.id, selectedPlan, successUrl, cancelUrl);
      
      // The user will be redirected to Stripe, so we don't need to do anything else here
    } catch (err) {
      console.error('Error creating checkout session:', err);
      setError('Failed to start subscription process. Please try again.');
      setLoading(false);
    }
  };

  const handlePaymentMethodSuccess = async (paymentMethodId: string) => {
    setShowAddPayment(false);
    setSuccessMessage('Payment method added successfully!');
    
    // Refresh payment methods
    if (user) {
      try {
        const paymentMethodsData = await getPaymentMethods(user.id);
        setPaymentMethods(paymentMethodsData);
      } catch (err) {
        console.error('Error refreshing payment methods:', err);
      }
    }
    
    // Clear success message after a few seconds
    setTimeout(() => {
      setSuccessMessage(null);
    }, 5000);
  };

  const handlePaymentMethodError = (error: string) => {
    setError(error);
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await updateDefaultPaymentMethod(user.id, paymentMethodId);
      
      // Refresh payment methods
      const paymentMethodsData = await getPaymentMethods(user.id);
      setPaymentMethods(paymentMethodsData);
      
      setSuccessMessage('Default payment method updated!');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error updating default payment method:', err);
      setError('Failed to update default payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await deletePaymentMethod(user.id, paymentMethodId);
      
      // Refresh payment methods
      const paymentMethodsData = await getPaymentMethods(user.id);
      setPaymentMethods(paymentMethodsData);
      
      setSuccessMessage('Payment method deleted!');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err) {
      console.error('Error deleting payment method:', err);
      setError('Failed to delete payment method. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !subscription && paymentMethods.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Membership</h1>
      
      {/* Error and success messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}
      
      {/* Payment methods section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
          <button
            onClick={() => setShowAddPayment(!showAddPayment)}
            className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
          >
            {showAddPayment ? 'Cancel' : 'Add Payment Method'}
          </button>
        </div>
        
        {showAddPayment ? (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Payment Method</h3>
            <StripeCheckout
              onSuccess={handlePaymentMethodSuccess}
              onError={handlePaymentMethodError}
              buttonText="Add Payment Method"
            />
          </div>
        ) : (
          <>
            {paymentMethods.length === 0 ? (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">You don't have any payment methods yet.</p>
                <button
                  onClick={() => setShowAddPayment(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Payment Method
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {paymentMethods.map((method) => (
                    <li key={method.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="h-6 w-6 text-gray-500" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {method.card_brand?.charAt(0).toUpperCase() + method.card_brand?.slice(1) || 'Card'} ending in {method.card_last4}
                            </p>
                            <p className="text-sm text-gray-500">
                              Expires {method.card_exp_month}/{method.card_exp_year}
                            </p>
                          </div>
                          {method.is_default && (
                            <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          {!method.is_default && (
                            <button
                              onClick={() => handleSetDefaultPaymentMethod(method.id)}
                              className="p-1 text-gray-500 hover:text-blue-600"
                              title="Set as default"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeletePaymentMethod(method.id)}
                            className="p-1 text-gray-500 hover:text-red-600"
                            title="Delete payment method"
                            disabled={method.is_default}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Membership plans section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Membership Plans</h2>
        <MembershipDues onSelectPlan={handleSelectPlan} />
        
        {/* Subscribe button */}
        {selectedPlan && (
          <div className="mt-8 text-center">
            <button
              onClick={handleSubscribe}
              disabled={loading || paymentMethods.length === 0}
              className={`px-6 py-3 text-lg font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                loading || paymentMethods.length === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
            
            {paymentMethods.length === 0 && (
              <p className="mt-2 text-sm text-red-600">
                Please add a payment method before subscribing.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipPage;
