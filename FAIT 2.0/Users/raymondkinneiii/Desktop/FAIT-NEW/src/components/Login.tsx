import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client directly in the component
const supabaseUrl = 'https://sjrehyseqqptdcnadvod.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcmVoeXNlcXFwdGRjbmFkdm9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MzMxMzcsImV4cCI6MjA1OTAwOTEzN30.fPyawZcgteRLZUH0MvtVSmNmZSdbxUOyN9lo6BDe8-8';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState&lt;string | null&gt;(null);
  
  // This is the function that was causing the error
  // Instead of using a 'login' function from context, we'll use supabase directly
  const handleLogin = async (e: React.FormEvent) => {
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
      // Redirect or update UI as needed
      window.location.href = '/dashboard'; // or use React Router navigation
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    &lt;div className=&quot;login-container&quot;&gt;
      &lt;h2&gt;Login&lt;/h2&gt;
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
      
      &lt;div style={{ marginTop: '20px' }}&gt;
        &lt;h3&gt;Debug Info&lt;/h3&gt;
        &lt;pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}&gt;
          Supabase URL: {supabaseUrl}
          {'\n'}
          signInWithPassword is a function: {typeof supabase.auth.signInWithPassword === 'function' ? 'Yes' : 'No'}
        &lt;/pre&gt;
      &lt;/div&gt;
    &lt;/div&gt;
  );
};

export default Login;