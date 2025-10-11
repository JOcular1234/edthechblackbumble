const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // User who receives the notification
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Related order (if applicable)
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  
  // Notification type
  type: {
    type: String,
    required: true,
    enum: [
      'order_created',
      'order_confirmed', 
      'order_assigned',
      'order_started',
      'order_under_review',
      'order_revision_requested',
      'order_completed',
      'order_cancelled',
      'payment_processed',
      'message_received',
      'feedback_requested'
    ],
    index: true
  },
  
  // Notification content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  // Notification status
  status: {
    type: String,
    enum: ['unread', 'read'],
    default: 'unread',
    index: true
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Additional data (flexible object for extra info)
  data: {
    orderNumber: String,
    serviceName: String,
    statusFrom: String,
    statusTo: String,
    assignedTo: String,
    estimatedCompletion: Date,
    actionUrl: String, // URL to navigate to
    metadata: mongoose.Schema.Types.Mixed
  },
  
  // Delivery channels
  channels: {
    inApp: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    sms: {
      type: Boolean,
      default: false
    }
  },
  
  // Email delivery status
  emailStatus: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    error: String
  },
  
  // Read tracking
  readAt: Date,
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, createdAt: -1 });
notificationSchema.index({ orderId: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt;
});

// Virtual for formatted time
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffInMinutes = Math.floor((now - created) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return created.toLocaleDateString();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.status = 'read';
  this.readAt = new Date();
  return this.save();
};

// Instance method to mark as unread
notificationSchema.methods.markAsUnread = function() {
  this.status = 'unread';
  this.readAt = undefined;
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = new this(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to get user notifications with pagination
notificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = null,
    type = null,
    unreadOnly = false
  } = options;
  
  const query = { userId };
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (unreadOnly) query.status = 'unread';
  
  return this.find(query)
    .populate('orderId', 'orderNumber service status')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ userId, status: 'unread' });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { userId, status: 'unread' },
    { 
      status: 'read', 
      readAt: new Date(),
      updatedAt: new Date()
    }
  );
};

// Static method to clean old notifications
notificationSchema.statics.cleanOldNotifications = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffDate },
    status: 'read'
  });
};

// Pre-save middleware to update timestamps
notificationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
