const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Contact = require('../models/Contact');

// @route   GET /api/admin/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Fetching admin stats...');
    
    // Get current date for time-based queries
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    console.log('Date ranges:', {
      startOfCurrentMonth,
      startOfLastMonth,
      endOfLastMonth
    });

    // Get basic counts first
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalContacts = await Contact.countDocuments();

    console.log('Basic counts:', {
      totalProducts,
      totalOrders,
      totalUsers,
      totalContacts
    });

    // Get monthly counts
    const currentMonthOrders = await Order.countDocuments({ 
      createdAt: { $gte: startOfCurrentMonth } 
    });
    const lastMonthOrders = await Order.countDocuments({ 
      createdAt: { 
        $gte: startOfLastMonth, 
        $lte: endOfLastMonth 
      } 
    });

    const currentMonthUsers = await User.countDocuments({ 
      createdAt: { $gte: startOfCurrentMonth } 
    });
    const lastMonthUsers = await User.countDocuments({ 
      createdAt: { 
        $gte: startOfLastMonth, 
        $lte: endOfLastMonth 
      } 
    });

    const currentMonthProducts = await Product.countDocuments({ 
      createdAt: { $gte: startOfCurrentMonth } 
    });
    const lastMonthProducts = await Product.countDocuments({ 
      createdAt: { 
        $gte: startOfLastMonth, 
        $lte: endOfLastMonth 
      } 
    });

    console.log('Monthly counts:', {
      currentMonthOrders,
      lastMonthOrders,
      currentMonthUsers,
      lastMonthUsers,
      currentMonthProducts,
      lastMonthProducts
    });

    // Calculate revenue safely
    let totalRevenueAmount = 0;
    let currentMonthRevenueAmount = 0;
    let lastMonthRevenueAmount = 0;

    try {
      // Total revenue
      const totalRevenueResult = await Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'in_progress', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]);
      totalRevenueAmount = totalRevenueResult[0]?.total || 0;

      // Current month revenue
      const currentMonthRevenueResult = await Order.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'in_progress', 'completed'] },
            createdAt: { $gte: startOfCurrentMonth }
          } 
        },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]);
      currentMonthRevenueAmount = currentMonthRevenueResult[0]?.total || 0;

      // Last month revenue
      const lastMonthRevenueResult = await Order.aggregate([
        { 
          $match: { 
            status: { $in: ['confirmed', 'in_progress', 'completed'] },
            createdAt: { 
              $gte: startOfLastMonth, 
              $lte: endOfLastMonth 
            }
          } 
        },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ]);
      lastMonthRevenueAmount = lastMonthRevenueResult[0]?.total || 0;

      console.log('Revenue amounts:', {
        totalRevenueAmount,
        currentMonthRevenueAmount,
        lastMonthRevenueAmount
      });
    } catch (revenueError) {
      console.error('Error calculating revenue:', revenueError);
      // Revenue will remain 0 if there's an error
    }

    // Calculate percentage changes
    const calculatePercentageChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Calculate changes
    const productChange = calculatePercentageChange(currentMonthProducts, lastMonthProducts);
    const orderChange = calculatePercentageChange(currentMonthOrders, lastMonthOrders);
    const userChange = calculatePercentageChange(currentMonthUsers, lastMonthUsers);
    const revenueChange = calculatePercentageChange(currentMonthRevenueAmount, lastMonthRevenueAmount);

    console.log('Percentage changes:', {
      productChange,
      orderChange,
      userChange,
      revenueChange
    });

    const stats = {
      overview: {
        products: {
          total: totalProducts,
          change: productChange,
          changeType: productChange >= 0 ? 'increase' : 'decrease'
        },
        orders: {
          total: totalOrders,
          change: orderChange,
          changeType: orderChange >= 0 ? 'increase' : 'decrease'
        },
        users: {
          total: totalUsers,
          change: userChange,
          changeType: userChange >= 0 ? 'increase' : 'decrease'
        },
        revenue: {
          total: totalRevenueAmount,
          change: revenueChange,
          changeType: revenueChange >= 0 ? 'increase' : 'decrease'
        },
        contacts: {
          total: totalContacts
        }
      }
    };

    console.log('Final stats:', stats);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
});

// @route   GET /api/admin/stats/quick
// @desc    Get quick stats for dashboard header
// @access  Private (Admin)
router.get('/stats/quick', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, totalRevenue] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['confirmed', 'in_progress', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$pricing.total' } } }
      ])
    ]);

    const stats = {
      products: totalProducts,
      orders: totalOrders,
      users: totalUsers,
      revenue: totalRevenue[0]?.total || 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quick statistics'
    });
  }
});

module.exports = router;
