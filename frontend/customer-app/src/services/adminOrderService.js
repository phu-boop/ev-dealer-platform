import api from './api';

/**
 * Admin Order Service
 * API methods for admin order management
 */

// Get all orders with pagination and filters
export const getOrdersAdmin = async (params) => {
  try {
    const response = await api.get('/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Get order detail by ID
export const getOrderDetailAdmin = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Confirm order
export const confirmOrder = async (orderId) => {
  try {
    const response = await api.post(`/orders/${orderId}/confirm`);
    return response.data;
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
};

// Export invoice (PDF)
export const exportInvoice = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}/invoice`, {
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
    const response = await api.get('/orders/statistics', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching order statistics:', error);
    throw error;
  }
};

// Search orders
export const searchOrders = async (keyword) => {
  try {
    const response = await api.get('/orders/search', {
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
