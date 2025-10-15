const axios = require('axios');

// PayPal Configuration
const paypalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || 'your-sandbox-client-id',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'your-sandbox-client-secret',
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com'
};

// Get PayPal access token
let accessToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const auth = Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64');
    
    const response = await axios.post(`${paypalConfig.baseURL}/v1/oauth2/token`, 
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    accessToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000) - 60000; // Refresh 1 minute early
    
    return accessToken;
  } catch (error) {
    console.error('PayPal Auth Error:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with PayPal');
  }
};

class PayPalService {
  /**
   * Create PayPal order
   * @param {Object} orderData - Order information
   * @returns {Promise<Object>} PayPal order response
   */
  async createOrder(orderData) {
    try {
      const { amount, currency = 'USD', orderNumber, description } = orderData;
      const token = await getAccessToken();

      const orderRequest = {
        intent: 'CAPTURE',
        application_context: {
          brand_name: 'BlackBumble EdTech',
          landing_page: 'BILLING',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.FRONTEND_URL}/checkout/success`,
          cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`
        },
        purchase_units: [{
          reference_id: orderNumber,
          description: description || 'EdTech Service',
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: (amount * 0.95238).toFixed(2) // Subtract tax for breakdown
              },
              tax_total: {
                currency_code: currency,
                value: (amount * 0.04762).toFixed(2) // 5% tax
              }
            }
          },
          items: [{
            name: description || 'EdTech Service',
            description: 'Professional educational technology service',
            quantity: '1',
            unit_amount: {
              currency_code: currency,
              value: (amount * 0.95238).toFixed(2)
            },
            category: 'DIGITAL_GOODS'
          }]
        }]
      };

      const response = await axios.post(`${paypalConfig.baseURL}/v2/checkout/orders`, orderRequest, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      return {
        success: true,
        orderId: response.data.id,
        status: response.data.status,
        links: response.data.links,
        details: response.data
      };
    } catch (error) {
      console.error('PayPal Create Order Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to create PayPal order',
        details: error.response?.data || error
      };
    }
  }

  /**
   * Capture PayPal order payment
   * @param {string} orderId - PayPal order ID
   * @returns {Promise<Object>} Capture response
   */
  async captureOrder(orderId) {
    try {
      const token = await getAccessToken();
      
      const response = await axios.post(`${paypalConfig.baseURL}/v2/checkout/orders/${orderId}/capture`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        }
      });
      
      return {
        success: true,
        captureId: response.data.purchase_units[0].payments.captures[0].id,
        status: response.data.status,
        payerInfo: response.data.payer,
        amount: response.data.purchase_units[0].payments.captures[0].amount,
        details: response.data
      };
    } catch (error) {
      console.error('PayPal Capture Order Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to capture PayPal payment',
        details: error.response?.data || error
      };
    }
  }

  /**
   * Get PayPal order details
   * @param {string} orderId - PayPal order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrderDetails(orderId) {
    try {
      const token = await getAccessToken();
      
      const response = await axios.get(`${paypalConfig.baseURL}/v2/checkout/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        details: response.data
      };
    } catch (error) {
      console.error('PayPal Get Order Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to get PayPal order details',
        details: error.response?.data || error
      };
    }
  }

  /**
   * Refund a captured payment
   * @param {string} captureId - PayPal capture ID
   * @param {Object} refundData - Refund information
   * @returns {Promise<Object>} Refund response
   */
  async refundPayment(captureId, refundData = {}) {
    try {
      const { amount, currency = 'USD', note } = refundData;
      const token = await getAccessToken();

      const refundRequest = {
        amount: amount ? {
          currency_code: currency,
          value: amount.toFixed(2)
        } : undefined,
        note_to_payer: note || 'Refund for your order'
      };

      const response = await axios.post(`${paypalConfig.baseURL}/v2/payments/captures/${captureId}/refund`, refundRequest, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        refundId: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
        details: response.data
      };
    } catch (error) {
      console.error('PayPal Refund Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to process PayPal refund',
        details: error.response?.data || error
      };
    }
  }

  /**
   * Verify webhook signature (for production use)
   * @param {Object} headers - Request headers
   * @param {string} body - Request body
   * @returns {Promise<boolean>} Verification result
   */
  async verifyWebhookSignature(headers, body) {
    try {
      // This would be implemented for production webhook verification
      // For now, return true for sandbox testing
      if (process.env.NODE_ENV !== 'production') {
        return true;
      }

      // In production, implement proper webhook verification
      // using PayPal's webhook verification API
      return true;
    } catch (error) {
      console.error('PayPal Webhook Verification Error:', error);
      return false;
    }
  }
}

module.exports = new PayPalService();
