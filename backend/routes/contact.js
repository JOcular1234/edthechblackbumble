const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Validation middleware
const validateContactForm = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  
  body('service')
    .optional()
    .isIn(['order-support', 'product-inquiry', 'returns', 'bulk-orders', 'partnerships', 'other', ''])
    .withMessage('Invalid service selection'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Message must be between 10 and 1000 characters')
];

// Rate limiting helper (simple in-memory store)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = 3; // 3 submissions per window

const checkRateLimit = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  // Clean old entries
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    const validTimestamps = timestamps.filter(time => time > windowStart);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, validTimestamps);
    }
  }
  
  // Check current IP
  const timestamps = rateLimitStore.get(clientIP) || [];
  const recentTimestamps = timestamps.filter(time => time > windowStart);
  
  if (recentTimestamps.length >= RATE_LIMIT_MAX) {
    return res.status(429).json({
      success: false,
      message: 'Too many contact form submissions. Please try again later.',
      retryAfter: Math.ceil((recentTimestamps[0] + RATE_LIMIT_WINDOW - now) / 1000)
    });
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  rateLimitStore.set(clientIP, recentTimestamps);
  
  next();
};

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', checkRateLimit, validateContactForm, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    const { name, email, service, message } = req.body;

    // Create new contact submission
    const contact = new Contact({
      name,
      email,
      service: service || '',
      message,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await contact.save();

    // Log the submission (you can add email notification here)
    console.log(`New contact form submission from ${name} (${email})`);

    res.status(201).json({
      success: true,
      message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      data: {
        id: contact._id,
        submittedAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Contact form submission error:', error);
    
    // Handle duplicate email within short timeframe
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A message from this email was recently submitted. Please wait before submitting again.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit your message. Please try again later.'
    });
  }
});

// @route   GET /api/contact/admin
// @desc    Get all contact submissions (admin only)
// @access  Private (Admin)
router.get('/admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    // Build query
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-ipAddress -userAgent'); // Exclude sensitive data

    const total = await Contact.countDocuments(query);
    const unreadCount = await Contact.getUnreadCount();

    res.json({
      success: true,
      data: {
        contacts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        stats: {
          unreadCount,
          totalCount: total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions'
    });
  }
});

// @route   PUT /api/contact/admin/:id/status
// @desc    Update contact status (admin only)
// @access  Private (Admin)
router.put('/admin/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['new', 'read', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: contact
    });

  } catch (error) {
    console.error('Error updating contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status'
    });
  }
});

// @route   POST /api/contact/admin/:id/reply
// @desc    Send reply to contact (admin only)
// @access  Private (Admin)
router.post('/admin/:id/reply', authenticateToken, requireAdmin, [
  body('replyMessage')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Reply message must be between 1 and 1000 characters'),
  body('adminName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Admin name must be between 1 and 100 characters')
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.path,
          message: error.msg
        }))
      });
    }

    const { replyMessage, adminName } = req.body;
    const contactId = req.params.id;

    // Find the contact
    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found'
      });
    }

    // Here you would typically send an email to the customer
    // For now, we'll just log the reply and update the contact status
    console.log(`Reply sent to ${contact.email} by ${adminName || req.admin.fullName}:`);
    console.log(`Subject: Re: Your inquiry - ${contact.service || 'General'}`);
    console.log(`Message: ${replyMessage}`);

    // You can integrate with email service here (nodemailer, SendGrid, etc.)
    // Example email content:
    const emailContent = {
      to: contact.email,
      subject: `Re: Your inquiry - ${contact.service ? contact.service.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Thank you for contacting us!</h2>
          
          <p>Dear ${contact.name},</p>
          
          <p>Thank you for reaching out to us. Here's our response to your inquiry:</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; white-space: pre-wrap;">${replyMessage}</p>
          </div>
          
          <p>If you have any further questions, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          ${adminName || req.admin.fullName}<br>
          Customer Support Team</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <div style="font-size: 12px; color: #6B7280;">
            <p><strong>Your original message:</strong></p>
            <p style="background-color: #F9FAFB; padding: 10px; border-radius: 4px; white-space: pre-wrap;">${contact.message}</p>
            <p>Submitted on: ${contact.createdAt.toLocaleDateString()}</p>
          </div>
        </div>
      `
    };

    // Update contact status to replied
    contact.status = 'replied';
    await contact.save();

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: {
        contactId: contact._id,
        repliedAt: new Date(),
        repliedBy: adminName || req.admin.fullName
      }
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reply'
    });
  }
});

// @route   GET /api/contact/admin/stats
// @desc    Get contact statistics (admin only)
// @access  Private (Admin)
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalCount = await Contact.countDocuments();
    const todayCount = await Contact.countDocuments({
      createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    const statusStats = {
      new: 0,
      read: 0,
      replied: 0,
      closed: 0
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        statusStats,
        totalCount,
        todayCount
      }
    });

  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics'
    });
  }
});

module.exports = router;
