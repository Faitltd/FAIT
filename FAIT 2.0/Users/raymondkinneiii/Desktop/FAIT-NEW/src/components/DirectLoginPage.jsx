import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DirectLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleDirectLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      console.log(`Attempting to login with email: ${email}`);
      
      // Use Supabase directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      setMessage(`Successfully logged in as ${data.user.email}`);
      console.log('Login successful:', data);
      
      // Store auth in localStorage if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Store user role in localStorage for easy access
      if (data.user.user_metadata && data.user.user_metadata.role) {
        localStorage.setItem('userRole', data.user.user_metadata.role);
      }
      
      // Redirect after successful login
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      console.error('Login error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Check for remembered email on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
    
    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log('User already logged in:', data.session);
        window.location.href = '/dashboard';
      }
    };
    
    checkSession();
  }, []);
  
  // Demo account login handlers
  const loginAsClient = () => {
    setEmail('client@itsfait.com');
    setPassword('password123');
  };
  
  const loginAsContractor = () => {
    setEmail('service@itsfait.com');
    setPassword('password123');
  };
  
  const loginAsAdmin = () => {
    setEmail('admin@itsfait.com');
    setPassword('password123');
  };
  
  const loginAsAlly = () => {
    setEmail('ally@itsfait.com');
    setPassword('password123');
  };
  
  // Auto-login with demo account (for testing purposes)
  const autoLogin = async (demoType) => {
    let demoEmail, demoPassword;
    
    switch(demoType) {
      case 'client':
        demoEmail = 'client@itsfait.com';
        demoPassword = 'password123';
        break;
      case 'contractor':
        demoEmail = 'service@itsfait.com';
        demoPassword = 'password123';
        break;
      case 'admin':
        demoEmail = 'admin@itsfait.com';
        demoPassword = 'password123';
        break;
      case 'ally':
        demoEmail = 'ally@itsfait.com';
        demoPassword = 'password123';
        break;
      default:
        return;
    }
    
    setEmail(demoEmail);
    setPassword(demoPassword);
    
    // Submit form programmatically
    setTimeout(() => {
      const form = document.querySelector('[data-testid="login-form"]');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true }));
    }, 100);
  };
  
  // Check URL parameters for auto-login (useful for Cypress tests)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoLoginParam = params.get('autologin');
    
    if (autoLoginParam) {
      autoLogin(autoLoginParam);
    }
  }, []);
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }} data-testid="login-container">
      <h2 style={{ textAlign: 'center' }}>Sign in to your account</h2>
      <p style={{ textAlign: 'center' }}>Or create a new account</p>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
          color: message.includes('Error') ? '#c62828' : '#2e7d32',
          borderRadius: '4px'
        }} data-testid="message-container">
          {message}
        </div>
      )}
      
      <form onSubmit={handleDirectLogin} data-testid="login-form">
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            required
            data-testid="email-input"
            aria-label="Email"
          />
        </div>
        
        <div style={{ marginBottom: '15px', position: 'relative' }}>
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            required
            data-testid="password-input"
            aria-label="Password"
          />
          <button 
            type="button"
            onClick={togglePasswordVisibility}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666'
            }}
            data-testid="toggle-password-visibility"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              style={{ marginRight: '5px' }} 
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              data-testid="remember-me-checkbox"
            />
            Remember me
          </label>
          <a href="/forgot-password" style={{ color: '#2196f3', textDecoration: 'none' }}>
            Forgot your password?
          </a>
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '10px', 
            backgroundColor: '#2196f3', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
          data-testid="login-button"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ textAlign: 'center' }}>Demo Accounts</h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '10px'
        }}>
          <button 
            onClick={loginAsClient}
            style={{ 
              padding: '8px', 
              backgroundColor: '#f5f5f5', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            data-testid="client-demo-button"
          >
            Client Demo
          </button>
          <button 
            onClick={loginAsContractor}
            style={{ 
              padding: '8px', 
              backgroundColor: '#f5f5f5', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            data-testid="contractor-demo-button"
          >
            Contractor Demo
          </button>
          <button 
            onClick={loginAsAdmin}
            style={{ 
              padding: '8px', 
              backgroundColor: '#f5f5f5', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            data-testid="admin-demo-button"
          >
            Admin Demo
          </button>
          <button 
            onClick={loginAsAlly}
            style={{ 
              padding: '8px', 
              backgroundColor: '#f5f5f5', 
              border: '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            data-testid="ally-demo-button"
          >
            Ally Demo
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p>Don't have an account? <a href="/signup" style={{ color: '#2196f3', textDecoration: 'none' }}>Sign up</a></p>
      </div>
    </div>
  );
};

export default DirectLoginPage;