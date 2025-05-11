import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const SubscriptionPlans: React.FC = () => {
  const userType = localStorage.getItem('userType') || 'client';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';

  // Helper function to get user-specific data
  const getUserData = () => {
    switch (userType) {
      case 'service_agent':
        return {
          currentPlan: 'Pro Contractor',
          plans: [
            {
              id: 'pro',
              name: 'Pro Contractor',
              description: 'For established service providers looking to grow their business.',
              price: '$75/month',
              features: [
                'Unlimited Service Listings',
                'Priority Placement in Search Results',
                'Advanced Booking Management',
                'Client Messaging',
                'Payment Processing',
                'Analytics Dashboard'
              ],
              isCurrent: true,
              isPopular: false,
              color: 'blue'
            },
            {
              id: 'business',
              name: 'Business Contractor',
              description: 'For professional contractors with multiple employees.',
              price: '$150/month',
              features: [
                'Everything in Pro',
                'Team Management',
                'Advanced Reporting',
                'Custom Branding',
                'API Access',
                'Priority Support'
              ],
              isCurrent: false,
              isPopular: true,
              color: 'blue'
            },
            {
              id: 'enterprise',
              name: 'Enterprise',
              description: 'For large businesses with custom requirements.',
              price: 'Custom pricing',
              features: [
                'Everything in Business',
                'Custom Integration',
                'Dedicated Support',
                'SLA Guarantees',
                'Custom Development',
                'White-label Options'
              ],
              isCurrent: false,
              isPopular: false,
              color: 'blue'
            }
          ]
        };
      default: // client
        return {
          currentPlan: 'Basic Client',
          plans: [
            {
              id: 'basic',
              name: 'Basic Client',
              description: 'For individuals looking for occasional services.',
              price: 'Free',
              features: [
                'Service Search',
                'Booking Services',
                'Messaging with Service Agents',
                'Review Management',
                'Booking History',
                'Basic Support'
              ],
              isCurrent: true,
              isPopular: false,
              color: 'green'
            },
            {
              id: 'plus',
              name: 'FAIT Plus',
              description: 'For homeowners with regular service needs.',
              price: '$9.99/month',
              features: [
                'Everything in Basic',
                'Priority Booking',
                'Extended Warranties',
                'Discounted Service Fees',
                'Premium Support',
                'Service History Reports'
              ],
              isCurrent: false,
              isPopular: true,
              color: 'blue'
            },
            {
              id: 'family',
              name: 'Family Plan',
              description: 'For families with multiple properties.',
              price: '$19.99/month',
              features: [
                'Everything in FAIT Plus',
                'Multiple Properties',
                'Family Account Sharing',
                'Maintenance Scheduling',
                'Emergency Service Priority',
                'Annual Home Assessment'
              ],
              isCurrent: false,
              isPopular: false,
              color: 'purple'
            }
          ]
        };
    }
  };

  const userData = getUserData();

  // State for the confirmation modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string>(() => {
    // Initialize with the current plan ID from userData
    const current = userData.plans.find(p => p.isCurrent);
    return current ? current.id : '';
  });

  const handleSelectPlan = (planId: string) => {
    const plan = userData.plans.find(p => p.id === planId);
    if (plan) {
      if (plan.id === currentPlanId) {
        alert(`You are already subscribed to the ${plan.name} plan.`);
      } else if (plan.id === 'enterprise') {
        alert('Please contact our sales team for Enterprise pricing and setup.');
      } else {
        // Show confirmation modal instead of alert
        setSelectedPlan(plan);
        setShowModal(true);
      }
    }
  };

  const handleConfirmPlanChange = () => {
    setIsProcessing(true);

    // Simulate API call with timeout
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // Update the current plan ID to the selected plan
      if (selectedPlan) {
        setCurrentPlanId(selectedPlan.id);

        // Update localStorage to persist the change (in a real app, this would be done via API)
        if (selectedPlan.id === 'basic') {
          localStorage.setItem('subscriptionPlan', 'Basic Client');
        } else if (selectedPlan.id === 'plus') {
          localStorage.setItem('subscriptionPlan', 'FAIT Plus');
        } else if (selectedPlan.id === 'family') {
          localStorage.setItem('subscriptionPlan', 'Family Plan');
        } else if (selectedPlan.id === 'pro') {
          localStorage.setItem('subscriptionPlan', 'Pro Contractor');
        } else if (selectedPlan.id === 'business') {
          localStorage.setItem('subscriptionPlan', 'Business Contractor');
        }
      }

      // After showing success message, close modal after a delay
      setTimeout(() => {
        setShowModal(false);
        setIsSuccess(false);
        setSelectedPlan(null);
        // In a real app, we would redirect to the dashboard or refresh the page
      }, 2000);
    }, 1500);
  };

  const handleCancelPlanChange = () => {
    setShowModal(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50">
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">Choose Your Subscription Plan</h1>
              <p className="mt-2 text-sm text-gray-600">
                Select the plan that best fits your needs. You can upgrade or downgrade at any time.
              </p>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              <div className="px-4 py-6 sm:px-0">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {userData.plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                        plan.id === currentPlanId ? 'border-green-500' : 'border-gray-200'
                      }`}
                    >
                      {plan.isPopular && (
                        <div className="absolute top-0 right-0 -mt-1 -mr-1 px-3 py-1 bg-blue-500 text-white text-xs font-bold transform rotate-45 translate-x-2 translate-y-3">
                          Popular
                        </div>
                      )}
                      <div className="p-6 bg-white relative">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center">
                          {plan.name}
                          {plan.id === currentPlanId && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Current Plan
                            </span>
                          )}
                        </h3>
                        <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
                        <p className="mt-4 text-2xl font-bold text-gray-900">
                          {plan.price.includes('$') ? (
                            <>
                              {plan.price.split('/')[0]}
                              <span className="text-sm font-normal text-gray-500">
                                /{plan.price.split('/')[1]}
                              </span>
                            </>
                          ) : (
                            plan.price
                          )}
                        </p>
                        <ul className="mt-6 space-y-4">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <svg className={`h-5 w-5 text-${plan.color}-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="ml-2 text-sm text-gray-500">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-8">
                          <button
                            onClick={() => handleSelectPlan(plan.id)}
                            className={`w-full inline-flex items-center justify-center px-4 py-2 border ${
                              plan.id === currentPlanId
                                ? 'border-green-500 text-green-700 bg-green-50 hover:bg-green-100'
                                : plan.id === 'enterprise'
                                  ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                                  : 'border-transparent text-white bg-blue-600 hover:bg-blue-700'
                            } text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                              plan.id === currentPlanId
                                ? 'focus:ring-green-500'
                                : plan.id === 'enterprise'
                                  ? 'focus:ring-gray-500'
                                  : 'focus:ring-blue-500'
                            }`}
                          >
                            {plan.id === currentPlanId
                              ? 'Current Plan'
                              : plan.id === 'enterprise'
                                ? 'Contact Sales'
                                : 'Select Plan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-4 py-6 sm:px-0">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Frequently Asked Questions
                    </h3>
                    <div className="mt-6 border-t border-gray-200 pt-6">
                      <dl className="divide-y divide-gray-200">
                        <div className="py-4">
                          <dt className="text-base font-medium text-gray-900">
                            Can I change my plan later?
                          </dt>
                          <dd className="mt-2 text-sm text-gray-500">
                            Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
                          </dd>
                        </div>
                        <div className="py-4">
                          <dt className="text-base font-medium text-gray-900">
                            How does billing work?
                          </dt>
                          <dd className="mt-2 text-sm text-gray-500">
                            We bill monthly or annually, depending on your preference. You can cancel your subscription at any time.
                          </dd>
                        </div>
                        <div className="py-4">
                          <dt className="text-base font-medium text-gray-900">
                            Is there a free trial?
                          </dt>
                          <dd className="mt-2 text-sm text-gray-500">
                            Yes, all paid plans come with a 14-day free trial. You won't be charged until the trial period ends.
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-4 py-6 sm:px-0 flex justify-between">
                <a
                  href="/subscription/dashboard"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back to Subscription Dashboard
                </a>
                <a
                  href="/dashboard/client"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Go to Dashboard
                </a>
              </div>

              {/* Confirmation Modal */}
              {showModal && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                  <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    {/* Background overlay */}
                    <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                      <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                    </div>

                    {/* Modal panel */}
                    <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                      {isSuccess ? (
                        <div>
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              Subscription Updated Successfully
                            </h3>
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">
                                Your subscription has been updated to the {selectedPlan?.name} plan.
                              </p>
                              {selectedPlan && selectedPlan.price === 'Free' ? (
                                <p className="mt-2 text-sm text-gray-500">
                                  You will continue to have access to your current features until the end of your billing period.
                                </p>
                              ) : selectedPlan && userData.currentPlan === 'Basic Client' && selectedPlan.id !== 'basic' ? (
                                <p className="mt-2 text-sm text-gray-500">
                                  Your card has been charged {selectedPlan?.price.split('/')[0]}. You now have access to all premium features.
                                </p>
                              ) : (
                                <p className="mt-2 text-sm text-gray-500">
                                  {(() => {
                                    const currentPrice = userData.currentPlan === 'FAIT Plus' ? 9.99 :
                                                      userData.currentPlan === 'Family Plan' ? 19.99 :
                                                      userData.currentPlan === 'Pro Contractor' ? 75 :
                                                      userData.currentPlan === 'Business Contractor' ? 150 : 0;

                                    const newPrice = selectedPlan.id === 'plus' ? 9.99 :
                                                    selectedPlan.id === 'family' ? 19.99 :
                                                    selectedPlan.id === 'pro' ? 75 :
                                                    selectedPlan.id === 'business' ? 150 : 0;

                                    const priceDiff = newPrice - currentPrice;

                                    if (priceDiff > 0) {
                                      return `Your card has been charged the difference of $${priceDiff.toFixed(2)}. Your new monthly rate is ${selectedPlan?.price}.`;
                                    } else if (priceDiff < 0) {
                                      return `Your plan will be downgraded at the end of your current billing period. Your new monthly rate will be ${selectedPlan?.price}.`;
                                    } else {
                                      return `There is no change to your billing amount. Your monthly rate remains ${selectedPlan?.price}.`;
                                    }
                                  })()
                                }
                                </p>
                              )}
                              <p className="mt-4 text-sm font-medium text-blue-600">
                                A confirmation email has been sent to your registered email address.
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                              {selectedPlan && userData.currentPlan === 'Basic Client' && selectedPlan.id !== 'basic' ? 'Upgrade' : 'Change'} Subscription
                            </h3>
                            <div className="mt-2">
                              <div className="space-y-4">
                                <p className="text-sm text-gray-500">
                                  {selectedPlan && userData.currentPlan === 'Basic Client' && selectedPlan.id !== 'basic' ? (
                                    <>Are you sure you want to upgrade to the <span className="font-medium">{selectedPlan?.name}</span> plan?</>
                                  ) : selectedPlan && selectedPlan.price === 'Free' ? (
                                    <>Are you sure you want to downgrade to the <span className="font-medium">{selectedPlan?.name}</span> plan?</>
                                  ) : (
                                    <>Are you sure you want to change to the <span className="font-medium">{selectedPlan?.name}</span> plan?</>
                                  )}
                                </p>

                                {/* Billing details section */}
                                <div className="bg-gray-50 p-4 rounded-md">
                                  <h4 className="text-sm font-medium text-gray-900 mb-2">Billing Details</h4>
                                  {selectedPlan && selectedPlan.price === 'Free' ? (
                                    <div className="text-sm text-gray-500">
                                      <p>• Your current plan will remain active until the end of your billing period.</p>
                                      <p>• You will not be charged for the next billing cycle.</p>
                                      <p>• You will lose access to premium features on {new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()}.</p>
                                    </div>
                                  ) : selectedPlan && selectedPlan.id !== 'basic' && userData.currentPlan === 'Basic Client' ? (
                                    <div className="text-sm text-gray-500">
                                      <p>• You will be charged {selectedPlan?.price.split('/')[0]} immediately.</p>
                                      <p>• Your subscription will renew automatically every {selectedPlan?.price.split('/')[1]}.</p>
                                      <p>• You will gain access to premium features immediately after payment.</p>
                                    </div>
                                  ) : selectedPlan && selectedPlan.id !== 'basic' && userData.currentPlan !== 'Basic Client' ? (
                                    <div className="text-sm text-gray-500">
                                      {/* Calculate price difference */}
                                      {(() => {
                                        const currentPrice = userData.currentPlan === 'FAIT Plus' ? 9.99 :
                                                          userData.currentPlan === 'Family Plan' ? 19.99 :
                                                          userData.currentPlan === 'Pro Contractor' ? 75 :
                                                          userData.currentPlan === 'Business Contractor' ? 150 : 0;

                                        const newPrice = selectedPlan.id === 'plus' ? 9.99 :
                                                        selectedPlan.id === 'family' ? 19.99 :
                                                        selectedPlan.id === 'pro' ? 75 :
                                                        selectedPlan.id === 'business' ? 150 : 0;

                                        const priceDiff = newPrice - currentPrice;

                                        if (priceDiff > 0) {
                                          return (
                                            <>
                                              <p>• You will be charged the difference of <span className="font-medium">${priceDiff.toFixed(2)}</span> immediately.</p>
                                              <p>• Your new monthly rate will be {selectedPlan?.price}.</p>
                                              <p>• Your billing date will remain the same.</p>
                                            </>
                                          );
                                        } else if (priceDiff < 0) {
                                          return (
                                            <>
                                              <p>• Your plan will be downgraded at the end of your current billing period.</p>
                                              <p>• Your new monthly rate will be {selectedPlan?.price}.</p>
                                              <p>• You will continue to have access to your current features until {new Date(new Date().setDate(new Date().getDate() + 30)).toLocaleDateString()}.</p>
                                            </>
                                          );
                                        } else {
                                          return (
                                            <>
                                              <p>• There will be no change to your billing amount.</p>
                                              <p>• Your monthly rate will remain {selectedPlan?.price}.</p>
                                              <p>• Your billing date will remain the same.</p>
                                            </>
                                          );
                                        }
                                      })()}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={handleConfirmPlanChange}
                              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${selectedPlan && selectedPlan.price === 'Free' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-blue-600 hover:bg-blue-700'} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                              {isProcessing ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Processing...
                                </>
                              ) : selectedPlan && selectedPlan.price === 'Free' ? 'Downgrade' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelPlanChange}
                              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default SubscriptionPlans;
