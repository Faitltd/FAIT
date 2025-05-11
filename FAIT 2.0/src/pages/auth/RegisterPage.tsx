import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole, ROLE_DISPLAY_NAMES, ROLE_DESCRIPTIONS } from '../../types/UserRoles';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userType, setUserType] = useState<UserRole>(UserRole.CLIENT);
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  // Handle form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // In development mode, just simulate registration
      // In a real app, this would call supabase.auth.signUp
      setTimeout(() => {
        setSuccessMessage('Account created successfully! You can now sign in.');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }, 1000);
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle next step
  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate current step
    if (step === 1) {
      if (!email || !password || !confirmPassword) {
        setError('Please fill in all required fields');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
    }
    
    setError(null);
    setStep(step + 1);
  };
  
  // Handle previous step
  const handlePreviousStep = () => {
    setError(null);
    setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-fuchsia-600 hover:text-fuchsia-500">
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="flex justify-between items-center">
          <div className="w-full">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-between">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  step >= 1 ? 'bg-fuchsia-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  step >= 2 ? 'bg-fuchsia-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  step >= 3 ? 'bg-fuchsia-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs">Account</span>
              <span className="text-xs">Profile</span>
              <span className="text-xs">Confirmation</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Account Information */}
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleNextStep}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:z-10 sm:text-sm"
                  placeholder="Password (min. 8 characters)"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Personal Information */}
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleNextStep}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label htmlFor="first-name" className="sr-only">
                    First Name
                  </label>
                  <input
                    id="first-name"
                    name="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:z-10 sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="sr-only">
                    Last Name
                  </label>
                  <input
                    id="last-name"
                    name="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:z-10 sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="phone" className="sr-only">
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:z-10 sm:text-sm"
                  placeholder="Phone Number (optional)"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="sr-only">
                  Company/Organization
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-fuchsia-500 focus:border-fuchsia-500 focus:z-10 sm:text-sm"
                  placeholder="Company/Organization (optional)"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am registering as a:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <button
                    type="button"
                    onClick={() => setUserType(UserRole.CLIENT)}
                    className={`w-full inline-flex justify-center py-2 px-4 border ${
                      userType === UserRole.CLIENT
                        ? 'border-fuchsia-500 bg-fuchsia-50'
                        : 'border-gray-300 bg-white'
                    } rounded-md shadow-sm text-sm font-medium ${
                      userType === UserRole.CLIENT
                        ? 'text-fuchsia-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Client
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => setUserType(UserRole.CONTRACTOR)}
                    className={`w-full inline-flex justify-center py-2 px-4 border ${
                      userType === UserRole.CONTRACTOR
                        ? 'border-fuchsia-500 bg-fuchsia-50'
                        : 'border-gray-300 bg-white'
                    } rounded-md shadow-sm text-sm font-medium ${
                      userType === UserRole.CONTRACTOR
                        ? 'text-fuchsia-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Contractor
                  </button>
                </div>
              </div>
              
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setUserType(UserRole.ALLY)}
                  className={`w-full inline-flex justify-center py-2 px-4 border ${
                    userType === UserRole.ALLY
                      ? 'border-fuchsia-500 bg-fuchsia-50'
                      : 'border-gray-300 bg-white'
                  } rounded-md shadow-sm text-sm font-medium ${
                    userType === UserRole.ALLY
                      ? 'text-fuchsia-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Ally (Architect, Designer, etc.)
                </button>
              </div>
              
              <p className="mt-2 text-sm text-gray-500">
                {ROLE_DESCRIPTIONS[userType]}
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="group relative w-1/2 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
              >
                Back
              </button>
              <button
                type="submit"
                className="group relative w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleRegister}>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Review Your Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Please verify that all details are correct before creating your account.
                </p>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{email}</dd>
                  </div>
                  <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{firstName} {lastName}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">User type</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{ROLE_DISPLAY_NAMES[userType]}</dd>
                  </div>
                  {phone && (
                    <div className="bg-white px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{phone}</dd>
                    </div>
                  )}
                  {company && (
                    <div className="bg-gray-50 px-4 py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Company</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{company}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handlePreviousStep}
                className="group relative w-1/2 flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-1/2 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-fuchsia-600 hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-500"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>

            <div className="text-sm text-center text-gray-600">
              By registering, you agree to our{' '}
              <a href="#" className="font-medium text-fuchsia-600 hover:text-fuchsia-500">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="font-medium text-fuchsia-600 hover:text-fuchsia-500">
                Privacy Policy
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
