const Notification = require('../models/Notification');
const Order = require('../models/Order');
const User = require('../models/User');

// Notification templates
const notificationTemplates = {
  order_created: {
    title: 'Order Received!',
    message: 'Thank you for your order! We have received your request for {serviceName} and our team will review it shortly.',
    priority: 'medium'
  },
  order_confirmed: {
    title: 'Order Confirmed',
    message: 'Great news! Your {serviceName} order has been confirmed and approved. Our team will start working on it soon.',
    priority: 'high'
  },
  order_assigned: {
    title: 'Team Assigned',
    message: 'Your {serviceName} project has been assigned to our expert team. Work will begin shortly!',
    priority: 'medium'
  },
  order_started: {
    title: 'Work Started',
    message: 'Exciting news! We have started working on your {serviceName} project. You can track progress in your dashboard.',
    priority: 'high'
  },
  order_under_review: {
    title: 'Ready for Review',
    message: 'Your {serviceName} project is complete and ready for your review. Please check your dashboard to view the deliverables.',
    priority: 'high'
  },
  order_revision_requested: {
    title: 'Revision Requested',
    message: 'We have received your feedback for the {serviceName} project. Our team is working on the requested revisions.',
    priority: 'medium'
  },
  order_completed: {
    title: 'Project Completed!',
    message: 'Congratulations! Your {serviceName} project has been completed successfully. Thank you for choosing our services!',
    priority: 'high'
  },
  order_cancelled: {
    title: 'Order Cancelled',
    message: 'Your {serviceName} order has been cancelled as requested. If you have any questions, please contact our support team.',
    priority: 'medium'
  },
  payment_processed: {
    title: 'Payment Confirmed',
    message: 'Your payment for {serviceName} has been processed successfully. Order total: ${amount}',
    priority: 'low'
  },
  feedback_requested: {
    title: 'Share Your Experience',
    message: 'How was your experience with our {serviceName}? We would love to hear your feedback and rating.',
    priority: 'low'
  }
};

class NotificationService {
  
  // Create a notification for order status change
  static async createOrderNotification(orderId, type, additionalData = {}) {
    try {
      // Get order details
      const order = await Order.findById(orderId)
        .populate('customer.userId', 'firstName lastName email preferences')
        .populate('service.productId', 'name category');
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      // Get notification template
      const template = notificationTemplates[type];
      if (!template) {
        throw new Error(`Unknown notification type: ${type}`);
      }
      
      // Prepare notification data
      const serviceName = order.service?.name || 'your service';
      const orderNumber = order.orderNumber;
      
      // Replace template variables
      const title = template.title.replace(/{(\w+)}/g, (match, key) => {
        const replacements = {
          serviceName,
          orderNumber,
          amount: order.pricing?.total || 0,
          ...additionalData
        };
        return replacements[key] || match;
      });
      
      const message = template.message.replace(/{(\w+)}/g, (match, key) => {
        const replacements = {
          serviceName,
          orderNumber,
          amount: order.pricing?.total || 0,
          ...additionalData
        };
        return replacements[key] || match;
      });
      
      // Create notification
      const notificationData = {
        userId: order.customer.userId._id,
        orderId: order._id,
        type,
        title,
        message,
        priority: template.priority,
        data: {
          orderNumber,
          serviceName,
          statusFrom: additionalData.statusFrom,
          statusTo: additionalData.statusTo,
          assignedTo: additionalData.assignedTo,
          actionUrl: `/user/dashboard?tab=bookings&order=${orderNumber}`,
          ...additionalData
        },
        channels: {
          inApp: true,
          email: order.customer.userId.preferences?.emailNotifications !== false,
          sms: false
        }
      };
      
      const notification = await Notification.createNotification(notificationData);
      
      // TODO: Send email notification if enabled
      if (notification.channels.email) {
        await this.sendEmailNotification(notification);
      }
      
      return notification;
      
    } catch (error) {
      console.error('Error creating order notification:', error);
      throw error;
    }
  }
  
  // Create a custom notification
  static async createCustomNotification(userId, notificationData) {
    try {
      const notification = await Notification.createNotification({
        userId,
        ...notificationData
      });
      
      return notification;
      
    } catch (error) {
      console.error('Error creating custom notification:', error);
      throw error;
    }
  }
  
  // Get user notifications with pagination
  static async getUserNotifications(userId, options = {}) {
    try {
      const notifications = await Notification.getUserNotifications(userId, options);
      const total = await Notification.countDocuments({ userId });
      const unreadCount = await Notification.getUnreadCount(userId);
      
      return {
        notifications,
        total,
        unreadCount,
        pagination: {
          current: options.page || 1,
          limit: options.limit || 20,
          pages: Math.ceil(total / (options.limit || 20))
        }
      };
      
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }
  
  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        _id: notificationId,
        userId
      });
      
      if (!notification) {
        throw new Error('Notification not found');
      }
      
      await notification.markAsRead();
      return notification;
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }
  
  // Mark all notifications as read for user
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.markAllAsRead(userId);
      return result;
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }
  
  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.findOneAndDelete({
        _id: notificationId,
        userId
      });
      
      if (!result) {
        throw new Error('Notification not found');
      }
      
      return result;
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
  
  // Get unread count for user
  static async getUnreadCount(userId) {
    try {
      return await Notification.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
  
  // Send email notification (placeholder for future implementation)
  static async sendEmailNotification(notification) {
    try {
      // TODO: Implement email sending logic
      // This could use services like SendGrid, Mailgun, or AWS SES
      console.log(`Email notification would be sent: ${notification.title}`);
      
      // Update email status
      notification.emailStatus.sent = true;
      notification.emailStatus.sentAt = new Date();
      await notification.save();
      
      return true;
      
    } catch (error) {
      console.error('Error sending email notification:', error);
      
      // Update email status with error
      if (notification) {
        notification.emailStatus.sent = false;
        notification.emailStatus.error = error.message;
        await notification.save();
      }
      
      return false;
    }
  }
  
  // Clean old notifications (utility method)
  static async cleanOldNotifications(daysOld = 30) {
    try {
      const result = await Notification.cleanOldNotifications(daysOld);
      console.log(`Cleaned ${result.deletedCount} old notifications`);
      return result;
      
    } catch (error) {
      console.error('Error cleaning old notifications:', error);
      throw error;
    }
  }
  
  // Notification triggers for different order events
  static async triggerOrderCreated(orderId) {
    return await this.createOrderNotification(orderId, 'order_created');
  }
  
  static async triggerOrderConfirmed(orderId) {
    return await this.createOrderNotification(orderId, 'order_confirmed');
  }
  
  static async triggerOrderAssigned(orderId, assignedTo) {
    return await this.createOrderNotification(orderId, 'order_assigned', {
      assignedTo
    });
  }
  
  static async triggerOrderStarted(orderId) {
    return await this.createOrderNotification(orderId, 'order_started');
  }
  
  static async triggerOrderUnderReview(orderId) {
    return await this.createOrderNotification(orderId, 'order_under_review');
  }
  
  static async triggerOrderRevisionRequested(orderId) {
    return await this.createOrderNotification(orderId, 'order_revision_requested');
  }
  
  static async triggerOrderCompleted(orderId) {
    return await this.createOrderNotification(orderId, 'order_completed');
  }
  
  static async triggerOrderCancelled(orderId) {
    return await this.createOrderNotification(orderId, 'order_cancelled');
  }
  
  static async triggerStatusChange(orderId, fromStatus, toStatus) {
    const typeMap = {
      'pending_to_confirmed': 'order_confirmed',
      'confirmed_to_in_progress': 'order_started',
      'in_progress_to_under_review': 'order_under_review',
      'under_review_to_revision_requested': 'order_revision_requested',
      'revision_requested_to_in_progress': 'order_started',
      'under_review_to_completed': 'order_completed',
      'any_to_cancelled': 'order_cancelled'
    };
    
    const key = `${fromStatus}_to_${toStatus}`;
    const type = typeMap[key] || typeMap['any_to_cancelled'];
    
    if (type) {
      return await this.createOrderNotification(orderId, type, {
        statusFrom: fromStatus,
        statusTo: toStatus
      });
    }
  }
}

module.exports = NotificationService;
