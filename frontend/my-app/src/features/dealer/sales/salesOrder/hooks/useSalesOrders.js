import { useState, useEffect } from 'react';
import { salesOrderService } from '../services/salesOrderService';
import { showSuccess, showError } from '../../../../../utils/notification';

export const useSalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟢 Lấy danh sách đơn hàng
  const fetchOrders = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await salesOrderService.getList(params); // getList() đã return response.data.data
      console.log("Orders fetched:", data.data);
      setOrders(data.data || []);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err.message);
      showError('Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Tạo đơn hàng mới
  const createOrder = async (quotationId, orderData) => {
    try {
      const data = await salesOrderService.createOrder(quotationId, orderData); // đã return response.data.data
      showSuccess('Tạo đơn hàng thành công');
      await fetchOrders(); // Refresh list sau khi tạo
      return data;
    } catch (err) {
      console.error("Create order error:", err);
      showError('Lỗi khi tạo đơn hàng');
      throw err;
    }
  };

  // 🟢 Cập nhật trạng thái đơn hàng
  const updateStatus = async (orderId, status, reason = '') => {
    try {
      const data = await salesOrderService.updateOrderStatus(orderId, status, reason); // đã return response.data.data
      showSuccess('Cập nhật trạng thái thành công');
      await fetchOrders(); // Refresh list
      return data;
    } catch (err) {
      console.error("Update status error:", err);
      showError('Lỗi khi cập nhật trạng thái');
      throw err;
    }
  };

  // 🟢 Duyệt đơn hàng
  const approveOrder = async (orderId, managerId) => {
    try {
      const response = await salesOrderService.approve(orderId, managerId);
      const data = response.data?.data || null;
      showSuccess('Duyệt đơn hàng thành công');
      await fetchOrders();
      return data;
    } catch (err) {
      console.error("Approve order error:", err);
      showError('Lỗi khi duyệt đơn hàng');
      throw err;
    }
  };

  // 🟢 Recalculate / Add order items tự động
  const recalcOrderItems = async (orderId) => {
    try {
      const response = await salesOrderService.recalcOrderItems(orderId);
      const data = response.data?.data || null;
      showSuccess('Tính toán lại order items thành công');
      await fetchOrders(); // Refresh list
      return data;
    } catch (err) {
      console.error("Recalculate order items error:", err);
      showError('Lỗi khi tính toán lại order items');
      throw err;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateStatus,
    approveOrder,
    recalcOrderItems
  };
};
