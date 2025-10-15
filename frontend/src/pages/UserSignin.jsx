import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useUserAuth } from '../contexts/UserAuthContext';
import DisabledAccount from '../components/user/DisabledAccount';

const UserSignin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [disabledUser, setDisabledUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { signin, isAuthenticated } = useUserAuth();

  // Redirect authenticated users away from signin page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/user/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await signin(formData.email, formData.password, rememberMe);
      
      if (result.success) {
        // Only redirect if user was actually redirected from a protected route
        // and the redirect is recent (within 5 minutes to prevent stale redirects)
        const redirectState = location.state;
        const hasValidRedirect = redirectState?.from?.pathname && 
                                redirectState?.message && 
                                redirectState?.timestamp;
        
        const isRecentRedirect = hasValidRedirect && 
                               (Date.now() - redirectState.timestamp) < 5 * 60 * 1000; // 5 minutes
        
        const shouldRedirect = hasValidRedirect && isRecentRedirect;
        const isRedirectingToCheckout = shouldRedirect && redirectState.from.pathname.includes('/checkout');
        
        const successMessage = isRedirectingToCheckout
          ? 'Signin successful! Redirecting to checkout...'
          : rememberMe 
            ? 'Signin successful! You\'ll stay signed in for 30 days.'
            : 'Signin successful!';
        
        setSuccess(successMessage);
        console.log('User signed in:', result.user);
        
        // Redirect to the page they came from only if it's a valid and recent redirect
        const redirectTo = shouldRedirect ? redirectState.from.pathname : '/user/dashboard';
        
        setTimeout(() => {
          navigate(redirectTo, { 
            state: shouldRedirect ? redirectState.from.state : undefined,
            replace: true 
          });
        }, 1000);
      } else if (result.disabled) {
        setDisabledUser({
          firstName: formData.email.split('@')[0],
          disabledReason: result.disabledData.reason,
          disabledAt: result.disabledData.disabledAt,
          _id: 'disabled-user'
        });
      } else {
        setError(result.message || 'Signin failed. Please try again.');
      }
    } catch (error) {
      console.error('Signin error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (disabledUser) {
    return <DisabledAccount user={disabledUser} />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Welcome Content */}
        <div className="text-gray-900 space-y-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Welcome
              <br />
              Back
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Don't have an account? <Link to="/user/signup" className="text-pink-600 hover:text-pink-500 font-medium">Sign Up</Link>
            </p>
          </div>
          <div className="w-16 h-1 bg-gray-200"></div>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Sign in to BlackBumble and continue enjoying our premium digital services, 
              professional design solutions, and expert development teams.
            </p>
            <Link 
              to="/services"
              className="inline-block bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Right Side - Signin Form */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-200">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
            {(() => {
              const redirectState = location.state;
              const hasValidRedirect = redirectState?.from?.pathname && 
                                      redirectState?.message && 
                                      redirectState?.timestamp;
              const isRecentRedirect = hasValidRedirect && 
                                     (Date.now() - redirectState.timestamp) < 5 * 60 * 1000;
              
              return hasValidRedirect && isRecentRedirect && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">{redirectState.message}</span>
                  </p>
                </div>
              );
            })()}
          </div>
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/user/forgot-password" className="font-medium text-pink-600 hover:text-pink-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-xl text-sm">
                {success}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 ${
                  loading
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>

            {/* Social Sign In Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2">Google</span>
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="ml-2">Facebook</span>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/user/signup" className="font-medium text-pink-600 hover:text-pink-500 transition-colors duration-300">
                  Sign up here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSignin;