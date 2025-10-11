import { API_BASE_URL } from '../config/api';

// Get auth token from localStorage (supports both user and admin tokens)
const getAuthToken = () => {
  // Check for admin token first
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    return adminToken;
  }
  
  // Fall back to user token
  return localStorage.getItem('userToken');
};

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Notification Service API calls
export const notificationService = {
  // Get user notifications with pagination
  getNotifications: async (page = 1, limit = 20, filters = {}) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/api/notifications?${params}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch notifications');
      }

      return result;
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  },

  // Get recent notifications (for dropdown)
  getRecentNotifications: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/recent`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch recent notifications');
      }

      return result;
    } catch (error) {
      console.error('Get recent notifications error:', error);
      throw error;
    }
  },

  // Get unread notification count
  getUnreadCount: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch unread count');
      }

      return result;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to mark notification as read');
      }

      return result;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to mark all notifications as read');
      }

      return result;
    } catch (error) {
      console.error('Mark all as read error:', error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete notification');
      }

      return result;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },

  // Create test notification (development only)
  createTestNotification: async (title, message) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/test`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, message })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create test notification');
      }

      return result;
    } catch (error) {
      console.error('Create test notification error:', error);
      throw error;
    }
  }
};

// Notification utilities
export const notificationUtils = {
  // Get notification icon based on type
  getNotificationIcon: (type) => {
    const icons = {
      order_created: '📋',
      order_confirmed: '✅',
      order_assigned: '👥',
      order_started: '🚀',
      order_under_review: '👀',
      order_revision_requested: '🔄',
      order_completed: '🎉',
      order_cancelled: '❌',
      payment_processed: '💳',
      message_received: '💬',
      feedback_requested: '⭐'
    };
    return icons[type] || '🔔';
  },

  // Get notification color based on priority
  getNotificationColor: (priority) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.medium;
  },

  // Format notification time
  formatNotificationTime: (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return created.toLocaleDateString();
  },

  // Get notification action URL
  getActionUrl: (notification) => {
    if (notification.data?.actionUrl) {
      return notification.data.actionUrl;
    }
    
    // Default action based on type
    if (notification.orderId) {
      return `/user/dashboard?tab=bookings&order=${notification.data?.orderNumber}`;
    }
    
    return '/user/dashboard';
  },

  // Check if notification is recent (within last hour)
  isRecent: (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffInMinutes = Math.floor((now - created) / (1000 * 60));
    return diffInMinutes <= 60;
  }
};
