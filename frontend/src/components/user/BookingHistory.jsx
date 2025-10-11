import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaEye, FaClock, FaCheckCircle, FaTimesCircle, 
  FaSpinner, FaExclamationTriangle, FaStar,
  FaDownload, FaComment, FaCalendar
} from 'react-icons/fa';
import { orderService } from '../../services/orderService';

const BookingHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' });
  const navigate = useNavigate();

  // Fetch user orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderService.getUserOrders(1, 50, filter === 'all' ? null : filter);
      
      if (result.success) {
        setOrders(result.data.orders);
        setError('');
      } else {
        setError(result.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel order
  const handleCancelOrder = async (orderNumber) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const reason = prompt('Please provide a reason for cancellation (optional):');
      const result = await orderService.cancelOrder(orderNumber, reason);
      
      if (result.success) {
        fetchOrders(); // Refresh orders
        alert('Order cancelled successfully');
      } else {
        alert(result.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Error cancelling order');
    }
  };

  // Submit feedback
  const handleSubmitFeedback = async () => {
    try {
      const result = await orderService.submitFeedback(
        feedbackOrder.orderNumber, 
        feedback.rating, 
        feedback.comment
      );
      
      if (result.success) {
        setShowFeedbackModal(false);
        setFeedbackOrder(null);
        setFeedback({ rating: 5, comment: '' });
        fetchOrders(); // Refresh orders
        alert('Feedback submitted successfully');
      } else {
        alert(result.message || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Submit feedback error:', error);
      alert('Error submitting feedback');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-indigo-100 text-indigo-800',
      under_review: 'bg-purple-100 text-purple-800',
      revision_requested: 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <FaClock className="w-4 h-4" />,
      confirmed: <FaCheckCircle className="w-4 h-4" />,
      in_progress: <FaSpinner className="w-4 h-4" />,
      under_review: <FaEye className="w-4 h-4" />,
      revision_requested: <FaExclamationTriangle className="w-4 h-4" />,
      completed: <FaCheckCircle className="w-4 h-4" />,
      cancelled: <FaTimesCircle className="w-4 h-4" />
    };
    return icons[status] || <FaClock className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getOrderStats = () => {
    const stats = {
      total: orders.length,
      active: orders.filter(o => ['pending', 'confirmed', 'in_progress', 'under_review'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'completed').length,
      totalSpent: orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0)
    };
    return stats;
  };

  const stats = getOrderStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-4xl text-gray-400 mb-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="mx-auto text-4xl text-red-400 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FaCalendar className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaCheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="w-5 h-5 text-purple-600 text-lg">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'pending', label: 'Pending' },
            { key: 'in_progress', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption.key
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all' 
              ? "You haven't placed any orders yet. Browse our services to get started!"
              : `No ${filter} orders found. Try a different filter.`
            }
          </p>
          <button
            onClick={() => navigate('/services')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium"
          >
            Browse Services
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {order.service?.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Order #{order.orderNumber}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>📅 {formatDate(order.createdAt)}</span>
                        <span>⏱️ {order.project?.timeline}</span>
                        <span>💰 {formatCurrency(order.pricing?.total || 0)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {order.project?.description}
                    </p>
                  </div>

                  {/* Progress Timeline */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <div className={`w-2 h-2 rounded-full ${
                        ['pending', 'confirmed', 'in_progress', 'under_review', 'completed'].includes(order.status) 
                          ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span>Ordered</span>
                      
                      <div className={`w-8 h-0.5 ${
                        ['confirmed', 'in_progress', 'under_review', 'completed'].includes(order.status) 
                          ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        ['confirmed', 'in_progress', 'under_review', 'completed'].includes(order.status) 
                          ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span>Confirmed</span>
                      
                      <div className={`w-8 h-0.5 ${
                        ['in_progress', 'under_review', 'completed'].includes(order.status) 
                          ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        ['in_progress', 'under_review', 'completed'].includes(order.status) 
                          ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span>In Progress</span>
                      
                      <div className={`w-8 h-0.5 ${
                        ['completed'].includes(order.status) 
                          ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <div className={`w-2 h-2 rounded-full ${
                        ['completed'].includes(order.status) 
                          ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span>Completed</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderModal(true);
                    }}
                    className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                  >
                    <FaEye className="mr-2" />
                    View Details
                  </button>

                  {order.status === 'completed' && !order.feedback && (
                    <button
                      onClick={() => {
                        setFeedbackOrder(order);
                        setShowFeedbackModal(true);
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                    >
                      <FaStar className="mr-2" />
                      Rate Service
                    </button>
                  )}

                  {['pending', 'confirmed'].includes(order.status) && (
                    <button
                      onClick={() => handleCancelOrder(order.orderNumber)}
                      className="flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                    >
                      <FaTimesCircle className="mr-2" />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && feedbackOrder && (
        <FeedbackModal
          order={feedbackOrder}
          feedback={feedback}
          setFeedback={setFeedback}
          onSubmit={handleSubmitFeedback}
          onClose={() => {
            setShowFeedbackModal(false);
            setFeedbackOrder(null);
            setFeedback({ rating: 5, comment: '' });
          }}
        />
      )}
    </div>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-3xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{order.service?.name}</h3>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Service Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Service Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Service:</span> {order.service?.name}</p>
                <p><span className="font-medium">Category:</span> {order.service?.category}</p>
                <p><span className="font-medium">Timeline:</span> {order.project?.timeline}</p>
                <p><span className="font-medium">Status:</span> 
                  <span className="ml-2 capitalize">{order.status.replace('_', ' ')}</span>
                </p>
              </div>
            </div>

            {/* Project Requirements */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Project Requirements</h4>
              <div className="text-sm">
                <p className="text-gray-700 bg-white p-3 rounded border">
                  {order.project?.description}
                </p>
                {order.project?.additionalRequirements && (
                  <div className="mt-3">
                    <p className="font-medium mb-1">Additional Requirements:</p>
                    <p className="text-gray-700 bg-white p-3 rounded border">
                      {order.project?.additionalRequirements}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Pricing */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Pricing Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.pricing?.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(order.pricing?.tax || 0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{formatCurrency(order.pricing?.total || 0)}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Timeline</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Ordered:</span> {formatDate(order.createdAt)}</p>
                {order.project?.startDate && (
                  <p><span className="font-medium">Started:</span> {formatDate(order.project.startDate)}</p>
                )}
                {order.project?.expectedDeliveryDate && (
                  <p><span className="font-medium">Expected Delivery:</span> {formatDate(order.project.expectedDeliveryDate)}</p>
                )}
                {order.project?.actualDeliveryDate && (
                  <p><span className="font-medium">Delivered:</span> {formatDate(order.project.actualDeliveryDate)}</p>
                )}
              </div>
            </div>

            {/* Feedback */}
            {order.feedback && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Your Feedback</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Rating:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <FaStar
                          key={star}
                          className={`w-4 h-4 ${
                            star <= order.feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {order.feedback.comment && (
                    <div>
                      <span className="font-medium">Comment:</span>
                      <p className="text-gray-700 mt-1">{order.feedback.comment}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Feedback Modal Component
const FeedbackModal = ({ order, feedback, setFeedback, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Rate Your Experience</h3>
          <p className="text-gray-600">{order.service?.name}</p>
        </div>

        <div className="space-y-4">
          {/* Rating */}
          <div className="text-center">
            <p className="font-medium text-gray-700 mb-3">How would you rate this service?</p>
            <div className="flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
                  className="focus:outline-none"
                >
                  <FaStar
                    className={`w-8 h-8 ${
                      star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments (Optional)
            </label>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience with this service..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingHistory;
