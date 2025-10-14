import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  User, 
  Settings, 
  Bell, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Award, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  Eye,
  Edit3,
  Download,
  Star,
  Activity,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import BookingHistory from '../components/user/BookingHistory';
import NotificationCenter from '../components/user/NotificationCenter';
import { orderService } from '../services/orderService';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [orderStats, setOrderStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    totalSpent: 0,
    pending: 0,
    inProgress: 0,
    underReview: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const navigate = useNavigate();

  // Suppress unused variable warnings - these will be used for future features
  console.log('Upcoming deadlines:', upcomingDeadlines);
  console.log('Set upcoming deadlines function available:', setUpcomingDeadlines);

  useEffect(() => {
    fetchUserProfile();
    fetchOrderStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchOrderStats = async () => {
    try {
      const result = await orderService.getUserOrders(1, 100); // Get all orders for stats
      
      if (result.success) {
        const orders = result.data.orders;
        const stats = {
          total: orders.length,
          active: orders.filter(o => ['pending', 'confirmed', 'in_progress', 'under_review'].includes(o.status)).length,
          completed: orders.filter(o => o.status === 'completed').length,
          pending: orders.filter(o => o.status === 'pending').length,
          inProgress: orders.filter(o => o.status === 'in_progress').length,
          underReview: orders.filter(o => o.status === 'under_review').length,
          totalSpent: orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0)
        };
        setOrderStats(stats);
        
        // Set recent orders (last 5)
        setRecentOrders(orders.slice(0, 5));
        
        
        // Mock upcoming deadlines
        const deadlines = orders
          .filter(o => ['confirmed', 'in_progress'].includes(o.status))
          .slice(0, 3)
          .map(order => ({
            id: order._id,
            title: order.service?.name || 'Service',
            deadline: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within 7 days
            status: order.status,
            priority: Math.random() > 0.5 ? 'high' : 'medium'
          }));
        setUpcomingDeadlines(deadlines);
      }
    } catch (error) {
      console.error('Error fetching order stats:', error);
      // Don't show error for stats, just keep defaults
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        navigate('/user/signin');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/user-auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userRefreshToken');
        localStorage.removeItem('userData');
        navigate('/user/signin');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const _handleSignout = async () => { // This function will be used for logout functionality
    console.log('Signout function called'); // Suppress unused warning
    try {
      const token = localStorage.getItem('userToken');
      if (token) {
        await axios.post(`${API_BASE_URL}/api/user-auth/signout`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userRefreshToken');
      localStorage.removeItem('userData');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="mr-2">📧</span>
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to="/services"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Order
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 bg-white rounded-t-xl mt-6 shadow-sm">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3, color: 'indigo' },
              { id: 'bookings', name: 'My Orders', icon: BookOpen, color: 'blue' },
              { id: 'notifications', name: 'Notifications', icon: Bell, color: 'yellow' },
              { id: 'profile', name: 'Profile', icon: User, color: 'green' },
              { id: 'settings', name: 'Settings', icon: Settings, color: 'gray' }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm flex items-center space-x-2 rounded-t-lg transition-all duration-200`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Enhanced Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-b-xl shadow-sm min-h-[600px]">
          {activeTab === 'overview' && (
            <div className="p-6 space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!</h2>
                    <p className="text-indigo-100">Here's what's happening with your account today.</p>
                  </div>
                  <div className="hidden md:block">
                    <Zap className="w-16 h-16 text-indigo-200" />
                  </div>
                </div>
              </div>

              {/* Enhanced Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Active Orders</p>
                      <p className="text-2xl font-bold text-blue-900">{orderStats.active}</p>
                      <p className="text-blue-600 text-xs mt-1">In progress</p>
                    </div>
                    <div className="bg-blue-500 rounded-lg p-3">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Completed</p>
                      <p className="text-2xl font-bold text-green-900">{orderStats.completed}</p>
                      <p className="text-green-600 text-xs mt-1">Successfully finished</p>
                    </div>
                    <div className="bg-green-500 rounded-lg p-3">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Total Spent</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ${orderStats.totalSpent.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                      <p className="text-purple-600 text-xs mt-1">Lifetime value</p>
                    </div>
                    <div className="bg-purple-500 rounded-lg p-3">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 text-sm font-medium">Total Orders</p>
                      <p className="text-2xl font-bold text-orange-900">{orderStats.total}</p>
                      <p className="text-orange-600 text-xs mt-1">All time</p>
                    </div>
                    <div className="bg-orange-500 rounded-lg p-3">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to="/services"
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="bg-indigo-100 rounded-lg p-2 group-hover:bg-indigo-200 transition-colors">
                      <Plus className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Place New Order</p>
                      <p className="text-sm text-gray-500">Browse our services</p>
                    </div>
                  </Link>
                  
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="bg-blue-100 rounded-lg p-2 group-hover:bg-blue-200 transition-colors">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">View Orders</p>
                      <p className="text-sm text-gray-500">Track your progress</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200 group"
                  >
                    <div className="bg-green-100 rounded-lg p-2 group-hover:bg-green-200 transition-colors">
                      <Edit3 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-900">Edit Profile</p>
                      <p className="text-sm text-gray-500">Update your info</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-gray-600" />
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {recentOrders.length > 0 ? recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          order.status === 'completed' ? 'bg-green-500' :
                          order.status === 'in_progress' ? 'bg-blue-500' :
                          order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {order.service?.name || `Order #${order.orderNumber}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No orders yet</p>
                      <Link
                        to="/services"
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                      >
                        Place your first order
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        {activeTab === 'bookings' && (
          <BookingHistory />
        )}

        {activeTab === 'notifications' && (
          <NotificationCenter />
        )}

        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-white/20 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{user?.fullName}</h2>
                  <p className="text-indigo-100">{user?.email}</p>
                  <p className="text-indigo-200 text-sm">
                    Member since {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Profile Information
                </h3>
                <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <div className="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-gray-900">{user?.firstName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <div className="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-gray-900">{user?.lastName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                  <div className="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <div className="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-gray-900">{user?.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <div className="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-gray-900">
                      {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">Account Status</label>
                  <div className="mt-1 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{orderStats.total}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{orderStats.completed}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">${orderStats.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            {/* Account Settings */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-600" />
                Account Settings
              </h3>
              
              <div className="space-y-6">
                {/* Notification Preferences */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <Bell className="w-4 h-4 mr-2 text-gray-600" />
                    Notification Preferences
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Email Notifications</p>
                        <p className="text-sm text-gray-600">Receive updates about your orders via email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user?.preferences?.newsletter || false}
                          className="sr-only peer"
                          readOnly
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Push Notifications</p>
                        <p className="text-sm text-gray-600">Get notified about important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={user?.preferences?.notifications || false}
                          className="sr-only peer"
                          readOnly
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-gray-600" />
                    Security & Privacy
                  </h4>
                  <div className="space-y-3">
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                          <Edit3 className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Change Password</p>
                          <p className="text-sm text-gray-600">Update your account password</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                    
                    <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-lg p-2 mr-3">
                          <Download className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="text-left">
                          <p className="font-medium text-gray-900">Download Data</p>
                          <p className="text-sm text-gray-600">Export your account data</p>
                        </div>
                      </div>
                      <div className="text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-md font-semibold text-red-900 mb-4 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-600" />
                    Danger Zone
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">Delete Account</p>
                        <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                      </div>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-sm font-medium">
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
