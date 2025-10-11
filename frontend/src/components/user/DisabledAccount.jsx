import React from 'react';
import { AlertTriangle, Mail, Phone, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const DisabledAccount = ({ user }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full mt-20" >
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Account Disabled
          </h1>

          {/* Message */}
          <div className="text-gray-600 mb-6 space-y-3">
            <p className="text-lg">
              Hello <span className="font-semibold text-gray-900">{user?.firstName}</span>,
            </p>
            <p>
              Your account has been temporarily disabled due to a violation of our terms of service or community guidelines.
            </p>
            {user?.disabledReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-red-800">
                  <strong>Reason:</strong> {user.disabledReason}
                </p>
              </div>
            )}
          </div>

          {/* Support Contact */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              If you believe this is a mistake or would like to appeal this decision, please contact our support team:
            </p>
            
            <div className="space-y-3">
              <a
                href="mailto:support@edthech.com"
                className="flex items-center justify-center space-x-2 w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
              >
                <Mail className="w-4 h-4" />
                <span>Email Support</span>
              </a>
              
          
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 space-y-2">
            <p>
              <strong>Account ID:</strong> {user?._id?.slice(-8)}
            </p>
            {user?.disabledAt && (
              <p>
                <strong>Disabled on:</strong> {new Date(user.disabledAt).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Back to Home */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default DisabledAccount;
