import React, { useEffect, useRef, useState } from 'react';
import { paypalService } from '../../services/paypalService';

const PayPalButton = ({ 
  amount, 
  currency = 'USD', 
  orderData, 
  description,
  onSuccess, 
  onError, 
  onCancel,
  disabled = false 
}) => {
  const paypalRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    // Load PayPal SDK
    const loadPayPalScript = () => {
      // Check if PayPal script is already loaded
      if (window.paypal) {
        setPaypalLoaded(true);
        setLoading(false);
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=${currency}&intent=capture&disable-funding=credit,card`;
      script.async = true;
      
      script.onload = () => {
        setPaypalLoaded(true);
        setLoading(false);
      };
      
      script.onerror = () => {
        setError('Failed to load PayPal SDK');
        setLoading(false);
      };

      document.body.appendChild(script);
    };

    loadPayPalScript();
  }, [currency]);

  useEffect(() => {
    if (paypalLoaded && !loading && !disabled && paypalRef.current) {
      // Clear any existing PayPal buttons
      paypalRef.current.innerHTML = '';

      // Render PayPal button
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'blue',
          shape: 'rect',
          label: 'paypal',
          height: 50
        },
        
        createOrder: async () => {
          try {
            // Create PayPal order directly without backend order
            const paypalOrderData = {
              amount: parseFloat(amount),
              currency,
              description,
              orderData // Pass the order data for reference
            };

            const result = await paypalService.createPayPalOrder(paypalOrderData);
            
            if (result.success) {
              return result.data.paypalOrderId;
            } else {
              throw new Error(result.message || 'Failed to create PayPal order');
            }
          } catch (error) {
            console.error('Create PayPal order error:', error);
            if (onError) onError(error);
            throw error;
          }
        },

        
        onApprove: async (data) => {
          try {
            // Capture payment directly with PayPal
            const captureData = {
              paypalOrderId: data.orderID
            };

            const result = await paypalService.capturePayPalOrder(captureData);
            
            if (result.success) {
              if (onSuccess) {
                onSuccess({
                  orderID: data.orderID,
                  payerID: data.payerID,
                  captureId: result.data.captureId,
                  details: result.data
                });
              }
            } else {
              throw new Error(result.message || 'Failed to capture payment');
            }
          } catch (error) {
            console.error('Capture payment error:', error);
            if (onError) onError(error);
          }
        },

        onCancel: (data) => {
          console.log('PayPal payment cancelled:', data);
          if (onCancel) onCancel(data);
        },

        onError: (err) => {
          console.error('PayPal error:', err);
          if (onError) onError(err);
        }
      }).render(paypalRef.current);
    }
  }, [paypalLoaded, loading, disabled, amount, currency, orderData, description, onSuccess, onError, onCancel]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading PayPal...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          <span className="text-red-700 text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (disabled) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <span className="text-gray-500">PayPal payment disabled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="paypal-button-container">
      <div ref={paypalRef}></div>
    </div>
  );
};

export default PayPalButton;
