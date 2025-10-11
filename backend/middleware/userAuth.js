const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token for users
const authenticateUserToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if it's a user token
    if (decoded.type !== 'user') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token type' 
      });
    }
    
    // Find user and check if account is still active
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - user not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account has been deactivated' 
      });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been disabled. Please contact support for assistance.',
        data: {
          status: 'disabled',
          reason: user.disabledReason,
          disabledAt: user.disabledAt,
          supportEmail: 'support@edthech.com',
          supportPhone: '+1234567890'
        }
      });
    }

    if (user.isLocked()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is temporarily locked due to multiple failed login attempts' 
      });
    }

    // Add user info to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token has expired' 
      });
    }

    console.error('User auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

// Middleware to check user role
const requireUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.user.role !== 'user') {
    return res.status(403).json({ 
      success: false, 
      message: 'User access required' 
    });
  }

  next();
};

// Generate JWT token for users
const generateUserToken = (userId, role, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : '24h'; // 30 days if remember me, otherwise 24 hours
  
  return jwt.sign(
    { 
      userId, 
      role,
      type: 'user'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn,
      issuer: 'edtech-blackbumble',
      audience: 'user-app'
    }
  );
};

// Generate refresh token for users (longer expiry)
const generateUserRefreshToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? '90d' : '7d'; // 90 days if remember me, otherwise 7 days
  
  return jwt.sign(
    { 
      userId,
      type: 'user_refresh'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn,
      issuer: 'edtech-blackbumble',
      audience: 'user-app'
    }
  );
};

module.exports = {
  authenticateUserToken,
  requireUser,
  generateUserToken,
  generateUserRefreshToken
};
