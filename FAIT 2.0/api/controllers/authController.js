const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // Use SUPABASE_KEY from .env
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Login user and get token
 * @route POST /api/auth/login
 * @access Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return res.status(401).json({ error: error.message });
    }
    
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { sub: data.user.id, email: data.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Generate refresh token
    const refreshToken = jwt.sign(
      { sub: data.user.id, tokenType: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        ...profile
      },
      token,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const register = async (req, res) => {
  try {
    const { email, password, full_name, user_type } = req.body;
    
    // Register with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          user_type
        }
      }
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          user_id: data.user.id,
          email,
          full_name,
          user_type: user_type || 'client'
        }
      ]);
      
    if (profileError) {
      console.error('Error creating profile:', profileError);
      return res.status(500).json({ error: 'Error creating user profile' });
    }
    
    // If user is a service agent, create onboarding record
    if (user_type === 'service_agent') {
      const { error: onboardingError } = await supabase
        .from('onboarding_progress')
        .insert([
          {
            service_agent_id: data.user.id,
            current_step: 'welcome',
            completed_steps: [],
            is_completed: false
          }
        ]);
        
      if (onboardingError) {
        console.error('Error creating onboarding record:', onboardingError);
      }
    }
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name,
        user_type
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Send password reset email
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Send password reset email with Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Reset password with token
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Update password in Supabase
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh-token
 * @access Public
 */
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    // Verify refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
    
    if (decoded.tokenType !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    
    // Get user from Supabase
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.sub)
      .single();
      
    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Generate new access token
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({ token });
  } catch (error) {
    console.error('Refresh token error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  refreshToken
};
