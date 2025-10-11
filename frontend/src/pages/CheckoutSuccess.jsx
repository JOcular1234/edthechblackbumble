
import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar, ArrowRight } from 'lucide-react';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get data from location state (passed from checkout)
  const { service, orderData, total } = location.state || {};
  
  // Generate order number
  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`;
  
  // If no data is available, show error state
  if (!service || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:py-12 ">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn't find your order details. This might happen if you navigated here directly.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/services"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Browse Services
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/user/dashboard"
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:py-12 mt-16">
      <div className="max-w-3xl mx-auto">
        {/* Success Icon & Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-1">Your order has been confirmed</p>
          <p className="text-sm text-gray-500">Order #{orderNumber}</p>
        </div>

        {/* Main Order Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Order Summary */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xl">🎨</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{service.subtitle}</p>
                <div className="flex items-baseline gap-2 mt-3">
                  <span className="text-2xl font-bold text-gray-900">
                    ${total.total.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">{service.billing}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="p-6 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="text-gray-900 font-medium">{orderData.firstName} {orderData.lastName}</p>
              </div>
              <div>
                <span className="text-gray-500">Email</span>
                <p className="text-gray-900 font-medium break-all">{orderData.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Phone</span>
                <p className="text-gray-900 font-medium">{orderData.phone}</p>
              </div>
              <div>
                <span className="text-gray-500">Timeline</span>
                <p className="text-gray-900 font-medium capitalize">{orderData.timeline}</p>
              </div>
            </div>
            {orderData.company && (
              <div className="mt-3 text-sm">
                <span className="text-gray-500">Company</span>
                <p className="text-gray-900 font-medium">{orderData.company}</p>
              </div>
            )}
            {orderData.projectDescription && (
              <div className="mt-4 text-sm">
                <span className="text-gray-500">Project Description</span>
                <p className="text-gray-900 font-medium mt-1 p-3 bg-white rounded-lg border border-gray-200">
                  {orderData.projectDescription}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Confirmation Email</h3>
                <p className="text-sm text-gray-600 mt-0.5">Check your inbox for order details and receipt</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Team Contact</h3>
                <p className="text-sm text-gray-600 mt-0.5">We'll reach out within 24 hours to start your project</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 text-sm">Project Delivery</h3>
                <p className="text-sm text-gray-600 mt-0.5">Completed work delivered per agreed timeline</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <Link
            to="/user/dashboard"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            View Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Support */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-2">Need help with your order?</p>
          <a
            href="mailto:support@edtech-blackbumble.com"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;