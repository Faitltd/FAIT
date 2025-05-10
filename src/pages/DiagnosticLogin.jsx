import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';;

/**
 * DiagnosticLogin - A minimal login page that logs every step of the authentication process
 * This page bypasses all existing authentication logic and directly uses Supabase
 */
const DiagnosticLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [envVars, setEnvVars] = useState({});

  // Add a log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] [${type}] ${message}`);
  };

  // Initialize Supabase client
  useEffect(() => {
    try {
      // Get environment variables
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      setEnvVars({
        VITE_SUPABASE_URL: supabaseUrl || 'Not set',
        VITE_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Present (hidden)' : 'Not set'
      });

      if (!supabaseUrl || !supabaseAnonKey) {
        addLog('Missing Supabase environment variables', 'error');
        return;
      }

      addLog(`Initializing Supabase client with URL: ${supabaseUrl}`);
      // Using singleton Supabase client;
      
      setSupabaseClient(client);
      addLog('Supabase client initialized successfully');

      // Test connection
      client.auth.getSession()
        .then(({ data, error }) => {
          if (error) {
            addLog(`Supabase connection test failed: ${error.message}`, 'error');
          } else {
            addLog('Supabase connection test successful');
            if (data.session) {
              addLog(`Already authenticated as: ${data.session.user.email}`);
            } else {
              addLog('No active session found');
            }
          }
        })
        .catch(err => {
          addLog(`Supabase connection test exception: ${err.message}`, 'error');
        });
    } catch (err) {
      addLog(`Error initializing Supabase client: ${err.message}`, 'error');
    }
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!supabaseClient) {
        addLog('Supabase client not initialized', 'error');
        return;
      }

      addLog(`Attempting login with email: ${email}`);
      
      // Sign in with password
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        addLog(`Login failed: ${error.message}`, 'error');
        throw error;
      }

      addLog('Login successful!');
      addLog(`User ID: ${data.user.id}`);
      addLog(`User email: ${data.user.email}`);
      addLog(`User metadata: ${JSON.stringify(data.user.user_metadata)}`);
      
      // Get user profile
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        addLog(`Error fetching profile: ${profileError.message}`, 'warning');
      } else if (profileData) {
        addLog(`Profile found: ${JSON.stringify(profileData)}`);
      } else {
        addLog('No profile found for user', 'warning');
      }
    } catch (err) {
      addLog(`Login exception: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      if (!supabaseClient) {
        addLog('Supabase client not initialized', 'error');
        return;
      }

      addLog('Signing out...');
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        addLog(`Sign out failed: ${error.message}`, 'error');
      } else {
        addLog('Sign out successful');
      }
    } catch (err) {
      addLog(`Sign out exception: ${err.message}`, 'error');
    }
  };

  // Clear logs
  const clearLogs = () => {
    setLogs([]);
    addLog('Logs cleared');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Diagnostic Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            This page bypasses all existing authentication logic and directly uses Supabase
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Form */}
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <button
                onClick={handleSignOut}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Test Credentials</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="rounded-md bg-gray-50 p-3 text-sm">
                  <div><strong>Admin:</strong> admin@itsfait.com / admin123</div>
                  <div><strong>Client:</strong> client@itsfait.com / client123</div>
                  <div><strong>Service Agent:</strong> service@itsfait.com / service123</div>
                </div>
              </div>
            </div>
          </div>

          {/* Logs and Environment Variables */}
          <div>
            {/* Environment Variables */}
            <div className="bg-white py-4 px-4 shadow sm:rounded-lg sm:px-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Environment Variables</h3>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-sm font-mono overflow-auto max-h-40">
                {Object.entries(envVars).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="text-gray-600">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>

            {/* Logs */}
            <div className="bg-white py-4 px-4 shadow sm:rounded-lg sm:px-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900">Logs</h3>
                <button
                  onClick={clearLogs}
                  className="text-sm text-indigo-600 hover:text-indigo-900"
                >
                  Clear logs
                </button>
              </div>
              <div className="bg-gray-50 p-3 rounded-md text-sm font-mono overflow-auto max-h-96">
                {logs.length === 0 ? (
                  <div className="text-gray-500">No logs yet</div>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`mb-1 ${
                        log.type === 'error' ? 'text-red-600' : 
                        log.type === 'warning' ? 'text-yellow-600' : 
                        'text-gray-800'
                      }`}
                    >
                      <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticLogin;
