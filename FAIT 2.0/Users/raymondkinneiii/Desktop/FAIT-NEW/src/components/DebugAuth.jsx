import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8';

function DebugAuth() {
  const [logs, setLogs] = useState([]);
  const [supabaseClient, setSupabaseClient] = useState(null);
  const [authMethods, setAuthMethods] = useState([]);
  
  const addLog = (message) => {
    console.log(message);
    setLogs(prev => [`${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`, ...prev]);
  };
  
  useEffect(() => {
    addLog('Component mounted');
    
    try {
      // Create a new Supabase client
      addLog('Creating Supabase client...');
      const client = createClient(supabaseUrl, supabaseAnonKey);
      setSupabaseClient(client);
      
      // Log Supabase client details
      addLog('Supabase client created');
      
      if (client && client.auth) {
        addLog('Supabase auth object exists');
        const methods = Object.keys(client.auth);
        setAuthMethods(methods);
        addLog(`Auth methods: ${methods.join(', ')}`);
        
        // Check specific methods
        methods.forEach(method => {
          addLog(`Method ${method} is type: ${typeof client.auth[method]}`);
        });
      } else {
        addLog('ERROR: Supabase auth object does not exist');
      }
      
      // Test session
      client.auth.getSession().then(({ data, error }) => {
        if (error) {
          addLog(`Session error: ${error.message}`);
        } else {
          addLog(`Session check: ${data.session ? 'Active session' : 'No active session'}`);
        }
      });
    } catch (error) {
      addLog(`ERROR: ${error.message}`);
    }
  }, []);
  
  const testSignIn = async () => {
    if (!supabaseClient) {
      addLog('ERROR: Supabase client not initialized');
      return;
    }
    
    try {
      addLog('Testing signInWithPassword...');
      
      // Check if the method exists
      if (typeof supabaseClient.auth.signInWithPassword !== 'function') {
        addLog('ERROR: signInWithPassword is not a function');
        
        // Try to find similar methods
        const possibleMethods = authMethods.filter(m => 
          m.toLowerCase().includes('sign') || 
          m.toLowerCase().includes('login') || 
          m.toLowerCase().includes('password')
        );
        
        if (possibleMethods.length > 0) {
          addLog(`Similar methods found: ${possibleMethods.join(', ')}`);
        }
        
        return;
      }
      
      // Don't actually sign in, just check if the method exists
      addLog('signInWithPassword is a function');
    } catch (error) {
      addLog(`ERROR: ${error.message}`);
    }
  };
  
  const testGoogleSignIn = async () => {
    if (!supabaseClient) {
      addLog('ERROR: Supabase client not initialized');
      return;
    }
    
    try {
      addLog('Testing signInWithOAuth...');
      
      // Check if the method exists
      if (typeof supabaseClient.auth.signInWithOAuth !== 'function') {
        addLog('ERROR: signInWithOAuth is not a function');
        
        // Try to find similar methods
        const possibleMethods = authMethods.filter(m => 
          m.toLowerCase().includes('oauth') || 
          m.toLowerCase().includes('google') || 
          m.toLowerCase().includes('provider')
        );
        
        if (possibleMethods.length > 0) {
          addLog(`Similar methods found: ${possibleMethods.join(', ')}`);
        }
        
        return;
      }
      
      // Don't actually sign in, just check if the method exists
      addLog('signInWithOAuth is a function');
    } catch (error) {
      addLog(`ERROR: ${error.message}`);
    }
  };
  
  const checkSupabaseVersion = () => {
    try {
      // Try to get the version
      const version = supabaseClient?.supabaseVersion || 'Unknown';
      addLog(`Supabase client version: ${version}`);
      
      // Check package.json for @supabase/supabase-js version
      addLog('Note: Check your package.json for the exact @supabase/supabase-js version');
      addLog('Recommended version is 2.x or higher');
    } catch (error) {
      addLog(`ERROR: ${error.message}`);
    }
  };
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>Supabase Auth Debugger</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testSignIn}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Email Sign In
        </button>
        
        <button 
          onClick={testGoogleSignIn}
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          Test Google Sign In
        </button>
        
        <button 
          onClick={checkSupabaseVersion}
          style={{ padding: '8px 16px' }}
        >
          Check Supabase Version
        </button>
      </div>
      
      <div>
        <h3>Debug Logs</h3>
        <div 
          style={{ 
            height: '400px', 
            overflowY: 'scroll', 
            backgroundColor: '#f5f5f5', 
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        >
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Auth Methods</h3>
        <div 
          style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px',
            borderRadius: '5px',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}
        >
          {authMethods.map((method, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {method}: {supabaseClient ? typeof supabaseClient.auth[method] : 'unknown'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DebugAuth;