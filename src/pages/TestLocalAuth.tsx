import React, { useState, useEffect } from 'react';
import * as localAuth from '../lib/localAuth';

// Test credentials
const TEST_CREDENTIALS = [
  { email: 'admin@itsfait.com', password: 'admin123', type: 'Admin' },
  { email: 'client@itsfait.com', password: 'client123', type: 'Client' },
  { email: 'service@itsfait.com', password: 'service123', type: 'Service Agent' }
];

const TestLocalAuth: React.FC = () => {
  const [results, setResults] = useState<Array<{ type: string; success: boolean; message: string; details?: any }>>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Test function to sign in with credentials
  const testCredentials = async (email: string, password: string, type: string) => {
    try {
      const { data, error } = await localAuth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        return {
          type,
          success: false,
          message: `${type} login failed: ${error.message}`
        };
      }
      
      if (data?.user) {
        return {
          type,
          success: true,
          message: `${type} login successful!`,
          details: {
            id: data.user.id,
            email: data.user.email,
            userType: data.user.user_type,
            metadata: data.user.user_metadata
          }
        };
      } else {
        return {
          type,
          success: false,
          message: `${type} login failed: No user data returned`
        };
      }
    } catch (err) {
      return {
        type,
        success: false,
        message: `${type} login failed with exception: ${err instanceof Error ? err.message : String(err)}`
      };
    }
  };

  // Run all tests
  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    for (const cred of TEST_CREDENTIALS) {
      const result = await testCredentials(cred.email, cred.password, cred.type);
      setResults(prev => [...prev, result]);
      
      // Sign out after each test
      await localAuth.signOut();
    }
    
    setIsRunning(false);
  };

  // Run tests automatically on mount
  useEffect(() => {
    runTests();
  }, []);

  // Check if all tests passed
  const allPassed = results.length > 0 && results.every(r => r.success);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Local Authentication Test</h1>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-lg">
        <button
          onClick={runTests}
          disabled={isRunning}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? "Running Tests..." : "Run Tests Again"}
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          
          <div className={`p-4 mb-4 rounded-md ${allPassed ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`text-lg font-medium ${allPassed ? 'text-green-700' : 'text-red-700'}`}>
              {allPassed ? '✅ All tests passed!' : '❌ Some tests failed!'}
            </p>
          </div>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-md ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}
              >
                <h3 className="text-lg font-medium mb-2">
                  {result.success ? '✅' : '❌'} {result.type}
                </h3>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>
                
                {result.details && (
                  <div className="mt-2 p-3 bg-white rounded-md">
                    <p><strong>User ID:</strong> {result.details.id}</p>
                    <p><strong>Email:</strong> {result.details.email}</p>
                    <p><strong>User Type:</strong> {result.details.userType}</p>
                    <p><strong>Metadata:</strong></p>
                    <pre className="mt-1 p-2 bg-gray-100 rounded text-sm overflow-auto">
                      {JSON.stringify(result.details.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 rounded-md">
        <h2 className="text-xl font-bold mb-4">Test Credentials</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 text-left">Type</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Password</th>
              </tr>
            </thead>
            <tbody>
              {TEST_CREDENTIALS.map((cred, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4">{cred.type}</td>
                  <td className="py-2 px-4">{cred.email}</td>
                  <td className="py-2 px-4">{cred.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TestLocalAuth;
