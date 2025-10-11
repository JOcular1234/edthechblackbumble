import React, { useState, useEffect } from 'react';
import { 
  FaEye, FaEdit, FaUserCheck, FaClock, FaCheckCircle, 
  FaTimesCircle, FaSearch, FaFilter, FaDownload,
  FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import { API_BASE_URL } from '../../config/api';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0
  });
  const [statusCounts, setStatusCounts] = useState({});
  const [updating, setUpdating] = useState(false);

  // Fetch orders from API
  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...filters
      });

      const response = await fetch(`${API_BASE_URL}/api/orders/admin/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (result.success) {
        setOrders(result.data.orders);
        setPagination(result.data.pagination);
        setStatusCounts(result.data.statusCounts || {});
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

  // Update order status
  const updateOrderStatus = async (orderNumber, status, note = '') => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_BASE_URL}/api/orders/admin/${orderNumber}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, note })
      });

      const result = await response.json();

      if (result.success) {
        // Refresh orders list
        fetchOrders(pagination.current);
        // Update selected order if it's open
        if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
          setSelectedOrder(result.data.order);
        }
        return true;
      } else {
        alert(result.message || 'Failed to update order status');
        return false;
      }
    } catch (error) {
      console.error('Update status error:', error);
      alert('Error updating order status');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Assign order to team member
  const assignOrder = async (orderNumber, assignedTo) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(`${API_BASE_URL}/api/orders/admin/${orderNumber}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ assignedTo })
      });

      const result = await response.json();

      if (result.success) {
        fetchOrders(pagination.current);
        if (selectedOrder && selectedOrder.orderNumber === orderNumber) {
          setSelectedOrder(result.data.order);
        }
        return true;
      } else {
        alert(result.message || 'Failed to assign order');
        return false;
      }
    } catch (error) {
      console.error('Assign order error:', error);
      alert('Error assigning order');
      return false;
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
          <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
        </div>
        <button
          onClick={() => fetchOrders(pagination.current)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          <FaDownload className="mr-2" />
          Refresh
        </button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        {[
          { key: 'pending', label: 'Pending', color: 'yellow' },
          { key: 'confirmed', label: 'Confirmed', color: 'blue' },
          { key: 'in_progress', label: 'In Progress', color: 'indigo' },
          { key: 'under_review', label: 'Under Review', color: 'purple' },
          { key: 'revision_requested', label: 'Revisions', color: 'orange' },
          { key: 'completed', label: 'Completed', color: 'green' },
          { key: 'cancelled', label: 'Cancelled', color: 'red' }
        ].map((status) => (
          <div key={status.key} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{status.label}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statusCounts[status.key] || 0}
                </p>
              </div>
              <div className={`p-2 rounded-full bg-${status.color}-100`}>
                {getStatusIcon(status.key)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers, or order numbers..."
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
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">Under Review</option>
            <option value="revision_requested">Revision Requested</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters(prev => ({ ...prev, sortBy, sortOrder }));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="pricing.total-desc">Highest Value</option>
            <option value="pricing.total-asc">Lowest Value</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <FaSpinner className="animate-spin mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <FaExclamationTriangle className="mx-auto text-4xl text-red-400 mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchOrders()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.project?.timeline || 'Standard'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.customer?.firstName} {order.customer?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.customer?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.service?.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.service?.category}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.pricing?.total || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => {
                              const newStatus = prompt('Enter new status:', order.status);
                              if (newStatus && newStatus !== order.status) {
                                updateOrderStatus(order.orderNumber, newStatus);
                              }
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Update Status"
                            disabled={updating}
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              const assignTo = prompt('Enter admin ID to assign to:');
                              if (assignTo) {
                                assignOrder(order.orderNumber, assignTo);
                              }
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Assign"
                            disabled={updating}
                          >
                            <FaUserCheck />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => fetchOrders(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => fetchOrders(pagination.current + 1)}
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
                      <span className="font-medium">{pagination.pages}</span> ({pagination.total} total orders)
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => fetchOrders(page)}
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

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={updateOrderStatus}
          onAssign={assignOrder}
          updating={updating}
        />
      )}
    </div>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose, onStatusUpdate, updating }) => {
  const [newStatus, setNewStatus] = useState(order.status);
  const [statusNote, setStatusNote] = useState('');

  const handleStatusUpdate = async () => {
    if (newStatus !== order.status) {
      const success = await onStatusUpdate(order.orderNumber, newStatus, statusNote);
      if (success) {
        setStatusNote('');
      }
    }
  };

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
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Order Details</h3>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {order.customer?.firstName} {order.customer?.lastName}</p>
                <p><span className="font-medium">Email:</span> {order.customer?.email}</p>
                <p><span className="font-medium">Phone:</span> {order.customer?.phone}</p>
                {order.customer?.company && (
                  <p><span className="font-medium">Company:</span> {order.customer?.company}</p>
                )}
              </div>
            </div>

            {/* Service Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Service Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Service:</span> {order.service?.name}</p>
                <p><span className="font-medium">Category:</span> {order.service?.category}</p>
                <p><span className="font-medium">Timeline:</span> {order.project?.timeline}</p>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Project Requirements</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Description:</span></p>
                <p className="text-gray-700 bg-white p-3 rounded border">
                  {order.project?.description}
                </p>
                {order.project?.additionalRequirements && (
                  <>
                    <p><span className="font-medium">Additional Requirements:</span></p>
                    <p className="text-gray-700 bg-white p-3 rounded border">
                      {order.project?.additionalRequirements}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pricing Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Pricing</h4>
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

            {/* Status Management */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Status Management</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="under_review">Under Review</option>
                    <option value="revision_requested">Revision Requested</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Note (Optional)
                  </label>
                  <textarea
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    placeholder="Add a note about this status change..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={handleStatusUpdate}
                  disabled={updating || newStatus === order.status}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Order Timeline</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Created:</span> {formatDate(order.createdAt)}</p>
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
          </div>
        </div>

        {/* Status History */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="mt-8">
            <h4 className="font-semibold text-gray-900 mb-3">Status History</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-medium capitalize">{history.status.replace('_', ' ')}</span>
                      {history.note && <p className="text-gray-600 mt-1">{history.note}</p>}
                    </div>
                    <span className="text-gray-500">{formatDate(history.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 flex justify-end">
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

export default OrderManagement;
