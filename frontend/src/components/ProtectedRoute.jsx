import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, loading } = useUserAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    // Redirect to signin page with return url
    return <Navigate to="/user/signin" state={{ from: location }} replace />;
  }

  if (!requireAuth && isAuthenticated) {
    // If user is already authenticated and trying to access signin/signup, redirect to dashboard
    return <Navigate to="/user/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
