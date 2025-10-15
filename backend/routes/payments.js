const express = require('express');
const router = express.Router();
const paypalService = require('../services/paypalService');
const Order = require('../models/Order');
const { authenticateUserToken } = require('../middleware/userAuth');
const { body, validationResult } = require('express-validator');

/**
 * @route   POST /api/payments/paypal/create-direct-order
 * @desc    Create PayPal order directly (without existing database order)
 * @access  Private (User)
 */
router.post('/paypal/create-direct-order', 
  authenticateUserToken,
  [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { amount, currency, description } = req.body;

      // Create PayPal order directly
      const paypalOrder = await paypalService.createOrder({
        amount: amount,
        currency: currency || 'USD',
        orderNumber: `temp-${Date.now()}-${req.user.id}`, // Temporary reference
        description: description || 'EdTech Service Payment'
      });

      if (!paypalOrder.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create PayPal order',
          error: paypalOrder.error
        });
      }

      res.json({
        success: true,
        message: 'PayPal order created successfully',
        data: {
          paypalOrderId: paypalOrder.orderId,
          status: paypalOrder.status,
          links: paypalOrder.links
        }
      });

    } catch (error) {
      console.error('Create PayPal order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/payments/paypal/create-order
 * @desc    Create PayPal order (legacy method for existing orders)
 * @access  Private (User)
 */
router.post('/paypal/create-order', 
  authenticateUserToken,
  [
    body('orderNumber').notEmpty().withMessage('Order number is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { orderNumber, amount, currency, description } = req.body;

      // Verify order exists and belongs to user
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

      // Check if order is already paid
      if (order.payment.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Order is already paid'
        });
      }

      // Create PayPal order
      const paypalOrder = await paypalService.createOrder({
        amount: amount || order.pricing.total,
        currency: currency || order.pricing.currency,
        orderNumber,
        description: description || `${order.service.name} - ${order.service.category}`
      });

      if (!paypalOrder.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to create PayPal order',
          error: paypalOrder.error
        });
      }

      // Update order with PayPal order ID
      order.payment.transactionId = paypalOrder.orderId;
      order.payment.status = 'processing';
      await order.save();

      res.json({
        success: true,
        message: 'PayPal order created successfully',
        data: {
          paypalOrderId: paypalOrder.orderId,
          status: paypalOrder.status,
          links: paypalOrder.links
        }
      });

    } catch (error) {
      console.error('Create PayPal order error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/payments/paypal/capture-direct-order
 * @desc    Capture PayPal order payment directly
 * @access  Private (User)
 */
router.post('/paypal/capture-direct-order',
  authenticateUserToken,
  [
    body('paypalOrderId').notEmpty().withMessage('PayPal order ID is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { paypalOrderId } = req.body;

      // Capture PayPal payment directly
      const captureResult = await paypalService.captureOrder(paypalOrderId);

      if (!captureResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to capture PayPal payment',
          error: captureResult.error
        });
      }

      res.json({
        success: true,
        message: 'Payment captured successfully',
        data: {
          captureId: captureResult.captureId,
          status: captureResult.status,
          amount: captureResult.amount,
          payerInfo: captureResult.payerInfo
        }
      });

    } catch (error) {
      console.error('Capture PayPal payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/payments/paypal/capture-order
 * @desc    Capture PayPal order payment (legacy method for existing orders)
 * @access  Private (User)
 */
router.post('/paypal/capture-order',
  authenticateUserToken,
  [
    body('paypalOrderId').notEmpty().withMessage('PayPal order ID is required'),
    body('orderNumber').notEmpty().withMessage('Order number is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { paypalOrderId, orderNumber } = req.body;

      // Verify order exists and belongs to user
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

      // Verify PayPal order ID matches
      if (order.payment.transactionId !== paypalOrderId) {
        return res.status(400).json({
          success: false,
          message: 'PayPal order ID mismatch'
        });
      }

      // Capture PayPal payment
      const captureResult = await paypalService.captureOrder(paypalOrderId);

      if (!captureResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to capture PayPal payment',
          error: captureResult.error
        });
      }

      // Update order with payment completion
      order.payment.status = 'completed';
      order.payment.transactionId = captureResult.captureId;
      order.payment.paidAt = new Date();
      order.status = 'confirmed'; // Move order to confirmed status
      
      // Add status history
      order.statusHistory.push({
        status: 'confirmed',
        timestamp: new Date(),
        note: 'Payment completed via PayPal'
      });

      await order.save();

      res.json({
        success: true,
        message: 'Payment captured successfully',
        data: {
          captureId: captureResult.captureId,
          status: captureResult.status,
          amount: captureResult.amount,
          order: {
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.payment.status
          }
        }
      });

    } catch (error) {
      console.error('Capture PayPal payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   GET /api/payments/paypal/order/:paypalOrderId
 * @desc    Get PayPal order details
 * @access  Private (User)
 */
router.get('/paypal/order/:paypalOrderId',
  authenticateUserToken,
  async (req, res) => {
    try {
      const { paypalOrderId } = req.params;

      // Get PayPal order details
      const orderDetails = await paypalService.getOrderDetails(paypalOrderId);

      if (!orderDetails.success) {
        return res.status(404).json({
          success: false,
          message: 'PayPal order not found',
          error: orderDetails.error
        });
      }

      res.json({
        success: true,
        message: 'PayPal order details retrieved',
        data: orderDetails.details
      });

    } catch (error) {
      console.error('Get PayPal order details error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/payments/paypal/refund
 * @desc    Refund PayPal payment
 * @access  Private (Admin only - to be implemented)
 */
router.post('/paypal/refund',
  authenticateUserToken, // This should be adminAuth in production
  [
    body('orderNumber').notEmpty().withMessage('Order number is required'),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('reason').optional().isLength({ min: 1 }).withMessage('Reason is required')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { orderNumber, amount, reason } = req.body;

      // Find order
      const order = await Order.findOne({ orderNumber });

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Check if order is paid
      if (order.payment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Order is not paid yet'
        });
      }

      // Process refund
      const refundResult = await paypalService.refundPayment(
        order.payment.transactionId,
        {
          amount: amount || order.pricing.total,
          currency: order.pricing.currency,
          note: reason || 'Refund requested'
        }
      );

      if (!refundResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to process refund',
          error: refundResult.error
        });
      }

      // Update order
      order.payment.status = 'refunded';
      order.payment.refundedAt = new Date();
      order.payment.refundAmount = amount || order.pricing.total;
      order.status = 'cancelled';

      // Add status history
      order.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        note: `Refunded: ${reason || 'Refund requested'}`
      });

      await order.save();

      res.json({
        success: true,
        message: 'Refund processed successfully',
        data: {
          refundId: refundResult.refundId,
          status: refundResult.status,
          amount: refundResult.amount
        }
      });

    } catch (error) {
      console.error('PayPal refund error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

/**
 * @route   POST /api/payments/paypal/webhook
 * @desc    Handle PayPal webhooks
 * @access  Public (PayPal webhooks)
 */
router.post('/paypal/webhook', async (req, res) => {
  try {
    const webhookEvent = req.body;
    
    // Verify webhook signature (implement in production)
    const isValid = await paypalService.verifyWebhookSignature(req.headers, req.body);
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    // Handle different webhook events
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Handle successful payment
        console.log('Payment completed:', webhookEvent);
        break;
        
      case 'PAYMENT.CAPTURE.DENIED':
        // Handle denied payment
        console.log('Payment denied:', webhookEvent);
        break;
        
      default:
        console.log('Unhandled webhook event:', webhookEvent.event_type);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('PayPal webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

module.exports = router;
