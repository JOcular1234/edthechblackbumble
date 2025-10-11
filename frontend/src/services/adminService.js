import { API_BASE_URL } from '../config/api';

// Get admin token from localStorage
const getAdminToken = () => {
  return localStorage.getItem('adminToken');
};

// Create headers with admin auth token
const getAdminHeaders = () => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Admin Service API calls
export const adminService = {
  // Order Management
  orders: {
    // Get all orders with filters
    getAll: async (filters = {}) => {
      try {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
          if (filters[key]) params.append(key, filters[key]);
        });

        const response = await fetch(`${API_BASE_URL}/api/orders/admin/all?${params}`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch orders');
        }

        return result;
      } catch (error) {
        console.error('Get all orders error:', error);
        throw error;
      }
    },

    // Update order status
    updateStatus: async (orderNumber, status, note) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/admin/${orderNumber}/status`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify({ status, note })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update order status');
        }

        return result;
      } catch (error) {
        console.error('Update order status error:', error);
        throw error;
      }
    },

    // Assign order to team member
    assign: async (orderNumber, assignedTo) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/admin/${orderNumber}/assign`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify({ assignedTo })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to assign order');
        }

        return result;
      } catch (error) {
        console.error('Assign order error:', error);
        throw error;
      }
    },

    // Get order statistics
    getStats: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/admin/stats`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch order stats');
        }

        return result;
      } catch (error) {
        console.error('Get order stats error:', error);
        throw error;
      }
    }
  },

  // User Management
  users: {
    // Get all users with pagination and filters
    getAll: async (page = 1, limit = 20, filters = {}) => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...filters
        });

        const response = await fetch(`${API_BASE_URL}/api/admin/users?${params}`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch users');
        }

        return result;
      } catch (error) {
        console.error('Get all users error:', error);
        throw error;
      }
    },

    // Get user by ID
    getById: async (userId) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch user');
        }

        return result;
      } catch (error) {
        console.error('Get user by ID error:', error);
        throw error;
      }
    },

    // Update user status (active, inactive, suspended)
    updateStatus: async (userId, status, reason = '') => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/status`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify({ status, reason })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update user status');
        }

        return result;
      } catch (error) {
        console.error('Update user status error:', error);
        throw error;
      }
    },

    // Update user profile (admin can edit user details)
    updateProfile: async (userId, profileData) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/profile`, {
          method: 'PUT',
          headers: getAdminHeaders(),
          body: JSON.stringify(profileData)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update user profile');
        }

        return result;
      } catch (error) {
        console.error('Update user profile error:', error);
        throw error;
      }
    },

    // Delete user account
    delete: async (userId, reason = '') => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: getAdminHeaders(),
          body: JSON.stringify({ reason })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to delete user');
        }

        return result;
      } catch (error) {
        console.error('Delete user error:', error);
        throw error;
      }
    },

    // Get user statistics
    getStats: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/stats`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch user stats');
        }

        return result;
      } catch (error) {
        console.error('Get user stats error:', error);
        throw error;
      }
    },

    // Get user orders
    getOrders: async (userId, page = 1, limit = 10) => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString()
        });

        const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/orders?${params}`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch user orders');
        }

        return result;
      } catch (error) {
        console.error('Get user orders error:', error);
        throw error;
      }
    },

    // Search users
    search: async (query, filters = {}) => {
      try {
        const params = new URLSearchParams({
          q: query,
          ...filters
        });

        const response = await fetch(`${API_BASE_URL}/api/admin/users/search?${params}`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to search users');
        }

        return result;
      } catch (error) {
        console.error('Search users error:', error);
        throw error;
      }
    },

    // Bulk actions
    bulkAction: async (userIds, action, data = {}) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users/bulk`, {
          method: 'POST',
          headers: getAdminHeaders(),
          body: JSON.stringify({ userIds, action, data })
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to perform bulk action');
        }

        return result;
      } catch (error) {
        console.error('Bulk action error:', error);
        throw error;
      }
    },

    // Export users data
    export: async (filters = {}, format = 'csv') => {
      try {
        const params = new URLSearchParams({
          format,
          ...filters
        });

        const response = await fetch(`${API_BASE_URL}/api/admin/users/export?${params}`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || 'Failed to export users');
        }

        // Return blob for file download
        return await response.blob();
      } catch (error) {
        console.error('Export users error:', error);
        throw error;
      }
    }
  },

  // Analytics (for future implementation)
  analytics: {
    getDashboardStats: async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/analytics/dashboard`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch dashboard stats');
        }

        return result;
      } catch (error) {
        console.error('Get dashboard stats error:', error);
        throw error;
      }
    },

    getOrderAnalytics: async (period = '30d') => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/analytics/orders?period=${period}`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch order analytics');
        }

        return result;
      } catch (error) {
        console.error('Get order analytics error:', error);
        throw error;
      }
    },

    getRevenueAnalytics: async (period = '30d') => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/analytics/revenue?period=${period}`, {
          method: 'GET',
          headers: getAdminHeaders()
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch revenue analytics');
        }

        return result;
      } catch (error) {
        console.error('Get revenue analytics error:', error);
        throw error;
      }
    }
  }
};
