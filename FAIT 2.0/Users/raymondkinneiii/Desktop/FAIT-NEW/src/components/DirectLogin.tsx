import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly in the component
const supabaseUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8';

// Create the client inside the component to ensure it's fresh
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DirectLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState&lt;string | null&gt;(null);
  const [user, setUser] = useState&lt;any | null&gt;(null);
  
  const handleLogin = async (e: React.FormEvent) =&gt; {
    e.preventDefault();
    console.log('Login form submitted with email:', email);
    setLoading(true);
    setError(null);
    
    try {
      // Direct login with Supabase
      console.log('Calling supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }
      
      console.log('Login successful, data:', data);
      setUser(data.user);
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () =&gt; {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };
  
  // If user is logged in, show user info and logout button
  if (user) {
    return (
      &lt;div className=&quot;login-container&quot;&gt;
        &lt;h2&gt;Logged In&lt;/h2&gt;
        &lt;p&gt;Email: {user.email}&lt;/p&gt;
        &lt;button onClick={handleLogout} disabled={loading}&gt;
          {loading ? 'Logging out...' : 'Logout'}
        &lt;/button&gt;
      &lt;/div&gt;
    );
  }
  
  // Otherwise show login form
  return (
    &lt;div className=&quot;login-container&quot;&gt;
      &lt;h2&gt;Direct Login&lt;/h2&gt;
      {error &amp;&amp; &lt;div className=&quot;error-message&quot;&gt;{error}&lt;/div&gt;}
      &lt;form onSubmit={handleLogin}&gt;
        &lt;div className=&quot;form-group&quot;&gt;
          &lt;label htmlFor=&quot;email&quot;&gt;Email&lt;/label&gt;
          &lt;input
            type=&quot;email&quot;
            id=&quot;email&quot;
            value={email}
            onChange={(e) =&gt; setEmail(e.target.value)}
            required
          /&gt;
        &lt;/div&gt;
        &lt;div className=&quot;form-group&quot;&gt;
          &lt;label htmlFor=&quot;password&quot;&gt;Password&lt;/label&gt;
          &lt;input
            type=&quot;password&quot;
            id=&quot;password&quot;
            value={password}
            onChange={(e) =&gt; setPassword(e.target.value)}
            required
          /&gt;
        &lt;/div&gt;
        &lt;button type=&quot;submit&quot; disabled={loading}&gt;
          {loading ? 'Logging in...' : 'Login'}
        &lt;/button&gt;
      &lt;/form&gt;
    &lt;/div&gt;
  );
};

export default DirectLogin;