import React, { useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const DebugLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  
  // Add debug info function
  const addDebugInfo = (info) => {
    console.log(info);
    setDebugInfo(prev => prev + '\n' + info);
  };
  
  // Check if Supabase is initialized correctly
  useEffect(() => {
    addDebugInfo('Component mounted');
    
    // Test Supabase client
    if (supabase) {
      addDebugInfo('Supabase client exists');
      
      // Test auth methods
      if (supabase.auth) {
        addDebugInfo('Supabase auth exists');
        
        // Test signInWithPassword method
        if (typeof supabase.auth.signInWithPassword === 'function') {
          addDebugInfo('signInWithPassword is a function');
        } else {
          addDebugInfo('ERROR: signInWithPassword is NOT a function');
        }
      } else {
        addDebugInfo('ERROR: Supabase auth does NOT exist');
      }
    } else {
      addDebugInfo('ERROR: Supabase client does NOT exist');
    }
    
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          addDebugInfo(`Session check error: ${error.message}`);
        } else if (data.session) {
          addDebugInfo(`Active session found for: ${data.session.user.email}`);
          setUser(data.session.user);
        } else {
          addDebugInfo('No active session found');
        }
      } catch (err) {
        addDebugInfo(`Session check exception: ${err.message}`);
      }
    };
    
    checkSession();
  }, []);
  
  const handleLogin = async (e) => {
    e.preventDefault();
    addDebugInfo(`Login attempt with email: ${email}`);
    setLoading(true);
    setError(null);
    
    try {
      // Direct login with Supabase
      addDebugInfo('Calling supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        addDebugInfo(`Login error: ${error.message}`);
        throw error;
      }
      
      addDebugInfo(`Login successful for user: ${data.user.email}`);
      setUser(data.user);
    } catch (err) {
      addDebugInfo(`Login exception: ${err.message}`);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    addDebugInfo('Logout attempt');
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      addDebugInfo('Logout successful');
      setUser(null);
    } catch (err) {
      addDebugInfo(`Logout error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // If user is logged in, show user info and logout button
  if (user) {
    return (
      <div className="login-container">
        <h2>Logged In</h2>
        <p>Email: {user.email}</p>
        <button onClick={handleLogout} disabled={loading}>
          {loading ? 'Logging out...' : 'Logout'}
        </button>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Debug Information</h3>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '5px',
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {debugInfo}
          </pre>
        </div>
      </div>
    );
  }
  
  // Otherwise show login form
  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <h3>Debug Information</h3>
        <pre style={{ 
          backgroundColor: '#f5f5f5', 
          padding: '10px', 
          borderRadius: '5px',
          whiteSpace: 'pre-wrap',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {debugInfo}
        </pre>
      </div>
    </div>
  );
};

export default DebugLogin;