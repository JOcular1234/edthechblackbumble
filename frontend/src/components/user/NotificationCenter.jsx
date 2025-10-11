import React, { useState, useEffect } from 'react';
import { 
  FaBell, FaEye, FaTrash, FaCheckDouble, FaFilter,
  FaSpinner, FaExclamationTriangle, FaSearch
} from 'react-icons/fa';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { notificationService, notificationUtils } from '../../services/notificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const result = await notificationService.getNotifications(page, 20, filters);
      
      if (result.success) {
        setNotifications(result.data.notifications);
        setPagination(result.data.pagination);
        setUnreadCount(result.data.unreadCount);
        setError('');
      } else {
        setError(result.message || 'Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, status: 'read', readAt: new Date() }
            : notif
        )
      );
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          status: 'read', 
          readAt: new Date() 
        }))
      );
      
      setUnreadCount(0);
      setSelectedNotifications([]);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }
    
    try {
      await notificationService.deleteNotification(notificationId);
      
      const deletedNotification = notifications.find(n => n._id === notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
      
      if (deletedNotification && deletedNotification.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
      
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Handle bulk actions
  const handleBulkMarkAsRead = async () => {
    try {
      await Promise.all(
        selectedNotifications.map(id => notificationService.markAsRead(id))
      );
      
      setNotifications(prev => 
        prev.map(notif => 
          selectedNotifications.includes(notif._id)
            ? { ...notif, status: 'read', readAt: new Date() }
            : notif
        )
      );
      
      const unreadSelected = notifications.filter(n => 
        selectedNotifications.includes(n._id) && n.status === 'unread'
      ).length;
      
      setUnreadCount(prev => Math.max(0, prev - unreadSelected));
      setSelectedNotifications([]);
      
    } catch (error) {
      console.error('Error marking selected notifications as read:', error);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notifications?`)) {
      return;
    }
    
    try {
      await Promise.all(
        selectedNotifications.map(id => notificationService.deleteNotification(id))
      );
      
      const deletedUnread = notifications.filter(n => 
        selectedNotifications.includes(n._id) && n.status === 'unread'
      ).length;
      
      setNotifications(prev => 
        prev.filter(notif => !selectedNotifications.includes(notif._id))
      );
      
      setUnreadCount(prev => Math.max(0, prev - deletedUnread));
      setSelectedNotifications([]);
      
    } catch (error) {
      console.error('Error deleting selected notifications:', error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (notification.status === 'unread') {
      handleMarkAsRead(notification._id);
    }
    
    const actionUrl = notificationUtils.getActionUrl(notification);
    navigate(actionUrl);
  };

  // Handle checkbox change
  const handleCheckboxChange = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  // Apply filters
  useEffect(() => {
    fetchNotifications(1);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load
  useEffect(() => {
    fetchNotifications();
    
    // Check for specific order from URL params
    const orderParam = searchParams.get('order');
    if (orderParam) {
      setFilters(prev => ({ ...prev, search: orderParam }));
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          <p className="text-gray-600 mt-1">
            Stay updated on your orders and account activity
            {unreadCount > 0 && (
              <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center"
          >
            <FaCheckDouble className="mr-2" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Types</option>
            <option value="order_created">Order Created</option>
            <option value="order_confirmed">Order Confirmed</option>
            <option value="order_started">Work Started</option>
            <option value="order_completed">Order Completed</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-indigo-800 font-medium">
              {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                <FaEye className="mr-1" />
                Mark as Read
              </button>
              <button
                onClick={handleBulkDelete}
                className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
              >
                <FaTrash className="mr-1" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600">Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <FaExclamationTriangle className="mx-auto text-4xl text-red-400 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchNotifications()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <FaBell className="mx-auto text-6xl text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {Object.values(filters).some(f => f) 
                ? "Try adjusting your filters to see more notifications."
                : "You'll see updates about your orders and account here."
              }
            </p>
          </div>
        ) : (
          <>
            {/* Select All Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedNotifications.length === notifications.length && notifications.length > 0}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  Select all notifications
                </span>
              </label>
            </div>

            {/* Notifications */}
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    notification.status === 'unread' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={() => handleCheckboxChange(notification._id)}
                      className="mt-1 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />

                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      notificationUtils.getNotificationColor(notification.priority)
                    }`}>
                      {notificationUtils.getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium truncate ${
                          notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                          {notification.status === 'unread' && (
                            <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full inline-block"></span>
                          )}
                        </h3>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {notification.data?.orderNumber && (
                            <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                              #{notification.data.orderNumber}
                            </span>
                          )}
                          
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDate(notification.createdAt)}
                        {notification.readAt && (
                          <span className="ml-2">• Read {formatDate(notification.readAt)}</span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {notification.status === 'unread' && (
                        <button
                          onClick={() => handleMarkAsRead(notification._id)}
                          className="text-gray-400 hover:text-blue-600 p-2"
                          title="Mark as read"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="text-gray-400 hover:text-red-600 p-2"
                        title="Delete notification"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => fetchNotifications(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchNotifications(pagination.current + 1)}
                    disabled={pagination.current === pagination.pages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{pagination.current}</span> of{' '}
                      <span className="font-medium">{pagination.pages}</span> ({pagination.total} total)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => fetchNotifications(page)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              page === pagination.current
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
