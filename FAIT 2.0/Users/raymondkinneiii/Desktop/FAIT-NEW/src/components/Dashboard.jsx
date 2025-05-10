import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const getUser = async () => {
      setLoading(true);
      
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting user:', error);
        // Redirect to login if not authenticated
        window.location.href = '/';
        return;
      }
      
      if (data && data.user) {
        setUser(data.user);
      } else {
        // Redirect to login if not authenticated
        window.location.href = '/';
      }
      
      setLoading(false);
    };
    
    getUser();
  }, []);
  
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return;
    }
    
    // Redirect to login page
    window.location.href = '/';
  };
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading...</p>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1>Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#f44336', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          data-testid="logout-button"
        >
          Logout
        </button>
      </div>
      
      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '4px',
        marginBottom: '20px'
      }}>
        <h2>Welcome, {user.email}!</h2>
        <p>User ID: {user.id}</p>
        <p>Role: {user.user_metadata?.role || 'Not specified'}</p>
        <p>Last Sign In: {new Date(user.last_sign_in_at).toLocaleString()}</p>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
        gap: '20px'
      }}>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '4px'
        }}>
          <h3>Profile</h3>
          <p>View and edit your profile information</p>
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#2196f3', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            View Profile
          </button>
        </div>
        
        <div style={{ 
          backgroundColor: '#e8f5e9', 
          padding: '20px', 
          borderRadius: '4px'
        }}>
          <h3>Projects</h3>
          <p>Manage your projects and tasks</p>
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#4caf50', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            View Projects
          </button>
        </div>
        
        <div style={{ 
          backgroundColor: '#fff3e0', 
          padding: '20px', 
          borderRadius: '4px'
        }}>
          <h3>Messages</h3>
          <p>Check your messages and notifications</p>
          <button style={{ 
            padding: '8px 16px', 
            backgroundColor: '#ff9800', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            View Messages
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;