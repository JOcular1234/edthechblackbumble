import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaTimes, FaEye, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { notificationService, notificationUtils } from '../../services/notificationService';
import ConfirmationModal from '../modals/ConfirmationModal';

const NotificationBell = ({ className = '' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsResult, countResult] = await Promise.all([
        notificationService.getRecentNotifications(),
        notificationService.getUnreadCount()
      ]);

      if (notificationsResult.success) {
        setNotifications(notificationsResult.data.notifications);
      }

      if (countResult.success) {
        setUnreadCount(countResult.data.count);
      }

      setError('');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    
    try {
      await notificationService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, status: 'read', readAt: new Date() }
            : notif
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          status: 'read', 
          readAt: new Date() 
        }))
      );
      
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Show delete confirmation modal
  const handleDeleteNotification = (notification, event) => {
    event.stopPropagation();
    setNotificationToDelete(notification);
    setShowDeleteModal(true);
  };

  // Confirm delete notification
  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;
    
    try {
      setDeleting(true);
      await notificationService.deleteNotification(notificationToDelete._id);
      
      // Update local state
      setNotifications(prev => prev.filter(notif => notif._id !== notificationToDelete._id));
      
      // Update unread count if deleted notification was unread
      if (notificationToDelete.status === 'unread') {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setNotificationToDelete(null);
      
    } catch (error) {
      console.error('Error deleting notification:', error);
    } finally {
      setDeleting(false);
    }
  };

  // Cancel delete
  const cancelDeleteNotification = () => {
    setShowDeleteModal(false);
    setNotificationToDelete(null);
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      handleMarkAsRead(notification._id, { stopPropagation: () => {} });
    }
    
    // Navigate to action URL
    const actionUrl = notificationUtils.getActionUrl(notification);
    navigate(actionUrl);
    
    // Close dropdown
    setIsOpen(false);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full transition-colors"
        title="Notifications"
      >
        <FaBell className="w-6 h-6" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-5">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                  title="Mark all as read"
                >
                  <FaCheckDouble className="w-4 h-4 mr-1" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <p className="text-red-600 mb-2">{error}</p>
                <button
                  onClick={fetchNotifications}
                  className="text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <FaBell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No notifications yet</p>
                <p className="text-gray-500 text-sm mt-1">
                  You'll see updates about your orders here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      notification.status === 'unread' ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Icon */}
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          notificationUtils.getNotificationColor(notification.priority)
                        }`}>
                          {notificationUtils.getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium truncate ${
                              notification.status === 'unread' ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </p>
                            {notification.status === 'unread' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></div>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-500">
                              {notificationUtils.formatNotificationTime(notification.createdAt)}
                            </p>
                            
                            {notification.data?.orderNumber && (
                              <span className="text-xs text-indigo-600 bg-indigo-100 px-2 py-1 rounded">
                                #{notification.data.orderNumber}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {notification.status === 'unread' && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification._id, e)}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Mark as read"
                          >
                            <FaEye className="w-3 h-3" />
                          </button>
                        )}
                        
                        <button
                          onClick={(e) => handleDeleteNotification(notification, e)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Delete notification"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteNotification}
        onConfirm={confirmDeleteNotification}
        title="Delete Notification"
        message={
          notificationToDelete 
            ? `Are you sure you want to delete the notification "${notificationToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this notification?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleting}
        icon={<FaTrash className="w-6 h-6" />}
      />
    </div>
  );
};

export default NotificationBell;
