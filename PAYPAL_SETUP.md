# PayPal Integration Setup Guide

This guide will help you set up PayPal payment integration for the edtech-blackbumble project.

## Prerequisites

- PayPal Developer Account
- Node.js and npm installed
- MongoDB running
- Frontend and Backend servers running

## 1. PayPal Developer Account Setup

### Create PayPal Developer Account
1. Go to [PayPal Developer](https://developer.paypal.com/)
2. Sign in with your PayPal account or create a new one
3. Navigate to "My Apps & Credentials"

### Create Sandbox Application
1. Click "Create App"
2. Choose "Default Application" or create a custom name
3. Select "Sandbox" environment
4. Choose "Merchant" account type
5. Click "Create App"

### Get Credentials
After creating the app, you'll get:
- **Client ID**: Used for frontend PayPal SDK
- **Client Secret**: Used for backend PayPal API calls

## 2. Backend Configuration

### Install PayPal SDK
```bash
cd backend
npm install @paypal/paypal-server-sdk
```

### Environment Variables
Create or update your `.env` file in the backend directory:

```env
# Database
MONGO_URI=mongodb://localhost:27017/edtech-blackbumble

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# PayPal Configuration (Sandbox)
PAYPAL_CLIENT_ID=your-sandbox-client-id-here
PAYPAL_CLIENT_SECRET=your-sandbox-client-secret-here

# Other configurations...
PORT=5000
NODE_ENV=development
```

**Important**: Replace `your-sandbox-client-id-here` and `your-sandbox-client-secret-here` with your actual PayPal sandbox credentials.

## 3. Frontend Configuration

### Install PayPal Dependencies
The frontend uses the PayPal JavaScript SDK loaded dynamically. No additional npm packages are required for basic integration.

### Environment Variables
Update your `.env.local` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5000

# PayPal Configuration (Sandbox)
VITE_PAYPAL_CLIENT_ID=your-sandbox-client-id-here
```

**Important**: Use the same Client ID from your PayPal sandbox app.

## 4. PayPal Sandbox Testing

### Test Accounts
PayPal automatically creates test accounts for you:

1. Go to PayPal Developer Dashboard
2. Navigate to "Sandbox" > "Accounts"
3. You'll see test buyer and seller accounts

### Test Credit Cards
For sandbox testing, use these test credit card numbers:
- **Visa**: 4032035565960023
- **MasterCard**: 5425233430109903
- **American Express**: 374245455400001

**CVV**: Any 3-4 digit number
**Expiry**: Any future date

## 5. Testing the Integration

### Start the Servers
```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

### Test Payment Flow
1. Navigate to your application
2. Select a service and proceed to checkout
3. Fill in the order details
4. Click "Create Order & Proceed to Payment"
5. Use PayPal sandbox credentials or test cards
6. Complete the payment process

### Verify Payment
- Check the browser console for payment success logs
- Verify order status in your database
- Check PayPal sandbox dashboard for transaction details

## 6. API Endpoints

The following PayPal-related endpoints are available:

### Create PayPal Order
```
POST /api/payments/paypal/create-order
Authorization: Bearer {userToken}
Content-Type: application/json

{
  "orderNumber": "ORD-123456",
  "amount": 105.00,
  "currency": "USD",
  "description": "Web Development Service"
}
```

### Capture PayPal Payment
```
POST /api/payments/paypal/capture-order
Authorization: Bearer {userToken}
Content-Type: application/json

{
  "paypalOrderId": "paypal-order-id",
  "orderNumber": "ORD-123456"
}
```

### Get PayPal Order Details
```
GET /api/payments/paypal/order/{paypalOrderId}
Authorization: Bearer {userToken}
```

### Refund Payment (Admin)
```
POST /api/payments/paypal/refund
Authorization: Bearer {adminToken}
Content-Type: application/json

{
  "orderNumber": "ORD-123456",
  "amount": 105.00,
  "reason": "Customer requested refund"
}
```

## 7. Production Deployment

### PayPal Live Environment
1. Create a new app in PayPal Developer Dashboard
2. Select "Live" environment instead of "Sandbox"
3. Get live credentials (Client ID and Secret)

### Environment Variables for Production
```env
NODE_ENV=production
PAYPAL_CLIENT_ID=your-live-client-id
PAYPAL_CLIENT_SECRET=your-live-client-secret
FRONTEND_URL=https://your-production-domain.com
```

### Frontend Production Config
```env
VITE_PAYPAL_CLIENT_ID=your-live-client-id
VITE_API_URL=https://your-api-domain.com
```

## 8. Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use different credentials for development and production
- Rotate credentials regularly

### Webhook Verification
For production, implement proper webhook signature verification:
```javascript
// In paypalService.js
async verifyWebhookSignature(headers, body) {
  // Implement PayPal webhook signature verification
  // Use PayPal's webhook verification API
}
```

### HTTPS
- Always use HTTPS in production
- PayPal requires HTTPS for live transactions
- Update return and cancel URLs to use HTTPS

## 9. Troubleshooting

### Common Issues

**PayPal SDK not loading**
- Check VITE_PAYPAL_CLIENT_ID is set correctly
- Verify internet connection
- Check browser console for errors

**Order creation fails**
- Verify backend environment variables
- Check PayPal credentials are correct
- Ensure MongoDB is running and accessible

**Payment capture fails**
- Check order exists in database
- Verify PayPal order ID matches
- Check PayPal sandbox account has sufficient funds

**CORS errors**
- Verify FRONTEND_URL in backend .env
- Check CORS configuration in server.js

### Debug Mode
Enable PayPal SDK debug mode by adding to frontend:
```javascript
// In PayPalButton.jsx
script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&debug=true`;
```

## 10. Additional Features

### Webhooks (Optional)
Set up PayPal webhooks for real-time payment notifications:
1. In PayPal Developer Dashboard, go to your app
2. Add webhook URL: `https://your-api-domain.com/api/payments/paypal/webhook`
3. Select events to listen for
4. Implement webhook handler in backend

### Multiple Currencies
Update the PayPal button to support multiple currencies:
```javascript
// In PayPalButton.jsx
const supportedCurrencies = ['USD', 'EUR', 'GBP'];
```

### Subscription Payments
For recurring payments, use PayPal's subscription API:
- Create subscription plans
- Handle subscription lifecycle events
- Manage billing cycles

## Support

For issues with PayPal integration:
- Check PayPal Developer Documentation
- Use PayPal Developer Community forums
- Contact PayPal Developer Support

For application-specific issues:
- Check application logs
- Verify database connections
- Review API endpoint responses
