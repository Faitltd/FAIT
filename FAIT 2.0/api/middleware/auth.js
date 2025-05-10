const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
      }
      
      // Get user from Supabase
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', decoded.sub)
        .single();
        
      if (error || !user) {
        return res.status(403).json({ error: 'Forbidden: User not found' });
      }
      
      // Attach user to request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Middleware to check if user is an admin
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

/**
 * Middleware to check if user is a service agent
 */
const requireServiceAgent = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'service_agent') {
    return res.status(403).json({ error: 'Forbidden: Service agent access required' });
  }
  next();
};

/**
 * Middleware to check if user is the owner of the resource or an admin
 */
const requireOwnerOrAdmin = (resourceField) => {
  return (req, res, next) => {
    const resourceId = req.params[resourceField];
    
    if (!req.user) {
      return res.status(403).json({ error: 'Forbidden: Authentication required' });
    }
    
    if (req.user.user_type === 'admin' || req.user.id === resourceId) {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource' });
    }
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireServiceAgent,
  requireOwnerOrAdmin
};
