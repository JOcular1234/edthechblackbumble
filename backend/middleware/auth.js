const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
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
    
    // Find admin and check if account is still active
    const admin = await Admin.findById(decoded.adminId).select('-password');
    
    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token - admin not found' 
      });
    }

    if (!admin.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account has been deactivated' 
      });
    }

    if (admin.isLocked()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Account is temporarily locked due to multiple failed login attempts' 
      });
    }

    // Add admin info to request object
    req.admin = admin;
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

    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
};

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.admin.role !== 'admin' && req.admin.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }

  next();
};

// Middleware to check super admin role
const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Super admin access required' 
    });
  }

  next();
};

// Generate JWT token
const generateToken = (adminId, role) => {
  return jwt.sign(
    { 
      adminId, 
      role,
      type: 'admin'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h',
      issuer: 'edtech-blackbumble',
      audience: 'admin-panel'
    }
  );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (adminId) => {
  return jwt.sign(
    { 
      adminId,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      issuer: 'edtech-blackbumble',
      audience: 'admin-panel'
    }
  );
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireSuperAdmin,
  generateToken,
  generateRefreshToken
};
