const express = require('express');
const router = express.Router();
const NotificationService = require('../services/notificationService');
const { authenticateUserToken } = require('../middleware/userAuth');

// @route   GET /api/notifications
// @desc    Get user notifications with pagination
// @access  Private (User)
router.get('/', authenticateUserToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      type,
      unreadOnly
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      type,
      unreadOnly: unreadOnly === 'true'
    };

    const result = await NotificationService.getUserNotifications(req.user._id, options);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count for user
// @access  Private (User)
router.get('/unread-count', authenticateUserToken, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user._id);

    res.json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private (User)
router.put('/:id/read', authenticateUserToken, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await NotificationService.markAsRead(id, req.user._id);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    
    if (error.message === 'Notification not found') {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read for user
// @access  Private (User)
router.put('/mark-all-read', authenticateUserToken, async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user._id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { 
        modifiedCount: result.modifiedCount 
      }
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while marking all notifications as read'
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private (User)
router.delete('/:id', authenticateUserToken, async (req, res) => {
  try {
    const { id } = req.params;

    await NotificationService.deleteNotification(id, req.user._id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    
    if (error.message === 'Notification not found') {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
});

// @route   GET /api/notifications/recent
// @desc    Get recent notifications (last 10)
// @access  Private (User)
router.get('/recent', authenticateUserToken, async (req, res) => {
  try {
    const result = await NotificationService.getUserNotifications(req.user._id, {
      page: 1,
      limit: 10
    });

    res.json({
      success: true,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount
      }
    });

  } catch (error) {
    console.error('Get recent notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent notifications'
    });
  }
});

// @route   POST /api/notifications/test
// @desc    Create test notification (development only)
// @access  Private (User)
router.post('/test', authenticateUserToken, async (req, res) => {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test notifications not allowed in production'
      });
    }

    const { title, message, type = 'order_created', priority = 'medium' } = req.body;

    const notification = await NotificationService.createCustomNotification(req.user._id, {
      orderId: null, // Test notification without order
      type,
      title: title || 'Test Notification',
      message: message || 'This is a test notification to verify the system is working.',
      priority,
      data: {
        orderNumber: 'TEST-001',
        serviceName: 'Test Service',
        actionUrl: '/user/dashboard'
      }
    });

    res.json({
      success: true,
      message: 'Test notification created',
      data: { notification }
    });

  } catch (error) {
    console.error('Create test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating test notification'
    });
  }
});

module.exports = router;
