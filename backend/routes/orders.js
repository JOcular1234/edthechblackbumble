const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const NotificationService = require('../services/notificationService');
const { authenticateUserToken } = require('../middleware/userAuth');
const { authenticateToken } = require('../middleware/auth');

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private (User)
router.post('/', authenticateUserToken, async (req, res) => {
  try {
    const {
      serviceId,
      customerInfo,
      projectDetails,
      pricing
    } = req.body;

    // Validate required fields
    if (!serviceId || !customerInfo || !projectDetails || !pricing) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Get service/product details
    const product = await Product.findById(serviceId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Generate unique order number
    const orderNumber = Order.generateOrderNumber();

    // Calculate timeline adjustment pricing
    let timelineAdjustment = 0;
    switch(projectDetails.timeline) {
      case 'rush':
        timelineAdjustment = 0.5; // 50% extra
        break;
      case 'fast':
        timelineAdjustment = 0.25; // 25% extra
        break;
      case 'flexible':
        timelineAdjustment = -0.1; // 10% discount
        break;
      default:
        timelineAdjustment = 0;
    }

    // Recalculate pricing with timeline adjustment
    const basePrice = parseFloat(product.price);
    const adjustedSubtotal = basePrice + (basePrice * timelineAdjustment);
    const tax = adjustedSubtotal * 0.1; // 10% tax
    const total = adjustedSubtotal + tax;

    // Create order object
    const orderData = {
      orderNumber,
      customer: {
        userId: req.user.id,
        firstName: customerInfo.firstName,
        lastName: customerInfo.lastName,
        email: customerInfo.email,
        phone: customerInfo.phone,
        company: customerInfo.company
      },
      service: {
        productId: product._id,
        name: product.name,
        subtitle: product.subtitle,
        category: product.category,
        features: product.features,
        image: product.image
      },
      project: {
        description: projectDetails.projectDescription,
        timeline: projectDetails.timeline,
        additionalRequirements: projectDetails.additionalRequirements
      },
      pricing: {
        subtotal: adjustedSubtotal,
        tax: tax,
        total: total,
        timelineAdjustment: timelineAdjustment
      },
      payment: {
        method: 'paypal', // Default to PayPal as per your requirement
        status: 'pending'
      },
      status: 'pending'
    };

    // Create the order
    const order = new Order(orderData);
    await order.save();

    // Create notification for new order (async, don't wait)
    try {
      await NotificationService.triggerOrderCreated(order._id);
    } catch (error) {
      console.error('Error creating order notification:', error);
      // Don't fail the order creation if notification fails
    }

    // Populate references for response
    await order.populate([
      { path: 'customer.userId', select: 'firstName lastName email' },
      { path: 'service.productId', select: 'name category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        orderNumber: order.orderNumber
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's orders
// @access  Private (User)
router.get('/my-orders', authenticateUserToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    const query = { 'customer.userId': req.user.id };
    if (status) {
      query.status = status;
    }

    // Execute query with pagination
    const orders = await Order.find(query)
      .populate('service.productId', 'name category image')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/:orderNumber
// @desc    Get order by order number
// @access  Private (User - own orders only)
router.get('/:orderNumber', authenticateUserToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await Order.findOne({ 
      orderNumber,
      'customer.userId': req.user.id 
    })
    .populate('customer.userId', 'firstName lastName email')
    .populate('service.productId', 'name category image features')
    .populate('assignedTo', 'firstName lastName email')
    .populate('notes.author')
    .populate('attachments.uploadedBy');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

// @route   PUT /api/orders/:orderNumber/cancel
// @desc    Cancel an order (user can only cancel pending orders)
// @access  Private (User)
router.put('/:orderNumber/cancel', authenticateUserToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ 
      orderNumber,
      'customer.userId': req.user.id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only allow cancellation of pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    await order.addStatusHistory('cancelled', reason || 'Cancelled by customer', req.user.id);

    // Create notification for cancellation (async, don't wait)
    try {
      await NotificationService.triggerOrderCancelled(order._id);
    } catch (error) {
      console.error('Error creating cancellation notification:', error);
      // Don't fail the cancellation if notification fails
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

// @route   POST /api/orders/:orderNumber/feedback
// @desc    Submit feedback and rating for completed order
// @access  Private (User)
router.post('/:orderNumber/feedback', authenticateUserToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const order = await Order.findOne({ 
      orderNumber,
      'customer.userId': req.user.id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only provide feedback for completed orders'
      });
    }

    // Update feedback
    order.feedback = {
      rating,
      comment,
      submittedAt: new Date()
    };

    await order.save();

    res.json({
      success: true,
      message: 'Feedback submitted successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting feedback'
    });
  }
});

// ADMIN ROUTES

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin only)
// @access  Private (Admin)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      assignedTo, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customer.firstName': { $regex: search, $options: 'i' } },
        { 'customer.lastName': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { 'service.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const orders = await Order.find(query)
      .populate('customer.userId', 'firstName lastName email')
      .populate('service.productId', 'name category')
      .populate('assignedTo', 'firstName lastName email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    // Get status counts for dashboard
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        },
        statusCounts: statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   PUT /api/orders/admin/:orderNumber/status
// @desc    Update order status (Admin only)
// @access  Private (Admin)
router.put('/admin/:orderNumber/status', authenticateToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'under_review', 'revision_requested', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const previousStatus = order.status;

    // Update status with history
    await order.addStatusHistory(status, note, req.admin.id);

    // Create notification for status change (async, don't wait)
    if (previousStatus !== status) {
      try {
        await NotificationService.triggerStatusChange(order._id, previousStatus, status);
      } catch (error) {
        console.error('Error creating status change notification:', error);
        // Don't fail the status update if notification fails
      }
    }

    // Set start date when moving to in_progress
    if (status === 'in_progress' && !order.project.startDate) {
      order.project.startDate = new Date();
      order.calculateDeliveryDate();
    }

    // Set delivery date when completed
    if (status === 'completed' && !order.project.actualDeliveryDate) {
      order.project.actualDeliveryDate = new Date();
    }

    await order.save();

    // Populate for response
    await order.populate([
      { path: 'customer.userId', select: 'firstName lastName email' },
      { path: 'assignedTo', select: 'firstName lastName email' }
    ]);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// @route   PUT /api/orders/admin/:orderNumber/assign
// @desc    Assign order to team member (Admin only)
// @access  Private (Admin)
router.put('/admin/:orderNumber/assign', authenticateToken, async (req, res) => {
  try {
    const { orderNumber } = req.params;
    const { assignedTo } = req.body;

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.assignedTo = assignedTo;
    await order.addStatusHistory(order.status, `Order assigned to team member`, req.admin.id);

    // Create notification for assignment (async, don't wait)
    try {
      await NotificationService.triggerOrderAssigned(order._id, assignedTo);
    } catch (error) {
      console.error('Error creating assignment notification:', error);
      // Don't fail the assignment if notification fails
    }

    await order.populate('assignedTo', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Order assigned successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while assigning order'
    });
  }
});

// @route   POST /api/orders/test-notification/:orderNumber
// @desc    Test notification creation (Development only)
// @access  Private (Admin)
router.post('/test-notification/:orderNumber', authenticateToken, async (req, res) => {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: 'Test notifications not allowed in production'
      });
    }

    const { orderNumber } = req.params;
    const { type = 'order_confirmed' } = req.body;

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create test notification
    let notification;
    switch (type) {
      case 'order_created':
        notification = await NotificationService.triggerOrderCreated(order._id);
        break;
      case 'order_confirmed':
        notification = await NotificationService.triggerOrderConfirmed(order._id);
        break;
      case 'order_started':
        notification = await NotificationService.triggerOrderStarted(order._id);
        break;
      case 'order_completed':
        notification = await NotificationService.triggerOrderCompleted(order._id);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid notification type'
        });
    }

    res.json({
      success: true,
      message: 'Test notification created',
      data: { notification }
    });

  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating test notification',
      error: error.message
    });
  }
});

module.exports = router;
