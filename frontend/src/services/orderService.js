import { API_BASE_URL } from '../config/api';

// Get user token from localStorage
const getAuthToken = () => {
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

// Order Service API calls
export const orderService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create order');
      }

      return result;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  // Get user's orders
  getUserOrders: async (page = 1, limit = 10, status = null) => {
    try {
      let url = `${API_BASE_URL}/api/orders/my-orders?page=${page}&limit=${limit}`;
      if (status) {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch orders');
      }

      return result;
    } catch (error) {
      console.error('Get user orders error:', error);
      throw error;
    }
  },

  // Get specific order by order number
  getOrder: async (orderNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch order');
      }

      return result;
    } catch (error) {
      console.error('Get order error:', error);
      throw error;
    }
  },

  // Cancel an order
  cancelOrder: async (orderNumber, reason) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/cancel`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to cancel order');
      }

      return result;
    } catch (error) {
      console.error('Cancel order error:', error);
      throw error;
    }
  },

  // Submit feedback for completed order
  submitFeedback: async (orderNumber, rating, comment) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderNumber}/feedback`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ rating, comment })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit feedback');
      }

      return result;
    } catch (error) {
      console.error('Submit feedback error:', error);
      throw error;
    }
  }
};

// Admin Order Service (for future admin functionality)
export const adminOrderService = {
  // Get all orders (admin only)
  getAllOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });

      const response = await fetch(`${API_BASE_URL}/api/orders/admin/all?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
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

  // Update order status (admin only)
  updateOrderStatus: async (orderNumber, status, note) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/admin/${orderNumber}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
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

  // Assign order to team member (admin only)
  assignOrder: async (orderNumber, assignedTo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/admin/${orderNumber}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
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
  }
};
