import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DirectLoginPage from './components/DirectLoginPage';
import Dashboard from './components/Dashboard';
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
  
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Sign in to your account</h2>
      <p style={{ textAlign: 'center' }}>Or create a new account</p>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          marginBottom: '20px', 
          backgroundColor: message.includes('Error') ? '#ffebee' : '#e8f5e9',
          color: message.includes('Error') ? '#c62828' : '#2e7d32',
          borderRadius: '4px'
        }}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleDirectLogin}>
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
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="password"
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
          />
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <label style={{ display: 'flex', alignItems: 'center' }}>
            <input type="checkbox" style={{ marginRight: '5px' }} />
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
          >
            Ally Demo
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px 20px',
          backgroundColor: '#333',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ 
              backgroundColor: '#00bcd4', 
              color: 'white', 
              width: '40px', 
              height: '40px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '5px',
              marginRight: '10px',
              fontWeight: 'bold'
            }}>
              F
            </div>
            <h1 style={{ margin: 0 }}>FAIT Co-op</h1>
          </div>
          <nav>
            <a href="/" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Home</a>
            <a href="/about" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>About</a>
            <a href="/services" style={{ color: 'white', marginRight: '15px', textDecoration: 'none' }}>Services</a>
            <a href="/contact" style={{ color: 'white', textDecoration: 'none' }}>Contact</a>
          </nav>
        </header>
        
        <main style={{ padding: '20px' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<DirectLoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;