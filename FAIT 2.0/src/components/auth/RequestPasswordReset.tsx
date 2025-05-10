import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../contexts/AuthContext';

const RequestPasswordReset: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${frontendUrl}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        
        {success ? (
          <div className="success-message">
            <p>
              If an account exists with the email you provided, you will receive password reset instructions shortly.
            </p>
            <Link to="/login">Back to Login</Link>
          </div>
        ) : (
          <>
            {error && <div className="error-message">{error}</div>}
            
            <p>Enter your email address and we'll send you instructions to reset your password.</p>
            
            <form onSubmit={handleRequestReset}>
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
              
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
            
            <div className="auth-links">
              <p>
                Remember your password? <Link to="/login">Login</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RequestPasswordReset;