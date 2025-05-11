import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function GoogleLogin() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');

  // Check for existing session on load
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        setMessage(`Logged in as ${data.session.user.email}`);
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Attempting to login with Google');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Google login initiated:', data);
    } catch (error) {
      console.error('Google login error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
      console.log(`Attempting to login with email: ${email}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      setUser(data.user);
      setMessage(`Successfully logged in as ${data.user.email}`);
      console.log('Login successful:', data);
    } catch (error) {
      console.error('Login error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      setMessage('Logged out successfully');
    } catch (error) {
      setMessage(`Error logging out: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Supabase Auth Demo</h2>
      
      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
      
      {user ? (
        <div>
          <p>You are logged in as: {user.email}</p>
          <button onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : (
        <div>
          <form onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                required
              />
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login with Email'}
            </button>
          </form>
          
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <p>OR</p>
            <button 
              onClick={handleGoogleLogin} 
              disabled={loading}
              style={{ backgroundColor: '#4285F4', color: 'white' }}
            >
              {loading ? 'Logging in...' : 'Login with Google'}
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <h3>Debug Info</h3>
        <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
          Supabase URL: {supabaseUrl}
          {'\n'}
          Auth methods available: {Object.keys(supabase.auth).join(', ')}
          {'\n'}
          signInWithPassword is a function: {typeof supabase.auth.signInWithPassword === 'function' ? 'Yes' : 'No'}
          {'\n'}
          signInWithOAuth is a function: {typeof supabase.auth.signInWithOAuth === 'function' ? 'Yes' : 'No'}
        </pre>
      </div>
    </div>
  );
}

export default GoogleLogin;