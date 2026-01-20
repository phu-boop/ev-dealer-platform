import api from './api';

/**
 * Admin Order Service
 * API methods for admin order management
 */

// Get all orders with pagination and filters
export const getOrdersAdmin = async (params) => {
  try {
    // Backend endpoint for Admin/Staff to list B2B orders
    const response = await api.get('/api/v1/sales-orders/b2b', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get order detail by ID
export const getOrderDetailAdmin = async (orderId) => {
  try {
    const response = await api.get(`/api/v1/sales-orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

// Update order status (Generic placeholder, may need adjustment based on specific actions like ship/approve)
export const updateOrderStatus = async (orderId, status) => {
  try {
    // Note: Backend has specific endpoints for approve/ship/deliver. 
    // This might not work if specifically looking for a PATCH status endpoint.
    // For now keeping consistent path base.
    const response = await api.patch(`/api/v1/sales-orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId, reason) => {
  try {
    // Backend endpoint for Staff to cancel
    const response = await api.put(`/api/v1/sales-orders/${orderId}/cancel-by-staff`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Confirm order
export const confirmOrder = async (orderId) => {
  try {
     // Backend endpoint for accept/approve
    const response = await api.put(`/api/v1/sales-orders/${orderId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
};

// Export invoice (PDF)
export const exportInvoice = async (orderId) => {
  try {
    const response = await api.get(`/api/v1/sales-orders/${orderId}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting invoice:', error);
    throw error;
  }
};

// Get order statistics
export const getOrderStatistics = async (params) => {
  try {
    const response = await api.get('/api/v1/sales-orders/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

// Search orders
export const searchOrders = async (keyword) => {
  try {
    const response = await api.get('/api/v1/sales-orders/search', {
      params: { keyword }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching orders:', error);
    throw error;
  }
};

export default {
  getOrdersAdmin,
  getOrderDetailAdmin,
  updateOrderStatus,
  cancelOrder,
  confirmOrder,
  exportInvoice,
  getOrderStatistics,
  searchOrders
};
