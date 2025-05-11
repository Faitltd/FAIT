import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState&lt;string | null&gt;(null);
  
  // Get auth context with debugging
  const authContext = useContext(AuthContext);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login form submitted');
    setLoading(true);
    setError(null);
    
    try {
      console.log('Auth context:', authContext);
      console.log('Login function type:', typeof authContext.login);
      
      // Call the login function
      await authContext.login(email, password);
      console.log('Login successful');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
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
    &lt;/div&gt;
  );
};

export default Login;import React from 'react';
import Login from './components/Login';

const App: React.FC = () => {
  return (
    <div className="app">
      <Login />
    </div>
  );
};

export default App;