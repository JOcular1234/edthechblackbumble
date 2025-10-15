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

export const paypalService = {
  /**
   * Create PayPal order (legacy method for existing orders)
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} PayPal order response
   */
  createOrder: async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/paypal/create-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create PayPal order');
      }

      return result;
    } catch (error) {
      console.error('Create PayPal order error:', error);
      throw error;
    }
  },

  /**
   * Create PayPal order directly (new method)
   * @param {Object} paypalOrderData - PayPal order information
   * @returns {Promise<Object>} PayPal order response
   */
  createPayPalOrder: async (paypalOrderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/paypal/create-direct-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(paypalOrderData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create PayPal order');
      }

      return result;
    } catch (error) {
      console.error('Create PayPal order error:', error);
      throw error;
    }
  },

  /**
   * Capture PayPal order payment (legacy method)
   * @param {Object} captureData - Capture information
   * @returns {Promise<Object>} Capture response
   */
  captureOrder: async (captureData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/paypal/capture-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(captureData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to capture PayPal payment');
      }

      return result;
    } catch (error) {
      console.error('Capture PayPal payment error:', error);
      throw error;
    }
  },

  /**
   * Capture PayPal order payment directly (new method)
   * @param {Object} captureData - Capture information
   * @returns {Promise<Object>} Capture response
   */
  capturePayPalOrder: async (captureData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/paypal/capture-direct-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(captureData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to capture PayPal payment');
      }

      return result;
    } catch (error) {
      console.error('Capture PayPal payment error:', error);
      throw error;
    }
  },

  /**
   * Get PayPal order details
   * @param {string} paypalOrderId - PayPal order ID
   * @returns {Promise<Object>} Order details
   */
  getOrderDetails: async (paypalOrderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/paypal/order/${paypalOrderId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to get PayPal order details');
      }

      return result;
    } catch (error) {
      console.error('Get PayPal order details error:', error);
      throw error;
    }
  }
};
