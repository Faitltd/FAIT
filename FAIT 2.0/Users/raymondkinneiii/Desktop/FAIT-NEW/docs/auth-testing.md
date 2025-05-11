# Authentication Testing Documentation

This document provides information on how to test the authentication functionality in the FAIT Co-op application.

## Authentication Overview

The application uses Supabase for authentication. The authentication flow is implemented in the `DirectLoginPage` component, which handles user sign-in with email and password.

## Test Credentials

For testing purposes, the following demo accounts are available:

| Role | Email | Password |
|------|-------|----------|
| Client | client@itsfait.com | password123 |
| Contractor | service@itsfait.com | password123 |
| Admin | admin@itsfait.com | password123 |
| Ally | ally@itsfait.com | password123 |

## Testing Authentication Flow

### Manual Testing Steps

1. Navigate to the login page
2. Enter email and password for one of the test accounts
3. Click "Sign in"
4. Verify successful login (you should see a success message and be redirected to the dashboard)
5. Test error scenarios:
   - Invalid email format
   - Incorrect password
   - Non-existent user

### Using Demo Account Buttons

The login page includes buttons to automatically fill in credentials for demo accounts:
- Click on "Client Demo" to fill in client credentials
- Click on "Contractor Demo" to fill in contractor credentials
- Click on "Admin Demo" to fill in admin credentials
- Click on "Ally Demo" to fill in ally credentials

After clicking a demo button, click the "Sign in" button to complete the login process.

## Authentication API

The application uses the following Supabase authentication method:

```javascript
// Sign in with email and password
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

## Additional Authentication Methods

### Sign Up

To register a new user:

```javascript
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      // Optional user metadata
      first_name: 'John',
      last_name: 'Doe',
      role: 'client'
    }
  }
});
```

### Sign Out

To log out a user:

```javascript
const { error } = await supabase.auth.signOut();
```

### Reset Password

To reset a user's password:

```javascript
const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://example.com/reset-password'
});
```

### Get User

To get the current user:

```javascript
const { data: { user }, error } = await supabase.auth.getUser();
```

### Get Session

To get the current session:

```javascript
const { data: { session }, error } = await supabase.auth.getSession();
```

### Update User

To update a user's information:

```javascript
const { data, error } = await supabase.auth.updateUser({
  email: 'new.email@example.com',
  data: { 
    first_name: 'Jane',
    last_name: 'Smith'
  }
});
```

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user and set up listener
    const getCurrentUser = async () => {
      setLoading(true);
      
      // Get initial session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
      
      // Set up auth state listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user || null);
        }
      );

      // Clean up subscription
      return () => subscription.unsubscribe();
    };

    getCurrentUser();
  }, []);

  return {
    user,
    loading,
    signIn: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    signUp: (email, password, metadata) => 
      supabase.auth.signUp({ 
        email, 
        password, 
        options: { data: metadata } 
      }),
    signOut: () => supabase.auth.signOut(),
    resetPassword: (email) => 
      supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      }),
  };
}

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has required role
  const userRole = user.user_metadata?.role;
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
}

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DirectLoginPage from '../components/DirectLoginPage';
import { supabase } from '../lib/supabase';

// Mock Supabase
jest.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn()
    }
  }
}));

describe('DirectLoginPage', () => {
  test('should handle successful login', async () => {
    // Mock successful login
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: { email: 'test@example.com' } },
      error: null
    });
    
    render(<DirectLoginPage />);
    
    // Fill in form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Sign in'));
    
    // Check if login was called with correct params
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully logged in/i)).toBeInTheDocument();
    });
  });
  
  test('should handle login error', async () => {
    // Mock login error
    supabase.auth.signInWithPassword.mockResolvedValueOnce({
      data: null,
      error: { message: 'Invalid login credentials' }
    });
    
    render(<DirectLoginPage />);
    
    // Fill in form
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'wrong@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' }
    });
    
    // Submit form
    fireEvent.click(screen.getByText('Sign in'));
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Error: Invalid login credentials/i)).toBeInTheDocument();
    });
  });
});
