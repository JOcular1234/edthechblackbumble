const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply admin authentication to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filters
// @access  Private (Admin)
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = '',
      dateRange = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Add computed fields
    const usersWithStats = users.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      orderCount: 0, // TODO: Add actual order count from orders collection
      totalSpent: 0,  // TODO: Add actual total spent from orders collection
      lastLogin: user.lastLogin || null
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   GET /api/admin/users/stats
// @desc    Get user statistics
// @access  Private (Admin)
router.get('/stats', async (req, res) => {
  try {
    const [total, active, disabled] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'disabled' })
    ]);

    res.json({
      success: true,
      data: {
        total,
        active,
        disabled
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics'
    });
  }
});

// @route   GET /api/admin/users/search
// @desc    Search users
// @access  Private (Admin)
router.get('/search', async (req, res) => {
  try {
    const { q: query, status = '', limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    let searchQuery = {
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    };

    if (status) {
      searchQuery.status = status;
    }

    const users = await User.find(searchQuery)
      .select('-password -refreshTokens')
      .limit(parseInt(limit))
      .lean();

    const usersWithStats = users.map(user => ({
      ...user,
      fullName: `${user.firstName} ${user.lastName}`
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID
// @access  Private (Admin)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshTokens')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add computed fields
    const userWithStats = {
      ...user,
      fullName: `${user.firstName} ${user.lastName}`,
      orderCount: 0, // TODO: Add actual order count
      totalSpent: 0   // TODO: Add actual total spent
    };

    res.json({
      success: true,
      data: {
        user: userWithStats
      }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Enable or disable user account
// @access  Private (Admin)
router.put('/:id/status', async (req, res) => {
  try {
    const { status, reason = '' } = req.body;

    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active or disabled'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user status
    user.status = status;
    
    // If disabling, set disabled fields
    if (status === 'disabled') {
      user.disabledReason = reason || 'Account disabled by administrator';
      user.disabledAt = new Date();
    } else {
      // If enabling, clear disabled fields
      user.disabledReason = null;
      user.disabledAt = null;
    }
    
    user.statusHistory = user.statusHistory || [];
    user.statusHistory.push({
      status,
      reason,
      changedBy: req.admin._id,
      changedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      data: {
        user: {
          _id: user._id,
          status: user.status,
          fullName: `${user.firstName} ${user.lastName}`
        }
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// @route   PUT /api/admin/users/:id/profile
// @desc    Update user profile (admin can edit user details)
// @access  Private (Admin)
router.put('/:id/profile', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered to another user'
        });
      }
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (address) user.address = address;

    user.updatedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          address: user.address
        }
      }
    });

  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user profile'
    });
  }
});


// @route   GET /api/admin/users/:id/orders
// @desc    Get user's orders
// @access  Private (Admin)
router.get('/:id/orders', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // TODO: Implement when Order model is available
    // For now, return empty array
    res.json({
      success: true,
      data: {
        orders: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          total: 0,
          hasNext: false,
          hasPrev: false
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user orders'
    });
  }
});

// @route   POST /api/admin/users/bulk
// @desc    Bulk actions on users
// @access  Private (Admin)
router.post('/bulk', async (req, res) => {
  try {
    const { userIds, action, data = {} } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!['enable', 'disable'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be enable or disable'
      });
    }

    let result;

    switch (action) {
      case 'enable':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            status: 'active',
            disabledReason: null,
            disabledAt: null,
            $push: {
              statusHistory: {
                status: 'active',
                reason: data.reason || 'Bulk enable',
                changedBy: req.admin._id,
                changedAt: new Date()
              }
            }
          }
        );
        break;

      case 'disable':
        result = await User.updateMany(
          { _id: { $in: userIds } },
          { 
            status: 'disabled',
            disabledReason: data.reason || 'Bulk disable by administrator',
            disabledAt: new Date(),
            $push: {
              statusHistory: {
                status: 'disabled',
                reason: data.reason || 'Bulk disable',
                changedBy: req.admin._id,
                changedAt: new Date()
              }
            }
          }
        );
        break;
    }

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount || result.deletedCount,
        action
      }
    });

  } catch (error) {
    console.error('Bulk action error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while performing bulk action'
    });
  }
});

// @route   GET /api/admin/users/export
// @desc    Export users data
// @access  Private (Admin)
router.get('/export', async (req, res) => {
  try {
    const { format = 'csv', status = '', dateRange = '' } = req.query;

    // Build query (same as in GET /)
    let query = {};
    if (status) query.status = status;
    
    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .lean();

    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'ID,First Name,Last Name,Email,Phone,Status,Join Date,Last Login\n';
      const csvRows = users.map(user => {
        return [
          user._id,
          user.firstName || '',
          user.lastName || '',
          user.email || '',
          user.phone || '',
          user.status || '',
          user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
          user.lastLogin ? new Date(user.lastLogin).toISOString().split('T')[0] : ''
        ].join(',');
      }).join('\n');

      const csvContent = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=users-export-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvContent);
    } else {
      // Return JSON
      res.json({
        success: true,
        data: {
          users,
          exportedAt: new Date(),
          totalCount: users.length
        }
      });
    }

  } catch (error) {
    console.error('Export users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting users'
    });
  }
});

module.exports = router;
