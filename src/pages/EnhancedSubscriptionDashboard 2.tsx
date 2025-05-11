import React from 'react';
import { useNavigate } from 'react-router-dom';

const EnhancedSubscriptionDashboard: React.FC = () => {
  const userType = localStorage.getItem('userType') || 'client';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
  const navigate = useNavigate();

  // Helper function to get user-specific data
  const getUserData = () => {
    // Check if there's a subscription plan in localStorage
    const savedPlan = localStorage.getItem('subscriptionPlan');

    switch (userType) {
      case 'service_agent':
        return {
          plan: savedPlan || 'Pro Contractor',
          price: savedPlan === 'Business Contractor' ? '$150/month' : '$75/month',
          renewalDate: 'Dec 31, 2024',
          features: [
            'Unlimited Service Listings',
            'Priority Placement in Search Results',
            'Advanced Booking Management',
            'Client Messaging',
            'Payment Processing',
            'Analytics Dashboard'
          ],
          color: 'blue'
        };
      case 'admin':
        return {
          plan: 'Admin',
          price: 'N/A',
          renewalDate: 'N/A',
          features: [
            'User Management',
            'System Configuration',
            'Analytics & Reporting',
            'Content Management',
            'Verification Management',
            'Support Access'
          ],
          color: 'purple'
        };
      default: // client
        return {
          plan: savedPlan || 'Basic Client',
          price: savedPlan === 'FAIT Plus' ? '$9.99/month' :
                 savedPlan === 'Family Plan' ? '$19.99/month' : 'Free',
          renewalDate: savedPlan && savedPlan !== 'Basic Client' ? 'Dec 31, 2024' : 'N/A',
          features: [
            'Service Search',
            'Booking Services',
            'Messaging with Service Agents',
            'Review Management',
            'Booking History',
            'Basic Support'
          ],
          color: savedPlan === 'FAIT Plus' ? 'blue' :
                 savedPlan === 'Family Plan' ? 'purple' : 'green'
        };
    }
  };

  const userData = getUserData();

  return (
    <div className="bg-gray-50">

      {/* Main Content */}
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Subscription Dashboard</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* User Info Card */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    User Information
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Personal details and subscription information.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                  <dl className="sm:divide-y sm:divide-gray-200">
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Email address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userEmail}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        User type
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${userData.color}-100 text-${userData.color}-800`}>
                          {userType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Subscription plan
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex justify-between items-center">
                        <span>{userData.plan}</span>
                        {userType !== 'admin' && (
                          <button
                            onClick={() => navigate('/subscription/plans')}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Upgrade
                          </button>
                        )}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Price
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userData.price}
                      </dd>
                    </div>
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">
                        Renewal date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userData.renewalDate}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            {/* Features Section */}
            <div className="px-4 py-6 sm:px-0">
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Subscription Features
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Features included in your current plan.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {userData.features.map((feature, index) => (
                      <div key={index} className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400">
                        <div className="flex-shrink-0">
                          <div className={`h-10 w-10 rounded-full bg-${userData.color}-100 flex items-center justify-center`}>
                            <svg className={`h-6 w-6 text-${userData.color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {feature}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Upgrade Options Section */}
            {userType !== 'admin' && (
              <div className="px-4 py-6 sm:px-0">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Available Upgrade Options
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Enhance your experience with premium features.
                    </p>
                  </div>
                  <div className="border-t border-gray-200">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {userType === 'service_agent' ? (
                          <>
                            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-lg font-medium text-gray-900">Pro Contractor</h3>
                              <p className="mt-4 text-sm text-gray-500">For established service providers looking to grow their business.</p>
                              <p className="mt-4 text-2xl font-bold text-gray-900">$75<span className="text-sm font-normal text-gray-500">/month</span></p>
                              <ul className="mt-6 space-y-4">
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Unlimited Service Listings</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Priority Placement in Search</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Advanced Analytics</span>
                                </li>
                              </ul>
                              <div className="mt-8">
                                <button
                                  onClick={() => navigate('/subscription/plans')}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                  Current Plan
                                </button>
                              </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                              <div className="absolute top-0 right-0 -mt-1 -mr-1 px-3 py-1 bg-blue-500 text-white text-xs font-bold transform rotate-45 translate-x-2 translate-y-3">
                                Popular
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">Business Contractor</h3>
                              <p className="mt-4 text-sm text-gray-500">For professional contractors with multiple employees.</p>
                              <p className="mt-4 text-2xl font-bold text-gray-900">$150<span className="text-sm font-normal text-gray-500">/month</span></p>
                              <ul className="mt-6 space-y-4">
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Everything in Pro</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Team Management</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Advanced Reporting</span>
                                </li>
                              </ul>
                              <div className="mt-8">
                                <button
                                  onClick={() => navigate('/subscription/plans')}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                  Upgrade
                                </button>
                              </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-lg font-medium text-gray-900">Enterprise</h3>
                              <p className="mt-4 text-sm text-gray-500">For large businesses with custom requirements.</p>
                              <p className="mt-4 text-2xl font-bold text-gray-900">Custom<span className="text-sm font-normal text-gray-500"> pricing</span></p>
                              <ul className="mt-6 space-y-4">
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Everything in Business</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Custom Integration</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Dedicated Support</span>
                                </li>
                              </ul>
                              <div className="mt-8">
                                <button
                                  onClick={() => navigate('/subscription/plans')}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                                >
                                  Contact Sales
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-lg font-medium text-gray-900">Basic Client</h3>
                              <p className="mt-4 text-sm text-gray-500">For individuals looking for occasional services.</p>
                              <p className="mt-4 text-2xl font-bold text-gray-900">Free</p>
                              <ul className="mt-6 space-y-4">
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Service Search</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Booking Services</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Basic Support</span>
                                </li>
                              </ul>
                              <div className="mt-8">
                                <button
                                  onClick={() => navigate('/subscription/plans')}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                >
                                  Current Plan
                                </button>
                              </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                              <div className="absolute top-0 right-0 -mt-1 -mr-1 px-3 py-1 bg-blue-500 text-white text-xs font-bold transform rotate-45 translate-x-2 translate-y-3">
                                Popular
                              </div>
                              <h3 className="text-lg font-medium text-gray-900">FAIT Plus</h3>
                              <p className="mt-4 text-sm text-gray-500">For homeowners with regular service needs.</p>
                              <p className="mt-4 text-2xl font-bold text-gray-900">$9.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                              <ul className="mt-6 space-y-4">
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Everything in Basic</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Priority Booking</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Extended Warranties</span>
                                </li>
                              </ul>
                              <div className="mt-8">
                                <button
                                  onClick={() => navigate('/subscription/plans')}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                  Upgrade
                                </button>
                              </div>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                              <h3 className="text-lg font-medium text-gray-900">Family Plan</h3>
                              <p className="mt-4 text-sm text-gray-500">For families with multiple properties.</p>
                              <p className="mt-4 text-2xl font-bold text-gray-900">$19.99<span className="text-sm font-normal text-gray-500">/month</span></p>
                              <ul className="mt-6 space-y-4">
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Everything in FAIT Plus</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Multiple Properties</span>
                                </li>
                                <li className="flex items-start">
                                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="ml-2 text-sm text-gray-500">Family Account Sharing</span>
                                </li>
                              </ul>
                              <div className="mt-8">
                                <button
                                  onClick={() => alert('Family Plan upgrade process would start here')}
                                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                                >
                                  Upgrade
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Cards */}
            <div className="px-4 py-6 sm:px-0">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">Client Dashboard</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>View and manage your bookings, messages, and warranty claims.</p>
                    </div>
                    <div className="mt-5">
                      <a
                        href="/dashboard/client"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Go to Client Dashboard
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">Service Agent Dashboard</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>Manage your services, bookings, and client communications.</p>
                    </div>
                    <div className="mt-5">
                      <a
                        href="/dashboard/service-agent"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                      >
                        Go to Service Agent Dashboard
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900">Debug Page</h3>
                    <div className="mt-2 max-w-xl text-sm text-gray-500">
                      <p>View technical information and debug application state.</p>
                    </div>
                    <div className="mt-5">
                      <a
                        href="/debug"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                      >
                        Go to Debug Page
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Back to Login */}
            <div className="px-4 py-6 sm:px-0 flex justify-center">
              <a
                href="/test-login"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Login
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedSubscriptionDashboard;
